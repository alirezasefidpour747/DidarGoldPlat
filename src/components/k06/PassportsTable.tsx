import React from 'react';
import {
  Award,
  Scale,
  ShieldCheck,
  Building2,
  User,
  Radio,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Eye,
  Lock
} from 'lucide-react';
import { UniqueItemPassport } from '../../types/k06';

interface PassportsTableProps {
  passports: UniqueItemPassport[];
  onViewPassport: (passport: UniqueItemPassport) => void;
  onTransferOwnership: (passport: UniqueItemPassport) => void;
  onToggleStolen: (passport: UniqueItemPassport) => void;
  onQuickVerify: (passport: UniqueItemPassport) => void;
}

export const PassportsTable: React.FC<PassportsTableProps> = ({
  passports,
  onViewPassport,
  onTransferOwnership,
  onToggleStolen,
  onQuickVerify
}) => {
  if (passports.length === 0) {
    return (
      <div className="bg-[#161622] rounded-2xl p-12 text-center border border-[#28283C] shadow-md">
        <Award className="w-12 h-12 text-[#6C6C80] mx-auto mb-3" />
        <h4 className="text-base font-bold text-white">هیچ گذرنامه‌ای با این فیلترها یافت نشد</h4>
        <p className="text-xs text-[#A0A0B5] mt-1">
          برای صدور گذرنامه جدید از دکمه «صدور گذرنامه جدید (Mint)» در بالای صفحه استفاده کنید.
        </p>
      </div>
    );
  }

  const renderStatus = (p: UniqueItemPassport) => {
    if (p.isStolenReported) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          اعلام سرقت
        </span>
      );
    }
    switch (p.status) {
      case 'in_vault':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Building2 className="w-3 h-3" />
            خزانه مرکزی
          </span>
        );
      case 'retail_inventory':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
            <Building2 className="w-3 h-3" />
            ویترین گالری
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Radio className="w-3 h-3" />
            حمل مکانیزه
          </span>
        );
      case 'sold_active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            تحویل به خریدار
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-[#191926] text-[#A0A0B5] border border-[#28283C]">
            {p.statusFa}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#161622] rounded-2xl border border-[#28283C] shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-[#191926]/90 border-b border-[#28283C] text-xs text-[#A0A0B5] font-semibold">
              <th className="py-3.5 px-4">شناسه یکتا (UID) و سریال</th>
              <th className="py-3.5 px-4">مدل، تنوع و عیار</th>
              <th className="py-3.5 px-4">وزن دقیق ترازو</th>
              <th className="py-3.5 px-4">سنجش ری‌گیری و انگ</th>
              <th className="py-3.5 px-4">محل و دارنده فعلی</th>
              <th className="py-3.5 px-4">وضعیت</th>
              <th className="py-3.5 px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242436] text-xs">
            {passports.map((passport) => (
              <tr
                key={passport.id}
                className="hover:bg-[#1C1C2B] transition-colors group"
              >
                {/* UID and Serial */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuickVerify(passport)}
                      title="استعلام فوری QR / رمزنگاری"
                      className="w-8 h-8 rounded-lg bg-[#C8A951]/15 text-[#E5C365] hover:bg-[#C8A951]/25 flex items-center justify-center border border-[#C8A951]/30 shrink-0 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="font-mono font-bold text-white dir-ltr text-right">
                        {passport.uid}
                      </div>
                      <div className="text-[11px] text-[#828299] font-mono mt-0.5">
                        {passport.serialNumber}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SKU and Variant */}
                <td className="py-4 px-4 max-w-[220px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {passport.itemNature === 'melted_gold' && (
                      <span className="px-1.5 py-0.2 rounded bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/30 text-[10px] font-bold shrink-0">
                        آبشده
                      </span>
                    )}
                    <span className="font-bold text-white truncate" title={passport.productTitleFa}>
                      {passport.productTitleFa}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                    {passport.sizeLabelFa} | {passport.caratFa}
                  </div>
                </td>

                {/* Weight */}
                <td className="py-4 px-4">
                  <div className="font-mono font-bold text-white text-sm">
                    {Number(passport.actualScaleWeightGrams || 0).toLocaleString('fa-IR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                    <span className="text-[11px] font-normal text-[#A0A0B5]">گرم</span>
                  </div>
                  <div className="text-[10px] text-[#A0A0B5] font-mono">
                    {passport.skuWeightRangeFa ? (
                      <span className="text-[#E5C365] font-medium">رنج SKU: {passport.skuWeightRangeFa}</span>
                    ) : (
                      <span>اسمی: {Number(passport.nominalWeightGrams || 0).toFixed(3)}g</span>
                    )}
                  </div>
                </td>

                {/* Assay Lab & Hallmark */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-[#E5C365] bg-[#C8A951]/15 border border-[#C8A951]/30 px-2 py-0.5 rounded text-[11px]">
                      {passport.certifiedFineness} ‰
                    </span>
                    <span className="font-mono text-white font-bold">{passport.hallmarkCode}</span>
                  </div>
                  <div className="text-[11px] text-[#A0A0B5] mt-1 truncate max-w-[150px]">
                    {passport.assayLabName.replace('آزمایشگاه ری‌گیری رسمی ', '')}
                  </div>
                </td>

                {/* Holder & City */}
                <td className="py-4 px-4 max-w-[180px]">
                  <div className="font-medium text-white truncate">
                    {passport.currentOwnerName || passport.currentHolderName}
                  </div>
                  <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                    {passport.locationCityFa}
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">{renderStatus(passport)}</td>

                {/* Actions */}
                <td className="py-4 px-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => onViewPassport(passport)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-[#191926] hover:bg-[#C8A951]/20 text-[#EDEDED] hover:text-[#E5C365] border border-[#28283C] hover:border-[#C8A951]/40 rounded-lg transition-colors flex items-center gap-1"
                      title="نمایش کامل شناسنامه دیجیتال و شواهد QC"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      شناسنامه
                    </button>

                    {!passport.currentOwnerName && (
                      <button
                        onClick={() => onTransferOwnership(passport)}
                        className="p-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20"
                        title="ثبت فروش و صدور سند مالکیت"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onToggleStolen(passport)}
                      className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                        passport.isStolenReported
                          ? 'text-[#FF6B6B] hover:bg-[#E5484D]/10 hover:border-[#E5484D]/30'
                          : 'text-[#828299] hover:text-[#FF6B6B] hover:bg-[#191926]'
                      }`}
                      title={passport.isStolenReported ? 'مدیریت پرچم سرقت' : 'اعلام سرقت یا مفقودی'}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
