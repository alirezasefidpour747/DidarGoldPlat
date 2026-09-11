/**
 * Didar Gold Platform - K05 Live Gold Price Estimator Modal
 * Transparent cost breakdown: Raw Gold Spot + Maker Wage + Wholesale Margin
 */

import React, { useState, useEffect } from 'react';
import { ProductSku, ProductVariant, LiveGoldSpotRate } from '../../types/k05.js';
import {
  X,
  Calculator,
  Coins,
  Scale,
  Sparkles,
  TrendingUp,
  RotateCw,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface GoldPriceEstimatorModalProps {
  isOpen: boolean;
  product: ProductSku | null;
  products: ProductSku[];
  marketRate: LiveGoldSpotRate;
  onClose: () => void;
  onUpdateMarketRate?: (rates: Partial<LiveGoldSpotRate>) => Promise<void>;
}

export const GoldPriceEstimatorModal: React.FC<GoldPriceEstimatorModalProps> = ({
  isOpen,
  product: initialProduct,
  products,
  marketRate,
  onClose,
  onUpdateMarketRate
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductSku | null>(initialProduct || products[0] || null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [goldPricePerGramIrr, setGoldPricePerGramIrr] = useState<number>(marketRate.gold18kGramIrr);
  const [wholesaleMarginPercent, setWholesaleMarginPercent] = useState<number>(2.0);
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setSelectedProduct(initialProduct);
      setWholesaleMarginPercent(initialProduct.recommendedWholesaleMargin);
      if (initialProduct.variants.length > 0) {
        setSelectedVariantId(initialProduct.variants[0].id);
      }
    } else if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
      setWholesaleMarginPercent(products[0].recommendedWholesaleMargin);
    }
  }, [initialProduct, products]);

  useEffect(() => {
    setGoldPricePerGramIrr(marketRate.gold18kGramIrr);
  }, [marketRate.gold18kGramIrr]);

  if (!isOpen || !selectedProduct) return null;

  // Selected variant or base
  const activeVariant = selectedProduct.variants.find(v => v.id === selectedVariantId) || selectedProduct.variants[0];
  const weight = activeVariant ? activeVariant.targetWeightGrams : selectedProduct.baseWeightGrams;

  // Financial calculations
  const rawGoldTotalIrr = weight * goldPricePerGramIrr;
  
  let makerWageTotalIrr = 0;
  if (selectedProduct.makerWageType === 'percentage') {
    makerWageTotalIrr = rawGoldTotalIrr * (selectedProduct.makerWageValue / 100);
  } else {
    makerWageTotalIrr = weight * selectedProduct.makerWageValue;
  }

  const subtotalIrr = rawGoldTotalIrr + makerWageTotalIrr;
  const wholesaleMarginTotalIrr = subtotalIrr * (wholesaleMarginPercent / 100);
  const totalEstimateIrr = subtotalIrr + wholesaleMarginTotalIrr;

  const totalEstimateToman = Math.round(totalEstimateIrr / 10);
  const rawGoldToman = Math.round(rawGoldTotalIrr / 10);
  const makerWageToman = Math.round(makerWageTotalIrr / 10);
  const wholesaleMarginToman = Math.round(wholesaleMarginTotalIrr / 10);

  const handleSaveMarketRate = async () => {
    if (!onUpdateMarketRate) return;
    try {
      setIsUpdatingRate(true);
      const calculatedMesghal = Math.round(goldPricePerGramIrr * 4.3318);
      await onUpdateMarketRate({
        gold18kGramIrr: goldPricePerGramIrr,
        mesghal17kIrr: calculatedMesghal
      });
      setRateSuccess(true);
      setTimeout(() => setRateSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRate(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#15151E] border border-[#2B2B3E] shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#252536] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C8A951]/20 text-[#C8A951]">
              <Calculator className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#EDEDED]">برآوردگر آنلاین قیمت تمام‌شده مصنوع طلا (Spot Cost Calculator)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E7E90] hover:text-[#EDEDED] hover:bg-[#252536] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 text-xs text-[#EDEDED]">
          {/* Live Market Spot Rate Banner */}
          <div className="p-3.5 rounded-xl bg-[#1B1B26] border border-[#2D2D42] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#C8A951] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                نرخ پایه بازار طلا (مظنه و طلای ۱۸ عیار)
              </span>
              <span className="text-[10px] text-[#7E7E92]">
                آخرین به‌روزرسانی: {marketRate.lastUpdatedFa}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-[#8C8CA0] block">قیمت هر گرم طلای ۱۸ عیار (ریال):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="50000"
                    value={goldPricePerGramIrr}
                    onChange={(e) => setGoldPricePerGramIrr(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#111118] border border-[#2F2F44] text-xs font-mono text-[#E5C365] focus:outline-none focus:border-[#C8A951]"
                  />
                  {onUpdateMarketRate && (
                    <button
                      onClick={handleSaveMarketRate}
                      disabled={isUpdatingRate}
                      className="px-2.5 py-1.5 rounded-lg bg-[#272738] hover:bg-[#32324A] text-[10px] text-[#3DD68C] font-semibold whitespace-nowrap transition-colors"
                      title="ذخیره این نرخ در سامانه"
                    >
                      {isUpdatingRate ? '...' : rateSuccess ? '✓ ثبت شد' : 'ثبت نرخ'}
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-[#78788C]">
                  معادل {Math.round(goldPricePerGramIrr / 10).toLocaleString()} تومان هر گرم
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-[#8C8CA0] block">مظنه طلای ۱۷ عیار (یک مثقال):</label>
                <div className="px-2.5 py-1.5 rounded-lg bg-[#111118] border border-[#20202E] font-mono text-[#EDEDED] text-xs">
                  {Math.round(goldPricePerGramIrr * 4.3318 / 10).toLocaleString()} تومان
                </div>
                <span className="text-[10px] text-[#78788C]">
                  انس جهانی: ${marketRate.ounceUsd.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Model & Variant Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">مدل کالا در کاتالوگ</label>
              <select
                value={selectedProduct.id}
                onChange={(e) => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) {
                    setSelectedProduct(p);
                    setWholesaleMarginPercent(p.recommendedWholesaleMargin);
                    if (p.variants.length > 0) setSelectedVariantId(p.variants[0].id);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.skuCode} - {p.titleFa}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">تنوع سایز / وزن ساخت</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.sizeLabelFa} - {v.colorFa} ({v.targetWeightGrams} گرم)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Wholesale Margin slider */}
          <div className="space-y-1 p-3 rounded-xl bg-[#111118] border border-[#242436]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#A0A0B4]">درصد سود بنکداری و توزیع:</span>
              <span className="font-mono text-[#E5C365] font-bold">{wholesaleMarginPercent}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="7.0"
              step="0.1"
              value={wholesaleMarginPercent}
              onChange={(e) => setWholesaleMarginPercent(parseFloat(e.target.value))}
              className="w-full accent-[#C8A951] cursor-pointer"
            />
          </div>

          {/* Breakdown Result Card */}
          <div className="p-4 rounded-2xl bg-[#191924] border border-[#2F2F44] space-y-3">
            <h3 className="font-bold text-xs text-[#EDEDED] border-b border-[#262638] pb-2">
              تفکیک فاکتور رسمی محاسباتی بنکداری (دیدار گلد)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8E8EA0] flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                  ارزش طلای خام ({weight} گرم طلا ۱۸ عیار):
                </span>
                <span className="font-mono text-[#EDEDED]">
                  {rawGoldToman.toLocaleString()} تومان
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8E8EA0] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#3DD68C]" />
                  اجرت ساخت کارگاه ({selectedProduct.makerWageDisplay}):
                </span>
                <span className="font-mono text-[#3DD68C]">
                  + {makerWageToman.toLocaleString()} تومان
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8E8EA0]">
                  سود بنکداری ({wholesaleMarginPercent}٪):
                </span>
                <span className="font-mono text-[#E5C365]">
                  + {wholesaleMarginToman.toLocaleString()} تومان
                </span>
              </div>

              <div className="pt-2 border-t border-[#2B2B3E] flex items-center justify-between">
                <span className="text-sm font-bold text-[#EDEDED]">
                  قیمت تمام‌شده تخمینی هر قطعه:
                </span>
                <div className="text-left">
                  <span className="font-mono text-base font-bold text-[#C8A951]">
                    {totalEstimateToman.toLocaleString()} تومان
                  </span>
                  <span className="block font-mono text-[10px] text-[#7E7E92]">
                    {totalEstimateIrr.toLocaleString()} ریال
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252536] bg-[#181822] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] text-[#EDEDED] font-semibold text-xs"
          >
            بستن محاسبات
          </button>
        </div>
      </div>
    </div>
  );
};
