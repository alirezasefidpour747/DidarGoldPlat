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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          اعلام سرقت در شبکه سراسری
        </span>
      );
    }
    switch (passport.status) {
      case 'in_vault':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            موجود در خزانه مرکزی دیدار
          </span>
        );
      case 'retail_inventory':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#F5A623]/15 text-[#F5A623] border border-[#F5A623]/30">
            <Building2 className="w-3.5 h-3.5" />
            موجود در ویترین گالری همکار
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Radio className="w-3.5 h-3.5" />
            در حال حمل ایمن مکانیزه
          </span>
        );
      case 'sold_active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تحویل به خریدار (شناسنامه فعال)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-[#191926] text-[#A0A0B5] border border-[#28283C]">
            {passport.statusFa}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl bg-[#161622] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151520] border-b border-[#28283C]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#C8A951]/15 text-[#E5C365] flex items-center justify-center font-mono font-bold border border-[#C8A951]/40 shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-white">
                  {passport.itemNature === 'melted_gold' ? 'شناسنامه رسمی طلای آبشده و شمش' : 'گذرنامه دیجیتال مصنوع طلا'}
                </h3>
                {passport.itemNature === 'melted_gold' && (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/30">
                    طلای آبشده
                  </span>
                )}
                {getStatusBadge()}
              </div>
              <p className="text-xs text-[#A0A0B5] font-mono mt-0.5 dir-ltr text-right">
                UID: <span className="font-semibold text-white">{passport.uid}</span> | سریال: {passport.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              title="چاپ شناسنامه رسمی"
              className="p-2 text-[#A0A0B5] hover:text-white hover:bg-[#222234] rounded-lg transition-colors border border-[#28283C]"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#A0A0B5] hover:text-white hover:bg-[#222234] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#28283C] bg-[#191926] px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('certificate')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'certificate'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#161622] rounded-t-lg'
                : 'border-transparent text-[#A0A0B5] hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-[#C8A951]" />
            گواهی رسمی اصالت
          </button>
          <button
            onClick={() => setActiveTab('assay_qc')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'assay_qc'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#161622] rounded-t-lg'
                : 'border-transparent text-[#A0A0B5] hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-400" />
            سنجش ری‌گیری، عیار و QC
          </button>
          <button
            onClick={() => setActiveTab('provenance')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'provenance'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#161622] rounded-t-lg'
                : 'border-transparent text-[#A0A0B5] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-purple-400" />
            زنجیره تغییرناپذیر اصالت ({passportEvents.length} رویداد)
          </button>
          <button
            onClick={() => setActiveTab('ownership')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'ownership'
                ? 'border-[#C8A951] text-[#E5C365] bg-[#161622] rounded-t-lg'
                : 'border-transparent text-[#A0A0B5] hover:text-white'
            }`}
          >
            <User className="w-4 h-4 text-emerald-400" />
            سند مالکیت و گارانتی
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: OFFICIAL LUXURY CERTIFICATE */}
          {activeTab === 'certificate' && (
            <div className="space-y-6">
              {/* Luxury Passport Certificate Card */}
              <div className="relative rounded-2xl p-6 bg-[#191926] border-2 border-[#C8A951]/40 shadow-xl">
                <div className="absolute top-4 left-4 flex flex-col items-center gap-1">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-sm border border-amber-200 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-900" />
                  </div>
                  <span className="text-[10px] font-mono text-[#A0A0B5]">کد استعلام سریع</span>
                </div>

                <div className="flex items-center gap-2 text-[#E5C365] font-semibold text-xs tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-[#C8A951]" />
                  DIDAR GOLD PHYSICAL-DIGITAL PASSPORT
                </div>

                <h4 className="text-xl font-bold text-white leading-snug">
                  {passport.productTitleFa}
                </h4>
                <p className="text-sm text-[#A0A0B5] mt-1">
                  مدل پایه: <span className="font-semibold text-white">{passport.productSkuCode}</span> | مشخصات تنوع: {passport.sizeLabelFa}
                </p>

                {/* Key Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-md">
                    <span className="text-xs text-[#A0A0B5] block">وزن دقیق ترازو (سنجش تحلیلی)</span>
                    <span className="text-lg font-bold text-white font-mono mt-1 block">
                      {Number(passport.actualScaleWeightGrams || 0).toLocaleString('fa-IR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                      <span className="text-xs font-normal text-[#A0A0B5]">گرم</span>
                    </span>
                    <span className="text-[10px] text-[#A0A0B5] block">
                      {passport.skuWeightRangeFa ? (
                        <span className="text-[#E5C365] font-medium">رنج مجاز کاتالوگ: {passport.skuWeightRangeFa}</span>
                      ) : (
                        <span>اسمی: {Number(passport.nominalWeightGrams || 0).toFixed(3)}g</span>
                      )}
                    </span>
                  </div>

                  <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-md">
                    <span className="text-xs text-[#A0A0B5] block">عیار قطعی ری‌گیری</span>
                    <span className="text-lg font-bold text-[#E5C365] font-mono mt-1 block">
                      {passport.certifiedFineness}{' '}
                      <span className="text-xs font-normal text-[#A0A0B5]">/ ۱۰۰۰</span>
                    </span>
                    <span className="text-[10px] text-[#3DD68C] font-medium">استاندارد ۷۵۰ ملی ایران</span>
                  </div>

                  <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-md">
                    <span className="text-xs text-[#A0A0B5] block">کد انگ رسمی آزمایشگاه</span>
                    <span className="text-base font-bold text-white font-mono mt-1 block">
                      {passport.hallmarkCode}
                    </span>
                    <span className="text-[10px] text-[#A0A0B5]">{passport.assayLabName.split(' ')[2] || 'زرفام'}</span>
                  </div>

                  <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-md">
                    <span className="text-xs text-[#A0A0B5] block">شناسه تراشه رمزنگاری NFC</span>
                    <span className="text-xs font-bold text-white font-mono mt-1.5 block dir-ltr text-right">
                      {passport.nfcTagUid}
                    </span>
                    <span className="text-[10px] text-purple-400">تگ ضدسرقت غیرقابل کپی</span>
                  </div>
                </div>

                {/* Laser Marking & Security Badge */}
                <div className="mt-5 pt-4 border-t border-[#28283C] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[#EDEDED]">
                      حکاکی لیزری فیبر روی قطعه:{' '}
                      <span className="font-mono font-bold text-[#E5C365] bg-[#161622] px-2 py-0.5 rounded border border-[#2E2E44]">
                        {passport.laserEngravingText}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#A0A0B5] font-mono text-[11px]">
                    <Lock className="w-3.5 h-3.5 text-[#3DD68C]" />
                    <span>مهر دیجیتال SHA-256 تأییدشده دیدار</span>
                  </div>
                </div>
              </div>

              {/* Quick Status and Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#191926] rounded-xl border border-[#28283C]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#A0A0B5] mb-2">
                    <MapPin className="w-4 h-4 text-[#C8A951]" />
                    موقعیت فیزیکی و متصدی فعلی
                  </div>
                  <div className="text-sm font-bold text-white">{passport.currentHolderName}</div>
                  <div className="text-xs text-[#A0A0B5] mt-1">شهر / محدوده: {passport.locationCityFa}</div>
                </div>

                <div className="p-4 bg-[#191926] rounded-xl border border-[#28283C]">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#A0A0B5] mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
                    وضعیت اصالت و ضمانت
                  </div>
                  <div className="text-sm font-bold text-white">
                    {passport.isStolenReported ? (
                      <span className="text-[#FF6B6B]">مسدود در شبکه به عنوان مفقودی</span>
                    ) : (
                      <span className="text-[#3DD68C]">تأییدشده و دارای پوشش بیمه امانت و اصالت</span>
                    )}
                  </div>
                  <div className="text-xs text-[#A0A0B5] mt-1">
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
              <div className="p-5 bg-[#191926] rounded-xl border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">گواهی‌نامه رسمی آزمایشگاه ری‌گیری (Assay Certificate)</h4>
                      <p className="text-xs text-[#A0A0B5]">سنجش رسمی خلوص طلا مطابق با استاندارد ISIRI 213</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold">
                    {passport.certifiedFineness} ‰ Fineness
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#A0A0B5] block">نام آزمایشگاه ری‌گیری:</span>
                    <span className="font-semibold text-white mt-0.5 block">{passport.assayLabName}</span>
                    <span className="text-[11px] text-[#828299]">{passport.assayUnionPermitNo}</span>
                  </div>
                  <div>
                    <span className="text-[#A0A0B5] block">کد پاکت ری‌گیری:</span>
                    <span className="font-semibold text-white font-mono mt-0.5 block">{passport.assayPacketCode}</span>
                    <span className="text-[11px] text-[#828299]">تاریخ سنجش: {passport.assayCertifiedDateFa}</span>
                  </div>
                  <div>
                    <span className="text-[#A0A0B5] block">متد سنجش و کارشناس:</span>
                    <span className="font-semibold text-white mt-0.5 block">{passport.assayMethodFa}</span>
                    <span className="text-[11px] text-[#828299]">ری‌گیر: {passport.inspectorName}</span>
                  </div>
                </div>
              </div>

              {/* Analytical Scale & Calibrated Measurement */}
              <div className="p-5 bg-[#191926] rounded-xl border border-[#28283C]">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-[#C8A951]" />
                  راستی‌آزمایی ترازوی دیجیتال تحلیلی
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-[#161622] p-3 rounded-lg border border-[#28283C]">
                    <span className="text-[#A0A0B5]">رنج استاندارد SKU در K05:</span>
                    <div className="font-mono font-bold text-[#E5C365] mt-1">
                      {passport.skuWeightRangeFa || `${Number(passport.nominalWeightGrams || 0).toFixed(2)} گرم`}
                    </div>
                  </div>
                  <div className="bg-[#161622] p-3 rounded-lg border border-[#28283C]">
                    <span className="text-[#A0A0B5]">مدل ترازوی توزین:</span>
                    <div className="font-medium text-white mt-1">{passport.scaleModel}</div>
                  </div>
                  <div className="bg-[#161622] p-3 rounded-lg border border-[#28283C]">
                    <span className="text-[#A0A0B5]">تاریخ کالیبراسیون رسمی:</span>
                    <div className="font-medium text-white mt-1">{passport.scaleCalibrationDateFa}</div>
                  </div>
                  <div className="bg-[#161622] p-3 rounded-lg border border-[#28283C]">
                    <span className="text-[#A0A0B5]">دلتای توزین با میانگین:</span>
                    <div className="font-mono font-bold text-white mt-1">
                      {passport.weightDeltaGrams > 0 ? `+${passport.weightDeltaGrams}` : passport.weightDeltaGrams} گرم
                    </div>
                  </div>
                </div>
              </div>

              {/* QC Macro Photo Inspection Evidence */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#C8A951]" />
                  شواهد تصویری میکروسکوپی کنترل کیفیت (QC Macro Evidence)
                </h4>

                {passport.macroPhotos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-3">
                      <div className="rounded-xl overflow-hidden border border-[#28283C] bg-[#161622] flex items-center justify-center relative min-h-[220px]">
                        {selectedPhoto && (
                          <img
                            src={selectedPhoto}
                            alt="Macro evidence"
                            className="max-h-[300px] w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-md text-xs font-mono flex items-center gap-2">
                          <span>
                            {passport.macroPhotos.find((p) => p.url === selectedPhoto)?.titleFa || 'شاهد ماکرو'}
                          </span>
                          <span className="text-[#E5C365] font-bold">
                            ({passport.macroPhotos.find((p) => p.url === selectedPhoto)?.magnification || '50X'})
                          </span>
                        </div>
                      </div>

                      {/* נوار جابجایی بین چندین تصویر ماکرو */}
                      {passport.macroPhotos.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {passport.macroPhotos.map((item, idx) => (
                            <button
                              key={item.id || idx}
                              type="button"
                              onClick={() => setSelectedPhoto(item.url)}
                              className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                                selectedPhoto === item.url
                                  ? 'border-[#C8A951] shadow-md ring-2 ring-[#C8A951]/40 scale-105'
                                  : 'border-[#28283C] opacity-70 hover:opacity-100'
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
                      <div className="p-3 bg-[#191926] rounded-xl border border-[#28283C] text-xs">
                        <span className="text-[#A0A0B5] block">امتیاز کنترل کیفیت:</span>
                        <div className="text-lg font-bold text-[#3DD68C] font-mono mt-0.5">{passport.qcScore} / ۱۰۰</div>
                        <div className="text-[#A0A0B5] text-[11px] mt-1">بازرس: {passport.qcInspectorName}</div>
                      </div>

                      <div className="p-3 bg-[#191926] rounded-xl border border-[#28283C] text-xs">
                        <span className="text-[#A0A0B5] block">وضعیت سطح و تخلخل:</span>
                        <div className="font-semibold text-white mt-0.5">{passport.surfaceFinishGradeFa}</div>
                        <div className="text-[#A0A0B5] text-[11px] mt-1">{passport.porosityCheckFa}</div>
                      </div>

                      {passport.qcNotes && (
                        <div className="p-3 bg-[#C8A951]/10 rounded-xl border border-[#C8A951]/30 text-xs text-[#E5C365]">
                          <span className="font-semibold block mb-0.5">یادداشت فنی بازرس:</span>
                          {passport.qcNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-[#A0A0B5] bg-[#191926] rounded-xl text-xs border border-[#28283C]">
                    شاهد تصویری ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: IMMUTABLE PROVENANCE TIMELINE */}
          {activeTab === 'provenance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#28283C]">
                <div>
                  <h4 className="text-sm font-bold text-white">دفتر کل زنجیره اصالت و انتقال مالکیت</h4>
                  <p className="text-xs text-[#A0A0B5]">تمام رویدادهای فیزیکی، ری‌گیری و واگذاری به صورت تغییرناپذیر ثبت شده است.</p>
                </div>
                <button
                  onClick={() => onRecordEvent(passport)}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#C8A951] text-[#141416] hover:bg-[#D9B961] rounded-lg transition-colors flex items-center gap-1.5 font-bold"
                >
                  <Clock className="w-3.5 h-3.5" />
                  ثبت رویداد جدید در زنجیره
                </button>
              </div>

              {passportEvents.length === 0 ? (
                <div className="text-center py-8 text-[#A0A0B5] text-xs">
                  هیچ واقعه‌ای برای این قطعه ثبت نشده است.
                </div>
              ) : (
                <div className="relative border-r-2 border-[#28283C] pr-6 mr-3 space-y-6">
                  {passportEvents.map((evt) => (
                    <div key={evt.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-[#161622] border-2 border-[#C8A951] group-hover:scale-125 transition-transform" />

                      <div className="bg-[#191926] hover:bg-[#1E1E2F] p-4 rounded-xl border border-[#28283C] transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-bold text-[#E5C365] bg-[#C8A951]/15 border border-[#C8A951]/30 px-2 py-0.5 rounded">
                            {evt.eventTypeFa}
                          </span>
                          <span className="text-[11px] text-[#A0A0B5] font-mono">{evt.timestampFa}</span>
                        </div>

                        <h5 className="text-sm font-bold text-white mb-1">{evt.titleFa}</h5>
                        <p className="text-xs text-[#A0A0B5] leading-relaxed">{evt.descriptionFa}</p>

                        <div className="mt-3 pt-2.5 border-t border-[#242436] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A0A0B5]">
                          <div>
                            متصدی:{' '}
                            <span className="font-semibold text-white">
                              {evt.actorName} ({evt.actorRoleFa})
                            </span>
                          </div>
                          <div>
                            موقعیت: <span className="font-medium text-white">{evt.locationFa}</span>
                          </div>
                          <div className="font-mono text-[10px] text-[#828299] dir-ltr">
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
                <div className="p-6 bg-[#191926] rounded-2xl border border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">سند فعال مالکیت مصرف‌کننده</h4>
                      <p className="text-xs text-[#3DD68C]">این قطعه به صورت رسمی به نام خریدار حقیقی فعال شده است.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-4">
                    <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-sm">
                      <span className="text-[#A0A0B5] block">نام کامل مالک:</span>
                      <span className="text-sm font-bold text-white mt-1 block">{passport.currentOwnerName}</span>
                    </div>

                    <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-sm">
                      <span className="text-[#A0A0B5] block">کد ملی خریدار (ماسک‌شده):</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">{passport.ownerNationalCodeMasked}</span>
                    </div>

                    <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-sm">
                      <span className="text-[#A0A0B5] block">شماره فاکتور رسمی فروش:</span>
                      <span className="text-sm font-bold font-mono text-white mt-1 block">{passport.retailInvoiceNumber}</span>
                    </div>

                    <div className="bg-[#161622] p-3.5 rounded-xl border border-[#28283C] shadow-sm">
                      <span className="text-[#A0A0B5] block">مدت اعتبار گارانتی اصالت دیدار:</span>
                      <span className="text-sm font-bold text-emerald-400 mt-1 block">{passport.warrantyValidUntilFa}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#191926] rounded-2xl border border-dashed border-[#28283C]">
                  <User className="w-10 h-10 text-[#828299] mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-white">مالکیت نهایی ثبت نشده است</h4>
                  <p className="text-xs text-[#A0A0B5] mt-1 max-w-md mx-auto">
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
              <div className="p-5 rounded-2xl border border-[#28283C] bg-[#191926]">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                      سامانه ضدسرقت و پایش سراسری اصالت طلا
                    </h5>
                    <p className="text-xs text-[#A0A0B5] mt-0.5">
                      در صورت مفقودی، سرقت یا دعاوی حقوقی، امکان درج پرچم هشدار در تمام پایانه‌های طلافروشان کشور وجود دارد.
                    </p>
                  </div>
                  <button
                    onClick={() => onToggleStolen(passport)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      passport.isStolenReported
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-[#E5484D] hover:bg-[#E5484D]/80 text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {passport.isStolenReported ? 'رفع پرچم سرقت' : 'ثبت اعلام سرقت یا مفقودی'}
                  </button>
                </div>

                {passport.isStolenReported && (
                  <div className="mt-4 p-3 bg-[#2A1517] border border-[#E5484D]/40 rounded-xl text-xs text-[#FF8B8B]">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#FF6B6B]" />
                      این قطعه در لیست سیاه اصالت طلا قرار دارد
                    </div>
                    <div className="mt-1 text-[#FFA4A4]">تاریخ اعلام: {passport.stolenReportDateFa}</div>
                    <div className="mt-0.5 text-[#FFA4A4]">علت: {passport.stolenReportReason}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#151520] border-t border-[#28283C]">
          <div className="text-xs text-[#828299] font-mono">
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
              className="px-4 py-2 text-xs font-semibold bg-[#191926] hover:bg-[#252538] text-[#EDEDED] border border-[#28283C] rounded-lg transition-colors"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
