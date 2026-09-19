/**
 * Didar Gold Platform - Kernel Domain K10
 * OrderDetailDrawer: Detailed view of order, items, allocation, timeline, and POD
 */

import React from 'react';
import {
  X,
  Package,
  Clock,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Scale,
  Sparkles,
  Lock,
  ArrowRight,
  Barcode,
  Layers,
  Check,
  Ban
} from 'lucide-react';
import { Order, OrderStatus } from '../../types/k10.js';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAllocate: (order: Order) => void;
  onOpenPackSeal: (order: Order) => void;
  onOpenDispatch: (order: Order) => void;
  onOpenVerifyPod: (order: Order) => void;
  onCancelOrder: (order: Order) => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onOpenAllocate,
  onOpenPackSeal,
  onOpenDispatch,
  onOpenVerifyPod,
  onCancelOrder
}) => {
  if (!isOpen || !order) return null;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'در انتظار تخصیص', bg: 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/30' };
      case 'credit_approved':
        return { label: 'تأیید اعتبار مالی', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'allocated':
        return { label: 'تخصیص‌یافته', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'packed_sealed':
        return { label: 'پلمپ امنیتی', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'dispatched':
        return { label: 'در مسیر حمل', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'delivered':
        return { label: 'تحویل قطعی (POD)', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'completed':
        return { label: 'تکمیل‌شده', bg: 'bg-[#28283C] text-[#EDEDED] border-[#3E3E58]' };
      case 'cancelled':
        return { label: 'لغوشده', bg: 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30' };
      default:
        return { label: status, bg: 'bg-[#191926] text-[#A0A0B5] border-[#28283C]' };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs transition-opacity" dir="rtl">
      <div className="relative w-full max-w-2xl bg-[#161622] text-[#EDEDED] h-full shadow-2xl flex flex-col overflow-hidden border-r border-[#28283C]">
        
        {/* Top Header */}
        <div className="p-5 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold text-lg border border-[#E5C365]/40">
              K10
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono">{order.orderCode}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-[#A0A0B5] mt-0.5">
                تاریخ ثبت: {order.orderDateFa} | کانال: {order.channelFa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-right">

          {/* Quick Action Banner based on state */}
          <div className="bg-[#C8A951]/10 border border-[#C8A951]/25 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#E5C365] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">اقدام بعدی چرخه سفارش</p>
                <p className="text-xs text-[#A0A0B5] mt-0.5">
                  {order.status === 'submitted' && 'سفارش در انتظار بررسی و قفل کردن اقلام از موجودی خزانه یا کیف ویزیتور است.'}
                  {order.status === 'allocated' && 'موجودی تخصیص یافته است. بسته را بازرسی و پلمپ امنیتی الصاق نمایید.'}
                  {order.status === 'packed_sealed' && 'بسته آماده تحویل به راننده اسکورت یا ویزیتور جهت انتقال به مقصد است.'}
                  {order.status === 'dispatched' && 'محموله در مسیر است. پس از رسیدن، سند الکترونیک تحویل POD را تکمیل کنید.'}
                  {order.status === 'delivered' && 'تحویل با موفقیت ثبت شده و سند اثبات تحویل POD دارای اعتبار حقوقی است.'}
                  {order.status === 'cancelled' && 'این سفارش لغو شده و تعهدات طلایی مربوطه آزاد شده است.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {['submitted', 'partially_allocated'].includes(order.status) && (
                <button
                  onClick={() => onOpenAllocate(order)}
                  className="px-3.5 py-1.5 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  تخصیص موجودی
                </button>
              )}
              {order.status === 'allocated' && (
                <button
                  onClick={() => onOpenPackSeal(order)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  پلمپ امنیتی
                </button>
              )}
              {order.status === 'packed_sealed' && (
                <button
                  onClick={() => onOpenDispatch(order)}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  خروج و بارگیری
                </button>
              )}
              {order.status === 'dispatched' && (
                <button
                  onClick={() => onOpenVerifyPod(order)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  ثبت تحویل POD
                </button>
              )}
            </div>
          </div>

          {/* Customer & Delivery Card */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E5C365]" />
              اطلاعات خریدار و تحویل
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#828299]">گالری خریدار:</span>
                <p className="font-semibold text-[#EDEDED] mt-0.5">{order.retailerNameFa}</p>
              </div>
              <div>
                <span className="text-[#828299]">مخاطب تحویل:</span>
                <p className="font-semibold text-[#EDEDED] mt-0.5">{order.retailerContactPersonFa}</p>
              </div>
              <div>
                <span className="text-[#828299]">تلفن تماس:</span>
                <p className="font-mono text-[#EDEDED] mt-0.5" dir="ltr">{order.retailerPhone}</p>
              </div>
              <div>
                <span className="text-[#828299]">شهر و مقصد:</span>
                <p className="font-semibold text-[#EDEDED] mt-0.5">{order.retailerCityFa}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[#828299]">نشانی رسمی:</span>
                <p className="text-[#EDEDED] mt-0.5">{order.retailerAddressFa}</p>
              </div>
              <div>
                <span className="text-[#828299]">شیوه تحویل و لجستیک:</span>
                <p className="font-semibold text-[#EDEDED] mt-0.5">{order.fulfillmentMethodFa}</p>
              </div>
              <div>
                <span className="text-[#828299]">شرایط پرداخت:</span>
                <p className="font-semibold text-[#EDEDED] mt-0.5">{order.paymentTermFa}</p>
              </div>
              {order.agentNameFa && (
                <div className="col-span-2 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-blue-300 font-semibold">عامل میدانی ویزیتور: </span>
                      <span className="text-blue-200">{order.agentNameFa}</span>
                    </div>
                  </div>
                  {order.agentBagCode && (
                    <span className="font-mono text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                      {order.agentBagCode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-[#151520] border-b border-[#28283C] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E5C365]" />
                اقلام طلا و سفارش ({order.items.length} قلم)
              </h3>
              <span className="text-xs font-medium text-[#A0A0B5]">
                وزن کل تخمینی: {order.totalEstimatedWeightGrams.toFixed(2)} گرم
              </span>
            </div>
            <div className="divide-y divide-[#28283C]">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#222234]/40 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-[#161622] text-[#E5C365] px-1.5 py-0.5 rounded border border-[#28283C]">
                          {item.skuCode}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.titleFa}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-[#A0A0B5]">
                        <span className="bg-[#C8A951]/15 text-[#E5C365] px-2 py-0.5 rounded border border-[#C8A951]/30">
                          {item.caratFa}
                        </span>
                        <span>تعداد درخواستی: <strong className="text-white">{item.requestedQuantity}</strong></span>
                        <span>وزن تخمینی: <strong className="text-white">{(item.targetWeightGrams * item.requestedQuantity).toFixed(2)} گرم</strong></span>
                        <span>اجرت ساخت: <strong className="text-white">{item.makingWageDisplayFa}</strong></span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-white block">
                        {item.totalEstimatedPriceToman.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded inline-block mt-1 font-medium ${
                        item.allocationStatus === 'allocated' || item.allocationStatus === 'delivered'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30'
                      }`}>
                        {item.allocationStatus === 'allocated' ? 'تخصیص شده' :
                         item.allocationStatus === 'delivered' ? 'تحویل شده' :
                         item.allocationStatus === 'dispatched' ? 'در مسیر' : 'در انتظار تخصیص'}
                      </span>
                    </div>
                  </div>

                  {/* Allocation detail if present */}
                  {item.allocatedItemUids && item.allocatedItemUids.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-[#28283C] text-xs flex items-center justify-between text-[#828299]">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>منبع تخصیص: <strong className="text-[#EDEDED]">{item.allocationSourceNameFa}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>قطعات رزرو:</span>
                        {item.allocatedItemUids.map(uid => (
                          <span key={uid} className="font-mono text-[11px] bg-indigo-500/15 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-500/30">
                            {uid}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Financial Summary */}
            <div className="p-4 bg-[#151520] border-t border-[#28283C] space-y-1.5 text-xs text-[#A0A0B5]">
              <div className="flex justify-between">
                <span>معادل طلای آبشده ۱۸ عیار:</span>
                <span className="font-bold text-[#EDEDED]">{order.pureGoldEquivalentGrams.toFixed(2)} گرم</span>
              </div>
              <div className="flex justify-between">
                <span>مجموع اجرت ساخت کارگاهی:</span>
                <span className="font-semibold text-[#EDEDED]">{order.totalMakingWageToman.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>کارمزد عمده‌فروشی پلتفرم دیدار:</span>
                <span className="font-semibold text-[#EDEDED]">{order.totalWholesaleMarginToman.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-[#28283C] text-white font-bold">
                <span>ارزش کل فاکتور:</span>
                <span className="text-[#E5C365] text-base">{order.grandTotalToman.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          </div>

          {/* Proof of Delivery (POD) Section if available */}
          {order.pod && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-500/20 pb-2.5">
                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  سند الکترونیک اثبات تحویل (POD Verified)
                </h3>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
                  {order.pod.verifiedAtFa}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#828299]">تحویل‌گیرنده معتبر:</span>
                  <p className="font-semibold text-white mt-0.5">{order.pod.recipientNameFa} ({order.pod.recipientRoleFa})</p>
                </div>
                <div>
                  <span className="text-[#828299]">تأیید رمز OTP پیامکی:</span>
                  <p className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    احراز هویت شده
                  </p>
                </div>
                <div>
                  <span className="text-[#828299]">وزن در خروج از خزانه:</span>
                  <p className="font-mono text-[#EDEDED] mt-0.5">{order.pod.scaleWeightAtDispatchGrams.toFixed(2)} گرم</p>
                </div>
                <div>
                  <span className="text-[#828299]">وزن روی ترازوی طلافروشی:</span>
                  <p className="font-mono text-[#EDEDED] mt-0.5">{order.pod.scaleWeightAtHandoverGrams.toFixed(2)} گرم</p>
                </div>
                <div>
                  <span className="text-[#828299]">مغایرت وزنی:</span>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    {order.pod.weightDiscrepancyGrams === 0 ? '۰.۰۰ (تطابق کامل)' : `${order.pod.weightDiscrepancyGrams} گرم`}
                  </p>
                </div>
                <div>
                  <span className="text-[#828299]">سریال پلمپ ضدجعل:</span>
                  <p className="font-mono text-[#EDEDED] mt-0.5">{order.pod.tamperSealSerial}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[#828299]">امضای دیجیتال و تأیید:</span>
                  <p className="text-[#EDEDED] mt-0.5 font-medium">{order.pod.recipientSignatureName}</p>
                </div>
                {order.pod.notes && (
                  <div className="col-span-2 bg-[#161622] p-2.5 rounded border border-[#28283C] text-[#EDEDED]">
                    <span className="text-[#828299] block mb-0.5">شرح صورتجلسه تحویل:</span>
                    {order.pod.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E5C365]" />
              گاه‌شمار رخدادها و ممیزی حقوقی (Timeline)
            </h3>
            <div className="relative border-r-2 border-[#C8A951]/40 mr-2 pr-4 space-y-4 text-xs">
              {order.timeline.map((ev, i) => (
                <div key={ev.id || i} className="relative">
                  <div className="absolute -right-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-[#C8A951] border-2 border-[#191926]"></div>
                  <div className="flex items-center justify-between text-[#828299]">
                    <span className="font-semibold text-white">{ev.statusFa}</span>
                    <span className="text-[11px] font-mono text-[#828299]">{ev.timestampFa}</span>
                  </div>
                  <p className="text-[#EDEDED] mt-0.5">{ev.descriptionFa}</p>
                  <p className="text-[11px] text-[#828299] mt-0.5">توسط: {ev.actorNameFa} ({ev.actorRoleFa})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Order Action if allowed */}
          {!['delivered', 'completed', 'cancelled'].includes(order.status) && (
            <div className="pt-2">
              <button
                onClick={() => onCancelOrder(order)}
                className="w-full py-2 px-3 border border-[#E5484D]/30 text-[#FF6B6B] hover:bg-[#E5484D]/10 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Ban className="w-4 h-4" />
                لغو این سفارش و آزادسازی طلای رزرو
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
