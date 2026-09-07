/**
 * Didar Gold Platform - Document Vault & Compliance Verification
 */

import React, { useState } from 'react';
import { PartyDocument, Party, Organization, DocumentType, VerificationStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Search, FileCheck2, PlusCircle, CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface DocumentVaultProps {
  documents: PartyDocument[];
  persons: Party[];
  organizations: Organization[];
  onUploadDocument: (data: Partial<PartyDocument>) => Promise<void>;
  onVerifyDocument: (docId: string, status: VerificationStatus) => Promise<void>;
  preselectedTarget?: { type: 'party' | 'organization'; id: string } | null;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  persons,
  organizations,
  onUploadDocument,
  onVerifyDocument,
  preselectedTarget
}) => {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form State
  const [targetType, setTargetType] = useState<'party' | 'organization'>('organization');
  const [targetId, setTargetId] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('guild_license');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTargetName = (doc: PartyDocument) => {
    if (doc.targetType === 'party') {
      const p = persons.find(item => item.id === doc.targetId);
      return p ? `${p.firstName} ${p.lastName}` : doc.targetId;
    } else {
      const o = organizations.find(item => item.id === doc.targetId);
      return o ? o.displayName : doc.targetId;
    }
  };

  const getDocTypeLabel = (type: DocumentType) => {
    switch (type) {
      case 'guild_license': return 'جواز کسب اتحادیه طلا';
      case 'company_registration': return 'آگهی تاسیس / ثبت شرکت';
      case 'national_id_card': return 'کارت ملی هوشمند';
      case 'partnership_contract': return 'قرارداد همکاری و عاملیت';
      case 'tax_certificate': return 'گواهی ارزش افزوده و مالیاتی';
      case 'warranty_certificate': return 'ضمانت‌نامه و تضامین زرین';
      default: return 'سایر اسناد';
    }
  };

  const handleOpenUpload = () => {
    if (preselectedTarget) {
      setTargetType(preselectedTarget.type);
      setTargetId(preselectedTarget.id);
    } else {
      setTargetType('organization');
      setTargetId(organizations[0]?.id || '');
    }
    setDocumentType('guild_license');
    setFileName('');
    setNotes('');
    setError(null);
    setIsUploadOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!targetId) {
      setError('انتخاب پرونده مقصد الزامی است.');
      return;
    }
    if (!fileName.trim()) {
      setError('نام یا عنوان فایل الزامی است.');
      return;
    }

    const payload: Partial<PartyDocument> = {
      targetType,
      targetId,
      documentType,
      fileName: fileName.trim(),
      fileSize: Math.floor(Math.random() * 800000) + 150000,
      mimeType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      fileUri: `/vault/${targetType}/${targetId}/${Date.now()}_${fileName.trim()}`,
      verificationStatus: 'verified',
      uploadedBy: 'اداره انطباق دیدار (Compliance Officer)',
      notes: notes.trim() || undefined
    };

    try {
      setIsSubmitting(true);
      await onUploadDocument(payload);
      setIsUploadOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطا در بارگذاری مدرک.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = documents.filter(d => {
    const targetName = getTargetName(d).toLowerCase();
    const matchSearch =
      targetName.includes(searchTerm.toLowerCase()) ||
      d.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.notes && d.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = selectedDocType === 'all' || d.documentType === selectedDocType;
    return matchSearch && matchType;
  });

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
            placeholder="جستجوی مدرک با نام طرف، نام فایل، یادداشت..."
            className="w-full bg-[#121217] border border-[#2C2C3C] focus:border-[#C8A951] text-xs text-[#EDEDED] pr-9 pl-4 py-2.5 rounded-xl outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDocType}
            onChange={(e) => setSelectedDocType(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه انواع مدارک</option>
            <option value="guild_license">جواز کسب اتحادیه</option>
            <option value="company_registration">آگهی ثبتی شرکت</option>
            <option value="national_id_card">کارت ملی</option>
            <option value="partnership_contract">قرارداد همکاری</option>
            <option value="tax_certificate">گواهی مالیاتی</option>
            <option value="warranty_certificate">ضمانت‌نامه</option>
          </select>

          <button
            onClick={handleOpenUpload}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A951] hover:bg-[#D4AF37] text-[#141416] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t.uploadDocument}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#171720] border border-[#272736] rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1B1B26] border-b border-[#292938] text-[#9E9EA8] font-medium">
                <th className="py-3 px-4">عنوان فایل سند</th>
                <th className="py-3 px-4">نوع سند</th>
                <th className="py-3 px-4">طرف پیوست (شخص / سازمان)</th>
                <th className="py-3 px-4">حجم و قالب</th>
                <th className="py-3 px-4">وضعیت احراز انطباق</th>
                <th className="py-3 px-4">ثبت‌کننده</th>
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
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#1E1E2A]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#EDEDED] text-xs flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-[#C8A951]" />
                        <span>{doc.fileName}</span>
                      </div>
                      {doc.notes && (
                        <div className="text-[10px] text-[#868696] mt-0.5 line-clamp-1">{doc.notes}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#242434] text-[#C8A951] text-[11px] border border-[#37374C]">
                        {getDocTypeLabel(doc.documentType)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-[#EDEDED] font-medium">{getTargetName(doc)}</div>
                      <div className="text-[10px] text-[#7A7A8A]">
                        {doc.targetType === 'party' ? 'شخص حقیقی' : 'کسب‌وکار / سازمان'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#9E9EA8]">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType}
                    </td>

                    <td className="py-3.5 px-4">
                      {doc.verificationStatus === 'verified' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>تایید و معتبر</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30">
                          <Clock className="w-3 h-3" />
                          <span>در انتظار تایید</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#A6A6B4]">
                      {doc.uploadedBy || 'سیستم بازرسی دیدار'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onVerifyDocument(doc.id, doc.verificationStatus === 'verified' ? 'unverified' : 'verified')}
                          className="p-1.5 rounded-lg bg-[#22222E] hover:bg-[#2C2C3C] text-[#3DD68C] border border-[#333346] transition-colors cursor-pointer"
                          title="تغییر وضعیت استعلام"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
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

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#292938]">
              <h3 className="text-base font-bold text-[#F4F4F6] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#C8A951]" />
                <span>بارگذاری مدرک در صندوق امن اسناد</span>
              </h3>
              <button onClick={() => setIsUploadOpen(false)} className="p-1 text-[#8A8A9A] hover:text-[#EDEDED]">
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {error && (
                <div className="p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2 text-xs text-[#FF6B6B]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">نوع پرونده مقصد</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('organization');
                      setTargetId(organizations[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border cursor-pointer ${
                      targetType === 'organization' ? 'bg-[#C8A951] text-[#121214] font-bold border-[#C8A951]' : 'bg-[#1D1D28] text-[#9E9EA8] border-[#2E2E3E]'
                    }`}
                  >
                    سازمان / کسب‌وکار
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('party');
                      setTargetId(persons[0]?.id || '');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border cursor-pointer ${
                      targetType === 'party' ? 'bg-[#C8A951] text-[#121214] font-bold border-[#C8A951]' : 'bg-[#1D1D28] text-[#9E9EA8] border-[#2E2E3E]'
                    }`}
                  >
                    شخص حقیقی
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">پرونده طرف قرارداد *</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                >
                  {targetType === 'organization'
                    ? organizations.map(o => (
                        <option key={o.id} value={o.id}>{o.displayName} ({o.organizationType})</option>
                      ))
                    : persons.map(p => (
                        <option key={p.id} value={p.id}>{p.firstName} {p.lastName} ({p.partyType})</option>
                      ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">نوع مدرک *</label>
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value as DocumentType)}
                  className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                >
                  <option value="guild_license">جواز کسب اتحادیه طلا</option>
                  <option value="company_registration">آگهی ثبتی شرکت</option>
                  <option value="national_id_card">کارت ملی هوشمند</option>
                  <option value="partnership_contract">قرارداد عاملیت و همکاری</option>
                  <option value="tax_certificate">گواهی مالیاتی</option>
                  <option value="warranty_certificate">ضمانت‌نامه و تضامین</option>
                  <option value="other">سایر</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">عنوان / نام فایل سند *</label>
                <input
                  type="text"
                  required
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="مثال: license_guild_1405.pdf"
                  className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">توضیحات و یادداشت انطباق</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="توضیحات مربوط به استعلام اصالت سند..."
                  className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292938]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 text-xs text-[#8A8A9A] hover:bg-[#222230] rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-[#121214] bg-[#C8A951] hover:bg-[#D4AF37] rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'در حال ثبت...' : 'بارگذاری و تایید'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
