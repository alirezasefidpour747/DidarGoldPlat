/**
 * Didar Gold Platform - Membership Link & Authority Delegation Modal
 */

import React, { useState, useEffect } from 'react';
import { Membership, Party, Organization, MembershipAuthority, MembershipRoleKey, EntityStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, AlertCircle, Check, Link2, Shield } from 'lucide-react';

interface MembershipFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Membership>) => Promise<void>;
  initialData?: Membership | null;
  persons: Party[];
  organizations: Organization[];
  preselectedPersonId?: string;
  preselectedOrgId?: string;
}

export const MembershipFormModal: React.FC<MembershipFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  persons,
  organizations,
  preselectedPersonId,
  preselectedOrgId
}) => {
  const { t } = useI18n();

  const [partyId, setPartyId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [roleKey, setRoleKey] = useState<MembershipRoleKey>('partner');
  const [title, setTitle] = useState('');
  const [authorities, setAuthorities] = useState<MembershipAuthority[]>(['can_order']);
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPartyId(initialData.partyId);
      setOrganizationId(initialData.organizationId);
      setRoleKey(initialData.roleKey);
      setTitle(initialData.title);
      setAuthorities(initialData.authorities || []);
      setValidFrom(initialData.validFrom || new Date().toISOString().split('T')[0]);
      setValidTo(initialData.validTo || '');
      setStatus(initialData.status);
    } else {
      setPartyId(preselectedPersonId || (persons[0]?.id || ''));
      setOrganizationId(preselectedOrgId || (organizations[0]?.id || ''));
      setRoleKey('partner');
      setTitle('');
      setAuthorities(['can_order']);
      setValidFrom(new Date().toISOString().split('T')[0]);
      setValidTo('');
      setStatus('active');
    }
    setError(null);
  }, [initialData, isOpen, preselectedPersonId, preselectedOrgId, persons, organizations]);

  if (!isOpen) return null;

  const toggleAuthority = (auth: MembershipAuthority) => {
    if (authorities.includes(auth)) {
      setAuthorities(authorities.filter(a => a !== auth));
    } else {
      setAuthorities([...authorities, auth]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!partyId) {
      setError('انتخاب شخص حقیقی الزامی است.');
      return;
    }
    if (!organizationId) {
      setError('انتخاب سازمان الزامی است.');
      return;
    }
    if (!title.trim()) {
      setError('عنوان سمت رسمی الزامی است.');
      return;
    }

    const payload: Partial<Membership> = {
      partyId,
      organizationId,
      roleKey,
      title: title.trim(),
      authorities,
      validFrom,
      validTo: validTo || undefined,
      status
    };

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در برقراری پیوند عضویت.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292938]">
          <h3 className="text-base font-bold text-[#F4F4F6] flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#C8A951]" />
            <span>{initialData ? 'ویرایش پیوند عضویت و تفویض اختیار' : t.linkMembership}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8A8A9A] hover:text-[#EDEDED] hover:bg-[#252534]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2.5 text-xs text-[#FF6B6B]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Person Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#B5B5C2] mb-1.5">انتخاب شخص حقیقی *</label>
            <select
              value={partyId}
              disabled={!!initialData}
              onChange={e => setPartyId(e.target.value)}
              className="w-full bg-[#121218] border border-[#2C2C3C] focus:border-[#C8A951] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] outline-none disabled:opacity-60"
            >
              <option value="">-- شخص را انتخاب کنید --</option>
              {persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({p.partyType} - {p.mobile})
                </option>
              ))}
            </select>
          </div>

          {/* Organization Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#B5B5C2] mb-1.5">انتخاب سازمان تجاری طرف قرارداد *</label>
            <select
              value={organizationId}
              disabled={!!initialData}
              onChange={e => setOrganizationId(e.target.value)}
              className="w-full bg-[#121218] border border-[#2C2C3C] focus:border-[#C8A951] rounded-xl px-3.5 py-2.5 text-xs text-[#EDEDED] outline-none disabled:opacity-60"
            >
              <option value="">-- سازمان را انتخاب کنید --</option>
              {organizations.map(o => (
                <option key={o.id} value={o.id}>
                  {o.displayName} ({o.organizationType} - {o.city || 'مرکزی'})
                </option>
              ))}
            </select>
          </div>

          {/* Role and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">نقش پایه‌ای (Role Key) *</label>
              <select
                value={roleKey}
                onChange={e => setRoleKey(e.target.value as MembershipRoleKey)}
                className="w-full bg-[#121218] border border-[#2C2C3C] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
              >
                <option value="owner">صاحب امتیاز (Owner)</option>
                <option value="partner">شریک تجاری (Partner)</option>
                <option value="agent">عامل رسمی (Agent)</option>
                <option value="sales">مسئول فروش (Sales)</option>
                <option value="accountant">مسئول حسابداری (Accountant)</option>
                <option value="manager">مدیر اجرایی (Manager)</option>
                <option value="authorized_signatory">دارنده حق امضا (Authorized Signatory)</option>
                <option value="other">سایر (Other)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">عنوان رسمی سمت *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="مثال: مدیر فروشگاه و دارنده حق سفارش"
                className="w-full bg-[#121218] border border-[#2C2C3C] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
              />
            </div>
          </div>

          {/* Delegated Authorities Checkboxes */}
          <div className="p-4 rounded-xl bg-[#13131A] border border-[#262634] space-y-3">
            <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>اختیارات و تفویض امضاهای تجاری</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'can_order', title: 'حق ثبت سفارش', desc: 'امکان ثبت سفارش قطعات و مصنوعات طلا' },
                { id: 'can_sign', title: 'حق امضای تعهدآور', desc: 'امضای رسیدهای امانت، تحویل فیزیکی و فاکتورها' },
                { id: 'can_manage_members', title: 'مدیریت پرسنل سازمان', desc: 'معرفی یا عزل سایر نمایندگان' },
                { id: 'can_view_finance', title: 'مشاهده حساب مالی و طلا', desc: 'دسترسی به دفاتر مطالبات ریالی و وزنی' }
              ].map(auth => {
                const checked = authorities.includes(auth.id as MembershipAuthority);
                return (
                  <div
                    key={auth.id}
                    onClick={() => toggleAuthority(auth.id as MembershipAuthority)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-[#1F2620] border-[#3DD68C]/50 text-[#EDEDED]'
                        : 'bg-[#181822] border-[#2C2C3C] text-[#868694]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        checked ? 'bg-[#3DD68C] border-[#3DD68C] text-[#121214]' : 'border-[#4A4A5C]'
                      }`}>
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold">{auth.title}</span>
                    </div>
                    <p className="text-[10px] text-[#8A8A9A] mt-1 pr-6">{auth.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validity range and status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">تاریخ شروع اعتبار *</label>
              <input
                type="date"
                required
                value={validFrom}
                onChange={e => setValidFrom(e.target.value)}
                className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">تاریخ پایان اعتبار (اختیاری)</label>
              <input
                type="date"
                value={validTo}
                onChange={e => setValidTo(e.target.value)}
                className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">وضعیت پیوند</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EntityStatus)}
                className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
              >
                <option value="active">{t.statusActive}</option>
                <option value="pending">{t.statusPending}</option>
                <option value="suspended">{t.statusSuspended}</option>
                <option value="archived">{t.statusArchived}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#292938]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#A6A6B4] hover:text-[#EDEDED] hover:bg-[#252534] rounded-xl transition-colors cursor-pointer"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D4AF37] rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-[#C8A951]/15"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? t.loading : t.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
