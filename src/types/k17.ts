/**
 * Didar Gold Platform - Kernel 17 (K17)
 * Consumer Ownership Claims, Digital Provenance, Warranty & Anti-Theft Registry
 * (ثبت مالکیت مصرف‌کننده، شناسنامه دیجیتال، فعال‌سازی گارانتی و سامانه ضدسرقت)
 */

export type OwnershipClaimStatus =
  | 'pending_otp'       // در انتظار تأیید پیامکی خریدار
  | 'verified_active'   // مالکیت قطعی و فعال
  | 'transferred'       // منتقل‌شده به خریدار جدید
  | 'disputed'          // دارای اختلاف یا ادعای معارض
  | 'stolen_locked';    // قفل امنیتی ناشی از اعلام سرقت

export type WarrantyStatus =
  | 'active'            // گارانتی فعال
  | 'service_claimed'   // در حال دریافت خدمات گارانتی
  | 'expiring_soon'     // سررسید انقضا در ۳۰ روز آینده
  | 'expired'           // منقضی شده
  | 'voided';           // باطل شده به دلیل دستکاری غیرمجاز

export type WarrantyCoverageType =
  | 'purity_lifetime'     // ضمانت مادام‌العمر عیار ۱۸ (۷۵۰) و بازخرید تضمینی
  | 'gem_setting_12m'     // گارانتی ۱۲ ماهه مخراج‌کاری و نگین
  | 'clasp_solder_24m'    // گارانتی ۲۴ ماهه قفل، اتصالات و استحکام جوش
  | 'annual_polish_free'; // سرویس سالانه شستشوی التراسونیک و آبکاری رایگان

export interface ConsumerProfile {
  nationalId: string;
  fullNameFa: string;
  mobile: string;
  cityFa: string;
  verifiedAtFa?: string;
  isIdentityVerified: boolean;
}

export interface RetailerPurchaseProof {
  retailerOrgId: string;
  retailerNameFa: string;
  guildPermitNo: string;
  storeCityFa: string;
  salesInvoiceNumber: string;
  purchaseDateFa: string;
  purchasePriceToman: number;
  sellerOfficerNameFa: string;
}

export interface ItemPhysicalSpec {
  uid: string;
  serialNumber: string;
  productTitleFa: string;
  productSkuCode: string;
  caratFa: string;
  actualScaleWeightGrams: number;
  certifiedFineness: number;
  assayLabName: string;
  hallmarkCode: string;
  laserInscriptionText: string;
  imageUrl?: string;
}

export interface OwnershipTransferRecord {
  id: string;
  transferDateFa: string;
  fromOwnerNameFa: string;
  fromOwnerMobile: string;
  toOwnerNameFa: string;
  toOwnerNationalId: string;
  toOwnerMobile: string;
  reasonFa: string;
  transferDeedNumber: string;
}

export interface OwnershipClaim {
  id: string;
  claimNumber: string;
  itemSpec: ItemPhysicalSpec;
  consumer: ConsumerProfile;
  retailerProof: RetailerPurchaseProof;
  status: OwnershipClaimStatus;
  statusFa: string;
  claimDateFa: string;
  digitalDeedHash: string; // هش یکتای سند مالکیت دیجیتال
  qrVerificationUrl: string;
  verificationMethodFa: string;
  warrantyId?: string;
  transferHistory: OwnershipTransferRecord[];
  notesFa?: string;
}

export interface WarrantyServiceLog {
  id: string;
  serviceDateFa: string;
  serviceTypeFa: string;
  workshopNameFa: string;
  descriptionFa: string;
  costToman: number;
  wasFreeUnderWarranty: boolean;
  officerNameFa: string;
}

export interface WarrantyCard {
  id: string;
  warrantyNumber: string;
  claimId: string;
  itemUid: string;
  productTitleFa: string;
  consumerNameFa: string;
  consumerMobile: string;
  issueDateFa: string;
  expirationDateFa: string;
  durationMonths: number;
  status: WarrantyStatus;
  statusFa: string;
  coverages: {
    type: WarrantyCoverageType;
    titleFa: string;
    descriptionFa: string;
    isLifetime: boolean;
  }[];
  serviceLogs: WarrantyServiceLog[];
}

export interface OwnershipTransferRequest {
  id: string;
  transferCode: string;
  claimId: string;
  itemUid: string;
  productTitleFa: string;
  currentOwnerNameFa: string;
  currentOwnerMobile: string;
  newOwnerNameFa: string;
  newOwnerNationalId: string;
  newOwnerMobile: string;
  requestDateFa: string;
  status: 'pending_otp' | 'completed' | 'cancelled';
  statusFa: string;
  otpSimulatedCode?: string;
  reasonFa: string;
}

export interface StolenReport {
  id: string;
  reportNumber: string;
  itemUid: string;
  productTitleFa: string;
  caratFa: string;
  weightGrams: number;
  ownerNameFa: string;
  ownerMobile: string;
  incidentDateFa: string;
  policeStationFa: string;
  policeCaseNumber: string;
  status: 'active_alert' | 'recovered_cleared';
  statusFa: string;
  flaggedAtFa: string;
  clearedAtFa?: string;
  descriptionFa: string;
}

export interface UidScanResult {
  query: string;
  found: boolean;
  isAuthentic: boolean;
  statusSummary: 'unclaimed_ready' | 'claimed_active' | 'stolen_alert' | 'not_found';
  statusSummaryFa: string;
  messageFa: string;
  recommendationFa: string;
  passport?: ItemPhysicalSpec;
  claim?: OwnershipClaim;
  warranty?: WarrantyCard;
  stolenReport?: StolenReport;
}

export interface K17Metrics {
  totalRegisteredClaims: number;
  activeWarrantiesCount: number;
  stolenAlertsCount: number;
  unclaimedEligibleUidsCount: number;
  totalGoldWeightClaimedGrams: number;
  pendingTransfersCount: number;
  verifiedAuthenticityRate: number;
  totalWarrantyServicesProvided: number;
}

export interface K17AuditLog {
  id: string;
  timestampFa: string;
  action:
    | 'ownership_registered'
    | 'warranty_activated'
    | 'transfer_initiated'
    | 'transfer_completed'
    | 'stolen_flagged'
    | 'stolen_recovered'
    | 'warranty_service_logged'
    | 'public_scan_executed';
  actionFa: string;
  detailsFa: string;
  actorFa: string;
  itemUid: string;
}

export interface K17DataPayload {
  metrics: K17Metrics;
  claims: OwnershipClaim[];
  warranties: WarrantyCard[];
  transfers: OwnershipTransferRequest[];
  stolenReports: StolenReport[];
  auditLogs: K17AuditLog[];
}
