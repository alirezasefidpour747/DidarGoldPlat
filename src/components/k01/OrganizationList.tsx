/**
 * Didar Gold Platform - Organizations & Businesses Directory
 */

import React, { useState, useMemo } from 'react';
import { Organization, OrganizationType, EntityStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Search, Building2, PlusCircle, CheckCircle, Clock, AlertTriangle, Archive, Eye, Edit3, ShieldAlert, Factory, Store, Briefcase } from 'lucide-react';

interface OrganizationListProps {
  organizations: Organization[];
  onViewOrg: (org: Organization) => void;
  onEditOrg: (org: Organization) => void;
  onStatusChange: (org: Organization) => void;
  onOpenCreate: () => void;
}

export const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
  onViewOrg,
  onEditOrg,
  onStatusChange,
  onOpenCreate
}) => {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOrgs = useMemo(() => {
    return organizations.filter((o) => {
      const matchSearch =
        o.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.nationalLegalId && o.nationalLegalId.includes(searchTerm)) ||
        (o.phone && o.phone.includes(searchTerm)) ||
        (o.manufacturerProfile?.supplierCode && o.manufacturerProfile.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.retailerProfile?.retailerCode && o.retailerProfile.retailerCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.wholesalerProfile?.supplierCode && o.wholesalerProfile.supplierCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchType = selectedType === 'all' || o.organizationType === selectedType;
      const matchStatus = selectedStatus === 'all' || o.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [organizations, searchTerm, selectedType, selectedStatus]);

  const getOrgTypeLabel = (type: OrganizationType) => {
    switch (type) {
      case 'didar': return t.didarOrg;
      case 'retailer': return t.retailer;
      case 'manufacturer': return t.manufacturer;
      case 'wholesaler': return t.wholesaler;
      case 'supplier': return t.supplier;
      case 'agent_office': return t.agentOffice;
      case 'service_partner': return t.servicePartner;
      default: return t.other;
    }
  };

  const getOrgTypeIcon = (type: OrganizationType) => {
    switch (type) {
      case 'manufacturer': return <Factory className="w-3.5 h-3.5 text-[#E5C365]" />;
      case 'retailer': return <Store className="w-3.5 h-3.5 text-[#E5C365]" />;
      case 'wholesaler': return <Briefcase className="w-3.5 h-3.5 text-[#E5C365]" />;
      default: return <Building2 className="w-3.5 h-3.5 text-[#C8A951]" />;
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
            placeholder="جستجوی کسب‌وکار با نام تجاری، شناسه ملی، کد سازنده، تلفن..."
            className="w-full bg-[#121217] border border-[#2C2C3C] focus:border-[#C8A951] text-xs text-[#EDEDED] pr-9 pl-4 py-2.5 rounded-xl outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">{t.allTypes}</option>
            <option value="manufacturer">{t.manufacturer}</option>
            <option value="wholesaler">{t.wholesaler}</option>
            <option value="retailer">{t.retailer}</option>
            <option value="didar">{t.didarOrg}</option>
            <option value="agent_office">{t.agentOffice}</option>
            <option value="service_partner">{t.servicePartner}</option>
            <option value="supplier">{t.supplier}</option>
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
            <span>{t.createOrganization}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171720] border border-[#272736] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1B1B26] border-b border-[#292938] text-[#9E9EA8] font-medium">
                <th className="py-3 px-4">عنوان سازمان و نام رسمی</th>
                <th className="py-3 px-4">طبقه‌بندی صنعتی</th>
                <th className="py-3 px-4">کد یکتای طرف تجاری</th>
                <th className="py-3 px-4">شاخص تخصصی صنعت</th>
                <th className="py-3 px-4">شماره تماس / شهر</th>
                <th className="py-3 px-4">وضعیت</th>
                <th className="py-3 px-4 text-center">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232330]">
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#7A7A8A]">
                    {t.noRecordsFound}
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((o) => {
                  let specialCode = '—';
                  let specialtyDesc = '—';

                  if (o.manufacturerProfile) {
                    specialCode = o.manufacturerProfile.supplierCode;
                    specialtyDesc = `ظرفیت: ${o.manufacturerProfile.monthlyCapacityGrams.toLocaleString('fa-IR')} گرم ماهانه`;
                  } else if (o.wholesalerProfile) {
                    specialCode = o.wholesalerProfile.supplierCode;
                    specialtyDesc = `پوشش: ${o.wholesalerProfile.coverageTerritory}`;
                  } else if (o.retailerProfile) {
                    specialCode = o.retailerProfile.retailerCode;
                    specialtyDesc = `جواز: ${o.retailerProfile.guildLicenseNumber}`;
                  } else if (o.nationalLegalId) {
                    specialCode = o.nationalLegalId;
                  }

                  return (
                    <tr key={o.id} className="hover:bg-[#1E1E2A]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#EDEDED] text-sm flex items-center gap-1.5">
                          {o.displayName}
                        </div>
                        <div className="text-[11px] text-[#7A7A8A] line-clamp-1">{o.legalName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#22222E] text-[#C8A951] border border-[#333344]">
                          {getOrgTypeIcon(o.organizationType)}
                          <span>{getOrgTypeLabel(o.organizationType)}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-[#D8D8E0]">
                        <span className="bg-[#121218] px-2 py-0.5 rounded border border-[#2B2B3A]">
                          {specialCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-[11px] text-[#B5B5C2]">
                        {specialtyDesc}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-xs text-[#EDEDED]">{o.phone}</div>
                        <div className="text-[11px] text-[#868696]">{o.city || o.province || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(o.status)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewOrg(o)}
                            className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#C8A951] border border-[#333346] transition-colors cursor-pointer"
                            title={t.view}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onEditOrg(o)}
                            className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#333346] transition-colors cursor-pointer"
                            title={t.edit}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onStatusChange(o)}
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
