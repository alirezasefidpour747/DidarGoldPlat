/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Consumer Ownership Registration Modal
 * (فرم ثبت قطعی مالکیت مصرف‌کننده و فعال‌سازی شناسنامه)
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scale,
  Building2,
  Store,
  FileText,
  Smartphone,
  CreditCard,
  MapPin,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { OwnershipClaim, WarrantyCard } from '../../types/k17.js';

interface NewClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledUid?: string;
  prefilledTitle?: string;
  prefilledWeight?: number;
  onSuccess: (claim: OwnershipClaim, warranty: WarrantyCard, message: string) => void;
}

export const NewClaimModal: React.FC<NewClaimModalProps> = ({
  isOpen,
  onClose,
  prefilledUid = '',
  prefilledTitle = '',
  prefilledWeight = 0,
  onSuccess
}) => {
  const [itemUid, setItemUid] = useState('');
  const [productTitleFa, setProductTitleFa] = useState('');
  const [caratFa, setCaratFa] = useState('۱۸ عیار (۷۵۰)');
  const [weightGrams, setWeightGrams] = useState<number | ''>('');

  // Consumer Info
  const [fullNameFa, setFullNameFa] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [cityFa, setCityFa] = useState('تهران');

  // Retailer Info
  const [retailerNameFa, setRetailerNameFa] = useState('گالری طلا و جواهر کیا (شعبه مرکزی)');
  const [guildPermitNo, setGuildPermitNo] = useState('ص-۱۴۰۲-۸۸۲');
  const [salesInvoiceNumber, setSalesInvoiceNumber] = useState('');
  const [purchasePriceToman, setPurchasePriceToman] = useState<number | ''>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledUid) {
      setItemUid(prefilledUid);
    }
    if (prefilledTitle) {
      setProductTitleFa(prefilledTitle);
    }
    if (prefilledWeight) {
      setWeightGrams(prefilledWeight);
    }
    if (!salesInvoiceNumber) {
      setSalesInvoiceNumber(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [prefilledUid, prefilledTitle, prefilledWeight, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!itemUid.trim()) {
      setError('شناسه قطعه طلا (UID) الزامی است.');
      return;
    }
    if (!fullNameFa.trim()) {
      setError('نام و نام خانوادگی خریدار الزامی است.');
      return;
    }
    if (!nationalId.trim() || nationalId.length < 10) {
      setError('کد ملی ۱۰ رقمی معتبر خریدار را وارد نمایید.');
      return;
    }
    if (!mobile.trim() || !mobile.startsWith('09')) {
      setError('شماره تلفن همراه معتبر با پیش‌شماره ۰۹ الزامی است.');
      return;
    }
    if (!retailerNameFa.trim() || !salesInvoiceNumber.trim()) {
      setError('اطلاعات فروشگاه طلافروشی و شماره فاکتور الزامی است.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.createK17Claim({
        itemUid: itemUid.trim(),
        productTitleFa: productTitleFa.trim() || undefined,
        caratFa,
        weightGrams: weightGrams ? Number(weightGrams) : undefined,
        consumerFullNameFa: fullNameFa.trim(),
        consumerNationalId: nationalId.trim(),
        consumerMobile: mobile.trim(),
        consumerCityFa: cityFa.trim(),
        retailerNameFa: retailerNameFa.trim(),
        salesInvoiceNumber: salesInvoiceNumber.trim(),
        purchasePriceToman: purchasePriceToman ? Number(purchasePriceToman) : undefined,
        guildPermitNo: guildPermitNo.trim()
      });

      if (res.success) {
        onSuccess(res.claim, res.warranty, res.message);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت سند مالکیت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#181822] border border-[#36364A] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1F1F2C] border-b border-[#2B2B3C] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/40 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-[#E5C365]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">
                ثبت سند مالکیت دیجیتال مصرف‌کننده (K17)
              </h3>
              <p className="text-[11px] text-[#8E8EA0]">
                احراز هویت خریدار نهایی و فعال‌سازی کارت گارانتی ۲۴ ماهه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#242432] text-[#8E8EA0] hover:text-[#EDEDED] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#FF8B8B]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Piece Specifications */}
          <div className="p-4 rounded-2xl bg-[#15151D] border border-[#282838] space-y-3">
            <span className="text-[11px] font-bold text-[#C8A951] flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>مشخصات قطعه طلای خریداری‌شده</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شناسه یکتای قطعه (UID) *
                </label>
                <input
                  type="text"
                  value={itemUid}
                  onChange={(e) => setItemUid(e.target.value)}
                  placeholder="مثال: DID-AU750-2026-8820-001"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  عنوان قطعه / مدل
                </label>
                <input
                  type="text"
                  value={productTitleFa}
                  onChange={(e) => setProductTitleFa(e.target.value)}
                  placeholder="مثال: النگو طلا ۱۸ عیار طرح صفوی"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  عیار استاندارد
                </label>
                <select
                  value={caratFa}
                  onChange={(e) => setCaratFa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                >
                  <option value="۱۸ عیار (۷۵۰)">۱۸ عیار (۷۵۰ استاندارد)</option>
                  <option value="۲۱ عیار (۸۷۵)">۲۱ عیار (۸۷۵)</option>
                  <option value="۲۴ عیار (۹۹۵)">۲۴ عیار شمش (۹۹۵)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  وزن دقیق ترازو (گرم)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 11.985"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Consumer Identification */}
          <div className="p-4 rounded-2xl bg-[#15151D] border border-[#282838] space-y-3">
            <span className="text-[11px] font-bold text-[#3DD68C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>مشخصات خریدار نهایی (مصرف‌کننده)</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  نام و نام خانوادگی خریدار *
                </label>
                <input
                  type="text"
                  value={fullNameFa}
                  onChange={(e) => setFullNameFa(e.target.value)}
                  placeholder="مثال: سارا فرهمند"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  کد ملی (۱۰ رقم) *
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="0012345678"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شماره موبایل خریدار (جهت ارسال پیامک سند) *
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="09121112233"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شهر محل سکونت
                </label>
                <input
                  type="text"
                  value={cityFa}
                  onChange={(e) => setCityFa(e.target.value)}
                  placeholder="تهران"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Retailer Info */}
          <div className="p-4 rounded-2xl bg-[#15151D] border border-[#282838] space-y-3">
            <span className="text-[11px] font-bold text-[#E5C365] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              <span>اطلاعات فروشگاه طلا و فاکتور فروش</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  نام گالری / طلافروشی *
                </label>
                <input
                  type="text"
                  value={retailerNameFa}
                  onChange={(e) => setRetailerNameFa(e.target.value)}
                  placeholder="جواهری کیا"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شماره پروانه کسب اتحادیه
                </label>
                <input
                  type="text"
                  value={guildPermitNo}
                  onChange={(e) => setGuildPermitNo(e.target.value)}
                  placeholder="ص-۱۳۹۸-۴۱۲"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  شماره فاکتور فروشگاه *
                </label>
                <input
                  type="text"
                  value={salesInvoiceNumber}
                  onChange={(e) => setSalesInvoiceNumber(e.target.value)}
                  placeholder="INV-1405-991"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8EA0] mb-1">
                  مبلغ فاکتور (تومان)
                </label>
                <input
                  type="number"
                  value={purchasePriceToman}
                  onChange={(e) => setPurchasePriceToman(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="مثال: 58500000"
                  className="w-full px-3 py-2 rounded-xl bg-[#1E1E2C] border border-[#333346] text-[#EDEDED] text-xs font-mono focus:border-[#C8A951] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-start gap-2.5 text-[11px] text-[#E5C365]">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              پس از ثبت سند، پیامک حاوی لینک سند مالکیت دیجیتال و کارت گارانتی ۲۴ ماهه برای خریدار ارسال می‌گردد و قطعه از وضعیت آزاد به مالکیت قطعی تغییر می‌یابد.
            </span>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#262634]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222230] text-[#8E8EA0] hover:text-[#EDEDED] text-xs font-medium cursor-pointer"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D4B763] text-[#141416] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>در حال ثبت سند...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>صدور سند مالکیت و فعال‌سازی گارانتی</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
