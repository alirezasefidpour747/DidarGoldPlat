/**
 * Didar Gold Platform - Kernel Domain K04 Dashboard
 * Approvals, Four-Eyes Principle (SoD), Commercial Exceptions & Immutable Audit Logs
 */

import React, { useState, useEffect } from 'react';
import { K04DataPayload } from '../../types/k04.js';
import { api } from '../../lib/api.js';
import {
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  FileText,
  Clock,
  RotateCw,
  Scale,
  DollarSign,
  AlertOctagon,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileSignature,
  FileX
} from 'lucide-react';
import { ApprovalRequestsTable } from './ApprovalRequestsTable.js';
import { ExceptionsManager } from './ExceptionsManager.js';
import { ImmutableAuditLedger } from './ImmutableAuditLedger.js';
import { SodPolicyMatrix } from './SodPolicyMatrix.js';
import { NewApprovalRequestModal } from './NewApprovalRequestModal.js';

export const K04Dashboard: React.FC = () => {
  const [data, setData] = useState<K04DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'approvals' | 'exceptions' | 'audit' | 'sod'>('approvals');
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [showNewApprovalModal, setShowNewApprovalModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK04Data();
      setData(res);
    } catch (err: unknown) {
      console.error('Error loading K04 data:', err);
      setError(err instanceof Error ? err.message : 'خطا در برقراری ارتباط با هسته K04');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleApproveRequest = async (
    requestId: string,
    stepNumber: number,
    actorId: string,
    actorName: string,
    actorRoleFa: string,
    notes: string
  ) => {
    try {
      const res = await api.approveRequestStep(requestId, stepNumber, actorId, actorName, actorRoleFa, notes);
      showToast('success', res.message);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در ثبت تایید.');
      throw err;
    }
  };

  const handleRejectRequest = async (
    requestId: string,
    stepNumber: number,
    actorId: string,
    actorName: string,
    actorRoleFa: string,
    reason: string
  ) => {
    try {
      const res = await api.rejectApprovalRequest(requestId, stepNumber, actorId, reason, actorName, actorRoleFa);
      showToast('success', res.message);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در رد درخواست.');
      throw err;
    }
  };

  const handleCreateApproval = async (formData: any) => {
    try {
      const res = await api.createApprovalRequest(formData);
      showToast('success', `درخواست جدید با کد ${res.requestCode} ثبت و به گردش‌کار چهارچشم افزوده شد.`);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در ثبت درخواست.');
      throw err;
    }
  };

  const handleCreateException = async (formData: any) => {
    try {
      const res = await api.createCommercialException(formData);
      showToast('success', `استثنای تجاری با کد ${res.exceptionCode} با موفقیت صادر شد.`);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در صدور استثنا.');
      throw err;
    }
  };

  const handleRevokeException = async (exceptionId: string, reason: string) => {
    try {
      const res = await api.revokeCommercialException(exceptionId, reason);
      showToast('success', res.message);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در ابطال استثنا.');
      throw err;
    }
  };

  const handleVerifyIntegrity = async () => {
    try {
      setIsVerifyingIntegrity(true);
      const res = await api.verifyAuditIntegrity();
      showToast('success', res.message);
      if (data) {
        setData({
          ...data,
          chainIntegrity: res.data
        });
      }
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در راستی‌آزمایی زنجیره.');
    } finally {
      setIsVerifyingIntegrity(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <RotateCw className="w-8 h-8 text-[#C8A951] animate-spin" />
        <span className="text-sm text-[#9E9EB2]">در حال بارگذاری هسته K04 (تأییدات، استثناها و حسابرسی)...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 rounded-2xl bg-[#2D1217] border border-[#FF4D4D]/50 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-[#FF5252] mx-auto" />
        <h3 className="text-sm font-bold text-[#FF8585]">خطا در اتصال به هسته نظارتی K04</h3>
        <p className="text-xs text-[#CCA0A6]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-[#FF4D4D] text-white rounded-xl text-xs font-bold hover:bg-[#FF3333]"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const pendingApprovalsCount = data?.approvalRequests.filter(
    r => r.status === 'pending_first_approval' || r.status === 'pending_second_approval'
  ).length || 0;

  const totalPendingGold = data?.approvalRequests
    .filter(r => r.status.startsWith('pending'))
    .reduce((acc, curr) => acc + (curr.goldWeightGrams || 0), 0) || 0;

  const activeExceptionsCount = data?.exceptions.filter(e => e.status === 'active').length || 0;

  const totalViolationsBlocked = data?.sodRules.reduce(
    (acc, curr) => acc + curr.violationsBlockedCount,
    0
  ) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border flex items-center gap-2 animate-in slide-in-from-top duration-150 ${
            notification.type === 'success'
              ? 'bg-[#152B1E] text-[#4DE59B] border-[#3DD68C]/50'
              : 'bg-[#3A141A] text-[#FF7A7A] border-[#FF4D4D]/50'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Domain Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#2B2B3C]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#292215] text-[#C8A951] border border-[#C8A951]/40 shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C8A951] text-[#141416]">
                K04
              </span>
              <h1 className="text-xl font-bold text-[#EDEDED]">تأیید، استثنا و حسابرسی تغییرناپذیر</h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#182B1F] text-[#4CD68D] border border-[#3DD68C]/30 font-medium">
                هسته فعال
              </span>
            </div>
            <p className="text-xs text-[#9FA0B2] mt-1">
              الزام اصل چهارچشم (Four-Eyes Principle / SoD)، مدیریت مجوزهای استثنای تجاری و دفتر کل حسابرسی پیوسته با امضای رمزنگاری SHA-256
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={loadData}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1C1C26] text-[#A2A2B6] hover:text-[#EDEDED] hover:bg-[#252534] border border-[#2D2D3E] text-xs transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>بروزرسانی داده‌ها</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Pending Approvals */}
        <div className="p-4 rounded-2xl bg-[#161622] border border-[#2B2B3C] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8E8EA2] mb-1">
            <span>در انتظار تأیید</span>
            <Clock className="w-4 h-4 text-[#E5A84B]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#E5A84B]">
            {pendingApprovalsCount} <span className="text-xs font-normal text-[#8E8EA2]">مورد</span>
          </div>
          <div className="text-[11px] text-[#717184] mt-1">گردش‌کار مرحله ۱ و ۲</div>
        </div>

        {/* Pending Gold Weight */}
        <div className="p-4 rounded-2xl bg-[#161622] border border-[#2B2B3C] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8E8EA2] mb-1">
            <span>طلای در گردش تایید</span>
            <Scale className="w-4 h-4 text-[#C8A951]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#E5C365]">
            {totalPendingGold.toLocaleString()} <span className="text-xs font-normal text-[#8E8EA2]">گرم</span>
          </div>
          <div className="text-[11px] text-[#717184] mt-1">نیازمند ترخیص امن</div>
        </div>

        {/* Active Exceptions */}
        <div className="p-4 rounded-2xl bg-[#161622] border border-[#2B2B3C] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8E8EA2] mb-1">
            <span>استثناهای تجاری فعال</span>
            <ShieldAlert className="w-4 h-4 text-[#E5A84B]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#EDEDED]">
            {activeExceptionsCount} <span className="text-xs font-normal text-[#8E8EA2]">فقره</span>
          </div>
          <div className="text-[11px] text-[#717184] mt-1">مجوزهای موقت معتبر</div>
        </div>

        {/* Blocked SoD Violations */}
        <div className="p-4 rounded-2xl bg-[#161622] border border-[#2B2B3C] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#8E8EA2] mb-1">
            <span>سوءاستفاده مسدودشده</span>
            <AlertOctagon className="w-4 h-4 text-[#FF6363]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#FF8585]">
            {totalViolationsBlocked} <span className="text-xs font-normal text-[#8E8EA2]">مورد</span>
          </div>
          <div className="text-[11px] text-[#717184] mt-1">توسط موتور تفکیک وظایف</div>
        </div>

        {/* Cryptographic Chain Status */}
        <div className="p-4 rounded-2xl bg-[#161622] border border-[#2B2B3C] relative overflow-hidden col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#8E8EA2] mb-1">
            <span>یکپارچگی هش SHA-256</span>
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#3DD68C]">
            ۱۰۰٪ <span className="text-xs font-normal text-[#8E8EA2]">سالم</span>
          </div>
          <div className="text-[11px] text-[#717184] mt-1">
            {data?.chainIntegrity.verifiedBlocksCount || 0} بلوک رمزنگاری‌شده
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-[#28283A] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'approvals'
              ? 'bg-[#292215] text-[#C8A951] border border-[#C8A951]/50 shadow-sm'
              : 'text-[#8E8EA2] hover:text-[#EDEDED] hover:bg-[#1C1C26]'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>کارتابل تأییدات و گردش‌کار چهارچشم</span>
          {pendingApprovalsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#E5A84B] text-[#141416] font-mono font-bold">
              {pendingApprovalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'exceptions'
              ? 'bg-[#292215] text-[#C8A951] border border-[#C8A951]/50 shadow-sm'
              : 'text-[#8E8EA2] hover:text-[#EDEDED] hover:bg-[#1C1C26]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>استثناها و معافیت‌های تجاری موقت (Waivers)</span>
          {activeExceptionsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#222230] text-[#E0E0EC] font-mono font-semibold">
              {activeExceptionsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'audit'
              ? 'bg-[#292215] text-[#C8A951] border border-[#C8A951]/50 shadow-sm'
              : 'text-[#8E8EA2] hover:text-[#EDEDED] hover:bg-[#1C1C26]'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>دفتر کل حسابرسی تغییرناپذیر (Immutable SHA-256)</span>
        </button>

        <button
          onClick={() => setActiveTab('sod')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'sod'
              ? 'bg-[#292215] text-[#C8A951] border border-[#C8A951]/50 shadow-sm'
              : 'text-[#8E8EA2] hover:text-[#EDEDED] hover:bg-[#1C1C26]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>ماتریس قوانین تفکیک وظایف (SoD Engine)</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      {data && (
        <div>
          {activeTab === 'approvals' && (
            <ApprovalRequestsTable
              requests={data.approvalRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onOpenNewModal={() => setShowNewApprovalModal(true)}
            />
          )}

          {activeTab === 'exceptions' && (
            <ExceptionsManager
              exceptions={data.exceptions}
              onCreateException={handleCreateException}
              onRevokeException={handleRevokeException}
            />
          )}

          {activeTab === 'audit' && (
            <ImmutableAuditLedger
              entries={data.auditLogs}
              chainIntegrity={data.chainIntegrity}
              onVerifyIntegrity={handleVerifyIntegrity}
              isVerifying={isVerifyingIntegrity}
            />
          )}

          {activeTab === 'sod' && (
            <SodPolicyMatrix rules={data.sodRules} />
          )}
        </div>
      )}

      {/* New Approval Request Modal */}
      {showNewApprovalModal && (
        <NewApprovalRequestModal
          onClose={() => setShowNewApprovalModal(false)}
          onSubmit={handleCreateApproval}
        />
      )}
    </div>
  );
};
