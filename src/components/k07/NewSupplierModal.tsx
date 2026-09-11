/**
 * Didar Gold Platform - Domain K07
 * New Supplier / Workshop Onboarding Modal
 */

import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Scale, Award, MapPin, Phone, UserCheck } from 'lucide-react';
import { SupplierPartnership, SupplierType } from '../../types/k07.js';

interface NewSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: Partial<SupplierPartnership>) => Promise<void>;
}

export const NewSupplierModal: React.FC<NewSupplierModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [nameFa, setNameFa] = useState('');
  const [commercialBrandFa, setCommercialBrandFa] = useState('');
  const [supplierType, setSupplierType] = useState<SupplierType>('industrial_factory');
  const [cityFa, setCityFa] = useState('تهران');
  const [provinceFa, setProvinceFa] = useState('تهران');
  const [addressFa, setAddressFa] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerNationalCodeMasked, setManagerNationalCodeMasked] = useState('');
  const [unionLicenseNo, setUnionLicenseNo] = useState('');
  const [hallmarkCode, setHallmarkCode] = useState('');
  const [tradeSystemId, setTradeSystemId] = useState('');
  const [totalConsignmentLimitGrams, setTotalConsignmentLimitGrams] = useState(10000);
  const [collateralTotalEquivalentToman, setCollateralTotalEquivalentToman] = useState(60000000000);
  const [collateralTotalGoldGrams, setCollateralTotalGoldGrams] = useState(10000);
  const [specialtiesText, setSpecialtiesText] = useState('النگو ریخته‌گری، زنجیر فیگارو، مدال اسلیمی');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) {
      setError('لطفاً نام رسمی کارگاه یا شرکت را وارد فرمایید.');
      return;
    }
    if (!hallmarkCode.trim()) {
      setError('ورود کد انگ رسمی کارگاه الزامی است.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave({
        nameFa: nameFa.trim(),
        commercialBrandFa: commercialBrandFa.trim() || nameFa.trim(),
        supplierType,
        cityFa: cityFa.trim(),
        provinceFa: provinceFa.trim(),
        addressFa: addressFa.trim(),
        phone: phone.trim(),
        managerName: managerName.trim(),
        managerNationalCodeMasked: managerNationalCodeMasked.trim(),
        unionLicenseNo: unionLicenseNo.trim(),
        hallmarkCode: hallmarkCode.trim(),
        tradeSystemId: tradeSystemId.trim(),
        totalConsignmentLimitGrams: Number(totalConsignmentLimitGrams),
        collateralTotalEquivalentToman: Number(collateralTotalEquivalentToman),
        collateralTotalGoldGrams: Number(collateralTotalGoldGrams),
        specialties: specialtiesText.split('،').map((s) => s.trim()).filter(Boolean),
        notes: notes.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت کارگاه.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#181822] border border-[#2B2B3C] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-[#262636] bg-[#14141E]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 text-[#E5C365] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">پذیرش و ثبت کارگاه تأمین‌کننده جدید طلا</h3>
              <p className="text-[11px] text-[#8E8E9F]">ثبت مشخصات ثبتی، پروانه اتحادیه، کد انگ و سهمیه اولیه طلا</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E8E9F] hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نام رسمی کارگاه / کارخانه *</label>
              <input
                type="text"
                value={nameFa}
                onChange={(e) => setNameFa(e.target.value)}
                placeholder="مثلاً: کارگاه ریخته‌گری زرین پارس"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نام برند تجاری (معروف در بازار)</label>
              <input
                type="text"
                value={commercialBrandFa}
                onChange={(e) => setCommercialBrandFa(e.target.value)}
                placeholder="مثلاً: زرین گلد (Zarrin Gold)"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نوع مرکز ساخت و تولید *</label>
              <select
                value={supplierType}
                onChange={(e) => setSupplierType(e.target.value as SupplierType)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
              >
                <option value="industrial_factory">کارخانه صنعتی مکانیزه (زنجیر و النگو ماشینی)</option>
                <option value="casting_foundry">کارگاه تخصصی ریخته‌گری موم گمشده (اسلیمی و فیوژن)</option>
                <option value="artisan_workshop">کارگاه صنایع‌دستی و زرگری سنتی</option>
                <option value="cnc_laser">کارگاه برش لیزری، CNC و قطعات سبک</option>
                <option value="stone_setting">کارگاه مرصع‌کاری و مخراجی نگین و سنگ</option>
                <option value="refinery_bullion">کارگاه قالکاری و پالایش شمش طلا</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">کد انگ رسمی کارگاه در ری‌گیری *</label>
              <input
                type="text"
                value={hallmarkCode}
                onChange={(e) => setHallmarkCode(e.target.value)}
                placeholder="مثلاً: T-8820 یا E-4491"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951] font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نام مدیرعامل / استادکار</label>
              <input
                type="text"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="نام و نام خانوادگی"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">کد ملی مدیر (ماسک‌شده)</label>
              <input
                type="text"
                value={managerNationalCodeMasked}
                onChange={(e) => setManagerNationalCodeMasked(e.target.value)}
                placeholder="مثلاً: ۰۰۴***۱۸۹۲"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951] font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تلفن ثابت / همراه کارگاه</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثلاً: ۰۲۱-۵۵۶۲۹۴۱۱"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شماره پروانه کسب اتحادیه طلا</label>
              <input
                type="text"
                value={unionLicenseNo}
                onChange={(e) => setUnionLicenseNo(e.target.value)}
                placeholder="مثلاً: اتحادیه تهران: ۱۴۰۲/۹۸۳۱"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شناسه سامانه جامع تجارت (NTSW)</label>
              <input
                type="text"
                value={tradeSystemId}
                onChange={(e) => setTradeSystemId(e.target.value)}
                placeholder="مثلاً: NTSW-MFG-99410"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">شهر و استان</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cityFa}
                  onChange={(e) => setCityFa(e.target.value)}
                  placeholder="شهر"
                  className="w-1/2 px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
                />
                <input
                  type="text"
                  value={provinceFa}
                  onChange={(e) => setProvinceFa(e.target.value)}
                  placeholder="استان"
                  className="w-1/2 px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">نشانی کارگاه / سالن تولید</label>
              <input
                type="text"
                value={addressFa}
                onChange={(e) => setAddressFa(e.target.value)}
                placeholder="مثلاً: بازار زرگران، کوچه تکیه دولت، پلاک ۴"
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12121A] border border-[#232332] space-y-3">
            <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              <span>تنظیم حدود سهمیه طلای امانی و تضامین زرگری</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#8E8E9F] mb-1">سقف طلای امانی اولیه (گرم)</label>
                <input
                  type="number"
                  value={totalConsignmentLimitGrams}
                  onChange={(e) => setTotalConsignmentLimitGrams(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#181822] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8E8E9F] mb-1">ارزش تضامین ریالی (تومان)</label>
                <input
                  type="number"
                  value={collateralTotalEquivalentToman}
                  onChange={(e) => setCollateralTotalEquivalentToman(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#181822] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#8E8E9F] mb-1">معادل طلا در تضامین (گرم)</label>
                <input
                  type="number"
                  value={collateralTotalGoldGrams}
                  onChange={(e) => setCollateralTotalGoldGrams(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#181822] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">تخصص‌های تولیدی (با کامای فارسی «،» جدا کنید)</label>
            <input
              type="text"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8E8E9F] mb-1">یادداشت کارشناسی پذیرش</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="توضیحات تکمیلی درباره تجهیزات، سوابق صنفی یا تأییدیه‌های دریافتی..."
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white placeholder-[#5E5E6E] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262636]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8E8E9F] hover:text-white bg-transparent rounded-xl"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] disabled:opacity-50 rounded-xl transition-all shadow-lg shadow-[#C8A951]/20"
            >
              {submitting ? 'در حال ثبت پرونده...' : 'ثبت قطعی و تشکیل پرونده کارگاه'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
