/**
 * Didar Gold Platform - Organization Detail View Drawer
 * Comprehensive inspection of legal entity, specialized industry profile, members, documents & audit
 */

import React from 'react';
import { Organization, Membership, PartyDocument, AuditEvent } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, Users, FileCheck, History, Building2, Edit3, ShieldAlert, PlusCircle, Factory, Store, Briefcase } from 'lucide-react';

interface OrganizationDetailDrawerProps {
  organization: Organization | null;
  onClose: () => void;
  memberships: Membership[];
  documents: PartyDocument[];
  auditLogs: AuditEvent[];
  onEdit: (org: Organization) => void;
  onStatusChange: (org: Organization) => void;
  onAddMembership: (org: Organization) => void;
  onUploadDocument: (org: Organization) => void;
}

export const OrganizationDetailDrawer: React.FC<OrganizationDetailDrawerProps> = ({
  organization,
  onClose,
  memberships,
  documents,
  auditLogs,
  onEdit,
  onStatusChange,
  onAddMembership,
  onUploadDocument
}) => {
  const { t } = useI18n();

  if (!organization) return null;

  const orgMemberships = memberships.filter(m => m.organizationId === organization.id);
  const orgDocs = documents.filter(d => d.targetType === 'organization' && d.targetId === organization.id);
  const orgAudits = auditLogs.filter(a => a.targetType === 'organization' && a.targetId === organization.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[#16161E] border-s border-[#2A2A3A] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#282838] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242434] border border-[#3A3A4E] flex items-center justify-center text-[#C8A951]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F4F6]">{organization.displayName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#C8A951] font-medium">{organization.organizationType}</span>
                <span className="text-[#555566]">|</span>
                <span className="text-xs text-[#3DD68C] font-mono">{organization.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(organization)}
              className="p-2 rounded-lg bg-[#222230] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#333346] transition-colors"
              title={t.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(organization)}
              className="p-2 rounded-lg bg-[#222230] hover:bg-[#2C2C3C] text-[#E5A84B] border border-[#333346] transition-colors"
              title={t.confirmStatusChange}
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#222230] hover:bg-[#2C2C3C] text-[#868696] hover:text-[#EDEDED] border border-[#333346] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Identity & Legal Info */}
          <div className="p-4 rounded-xl bg-[#1B1B26] border border-[#2B2B3C] space-y-3">
            <h4 className="text-xs font-bold text-[#E5C365]">مشخصات ثبتی و حقوقی</h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <span className="text-[#888898] block">نام رسمی و ثبتی:</span>
                <span className="text-[#EDEDED] font-semibold">{organization.legalName}</span>
              </div>
              <div>
                <span className="text-[#888898] block">شناسه ملی:</span>
                <span className="font-mono text-[#EDEDED] font-medium">{organization.nationalLegalId || '—'}</span>
              </div>
              <div>
                <span className="text-[#888898] block">شماره ثبت:</span>
                <span className="font-mono text-[#EDEDED] font-medium">{organization.registrationNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[#888898] block">تلفن تماس:</span>
                <span className="font-mono text-[#EDEDED]">{organization.phone}</span>
              </div>
              <div>
                <span className="text-[#888898] block">وب‌سایت:</span>
                <span className="font-mono text-[#C8A951]">{organization.website || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[#888898] block">نشانی:</span>
                <span className="text-[#D8D8E0]">{organization.address || `${organization.province || ''} ${organization.city || ''}`}</span>
              </div>
            </div>

            {organization.notes && (
              <div className="pt-2 border-t border-[#2A2A3C] text-xs text-[#B5B5C4] leading-relaxed">
                <span className="text-[#888898] block mb-0.5">یادداشت اداری:</span>
                {organization.notes}
              </div>
            )}
          </div>

          {/* Specialized Industry Profile */}
          {organization.manufacturerProfile && (
            <div className="p-4 rounded-xl bg-[#1C1A14] border border-[#3D3522] space-y-2.5">
              <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Factory className="w-4 h-4" />
                <span>پروفایل کارگاه تولیدی و ظرفیت ساخت</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9E9E88] block">کد یکتای سازنده:</span>
                  <span className="font-mono text-[#EDEDED] font-bold">{organization.manufacturerProfile.supplierCode}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">ظرفیت ماهانه:</span>
                  <span className="font-mono text-[#EDEDED] font-bold text-sm">
                    {organization.manufacturerProfile.monthlyCapacityGrams.toLocaleString('fa-IR')} گرم
                  </span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">پروانه بهره‌برداری:</span>
                  <span className="font-mono text-[#EDEDED]">{organization.manufacturerProfile.productionLicenseNumber}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">نام برند تجاری:</span>
                  <span className="text-[#EDEDED]">{organization.manufacturerProfile.brandName}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#9E9E88] block">دسته‌های تخصصی:</span>
                  <span className="text-[#EDEDED]">{organization.manufacturerProfile.productCategories}</span>
                </div>
              </div>
            </div>
          )}

          {organization.wholesalerProfile && (
            <div className="p-4 rounded-xl bg-[#1C1814] border border-[#3D3222] space-y-2.5">
              <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>پروفایل بنکداری و شبکه توزیع</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9E9E88] block">کد بنکداری:</span>
                  <span className="font-mono text-[#EDEDED] font-bold">{organization.wholesalerProfile.supplierCode}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">محدوده توزیع:</span>
                  <span className="text-[#EDEDED]">{organization.wholesalerProfile.coverageTerritory}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#9E9E88] block">دسته‌های عرضه:</span>
                  <span className="text-[#EDEDED]">{organization.wholesalerProfile.productCategories}</span>
                </div>
              </div>
            </div>
          )}

          {organization.retailerProfile && (
            <div className="p-4 rounded-xl bg-[#141A17] border border-[#203328] space-y-2.5">
              <h4 className="text-xs font-bold text-[#3DD68C] flex items-center gap-1.5">
                <Store className="w-4 h-4" />
                <span>پروفایل فروشگاه طلا و پروانه صنفی</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#88A898] block">کد خرده‌فروشی:</span>
                  <span className="font-mono text-[#EDEDED] font-bold">{organization.retailerProfile.retailerCode}</span>
                </div>
                <div>
                  <span className="text-[#88A898] block">شماره جواز کسب:</span>
                  <span className="font-mono text-[#EDEDED]">{organization.retailerProfile.guildLicenseNumber}</span>
                </div>
                <div>
                  <span className="text-[#88A898] block">نوع فروشگاه:</span>
                  <span className="text-[#EDEDED]">{organization.retailerProfile.storeType}</span>
                </div>
                <div>
                  <span className="text-[#88A898] block">ظرفیت چیدمان:</span>
                  <span className="font-mono text-[#EDEDED]">{organization.retailerProfile.displayCapacityPieces} قطعه</span>
                </div>
              </div>
            </div>
          )}

          {/* Members Connected to this Organization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F4F4F6] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C8A951]" />
                <span>اعضا، امضاداران و نمایندگان این سازمان ({orgMemberships.length})</span>
              </h4>
              <button
                onClick={() => onAddMembership(organization)}
                className="text-[11px] text-[#C8A951] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>افزودن عضو جدید</span>
              </button>
            </div>

            {orgMemberships.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                هنوز هیچ فردی به عنوان عضو یا نماینده این سازمان ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-2.5">
                {orgMemberships.map(mem => (
                  <div key={mem.id} className="p-3.5 rounded-xl bg-[#191924] border border-[#2D2D3E] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-[#EDEDED]">{mem.partyName}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A3A] text-[#C8A951] border border-[#3E3E52]">
                        {mem.roleKey}
                      </span>
                    </div>
                    <div className="text-xs text-[#A6A6B8]">{mem.title}</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {mem.authorities.map(auth => (
                        <span key={auth} className="px-2 py-0.5 rounded bg-[#20202E] text-[10px] text-[#3DD68C] border border-[#2E2E42]">
                          {auth === 'can_order' && 'ثبت سفارش'}
                          {auth === 'can_sign' && 'حق امضا'}
                          {auth === 'can_manage_members' && 'مدیریت اعضا'}
                          {auth === 'can_view_finance' && 'مشاهده مالی'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance & Verification Documents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F4F4F6] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C8A951]" />
                <span>پروانه‌ها و اسناد پیوست سازمان ({orgDocs.length})</span>
              </h4>
              <button
                onClick={() => onUploadDocument(organization)}
                className="text-[11px] text-[#C8A951] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{t.uploadDocument}</span>
              </button>
            </div>

            {orgDocs.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                مدرکی برای این سازمان در صندوق بارگذاری نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {orgDocs.map(doc => (
                  <div key={doc.id} className="p-3 rounded-xl bg-[#191924] border border-[#2A2A3A] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-[#EDEDED]">{doc.fileName}</div>
                      <div className="text-[10px] text-[#7A7A8A] font-mono mt-0.5">
                        {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                      {doc.verificationStatus}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit History */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#F4F4F6] flex items-center gap-2">
              <History className="w-4 h-4 text-[#C8A951]" />
              <span>تاریخچه تغییرات این سازمان ({orgAudits.length})</span>
            </h4>

            {orgAudits.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                رویداد حسابرسی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {orgAudits.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-[#191924] border border-[#282838] text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#7A7A8A]">
                      <span className="text-[#C8A951] font-medium">{log.actorName}</span>
                      <span className="font-mono">{new Date(log.timestamp).toLocaleString('fa-IR')}</span>
                    </div>
                    <div className="text-[#D8D8E2]">{log.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
