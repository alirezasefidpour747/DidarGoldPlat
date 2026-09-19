/**
 * Didar Gold Platform - Domain K02 Dashboard
 * Progressive Onboarding, Trust & Commercial Entitlements
 */

import React, { useState } from 'react';
import {
  Shield,
  Award,
  Users,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Plus,
  Coins,
  Download,
  RefreshCw,
  Eye,
  BookOpen
} from 'lucide-react';
import {
  K02DataPayload,
  OnboardingApplication,
  CommercialEntitlements,
  TrustTier,
  ChecklistStepKey,
  VerificationCallLog
} from '../../types/k02.js';
import { Party, Organization, Membership } from '../../types/k01.js';
import { OnboardingQueue } from './OnboardingQueue.js';
import { EntitlementsManager } from './EntitlementsManager.js';
import { EffectiveAccessExplorer } from './EffectiveAccessExplorer.js';
import { ApplicationDetailDrawer } from './ApplicationDetailDrawer.js';
import { NewApplicationModal } from './NewApplicationModal.js';
import { TrustTierMatrixModal } from './TrustTierMatrixModal.js';

interface K02DashboardProps {
  k02Data: K02DataPayload;
  persons: Party[];
  organizations: Organization[];
  memberships?: Membership[];
  onRefresh: () => Promise<void>;
  onCreateApplication: (data: Partial<OnboardingApplication>) => Promise<void>;
  onUpdateChecklistStep: (appId: string, stepKey: ChecklistStepKey, completed: boolean, notes?: string) => Promise<void>;
  onLogVerificationCall: (appId: string, callLog: Partial<VerificationCallLog>) => Promise<void>;
  onMakeDecision: (
    appId: string,
    decision: 'approve' | 'reject' | 'needs_amendment' | 'assign',
    details: any
  ) => Promise<void>;
  onUpdateEntitlements: (targetId: string, updates: Partial<CommercialEntitlements>) => Promise<void>;
}

