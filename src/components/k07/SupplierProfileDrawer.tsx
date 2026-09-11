/**
 * Didar Gold Platform - Domain K07
 * Supplier Profile Drawer & Full Lifecycle Dossier
 */

import React, { useState } from 'react';
import {
  X,
  Building2,
  Scale,
  ShieldCheck,
  Award,
  Clock,
  FileText,
  MapPin,
  Phone,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Sliders,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import {
  SupplierPartnership,
  PartnershipAgreement,
  SupplierCollateral,
  QualityAuditRecord,
  PartnershipStatus
} from '../../types/k07.js';

interface SupplierProfileDrawerProps {
  supplier: SupplierPartnership | null;
  agreements: PartnershipAgreement[];
  collaterals: SupplierCollateral[];
  audits: QualityAuditRecord[];
  onClose: () => void;
  onChangeStatus: (id: string, status: PartnershipStatus, reason: string) => Promise<void>;
  onAdjustConsignmentLimit: (id: string, limitGrams: number) => Promise<void>;
  onVerifyCollateral: (
    id: string,
    verificationStatus: 'verified' | 'pending_inquiry' | 'rejected',
    notes: string
  ) => Promise<void>;
  onOpenNewContract: (supplierId: string) => void;
  onOpenAddCollateral: (supplierId: string) => void;
  onOpenRecordAudit: (supplierId: string) => void;
}

export const SupplierProfileDrawer: React.FC<SupplierProfileDrawerProps> = ({
  supplier,
  agreements,
  collaterals,
  audits,
  onClose,
  onChangeStatus,
  onAdjustConsignmentLimit,
  onVerifyCollateral,
  onOpenNewContract,
  onOpenAddCollateral,
  onOpenRecordAudit
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'agreements' | 'collateral' | 'audits'>('overview');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<PartnershipStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [newLimitGrams, setNewLimitGrams] = useState(supplier?.totalConsignmentLimitGrams || 10000);
  const [actionLoading, setActionLoading] = useState(false);

  if (!supplier) return null;

  const supplierAgreements = agreements.filter((a) => a.supplierId === supplier.id);
  const supplierCollaterals = collaterals.filter((c) => c.supplierId === supplier.id);
  const supplierAudits = audits.filter((a) => a.supplierId === supplier.id);

  const utilizationPercent =
    supplier.totalConsignmentLimitGrams > 0
      ? Math.round(
          (supplier.currentConsignmentUtilizedGrams / supplier.totalConsignmentLimitGrams) * 100
        )
      : 0;

  const coverageRatio =
    supplier.currentConsignmentUtilizedGrams > 0
      ? Math.round(
          (supplier.collateralTotalGoldGrams / supplier.currentConsignmentUtilizedGrams) * 100
        )
      : 200;

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await onChangeStatus(supplier.id, newStatus, statusReason || 'به‌روزرسانی توسط مدیر سامانه');
      setShowStatusModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLimitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await onAdjustConsignmentLimit(supplier.id, Number(newLimitGrams));
      setShowLimitModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="bg-[#151520] border-r border-[#262638] w-full max-w-3xl h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-[#232334] bg-[#12121C]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C8A951]/20 border border-[#C8A951]/40 text-[#E5C365] flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">{supplier.nameFa}</h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C1C2A] text-[#8E8E9F] border border-[#2B2B3C]">
                    {supplier.supplierCode}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#E5C365] font-semibold">{supplier.commercialBrandFa}</span>
                  <span className="text-[#555566]">•</span>
                  <span className="text-[11px] text-[#8E8E9F]">{supplier.supplierTypeFa}</span>
                  <span className="text-[#555566]">•</span>
                  <span className="text-[11px] font-mono text-[#C8A951]">کد انگ: {supplier.hallmarkCode}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-[#8E8E9F] hover:text-white p-2 rounded-xl hover:bg-[#1F1F2E] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Badges & Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#232334]">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  supplier.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : supplier.status === 'under_evaluation'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : supplier.status === 'on_probation'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {supplier.statusFa}
              </span>

              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  supplier.grade === 'A_PLUS'
                    ? 'bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40'
                    : supplier.grade === 'A'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-[#2A2A3C] text-[#8E8E9F] border border-[#3A3A4F]'
                }`}
              >
                {supplier.gradeFa}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setNewStatus(supplier.status);
                  setStatusReason('');
                  setShowStatusModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1C1C2A] hover:bg-[#252538] border border-[#2F2F44] text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#C8A951]" />
                <span>تغییر وضعیت</span>
              </button>

              <button
                onClick={() => {
                  setNewLimitGrams(supplier.totalConsignmentLimitGrams);
                  setShowLimitModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#1C1C2A] hover:bg-[#252538] border border-[#2F2F44] text-[11px] font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-[#C8A951]" />
                <span>تنظیم سقف طلا</span>
              </button>
            </div>
          </div>

          {/* Consignment Gold Gauge Bar */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#161624] border border-[#26263A] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-white font-semibold">
                <Scale className="w-4 h-4 text-[#C8A951]" />
                <span>موازنه طلای امانی کارگاهی:</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[#8E8E9F]">
                  تحویل‌شده: <strong className="text-white font-mono">{supplier.currentConsignmentUtilizedGrams.toLocaleString('fa-IR')} گرم</strong>
                </span>
                <span className="text-[#555566]">/</span>
                <span className="text-[#8E8E9F]">
                  سقف مجاز: <strong className="text-[#E5C365] font-mono">{supplier.totalConsignmentLimitGrams.toLocaleString('fa-IR')} گرم</strong>
                </span>
                <span className="text-[#555566]">/</span>
                <span className="text-emerald-400">
                  مانده آزاد: <strong className="font-mono">{supplier.availableConsignmentGrams.toLocaleString('fa-IR')} گرم</strong>
                </span>
              </div>
            </div>

            <div className="w-full bg-[#202030] h-2.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all ${
                  utilizationPercent > 90
                    ? 'bg-red-500'
                    : utilizationPercent > 75
                    ? 'bg-amber-400'
                    : 'bg-[#C8A951]'
                }`}
                style={{ width: `${Math.min(100, utilizationPercent)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-[#6E6E82]">
              <span>میزان بهره‌برداری از سقف طلا: {utilizationPercent}٪</span>
              <span className="text-emerald-400">
                نسبت پوشش وثایق طلا: {coverageRatio}٪ (حفاظت کامل)
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#232334] bg-[#12121C] px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#8E8E9F] hover:text-white'
            }`}
          >
            مشخصات کارگاه و شاخص‌ها
          </button>
          <button
            onClick={() => setActiveTab('agreements')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'agreements'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#8E8E9F] hover:text-white'
            }`}
          >
            <span>قراردادهای امانی</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1E1E2E] text-[#8E8E9F]">
              {supplierAgreements.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('collateral')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'collateral'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#8E8E9F] hover:text-white'
            }`}
          >
            <span>وثایق و چک‌های صیادی</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1E1E2E] text-[#8E8E9F]">
              {supplierCollaterals.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'audits'
                ? 'border-[#C8A951] text-[#E5C365]'
                : 'border-transparent text-[#8E8E9F] hover:text-white'
            }`}
          >
            <span>کارنامه ممیزی و کیفیت</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1E1E2E] text-[#8E8E9F]">
              {supplierAudits.length}
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Performance Scorecard KPI */}
              <div className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C8A951]" />
                  <span>شاخص‌های کلیدی عملکرد ساخت و ری‌گیری (KPI Scorecard)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">تحویل به‌موقع (On-Time)</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {supplier.kpi.onTimeDeliveryRate}٪
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">قبولی بازرسی اول (QC First Pass)</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {supplier.kpi.qcFirstPassRate}٪
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">مغایرت عیار در ری‌گیری</span>
                    <span className="text-base font-bold font-mono text-sky-400">
                      {supplier.kpi.assayDiscrepancyPpm} در هزار
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">کسر بار مجاز کارگاهی</span>
                    <span className="text-base font-bold font-mono text-[#E5C365]">
                      {supplier.kpi.allowableMeltLossPercent}٪
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">میانگین اجرت ساخت</span>
                    <span className="text-xs font-bold font-mono text-white">
                      {supplier.kpi.averageMakingChargePerGramToman.toLocaleString('fa-IR')} ت/گرم
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11111A] border border-[#232332]">
                    <span className="text-[10px] text-[#8E8E9F] block mb-1">امتیاز عملکرد کلی</span>
                    <span className="text-base font-bold font-mono text-[#C8A951]">
                      {supplier.kpi.overallRating} از ۱۰۰
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal & Business Registry Info */}
              <div className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C8A951]" />
                  <span>مشخصات صنفی، پروانه‌ها و شناسنامه قانونی</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">مدیرعامل / صاحب امتیاز:</span>
                    <span className="text-white font-medium">{supplier.managerName}</span>
                    <span className="text-[10px] font-mono text-[#6E6E82] mr-2">
                      (کد ملی: {supplier.managerNationalCodeMasked})
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">پروانه کسب اتحادیه طلا:</span>
                    <span className="text-white font-medium">{supplier.unionLicenseNo || 'ثبت در دست اقدام'}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">شناسه سامانه جامع تجارت (NTSW):</span>
                    <span className="text-white font-mono">{supplier.tradeSystemId || 'عدم ثبت'}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">کد انگ رسمی در آزمایشگاه‌های ری‌گیری:</span>
                    <span className="text-[#E5C365] font-mono font-bold">{supplier.hallmarkCode}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#8E8E9F] block mb-0.5">نشانی کارگاه:</span>
                    <span className="text-white">
                      {supplier.provinceFa}، {supplier.cityFa} - {supplier.addressFa}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">تلفن تماس:</span>
                    <span className="text-white font-mono">{supplier.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#8E8E9F] block mb-0.5">تاریخ آخرین ممیزی:</span>
                    <span className="text-white font-mono">{supplier.lastAuditDateFa}</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-2">
                <h3 className="text-xs font-bold text-white">تخصص‌ها و حوزه‌های ساخت</h3>
                <div className="flex flex-wrap gap-2">
                  {supplier.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-[#1F1F2F] border border-[#2E2E40] text-xs text-[#E5C365]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {supplier.notes && (
                <div className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-2">
                  <h3 className="text-xs font-bold text-white">یادداشت‌های پرونده کارگاه</h3>
                  <p className="text-xs text-[#A2A2B5] whitespace-pre-line leading-relaxed">
                    {supplier.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AGREEMENTS */}
          {activeTab === 'agreements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">قراردادهای امانی و همکاری با دیدار</h3>
                <button
                  onClick={() => onOpenNewContract(supplier.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#C8A951] hover:bg-[#D9B961] text-xs font-bold text-[#141416] flex items-center gap-1.5 transition-all shadow-md shadow-[#C8A951]/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>انعقاد قرارداد جدید</span>
                </button>
              </div>

              {supplierAgreements.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161624] border border-[#26263A] text-xs text-[#8E8E9F]">
                  هنوز قراردادی برای این کارگاه به ثبت نرسیده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierAgreements.map((agr) => (
                    <div
                      key={agr.id}
                      className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{agr.titleFa}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11111A] text-[#8E8E9F] border border-[#232332]">
                              {agr.agreementNumber}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#E5C365] mt-0.5 block">
                            {agr.agreementTypeFa}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            agr.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {agr.statusFa}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">سقف طلای امانی:</span>
                          <span className="text-white font-mono font-bold">
                            {agr.consignmentLimitGrams.toLocaleString('fa-IR')} گرم
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">حداکثر مهلت تحویل:</span>
                          <span className="text-white font-mono font-bold">{agr.maxDeliveryLeadDays} روز</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">کسر بار مجاز:</span>
                          <span className="text-white font-mono font-bold">{agr.allowableKasriPercent}٪</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">مهلت تسویه طلا:</span>
                          <span className="text-white font-mono font-bold">{agr.settlementWindowDays} روز</span>
                        </div>
                      </div>

                      <div className="text-xs bg-[#11111A] p-2.5 rounded-lg text-[#8E8E9F]">
                        <span className="text-white font-semibold block mb-1">فرمول اجرت ساخت:</span>
                        <span>{agr.makingChargeFormulaFa}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#6E6E82] pt-1">
                        <span>دوره اعتبار: {agr.startDateFa} الی {agr.endDateFa}</span>
                        <span>امضا: {agr.signedBySupplierName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COLLATERAL */}
          {activeTab === 'collateral' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white">وثایق و تضامین زرگری در اختیار پلتفرم</h3>
                  <p className="text-[10px] text-[#8E8E9F]">
                    ارزش کل تضامین: {supplier.collateralTotalEquivalentToman.toLocaleString('fa-IR')} تومان ({supplier.collateralTotalGoldGrams.toLocaleString('fa-IR')} گرم طلا)
                  </p>
                </div>
                <button
                  onClick={() => onOpenAddCollateral(supplier.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#C8A951] hover:bg-[#D9B961] text-xs font-bold text-[#141416] flex items-center gap-1.5 transition-all shadow-md shadow-[#C8A951]/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ثبت وثیقه جدید</span>
                </button>
              </div>

              {supplierCollaterals.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161624] border border-[#26263A] text-xs text-[#8E8E9F]">
                  وثیقه‌ای در این پرونده ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierCollaterals.map((col) => (
                    <div
                      key={col.id}
                      className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-bold text-white">{col.titleFa}</span>
                          <span className="text-[11px] text-[#E5C365] block mt-0.5">
                            {col.collateralTypeFa}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            col.verificationStatus === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : col.verificationStatus === 'rejected'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {col.verificationStatusFa}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">ارزش اسمی ریالی:</span>
                          <span className="text-white font-mono font-bold">
                            {col.nominalValueToman.toLocaleString('fa-IR')} تومان
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">معادل وزنی طلا:</span>
                          <span className="text-[#E5C365] font-mono font-bold">
                            {col.equivalentGoldGrams.toLocaleString('fa-IR')} گرم
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#11111A]">
                          <span className="text-[#8E8E9F] block text-[9px]">مرجع صدور / خزانه:</span>
                          <span className="text-white truncate block">{col.issuingBankOrNotaryFa}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#8E8E9F]">
                        <span>شناسه پیگیری / صیاد: <strong className="font-mono text-white">{col.trackingReferenceNumber}</strong></span>
                        <span>سررسید: <strong className="font-mono text-white">{col.expiryDateFa}</strong></span>
                      </div>

                      {col.notes && (
                        <p className="text-[11px] text-[#A0A0B5] bg-[#11111A] p-2 rounded-lg">
                          {col.notes}
                        </p>
                      )}

                      {/* Verification actions */}
                      {col.verificationStatus !== 'verified' && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232332]">
                          <button
                            onClick={() =>
                              onVerifyCollateral(col.id, 'verified', 'استعلام بانکی و صحت فیزیکی تأیید شد.')
                            }
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            تأیید صحت استعلام
                          </button>
                          <button
                            onClick={() =>
                              onVerifyCollateral(col.id, 'rejected', 'عدم انطباق یا برگشت در استعلام.')
                            }
                            className="px-3 py-1 bg-red-600/80 hover:bg-red-500 text-white rounded-lg text-[10px] font-bold"
                          >
                            رد صلاحیت وثیقه
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUDITS */}
          {activeTab === 'audits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">سوابق ممیزی کیفی و نظارت بر ری‌گیری</h3>
                <button
                  onClick={() => onOpenRecordAudit(supplier.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#C8A951] hover:bg-[#D9B961] text-xs font-bold text-[#141416] flex items-center gap-1.5 transition-all shadow-md shadow-[#C8A951]/20"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>ثبت ممیزی جدید</span>
                </button>
              </div>

              {supplierAudits.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[#161624] border border-[#26263A] text-xs text-[#8E8E9F]">
                  هنوز ممیزی ثبت‌شده‌ای برای این کارگاه وجود ندارد.
                </div>
              ) : (
                <div className="space-y-3">
                  {supplierAudits.map((aud) => (
                    <div
                      key={aud.id}
                      className="p-4 rounded-xl bg-[#161624] border border-[#26263A] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                              aud.score >= 95
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : aud.score >= 90
                                ? 'bg-[#C8A951]/20 text-[#E5C365]'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            امتیاز: {aud.score} از ۱۰۰
                          </span>
                          <span className="text-xs text-white font-medium">{aud.statusFa}</span>
                        </div>
                        <span className="text-[10px] font-mono text-[#8E8E9F]">{aud.auditDateFa}</span>
                      </div>

                      <p className="text-xs text-[#D5D5E5] bg-[#11111A] p-2.5 rounded-lg leading-relaxed">
                        <strong className="text-[#8E8E9F] block text-[10px] mb-1">یافته‌های کارشناسی و آزمون ری‌گیری:</strong>
                        {aud.findingsFa}
                      </p>

                      {aud.recommendationsFa && (
                        <p className="text-[11px] text-[#A0A0B5]">
                          <strong className="text-[#8E8E9F]">توصیه‌ها: </strong>
                          {aud.recommendationsFa}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[#6E6E82] pt-1 border-t border-[#232332]">
                        <span>سرارزیاب: {aud.auditorName}</span>
                        <span>ممیزی بعدی: {aud.nextAuditDateFa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Change Modal Dialog */}
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-[#1C1C2A] border border-[#33334A] rounded-2xl w-full max-w-md p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">تغییر وضعیت شراکت کارگاه</h4>
              <form onSubmit={handleStatusSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E8E9F] mb-1">وضعیت جدید</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as PartnershipStatus)}
                    className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                  >
                    <option value="active">فعال و معتبر (Active)</option>
                    <option value="on_probation">تحت پایش و نظارت مشروط (On Probation)</option>
                    <option value="suspended">معلق‌شده موقت (Suspended)</option>
                    <option value="terminated">خاتمه‌یافته / فسخ (Terminated)</option>
                    <option value="under_evaluation">در حال ارزیابی اولیه (Under Evaluation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8E8E9F] mb-1">دلیل تغییر وضعیت</label>
                  <textarea
                    rows={2}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="علت تمدید، اخطار یا تعلیق سهمیه..."
                    className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-3 py-1.5 text-xs text-[#8E8E9F]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-[#C8A951] text-[#141416] text-xs font-bold rounded-xl"
                  >
                    ثبت تغییر وضعیت
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Consignment Limit Modal Dialog */}
        {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="bg-[#1C1C2A] border border-[#33334A] rounded-2xl w-full max-w-md p-5 space-y-4">
              <h4 className="text-sm font-bold text-white">تنظیم سقف طلای امانی کارگاه</h4>
              <form onSubmit={handleLimitSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs text-[#8E8E9F] mb-1">سقف جدید طلای امانی (گرم)</label>
                  <input
                    type="number"
                    value={newLimitGrams}
                    onChange={(e) => setNewLimitGrams(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#12121A] border border-[#2B2B3C] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                    required
                  />
                  <span className="text-[10px] text-[#8E8E9F] mt-1 block">
                    میزان طلای فعلی در گردش کارگاه: {supplier.currentConsignmentUtilizedGrams.toLocaleString('fa-IR')} گرم
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(false)}
                    className="px-3 py-1.5 text-xs text-[#8E8E9F]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-1.5 bg-[#C8A951] text-[#141416] text-xs font-bold rounded-xl"
                  >
                    اعمال سقف جدید
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
