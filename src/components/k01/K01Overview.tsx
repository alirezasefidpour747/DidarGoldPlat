/**
 * Didar Gold Platform - Domain K01 Overview Dashboard
 */

import React from 'react';
import { K01DataPayload } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Users, Building2, Link2, FileCheck2, History, PlusCircle, Shield, Briefcase, Factory, Store, UserCheck } from 'lucide-react';

interface K01OverviewProps {
  data: K01DataPayload;
  onOpenCreatePerson: () => void;
  onOpenCreateOrg: () => void;
  onOpenCreateMembership: () => void;
  onOpenUploadDoc: () => void;
  onSelectTab: (tab: 'persons' | 'organizations' | 'memberships' | 'documents' | 'audit') => void;
}

export const K01Overview: React.FC<K01OverviewProps> = ({
  data,
  onOpenCreatePerson,
  onOpenCreateOrg,
  onOpenCreateMembership,
  onOpenUploadDoc,
  onSelectTab
}) => {
  const { t } = useI18n();

  // Metrics calculations
  const personsList = data?.persons || [];
  const orgsList = data?.organizations || [];
  const membershipsList = data?.memberships || [];
  const docsList = data?.documents || [];
  const auditList = data?.auditLogs || [];

  const totalPersons = personsList.length;
  const totalOrgs = orgsList.length;
  const totalMemberships = membershipsList.length;
  const totalDocs = docsList.length;
  const totalAudit = auditList.length;

  const agentsCount = personsList.filter(p => p.partyType === 'field_agent').length;
  const retailersCount = orgsList.filter(o => o.organizationType === 'retailer').length;
  const manufacturersCount = orgsList.filter(o => o.organizationType === 'manufacturer').length;
  const wholesalersCount = orgsList.filter(o => o.organizationType === 'wholesaler').length;

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Actions */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1E1C15] via-[#1B1B22] to-[#16161D] border border-[#383324] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#C8A951] text-[#121214]">
                K01 CORE
              </span>
              <span className="text-xs text-[#3DD68C] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3DD68C]"></span>
                پایگاه داده عملیاتی زنده
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#F4F4F6] tracking-tight">{t.k01Title}</h2>
            <p className="text-xs text-[#9E9EA8] max-w-2xl mt-1 leading-relaxed">{t.k01Subtitle}</p>
          </div>

          {/* 4 Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full lg:w-auto">
            <button
              onClick={onOpenCreatePerson}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold transition-all shadow-md shadow-[#C8A951]/15 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.createPerson}</span>
            </button>

            <button
              onClick={onOpenCreateOrg}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#3A3A4E] text-xs font-semibold transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-[#C8A951]" />
              <span>{t.createOrganization}</span>
            </button>

            <button
              onClick={onOpenCreateMembership}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#3A3A4E] text-xs font-semibold transition-all cursor-pointer"
            >
              <Link2 className="w-4 h-4 text-[#C8A951]" />
              <span>{t.linkMembership}</span>
            </button>

            <button
              onClick={onOpenUploadDoc}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#242430] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#3A3A4E] text-xs font-semibold transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4 text-[#C8A951]" />
              <span>{t.uploadDocument}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => onSelectTab('persons')}
          className="p-4 rounded-xl bg-[#181820] border border-[#2B2B38] hover:border-[#C8A951]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9E9EA8] mb-2">
            <span className="text-xs">{t.persons}</span>
            <Users className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F6] font-mono">{totalPersons}</div>
          <div className="text-[11px] text-[#3DD68C] mt-1 flex items-center gap-1">
            <span>{data.counts.activePersons} {t.activeCount}</span>
            <span className="text-[#555562]">|</span>
            <span>{data.counts.verifiedPersons} {t.verifiedCount}</span>
          </div>
        </div>

        <div
          onClick={() => onSelectTab('organizations')}
          className="p-4 rounded-xl bg-[#181820] border border-[#2B2B38] hover:border-[#C8A951]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9E9EA8] mb-2">
            <span className="text-xs">{t.organizations}</span>
            <Building2 className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F6] font-mono">{totalOrgs}</div>
          <div className="text-[11px] text-[#3DD68C] mt-1 flex items-center gap-1">
            <span>{data.counts.activeOrganizations} {t.activeCount}</span>
            <span className="text-[#555562]">|</span>
            <span>{data.counts.verifiedOrganizations} {t.verifiedCount}</span>
          </div>
        </div>

        <div
          onClick={() => onSelectTab('memberships')}
          className="p-4 rounded-xl bg-[#181820] border border-[#2B2B38] hover:border-[#C8A951]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9E9EA8] mb-2">
            <span className="text-xs">{t.memberships}</span>
            <Link2 className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F6] font-mono">{totalMemberships}</div>
          <div className="text-[11px] text-[#9E9EA8] mt-1">
            پیوندهای تفویض اختیار فعال
          </div>
        </div>

        <div
          onClick={() => onSelectTab('documents')}
          className="p-4 rounded-xl bg-[#181820] border border-[#2B2B38] hover:border-[#C8A951]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#9E9EA8] mb-2">
            <span className="text-xs">{t.documents}</span>
            <FileCheck2 className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F6] font-mono">{totalDocs}</div>
          <div className="text-[11px] text-[#9E9EA8] mt-1">
            پروانه‌ها و قراردادهای تاییدشده
          </div>
        </div>

        <div
          onClick={() => onSelectTab('audit')}
          className="p-4 rounded-xl bg-[#181820] border border-[#2B2B38] hover:border-[#C8A951]/50 transition-all cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-[#9E9EA8] mb-2">
            <span className="text-xs">{t.auditTrail}</span>
            <History className="w-4 h-4 text-[#C8A951] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#F4F4F6] font-mono">{totalAudit}</div>
          <div className="text-[11px] text-[#9E9EA8] mt-1">
            ردپای حسابرسی تغییرناپذیر
          </div>
        </div>
      </div>

      {/* Ecosystem Archetype Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Industry Entities Snapshot */}
        <div className="p-5 rounded-2xl bg-[#171720] border border-[#292936] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C8A951]" />
              <span>پراکندگی طرف‌های تجاری اکوسیستم</span>
            </h3>
            <span className="text-xs text-[#9E9EA8]">{totalOrgs} سازمان ثبت شده</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#1E1E28] border border-[#2E2E3E] text-center">
              <Factory className="w-5 h-5 text-[#E5C365] mx-auto mb-1" />
              <div className="text-xs text-[#9E9EA8]">سازندگان طلا</div>
              <div className="text-lg font-bold text-[#F4F4F6] font-mono mt-0.5">{manufacturersCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#1E1E28] border border-[#2E2E3E] text-center">
              <Briefcase className="w-5 h-5 text-[#E5C365] mx-auto mb-1" />
              <div className="text-xs text-[#9E9EA8]">بنکداران عمده</div>
              <div className="text-lg font-bold text-[#F4F4F6] font-mono mt-0.5">{wholesalersCount}</div>
            </div>

            <div className="p-3 rounded-xl bg-[#1E1E28] border border-[#2E2E3E] text-center">
              <Store className="w-5 h-5 text-[#E5C365] mx-auto mb-1" />
              <div className="text-xs text-[#9E9EA8]">خرده‌فروشان</div>
              <div className="text-lg font-bold text-[#F4F4F6] font-mono mt-0.5">{retailersCount}</div>
            </div>
          </div>
        </div>

        {/* Operational Roles Snapshot */}
        <div className="p-5 rounded-2xl bg-[#171720] border border-[#292936] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EDEDED] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#C8A951]" />
              <span>نقش‌ها و پرسنل میدانی و اداری</span>
            </h3>
            <span className="text-xs text-[#9E9EA8]">{totalPersons} اشخاص فعال</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#1E1E28] border border-[#2E2E3E] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9E9EA8]">عاملان میدانی (کیف)</div>
                <div className="text-base font-bold text-[#F4F4F6] font-mono mt-0.5">{agentsCount} نفر</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#C8A951]/10 flex items-center justify-center text-[#C8A951]">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#1E1E28] border border-[#2E2E3E] flex items-center justify-between">
              <div>
                <div className="text-xs text-[#9E9EA8]">اختیارداران امضا و سفارش</div>
                <div className="text-base font-bold text-[#F4F4F6] font-mono mt-0.5">{totalMemberships} رابطه</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#3DD68C]/10 flex items-center justify-center text-[#3DD68C]">
                <Shield className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
