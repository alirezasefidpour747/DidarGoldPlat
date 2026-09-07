/**
 * Didar Gold Platform - Natural Person Detail View Drawer
 * Comprehensive inspection of identity, specialized profile, connected organizations, documents & audit history
 */

import React from 'react';
import { Party, Membership, PartyDocument, AuditEvent } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, Building2, FileCheck, History, Shield, Edit3, ShieldAlert, Link2, PlusCircle, UserCheck } from 'lucide-react';

interface PersonDetailDrawerProps {
  person: Party | null;
  onClose: () => void;
  memberships: Membership[];
  documents: PartyDocument[];
  auditLogs: AuditEvent[];
  onEdit: (person: Party) => void;
  onStatusChange: (person: Party) => void;
  onAddMembership: (person: Party) => void;
  onUploadDocument: (person: Party) => void;
}

export const PersonDetailDrawer: React.FC<PersonDetailDrawerProps> = ({
  person,
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

  if (!person) return null;

  const personMemberships = memberships.filter(m => m.partyId === person.id);
  const personDocs = documents.filter(d => d.targetType === 'party' && d.targetId === person.id);
  const personAudits = auditLogs.filter(a => a.targetType === 'party' && a.targetId === person.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl bg-[#16161E] border-s border-[#2A2A3A] h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#282838] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#242434] border border-[#3A3A4E] flex items-center justify-center text-[#C8A951] font-bold">
              {person.firstName[0]}{person.lastName[0]}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F4F4F6]">{person.firstName} {person.lastName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#C8A951] font-medium">{person.partyType}</span>
                <span className="text-[#555566]">|</span>
                <span className="text-xs text-[#3DD68C] font-mono">{person.status}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(person)}
              className="p-2 rounded-lg bg-[#222230] hover:bg-[#2C2C3C] text-[#EDEDED] border border-[#333346] transition-colors"
              title={t.edit}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusChange(person)}
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
          {/* Identity Card */}
          <div className="p-4 rounded-xl bg-[#1B1B26] border border-[#2B2B3C] space-y-3">
            <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              <span>هویت و مشخصات ثبت شده</span>
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#888898] block">شماره تماس:</span>
                <span className="font-mono text-[#EDEDED] font-medium">{person.mobile}</span>
              </div>
              <div>
                <span className="text-[#888898] block">کد ملی:</span>
                <span className="font-mono text-[#EDEDED] font-medium">{person.nationalId || '—'}</span>
              </div>
              <div>
                <span className="text-[#888898] block">پست الکترونیکی:</span>
                <span className="font-mono text-[#EDEDED]">{person.email || '—'}</span>
              </div>
              <div>
                <span className="text-[#888898] block">وضعیت احراز:</span>
                <span className="text-[#3DD68C] font-medium">{person.verificationStatus}</span>
              </div>
              <div>
                <span className="text-[#888898] block">شناسه یکتای سیستم:</span>
                <span className="font-mono text-[10px] text-[#A6A6B8]">{person.id}</span>
              </div>
              <div>
                <span className="text-[#888898] block">نسخه رکورد:</span>
                <span className="font-mono text-xs text-[#C8A951]">v{person.version}</span>
              </div>
            </div>

            {person.notes && (
              <div className="pt-2 border-t border-[#2A2A3C] text-xs text-[#B5B5C4] leading-relaxed">
                <span className="text-[#888898] block mb-0.5">یادداشت اداری:</span>
                {person.notes}
              </div>
            )}
          </div>

          {/* Specialized Persona Profile */}
          {person.agentProfile && (
            <div className="p-4 rounded-xl bg-[#1C1A14] border border-[#3D3522] space-y-2.5">
              <h4 className="text-xs font-bold text-[#E5C365]">مشخصات تخصصی عامل میدانی طلا</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#9E9E88] block">کد یکتای ویزیتور:</span>
                  <span className="font-mono text-[#EDEDED] font-bold">{person.agentProfile.agentCode}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">شیوه کاری:</span>
                  <span className="text-[#EDEDED]">{person.agentProfile.operatingMode}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">قلمرو جغرافیایی:</span>
                  <span className="text-[#EDEDED]">{person.agentProfile.territory}</span>
                </div>
                <div>
                  <span className="text-[#9E9E88] block">درصد کارمزد:</span>
                  <span className="font-mono text-[#EDEDED]">{person.agentProfile.commissionRatePercent || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {person.internalProfile && (
            <div className="p-4 rounded-xl bg-[#14181F] border border-[#232F3E] space-y-2.5">
              <h4 className="text-xs font-bold text-[#65A7E5]">مشخصات سازمانی پرسنل دیدار</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#8898A8] block">کد پرسنلی:</span>
                  <span className="font-mono text-[#EDEDED] font-bold">{person.internalProfile.personnelCode}</span>
                </div>
                <div>
                  <span className="text-[#8898A8] block">واحد سازمانی:</span>
                  <span className="text-[#EDEDED]">{person.internalProfile.department}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[#8898A8] block">سمت سازمانی:</span>
                  <span className="text-[#EDEDED]">{person.internalProfile.jobTitle}</span>
                </div>
              </div>
            </div>
          )}

          {person.consumerProfile && (
            <div className="p-4 rounded-xl bg-[#141917] border border-[#203328] space-y-2.5">
              <h4 className="text-xs font-bold text-[#3DD68C]">اطلاعات خریدار و مشتری نهایی</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#88A898] block">شهر / استان:</span>
                  <span className="text-[#EDEDED]">{person.consumerProfile.city || '—'}</span>
                </div>
                <div>
                  <span className="text-[#88A898] block">روش ارتباط:</span>
                  <span className="text-[#EDEDED]">{person.consumerProfile.preferredContactMethod || 'sms'}</span>
                </div>
                {person.consumerProfile.address && (
                  <div className="col-span-2">
                    <span className="text-[#88A898] block">نشانی تحویل:</span>
                    <span className="text-[#EDEDED]">{person.consumerProfile.address}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Connected Organization Memberships */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F4F4F6] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#C8A951]" />
                <span>سازمان‌های متصل و اختیارات تجاری ({personMemberships.length})</span>
              </h4>
              <button
                onClick={() => onAddMembership(person)}
                className="text-[11px] text-[#C8A951] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{t.linkMembership}</span>
              </button>
            </div>

            {personMemberships.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                این شخص در حال حاضر عضو مستقیم هیچ سازمان تجاری ثبت‌شده‌ای نیست.
              </div>
            ) : (
              <div className="space-y-2.5">
                {personMemberships.map(mem => (
                  <div key={mem.id} className="p-3.5 rounded-xl bg-[#191924] border border-[#2D2D3E] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-[#EDEDED]">{mem.organizationName}</div>
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
                    <div className="text-[10px] text-[#7A7A8A] pt-1">
                      اعتبار: {mem.validFrom} تا {mem.validTo || 'نامحدود'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Documents Vault */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#F4F4F6] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#C8A951]" />
                <span>مدارک و گواهینامه‌های پیوست ({personDocs.length})</span>
              </h4>
              <button
                onClick={() => onUploadDocument(person)}
                className="text-[11px] text-[#C8A951] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                <span>{t.uploadDocument}</span>
              </button>
            </div>

            {personDocs.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                مدرکی برای این پرونده در صندوق بارگذاری نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {personDocs.map(doc => (
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
              <span>تاریخچه و رویدادهای حسابرسی ({personAudits.length})</span>
            </h4>

            {personAudits.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1A1A24] border border-[#282836] text-xs text-[#7A7A8A] text-center">
                رویداد حسابرسی اختصاصی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-2">
                {personAudits.map(log => (
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
