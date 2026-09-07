/**
 * Didar Gold Platform - Organization Create & Edit Modal
 * Distinct forms with specialized fields for Manufacturers, Wholesalers, Retailers, etc.
 */

import React, { useState, useEffect } from 'react';
import { Organization, OrganizationType, EntityStatus, VerificationStatus, StoreType, ServiceSpecialty } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { X, AlertCircle, Check, Factory, Store, Briefcase, Building2 } from 'lucide-react';

interface OrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Organization>) => Promise<void>;
  initialData?: Organization | null;
}

export const OrganizationFormModal: React.FC<OrganizationFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData
}) => {
  const { t } = useI18n();

  // Basic Enterprise Info
  const [organizationType, setOrganizationType] = useState<OrganizationType>('retailer');
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [nationalLegalId, setNationalLegalId] = useState('');
  const [economicCode, setEconomicCode] = useState('');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');
  const [notes, setNotes] = useState('');

  // Manufacturer Specialized Fields
  const [mfgCode, setMfgCode] = useState('');
  const [mfgBrand, setMfgBrand] = useState('');
  const [mfgLicense, setMfgLicense] = useState('');
  const [mfgCategories, setMfgCategories] = useState('');
  const [mfgCapacity, setMfgCapacity] = useState<number>(5000);
  const [workshopAddress, setWorkshopAddress] = useState('');

  // Wholesaler Specialized Fields
  const [whsCode, setWhsCode] = useState('');
  const [whsBrand, setWhsBrand] = useState('');
  const [whsLicense, setWhsLicense] = useState('');
  const [whsCategories, setWhsCategories] = useState('');
  const [coverageTerritory, setCoverageTerritory] = useState('');
  const [warehouseAddress, setWarehouseAddress] = useState('');

  // Retailer Specialized Fields
  const [retailerCode, setRetailerCode] = useState('');
  const [guildLicense, setGuildLicense] = useState('');
  const [guildUnion, setGuildUnion] = useState('');
  const [storeType, setStoreType] = useState<StoreType>('mall_store');
  const [displayCapacity, setDisplayCapacity] = useState<number>(150);

  // Agent Office Specialized Fields
  const [officeCode, setOfficeCode] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [managerName, setManagerName] = useState('');

  // Service Partner Specialized Fields
  const [partnerCode, setPartnerCode] = useState('');
  const [serviceSpecialty, setServiceSpecialty] = useState<ServiceSpecialty>('repair');
  const [certNumber, setCertNumber] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setOrganizationType(initialData.organizationType);
      setLegalName(initialData.legalName);
      setDisplayName(initialData.displayName);
      setRegistrationNumber(initialData.registrationNumber || '');
      setNationalLegalId(initialData.nationalLegalId || '');
      setEconomicCode(initialData.economicCode || '');
      setWebsite(initialData.website || '');
      setPhone(initialData.phone);
      setEmail(initialData.email || '');
      setProvince(initialData.province || '');
      setCity(initialData.city || '');
      setAddress(initialData.address || '');
      setPostalCode(initialData.postalCode || '');
      setStatus(initialData.status);
      setVerificationStatus(initialData.verificationStatus);
      setNotes(initialData.notes || '');

      if (initialData.manufacturerProfile) {
        setMfgCode(initialData.manufacturerProfile.supplierCode || '');
        setMfgBrand(initialData.manufacturerProfile.brandName || '');
        setMfgLicense(initialData.manufacturerProfile.productionLicenseNumber || '');
        setMfgCategories(initialData.manufacturerProfile.productCategories || '');
        setMfgCapacity(initialData.manufacturerProfile.monthlyCapacityGrams || 0);
        setWorkshopAddress(initialData.manufacturerProfile.workshopAddress || '');
      }

      if (initialData.wholesalerProfile) {
        setWhsCode(initialData.wholesalerProfile.supplierCode || '');
        setWhsBrand(initialData.wholesalerProfile.brandName || '');
        setWhsLicense(initialData.wholesalerProfile.licenseNumber || '');
        setWhsCategories(initialData.wholesalerProfile.productCategories || '');
        setCoverageTerritory(initialData.wholesalerProfile.coverageTerritory || '');
        setWarehouseAddress(initialData.wholesalerProfile.warehouseAddress || '');
      }

      if (initialData.retailerProfile) {
        setRetailerCode(initialData.retailerProfile.retailerCode || '');
        setGuildLicense(initialData.retailerProfile.guildLicenseNumber || '');
        setGuildUnion(initialData.retailerProfile.guildUnionName || '');
        setStoreType(initialData.retailerProfile.storeType || 'mall_store');
        setDisplayCapacity(initialData.retailerProfile.displayCapacityPieces || 0);
      }

      if (initialData.agentOfficeProfile) {
        setOfficeCode(initialData.agentOfficeProfile.officeCode || '');
        setJurisdiction(initialData.agentOfficeProfile.jurisdictionTerritory || '');
        setManagerName(initialData.agentOfficeProfile.managerName || '');
      }

      if (initialData.servicePartnerProfile) {
        setPartnerCode(initialData.servicePartnerProfile.partnerCode || '');
        setServiceSpecialty(initialData.servicePartnerProfile.serviceSpecialty || 'repair');
        setCertNumber(initialData.servicePartnerProfile.certificationNumber || '');
      }
    } else {
      setOrganizationType('retailer');
      setLegalName('');
      setDisplayName('');
      setRegistrationNumber('');
      setNationalLegalId('');
      setEconomicCode('');
      setWebsite('');
      setPhone('');
      setEmail('');
      setProvince('');
      setCity('');
      setAddress('');
      setPostalCode('');
      setStatus('active');
      setVerificationStatus('unverified');
      setNotes('');
      setMfgCode('');
      setMfgBrand('');
      setMfgLicense('');
      setMfgCategories('');
      setMfgCapacity(5000);
      setWorkshopAddress('');
      setWhsCode('');
      setWhsBrand('');
      setWhsLicense('');
      setWhsCategories('');
      setCoverageTerritory('');
      setWarehouseAddress('');
      setRetailerCode('');
      setGuildLicense('');
      setGuildUnion('');
      setStoreType('mall_store');
      setDisplayCapacity(150);
      setOfficeCode('');
      setJurisdiction('');
      setManagerName('');
      setPartnerCode('');
      setCertNumber('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!legalName.trim() || !displayName.trim()) {
      setError('نام رسمی و نام نمایشی سازمان الزامی است.');
      return;
    }

    if (!phone.trim()) {
      setError('شماره تلفن تماس الزامی است.');
      return;
    }

    // Type-specific field validations
    if (organizationType === 'manufacturer') {
      if (!mfgCode.trim()) {
        setError('کد یکتای سازنده الزامی است.');
        return;
      }
      if (!mfgLicense.trim()) {
        setError('شماره پروانه تولید و بهره‌برداری الزامی است.');
        return;
      }
      if (!mfgCapacity || mfgCapacity <= 0) {
        setError('ظرفیت تولید ماهانه باید مقدار مثبت عددی باشد.');
        return;
      }
    }

    if (organizationType === 'wholesaler') {
      if (!whsCode.trim()) {
        setError('کد بنکداری برای عمده‌فروش الزامی است.');
        return;
      }
      if (!coverageTerritory.trim()) {
        setError('تعیین محدوده پوشش توزیع برای بنکدار الزامی است.');
        return;
      }
    }

    if (organizationType === 'retailer') {
      if (!retailerCode.trim()) {
        setError('کد اختصاصی خرده‌فروشی الزامی است.');
        return;
      }
      if (!guildLicense.trim()) {
        setError('شماره جواز کسب اتحادیه طلا برای خرده‌فروشی الزامی است.');
        return;
      }
    }

    const payload: Partial<Organization> = {
      organizationType,
      legalName: legalName.trim(),
      displayName: displayName.trim(),
      registrationNumber: registrationNumber.trim() || undefined,
      nationalLegalId: nationalLegalId.trim() || undefined,
      economicCode: economicCode.trim() || undefined,
      website: website.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      province: province.trim() || undefined,
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      postalCode: postalCode.trim() || undefined,
      status,
      verificationStatus,
      notes: notes.trim() || undefined
    };

    if (organizationType === 'manufacturer') {
      payload.manufacturerProfile = {
        supplierCode: mfgCode.trim(),
        brandName: mfgBrand.trim() || displayName.trim(),
        productionLicenseNumber: mfgLicense.trim(),
        productCategories: mfgCategories.trim() || 'النگو، دستبند، مدال',
        monthlyCapacityGrams: Number(mfgCapacity),
        workshopAddress: workshopAddress.trim() || undefined,
        purityStandards: ['750 (18K)']
      };
    }

    if (organizationType === 'wholesaler') {
      payload.wholesalerProfile = {
        supplierCode: whsCode.trim(),
        brandName: whsBrand.trim() || displayName.trim(),
        licenseNumber: whsLicense.trim() || undefined,
        productCategories: whsCategories.trim() || 'سرویس، زنجیر، نیم‌ست',
        coverageTerritory: coverageTerritory.trim(),
        warehouseAddress: warehouseAddress.trim() || undefined
      };
    }

    if (organizationType === 'retailer') {
      payload.retailerProfile = {
        retailerCode: retailerCode.trim(),
        guildLicenseNumber: guildLicense.trim(),
        guildUnionName: guildUnion.trim() || undefined,
        storeType,
        displayCapacityPieces: Number(displayCapacity) || 0
      };
    }

    if (organizationType === 'agent_office') {
      payload.agentOfficeProfile = {
        officeCode: officeCode.trim() || 'OFF-01',
        jurisdictionTerritory: jurisdiction.trim() || 'ناحیه مرکزی',
        managerName: managerName.trim() || undefined
      };
    }

    if (organizationType === 'service_partner') {
      payload.servicePartnerProfile = {
        partnerCode: partnerCode.trim() || 'SRV-01',
        serviceSpecialty,
        certificationNumber: certNumber.trim() || undefined
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
      const message = err instanceof Error ? err.message : 'خطا در ثبت اطلاعات سازمان.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#292938]">
          <h3 className="text-base font-bold text-[#F4F4F6]">
            {initialData ? `ویرایش سازمان: ${initialData.displayName}` : t.createOrganization}
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

          {/* Business Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#B5B5C2] mb-1.5">{t.organizationType} *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'manufacturer', label: t.manufacturer, icon: Factory },
                { id: 'wholesaler', label: t.wholesaler, icon: Briefcase },
                { id: 'retailer', label: t.retailer, icon: Store },
                { id: 'didar', label: t.didarOrg, icon: Building2 },
                { id: 'agent_office', label: t.agentOffice, icon: Building2 },
                { id: 'service_partner', label: t.servicePartner, icon: Building2 },
                { id: 'supplier', label: t.supplier, icon: Building2 },
                { id: 'other', label: t.other, icon: Building2 }
              ].map(item => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setOrganizationType(item.id as OrganizationType)}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    organizationType === item.id
                      ? 'bg-[#C8A951] text-[#141416] font-bold border-[#C8A951] shadow-sm'
                      : 'bg-[#1C1C26] text-[#A6A6B4] border-[#2E2E3E] hover:border-[#404055]'
                  }`}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Base Legal Identity */}
          <div className="p-4 rounded-xl bg-[#13131A] border border-[#262634] space-y-4">
            <h4 className="text-xs font-bold text-[#E5C365]">اطلاعات حقوقی و مشخصات هویتی کسب‌وکار</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.displayName} (نام تابلویی) *</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="مثال: کارگاه زرین اسپادانا یا گالری پرنیا"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">{t.legalName} (نام رسمی ثبتی) *</label>
                <input
                  type="text"
                  required
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                  placeholder="مثال: شرکت صنایع زرین‌سازان اسپادانا (سهامی خاص)"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">شناسه ملی شرکت / کسب‌وکار</label>
                <input
                  type="text"
                  value={nationalLegalId}
                  onChange={e => setNationalLegalId(e.target.value)}
                  placeholder="۱۱ رقم شناسه ملی اشخاص حقوقی"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">شماره ثبت شرکت / پروانه</label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={e => setRegistrationNumber(e.target.value)}
                  placeholder="شماره ثبت در مرجع ثبت شرکت‌ها"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">تلفن تماس ثابت *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="021-xxxxxxxx"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9EA8] mb-1">وب‌سایت رسمی کسب‌وکار</label>
                <input
                  type="text"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-[#9E9EA8] mb-1">نشانی دفتر مرکزی یا فروشگاه</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="استان، شهر، خیابان، پلاک، طبقه..."
                  className="w-full bg-[#181822] border border-[#2D2D3E] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Specialized Industry Tab: Manufacturer */}
          {organizationType === 'manufacturer' && (
            <div className="p-4 rounded-xl bg-[#1C1A14] border border-[#3E3825] space-y-4">
              <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
                <Factory className="w-4 h-4" />
                <span>{t.productionInfo} (الزامات سازندگان طلا)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.supplierCode} (کد یکتای سازنده) *</label>
                  <input
                    type="text"
                    required
                    value={mfgCode}
                    onChange={e => setMfgCode(e.target.value)}
                    placeholder="مثال: MFG-ESP-750"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">شماره پروانه بهره‌برداری / استاندارد *</label>
                  <input
                    type="text"
                    required
                    value={mfgLicense}
                    onChange={e => setMfgLicense(e.target.value)}
                    placeholder="پروانه صنایع یا استاندارد فلزات گرانبها"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.monthlyCapacity} (گرم در ماه) *</label>
                  <input
                    type="number"
                    required
                    value={mfgCapacity}
                    onChange={e => setMfgCapacity(parseFloat(e.target.value))}
                    placeholder="5000"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">دسته‌های تخصصی ساخت</label>
                  <input
                    type="text"
                    value={mfgCategories}
                    onChange={e => setMfgCategories(e.target.value)}
                    placeholder="مثال: النگو داماس، دستبند زنجیری، مدال قلمزنی"
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#9E9EA8] mb-1">نشانی کارگاه ریخته‌گری و تولید</label>
                  <input
                    type="text"
                    value={workshopAddress}
                    onChange={e => setWorkshopAddress(e.target.value)}
                    placeholder="نشانی دقیق کارگاه جهت بازرسی و نمونه‌برداری عیار..."
                    className="w-full bg-[#151410] border border-[#3E3825] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specialized Industry Tab: Wholesaler */}
          {organizationType === 'wholesaler' && (
            <div className="p-4 rounded-xl bg-[#1C1814] border border-[#3E3225] space-y-4">
              <h4 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{t.distributionInfo} (الزامات بنکداران عمده طلا)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">کد یکتای بنکداری *</label>
                  <input
                    type="text"
                    required
                    value={whsCode}
                    onChange={e => setWhsCode(e.target.value)}
                    placeholder="مثال: WHS-PRS-001"
                    className="w-full bg-[#151210] border border-[#3E3225] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.territory} (محدوده پوشش توزیع) *</label>
                  <input
                    type="text"
                    required
                    value={coverageTerritory}
                    onChange={e => setCoverageTerritory(e.target.value)}
                    placeholder="مثال: استان‌های تهران، البرز، قزوین"
                    className="w-full bg-[#151210] border border-[#3E3225] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs text-[#9E9EA8] mb-1">نشانی خزانه و انبار امن بنکداری</label>
                  <input
                    type="text"
                    value={warehouseAddress}
                    onChange={e => setWarehouseAddress(e.target.value)}
                    placeholder="موقعیت خزانه جهت واریز و دریافت طلای تسویه..."
                    className="w-full bg-[#151210] border border-[#3E3225] focus:border-[#C8A951] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Specialized Industry Tab: Retailer */}
          {organizationType === 'retailer' && (
            <div className="p-4 rounded-xl bg-[#141A17] border border-[#243E30] space-y-4">
              <h4 className="text-xs font-bold text-[#3DD68C] flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span>{t.storeInfo} (مشخصات فروشگاه و پروانه صنفی)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.retailerCode} *</label>
                  <input
                    type="text"
                    required
                    value={retailerCode}
                    onChange={e => setRetailerCode(e.target.value)}
                    placeholder="مثال: RET-TEH-0104"
                    className="w-full bg-[#101512] border border-[#243E30] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">{t.guildLicense} *</label>
                  <input
                    type="text"
                    required
                    value={guildLicense}
                    onChange={e => setGuildLicense(e.target.value)}
                    placeholder="مثال: GL-8491-TEH"
                    className="w-full bg-[#101512] border border-[#243E30] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">نوع فروشگاه و کاربری</label>
                  <select
                    value={storeType}
                    onChange={e => setStoreType(e.target.value as StoreType)}
                    className="w-full bg-[#101512] border border-[#243E30] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none"
                  >
                    <option value="mall_store">فروشگاه داخل پاساژ / مجتمع تجاری</option>
                    <option value="boutique">بوتیک لوکس خیابانی</option>
                    <option value="gallery">گالری خصوصی طلا</option>
                    <option value="online">فروشگاه مجازی و آنلاین</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-[#9E9EA8] mb-1">ظرفیت تقریبی چیدمان ویترین (تعداد قطعه)</label>
                  <input
                    type="number"
                    value={displayCapacity}
                    onChange={e => setDisplayCapacity(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#101512] border border-[#243E30] focus:border-[#3DD68C] rounded-xl px-3 py-2 text-xs text-[#EDEDED] outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Status and Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs text-[#9E9EA8] mb-1">وضعیت همکاری تجاری</label>
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
              <label className="block text-xs text-[#9E9EA8] mb-1">وضعیت تایید مدارک و انطباق</label>
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
              <label className="block text-xs text-[#9E9EA8] mb-1">یادداشت اداری / سوابق اعتباری</label>
              <textarea
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="توضیحات و یادداشت‌های اداری مربوط به طرف تجاری..."
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
