/**
 * Didar Gold Platform - Master Data & Reference Dictionary (MDM) Types
 * Pure reference data, static taxonomies, and lookup dictionaries that do not possess their own operational domain.
 * Note: Domain entities (such as Agents in K12, Galleries in K11/K01, and Territories/Clusters in K12)
 * are managed within their respective domains and directly feed relational dropdowns.
 */

export type MasterDataCategoryId =
  | 'visit_reasons'                  // علل عدم مراجعه ویزیتور / گشت میدانی
  | 'invoice_reasons'                // علل عدم صدور فاکتور طلا در مراجعه
  | 'gold_karats'                    // عیارهای استاندارد طلا
  | 'bag_seal_types'                 // انواع پلمپ و تجهیزات ترابری امنیتی
  | 'security_clearances'            // رده‌های حفاظتی و احراز ترابری طلا
  | 'payment_conditions'             // شرایط تسویه و حساب طلا
  | (string & {});

export interface MasterDataCategory {
  id: MasterDataCategoryId;
  code: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  iconName: string;
  isSystem: boolean;
  itemCount?: number;
}

export interface MasterDataItem {
  id: string;
  categoryId: MasterDataCategoryId;
  key: string;               // کلید یکتای انگلیسی سیستمی (e.g. buyer_rep)
  labelFa: string;           // عنوان فارسی نمایش در فرم‌ها و دراپ‌دان‌ها
  labelEn?: string;          // عنوان انگلیسی
  code?: string;             // کد کوتاه یا استاندارد اتحادیه/سازمان
  descriptionFa?: string;    // توضیح تکمیلی کاربرد
  orderIndex: number;        // ترتیب نمایش در منوی کشویی
  isActive: boolean;         // وضعیت فعال / غیرفعال
  isSystem: boolean;         // آیا آیتم پایه سیستمی است؟
  badgeColor?: string;       // کد رنگ یا کلاس نشان
  metadata?: Record<string, any>; // اطلاعات تخصصی مثل درصد، عیار، محدودیت
  createdAt?: string;
  updatedAt?: string;
}

export interface MasterDataPayload {
  categories: MasterDataCategory[];
  items: MasterDataItem[];
}
