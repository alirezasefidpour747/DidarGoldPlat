/**
 * Didar Gold Platform - Onboarding Queue Component (K02)
 * Interactive review queue with filters, progress bars, risk meters, and quick actions
 */

import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Shield,
  Phone,
  Calendar,
  Award,
  ArrowUpDown,
  Plus
} from 'lucide-react';
import { OnboardingApplication, OnboardingStatus, TrustTier } from '../../types/k02.js';

interface OnboardingQueueProps {
  applications: OnboardingApplication[];
  onOpenDetail: (app: OnboardingApplication) => void;
  onOpenCreate: () => void;
}

export const OnboardingQueue: React.FC<OnboardingQueueProps> = ({
  applications,
  onOpenDetail,
  onOpenCreate
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      app.targetName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.applicantPhone.includes(search) ||
      (app.city && app.city.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesTier = tierFilter === 'all' || app.requestedTier === tierFilter || app.currentTier === tierFilter;
    const matchesType = typeFilter === 'all' || app.targetType === typeFilter;

    return matchesSearch && matchesStatus && matchesTier && matchesType;
  });

  const getStatusBadge = (status: OnboardingStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#14331C] text-[#3DD68C] border border-[#235832]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تایید نهایی شده</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#332A15] text-[#E5C365] border border-[#58461E]">
            <Clock className="w-3.5 h-3.5" />
            <span>در صف کارشناس</span>
          </span>
        );
      case 'expert_assigned':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#1B2936] text-[#60A5FA] border border-[#2B435C]">
            <User className="w-3.5 h-3.5" />
            <span>ارجاع به بازرس</span>
          </span>
        );
      case 'needs_amendment':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#382218] text-[#F97316] border border-[#613A24]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>نیازمند اصلاح</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#381818] text-[#F87171] border border-[#5E2424]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>رد شده</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#242430] text-[#9E9EA8]">
            <span>پیش‌نویس</span>
          </span>
        );
    }
  };

  const getTierLabel = (tier: TrustTier) => {
    switch (tier) {
      case 'tier_3_commercial':
        return <span className="text-[#E5C365] font-bold">سطح ۳: ممتاز</span>;
      case 'tier_2_business':
        return <span className="text-[#C8A951] font-bold">سطح ۲: صنفی</span>;
      case 'tier_1_identity':
        return <span className="text-[#3DD68C] font-bold">سطح ۱: هویتی</span>;
      default:
        return <span className="text-[#8C8C9C]">سطح ۰: مهمان</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-[#171720] border border-[#2B2B38] rounded-xl p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی شماره پرونده، نام واحد صنفی، شهر، تلفن..."
            className="w-full bg-[#121218] border border-[#2B2B38] rounded-lg pr-9 pl-3 py-2 text-xs text-white placeholder-[#686878] focus:outline-none focus:border-[#C8A951]"
          />
          <Search className="w-4 h-4 text-[#686878] absolute right-3 top-2.5" />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B38] rounded-lg px-2.5 py-2 text-xs text-[#D1D1DE] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="in_review">در صف کارشناس</option>
            <option value="expert_assigned">ارجاع به بازرس</option>
            <option value="needs_amendment">نیازمند اصلاح</option>
            <option value="approved">تایید نهایی شده</option>
            <option value="rejected">رد شده</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B38] rounded-lg px-2.5 py-2 text-xs text-[#D1D1DE] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">همه سطوح اعتماد</option>
            <option value="tier_1_identity">سطح ۱: هویتی</option>
            <option value="tier_2_business">سطح ۲: واحد صنفی</option>
            <option value="tier_3_commercial">سطح ۳: شریک تجاری</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B38] rounded-lg px-2.5 py-2 text-xs text-[#D1D1DE] focus:outline-none focus:border-[#C8A951] cursor-pointer"
          >
            <option value="all">شخص و سازمان</option>
            <option value="organization">واحدهای صنفی</option>
            <option value="party">اشخاص حقیقی</option>
          </select>

          <button
            onClick={onOpenCreate}
            className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#C8A951] to-[#E5C365] text-[#141416] text-xs font-bold rounded-lg hover:opacity-90 transition-all shadow-sm shadow-[#C8A951]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>پرونده جدید</span>
          </button>
        </div>
      </div>

      {/* Applications Table / Cards */}
      <div className="bg-[#171722] border border-[#292938] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#121218] text-[#8C8C9C] border-b border-[#242430]">
                <th className="py-3.5 px-4 font-semibold">شماره پرونده</th>
                <th className="py-3.5 px-4 font-semibold">متقاضی / واحد صنفی</th>
                <th className="py-3.5 px-4 font-semibold">سطح فعلی / درخواستی</th>
                <th className="py-3.5 px-4 font-semibold">پیشرفت چک‌لیست</th>
                <th className="py-3.5 px-4 font-semibold">شاخص ریسک</th>
                <th className="py-3.5 px-4 font-semibold">وضعیت</th>
                <th className="py-3.5 px-4 font-semibold">کارشناس مسئول</th>
                <th className="py-3.5 px-4 font-semibold text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#20202C]">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#7A7A88]">
                    پرونده‌ای مطابق با فیلترهای انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const completedSteps = app.checklist.filter(s => s.completed).length;
                  const totalSteps = app.checklist.length;
                  const percent = Math.round((completedSteps / totalSteps) * 100);

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-[#1B1B26] transition-colors cursor-pointer"
                      onClick={() => onOpenDetail(app)}
                    >
                      {/* App Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#E5C365]">
                        {app.applicationNumber}
                      </td>

                      {/* Applicant & type */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#242432] flex items-center justify-center text-[#C8A951] flex-shrink-0">
                            {app.targetType === 'organization' ? (
                              <Building2 className="w-3.5 h-3.5" />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{app.targetName}</span>
                            <span className="text-[11px] text-[#7A7A88]">
                              {app.targetTypeLabel} • {app.city || 'ایران'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tier shift */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-[11px] text-[#7A7A88]">
                            فعلی: {getTierLabel(app.currentTier)}
                          </div>
                          <div className="text-xs font-bold text-[#E5C365]">
                            درخواستی: {getTierLabel(app.requestedTier)}
                          </div>
                        </div>
                      </td>

                      {/* Checklist Progress */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#8C8C9C] font-mono">{completedSteps}/{totalSteps} تایید</span>
                            <span className="text-[#3DD68C] font-mono font-bold">{percent}٪</span>
                          </div>
                          <div className="w-full bg-[#20202C] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-[#C8A951] to-[#3DD68C] h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              app.riskScore < 30 ? 'bg-[#3DD68C]' :
                              app.riskScore < 70 ? 'bg-[#E5A84B]' : 'bg-[#F87171]'
                            }`}
                          />
                          <span className="font-mono font-bold text-xs text-[#E0E0EC]">
                            {app.riskScore}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Reviewer */}
                      <td className="py-3.5 px-4 text-xs text-[#A0A0B0]">
                        {app.assignedReviewerName || 'تخصیص‌نیافته'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenDetail(app)}
                          className="px-3 py-1.5 rounded-lg bg-[#242432] hover:bg-[#343444] text-[#E5C365] text-xs font-semibold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>بررسی پرونده</span>
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
    </div>
  );
};
