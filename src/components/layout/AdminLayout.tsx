/**
 * Didar Gold Platform - Master Admin Layout & K01 Operations Center
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './Header.js';
import { DomainNavigation } from './DomainNavigation.js';
import { useI18n } from '../../lib/i18n.js';
import {
  K01DataPayload,
  Party,
  Organization,
  Membership,
  PartyDocument,
  EntityStatus,
  VerificationStatus
} from '../../types/k01.js';
import { api } from '../../lib/api.js';

// K01 Components
import { K01Overview } from '../k01/K01Overview.js';
import { PersonList } from '../k01/PersonList.js';
import { PersonFormModal } from '../k01/PersonFormModal.js';
import { PersonDetailDrawer } from '../k01/PersonDetailDrawer.js';
import { OrganizationList } from '../k01/OrganizationList.js';
import { OrganizationFormModal } from '../k01/OrganizationFormModal.js';
import { OrganizationDetailDrawer } from '../k01/OrganizationDetailDrawer.js';
import { MembershipList } from '../k01/MembershipList.js';
import { MembershipFormModal } from '../k01/MembershipFormModal.js';
import { DocumentVault } from '../k01/DocumentVault.js';
import { AuditTrailViewer } from '../k01/AuditTrailViewer.js';
import { StatusChangeModal } from '../k01/StatusChangeModal.js';

// K02 Components & Types
import { K02Dashboard } from '../k02/K02Dashboard.js';
import {
  K02DataPayload,
  OnboardingApplication,
  CommercialEntitlements,
  ChecklistStepKey,
  VerificationCallLog
} from '../../types/k02.js';

// K03 Components & Types
import { K03Dashboard } from '../k03/K03Dashboard.js';
import {
  K03DataPayload,
  UserAccount,
  MfaMethod,
  MfaPolicyRule
} from '../../types/k03.js';

// K04 Components
import { K04Dashboard } from '../k04/K04Dashboard.js';

// K05 Components
import { K05Dashboard } from '../k05/K05Dashboard.js';

// K06 Components
import { K06Dashboard } from '../k06/K06Dashboard.js';

// K07 Components
import { K07Dashboard } from '../k07/K07Dashboard.js';

// K08 Components
import { K08Dashboard } from '../k08/K08Dashboard.js';

// K09 Components
import { K09Dashboard } from '../k09/K09Dashboard.js';

// K10 Components
import { K10Dashboard } from '../k10/K10Dashboard.js';

// K11 Components
import { K11Dashboard } from '../k11/K11Dashboard.js';

// K12 Components
import { K12Dashboard } from '../k12/K12Dashboard.js';

// K13 Components
import { K13Dashboard } from '../k13/K13Dashboard.js';

// K14 Components
import { K14Dashboard } from '../k14/K14Dashboard.js';

// K15 Components
import { K15Dashboard } from '../k15/K15Dashboard.js';

// K16 Components
import { K16Dashboard } from '../k16/K16Dashboard.js';

// K17 Components
import { K17Dashboard } from '../k17/K17Dashboard.js';

// Master Data Management Component
import { MasterDataDashboard } from '../masterData/MasterDataDashboard.js';
import { RolesCatalogViewer } from '../k01/RolesCatalogViewer.js';

import {
  Users,
  Building2,
  Link2,
  FileCheck2,
  History,
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ShieldCheck
} from 'lucide-react';

type K01Tab = 'overview' | 'persons' | 'organizations' | 'memberships' | 'roles_catalog' | 'documents' | 'audit';

export const AdminLayout: React.FC = () => {
  const { t } = useI18n();

  const [selectedDomain, setSelectedDomain] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toUpperCase();
      const allowed = ['MDM', 'K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16'];
      if (allowed.includes(hash)) return hash;
      const saved = localStorage.getItem('didar_selected_domain');
      if (saved && allowed.includes(saved)) return saved;
    }
    return 'K15';
  });
  const [activeTab, setActiveTab] = useState<K01Tab>('overview');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toUpperCase();
      const allowed = ['MDM', 'K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16'];
      if (allowed.includes(hash)) {
        setSelectedDomain(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Server Data
  const [data, setData] = useState<K01DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals & Drawers State
  // Person
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Party | null>(null);
  const [viewingPerson, setViewingPerson] = useState<Party | null>(null);

  // Organization
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [viewingOrg, setViewingOrg] = useState<Organization | null>(null);

  // Membership
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [preselectedPersonId, setPreselectedPersonId] = useState<string | undefined>(undefined);
  const [preselectedOrgId, setPreselectedOrgId] = useState<string | undefined>(undefined);

  // Status Change
  const [statusTarget, setStatusTarget] = useState<{
    type: 'party' | 'organization' | 'membership';
    id: string;
    name: string;
    currentStatus: EntityStatus;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK01Data();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بارگذاری داده‌های هسته K01.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toUpperCase();
      const allowed = ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16', 'K17', 'MDM'];
      if (allowed.includes(hash)) {
        setSelectedDomain(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handlers for Person
  const handleSavePerson = async (payload: Partial<Party>) => {
    if (editingPerson) {
      await api.updateParty(editingPerson.id, payload);
      showNotification('success', `پرونده شخص ${payload.firstName} ${payload.lastName} با موفقیت به‌روزرسانی شد.`);
    } else {
      await api.createParty(payload);
      showNotification('success', `پرونده شخص جدید ${payload.firstName} ${payload.lastName} با موفقیت ثبت شد.`);
    }
    await loadData();
  };

  const handleOpenEditPerson = (p: Party) => {
    setEditingPerson(p);
    setIsPersonModalOpen(true);
  };

  const handleOpenCreatePerson = () => {
    setEditingPerson(null);
    setIsPersonModalOpen(true);
  };

  // Handlers for Organization
  const handleSaveOrg = async (payload: Partial<Organization>) => {
    if (editingOrg) {
      await api.updateOrganization(editingOrg.id, payload);
      showNotification('success', `سازمان ${payload.displayName} با موفقیت ویرایش شد.`);
    } else {
      await api.createOrganization(payload);
      showNotification('success', `سازمان جدید ${payload.displayName} با موفقیت در هسته دیدار ثبت شد.`);
    }
    await loadData();
  };

  const handleOpenEditOrg = (org: Organization) => {
    setEditingOrg(org);
    setIsOrgModalOpen(true);
  };

  const handleOpenCreateOrg = () => {
    setEditingOrg(null);
    setIsOrgModalOpen(true);
  };

  // Handlers for Membership
  const handleSaveMembership = async (payload: Partial<Membership>) => {
    if (editingMembership) {
      await api.updateMembership(editingMembership.id, payload);
      showNotification('success', `پیوند عضویت با موفقیت به‌روزرسانی شد.`);
    } else {
      await api.createMembership(payload);
      showNotification('success', `پیوند عضویت و تفویض اختیار جدید برقرار شد.`);
    }
    await loadData();
  };

  const handleOpenCreateMembership = (person?: Party, org?: Organization) => {
    setEditingMembership(null);
    setPreselectedPersonId(person?.id);
    setPreselectedOrgId(org?.id);
    setIsMembershipModalOpen(true);
  };

  const handleOpenEditMembership = (m: Membership) => {
    setEditingMembership(m);
    setIsMembershipModalOpen(true);
  };

  // Handlers for Documents
  const handleUploadDocument = async (payload: Partial<PartyDocument>) => {
    await api.uploadDocument(payload);
    showNotification('success', `سند با موفقیت در صندوق امن ذخیره و تایید شد.`);
    await loadData();
  };

  const handleVerifyDocument = async (docId: string, vStatus: VerificationStatus) => {
    await api.verifyDocument(docId, vStatus);
    showNotification('success', `وضعیت استعلام سند به‌روزرسانی شد.`);
    await loadData();
  };

  // Handlers for Status Transitions
  const handleApplyStatusChange = async (newStatus: EntityStatus, reason: string) => {
    if (!statusTarget) return;

    if (statusTarget.type === 'party') {
      await api.changePartyStatus(statusTarget.id, newStatus, reason);
    } else if (statusTarget.type === 'organization') {
      await api.changeOrgStatus(statusTarget.id, newStatus, reason);
    } else if (statusTarget.type === 'membership') {
      await api.changeMembershipStatus(statusTarget.id, newStatus, reason);
    }

    showNotification('success', `وضعیت ${statusTarget.name} به ${newStatus} تغییر یافت و در ردپای حسابرسی ثبت شد.`);
    await loadData();
  };

  // K02 State & Loaders
  const [k02Data, setK02Data] = useState<K02DataPayload | null>(null);
  const [loadingK02, setLoadingK02] = useState(false);

  const loadK02Data = useCallback(async () => {
    try {
      setLoadingK02(true);
      const res = await api.getK02Data();
      setK02Data(res);
    } catch (err: unknown) {
      console.error('Error loading K02 data:', err);
    } finally {
      setLoadingK02(false);
    }
  }, []);

  useEffect(() => {
    loadK02Data();
  }, [loadK02Data]);

  // Handlers for K02 Operations
  const handleCreateK02Application = async (payload: Partial<OnboardingApplication>) => {
    await api.createOnboardingApplication(payload);
    showNotification('success', `پرونده پذیرش جدید برای ${payload.targetName} با موفقیت ثبت شد.`);
    await loadK02Data();
  };

  const handleUpdateK02ChecklistStep = async (appId: string, stepKey: ChecklistStepKey, completed: boolean, notes?: string) => {
    await api.updateChecklistStep(appId, stepKey, completed, notes);
    showNotification('success', 'وضعیت مرحله چک‌لیست اعتبارسنجی به‌روزرسانی شد.');
    await loadK02Data();
  };

  const handleLogK02VerificationCall = async (appId: string, callLog: Partial<VerificationCallLog>) => {
    await api.logVerificationCall(appId, callLog);
    showNotification('success', 'نتیجه استعلام تماس با موفقیت در پرونده ثبت شد.');
    await loadK02Data();
  };

  const handleMakeK02Decision = async (
    appId: string,
    decision: 'approve' | 'reject' | 'needs_amendment' | 'assign',
    details: any
  ) => {
    await api.makeOnboardingDecision(appId, decision, details);
    const msg = decision === 'approve' ? 'پرونده با موفقیت تایید و حدود تجاری فعال گردید.' :
                decision === 'needs_amendment' ? 'اعلام نقص مدارک به متقاضی ثبت شد.' :
                decision === 'reject' ? 'درخواست پذیرش رد گردید.' : 'پرونده به کارشناس میدانی ارجاع شد.';
    showNotification('success', msg);
    await loadK02Data();
  };

  const handleUpdateK02Entitlements = async (targetId: string, updates: Partial<CommercialEntitlements>) => {
    await api.updateCommercialEntitlements(targetId, updates);
    showNotification('success', 'سقف‌های تجاری طلا و دسترسی‌های معامله با موفقیت ذخیره شد.');
    await loadK02Data();
  };

  // K03 State & Loaders (Authentication & MFA)
  const [k03Data, setK03Data] = useState<K03DataPayload | null>(null);
  const [loadingK03, setLoadingK03] = useState(false);

  const loadK03Data = useCallback(async () => {
    try {
      setLoadingK03(true);
      const res = await api.getK03Data();
      setK03Data(res);
    } catch (err: unknown) {
      console.error('Error loading K03 data:', err);
    } finally {
      setLoadingK03(false);
    }
  }, []);

  useEffect(() => {
    loadK03Data();
  }, [loadK03Data]);

  // K03 Action Handlers
  const handleToggleMfa = async (userId: string, isEnforced: boolean, defaultMethod?: MfaMethod) => {
    await api.toggleMfa(userId, isEnforced, defaultMethod);
    showNotification('success', isEnforced ? 'الزام احراز دوعاملی برای حساب فعال گردید.' : 'احراز دوعاملی به حالت اختیاری تغییر یافت.');
    await loadK03Data();
  };

  const handleVerifyTotp = async (userId: string, code: string) => {
    await api.verifyTotp(userId, code);
    showNotification('success', 'نرم‌افزار Authenticator با موفقیت به عنوان عامل دوم احراز ثبت گردید.');
    await loadK03Data();
  };

  const handleAddSecurityKey = async (userId: string, name: string, model: string) => {
    await api.addSecurityKey(userId, name, model);
    showNotification('success', `کلید فیزیکی سخت‌افزاری (${name}) با موفقیت به حساب متصل شد.`);
    await loadK03Data();
  };

  const handleRevokeSession = async (sessionId: string) => {
    await api.revokeSession(sessionId);
    showNotification('success', 'نشست دستگاه با موفقیت ابطال و اتصال آن قطع گردید.');
    await loadK03Data();
  };

  const handleRevokeAllSessions = async (userId: string) => {
    const count = await api.revokeAllSessions(userId);
    showNotification('success', `${count} نشست فعال کاربر به طور کامل ابطال گردید.`);
    await loadK03Data();
  };

  const handleUnlockAccount = async (userId: string) => {
    await api.unlockAccount(userId);
    showNotification('success', 'حساب کاربری از وضعیت مسدود خارج شد و دفعات ناموفق صفر گردید.');
    await loadK03Data();
  };

  const handleUpdateSecuritySettings = async (userId: string, settings: Partial<UserAccount['securitySettings']>) => {
    await api.updateSecuritySettings(userId, settings);
    showNotification('success', 'تنظیمات امنیتی و نشست کاربر با موفقیت به‌روزرسانی شد.');
    await loadK03Data();
  };

  const handleUpdatePolicyRule = async (ruleId: string, updates: Partial<MfaPolicyRule>) => {
    await api.updatePolicyRule(ruleId, updates);
    showNotification('success', 'سیاست امنیتی صنف طلا با موفقیت ذخیره و اعمال شد.');
    await loadK03Data();
  };

  const handleSimulateStepUp = async (
    userId: string,
    operationFa: string,
    amountGrams: number,
    method: MfaMethod,
    code: string
  ) => {
    const result = await api.simulateStepUp(userId, operationFa, amountGrams, method, code);
    await loadK03Data();
    return result;
  };

  return (
    <div className="min-h-screen bg-[#111115] text-[#EDEDED] flex flex-col font-sans selection:bg-[#C8A951] selection:text-[#141416]">
      {/* Platform Fixed Header */}
      <Header
        activeDomainCount={11}
        currentDomain={selectedDomain}
        onNavigateDomain={(id) => {
          setSelectedDomain(id);
          if (typeof window !== 'undefined') {
            localStorage.setItem('didar_selected_domain', id);
            window.location.hash = id;
          }
        }}
      />

      {/* 20 Kernel Domains Navigation */}
      <DomainNavigation
        selectedDomain={selectedDomain}
        onSelectDomain={(id) => {
          setSelectedDomain(id);
          if (typeof window !== 'undefined') {
            localStorage.setItem('didar_selected_domain', id);
            window.location.hash = id;
          }
        }}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 bg-[#191924] border-[#C8A951] text-[#E5C365]">
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#E5484D]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {selectedDomain === 'MDM' ? (
          /* Master Data Management Domain */
          <MasterDataDashboard onBackToDomain={(dom) => setSelectedDomain(dom)} />
        ) : selectedDomain === 'K17' ? (
          /* Domain K17 View: Consumer Ownership Claims, Digital Provenance & Warranty */
          <K17Dashboard />
        ) : selectedDomain === 'K16' ? (
          /* Domain K16 View: Settlement & Zarrin Reconciliation */
          <K16Dashboard />
        ) : selectedDomain === 'K15' ? (
          /* Domain K15 View: Financial Obligations & Dual Subledgers */
          <K15Dashboard />
        ) : selectedDomain === 'K14' ? (
          /* Domain K14 View: Credit & Exposure Governance */
          <K14Dashboard />
        ) : selectedDomain === 'K13' ? (
          /* Domain K13 View: Gold Rates, Pricing, Terms & Invoicing */
          <K13Dashboard />
        ) : selectedDomain === 'K12' ? (
          /* Domain K12 View: Agents, Territories & Field Operations */
          <K12Dashboard />
        ) : selectedDomain === 'K11' ? (
          /* Domain K11 View: Retailer Lifecycle & Commercial Access */
          <K11Dashboard />
        ) : selectedDomain === 'K10' ? (
          /* Domain K10 View: Orders, Allocation & Fulfillment */
          <K10Dashboard />
        ) : selectedDomain === 'K09' ? (
          /* Domain K09 View: Inventory, Multi-Vault Locations, Custody & Bags */
          <K09Dashboard />
        ) : selectedDomain === 'K08' ? (
          /* Domain K08 View: Supply Intake, Verification, Assay & Receipts */
          <K08Dashboard />
        ) : selectedDomain === 'K07' ? (
          /* Domain K07 View: Supplier Partnerships, Consignment & Collateral */
          <K07Dashboard />
        ) : selectedDomain === 'K06' ? (
          /* Domain K06 View: Unique Item IDs, Passports & Provenance */
          <K06Dashboard />
        ) : selectedDomain === 'K05' ? (
          /* Domain K05 View: Products, Catalog & Supply Offers */
          <K05Dashboard />
        ) : selectedDomain === 'K04' ? (
          /* Domain K04 View: Approvals, Exceptions & Immutable Audit */
          <K04Dashboard />
        ) : selectedDomain === 'K03' ? (
          /* Domain K03 View */
          k03Data ? (
            <K03Dashboard
              k03Data={k03Data}
              onRefresh={loadK03Data}
              onToggleMfa={handleToggleMfa}
              onVerifyTotp={handleVerifyTotp}
              onAddSecurityKey={handleAddSecurityKey}
              onRevokeSession={handleRevokeSession}
              onRevokeAllSessions={handleRevokeAllSessions}
              onUnlockAccount={handleUnlockAccount}
              onUpdateSecuritySettings={handleUpdateSecuritySettings}
              onUpdatePolicyRule={handleUpdatePolicyRule}
              onSimulateStepUp={handleSimulateStepUp}
            />
          ) : (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9E9EA8]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#C8A951]" />
              <span className="text-xs">در حال دریافت و بارگذاری اطلاعات دامنه K03...</span>
            </div>
          )
        ) : selectedDomain === 'K02' ? (
          /* Domain K02 View */
          k02Data ? (
            <K02Dashboard
              k02Data={k02Data}
              persons={data?.persons || []}
              organizations={data?.organizations || []}
              memberships={data?.memberships || []}
              onRefresh={loadK02Data}
              onCreateApplication={handleCreateK02Application}
              onUpdateChecklistStep={handleUpdateK02ChecklistStep}
              onLogVerificationCall={handleLogK02VerificationCall}
              onMakeDecision={handleMakeK02Decision}
              onUpdateEntitlements={handleUpdateK02Entitlements}
            />
          ) : (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9E9EA8]">
              <RefreshCw className="w-8 h-8 animate-spin text-[#C8A951]" />
              <span className="text-xs">در حال دریافت و بارگذاری اطلاعات دامنه K02...</span>
            </div>
          )
        ) : (
          /* Domain K01 View */
          <>
            {/* Navigation Tabs for K01 Sub-sections */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#262634] pb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
                {[
                  { id: 'overview', label: 'داشبورد کلی K01', icon: LayoutDashboard },
                  { id: 'persons', label: t.persons, icon: Users, count: data?.persons.length },
                  { id: 'organizations', label: t.organizations, icon: Building2, count: data?.organizations.length },
                  { id: 'memberships', label: t.memberships, icon: Link2, count: data?.memberships.length },
                  { id: 'roles_catalog', label: 'کاتالوگ ۷۰ نقش RBAC', icon: ShieldCheck, count: 70 },
                  { id: 'documents', label: t.documents, icon: FileCheck2, count: data?.documents.length },
                  { id: 'audit', label: t.auditTrail, icon: History, count: data?.auditLogs.length }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as K01Tab)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/15'
                          : 'bg-[#181822] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#20202D] border border-[#2B2B3C]'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                          isActive ? 'bg-[#141416] text-[#C8A951]' : 'bg-[#242434] text-[#868698]'
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={loadData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181822] border border-[#2C2C3C] text-xs text-[#9E9EA8] hover:text-[#EDEDED] hover:border-[#3D3D52] transition-colors cursor-pointer disabled:opacity-50"
                  title="بارگذاری مجدد داده‌ها"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
                  <span>{t.refresh}</span>
                </button>
              </div>
            </div>

            {/* Loading / Error States */}
            {loading && !data && (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-[#9E9EA8]">
                <RefreshCw className="w-8 h-8 animate-spin text-[#C8A951]" />
                <span className="text-xs">{t.loading}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center justify-between text-xs text-[#FF6B6B]">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadData}
                  className="px-3 py-1 rounded-lg bg-[#E5484D]/20 text-[#FF8B8B] hover:bg-[#E5484D]/30"
                >
                  تلاش مجدد
                </button>
              </div>
            )}

            {/* Render Tab Views */}
            {data && (
              <div>
                {activeTab === 'overview' && (
                  <K01Overview
                    data={data}
                    onOpenCreatePerson={handleOpenCreatePerson}
                    onOpenCreateOrg={handleOpenCreateOrg}
                    onOpenCreateMembership={() => handleOpenCreateMembership()}
                    onOpenUploadDoc={() => setActiveTab('documents')}
                    onSelectTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'persons' && (
                  <PersonList
                    persons={data.persons}
                    onViewPerson={(p) => setViewingPerson(p)}
                    onEditPerson={handleOpenEditPerson}
                    onStatusChange={(p) => {
                      setStatusTarget({
                        type: 'party',
                        id: p.id,
                        name: `${p.firstName} ${p.lastName}`,
                        currentStatus: p.status
                      });
                    }}
                    onOpenCreate={handleOpenCreatePerson}
                  />
                )}

                {activeTab === 'organizations' && (
                  <OrganizationList
                    organizations={data.organizations}
                    onViewOrg={(o) => setViewingOrg(o)}
                    onEditOrg={handleOpenEditOrg}
                    onStatusChange={(o) => {
                      setStatusTarget({
                        type: 'organization',
                        id: o.id,
                        name: o.displayName,
                        currentStatus: o.status
                      });
                    }}
                    onOpenCreate={handleOpenCreateOrg}
                  />
                )}

                {activeTab === 'memberships' && (
                  <MembershipList
                    memberships={data.memberships}
                    onEditMembership={handleOpenEditMembership}
                    onStatusChange={(m) => {
                      setStatusTarget({
                        type: 'membership',
                        id: m.id,
                        name: `${m.partyName} - ${m.organizationName}`,
                        currentStatus: m.status
                      });
                    }}
                    onOpenCreate={() => handleOpenCreateMembership()}
                    onRefreshData={loadData}
                  />
                )}

                {activeTab === 'roles_catalog' && (
                  <RolesCatalogViewer />
                )}

                {activeTab === 'documents' && (
                  <DocumentVault
                    documents={data.documents}
                    persons={data.persons}
                    organizations={data.organizations}
                    onUploadDocument={handleUploadDocument}
                    onVerifyDocument={handleVerifyDocument}
                  />
                )}

                {activeTab === 'audit' && (
                  <AuditTrailViewer auditLogs={data.auditLogs} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Global Action Modals and Drawers */}
      <PersonFormModal
        isOpen={isPersonModalOpen}
        onClose={() => {
          setIsPersonModalOpen(false);
          setEditingPerson(null);
        }}
        onSubmit={handleSavePerson}
        initialData={editingPerson}
      />

      <PersonDetailDrawer
        person={viewingPerson}
        onClose={() => setViewingPerson(null)}
        memberships={data?.memberships || []}
        documents={data?.documents || []}
        auditLogs={data?.auditLogs || []}
        onEdit={(p) => {
          setViewingPerson(null);
          handleOpenEditPerson(p);
        }}
        onStatusChange={(p) => {
          setStatusTarget({
            type: 'party',
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            currentStatus: p.status
          });
        }}
        onAddMembership={(p) => {
          setViewingPerson(null);
          handleOpenCreateMembership(p, undefined);
        }}
        onUploadDocument={() => {
          setViewingPerson(null);
          setActiveTab('documents');
        }}
      />

      <OrganizationFormModal
        isOpen={isOrgModalOpen}
        onClose={() => {
          setIsOrgModalOpen(false);
          setEditingOrg(null);
        }}
        onSubmit={handleSaveOrg}
        initialData={editingOrg}
      />

      <OrganizationDetailDrawer
        organization={viewingOrg}
        onClose={() => setViewingOrg(null)}
        memberships={data?.memberships || []}
        documents={data?.documents || []}
        auditLogs={data?.auditLogs || []}
        onEdit={(o) => {
          setViewingOrg(null);
          handleOpenEditOrg(o);
        }}
        onStatusChange={(o) => {
          setStatusTarget({
            type: 'organization',
            id: o.id,
            name: o.displayName,
            currentStatus: o.status
          });
        }}
        onAddMembership={(o) => {
          setViewingOrg(null);
          handleOpenCreateMembership(undefined, o);
        }}
        onUploadDocument={() => {
          setViewingOrg(null);
          setActiveTab('documents');
        }}
      />

      <MembershipFormModal
        isOpen={isMembershipModalOpen}
        onClose={() => {
          setIsMembershipModalOpen(false);
          setEditingMembership(null);
          setPreselectedPersonId(undefined);
          setPreselectedOrgId(undefined);
        }}
        onSubmit={handleSaveMembership}
        initialData={editingMembership}
        persons={data?.persons || []}
        organizations={data?.organizations || []}
        preselectedPersonId={preselectedPersonId}
        preselectedOrgId={preselectedOrgId}
      />

      {statusTarget && (
        <StatusChangeModal
          isOpen={!!statusTarget}
          onClose={() => setStatusTarget(null)}
          entityType={statusTarget.type}
          entityId={statusTarget.id}
          entityName={statusTarget.name}
          currentStatus={statusTarget.currentStatus}
          onSubmit={handleApplyStatusChange}
        />
      )}
    </div>
  );
};
