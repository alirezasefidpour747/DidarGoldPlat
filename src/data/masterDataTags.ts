/**
 * Didar Gold Platform - Master Data Repository
 * حوزه مستر دیتا: برچسب‌ها و طبقه‌بندی‌های استاندارد طلا و جواهر
 */

export interface MasterDataTag {
  id: string;
  name: string;
  category: 'commercial' | 'manufacturing' | 'gemstones' | 'style' | 'usage';
  categoryFa: string;
  descriptionFa?: string;
  isStandard: boolean;
}

export const INITIAL_MASTER_TAGS: MasterDataTag[] = [
  // تجاری و بازار بنکداری
  { id: 'tag-01', name: 'پرفروش_بنکداری', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-02', name: 'ویترین_طلافروشی', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-03', name: 'بدون_کسری', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-04', name: 'سرمایه‌گذاری', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-05', name: 'صادراتی_استاندارد', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-06', name: 'کادویی_پرفروش', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },
  { id: 'tag-07', name: 'اجرت_مناسب', category: 'commercial', categoryFa: 'بازار و فروش', isStandard: true },

  // ساخت و متالورژی ریخته‌گری
  { id: 'tag-10', name: 'ریخته‌گری_دقیق', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-11', name: 'تراش_الماسه_CNC', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-12', name: 'دست‌ساز_استادکار', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-13', name: 'فیوژن_سه‌بعدی', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-14', name: 'برش_لیزر_دقیق', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-15', name: 'میناکاری_دست', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-16', name: 'سبک‌وزن_اقتصادی', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },
  { id: 'tag-17', name: 'محکم_توپر', category: 'manufacturing', categoryFa: 'تکنیک و ساخت', isStandard: true },

  // سنگ و نگین
  { id: 'tag-20', name: 'تمام_طلا_بدون_نگین', category: 'gemstones', categoryFa: 'نگین و گوهر', isStandard: true },
  { id: 'tag-21', name: 'نگین_اتمی_با_کسر_وزن', category: 'gemstones', categoryFa: 'نگین و گوهر', isStandard: true },
  { id: 'tag-22', name: 'برلیان_شناسنامه‌دار', category: 'gemstones', categoryFa: 'نگین و گوهر', isStandard: true },
  { id: 'tag-23', name: 'یاقوت_و_زمرد_طبیعی', category: 'gemstones', categoryFa: 'نگین و گوهر', isStandard: true },

  // سبک طراحی و هنر
  { id: 'tag-30', name: 'اسلیمی_صفوی', category: 'style', categoryFa: 'سبک و دیزاین', isStandard: true },
  { id: 'tag-31', name: 'کلاسیک_سنتی_یزد', category: 'style', categoryFa: 'سبک و دیزاین', isStandard: true },
  { id: 'tag-32', name: 'مینیمال_مدرن', category: 'style', categoryFa: 'سبک و دیزاین', isStandard: true },
  { id: 'tag-33', name: 'طرح_طبیعت_و_گل', category: 'style', categoryFa: 'سبک و دیزاین', isStandard: true },
  { id: 'tag-34', name: 'هندسی_آرت_دکو', category: 'style', categoryFa: 'سبک و دیزاین', isStandard: true },

  // کاربرد و مخاطب
  { id: 'tag-40', name: 'استفاده_دائمی_روزمره', category: 'usage', categoryFa: 'کاربرد و مناسبت', isStandard: true },
  { id: 'tag-41', name: 'سرویس_عروس_مجلسی', category: 'usage', categoryFa: 'کاربرد و مناسبت', isStandard: true },
  { id: 'tag-42', name: 'اسپرت_جوان‌پسند', category: 'usage', categoryFa: 'کاربرد و مناسبت', isStandard: true },
  { id: 'tag-43', name: 'کودک_و_نوجوان', category: 'usage', categoryFa: 'کاربرد و مناسبت', isStandard: true }
];

const LOCAL_STORAGE_KEY = 'didar_master_tags_v1';

export function getMasterDataTags(): MasterDataTag[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load master tags from localStorage', e);
  }
  return INITIAL_MASTER_TAGS;
}

export function saveMasterDataTag(newTag: { name: string; category?: MasterDataTag['category'] }): MasterDataTag {
  const cleanName = newTag.name.trim().replace(/\s+/g, '_');
  const allTags = getMasterDataTags();

  const existing = allTags.find(t => t.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return existing;
  }

  const category = newTag.category || 'commercial';
  const categoryNames: Record<string, string> = {
    commercial: 'بازار و فروش',
    manufacturing: 'تکنیک و ساخت',
    gemstones: 'نگین و گوهر',
    style: 'سبک و دیزاین',
    usage: 'کاربرد و مناسبت'
  };

  const created: MasterDataTag = {
    id: `tag-custom-${Date.now()}`,
    name: cleanName,
    category,
    categoryFa: categoryNames[category] || 'سایر',
    isStandard: false
  };

  const updated = [...allTags, created];
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save master tag', e);
  }

  return created;
}
