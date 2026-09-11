/**
 * Didar Gold Platform - K04: Approval Requests Table
 * Dual-Authorization Workflows & Four-Eyes Approvals
 */

import React, { useState } from 'react';
import {
  ApprovalRequest,
  ApprovalCategory,
  ApprovalStatus,
  ApprovalUrgency
} from '../../types/k04.js';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Scale,
  PlusCircle,
  Eye,
  AlertTriangle,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { ApprovalModal } from './ApprovalModal.js';

interface ApprovalRequestsTableProps {
  requests: ApprovalRequest[];
  onApprove: (requestId: string, stepNumber: number, actorId: string, actorName: string, actorRoleFa: string, notes: string) => Promise<void>;
  onReject: (requestId: string, stepNumber: number, actorId: string, actorName: string, actorRoleFa: string, reason: string) => Promise<void>;
  onOpenNewModal: () => void;
}

export const ApprovalRequestsTable: React.FC<ApprovalRequestsTableProps> = ({
  requests,
  onApprove,
  onReject,
  onOpenNewModal
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter(req => {
    // Status
    if (statusFilter === 'pending') {
      if (req.status !== 'pending_first_approval' && req.status !== 'pending_second_approval') return false;
    } else if (statusFilter === 'approved') {
      if (req.status !== 'approved') return false;
    } else if (statusFilter === 'rejected') {
      if (req.status !== 'rejected') return false;
    }

    // Category
    if (categoryFilter !== 'all' && req.category !== categoryFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = req.requestCode.toLowerCase().includes(q);
      const matchTitle = req.title.toLowerCase().includes(q);
      const matchParty = req.partyNameFa?.toLowerCase().includes(q) || false;
      const matchInitiator = req.initiatorName.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchParty && !matchInitiator) return false;
    }

    return true;
  });

  const getUrgencyBadge = (urgency: ApprovalUrgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#381419] text-[#FF6E6E] border border-[#FF4D4D]/30">بحرانی</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#382613] text-[#E5A84B] border border-[#E5A84B]/30">فوری</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1A261E] text-[#4CD68D] border border-[#3DD68C]/30">عادی</span>;
    }
  };

  const getStatusBadge = (status: ApprovalStatus, currentStep: number, totalSteps: number) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#3DD68C] bg-[#14261C] px-2.5 py-1 rounded-lg border border-[#254A34]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تصویب نهایی
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#FF6B6B] bg-[#331418] px-2.5 py-1 rounded-lg border border-[#522026]">
            <XCircle className="w-3.5 h-3.5" />
            رد شده
          </span>
        );
      case 'pending_first_approval':
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#E5A84B] bg-[#2E2012] px-2.5 py-1 rounded-lg border border-[#4D361F]">
            <Clock className="w-3.5 h-3.5" />
            در انتظار تایید اول ({currentStep}/{totalSteps})
          </span>
        );
      case 'pending_second_approval':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#E5C365] bg-[#332B16] px-2.5 py-1 rounded-lg border border-[#C8A951]/40 shadow-sm animate-pulse">
            <UserCheck className="w-3.5 h-3.5" />
            تأیید چهارچشم ({currentStep}/{totalSteps})
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-[#868698] bg-[#1E1E28] px-2 py-1 rounded-lg">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#15151D] p-3.5 rounded-2xl border border-[#262634]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#727284]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در کد درخواست، نام بنکدار، عنوان عملیات یا متصدی..."
            className="w-full bg-[#1C1C26] border border-[#2F2F40] rounded-xl pr-9 pl-4 py-2 text-xs text-[#EDEDED] placeholder-[#6E6E80] focus:outline-none focus:border-[#C8A951]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Pills */}
          <div className="flex items-center bg-[#1C1C26] p-1 rounded-xl border border-[#2F2F40]">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-[#C8A951] text-[#141416] font-bold' : 'text-[#8A8A9E] hover:text-[#EDEDED]'
              }`}
            >
              همه ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'pending' ? 'bg-[#E5A84B] text-[#141416] font-bold' : 'text-[#8A8A9E] hover:text-[#EDEDED]'
              }`}
            >
              معلق ({requests.filter(r => r.status.startsWith('pending')).length})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === 'approved' ? 'bg-[#3DD68C] text-[#141416] font-bold' : 'text-[#8A8A9E] hover:text-[#EDEDED]'
              }`}
            >
              تصویب شده
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#1C1C26] border border-[#2F2F40] rounded-xl px-3 py-2 text-xs text-[#B5B5C4] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">تمامی دسته‌بندی‌ها</option>
            <option value="physical_gold_release">ترخیص فیزیکی شمش طلا</option>
            <option value="credit_limit_exception">افزایش اعتبار تجاری</option>
            <option value="wage_discount_exception">تخفیف اجرت ساخت</option>
            <option value="unverified_settlement_override">تطبیق استثنایی فیش بانکی</option>
          </select>

          {/* Create New Request Button */}
          <button
            onClick={onOpenNewModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold text-xs hover:bg-[#D8B75B] transition-colors shrink-0 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت درخواست جدید</span>
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-[#15151E] rounded-2xl border border-[#272736] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1C1C26] text-[#8C8CA0] border-b border-[#292938]">
                <th className="py-3 px-4 font-semibold">کد و فوریت</th>
                <th className="py-3 px-4 font-semibold">شرح و دسته‌بندی</th>
                <th className="py-3 px-4 font-semibold">طرف حساب</th>
                <th className="py-3 px-4 font-semibold">وزن و ارزش طلا</th>
                <th className="py-3 px-4 font-semibold">ثبت‌کننده (Maker)</th>
                <th className="py-3 px-4 font-semibold">وضعیت گردش‌کار</th>
                <th className="py-3 px-4 font-semibold text-center">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232330]">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78788C]">
                    هیچ درخواستی با فیلترهای مشخص‌شده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isPending = req.status.startsWith('pending');

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-[#1A1A24] transition-colors"
                    >
                      {/* Code & Urgency */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#E5C365]">
                            {req.requestCode}
                          </span>
                          {getUrgencyBadge(req.urgency)}
                        </div>
                        <span className="text-[10px] text-[#717182] font-mono block mt-0.5">
                          {req.createdAt}
                        </span>
                      </td>

                      {/* Title & Category */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <span className="font-semibold text-[#EDEDED] block truncate" title={req.title}>
                          {req.title}
                        </span>
                        <span className="text-[11px] text-[#9A9AB0] block truncate">
                          {req.categoryTitleFa}
                        </span>
                      </td>

                      {/* Party */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[#EDEDED] font-medium block">
                          {req.partyNameFa || 'عمومی'}
                        </span>
                      </td>

                      {/* Gold Weight & Value */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {req.goldWeightGrams ? (
                          <div className="flex items-center gap-1 font-mono font-semibold text-[#E5C365]">
                            <Scale className="w-3.5 h-3.5" />
                            <span>{req.goldWeightGrams.toLocaleString()} گرم</span>
                          </div>
                        ) : (
                          <span className="text-[#6D6D7E]">—</span>
                        )}
                        {req.financialValueIrr ? (
                          <span className="text-[11px] text-[#9E9EA8] font-mono block">
                            {req.financialValueIrr.toLocaleString()} ریال
                          </span>
                        ) : null}
                      </td>

                      {/* Initiator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[#CECED8] block">{req.initiatorName}</span>
                        <span className="text-[10px] text-[#717182] block">{req.initiatorRoleFa}</span>
                      </td>

                      {/* Status & Step */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(req.status, req.currentStepNumber, req.totalSteps)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1 mx-auto cursor-pointer ${
                            isPending
                              ? 'bg-[#C8A951] text-[#141416] hover:bg-[#D8B75B] shadow-sm'
                              : 'bg-[#222230] text-[#B5B5C4] hover:bg-[#2C2C3E]'
                          }`}
                        >
                          {isPending ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>بررسی و تصمیم‌گیری</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>مشاهده تاریخچه</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Decision Modal */}
      {selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}
    </div>
  );
};
