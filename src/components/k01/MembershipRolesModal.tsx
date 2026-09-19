import React, { useState, useEffect } from 'react';
import { Membership } from '../../types/k01.js';
import { RoleDefinition, RoleAssignment } from '../../types/rbac.js';
import { api } from '../../lib/api.js';
import {
  ShieldCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X,
  RefreshCw,
  Lock,
  Layers,
  Search
} from 'lucide-react';

interface MembershipRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
  onRefreshParent?: () => void;
}

export const MembershipRolesModal: React.FC<MembershipRolesModalProps> = ({
  isOpen,
  onClose,
  membership,
  onRefreshParent
}) => {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // New assignment form state
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState('');
  const [scopeType, setScopeType] = useState<'global' | 'organization' | 'territory' | 'warehouse'>('organization');
  const [scopeIds, setScopeIds] = useState('');
  const [scopeLabelFa, setScopeLabelFa] = useState('');
  const [reason, setReason] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');

  const [notification, setNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && membership) {
      loadData();
    }
  }, [isOpen, membership]);

  const loadData = async () => {
    if (!membership) return;
    setLoading(true);
    setNotification(null);
    try {
      const [allRoles, memberAssignments] = await Promise.all([
        api.getRoles(),
        api.getRoleAssignments({ membershipId: membership.id })
      ]);
      setRoles(allRoles);
      setAssignments(memberAssignments);

      // Pre-fill defaults for assignment form
      setScopeIds(membership.organizationId);
      setScopeLabelFa(membership.organizationName || 'سازمان مربوطه');
      setValidFrom(new Date().toISOString().split('T')[0]);
    } catch (err: unknown) {
      console.error('Error loading RBAC role data:', err);
      setNotification({
        type: 'error',
        message: 'خطا در بارگذاری اطلاعات نقش‌های سازمانی.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !membership) return null;

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleKey || !reason) {
      setNotification({
        type: 'error',
        message: 'انتخاب نقش و درج دلیل انتساب الزامی است.'
      });
      return;
    }

    const ids = scopeIds.split(',').map(s => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      setNotification({
        type: 'error',
        message: 'تعیین حداقل یک شناسه در محدوده دسترسی (Scope) الزامی است.'
      });
      return;
    }

    setActionLoading(true);
    setNotification(null);

    try {
      const res = await api.requestRoleAssignment({
        membershipId: membership.id,
        roleKey: selectedRoleKey,
        scope: {
          type: scopeType,
          ids,
          labelFa: scopeLabelFa || undefined
        },
        validFrom: validFrom ? `${validFrom}T00:00:00Z` : undefined,
        validTo: validTo ? `${validTo}T23:59:59Z` : null,
        reason
      });

      if (res.status === 'pending_approval') {
        setNotification({
          type: 'warning',
          message: res.message || 'درخواست انتساب ثبت شد و به کارتابل اصل چهارچشم K04 ارسال گردید.'
        });
      } else {
        setNotification({
          type: 'success',
          message: res.message || 'نقش کاری با موفقیت انتساب یافت.'
        });
      }

      setIsAssigning(false);
      setSelectedRoleKey('');
      setReason('');
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: unknown) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'خطا در انتساب نقش سازمانی'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (assignmentId: string, roleTitle: string) => {
    const reasonPrompt = window.prompt(`دلیل لغو و ابطال فوری نقش «${roleTitle}» را وارد کنید:`);
    if (!reasonPrompt) return;

    setActionLoading(true);
    try {
      await api.revokeRoleAssignment(assignmentId, reasonPrompt);
      setNotification({
        type: 'success',
        message: `نقش «${roleTitle}» با موفقیت باطل شد و تغییرات در زنجیره ممیزی ثبت گردید.`
      });
      await loadData();
      if (onRefreshParent) onRefreshParent();
    } catch (err: unknown) {
      setNotification({
        type: 'error',
        message: err instanceof Error ? err.message : 'خطا در لغو نقش'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRoles = roles.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.roleKey.toLowerCase().includes(q) ||
        r.titleFa.includes(q) ||
        r.analysisCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#181824] border border-[#2B2B3D] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#28283A] bg-[#14141E] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#C8A951]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>مدیریت نقش‌های عملیاتی RBAC</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#242434] text-[#C8A951] font-mono">
                  K01 Membership Link
                </span>
              </h3>
              <p className="text-xs text-[#8E8E9F] mt-0.5">
                عضو: <strong className="text-white">{membership.partyName}</strong> در سازمان:{' '}
                <strong className="text-[#C8A951]">{membership.organizationName}</strong> ({membership.title})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#20202E] hover:bg-[#28283A] text-[#8E8E9F] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Banner */}
        {notification && (
          <div
            className={`px-6 py-3 text-xs flex items-center justify-between border-b ${
              notification.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : notification.type === 'warning'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[11px] underline cursor-pointer"
            >
              بستن
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Active Assignments Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#C8A951]" />
                نقش‌های عملیاتی انتساب‌یافته به این عضویت ({assignments.length})
              </h4>

              {!isAssigning && (
                <button
                  onClick={() => setIsAssigning(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#C8A951] hover:bg-[#D4B765] text-[#141416] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  انتصاب نقش جدید
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-8 flex justify-center text-xs text-[#8E8E9F] gap-2 items-center">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C8A951]" />
                <span>در حال بارگذاری نقش‌ها...</span>
              </div>
            ) : assignments.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#14141D] border border-[#232332] text-xs text-[#7A7A8A] text-center">
                هیچ نقش عملیاتی صریحی برای این پیوند عضویت ثبت نشده است. (اختیارات محدود به مقادیر پیش‌فرض K01 است)
              </div>
            ) : (
              <div className="space-y-2.5">
                {assignments.map(a => {
                  const roleDef = roles.find(r => r.roleKey === a.roleKey);
                  const isRevoked = a.status === 'revoked';
                  const isPending = a.status === 'pending_approval';

                  return (
                    <div
                      key={a.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isRevoked
                          ? 'bg-[#14141B]/50 border-[#242430] opacity-60'
                          : isPending
                          ? 'bg-amber-500/5 border-amber-500/30'
                          : 'bg-[#1B1B28] border-[#29293C]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-white">
                            {roleDef?.titleFa || a.roleKey}
                          </strong>
                          <span className="font-mono text-[10px] text-[#C8A951]">
                            {a.roleKey}
                          </span>
                          {isPending && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              در انتظار تایید چهارچشم K04
                            </span>
                          )}
                          {isRevoked && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              باطل‌شده
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#8E8E9F] mt-1.5">
                          <span>
                            محدوده:{' '}
                            <strong className="text-[#C8A951]">
                              {a.scope.labelFa || a.scope.type} ({a.scope.ids.join(', ')})
                            </strong>
                          </span>
                          <span>دلیل: {a.reason}</span>
                          <span>از {a.validFrom.split('T')[0]}</span>
                          {a.validTo && <span>تا {a.validTo.split('T')[0]}</span>}
                        </div>
                      </div>

                      {!isRevoked && (
                        <button
                          onClick={() => handleRevoke(a.id, roleDef?.titleFa || a.roleKey)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          لغو و ابطال
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* New Assignment Form */}
          {isAssigning && (
            <div className="p-4 rounded-xl bg-[#14141E] border border-[#C8A951]/40 space-y-4">
              <div className="flex items-center justify-between border-b border-[#232332] pb-2">
                <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  فرم انتصاب نقش جدید از کاتالوگ جامع (Canonical 70 Roles)
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAssigning(false)}
                  className="text-xs text-[#8E8E9F] hover:text-white"
                >
                  انصراف
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                {/* Role Picker with Filter */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#A0A0B2]">
                    انتخاب نقش کاری (Role Definition):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="جستجوی نقش با نام یا کد..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    >
                      <option value="all">تمام دسته‌ها</option>
                      <option value="retailer">خرده‌فروشی</option>
                      <option value="supplier">تأمین‌کننده / سازنده</option>
                      <option value="agent">عامل میدانی</option>
                      <option value="operations">عملیات پلتفرم</option>
                      <option value="finance">مالی و تسویه</option>
                      <option value="warehouse">خزانه و انبار</option>
                      <option value="governance">حکمرانی و امنیت</option>
                    </select>
                  </div>

                  <select
                    value={selectedRoleKey}
                    onChange={(e) => setSelectedRoleKey(e.target.value)}
                    className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    required
                  >
                    <option value="">-- نقش مورد نظر را انتخاب نمایید --</option>
                    {filteredRoles.map(r => (
                      <option key={r.roleKey} value={r.roleKey}>
                        [{r.analysisCode}] {r.titleFa} ({r.roleKey}) - دسته‌بندی: {r.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Scope Definition (AT28) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0B2] mb-1">
                      نوع محدوده (Scope Type):
                    </label>
                    <select
                      value={scopeType}
                      onChange={(e) => setScopeType(e.target.value as any)}
                      className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    >
                      <option value="organization">مجموعه / سازمان (Organization)</option>
                      <option value="territory">قلمرو جغرافیایی (Territory)</option>
                      <option value="warehouse">خزانه فیزیکی (Warehouse/Vault)</option>
                      <option value="global">سراسری پلتفرم (Global)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0B2] mb-1">
                      شناسه‌ها (کاما جداشده):
                    </label>
                    <input
                      type="text"
                      value={scopeIds}
                      onChange={(e) => setScopeIds(e.target.value)}
                      placeholder="e.g. org-ret-parnia-003"
                      className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C8A951]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0B2] mb-1">
                      برچسب فارسی محدوده:
                    </label>
                    <input
                      type="text"
                      value={scopeLabelFa}
                      onChange={(e) => setScopeLabelFa(e.target.value)}
                      placeholder="e.g. فروشگاه پرنیا"
                      className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    />
                  </div>
                </div>

                {/* Reason & Validity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#A0A0B2] mb-1">
                      دلیل انتصاب و حکم اداری (الزامی):
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. حکم انتصاب شماره ۱۴۰۳/۷۶ - تفویض ثبت سفارش"
                      className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A0A0B2] mb-1">
                      تاریخ انقضا (اختیاری):
                    </label>
                    <input
                      type="date"
                      value={validTo}
                      onChange={(e) => setValidTo(e.target.value)}
                      className="w-full bg-[#1A1A26] border border-[#2B2B3C] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C8A951]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#232332]">
                  <button
                    type="button"
                    onClick={() => setIsAssigning(false)}
                    className="px-4 py-2 rounded-lg bg-[#20202E] hover:bg-[#28283A] text-xs text-[#8E8E9F] transition-colors cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-[#C8A951] hover:bg-[#D4B765] text-[#141416] text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {actionLoading ? 'در حال پردازش...' : 'تأیید و ثبت انتساب نقش'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
