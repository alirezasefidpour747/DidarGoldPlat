/**
 * Didar Gold Platform - Kernel Domain K10
 * NewOrderModal: Wizard to place new wholesale gold order
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Package,
  User,
  Truck,
  DollarSign,
  Scale,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import {
  Order,
  OrderChannel,
  FulfillmentMethod,
  OrderPaymentTerm,
  OrderItem
} from '../../types/k10.js';
import { GoldCarat } from '../../types/k05.js';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderData: Partial<Order>) => Promise<void>;
  supportedRetailers: {
    id: string;
    nameFa: string;
    cityFa: string;
    trustTier: string;
    creditLimitToman: number;
    phone: string;
    addressFa: string;
  }[];
  agentBags: {
    id: string;
    bagCode: string;
    agentNameFa: string;
    territoryFa: string;
    currentWeightGrams: number;
  }[];
}

interface DraftItem {
  id: string;
  titleFa: string;
  skuCode: string;
  categoryFa: string;
  carat: GoldCarat;
  fineness: number;
  quantity: number;
  targetWeightGrams: number;
  makingWageType: 'percentage' | 'fixed_per_gram';
  makingWageValue: number;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  supportedRetailers,
  agentBags
}) => {
  const [selectedRetailerId, setSelectedRetailerId] = useState(supportedRetailers[0]?.id || '');
  const [channel, setChannel] = useState<OrderChannel>('direct_retailer');
  const [selectedBagCode, setSelectedBagCode] = useState(agentBags[0]?.bagCode || '');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('agent_counter_handover');
  const [paymentTerm, setPaymentTerm] = useState<OrderPaymentTerm>('split_gold_cash');
  const [targetDeliveryDateFa, setTargetDeliveryDateFa] = useState('۱۴۰۳/۰۹/۱۵');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Spot gold reference rate (Toman per gram 750)
  const spotRate750 = 4180000;

  // Order Items
  const [items, setItems] = useState<DraftItem[]>([
    {
      id: 'it-1',
      titleFa: 'سرویس طلا تراش‌خورده ۱۸ عیار با نگین سنتتیک',
      skuCode: 'DID-SRV-0081',
      categoryFa: 'سرویس کامل',
      carat: '18k_750',
      fineness: 750,
      quantity: 1,
      targetWeightGrams: 28.50,
      makingWageType: 'percentage',
      makingWageValue: 5.5
    }
  ]);

  if (!isOpen) return null;

  const currentRetailer = supportedRetailers.find(r => r.id === selectedRetailerId) || supportedRetailers[0];
  const currentBag = agentBags.find(b => b.bagCode === selectedBagCode);

  const handleAddItem = () => {
    const newItem: DraftItem = {
      id: `it-${Date.now()}`,
      titleFa: 'النگو تراش دار ۲۱ عیار بحرینی',
      skuCode: `DID-BNG-${Math.floor(1000 + Math.random() * 9000)}`,
      categoryFa: 'النگو',
      carat: '21k_875',
      fineness: 875,
      quantity: 2,
      targetWeightGrams: 9.20,
      makingWageType: 'percentage',
      makingWageValue: 4.8
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof DraftItem, val: any) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const updated = { ...it, [field]: val };
      if (field === 'carat') {
        const finenessMap: Record<GoldCarat, number> = {
          '18k_750': 750,
          '21k_875': 875,
          '21.6k_900': 900,
          '24k_995': 995,
          '24k_999': 999.9
        };
        updated.fineness = finenessMap[val as GoldCarat] || 750;
      }
      return updated;
    }));
  };

  // Calculations
  const totalWeightGrams = items.reduce((sum, it) => sum + (it.targetWeightGrams * it.quantity), 0);
  const totalItemsCount = items.reduce((sum, it) => sum + it.quantity, 0);

  const calculateItemPrice = (it: DraftItem) => {
    const baseGoldPrice = it.targetWeightGrams * it.quantity * (spotRate750 * (it.fineness / 750));
    let wageToman = 0;
    if (it.makingWageType === 'percentage') {
      wageToman = (baseGoldPrice * it.makingWageValue) / 100;
    } else {
      wageToman = it.makingWageValue * it.targetWeightGrams * it.quantity;
    }
    const marginToman = (baseGoldPrice * 1.5) / 100; // 1.5% platform margin
    return {
      baseGoldPrice,
      wageToman,
      marginToman,
      totalToman: Math.round(baseGoldPrice + wageToman + marginToman)
    };
  };

  const grandTotalToman = items.reduce((sum, it) => sum + calculateItemPrice(it).totalToman, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (items.length === 0) {
      setErrorMsg('حداقل یک قلم کالا در سفارش الزامی است.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderItems: OrderItem[] = items.map(it => {
        const calc = calculateItemPrice(it);
        const caratFaMap: Record<GoldCarat, string> = {
          '18k_750': '۱۸ عیار (۷۵۰)',
          '21k_875': '۲۱ عیار (۸۷۵)',
          '21.6k_900': '۲۱.۶ عیار (۹۰۰ سکه‌ای)',
          '24k_995': '۲۴ عیار (۹۹۵ بورس کالا)',
          '24k_999': '۲۴ عیار (۹۹۹.۹ شمش خلوص بالا)'
        };

        return {
          id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          orderId: '',
          productId: `prd-${it.skuCode}`,
          skuCode: it.skuCode,
          titleFa: it.titleFa,
          categoryFa: it.categoryFa,
          carat: it.carat,
          caratFa: caratFaMap[it.carat] || it.carat,
          fineness: it.fineness,
          requestedQuantity: it.quantity,
          allocatedQuantity: 0,
          targetWeightGrams: it.targetWeightGrams,
          actualAllocatedWeightGrams: 0,
          makingWageType: it.makingWageType,
          makingWageValue: it.makingWageValue,
          makingWageDisplayFa: it.makingWageType === 'percentage'
            ? `${it.makingWageValue}٪ روی طلا`
            : `${it.makingWageValue.toLocaleString('fa-IR')} تومان/گرم`,
          unitWholesaleMarginPercent: 1.5,
          spotGoldPricePerGram750Toman: spotRate750,
          unitEstimatedPriceToman: Math.round(calc.totalToman / it.quantity),
          totalEstimatedPriceToman: calc.totalToman,
          allocatedItemUids: [],
          allocationSource: channel === 'agent_assisted' ? 'agent_bag' : 'central_vault',
          allocationSourceNameFa: channel === 'agent_assisted'
            ? `کیف ویزیتور (${currentBag?.bagCode || 'عامل'})`
            : 'خزانه مرکزی دیدار تهران',
          allocationStatus: 'pending'
        };
      });

      await onSubmit({
        retailerOrgId: currentRetailer.id,
        retailerNameFa: currentRetailer.nameFa,
        retailerContactPersonFa: currentRetailer.nameFa.split('(')[0].trim(),
        retailerPhone: currentRetailer.phone,
        retailerCityFa: currentRetailer.cityFa,
        retailerAddressFa: currentRetailer.addressFa,
        retailerTrustTier: currentRetailer.trustTier,
        retailerCreditLimitRemainingToman: currentRetailer.creditLimitToman,
        channel,
        agentId: channel === 'agent_assisted' ? 'agt-01' : undefined,
        agentNameFa: channel === 'agent_assisted' ? currentBag?.agentNameFa : undefined,
        agentBagCode: channel === 'agent_assisted' ? currentBag?.bagCode : undefined,
        fulfillmentMethod,
        paymentTerm,
        targetDeliveryDateFa,
        notes,
        items: orderItems
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت سفارش');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-3xl bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ثبت سفارش عمده جدید طلا (New B2B Order)</h2>
              <p className="text-xs text-[#A0A0B5]">هسته K10: انتخاب کانال، خریدار، اقلام عیار استاندارد و شیوه تحویل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Customer & Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                گالری خریدار (عضو شبکه K01/K02):
              </label>
              <select
                value={selectedRetailerId}
                onChange={e => setSelectedRetailerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#C8A951]"
              >
                {supportedRetailers.map(ret => (
                  <option key={ret.id} value={ret.id} className="bg-[#191926] text-[#EDEDED]">
                    {ret.nameFa} ({ret.cityFa})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#828299] mt-1">
                اعتبار: {currentRetailer.trustTier} | سقف: {(currentRetailer.creditLimitToman / 1000000).toLocaleString('fa-IR')} م.ت
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                کانال ثبت سفارش:
              </label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as OrderChannel)}
                className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="direct_retailer" className="bg-[#191926] text-[#EDEDED]">سفارش مستقیم پورتال خریدار</option>
                <option value="agent_assisted" className="bg-[#191926] text-[#EDEDED]">سفارش میدانی با ویزیتور و کیف دیدار</option>
                <option value="phone_trade_desk" className="bg-[#191926] text-[#EDEDED]">سفارش تلفنی میز معامله دیدار</option>
                <option value="custom_backorder" className="bg-[#191926] text-[#EDEDED]">سفارش ساخت سفارشی کارگاهی</option>
              </select>
            </div>

            {/* If Agent Assisted: Bag selector */}
            {channel === 'agent_assisted' && (
              <div className="md:col-span-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-blue-200">کیف ویزیتور حاضر در محل طلافروشی:</p>
                    <p className="text-[11px] text-blue-300">اقلام این سفارش مستقیماً از کیف همراه ویزیتور تحویل داده می‌شود.</p>
                  </div>
                </div>
                <select
                  value={selectedBagCode}
                  onChange={e => setSelectedBagCode(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#191926] border border-blue-500/30 rounded-lg text-blue-200 font-mono"
                >
                  {agentBags.map(b => (
                    <option key={b.id} value={b.bagCode} className="bg-[#191926] text-[#EDEDED]">
                      {b.bagCode} - {b.agentNameFa} ({b.territoryFa})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                روش لجستیک و تحویل:
              </label>
              <select
                value={fulfillmentMethod}
                onChange={e => setFulfillmentMethod(e.target.value as FulfillmentMethod)}
                className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="agent_counter_handover" className="bg-[#191926] text-[#EDEDED]">تحویل حضوری در محل گالری توسط ویزیتور</option>
                <option value="armored_escort" className="bg-[#191926] text-[#EDEDED]">حمل زمینی امنیتی با خودرو زرهی و اسکورت مسلح</option>
                <option value="vault_pickup" className="bg-[#191926] text-[#EDEDED]">تحویل حضوری نماینده در باجه ترخیص خزانه مرکزی</option>
                <option value="secure_air_courier" className="bg-[#191926] text-[#EDEDED]">پست هوایی بیمه‌شده مسکوکات و طلا</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                شرایط و نحوه تسویه مالی:
              </label>
              <select
                value={paymentTerm}
                onChange={e => setPaymentTerm(e.target.value as OrderPaymentTerm)}
                className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#C8A951]"
              >
                <option value="split_gold_cash" className="bg-[#191926] text-[#EDEDED]">ترکیبی (بخشی طلای آبشده + الباقی چک صیادی)</option>
                <option value="cash_spot" className="bg-[#191926] text-[#EDEDED]">تسویه نقدی ریالی در لحظه تحویل</option>
                <option value="gold_barter_scrap" className="bg-[#191926] text-[#EDEDED]">تهاتر وزنی کامل با طلای آبشده ۷۵۰</option>
                <option value="credit_consignment" className="bg-[#191926] text-[#EDEDED]">اعتباری ۳۰ روزه با سقف ضمانت صیادی</option>
              </select>
            </div>
          </div>

          {/* Step 2: Order Items Section */}
          <div className="border border-[#28283C] rounded-xl overflow-hidden bg-[#161622]">
            <div className="px-4 py-2.5 bg-[#151520] border-b border-[#28283C] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E5C365]" />
                <span className="text-xs font-bold text-white">اقلام طلا و مشخصات عیار استاندارد</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-2.5 py-1 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded-md text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن ردیف طلا
              </button>
            </div>

            <div className="divide-y divide-[#28283C] p-3 space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="p-3 bg-[#191926] rounded-lg border border-[#28283C] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#E5C365]">ردیف #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-[#828299] hover:text-[#FF6B6B] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">عنوان محصول / SKU:</label>
                      <input
                        type="text"
                        value={item.titleFa}
                        onChange={e => handleItemChange(item.id, 'titleFa', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">عیار استاندارد طلا:</label>
                      <select
                        value={item.carat}
                        onChange={e => handleItemChange(item.id, 'carat', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951] font-medium"
                      >
                        <option value="18k_750" className="bg-[#191926]">۱۸ عیار (۷۵۰)</option>
                        <option value="21k_875" className="bg-[#191926]">۲۱ عیار (۸۷۵)</option>
                        <option value="21.6k_900" className="bg-[#191926]">۲۱.۶ عیار (۹۰۰ سکه‌ای)</option>
                        <option value="24k_995" className="bg-[#191926]">۲۴ عیار (۹۹۵ بورس)</option>
                        <option value="24k_999" className="bg-[#191926]">۲۴ عیار (۹۹۹.۹ خلوص)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">تعداد درخواستی:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">وزن واحد (گرم):</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.targetWeightGrams}
                        onChange={e => handleItemChange(item.id, 'targetWeightGrams', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">نوع اجرت ساخت:</label>
                      <select
                        value={item.makingWageType}
                        onChange={e => handleItemChange(item.id, 'makingWageType', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951]"
                      >
                        <option value="percentage" className="bg-[#191926]">درصدی روی طلای خام (%)</option>
                        <option value="fixed_per_gram" className="bg-[#191926]">ثابت به ازای هر گرم (تومان)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#A0A0B5] mb-0.5">مقدار اجرت:</label>
                      <input
                        type="number"
                        step="0.1"
                        value={item.makingWageValue}
                        onChange={e => handleItemChange(item.id, 'makingWageValue', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] rounded focus:ring-1 focus:ring-[#C8A951]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#A0A0B5] border-t border-[#28283C]">
                    <span>وزن کل ردیف: <strong className="text-white">{(item.targetWeightGrams * item.quantity).toFixed(2)} گرم</strong></span>
                    <span>مبلغ تخمینی ردیف: <strong className="text-[#E5C365]">{calculateItemPrice(item).totalToman.toLocaleString('fa-IR')} تومان</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer inside Items Box */}
            <div className="bg-[#151520] p-3 border-t border-[#28283C] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-[#A0A0B5]">
                <span>تعداد کل اقلام: <strong className="text-white">{totalItemsCount} قطعه</strong></span>
                <span>وزن کل طلا: <strong className="text-white">{totalWeightGrams.toFixed(2)} گرم</strong></span>
                <span>نرخ مرجع طلای ۷۵۰: <strong className="text-[#E5C365]">{spotRate750.toLocaleString('fa-IR')} ت/گرم</strong></span>
              </div>
              <div className="text-sm font-bold text-[#E5C365]">
                مبلغ کل فاکتور: {grandTotalToman.toLocaleString('fa-IR')} تومان
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
              یادداشت و هماهنگی‌های امنیتی سفارش:
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: تحویل قبل از ساعت ۱۷، هماهنگی با آقای کمالی انجام شود..."
              className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:ring-1 focus:ring-[#C8A951]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'ثبت و ارسال به صف تخصیص'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
