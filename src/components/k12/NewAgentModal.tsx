/**
 * Didar Gold Platform - Kernel Domain K12
 * NewAgentModal: Assign Field Agent Role to a Person from Domain K01
 * 
 * Implements Party-Role Architecture:
 * - Selects an existing verified Person from K01 (Identity/Party)
 * - Or quickly attaches a newly registered Person into K01
 * - Attaches Field Mission, Security Clearance, Territory & Guarantor Bond in K12
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  ShieldCheck,
  Building2,
  FileCheck,
  Phone,
  Truck,
  AlertTriangle,
  ShoppingBag,
  PackageCheck,
  UserCheck,
  Search,
  ExternalLink,
  Info,
  CheckCircle2
} from 'lucide-react';
import { FieldAgent, Territory, SecurityClearanceLevel, AgentDutyStatus, AgentRole } from '../../types/k12.js';
import { Party } from '../../types/k01.js';
import { api } from '../../lib/api.js';

interface NewAgentModalProps {
  territories: Territory[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (agentData: Partial<FieldAgent>) => Promise<void>;
  onNavigateToK01?: () => void;
}

export const NewAgentModal: React.FC<NewAgentModalProps> = ({
  territories,
  isOpen,
  onClose,
  onSubmit,
  onNavigateToK01
}) => {
  // K01 Persons state
  const [persons, setPersons] = useState<Party[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [personSearch, setPersonSearch] = useState<string>('');

  // K12 Mission & Security parameters
  const [role, setRole] = useState<AgentRole>('buyer_rep');
  const [emergencyContactFa, setEmergencyContactFa] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [securityClearance, setSecurityClearance] = useState<SecurityClearanceLevel>('high_value');
  const [guarantorBondAmountToman, setGuarantorBondAmountToman] = useState(4000000000);
  const [guarantorDocReference, setGuarantorDocReference] = useState('سند ملکی ثبتی + ۲ فقره سفته صیادی بانکی');
  const [assignedTerritoryId, setAssignedTerritoryId] = useState(territories[0]?.id || 'ter-01');
  const [vehicleTypeFa, setVehicleTypeFa] = useState('موتورسیکلت مجهز به باکس ضددیلم و ردیاب ماهواره‌ای');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('ایران ۱۱ - ');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load verified Persons from Domain K01
  useEffect(() => {
    if (!isOpen) return;
    let isSubscribed = true;
    const fetchK01Persons = async () => {
      try {
        setIsLoadingPersons(true);
        const k01Res = await api.getK01Data();
        if (isSubscribed && k01Res && k01Res.persons) {
          setPersons(k01Res.persons);
          // Default to first person if available
          if (k01Res.persons.length > 0) {
            setSelectedPersonId(k01Res.persons[0].id);
          }
        }
      } catch (err) {
        console.warn('Could not fetch K01 people', err);
      } finally {
        if (isSubscribed) setIsLoadingPersons(false);
      }
    };

    fetchK01Persons();
    return () => {
      isSubscribed = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedPerson = persons.find(p => p.id === selectedPersonId);

  const filteredPersons = persons.filter(p => {
    if (!personSearch.trim()) return true;
    const query = personSearch.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const natId = p.nationalId || '';
    const mob = p.mobile || '';
    return fullName.includes(query) || natId.includes(query) || mob.includes(query);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedPerson) {
      setErrorMsg('لطفاً ابتدا شخص مورد نظر را از پایگاه اشخاص (K01) انتخاب کنید.');
      return;
    }

    const selectedTerritory = territories.find(t => t.id === assignedTerritoryId);

    const clearanceTitles: Record<SecurityClearanceLevel, string> = {
      armed_escort: 'اسکورت ویژه مسلح با مجوز رسمی ناجا',
      high_value: 'افسر ارشد ترابری کیفی و شمش',
      standard: 'نماینده مجاز ویزیت و ثبت سفارش',
      probationary: 'مأمور آزمایشی تحت نظارت سرپرست'
    };

    const roleFa = role === 'buyer_rep'
      ? 'مأمور خریدار و سفارش‌گیری'
      : 'مأمور حمل و تحویل فیزیکی طلا (کالارسان)';

    try {
      setIsSubmitting(true);
      await onSubmit({
        partyId: selectedPerson.id,
        fullNameFa: `${selectedPerson.firstName} ${selectedPerson.lastName}`,
        role,
        roleFa,
        isActive: true,
        nationalCode: selectedPerson.nationalId || '۰۰۰۰۰۰۰۰۰۰',
        phoneNumber: '۰۲۱-۵۵۶۱۰۰۰۰',
        mobileNumber: selectedPerson.mobile,
        emergencyContactFa: emergencyContactFa.trim() || 'بستگان درجه یک معرفی‌شده در پرونده پرسنلی',
        emergencyPhone: emergencyPhone.trim() || selectedPerson.mobile,
        securityClearance,
        securityClearanceFa: clearanceTitles[securityClearance],
        guarantorBondAmountToman: Number(guarantorBondAmountToman),
        guarantorDocReference: guarantorDocReference.trim(),
        dutyStatus: 'standby' as AgentDutyStatus,
        dutyStatusFa: 'آماده‌باش در شعبه یا خزانه',
        assignedTerritoryId,
        assignedTerritoryNameFa: selectedTerritory?.titleFa || 'تهران - بازار بزرگ',
        vehicleTypeFa: vehicleTypeFa.trim(),
        vehiclePlateNumber: vehiclePlateNumber.trim()
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در تخصیص نقش مأمور میدانی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-2xl bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">انتصاب مأمور میدانی از پایگاه اشخاص</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#C8A951]/20 text-[#E5C365] font-mono border border-[#C8A951]/30">
                  معماری Party-Role (K01 → K12)
                </span>
              </div>
              <p className="text-xs text-[#A0A0B5]">
                انتخاب شخص حقیقی از K01 و انتصاب مأموریت ترابری، وثیقه تضمین و قلمرو در K12
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Architecture Notice Banner */}
        <div className="mx-6 mt-4 p-3 bg-[#191928] border border-[#2B2B42] rounded-xl text-xs flex items-start gap-2.5 text-[#B8B8CF]">
          <Info className="w-4 h-4 text-[#C8A951] shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-[#E5C365]">عدم تکرار ثبت اشخاص:</strong> مطابق معماری تفکیک هویت و نقش، هویت پایه فرد (کد ملی، شناسنامه، اطلاعات هویتی) در دامنه <strong>K01 (اشخاص و سازمان‌ها)</strong> نگهداری می‌شود. در این فرم صرفاً نقش عملیاتی مأمور میدانی به شخص انتخابی الصاق می‌گردد.
          </p>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-3 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          
          {/* Section 1: K01 Person Lookup / Selection */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4" />
                مرحله ۱: انتخاب شخص حقیقی از پایگاه هویت (K01 Party)
              </span>
              <span className="text-[11px] text-[#88889D] font-mono">
                {persons.length} شخص ثبت‌شده در K01
              </span>
            </div>

            {/* Person Selector Dropdown & Filter */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-[#88889D] absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="جستجو در اشخاص K01 بر اساس نام، کدملی یا شماره موبایل..."
                    value={personSearch}
                    onChange={e => setPersonSearch(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 bg-[#14141E] rounded-lg border border-[#2E2E44] text-xs text-white placeholder-[#707085] focus:outline-none focus:border-[#C8A951]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A0A0B5] text-xs mb-1">
                  شخص مورد نظر جهت انتصاب به عنوان مأمور میدانی:
                </label>
                <select
                  value={selectedPersonId}
                  onChange={e => setSelectedPersonId(e.target.value)}
                  className="w-full p-2.5 bg-[#14141E] rounded-xl border border-[#32324A] text-xs text-white focus:outline-none focus:border-[#C8A951]"
                >
                  {filteredPersons.length === 0 ? (
                    <option value="">هیچ شخصی با این مشخصات در K01 یافت نشد</option>
                  ) : (
                    filteredPersons.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.firstName} {p.lastName} — کد ملی: {p.nationalId || 'فاقد کدملی'} — همراه: {p.mobile} ({p.partyType === 'field_agent' ? 'نقش فعلی: مأمور میدانی' : 'کاربر پایه'})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Selected Person Verified Snapshot Card */}
            {selectedPerson && (
              <div className="p-3 bg-[#13131D] rounded-xl border border-[#2B2B40] flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {selectedPerson.firstName} {selectedPerson.lastName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      احراز هویت شده در K01
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[#A0A0B5] text-[11px] font-mono">
                    <span>کد ملی: <strong className="text-white">{selectedPerson.nationalId || '---'}</strong></span>
                    <span>شماره همراه: <strong className="text-white">{selectedPerson.mobile}</strong></span>
                    <span>شناسه مرجع: <strong className="text-[#C8A951]">{selectedPerson.id}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Operational Role Selection */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              مرحله ۲: تعیین نوع مأموریت و نقش عملیاتی در K12
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole('buyer_rep')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  role === 'buyer_rep'
                    ? 'bg-[#C8A951]/15 border-[#C8A951] text-white shadow-sm'
                    : 'bg-[#161622] border-[#28283C] text-[#A0A0B5] hover:border-[#828299]'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 shrink-0 mt-0.5 ${role === 'buyer_rep' ? 'text-[#C8A951]' : 'text-[#828299]'}`} />
                <div>
                  <strong className={`block text-xs font-bold ${role === 'buyer_rep' ? 'text-white' : 'text-[#EDEDED]'}`}>
                    مأمور خریدار (ویزیتور و بازاریاب طلا)
                  </strong>
                  <span className="text-[11px] text-[#A0A0B5] leading-relaxed block mt-0.5">
                    ویزیت گالری‌ها، معرفی ویترین متحرک، مذاکره و ثبت سفارش نیابتی
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('carrier_delivery')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  role === 'carrier_delivery'
                    ? 'bg-[#C8A951]/15 border-[#C8A951] text-white shadow-sm'
                    : 'bg-[#161622] border-[#28283C] text-[#A0A0B5] hover:border-[#828299]'
                }`}
              >
                <PackageCheck className={`w-5 h-5 shrink-0 mt-0.5 ${role === 'carrier_delivery' ? 'text-[#C8A951]' : 'text-[#828299]'}`} />
                <div>
                  <strong className={`block text-xs font-bold ${role === 'carrier_delivery' ? 'text-white' : 'text-[#EDEDED]'}`}>
                    مأمور کالارسان (حمل فیزیکی و تحویل طلا)
                  </strong>
                  <span className="text-[11px] text-[#A0A0B5] leading-relaxed block mt-0.5">
                    ترابری مسلحانه، تطابق پلمپ امنیتی کیف و تحویل فیزیکی طلا به طلافروشی
                  </span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block text-[#A0A0B5] mb-1">فرد تماس اضطراری در حین تردد:</label>
                <input
                  type="text"
                  placeholder="مثلاً پدر - حاج علی داوودی"
                  value={emergencyContactFa}
                  onChange={e => setEmergencyContactFa(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
              <div>
                <label className="block text-[#A0A0B5] mb-1">شماره تماس اضطراری:</label>
                <input
                  type="text"
                  placeholder="۰۹۱۲۲۲۳۳۴۴۵"
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] font-mono text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Security Clearance & Guarantor */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              مرحله ۳: رده حفاظتی و وثیقه تضمین حسن انجام کار
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#A0A0B5] mb-1">رده امنیتی و صلاحیت ترابری:</label>
                <select
                  value={securityClearance}
                  onChange={e => setSecurityClearance(e.target.value as SecurityClearanceLevel)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
                >
                  <option value="armed_escort">اسکورت ویژه مسلح (مجوز ناجا)</option>
                  <option value="high_value">افسر ارشد ترابری کیفی و شمش (گرید A)</option>
                  <option value="standard">نماینده مجاز ویزیت و ثبت سفارش (گرید B)</option>
                  <option value="probationary">مأمور آزمایشی ۳ ماهه</option>
                </select>
              </div>
              <div>
                <label className="block text-[#A0A0B5] mb-1">مبلغ وثیقه تضمین (تومان):</label>
                <input
                  type="number"
                  step="500000000"
                  value={guarantorBondAmountToman}
                  onChange={e => setGuarantorBondAmountToman(Number(e.target.value) || 0)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] font-mono text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#A0A0B5] mb-1">شرح اسناد تضمین و شماره ثبت دفتر اسناد رسمی:</label>
                <input
                  type="text"
                  value={guarantorDocReference}
                  onChange={e => setGuarantorDocReference(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Territory & Vehicle */}
          <div className="bg-[#191926] border border-[#28283C] rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              مرحله ۴: تخصیص قلمرو بازار و وسیله نقلیه عملیاتی
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#A0A0B5] mb-1">قلمرو جغرافیایی مأموریت:</label>
                <select
                  value={assignedTerritoryId}
                  onChange={e => setAssignedTerritoryId(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
                >
                  {territories.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.titleFa} ({t.cityFa})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[#A0A0B5] mb-1">نوع وسیله نقلیه:</label>
                <input
                  type="text"
                  value={vehicleTypeFa}
                  onChange={e => setVehicleTypeFa(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[#A0A0B5] mb-1">شماره پلاک انتظامی وسیله نقلیه:</label>
                <input
                  type="text"
                  value={vehiclePlateNumber}
                  onChange={e => setVehiclePlateNumber(e.target.value)}
                  className="w-full p-2 bg-[#161622] rounded-lg border border-[#28283C] font-mono text-white focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-[#28283C] flex items-center justify-between">
            <div className="text-[11px] text-[#88889D]">
              اطلاعات هویتی مستقیماً با شناسه شخص در K01 همگام می‌شود.
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPerson}
                className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'در حال انتصاب...' : 'انتصاب رسمی نقش مأمور به شخص'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
