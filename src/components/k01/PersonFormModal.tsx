/**
 * Didar Gold Platform - Natural Person Create & Edit Modal
 * Distinct forms with specialized fields for each party persona.
 */

import React, { useState, useEffect } from 'react';
import { Party, PartyType, EntityStatus, VerificationStatus } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, AlertCircle, ShieldAlert, Check } from 'lucide-react';

interface PersonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Party>) => Promise<void>;
  initialData?: Party | null;
}

export const PersonFormModal: React.FC<PersonFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { t } = useI18n();

  // Basic Identity
  const [partyType, setPartyType] = useState<PartyType>('consumer');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');
  const [notes, setNotes] = useState('');

  // Field Agent Specialized Fields
  const [agentCode, setAgentCode] = useState('');
  const [operatingMode, setOperatingMode] = useState<'mobile_gallery' | 'assisted_order' | 'hybrid'>('hybrid');
  const [territory, setTerritory] = useState('');
  const [agentEmployment, setAgentEmployment] = useState<'employed' | 'contractor' | 'partner'>('partner');
  const [commissionRate, setCommissionRate] = useState<number>(1.5);

  // Internal User Specialized Fields
  const [personnelCode, setPersonnelCode] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [internalEmployment, setInternalEmployment] = useState<'employed' | 'contractor' | 'partner'>('employed');
  const [startDate, setStartDate] = useState('');

  // Consumer Specialized Fields
  const [birthDate, setBirthDate] = useState('');
  const [preferredContact, setPreferredContact] = useState<'sms' | 'call' | 'whatsapp'>('sms');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [address, setAddress] = useState('');

  // External Representative Fields
  const [repTitle, setRepTitle] = useState('');
  const [authorityScope, setAuthorityScope] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setPartyType(initialData.partyType);
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setNationalId(initialData.nationalId || '');
      setMobile(initialData.mobile);
      setEmail(initialData.email || '');
      setStatus(initialData.status);
      setVerificationStatus(initialData.verificationStatus);
      setNotes(initialData.notes || '');

      if (initialData.agentProfile) {
        setAgentCode(initialData.agentProfile.agentCode || '');
        setOperatingMode(initialData.agentProfile.operatingMode || 'hybrid');
        setTerritory(initialData.agentProfile.territory || '');
        setAgentEmployment(initialData.agentProfile.employmentType || 'partner');
        setCommissionRate(initialData.agentProfile.commissionRatePercent || 0);
      }

      if (initialData.internalProfile) {
        setPersonnelCode(initialData.internalProfile.personnelCode || '');
        setDepartment(initialData.internalProfile.department || '');
        setJobTitle(initialData.internalProfile.jobTitle || '');
        setInternalEmployment(initialData.internalProfile.employmentType || 'employed');
        setStartDate(initialData.internalProfile.startDate || '');
      }

      if (initialData.consumerProfile) {
        setBirthDate(initialData.consumerProfile.birthDate || '');
        setPreferredContact(initialData.consumerProfile.preferredContactMethod || 'sms');
        setCity(initialData.consumerProfile.city || '');
        setProvince(initialData.consumerProfile.province || '');
        setAddress(initialData.consumerProfile.address || '');
      }

      if (initialData.representativeProfile) {
        setRepTitle(initialData.representativeProfile.title || '');
        setAuthorityScope(initialData.representativeProfile.authorityScope || '');
        setValidUntil(initialData.representativeProfile.validUntil || '');
      }
    } else {
      // Reset defaults
      setPartyType('consumer');
      setFirstName('');
      setLastName('');
      setNationalId('');
      setMobile('');
      setEmail('');
      setStatus('active');
      setVerificationStatus('unverified');
      setNotes('');
      setAgentCode('');
      setTerritory('');
      setPersonnelCode('');
      setDepartment('');
      setJobTitle('');
      setCity('');
      setProvince('');
      setAddress('');
      setRepTitle('');
      setAuthorityScope('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('نام و نام خانوادگی الزامی است.');
      return;
    }

    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10) {
      setError('شماره همراه معتبر الزامی است.');
      return;
    }

    // Specialized validations
    if (partyType === 'field_agent') {
      if (!agentCode.trim()) {
        setError('کد یکتای عامل برای عامل میدانی الزامی است.');
        return;
      }
      if (!territory.trim()) {
        setError('تعیین قلمرو فعالیت برای عامل میدانی الزامی است.');
        return;
      }
    }

    if (partyType === 'internal_user') {
      if (!personnelCode.trim()) {
        setError('کد پرسنلی برای کاربر داخلی دیدار الزامی است.');
        return;
      }
      if (!department.trim() || !jobTitle.trim()) {
        setError('واحد سازمانی و سمت شغلی برای پرسنل الزامی است.');
        return;
      }
    }

    const payload: Partial<Party> = {
      partyType,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      nationalId: nationalId.trim() || undefined,
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      status,
      verificationStatus,
      notes: notes.trim() || undefined
    };

    if (partyType === 'field_agent') {
      payload.agentProfile = {
        agentCode: agentCode.trim(),
        operatingMode,
        territory: territory.trim(),
        employmentType: agentEmployment,
        commissionRatePercent: Number(commissionRate) || 0
      };
    }

    if (partyType === 'internal_user') {
      payload.internalProfile = {
        personnelCode: personnelCode.trim(),
        department: department.trim(),
        jobTitle: jobTitle.trim(),
        employmentType: internalEmployment,
        startDate: startDate || undefined
      };
    }

    if (partyType === 'consumer') {
      payload.consumerProfile = {
        birthDate: birthDate || undefined,
        preferredContactMethod: preferredContact,
        city: city.trim() || undefined,
        province: province.trim() || undefined,
        address: address.trim() || undefined
      };
    }

    if (partyType === 'external_representative') {
      payload.representativeProfile = {
        title: repTitle.trim() || 'نماینده رسمی',
        authorityScope: authorityScope.trim(),
        validUntil: validUntil || undefined
      };
    }

    if (initialData) {
      payload.version = initialData.version;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(payload);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'خطا در ثبت اطلاعات.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292938]">
          <h3 className="text-base font-bold text-[#F4F4F6]">
            {initialData ? `ویرایش پرونده: ${initialData.firstName} ${initialData.lastName}` : t.createPerson}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8A8A9A] hover:text-[#EDEDED] hover:bg-[#252534]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 flex items-center gap-2.5 text-xs text-[#FF6B6B]">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Party Classification Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#B5B5C2] mb-1.5">{t.partyType} *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'consumer', label: t.consumer },
                { id: 'field_agent', label: t.fieldAgent },
                { id: 'internal_user', label: t.internalUser },
                { id: 'retailer_owner', label: t.retailerOwner },
                { id: 'supplier_representative', label: t.supplierRepresentative },
                { id: 'external_representative', label: t.externalRepresentative },
                { id: 'platform_admin', label: t.platformAdmin }
              ].map(pt => (
                <button
                  type="button"
                  key={pt.id}
                  onClick={() => setPartyType(pt.id as PartyType)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    partyType === pt.id
                      ? 'bg-[#C8A951] text-[#141416] font-bold border-[#C8A951] shadow-sm'
                      : 'bg-[#1C1C26] text-[#A6A6B4] border-[#2E2E3E] hover:border-[#404055]'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Critical Platform Admin Policy Warning */}
          {partyType === 'platform_admin' && (
            <div className="p-3.5 rounded-xl bg-[#E5A84B]/10 border border-[#E5A84B]/30 flex items-start gap-2.5 text-xs text-[#E5A84B]">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {t.adminNotice}
              </p>
            </div>
          )}

          {/* Base Identity Information */}
          <div className="p-4 rounded-xl bg-[#13131A] border border-[#262634] space-y-4">
            <h4 className="text-xs font-bold text-[#E5C365]">مشخصات فردی و هویتی پایه</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.firstName} *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="مثال: علیرضا"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.lastName} *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="مثال: سفیدپور"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.mobile} *</label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="مثال: 09121112233"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.nationalId}</label>
                <input
                  type="text"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  placeholder="۱۰ رقم کد ملی"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.email}</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Persona-Specific Specialized Profile Fields */}
          {partyType === 'field_agent' && (
            <div className="p-4 rounded-xl bg-[#1C1A14] border border-[#3E3825] space-y-4">
              <h4 className="text-xs font-bold text-[#E5C365]">مشخصات عملیاتی ویزیتور و عامل میدانی</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.agentCode} *</label>
                  <input
                    type="text"
                    required
                    value={agentCode}
                    onChange={e => setAgentCode(e.target.value)}
                    placeholder="مثال: AGT-TEH-104"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.operatingMode} *</label>
                  <select
                    value={operatingMode}
                    onChange={e => setOperatingMode(e.target.value as any)}
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  >
                    <option value="hybrid">{t.hybrid}</option>
                    <option value="mobile_gallery">{t.mobileGallery}</option>
                    <option value="assisted_order">{t.assistedOrder}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.territory} *</label>
                  <input
                    type="text"
                    required
                    value={territory}
                    onChange={e => setTerritory(e.target.value)}
                    placeholder="مثال: منطقه بازار و شمال تهران"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">درصد کارمزد فروش (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={commissionRate}
                    onChange={e => setCommissionRate(parseFloat(e.target.value))}
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {partyType === 'internal_user' && (
            <div className="p-4 rounded-xl bg-[#14181F] border border-[#232F3E] space-y-4">
              <h4 className="text-xs font-bold text-[#65A7E5]">اطلاعات پرسنلی و سازمانی دیدار</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.personnelCode} *</label>
                  <input
                    type="text"
                    required
                    value={personnelCode}
                    onChange={e => setPersonnelCode(e.target.value)}
                    placeholder="مثال: EMP-0042"
                    className="w-full bg-[#101318] border border-[#232F3E] focus:border-[#65A7E5] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">واحد سازمانی *</label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="مثال: عملیات خزانه و امانات"
                    className="w-full bg-[#101318] border border-[#232F3E] focus:border-[#65A7E5] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">عنوان سمت شغلی *</label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    placeholder="مثال: کارشناس ارشد پذیرش طلا"
                    className="w-full bg-[#101318] border border-[#232F3E] focus:border-[#65A7E5] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">تاریخ شروع همکاری</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-[#101318] border border-[#232F3E] focus:border-[#65A7E5] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {partyType === 'consumer' && (
            <div className="p-4 rounded-xl bg-[#141917] border border-[#203328] space-y-4">
              <h4 className="text-xs font-bold text-[#3DD68C]">اطلاعات تکمیلی مشتری نهایی</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">استان و شهر</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="مثال: تهران"
                    className="w-full bg-[#101412] border border-[#203328] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">روش ترجیحی ارتباط</label>
                  <select
                    value={preferredContact}
                    onChange={e => setPreferredContact(e.target.value as any)}
                    className="w-full bg-[#101412] border border-[#203328] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  >
                    <option value="sms">پیامک (SMS)</option>
                    <option value="call">تماس تلفنی</option>
                    <option value="whatsapp">واتس‌اپ</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#9E9EA8] mb-1">نشانی پستی دریافت کالا</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="نشانی دقیق برای تحویل فیزیکی یا ارسال ضمانت‌نامه..."
                    className="w-full bg-[#101412] border border-[#203328] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">وضعیت فعالیت</label>
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

            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">وضعیت احراز و استعلام</label>
              <select
                value={verificationStatus}
                onChange={e => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
              >
                <option value="unverified">{t.verificationUnverified}</option>
                <option value="pending">{t.verificationPending}</option>
                <option value="verified">{t.verificationVerified}</option>
                <option value="rejected">{t.verificationRejected}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs text-[#9E9EA8] mb-1">یادداشت اداری / سوابق پرونده</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="توضیحات و یادداشت‌های مجاز برای اپراتورهای ارشد دیدار..."
                className="w-full bg-[#121218] border border-[#2C2C3C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
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
