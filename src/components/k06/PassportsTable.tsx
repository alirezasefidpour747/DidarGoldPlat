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
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">هیچ گذرنامه‌ای با این فیلترها یافت نشد</h4>
        <p className="text-xs text-slate-500 mt-1">
          برای صدور گذرنامه جدید از دکمه «صدور گذرنامه جدید (Mint)» در بالای صفحه استفاده کنید.
        </p>
      </div>
    );
  }

  const renderStatus = (p: UniqueItemPassport) => {
    if (p.isStolenReported) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          اعلام سرقت
        </span>
      );
    }
    switch (p.status) {
      case 'in_vault':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Building2 className="w-3 h-3" />
            خزانه مرکزی
          </span>
        );
      case 'retail_inventory':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3 h-3" />
            ویترین گالری
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <Radio className="w-3 h-3" />
            حمل مکانیزه
          </span>
        );
      case 'sold_active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            تحویل به خریدار
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700">
            {p.statusFa}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600 font-semibold">
              <th className="py-3.5 px-4">شناسه یکتا (UID) و سریال</th>
              <th className="py-3.5 px-4">مدل، تنوع و عیار</th>
              <th className="py-3.5 px-4">وزن دقیق ترازو</th>
              <th className="py-3.5 px-4">سنجش ری‌گیری و انگ</th>
              <th className="py-3.5 px-4">محل و دارنده فعلی</th>
              <th className="py-3.5 px-4">وضعیت</th>
              <th className="py-3.5 px-4 text-center">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {passports.map((passport) => (
              <tr
                key={passport.id}
                className="hover:bg-amber-50/30 transition-colors group"
              >
                {/* UID and Serial */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onQuickVerify(passport)}
                      title="استعلام فوری QR / رمزنگاری"
                      className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center justify-center border border-amber-200 shrink-0 transition-colors"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="font-mono font-bold text-slate-900 dir-ltr text-right">
                        {passport.uid}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {passport.serialNumber}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SKU and Variant */}
                <td className="py-4 px-4 max-w-[220px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {passport.itemNature === 'melted_gold' && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold shrink-0">
                        آبشده
                      </span>
                    )}
                    <span className="font-bold text-slate-900 truncate" title={passport.productTitleFa}>
                      {passport.productTitleFa}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {passport.sizeLabelFa} | {passport.caratFa}
                  </div>
                </td>

                {/* Weight */}
                <td className="py-4 px-4">
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {Number(passport.actualScaleWeightGrams || 0).toFixed(3)}{' '}
                    <span className="text-[11px] font-normal text-slate-500">گرم</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {passport.skuWeightRangeFa ? (
                      <span className="text-amber-700 font-medium">رنج SKU: {passport.skuWeightRangeFa}</span>
                    ) : (
                      <span>اسمی: {Number(passport.nominalWeightGrams || 0).toFixed(3)}g</span>
                    )}
                  </div>
                </td>

                {/* Assay Lab & Hallmark */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded text-[11px]">
                      {passport.certifiedFineness} ‰
                    </span>
                    <span className="font-mono text-slate-800 font-bold">{passport.hallmarkCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]">
                    {passport.assayLabName.replace('آزمایشگاه ری‌گیری رسمی ', '')}
                  </div>
                </td>

                {/* Holder & City */}
                <td className="py-4 px-4 max-w-[180px]">
                  <div className="font-medium text-slate-900 truncate">
                    {passport.currentOwnerName || passport.currentHolderName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
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
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 rounded-lg transition-colors flex items-center gap-1"
                      title="نمایش کامل شناسنامه دیجیتال و شواهد QC"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      شناسنامه
                    </button>

                    {!passport.currentOwnerName && (
                      <button
                        onClick={() => onTransferOwnership(passport)}
                        className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="ثبت فروش و صدور سند مالکیت"
                      >
                        <User className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onToggleStolen(passport)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        passport.isStolenReported
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50'
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
