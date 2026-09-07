/**
 * Didar Gold Platform - Memberships & Authority Delegations
 */

import React, { useState, useMemo } from 'react';
import { Membership, EntityStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Search, Link2, PlusCircle, CheckCircle, Clock, AlertTriangle, Archive, Edit3, ShieldAlert, Shield, Check } from 'lucide-react';

interface MembershipListProps {
  memberships: Membership[];
  onEditMembership: (membership: Membership) => void;
  onStatusChange: (membership: Membership) => void;
  onOpenCreate: () => void;
}

export const MembershipList: React.FC<MembershipListProps> = ({
  memberships,
  onEditMembership,
  onStatusChange,
  onOpenCreate
}) => {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filtered = useMemo(() => {
    return memberships.filter((m) => {
      const matchSearch =
        m.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.roleKey.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = selectedRole === 'all' || m.roleKey === selectedRole;
      const matchStatus = selectedStatus === 'all' || m.status === selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [memberships, searchTerm, selectedRole, selectedStatus]);

  const getStatusBadge = (status: EntityStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
            <CheckCircle className="w-3 h-3" />
            <span>{t.statusActive}</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30">
            <Clock className="w-3 h-3" />
            <span>{t.statusPending}</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">
            <AlertTriangle className="w-3 h-3" />
            <span>{t.statusSuspended}</span>
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#70707E]/15 text-[#9E9EA8] border border-[#70707E]/30">
            <Archive className="w-3 h-3" />
            <span>{t.statusArchived}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#171720] border border-[#272736] p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A8A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی شخص، نام سازمان، سمت یا اختیارات..."
            className="w-full bg-[#121217] border border-[#2C2C3C] focus:border-[#C8A951] text-xs text-[#EDEDED] pr-9 pl-4 py-2.5 rounded-xl outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">تمام نقش‌ها</option>
            <option value="owner">صاحب امتیاز (Owner)</option>
            <option value="partner">شریک تجاری (Partner)</option>
            <option value="agent">عامل رسمی (Agent)</option>
            <option value="sales_staff">مسئول فروش (Sales Staff)</option>
            <option value="accountant">مسئول حسابداری (Accountant)</option>
            <option value="compliance_officer">مسئول انطباق (Compliance)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">{t.allStatuses}</option>
            <option value="active">{t.statusActive}</option>
            <option value="pending">{t.statusPending}</option>
            <option value="suspended">{t.statusSuspended}</option>
            <option value="archived">{t.statusArchived}</option>
          </select>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.linkMembership}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171720] border border-[#272736] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1B1B26] border-b border-[#292938] text-[#9E9EA8] font-medium">
                <th className="py-3 px-4">شخص حقیقی</th>
                <th className="py-3 px-4">سازمان طرف پیوند</th>
                <th className="py-3 px-4">نقش و سمت رسمی</th>
                <th className="py-3 px-4">اختیارات و امضاهای مجاز</th>
                <th className="py-3 px-4">بازه اعتبار</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232330]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#7A7A8A]">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-[#1E1E2A]/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[#EDEDED] text-sm">
                      {m.partyName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[#C8A951] font-medium">
                        {m.organizationName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-[#EDEDED]">{m.title}</div>
                      <span className="font-mono text-[10px] text-[#8C8C9E] bg-[#22222E] px-1.5 py-0.5 rounded border border-[#313144]">
                        {m.roleKey}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.authorities.map(auth => (
                          <span key={auth} className="px-2 py-0.5 rounded bg-[#20202E] text-[10px] text-[#3DD68C] border border-[#2E2E42]">
                            {auth === 'can_order' && 'ثبت سفارش'}
                            {auth === 'can_sign' && 'حق امضا'}
                            {auth === 'can_manage_members' && 'مدیریت اعضا'}
                            {auth === 'can_view_finance' && 'مشاهده مالی'}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#9E9EA8]">
                      {m.validFrom} تا {m.validTo || 'نامحدود'}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(m.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEditMembership(m)}
                          className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#333346] transition-colors cursor-pointer"
                          title={t.edit}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onStatusChange(m)}
                          className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#E5A84B] border border-[#333346] transition-colors cursor-pointer"
                          title={t.confirmStatusChange}
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
