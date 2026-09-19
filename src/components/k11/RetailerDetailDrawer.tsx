/**
 * Didar Gold Platform - Kernel Domain K11
 * Retailer Detail Drawer (جزئیات جامع پرونده خرده‌فروش و پایش اعتباری)
 */

import React, { useState } from 'react';
import {
  X,
  Store,
  Award,
  ShieldCheck,
  Scale,
  Calendar,
  Coins,
  MapPin,
  FileText,
  UserCheck,
  Percent,
  Sliders,
  AlertTriangle,
  Sparkles,
  Phone,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Retailer } from '../../types/k11.js';

interface RetailerDetailDrawerProps {
  retailer: Retailer | null;
  onClose: () => void;
  onOpenTierModal: (retailer: Retailer) => void;
  onOpenTerritoryModal: (retailer: Retailer) => void;
  onOpenBasketModal: (retailer: Retailer) => void;
  onOpenSuspensionModal: (retailer: Retailer) => void;
}

export const RetailerDetailDrawer: React.FC<RetailerDetailDrawerProps> = ({
  retailer,
  onClose,
  onOpenTierModal,
  onOpenTerritoryModal,
  onOpenBasketModal,
  onOpenSuspensionModal
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'credit' | 'basket' | 'history'>('overview');

  if (!retailer) return null;

  const usedGoldPercent = retailer.commercialTerms.creditLimitGoldGrams > 0
    ? Math.min(100, Math.round((retailer.commercialTerms.currentUsedCreditGoldGrams / retailer.commercialTerms.creditLimitGoldGrams) * 100))
    : 0;

  const usedTomanPercent = retailer.commercialTerms.creditLimitToman > 0
    ? Math.min(100, Math.round((retailer.commercialTerms.currentUsedCreditToman / retailer.commercialTerms.creditLimitToman) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141419] border-r border-[#2B2B38] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#2B2B38] bg-[#18181F]">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365] shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[#EDEDED]">{retailer.tradeNameFa}</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#2B2B38] text-[#8E8E93]">
                    {retailer.code}
                  </span>
                </div>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  صاحب امتیاز: {retailer.ownerFullNameFa} | پروانه کسب: {retailer.unionLicenseNumber}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                    retailer.status === 'active_trading'
                      ? 'bg-[#3DD68C]/10 border-[#3DD68C]/30 text-[#3DD68C]'
                      : retailer.status === 'probationary'
                      ? 'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]'
                      : retailer.status === 'credit_suspended'
                      ? 'bg-[#E5484D]/10 border-[#E5484D]/30 text-[#E5484D]'
                      : 'bg-[#8E8E93]/10 border-[#8E8E93]/30 text-[#8E8E93]'
                  }`}>
                    {retailer.statusFa}
                  </span>

                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold border bg-[#C8A951]/10 border-[#C8A951]/30 text-[#E5C365]">
                    {retailer.commercialTerms.tierFa}
                  </span>

                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-[#1B1B24] border border-[#2B2B38] text-[#8E8E93]">
                    امتیاز اعتماد: {retailer.commercialTerms.trustScore}/۱۰۰
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8E8E93] hover:text-[#EDEDED] hover:bg-[#2B2B38] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-[#2B2B38]">
            <button
              onClick={() => onOpenTierModal(retailer)}
              className="py-2 px-2.5 rounded-xl bg-[#1F1F2A] hover:bg-[#2B2B38] border border-[#2B2B38] text-[11px] font-bold text-[#EDEDED] flex flex-col items-center gap-1 transition-colors"
            >
              <Award className="w-4 h-4 text-[#C8A951]" />
              <span>تنظیم رتبه و سقف</span>
            </button>
            <button
              onClick={() => onOpenTerritoryModal(retailer)}
              className="py-2 px-2.5 rounded-xl bg-[#1F1F2A] hover:bg-[#2B2B38] border border-[#2B2B38] text-[11px] font-bold text-[#EDEDED] flex flex-col items-center gap-1 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#3DD68C]" />
              <span>قلمرو و ویزیتور</span>
            </button>
            <button
              onClick={() => onOpenBasketModal(retailer)}
              className="py-2 px-2.5 rounded-xl bg-[#1F1F2A] hover:bg-[#2B2B38] border border-[#2B2B38] text-[11px] font-bold text-[#EDEDED] flex flex-col items-center gap-1 transition-colors"
            >
              <Sliders className="w-4 h-4 text-[#0A84FF]" />
              <span>سبد و طلای امانی</span>
            </button>
            <button
              onClick={() => onOpenSuspensionModal(retailer)}
              className="py-2 px-2.5 rounded-xl bg-[#1F1F2A] hover:bg-[#2B2B38] border border-[#2B2B38] text-[11px] font-bold text-[#EDEDED] flex flex-col items-center gap-1 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-[#E5484D]" />
              <span>وضعیت و استثنا</span>
            </button>
          </div>
        </div>

        {/* Drawer Tabs */}
        <div className="flex border-b border-[#2B2B38] bg-[#121217] px-6">
          {[
            { id: 'overview' as const, label: 'شناسنامه و اماکن' },
            { id: 'credit' as const, label: 'سقف‌های اعتباری و مالی' },
            { id: 'basket' as const, label: 'سبد مجاز و عیارها' },
            { id: 'history' as const, label: 'سوابق خرید و عملکرد' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3 text-xs font-bold transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#C8A951] text-[#E5C365]'
                  : 'border-transparent text-[#8E8E93] hover:text-[#EDEDED]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Identity & Licensing */}
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  اطلاعات ثبتی و پروانه صنفی
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8E8E93] block">شماره پروانه کسب:</span>
                    <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.unionLicenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] block">شناسه صنفی زرگران:</span>
                    <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.guildRegistryCode}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] block">کد ملی صاحب پروانه:</span>
                    <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.nationalCode}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] block">سال تأسیس فروشگاه:</span>
                    <span className="font-semibold text-[#EDEDED] mt-0.5 block">{retailer.establishmentYearFa}</span>
                  </div>
                </div>
              </div>

              {/* Physical Location & Security */}
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  موقعیت فیزیکی و سطح امنیت اماکن
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#8E8E93] block">نشانی رسمی فروشگاه:</span>
                    <span className="text-[#EDEDED] leading-relaxed mt-0.5 block">{retailer.postalAddressFa}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-[#8E8E93] block">کد پستی ده رقمی:</span>
                      <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.postalCode}</span>
                    </div>
                    <div>
                      <span className="text-[#8E8E93] block">مساحت ویترین و فروشگاه:</span>
                      <span className="font-semibold text-[#EDEDED] mt-0.5 block">{retailer.storeAreaSquareMeters} متر مربع</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">تجهیزات حفاظتی و امنیتی:</span>
                    <span className="text-[#3DD68C] text-xs font-semibold mt-0.5 block">{retailer.securityRatingFa}</span>
                  </div>
                </div>
              </div>

              {/* Contacts */}
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  کانال‌های ارتباطی و هماهنگی
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8E8E93] block">تلفن ثابت گالری:</span>
                    <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E93] block">همراه مدیر (پیامک/OTP):</span>
                    <span className="font-semibold text-[#EDEDED] font-mono mt-0.5 block">{retailer.mobileNumber}</span>
                  </div>
                </div>
              </div>

              {retailer.statusReasonFa && (
                <div className="p-4 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#E5484D]">
                    <AlertTriangle className="w-4 h-4" />
                    <span>علت وضعیت فعلی / تعلیق:</span>
                  </div>
                  <p className="text-xs text-[#EDEDED] leading-relaxed pr-6">{retailer.statusReasonFa}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'credit' && (
            <div className="space-y-5">
              {/* Exposure Progress Bars */}
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-4">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Scale className="w-4 h-4" />
                    میزان مصرف سقف اعتبار وزنی طلا (عیار ۷۵۰)
                  </span>
                  <span className="font-mono text-xs text-[#E5C365]">
                    {retailer.commercialTerms.currentUsedCreditGoldGrams.toLocaleString('fa-IR')} / {retailer.commercialTerms.creditLimitGoldGrams.toLocaleString('fa-IR')} گرم
                  </span>
                </h4>

                <div>
                  <div className="w-full bg-[#121217] h-3 rounded-full overflow-hidden border border-[#2B2B38]">
                    <div
                      className={`h-full transition-all ${
                        usedGoldPercent > 80 ? 'bg-[#E5484D]' : usedGoldPercent > 50 ? 'bg-[#FF9500]' : 'bg-[#C8A951]'
                      }`}
                      style={{ width: `${usedGoldPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#8E8E93] mt-1.5">
                    <span>مصرف‌شده: {usedGoldPercent}%</span>
                    <span>
                      باقیمانده: {Math.max(0, retailer.commercialTerms.creditLimitGoldGrams - retailer.commercialTerms.currentUsedCreditGoldGrams).toLocaleString('fa-IR')} گرم طلا
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2B2B38]">
                  <h4 className="text-xs font-bold text-[#3DD68C] flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <Coins className="w-4 h-4" />
                      میزان مصرف اعتبار ریالی (تومان)
                    </span>
                    <span className="font-mono text-xs text-[#3DD68C]">
                      {(retailer.commercialTerms.currentUsedCreditToman / 10000000).toLocaleString('fa-IR')} / {(retailer.commercialTerms.creditLimitToman / 10000000).toLocaleString('fa-IR')} م.ت
                    </span>
                  </h4>
                  <div className="w-full bg-[#121217] h-3 rounded-full overflow-hidden border border-[#2B2B38]">
                    <div
                      className={`h-full transition-all ${
                        usedTomanPercent > 80 ? 'bg-[#E5484D]' : usedTomanPercent > 50 ? 'bg-[#FF9500]' : 'bg-[#3DD68C]'
                      }`}
                      style={{ width: `${usedTomanPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Privileges */}
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  شرایط تجاری و امتیازات تسویه
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">درصد تخفیف اجرت ساخت:</span>
                    <span className="font-bold text-[#3DD68C] text-sm mt-1 block">
                      {retailer.commercialTerms.wageDiscountPercent}٪
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">مهلت تسویه حساب:</span>
                    <span className="font-bold text-[#EDEDED] text-sm mt-1 block">
                      {retailer.commercialTerms.paymentTenorDays === 0
                        ? 'نقدی در لحظه تحویل'
                        : `${retailer.commercialTerms.paymentTenorDays} روزه`}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">مجوز چک صیادی:</span>
                    <span className={`font-bold text-xs mt-1 block ${
                      retailer.commercialTerms.allowPostDatedCheque ? 'text-[#3DD68C]' : 'text-[#8E8E93]'
                    }`}>
                      {retailer.commercialTerms.allowPostDatedCheque ? 'فعال و مجاز' : 'غیرمجاز (فقط نقد)'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">تهاتر با طلای آبشده:</span>
                    <span className={`font-bold text-xs mt-1 block ${
                      retailer.commercialTerms.allowScrapGoldBarter ? 'text-[#3DD68C]' : 'text-[#8E8E93]'
                    }`}>
                      {retailer.commercialTerms.allowScrapGoldBarter ? 'مجاز با سنجش عیار' : 'غیرمجاز'}
                    </span>
                  </div>
                </div>

                {retailer.commercialTerms.guaranteeDocReference && (
                  <div className="mt-2 p-3 rounded-lg bg-[#121217] border border-[#2B2B38] text-xs">
                    <span className="text-[#8E8E93] block">مستندات تضامین و وثایق ثبتی:</span>
                    <span className="text-[#EDEDED] font-mono text-[11px] mt-0.5 block">
                      {retailer.commercialTerms.guaranteeDocReference}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Exceptions */}
              {retailer.activeExceptions && retailer.activeExceptions.length > 0 && (
                <div className="p-4 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 space-y-3">
                  <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    استثنائات اعتباری فعال
                  </h4>
                  {retailer.activeExceptions.map((exc) => (
                    <div key={exc.id} className="p-3 rounded-lg bg-[#141419] border border-[#C8A951]/20 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#E5C365]">
                          + {exc.temporaryCreditBonusGoldGrams} گرم طلا | + {(exc.temporaryCreditBonusToman / 10000000).toLocaleString('fa-IR')} م.ت
                        </span>
                        <span className="text-[#8E8E93] text-[11px]">تا تاریخ: {exc.expiryDateFa}</span>
                      </div>
                      <p className="text-[#EDEDED] text-[11px] mt-1">{exc.reasonFa}</p>
                      <div className="text-[10px] text-[#8E8E93]">مصوب: {exc.authorizedByFa}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'basket' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  عیارهای مجاز سفارش
                </h4>
                <div className="flex flex-wrap gap-2">
                  {retailer.allowedBasket.permittedCarats.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#C8A951]/15 border border-[#C8A951]/40 text-[#E5C365]"
                    >
                      {c === '18k_750' ? '۱۸ عیار (۷۵۰)' : c === '21k_875' ? '۲۱ عیار (۸۷۵)' : c === '22k_916' ? '۲۲ عیار (۹۱۶)' : '۲۴ عیار شمش (۹۹۹)'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  حدود اوزان سفارشات
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">حداقل وزن در سفارش:</span>
                    <span className="font-bold text-[#EDEDED] text-sm mt-1 block">
                      {retailer.allowedBasket.minOrderWeightGrams} گرم
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#121217] border border-[#2B2B38]">
                    <span className="text-[#8E8E93] block">حداکثر وزن تک‌سفارش:</span>
                    <span className="font-bold text-[#EDEDED] text-sm mt-1 block">
                      {retailer.allowedBasket.maxOrderWeightGrams.toLocaleString('fa-IR')} گرم
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  دسترسی به شمش و طلای امانی ویترین
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121217]">
                    <span className="text-[#EDEDED]">خرید شمش‌های سرمایه‌ای ۲۴ عیار:</span>
                    <span className={retailer.allowedBasket.bullionPurchaseAllowed ? 'text-[#3DD68C] font-bold' : 'text-[#8E8E93]'}>
                      {retailer.allowedBasket.bullionPurchaseAllowed ? 'مجاز' : 'غیرمجاز'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121217]">
                    <span className="text-[#EDEDED]">سفارش ساخت ویژه کارگاهی:</span>
                    <span className={retailer.allowedBasket.customWorkshopOrderAllowed ? 'text-[#3DD68C] font-bold' : 'text-[#8E8E93]'}>
                      {retailer.allowedBasket.customWorkshopOrderAllowed ? 'مجاز' : 'غیرمجاز'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#121217]">
                    <span className="text-[#EDEDED]">تسهیلات طلای امانی در ویترین:</span>
                    <span className={retailer.allowedBasket.consignmentShowcaseAllowed ? 'text-[#3DD68C] font-bold' : 'text-[#8E8E93]'}>
                      {retailer.allowedBasket.consignmentShowcaseAllowed
                        ? `سقف ${retailer.allowedBasket.maxConsignmentWeightGrams} گرم`
                        : 'غیرفعال'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#18181F] border border-[#2B2B38]">
                  <span className="text-[#8E8E93] block">تعداد کل سفارشات ثبت‌شده:</span>
                  <span className="font-bold text-[#EDEDED] text-base mt-1 block">
                    {retailer.purchaseHistory.lifetimeOrdersCount} فقره
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#18181F] border border-[#2B2B38]">
                  <span className="text-[#8E8E93] block">حجم کل طلای دریافتی:</span>
                  <span className="font-bold text-[#E5C365] text-base mt-1 block font-mono">
                    {(retailer.purchaseHistory.lifetimeGoldWeightGrams / 1000).toFixed(2)} کیلوگرم
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#18181F] border border-[#2B2B38]">
                  <span className="text-[#8E8E93] block">نرخ تسویه به‌موقع:</span>
                  <span className="font-bold text-[#3DD68C] text-base mt-1 block font-mono">
                    {retailer.purchaseHistory.onTimeSettlementRatePercent}٪
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#18181F] border border-[#2B2B38]">
                  <span className="text-[#8E8E93] block">میانگین روز تسویه:</span>
                  <span className="font-bold text-[#EDEDED] text-base mt-1 block font-mono">
                    {retailer.purchaseHistory.averageDaysToSettle} روز
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#18181F] border border-[#2B2B38] space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2B2B38]">
                  <span className="text-[#8E8E93]">گردش مالی سال جاری (YTD):</span>
                  <span className="font-bold text-[#EDEDED] font-mono">
                    {(retailer.purchaseHistory.yearToDateTurnoverToman / 10000000).toLocaleString('fa-IR')} میلیون تومان
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2B2B38]">
                  <span className="text-[#8E8E93]">طلای آبشده تحویلی جهت تهاتر:</span>
                  <span className="font-bold text-[#C8A951] font-mono">
                    {retailer.purchaseHistory.scrapGoldHandedOverGrams.toLocaleString('fa-IR')} گرم
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8E8E93]">آخرین سفارش ثبت‌شده:</span>
                  <span className="text-[#8E8E93] font-mono">
                    {retailer.purchaseHistory.lastOrderNumber} ({retailer.purchaseHistory.lastOrderDateFa})
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
