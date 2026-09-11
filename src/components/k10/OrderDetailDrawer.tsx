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
        return { label: 'در انتظار تخصیص', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'credit_approved':
        return { label: 'تأیید اعتبار مالی', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'allocated':
        return { label: 'تخصیص‌یافته', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };
      case 'packed_sealed':
        return { label: 'پلمپ امنیتی', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'dispatched':
        return { label: 'در مسیر حمل', bg: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
      case 'delivered':
        return { label: 'تحویل قطعی (POD)', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'completed':
        return { label: 'تکمیل‌شده', bg: 'bg-gray-100 text-gray-800 border-gray-300' };
      case 'cancelled':
        return { label: 'لغوشده', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      default:
        return { label: status, bg: 'bg-gray-50 text-gray-700 border-gray-200' };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
      <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-r border-gray-200">
        
        {/* Top Header */}
        <div className="p-5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg border border-amber-200">
              K10
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 font-mono">{order.orderCode}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.bg}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                تاریخ ثبت: {order.orderDateFa} | کانال: {order.channelFa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-right">

          {/* Quick Action Banner based on state */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-950">اقدام بعدی چرخه سفارش</p>
                <p className="text-xs text-amber-850 mt-0.5">
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
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
                  className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
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
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              اطلاعات خریدار و تحویل
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">گالری خریدار:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{order.retailerNameFa}</p>
              </div>
              <div>
                <span className="text-gray-500">مخاطب تحویل:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{order.retailerContactPersonFa}</p>
              </div>
              <div>
                <span className="text-gray-500">تلفن تماس:</span>
                <p className="font-mono text-gray-700 mt-0.5" dir="ltr">{order.retailerPhone}</p>
              </div>
              <div>
                <span className="text-gray-500">شهر و مقصد:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{order.retailerCityFa}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">نشانی رسمی:</span>
                <p className="text-gray-700 mt-0.5">{order.retailerAddressFa}</p>
              </div>
              <div>
                <span className="text-gray-500">شیوه تحویل و لجستیک:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{order.fulfillmentMethodFa}</p>
              </div>
              <div>
                <span className="text-gray-500">شرایط پرداخت:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{order.paymentTermFa}</p>
              </div>
              {order.agentNameFa && (
                <div className="col-span-2 p-2.5 bg-blue-50/60 border border-blue-150 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="text-blue-900 font-semibold">عامل میدانی ویزیتور: </span>
                      <span className="text-blue-800">{order.agentNameFa}</span>
                    </div>
                  </div>
                  {order.agentBagCode && (
                    <span className="font-mono text-xs bg-blue-100 text-blue-850 px-2 py-0.5 rounded border border-blue-200">
                      {order.agentBagCode}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                اقلام طلا و سفارش ({order.items.length} قلم)
              </h3>
              <span className="text-xs font-medium text-gray-600">
                وزن کل تخمینی: {order.totalEstimatedWeightGrams.toFixed(2)} گرم
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={item.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                          {item.skuCode}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900">{item.titleFa}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-600">
                        <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                          {item.caratFa}
                        </span>
                        <span>تعداد درخواستی: <strong className="text-gray-900">{item.requestedQuantity}</strong></span>
                        <span>وزن تخمینی: <strong className="text-gray-900">{(item.targetWeightGrams * item.requestedQuantity).toFixed(2)} گرم</strong></span>
                        <span>اجرت ساخت: <strong className="text-gray-900">{item.makingWageDisplayFa}</strong></span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold text-gray-900 block">
                        {item.totalEstimatedPriceToman.toLocaleString('fa-IR')} تومان
                      </span>
                      <span className={`text-[11px] px-2 py-0.5 rounded inline-block mt-1 font-medium ${
                        item.allocationStatus === 'allocated' || item.allocationStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.allocationStatus === 'allocated' ? 'تخصیص شده' :
                         item.allocationStatus === 'delivered' ? 'تحویل شده' :
                         item.allocationStatus === 'dispatched' ? 'در مسیر' : 'در انتظار تخصیص'}
                      </span>
                    </div>
                  </div>

                  {/* Allocation detail if present */}
                  {item.allocatedItemUids && item.allocatedItemUids.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 text-xs flex items-center justify-between text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>منبع تخصیص: <strong>{item.allocationSourceNameFa}</strong></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>قطعات رزرو:</span>
                        {item.allocatedItemUids.map(uid => (
                          <span key={uid} className="font-mono text-[11px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-150">
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
            <div className="p-4 bg-gray-50/70 border-t border-gray-200 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>معادل طلای آبشده ۱۸ عیار:</span>
                <span className="font-bold text-gray-800">{order.pureGoldEquivalentGrams.toFixed(2)} گرم</span>
              </div>
              <div className="flex justify-between">
                <span>مجموع اجرت ساخت کارگاهی:</span>
                <span className="font-semibold text-gray-800">{order.totalMakingWageToman.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between">
                <span>کارمزد عمده‌فروشی پلتفرم دیدار:</span>
                <span className="font-semibold text-gray-800">{order.totalWholesaleMarginToman.toLocaleString('fa-IR')} تومان</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 text-gray-900 font-bold">
                <span>ارزش کل فاکتور:</span>
                <span className="text-amber-800 text-base">{order.grandTotalToman.toLocaleString('fa-IR')} تومان</span>
              </div>
            </div>
          </div>

          {/* Proof of Delivery (POD) Section if available */}
          {order.pod && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 border-b border-emerald-200/70 pb-2.5">
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  سند الکترونیک اثبات تحویل (POD Verified)
                </h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                  {order.pod.verifiedAtFa}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500">تحویل‌گیرنده معتبر:</span>
                  <p className="font-semibold text-gray-900 mt-0.5">{order.pod.recipientNameFa} ({order.pod.recipientRoleFa})</p>
                </div>
                <div>
                  <span className="text-gray-500">تأیید رمز OTP پیامکی:</span>
                  <p className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    احراز هویت شده
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">وزن در خروج از خزانه:</span>
                  <p className="font-mono text-gray-800 mt-0.5">{order.pod.scaleWeightAtDispatchGrams.toFixed(2)} گرم</p>
                </div>
                <div>
                  <span className="text-gray-500">وزن روی ترازوی طلافروشی:</span>
                  <p className="font-mono text-gray-800 mt-0.5">{order.pod.scaleWeightAtHandoverGrams.toFixed(2)} گرم</p>
                </div>
                <div>
                  <span className="text-gray-500">مغایرت وزنی:</span>
                  <p className="font-mono font-bold text-emerald-700 mt-0.5">
                    {order.pod.weightDiscrepancyGrams === 0 ? '۰.۰۰ (تطابق کامل)' : `${order.pod.weightDiscrepancyGrams} گرم`}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">سریال پلمپ ضدجعل:</span>
                  <p className="font-mono text-gray-800 mt-0.5">{order.pod.tamperSealSerial}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">امضای دیجیتال و تأیید:</span>
                  <p className="text-gray-800 mt-0.5 font-medium">{order.pod.recipientSignatureName}</p>
                </div>
                {order.pod.notes && (
                  <div className="col-span-2 bg-white p-2 rounded border border-emerald-150 text-gray-700">
                    <span className="text-gray-500 block mb-0.5">شرح صورتجلسه تحویل:</span>
                    {order.pod.notes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Audit Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              گاه‌شمار رخدادها و ممیزی حقوقی (Timeline)
            </h3>
            <div className="relative border-r-2 border-amber-200 mr-2 pr-4 space-y-4 text-xs">
              {order.timeline.map((ev, i) => (
                <div key={ev.id || i} className="relative">
                  <div className="absolute -right-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white"></div>
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="font-semibold text-gray-800">{ev.statusFa}</span>
                    <span className="text-[11px] font-mono">{ev.timestampFa}</span>
                  </div>
                  <p className="text-gray-600 mt-0.5">{ev.descriptionFa}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">توسط: {ev.actorNameFa} ({ev.actorRoleFa})</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Order Action if allowed */}
          {!['delivered', 'completed', 'cancelled'].includes(order.status) && (
            <div className="pt-2">
              <button
                onClick={() => onCancelOrder(order)}
                className="w-full py-2 px-3 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
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
