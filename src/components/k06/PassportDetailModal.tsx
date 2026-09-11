import React, { useState } from 'react';
import {
  X,
  Award,
  ShieldCheck,
  Scale,
  FileCheck2,
  QrCode,
  Radio,
  Clock,
  User,
  AlertTriangle,
  ExternalLink,
  Printer,
  Sparkles,
  Camera,
  CheckCircle2,
  Lock,
  Building2,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { UniqueItemPassport, ProvenanceEvent } from '../../types/k06';

interface PassportDetailModalProps {
  passport: UniqueItemPassport;
  events: ProvenanceEvent[];
  onClose: () => void;
  onTransferOwnership: (passport: UniqueItemPassport) => void;
  onToggleStolen: (passport: UniqueItemPassport) => void;
  onRecordEvent: (passport: UniqueItemPassport) => void;
}

export const PassportDetailModal: React.FC<PassportDetailModalProps> = ({
  passport,
  events,
  onClose,
  onTransferOwnership,
  onToggleStolen,
  onRecordEvent
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'assay_qc' | 'provenance' | 'ownership'>('certificate');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(
    passport.macroPhotos.length > 0 ? passport.macroPhotos[0].url : null
  );

  const passportEvents = events.filter((e) => e.passportId === passport.id);

  const getStatusBadge = () => {
    if (passport.isStolenReported) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          اعلام سرقت در شبکه سراسری
        </span>
      );
    }
    switch (passport.status) {
      case 'in_vault':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <Building2 className="w-3.5 h-3.5" />
            موجود در خزانه مرکزی دیدار
          </span>
        );
      case 'retail_inventory':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <Building2 className="w-3.5 h-3.5" />
            موجود در ویترین گالری همکار
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            <Radio className="w-3.5 h-3.5" />
            در حال حمل ایمن مکانیزه
          </span>
        );
      case 'sold_active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تحویل به خریدار (شناسنامه فعال)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
            {passport.statusFa}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-mono font-bold border border-amber-200 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {passport.itemNature === 'melted_gold' ? 'شناسنامه رسمی طلای آبشده و شمش' : 'گذرنامه دیجیتال مصنوع طلا'}
                </h3>
                {passport.itemNature === 'melted_gold' && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    طلای آبشده
                  </span>
                )}
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5 dir-ltr text-right">
                UID: <span className="font-semibold text-slate-800">{passport.uid}</span> | سریال: {passport.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="چاپ شناسنامه رسمی"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'certificate'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            گواهی رسمی اصالت
          </button>
          <button
            onClick={() => setActiveTab('assay_qc')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'assay_qc'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-600" />
            سنجش ری‌گیری، عیار و QC
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'provenance'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-600" />
            زنجیره تغییرناپذیر اصالت ({passportEvents.length} رویداد)
          </button>
          <button
            onClick={() => setActiveTab('ownership')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ownership'
                ? 'border-amber-600 text-amber-900 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            سند مالکیت و گارانتی
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: OFFICIAL LUXURY CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Luxury Passport Certificate Card */}
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-amber-600/5 border-2 border-amber-300/80 shadow-md">
                <div className="absolute top-4 left-4 flex flex-col items-center gap-1">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-sm border border-amber-200 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">کد استعلام سریع</span>
                </div>

                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  DIDAR GOLD PHYSICAL-DIGITAL PASSPORT
                </div>

                <h4 className="text-xl font-bold text-slate-900 leading-snug">
                  {passport.productTitleFa}
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  مدل پایه: <span className="font-semibold text-slate-800">{passport.productSkuCode}</span> | مشخصات تنوع: {passport.sizeLabelFa}
                </p>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs">
                    <span className="text-xs text-slate-500 block">وزن دقیق ترازو (سنجش تحلیلی)</span>
                    <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
                      {Number(passport.actualScaleWeightGrams || 0).toFixed(3)}{' '}
                      <span className="text-xs font-normal text-slate-500">گرم</span>
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {passport.skuWeightRangeFa ? (
                        <span className="text-amber-800 font-medium">رنج مجاز کاتالوگ: {passport.skuWeightRangeFa}</span>
                      ) : (
                        <span>اسمی: {Number(passport.nominalWeightGrams || 0).toFixed(3)}g</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs">
                    <span className="text-xs text-slate-500 block">عیار قطعی ری‌گیری</span>
                    <span className="text-lg font-bold text-amber-700 font-mono mt-1 block">
                      {passport.certifiedFineness}{' '}
                      <span className="text-xs font-normal text-amber-800">/ ۱۰۰۰</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">استاندارد ۷۵۰ ملی ایران</span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs">
                    <span className="text-xs text-slate-500 block">کد انگ رسمی آزمایشگاه</span>
                    <span className="text-base font-bold text-slate-900 font-mono mt-1 block">
                      {passport.hallmarkCode}
                    </span>
                    <span className="text-[10px] text-slate-500">{passport.assayLabName.split(' ')[2] || 'زرفام'}</span>
                  </div>

                  <div className="bg-white/80 p-3.5 rounded-xl border border-amber-200/70 shadow-2xs">
                    <span className="text-xs text-slate-500 block">شناسه تراشه رمزنگاری NFC</span>
                    <span className="text-xs font-bold text-slate-800 font-mono mt-1.5 block dir-ltr text-right">
                      {passport.nfcTagUid}
                    </span>
                    <span className="text-[10px] text-purple-700">تگ ضدسرقت غیرقابل شبیه‌سازی</span>
                  </div>
                </div>

                {/* Laser Marking & Security Badge */}
                <div className="mt-5 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-slate-700">
                      حکاکی لیزری فیبر روی قطعه:{' '}
                      <span className="font-mono font-bold text-slate-900 bg-amber-100/80 px-2 py-0.5 rounded">
                        {passport.laserEngravingText}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>مهر دیجیتال SHA-256 تأییدشده دیدار</span>
                  </div>
                </div>
              </div>

              {/* Quick Status and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    موقعیت فیزیکی و متصدی فعلی
                  </div>
                  <div className="text-sm font-bold text-slate-900">{passport.currentHolderName}</div>
                  <div className="text-xs text-slate-500 mt-1">شهر / محدوده: {passport.locationCityFa}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    وضعیت اصالت و ضمانت
                  </div>
                  <div className="text-sm font-bold text-slate-900">
                    {passport.isStolenReported ? (
                      <span className="text-rose-600">مسدود در شبکه به عنوان مفقودی</span>
                    ) : (
                      <span className="text-emerald-700">تأییدشده و دارای پوشش بیمه امانت و اصالت</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    تاریخ صدور شناسنامه: {passport.issuedAt} | صادرکننده: {passport.issuedBy}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: METALLURGICAL ASSAY & QC EVIDENCE */}
          {activeTab === 'assay_qc' && (
            <div className="space-y-6">
              {/* Metallurgical Assay Details */}
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">گواهی‌نامه رسمی آزمایشگاه ری‌گیری (Assay Certificate)</h4>
                      <p className="text-xs text-slate-500">سنجش رسمی خلوص طلا مطابق با استاندارد ISIRI 213</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-bold">
                    {passport.certifiedFineness} ‰ Fineness
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">نام آزمایشگاه ری‌گیری:</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{passport.assayLabName}</span>
                    <span className="text-[11px] text-slate-400">{passport.assayUnionPermitNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">کد پاکت ری‌گیری:</span>
                    <span className="font-semibold text-slate-900 font-mono mt-0.5 block">{passport.assayPacketCode}</span>
                    <span className="text-[11px] text-slate-400">تاریخ سنجش: {passport.assayCertifiedDateFa}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">متد سنجش و کارشناس:</span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">{passport.assayMethodFa}</span>
                    <span className="text-[11px] text-slate-400">ری‌گیر: {passport.inspectorName}</span>
                  </div>
                </div>
              </div>

              {/* Analytical Scale & Calibrated Measurement */}
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-amber-600" />
                  راستی‌آزمایی ترازوی دیجیتال تحلیلی
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">رنج استاندارد SKU در K05:</span>
                    <div className="font-mono font-bold text-amber-700 mt-1">
                      {passport.skuWeightRangeFa || `${Number(passport.nominalWeightGrams || 0).toFixed(2)} گرم`}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">مدل ترازوی توزین:</span>
                    <div className="font-medium text-slate-900 mt-1">{passport.scaleModel}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">تاریخ کالیبراسیون رسمی:</span>
                    <div className="font-medium text-slate-900 mt-1">{passport.scaleCalibrationDateFa}</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="text-slate-500">دلتای توزین با میانگین:</span>
                    <div className="font-mono font-bold text-slate-900 mt-1">
                      {passport.weightDeltaGrams > 0 ? `+${passport.weightDeltaGrams}` : passport.weightDeltaGrams} گرم
                    </div>
                  </div>
                </div>
              </div>

              {/* QC Macro Photo Inspection Evidence */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-slate-700" />
                  شواهد تصویری میکروسکوپی کنترل کیفیت (QC Macro Evidence)
                </h4>

                {passport.macroPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center relative min-h-[220px]">
                        {selectedPhoto && (
                          <img
                            src={selectedPhoto}
                            alt="Macro evidence"
                            className="max-h-[300px] w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-mono flex items-center gap-2">
                          <span>
                            {passport.macroPhotos.find((p) => p.url === selectedPhoto)?.titleFa || 'شاهد ماکرو'}
                          </span>
                          <span className="text-amber-400 font-bold">
                            ({passport.macroPhotos.find((p) => p.url === selectedPhoto)?.magnification || '50X'})
                          </span>
                        </div>
                      </div>

                      {/* نوار جابجایی بین چندین تصویر ماکرو */}
                      {passport.macroPhotos.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {passport.macroPhotos.map((item, idx) => (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => setSelectedPhoto(item.url)}
                              className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                selectedPhoto === item.url
                                  ? 'border-amber-500 shadow-md ring-2 ring-amber-400/30 scale-105'
                                  : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                src={item.url}
                                alt={item.titleFa}
                                className="w-16 h-12 object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white text-center truncate px-0.5">
                                {item.magnification || `${idx + 1}`}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-500 block">امتیاز کنترل کیفیت:</span>
                        <div className="text-lg font-bold text-emerald-700 font-mono mt-0.5">{passport.qcScore} / ۱۰۰</div>
                        <div className="text-slate-500 text-[11px] mt-1">بازرس: {passport.qcInspectorName}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <span className="text-slate-500 block">وضعیت سطح و تخلخل:</span>
                        <div className="font-semibold text-slate-900 mt-0.5">{passport.surfaceFinishGradeFa}</div>
                        <div className="text-slate-600 text-[11px] mt-1">{passport.porosityCheckFa}</div>
                      </div>

                      {passport.qcNotes && (
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900">
                          <span className="font-semibold block mb-0.5">یادداشت فنی بازرس:</span>
                          {passport.qcNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                    شاهد تصویری ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IMMUTABLE PROVENANCE TIMELINE */}
          {activeTab === 'provenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">دفتر کل زنجیره اصالت و انتقال مالکیت</h4>
                  <p className="text-xs text-slate-500">تمام رویدادهای فیزیکی، ری‌گیری و واگذاری به صورت تغییرناپذیر ثبت شده است.</p>
                </div>
                <button
                  onClick={() => onRecordEvent(passport)}
                  className="px-3 py-1.5 text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  ثبت رویداد جدید در زنجیره
                </button>
              </div>

              {passportEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  هیچ واقعه‌ای برای این قطعه ثبت نشده است.
                </div>
              ) : (
                <div className="relative border-r-2 border-slate-200 pr-6 mr-3 space-y-6">
                  {passportEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-purple-600 group-hover:scale-125 transition-transform" />

                      <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-xl border border-slate-200 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded">
                            {evt.eventTypeFa}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{evt.timestampFa}</span>
                        </div>

                        <h5 className="text-sm font-bold text-slate-900 mb-1">{evt.titleFa}</h5>
                        <p className="text-xs text-slate-600 leading-relaxed">{evt.descriptionFa}</p>

                        <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                          <div>
                            متصدی:{' '}
                            <span className="font-semibold text-slate-700">
                              {evt.actorName} ({evt.actorRoleFa})
                            </span>
                          </div>
                          <div>
                            موقعیت: <span className="font-medium text-slate-700">{evt.locationFa}</span>
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 dir-ltr">
                            Hash: {evt.blockHash.slice(0, 14)}...
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: OWNERSHIP RECORD & WARRANTY */}
          {activeTab === 'ownership' && (
            <div className="space-y-6">
              {passport.currentOwnerName ? (
                <div className="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">سند فعال مالکیت مصرف‌کننده</h4>
                      <p className="text-xs text-emerald-800">این قطعه به صورت رسمی به نام خریدار حقیقی فعال شده است.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-slate-500 block">نام کامل مالک:</span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">{passport.currentOwnerName}</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-slate-500 block">کد ملی خریدار (ماسک‌شده):</span>
                      <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">{passport.ownerNationalCodeMasked}</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-slate-500 block">شماره فاکتور رسمی فروش:</span>
                      <span className="text-sm font-bold font-mono text-slate-900 mt-1 block">{passport.retailInvoiceNumber}</span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-2xs">
                      <span className="text-slate-500 block">مدت اعتبار گارانتی اصالت دیدار:</span>
                      <span className="text-sm font-bold text-emerald-800 mt-1 block">{passport.warrantyValidUntilFa}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <User className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800">مالکیت نهایی ثبت نشده است</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    این قطعه در حال حاضر در اختیار بنکداری یا ویترین گالری همکار است و هنوز به مصرف‌کننده نهایی فروخته نشده است.
                  </p>
                  <button
                    onClick={() => onTransferOwnership(passport)}
                    className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm inline-flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    ثبت فروش و صدور سند مالکیت خریدار
                  </button>
                </div>
              )}

              {/* Anti-Theft Protection Center */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      سامانه ضدسرقت و پایش سراسری اصالت طلا
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      در صورت مفقودی، سرقت یا دعاوی حقوقی، امکان درج پرچم هشدار در تمام پایانه‌های طلافروشان کشور وجود دارد.
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleStolen(passport)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      passport.isStolenReported
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {passport.isStolenReported ? 'رفع پرچم سرقت' : 'ثبت اعلام سرقت یا مفقودی'}
                  </button>
                </div>

                {passport.isStolenReported && (
                  <div className="mt-4 p-3 bg-rose-100/70 border border-rose-300 rounded-xl text-xs text-rose-900">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      این قطعه در لیست سیاه اصالت طلا قرار دارد
                    </div>
                    <div className="mt-1 text-slate-700">تاریخ اعلام: {passport.stolenReportDateFa}</div>
                    <div className="mt-0.5 text-slate-700">علت: {passport.stolenReportReason}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-mono">
            چک‌سام امنیتی: {passport.cryptographicHash.slice(0, 20)}...
          </div>
          <div className="flex items-center gap-2">
            {!passport.currentOwnerName && (
              <button
                onClick={() => onTransferOwnership(passport)}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                ثبت انتقال مالکیت
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
