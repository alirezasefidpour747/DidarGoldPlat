/**
 * Didar Gold Platform - Natural Persons Directory
 */

import React, { useState, useMemo } from 'react';
import { Party, PartyType, EntityStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Search, Filter, Eye, Edit3, ShieldAlert, PlusCircle, CheckCircle, Clock, AlertTriangle, Archive, FileText } from 'lucide-react';

interface PersonListProps {
  persons: Party[];
  onViewPerson: (person: Party) => void;
  onEditPerson: (person: Party) => void;
  onStatusChange: (person: Party) => void;
  onOpenCreate: () => void;
}

export const PersonList: React.FC<PersonListProps> = ({
  persons,
  onViewPerson,
  onEditPerson,
  onStatusChange,
  onOpenCreate
}) => {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredPersons = useMemo(() => {
    return persons.filter((p) => {
      const matchSearch =
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mobile.includes(searchTerm) ||
        (p.nationalId && p.nationalId.includes(searchTerm)) ||
        (p.agentProfile?.agentCode && p.agentProfile.agentCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.internalProfile?.personnelCode && p.internalProfile.personnelCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'all' || p.partyType === selectedType;
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [persons, searchTerm, selectedType, selectedStatus]);

  const getPartyTypeLabel = (type: PartyType) => {
    switch (type) {
      case 'consumer': return t.consumer;
      case 'field_agent': return t.fieldAgent;
      case 'internal_user': return t.internalUser;
      case 'external_representative': return t.externalRepresentative;
      case 'retailer_owner': return t.retailerOwner;
      case 'supplier_representative': return t.supplierRepresentative;
      case 'platform_admin': return t.platformAdmin;
      default: return type;
    }
  };

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

  const getVerificationBadge = (vStatus: string) => {
    switch (vStatus) {
      case 'verified':
        return <span className="text-[11px] text-[#3DD68C] font-medium">احراز شده</span>;
      case 'pending':
        return <span className="text-[11px] text-[#E5A84B]">در انتظار مدارک</span>;
      case 'rejected':
        return <span className="text-[11px] text-[#E5484D]">رد شده</span>;
      default:
        return <span className="text-[11px] text-[#7E7E8E]">بررسی‌نشده</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search, Filters & Create */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#171720] border border-[#272736] p-3 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A8A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#121217] border border-[#2C2C3C] focus:border-[#C8A951] text-xs text-[#EDEDED] pr-9 pl-4 py-2.5 rounded-xl outline-none transition-colors"
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">{t.allTypes}</option>
            <option value="consumer">{t.consumer}</option>
            <option value="field_agent">{t.fieldAgent}</option>
            <option value="internal_user">{t.internalUser}</option>
            <option value="retailer_owner">{t.retailerOwner}</option>
            <option value="supplier_representative">{t.supplierRepresentative}</option>
            <option value="external_representative">{t.externalRepresentative}</option>
            <option value="platform_admin">{t.platformAdmin}</option>
          </select>

          {/* Filter by Status */}
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

          {/* New Person Button */}
          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.createPerson}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171720] border border-[#272736] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1B1B26] border-b border-[#292938] text-[#9E9EA8] font-medium">
                <th className="py-3 px-4">شخص و نام خانوادگی</th>
                <th className="py-3 px-4">طبقه‌بندی پرسونای حقیقی</th>
                <th className="py-3 px-4">کد یکتای شغلی / کد ملی</th>
                <th className="py-3 px-4">اطلاعات تماس</th>
                <th className="py-3 px-4">وضعیت فعالیت</th>
                <th className="py-3 px-4">احراز هویت</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232330]">
              {filteredPersons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#7A7A8A]">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                filteredPersons.map((p) => {
                  const specialCode =
                    p.agentProfile?.agentCode ||
                    p.internalProfile?.personnelCode ||
                    p.nationalId ||
                    '—';

                  return (
                    <tr key={p.id} className="hover:bg-[#1E1E2A]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#EDEDED] text-sm">
                          {p.firstName} {p.lastName}
                        </div>
                        {p.notes && <div className="text-[11px] text-[#7A7A8A] line-clamp-1">{p.notes}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#22222E] text-[#C8A951] border border-[#333344]">
                          {getPartyTypeLabel(p.partyType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-[#D8D8E0]">
                        <span className="bg-[#121218] px-2 py-0.5 rounded border border-[#2B2B3A]">
                          {specialCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#EDEDED]">{p.mobile}</div>
                        {p.email && <div className="text-[11px] text-[#868696]">{p.email}</div>}
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(p.status)}
                      </td>

                      <td className="py-3.5 px-4">
                        {getVerificationBadge(p.verificationStatus)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewPerson(p)}
                            className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#C8A951] border border-[#333346] transition-colors cursor-pointer"
                            title={t.view}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditPerson(p)}
                            className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#333346] transition-colors cursor-pointer"
                            title={t.edit}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onStatusChange(p)}
                            className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#E5A84B] border border-[#333346] transition-colors cursor-pointer"
                            title={t.confirmStatusChange}
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
