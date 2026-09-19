/**
 * Didar Gold Platform - Kernel Domain K11
 * New Retailer Onboarding Modal (ثبت و پذیرش گالری طلافروشی جدید)
 */

import React, { useState } from 'react';
import {
  X,
  Store,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  Award,
  AlertCircle
} from 'lucide-react';
import { Retailer, CommercialTier } from '../../types/k11.js';

interface NewRetailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (retailerData: Partial<Retailer>) => Promise<void>;
  availableAgents: { id: string; nameFa: string; regionCode: string }[];
}

export const NewRetailerModal: React.FC<NewRetailerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableAgents
}) => {
  const [tradeNameFa, setTradeNameFa] = useState('');
  const [ownerFullNameFa, setOwnerFullNameFa] = useState('');
  const [nationalCode, setNationalCode] = useState('');
  const [unionLicenseNumber, setUnionLicenseNumber] = useState('');
  const [guildRegistryCode, setGuildRegistryCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [provinceFa, setProvinceFa] = useState('تهران');
  const [cityFa, setCityFa] = useState('تهران');
  const [postalAddressFa, setPostalAddressFa] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [establishmentYearFa, setEstablishmentYearFa] = useState('۱۴۰۰');
  const [storeAreaSquareMeters, setStoreAreaSquareMeters] = useState(35);
  const [securityRatingFa, setSecurityRatingFa] = useState('گرید A (شیشه ضدگلوله، گاوصندوق دژبان و دوربین فراجا)');
  const [tier, setTier] = useState<CommercialTier>('bronze');
  const [assignedAgentId, setAssignedAgentId] = useState('agt-01');
  const [notesFa, setNotesFa] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeNameFa.trim() || !ownerFullNameFa.trim() || !unionLicenseNumber.trim()) {
      setErrorMessage('لطفاً نام گالری، نام مالک و شماره پروانه کسب را تکمیل نمایید.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const selectedAgent = availableAgents.find(a => a.id === assignedAgentId) || availableAgents[0];

      await onSubmit({
        tradeNameFa,
        ownerFullNameFa,
        nationalCode,
        unionLicenseNumber,
        guildRegistryCode: guildRegistryCode || `GLD-${Math.floor(1000 + Math.random() * 9000)}`,
        phoneNumber,
        mobileNumber,
        provinceFa,
        cityFa,
        postalAddressFa,
        postalCode,
        establishmentYearFa,
        storeAreaSquareMeters: Number(storeAreaSquareMeters) || 30,
        securityRatingFa,
        notesFa,
        commercialTerms: {
          tier,
          tierFa: tier === 'diamond' ? 'الماس' : tier === 'platinum' ? 'پلاتین' : tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'برنزی',
          trustScore: tier === 'diamond' ? 95 : tier === 'platinum' ? 90 : tier === 'gold' ? 85 : tier === 'silver' ? 78 : 70,
          wageDiscountPercent: tier === 'diamond' ? 3.0 : tier === 'platinum' ? 2.0 : tier === 'gold' ? 1.0 : 0,
          creditLimitToman: tier === 'diamond' ? 10000000000 : tier === 'platinum' ? 5000000000 : tier === 'gold' ? 2500000000 : 500000000,
          creditLimitGoldGrams: tier === 'diamond' ? 1200 : tier === 'platinum' ? 600 : tier === 'gold' ? 300 : 60,
          currentUsedCreditToman: 0,
          currentUsedCreditGoldGrams: 0,
          paymentTenorDays: tier === 'diamond' ? 45 : tier === 'platinum' ? 30 : tier === 'gold' ? 15 : 0,
          allowScrapGoldBarter: true,
          allowPostDatedCheque: tier !== 'bronze',
          lastCreditReviewDateFa: '۱۴۰۳/۰۹/۱۰'
        },
        territory: {
          regionCode: selectedAgent?.regionCode || 'TEH',
          regionTitleFa: provinceFa,
          marketDistrictFa: cityFa,
          assignedAgentId: selectedAgent?.id || 'agt-01',
          assignedAgentNameFa: selectedAgent?.nameFa || 'مهندس حسام داوودی',
          scheduledVisitDayFa: 'دوشنبه‌ها نوبت صبح',
          isExclusiveZone: false
        }
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'خطا در ایجاد پرونده خرده‌فروش');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="bg-[#161622] border border-[#28283C] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#28283C] bg-[#151520]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/40 flex items-center justify-center text-[#E5C365]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">پذیرش و تشکیل پرونده گالری طلافروشی</h3>
              <p className="text-xs text-[#A0A0B5]">ثبت مشخصات صنف، پروانه کسب و دسترسی‌های تجاری در پلتفرم دیدار</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#A0A0B5] hover:text-white hover:bg-[#252538] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#E5484D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-right">
          {/* Gallery & Owner Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                نام تجاری تابلو طلافروشی <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                required
                value={tradeNameFa}
                onChange={(e) => setTradeNameFa(e.target.value)}
                placeholder="مثال: گالری طلا و جواهر زمرد"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                نام و نام‌خانوادگی مالک / صاحب پروانه <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                required
                value={ownerFullNameFa}
                onChange={(e) => setOwnerFullNameFa(e.target.value)}
                placeholder="مثال: حاج محمود کمالی"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">
                شماره پروانه کسب اتحادیه طلا و جواهر <span className="text-[#E5484D]">*</span>
              </label>
              <input
                type="text"
                required
                value={unionLicenseNumber}
                onChange={(e) => setUnionLicenseNumber(e.target.value)}
                placeholder="مثال: ۱۴۰۲/ت/۸۹۲۰"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">کد ملی مالک</label>
              <input
                type="text"
                value={nationalCode}
                onChange={(e) => setNationalCode(e.target.value)}
                placeholder="۱۰ رقم بدون خط تیره"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">شماره تماس ثابت فروشگاه</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="مثال: ۰۲۱-۵۵۶۲۳۴۹۰"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors font-mono text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">شماره همراه مدیر</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="مثال: ۰۹۱۲۱۱۱۸۸۴۴"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors font-mono text-left"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">استان</label>
              <select
                value={provinceFa}
                onChange={(e) => {
                  setProvinceFa(e.target.value);
                  setCityFa(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="تهران">تهران</option>
                <option value="اصفهان">اصفهان</option>
                <option value="خراسان رضوی">خراسان رضوی (مشهد)</option>
                <option value="آذربایجان شرقی">آذربایجان شرقی (تبریز)</option>
                <option value="فارس">فارس (شیراز)</option>
                <option value="خوزستان">خوزستان (اهواز)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">شهرستان / منطقه تجاری</label>
              <input
                type="text"
                value={cityFa}
                onChange={(e) => setCityFa(e.target.value)}
                placeholder="مثال: بازار بزرگ یا شمیرانات"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">نشانی دقیق فروشگاه و راسته بازار</label>
            <textarea
              rows={2}
              value={postalAddressFa}
              onChange={(e) => setPostalAddressFa(e.target.value)}
              placeholder="مثال: بازار بزرگ، سرای حاج مهدی، طبقه همکف، پلاک ۱۴"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Security & Commercial Tiering */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#28283C]">
            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">رتبه تجاری اولیه</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as CommercialTier)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                <option value="bronze">برنزی (تسویه نقدی/آبشده فوری)</option>
                <option value="silver">نقره‌ای (تسویه ۷ تا ۱۵ روزه)</option>
                <option value="gold">طلایی (اعتبار متوازن ۳۰ روزه)</option>
                <option value="platinum">پلاتین (سقف بالا ۵۰۰ گرم طلا)</option>
                <option value="diamond">الماس (سقف فوق‌ویژه ۱.۵ کیلوگرم)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">ویزیتور میدانی مسئول</label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white focus:border-[#C8A951] focus:outline-none transition-colors"
              >
                {availableAgents.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nameFa} ({ag.regionCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">مساحت فروشگاه (متر مربع)</label>
              <input
                type="number"
                value={storeAreaSquareMeters}
                onChange={(e) => setStoreAreaSquareMeters(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white focus:border-[#C8A951] focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">مشخصات حفاظتی و سیستم امنیتی</label>
            <input
              type="text"
              value={securityRatingFa}
              onChange={(e) => setSecurityRatingFa(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white focus:border-[#C8A951] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#EDEDED] mb-1.5">یادداشت‌های ارزیابی اولیه و صنف</label>
            <input
              type="text"
              value={notesFa}
              onChange={(e) => setNotesFa(e.target.value)}
              placeholder="سوابق معرف‌های صنفی، نوع ویترین و سبک محصولات..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#12121A] border border-[#2B2B3E] text-sm text-white placeholder-[#78788C] focus:border-[#C8A951] focus:outline-none transition-colors"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#28283C]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#A0A0B5] hover:text-white hover:bg-[#252538] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D9B961] transition-all flex items-center gap-2 shadow-lg shadow-[#C8A951]/20 disabled:opacity-50 active:scale-95"
            >
              {submitting ? 'در حال ثبت پرونده...' : 'ثبت و تشکیل پرونده تجاری'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
