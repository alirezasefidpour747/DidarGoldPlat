/**
 * Didar Gold Platform - Kernel Domain K09 Types
 * Inventory, Locations, Custody & Bags (موجودی، مکان، امانت و کیف)
 */

export type VaultType =
  | 'central_vault'          // خزانه مرکزی و گاوصندوق کل
  | 'regional_hub'           // هاب و خزانه منطقه‌ای استان‌ها
  | 'branch_safe'            // گاوصندوق مستقر در شعب و گالری‌های دیدار
  | 'quarantine_assay_vault' // گاوصندوق قرنطینه و ری‌گیری آزمایشگاه
  | 'partner_custody';       // امانت‌داری نزد کارگاه یا شریک تجاری

export type BagStatus =
  | 'in_field'               // در حال گشت میدانی و ویزیت گالری‌ها
  | 'vault_locked'           // مستقر و قفل‌شده در گاوصندوق پایگاه
  | 'in_transit'             // در حال انتقال تحت اسکورت امنیتی
  | 'quarantine_audit'       // در حال بازرسی و انبارگردانی محتویات
  | 'inactive';              // غیرفعال یا تحت تعمیرات فنی

export type TransferStatus =
  | 'draft_registered'      // ثبت پیش‌نویس حواله
  | 'security_approved'      // تأیید حراست و صدور مجوز خروج
  | 'in_transit'             // در حال انتقال فیزیکی تحت اسکورت
  | 'delivered_verified'     // تحویل نهایی و تطبیق گرمی با ترازوی مقصد
  | 'discrepancy_flagged'    // مغایرت وزنی در مقصد و ارجاع به بازرسی
  | 'cancelled';             // لغوشده

export type ItemCustodyStatus =
  | 'in_vault'               // در گاوصندوق / خزانه
  | 'assigned_to_bag'        // در کیف ویزیتور و نمایش میدانی
  | 'in_transit'             // در حال انتقال بین دو نقطه
  | 'consignment_loan'       // امانی سپرده‌شده به ویترین گالری
  | 'reserved_order';        // رزرو برای فاکتور و خروج

export interface VaultLocation {
  id: string;
  code: string;              // e.g. VLT-TH-CENTRAL
  nameFa: string;            // خزانه مرکزی دیدار تهران
  vaultType: VaultType;
  vaultTypeFa: string;
  cityFa: string;
  provinceFa: string;
  addressFa: string;
  securityLevelFa: string;   // سطح A+ (ضدحریق، ضدبرش، سنسورهای لرزه‌نگاری و پایش بیومتریک)
  totalCapacityGrams: number;
  currentGoldWeightGrams: number;
  totalPiecesCount: number;
  custodianNameFa: string;   // سرپرست و امین خزانه
  custodianPhone: string;
  lastAuditDateFa: string;
  compartmentsCount: number; // تعداد زونکن‌ها و صندوقچه‌های امنیتی داخلی
  isActive: boolean;
}

export interface AgentBag {
  id: string;
  bagCode: string;           // e.g. BAG-IR-042
  bagTitleFa: string;        // کیف پرتابل ضدسرقت شماره ۴۲
  assignedAgentId: string;
  assignedAgentNameFa: string; // نام ویزیتور و بازاریاب رسمی
  agentNationalIdMasked: string;
  agentPhone: string;
  assignedTerritoryFa: string; // قلمرو: بازار بزرگ تهران، تجریش و سعادت‌آباد
  status: BagStatus;
  statusFa: string;
  securityBagSerial: string; // سریال کیف هوشمند
  electronicLockStatus: 'locked' | 'unlocked_authorized' | 'alarm_tamper';
  gpsBatteryPercent: number;
  currentLocationLatLong?: string;
  lastPingTimestampFa: string;
  maxWeightCapacityGrams: number;
  currentWeightGrams: number;
  piecesCount: number;
  activeHandoverReceiptNo?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  uid: string;               // e.g. UID-2026-GLD-8821 (Linked to K06)
  titleFa: string;           // سرویس طلای البرز تراش خورده ۱۸ عیار
  categoryFa: string;        // سرویس، النگو، دستبند، زنجیر، مدال، شمش
  karatFa: string;           // ۱۸ عیار (۷۵۰)
  nominalFineness: number;   // 750.0
  testedFineness?: number;   // 750.2
  scaleWeightGrams: number;
  pureGold995EquivalentGrams: number;
  hallmarkCode: string;      // T-9842
  supplierId: string;
  supplierNameFa: string;
  intakeReceiptNo?: string;  // Linked to K08 Warehouse Receipt
  currentLocationId: string; // Vault ID or Agent Bag ID
  currentLocationNameFa: string;
  currentLocationType: 'vault' | 'bag';
  custodyStatus: ItemCustodyStatus;
  custodyStatusFa: string;
  assignedBagCode?: string;
  custodianOfficerNameFa: string;
  qrCodeScanPayload: string;
  lastMovedDateFa: string;
  estimatedValueToman: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;    // e.g. TRF-2026-9045
  sourceType: 'vault' | 'bag';
  sourceLocationId: string;
  sourceLocationNameFa: string;
  destinationType: 'vault' | 'bag';
  destinationLocationId: string;
  destinationLocationNameFa: string;
  transferReasonFa: string;  // تجهیز کیف ویزیتور / جابجایی به هاب منطقه‌ای / بازگشت از بازار
  itemsCount: number;
  totalWeightGrams: number;
  itemUids: string[];
  securitySealSerial: string;
  courierOrEscortNameFa: string;
  escortNationalIdMasked: string;
  dispatchTimestampFa: string;
  arrivalEstimatedTimestampFa: string;
  actualArrivalTimestampFa?: string;
  status: TransferStatus;
  statusFa: string;
  dispatchedByOfficerNameFa: string;
  receivedByOfficerNameFa?: string;
  measuredWeightAtDestinationGrams?: number;
  weightDeltaGrams?: number;
  notes?: string;
}

export interface VaultAuditRecord {
  id: string;
  auditNumber: string;       // e.g. AUD-K09-2026-11
  targetLocationId: string;
  targetLocationNameFa: string;
  targetTypeFa: string;      // خزانه مرکزی / کیف عامل
  auditDateFa: string;
  auditorNameFa: string;
  auditorNationalIdMasked: string;
  expectedWeightGrams: number;
  physicalCountWeightGrams: number;
  discrepancyGrams: number;  // 0.0 or minor scale dust tolerance (+0.01 / -0.01)
  expectedItemsCount: number;
  physicalCountItemsCount: number;
  reconciliationStatus: 'perfect_match' | 'acceptable_dust_loss' | 'critical_discrepancy';
  reconciliationStatusFa: string;
  inspectorNotesFa: string;
  signedOfficialMinutesUrl?: string;
}

export interface K09Metrics {
  totalNetworkGoldGrams: number;
  totalNetworkValueToman: number;
  vaultStoredGoldGrams: number;
  agentBagsGoldGrams: number;
  inTransitGoldGrams: number;
  totalVaultsCount: number;
  totalActiveBagsCount: number;
  totalInventoryPiecesCount: number;
  pendingTransfersCount: number;
  inventoryAuditMatchRatePercent: number;
}

export interface K09DataPayload {
  locations: VaultLocation[];
  bags: AgentBag[];
  items: InventoryItem[];
  transfers: StockTransfer[];
  audits: VaultAuditRecord[];
  metrics: K09Metrics;
}