export const K02Dashboard: React.FC<K02DashboardProps> = ({
  k02Data,
  persons,
  organizations,
  memberships = [],
  onRefresh,
  onCreateApplication,
  onUpdateChecklistStep,
  onLogVerificationCall,
  onMakeDecision,
  onUpdateEntitlements
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'entitlements' | 'effective_access'>('queue');
  const [selectedApplication, setSelectedApplication] = useState<OnboardingApplication | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = k02Data.tierStats;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleOpenDetail = (app: OnboardingApplication) => {
    setSelectedApplication(app);
  };

  // Re-sync selected application from k02Data if updated
  const currentApp = selectedApplication
    ? k02Data.applications.find(a => a.id === selectedApplication.id) || selectedApplication
    : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1C1A14] via-[#171720] to-[#14141A] border border-[#342D1C] rounded-2xl p-5 lg:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#997926] p-0.5 shadow-lg shadow-[#C8A951]/20 flex-shrink-0">
              <div className="w-full h-full bg-[#161512] rounded-[10px] flex items-center justify-center text-[#E5C365]">
                <Shield className="w-6 h-6" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#C8A951] text-[#141416] rounded">
                  K02
                </span>
                <span className="text-xs text-[#3DD68C] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>سامانه فعال و برخط</span>
                </span>
                <span className="text-xs text-[#8C8C9C] hidden sm:inline">• گردش کار اعتبارسنجی و استحقاق‌های تجاری</span>
              </div>
              <h1 className="text-lg lg:text-xl font-bold text-white">
                پذیرش تدریجی، اعتماد و دسترسی تجاری طلا
              </h1>
              <p className="text-xs text-[#A8A8B8] mt-1 max-w-2xl leading-relaxed">
                مدیریت کارتابل پرونده‌های صنفی، اعتبارسنجی جواز کسب اتحادیه طلا، ارزیابی میدانی عاملان، و تعیین سقف‌های وزنی و اعتباری K16.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsMatrixModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#222230] hover:bg-[#2E2E40] text-[#E5C365] border border-[#3A3A4C] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>ماتریس سطوح اعتماد</span>
            </button>

            <a
              href="/api/admin/kernel/k02/export?format=csv"
              download
              className="flex items-center gap-1.5 px-3 py-2 bg-[#222230] hover:bg-[#2E2E40] text-[#C5C5D4] border border-[#3A3A4C] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>خروجی اکسل</span>
            </a>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-[#222230] hover:bg-[#2E2E40] text-[#A0A0B0] hover:text-white border border-[#3A3A4C] rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="تازه‌سازی"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C8A951] to-[#E5C365] text-[#141416] rounded-xl text-xs font-bold shadow-md shadow-[#C8A951]/20 hover:opacity-90 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>پرونده پذیرش جدید</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Tiers & Operational Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4">
        {/* Tier 0 */}
        <div className="bg-[#171722] border border-[#262634] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C8C9C] mb-1">
              <span>سطح ۰: مهمان</span>
              <Users className="w-4 h-4 text-[#7A7A88]" />
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.tier0Count}
            </div>
          </div>
          <span className="text-[11px] text-[#7A7A88] mt-2 block">کاتالوگ عمومی، بدون قیمت</span>
        </div>

        {/* Tier 1 */}
        <div className="bg-[#171722] border border-[#262634] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8C8C9C] mb-1">
              <span>سطح ۱: هویت فردی</span>
              <Shield className="w-4 h-4 text-[#3DD68C]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#3DD68C]">
              {stats.tier1Count}
            </div>
          </div>
          <span className="text-[11px] text-[#5E9B6F] mt-2 block">سقف ۵۰ گرم طلا</span>
        </div>

        {/* Tier 2 */}
        <div className="bg-gradient-to-b from-[#1F1C15] to-[#171722] border border-[#3E341B] rounded-xl p-4 flex flex-col justify-between shadow-sm shadow-[#C8A951]/5">
          <div>
            <div className="flex items-center justify-between text-xs text-[#C8A951] mb-1 font-semibold">
              <span>سطح ۲: واحد صنفی</span>
              <Building2 className="w-4 h-4 text-[#C8A951]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#E5C365]">
              {stats.tier2Count}
            </div>
          </div>
          <span className="text-[11px] text-[#A69B82] mt-2 block">سقف ۵۰۰ گرم، بنکداری</span>
        </div>

        {/* Tier 3 */}
        <div className="bg-gradient-to-b from-[#241E14] to-[#181822] border border-[#C8A951]/60 rounded-xl p-4 flex flex-col justify-between shadow-md shadow-[#C8A951]/10">
          <div>
            <div className="flex items-center justify-between text-xs text-[#E5C365] mb-1 font-bold">
              <span>سطح ۳: ممتاز / سازنده</span>
              <Award className="w-4 h-4 text-[#E5C365]" />
            </div>
            <div className="text-xl font-bold font-mono text-[#E5C365]">
              {stats.tier3Count}
            </div>
          </div>
          <span className="text-[11px] text-[#D8BA63] mt-2 block">سقف ۵۰۰۰g + خط امانی K16</span>
        </div>
      </div>

      {/* Review Queue Status Counter Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#14141D] border border-[#222230] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#332A15] border border-[#58461E] flex items-center justify-center text-[#E5C365] flex-shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#8C8C9C] block">در صف کارشناس:</span>
            <span className="text-sm font-bold font-mono text-white">{stats.pendingReviewCount} پرونده</span>
          </div>
        </div>

        <div className="bg-[#14141D] border border-[#222230] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#382218] border border-[#613A24] flex items-center justify-center text-[#F97316] flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#8C8C9C] block">نیازمند اصلاح مدارک:</span>
            <span className="text-sm font-bold font-mono text-[#F97316]">{stats.needsAmendmentCount} پرونده</span>
          </div>
        </div>

        <div className="bg-[#14141D] border border-[#222230] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#14331C] border border-[#235832] flex items-center justify-center text-[#3DD68C] flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#8C8C9C] block">مصوبات این ماه:</span>
            <span className="text-sm font-bold font-mono text-[#3DD68C]">{stats.approvedThisMonth} مصوب</span>
          </div>
        </div>

        <div className="bg-[#14141D] border border-[#222230] rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#242432] border border-[#38384C] flex items-center justify-center text-[#C8A951] flex-shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[#8C8C9C] block">کل پرونده‌ها:</span>
            <span className="text-sm font-bold font-mono text-white">{stats.totalApplications} پرونده</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[#292938]">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'border-[#C8A951] text-[#E5C365]'
              : 'border-transparent text-[#7A7A88] hover:text-[#B5B5C4]'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>کارتابل صف پذیرش (Onboarding Queue)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#242432] text-[#A8A8B8]">
            {k02Data.applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entitlements')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'entitlements'
              ? 'border-[#C8A951] text-[#E5C365]'
              : 'border-transparent text-[#7A7A88] hover:text-[#B5B5C4]'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>مدیریت استحقاق‌ها و حدود تجاری طلا (Commercial Entitlements)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#242432] text-[#A8A8B8]">
            {Object.keys(k02Data.entitlements).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('effective_access')}
          className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'effective_access'
              ? 'border-[#C8A951] text-[#E5C365]'
              : 'border-transparent text-[#7A7A88] hover:text-[#B5B5C4]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>کاوشگر دسترسی مؤثر (Effective Access Engine)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#C8A951]/20 text-[#E5C365]">
            RBAC
          </span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'queue' ? (
        <OnboardingQueue
          applications={k02Data.applications}
          onOpenDetail={handleOpenDetail}
          onOpenCreate={() => setIsNewAppModalOpen(true)}
        />
      ) : activeTab === 'entitlements' ? (
        <EntitlementsManager
          entitlements={k02Data.entitlements}
          tierConfigs={k02Data.tierConfigs}
          onUpdateEntitlements={onUpdateEntitlements}
        />
      ) : (
        <EffectiveAccessExplorer
          persons={persons}
          organizations={organizations}
          memberships={memberships}
        />
      )}

      {/* Application Detail Drawer */}
      <ApplicationDetailDrawer
        application={currentApp}
        onClose={() => setSelectedApplication(null)}
        tierConfigs={k02Data.tierConfigs}
        onUpdateChecklistStep={onUpdateChecklistStep}
        onLogVerificationCall={onLogVerificationCall}
        onMakeDecision={onMakeDecision}
      />

      {/* New Application Modal */}
      <NewApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        onSubmit={onCreateApplication}
        persons={persons}
        organizations={organizations}
      />

      {/* Trust Tier Matrix Guide Modal */}
      <TrustTierMatrixModal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        tierConfigs={k02Data.tierConfigs}
      />
    </div>
  );
};
