/**
 * Didar Gold Platform - Gold Product Taxonomy (Taxonomy Tree)
 * ساختار سلسله‌مراتبی ۳ سطحی دسته‌بندی کاتالوگ طلا و مسکوکات:
 * Level 1: خانواده اصلی (Main Family)
 * Level 2: دسته محصول (Category)
 * Level 3: زیردسته / نوع محصول (Subcategory / Product Type)
 */

import { GoldCarat } from '../types/k05.js';

export interface TaxonomySubcategory {
  id: string;
  titleFa: string;
  titleEn?: string;
  descriptionFa?: string;
}

export interface TaxonomyCategory {
  id: string;
  titleFa: string;
  titleEn?: string;
  skuPrefix: string;
  familyId: string;
  descriptionFa?: string;
  subcategories: TaxonomySubcategory[];
}

export interface TaxonomyFamily {
  id: string;
  orderNumber: number;
  titleFa: string;
  titleEn: string;
  badgeFa: string;
  descriptionFa: string;
  categories: TaxonomyCategory[];
}

export const GOLD_TAXONOMY_TREE: TaxonomyFamily[] = [
  // 1. زیورآلات بدنی (Jewelry)
  {
    id: 'jewelry',
    orderNumber: 1,
    titleFa: '۱. زیورآلات بدنی (Jewelry)',
    titleEn: 'Body Jewelry & Personal Adornment',
    badgeFa: 'زیورآلات بدنی',
    descriptionFa: 'شامل انواع زیورآلات استاندارد و دست‌ساز قابل پوشش روی دست، گردن، گوش و اندام',
    categories: [
      {
        id: 'ring',
        titleFa: 'انگشتر',
        titleEn: 'Ring',
        skuPrefix: 'DID-RNG',
        familyId: 'jewelry',
        descriptionFa: 'انواع انگشتر، حلقه و نگین‌خور',
        subcategories: [
          { id: 'wedding_band', titleFa: 'حلقه ازدواج', titleEn: 'Wedding Band' },
          { id: 'engagement_ring', titleFa: 'حلقه نامزدی', titleEn: 'Engagement Ring' },
          { id: 'solitaire', titleFa: 'سولیتر', titleEn: 'Solitaire Ring' },
          { id: 'halo', titleFa: 'هالو', titleEn: 'Halo Ring' },
          { id: 'gemstone_ring', titleFa: 'جواهردار', titleEn: 'Gemstone Ring' },
          { id: 'fantasy_ring', titleFa: 'فانتزی', titleEn: 'Fantasy Ring' },
          { id: 'cocktail_ring', titleFa: 'کوکتل', titleEn: 'Cocktail Ring' },
          { id: 'sport_men_ring', titleFa: 'اسپرت/مردانه', titleEn: 'Sport / Men Ring' },
          { id: 'adjustable_ring', titleFa: 'قابل تنظیم', titleEn: 'Adjustable Ring' }
        ]
      },
      {
        id: 'earrings',
        titleFa: 'گوشواره',
        titleEn: 'Earrings',
        skuPrefix: 'DID-EAR',
        familyId: 'jewelry',
        descriptionFa: 'انواع گوشواره‌های میخی، آویزی و پیرسینگ',
        subcategories: [
          { id: 'stud_earrings', titleFa: 'میخی', titleEn: 'Stud Earrings' },
          { id: 'hoop_earrings', titleFa: 'حلقه‌ای', titleEn: 'Hoop Earrings' },
          { id: 'drop_earrings', titleFa: 'آویزی', titleEn: 'Drop & Dangle Earrings' },
          { id: 'clip_on_earrings', titleFa: 'چسبان/کلیپ‌دار', titleEn: 'Clip-on Earrings' },
          { id: 'threader_earrings', titleFa: 'بخیه‌ای', titleEn: 'Threader Earrings' },
          { id: 'ear_piercing', titleFa: 'پیرسینگ گوش', titleEn: 'Ear Piercing' },
          { id: 'double_set_earrings', titleFa: 'ست/دوبل', titleEn: 'Double / Stack Earrings' },
          { id: 'bridal_earrings', titleFa: 'عروس', titleEn: 'Bridal Earrings' }
        ]
      },
      {
        id: 'necklace',
        titleFa: 'گردنبند',
        titleEn: 'Necklace',
        skuPrefix: 'DID-NCK',
        familyId: 'jewelry',
        descriptionFa: 'انواع گردنبند، چوکر و لایه‌ای',
        subcategories: [
          { id: 'plain_chain_necklace', titleFa: 'زنجیر ساده', titleEn: 'Plain Chain Necklace' },
          { id: 'pendant_necklace', titleFa: 'گردنبند با آویز', titleEn: 'Pendant Necklace' },
          { id: 'choker', titleFa: 'چوکر', titleEn: 'Choker' },
          { id: 'layered_necklace', titleFa: 'لایه‌ای', titleEn: 'Layered Necklace' }
        ]
      },
      {
        id: 'bracelet',
        titleFa: 'دستبند',
        titleEn: 'Bracelet',
        skuPrefix: 'DID-BRC',
        familyId: 'jewelry',
        descriptionFa: 'انواع دستبند قفلی، چرمی، مهره‌ای و آویزدار',
        subcategories: [
          { id: 'lock_bracelet', titleFa: 'قفلی', titleEn: 'Lock / Bangle-Clasp' },
          { id: 'charm_bracelet', titleFa: 'Charm/آویزدار', titleEn: 'Charm Bracelet' },
          { id: 'leather_gold_bracelet', titleFa: 'چرمی + طلا', titleEn: 'Leather & Gold' },
          { id: 'beaded_gem_bracelet', titleFa: 'سنگ‌دار', titleEn: 'Stone / Gem Bracelet' }
        ]
      },
      {
        id: 'bangle',
        titleFa: 'النگو',
        titleEn: 'Bangle',
        skuPrefix: 'DID-BNG',
        familyId: 'jewelry',
        descriptionFa: 'انواع النگوهای دامله، تراش و آینه‌ای پیوسته سایز ۱ الی ۵',
        subcategories: [
          { id: 'standard_bangle', titleFa: 'النگو / Bangle', titleEn: 'Standard Bangle' }
        ]
      },
      {
        id: 'anklet',
        titleFa: 'پابند',
        titleEn: 'Anklet',
        skuPrefix: 'DID-ANK',
        familyId: 'jewelry',
        descriptionFa: 'انواع خلخال و پابند طلا',
        subcategories: [
          { id: 'loop_anklet', titleFa: 'پابند حلقه‌ای', titleEn: 'Loop / Chain Anklet' }
        ]
      },
      {
        id: 'body_jewelry',
        titleFa: 'زیورآلات بدن',
        titleEn: 'Body Jewelry',
        skuPrefix: 'DID-BDY',
        familyId: 'jewelry',
        descriptionFa: 'زیورآلات خاص و زنجیرهای تزیینی بدن',
        subcategories: [
          { id: 'body_ornament', titleFa: 'Body Jewelry / بدن‌تزئینی', titleEn: 'Body Jewelry / Decorative' }
        ]
      },
      {
        id: 'pendant',
        titleFa: 'آویز / پلاک',
        titleEn: 'Pendant & Charm',
        skuPrefix: 'DID-PND',
        familyId: 'jewelry',
        descriptionFa: 'پلاک‌های اسمی، مذهبی، شعر و چارم‌های زنجیر',
        subcategories: [
          { id: 'fixed_pendant', titleFa: 'ثابت', titleEn: 'Fixed Pendant' },
          { id: 'custom_name_pendant', titleFa: 'سفارشی/اسم', titleEn: 'Custom / Name Pendant' },
          { id: 'charm_pendant', titleFa: 'Charm', titleEn: 'Charm' }
        ]
      },
      {
        id: 'chain',
        titleFa: 'زنجیر',
        titleEn: 'Chain',
        skuPrefix: 'DID-CHN',
        familyId: 'jewelry',
        descriptionFa: 'انواع زنجیرهای کارتیه، ونیزی، طنابی و رولو',
        subcategories: [
          { id: 'plain_chain', titleFa: 'ساده', titleEn: 'Plain Chain' },
          { id: 'textured_chain', titleFa: 'بافت‌دار', titleEn: 'Textured / Woven Chain' },
          { id: 'box_chain', titleFa: 'Box', titleEn: 'Box Chain' }
        ]
      }
    ]
  },

  // 2. اکسسوری‌ها (Accessories)
  {
    id: 'accessories',
    orderNumber: 2,
    titleFa: '۲. اکسسوری‌ها (Accessories)',
    titleEn: 'Accessories & Apparel Ornaments',
    badgeFa: 'اکسسوری‌ها',
    descriptionFa: 'ملحقات پوشش رسمی و تزئینات لباس، مو، کراوات و کت',
    categories: [
      {
        id: 'cufflinks',
        titleFa: 'دکمه سردست',
        titleEn: 'Cufflinks',
        skuPrefix: 'DID-CUF',
        familyId: 'accessories',
        descriptionFa: 'دکمه سردست لوکس مردانه و زنانه طلا',
        subcategories: [
          { id: 'cufflinks_standard', titleFa: 'Cufflinks', titleEn: 'Classic Cufflinks' }
        ]
      },
      {
        id: 'tie_clip',
        titleFa: 'گیره کراوات',
        titleEn: 'Tie Clip',
        skuPrefix: 'DID-TIE',
        familyId: 'accessories',
        descriptionFa: 'گیره کراوات طلا ۱۸ عیار',
        subcategories: [
          { id: 'tie_clip_standard', titleFa: 'Tie Clip', titleEn: 'Classic Tie Clip' }
        ]
      },
      {
        id: 'brooch',
        titleFa: 'سنجاق سینه',
        titleEn: 'Brooch & Lapel Pin',
        skuPrefix: 'DID-BRC-PIN',
        familyId: 'accessories',
        descriptionFa: 'انواع سنجاق سینه، گل سینه و سنجاق یقه کت',
        subcategories: [
          { id: 'classic_oval_brooch', titleFa: 'کلاسیک دایره‌ای/بیضی', titleEn: 'Classic Circular / Oval Brooch' },
          { id: 'symbolic_brooch', titleFa: 'مفهومی/نمادین', titleEn: 'Conceptual / Symbolic Brooch' },
          { id: 'lapel_pin_brooch', titleFa: 'سنجاق کت مردانه', titleEn: 'Men Lapel Pin' }
        ]
      },
      {
        id: 'scarf_clip',
        titleFa: 'گیره روسری',
        titleEn: 'Scarf Clip & Pin',
        skuPrefix: 'DID-SCF',
        familyId: 'accessories',
        descriptionFa: 'گیره و بست‌های زینتی روسری و شال',
        subcategories: [
          { id: 'ring_scarf_clip', titleFa: 'حلقه‌ای', titleEn: 'Ring Scarf Clip' },
          { id: 'pin_scarf_clip', titleFa: 'سوزنی/سنجاق‌دار', titleEn: 'Pin Scarf Clip' }
        ]
      },
      {
        id: 'hair_accessory',
        titleFa: 'اکسسوری مو',
        titleEn: 'Hair Accessories',
        skuPrefix: 'DID-HAR',
        familyId: 'accessories',
        descriptionFa: 'سنجاق مو، شانه زرین و زیورآلات گیسو',
        subcategories: [
          { id: 'hair_pin', titleFa: 'سنجاق مو', titleEn: 'Hair Pin' },
          { id: 'wide_deco_comb', titleFa: 'شانه تزئینی پهن', titleEn: 'Wide Decorative Comb' },
          { id: 'bobby_hair_pin', titleFa: 'سنجاق مویی ساده', titleEn: 'Bobby Hair Pin' }
        ]
      },
      {
        id: 'tiara',
        titleFa: 'تاج / نیم‌تاج',
        titleEn: 'Tiara & Crown',
        skuPrefix: 'DID-TRA',
        familyId: 'accessories',
        descriptionFa: 'نیم‌تاج عروس و تاج‌های دکوراتیو',
        subcategories: [
          { id: 'bridal_tiara', titleFa: 'نیم‌تاج عروسی', titleEn: 'Bridal Tiara' },
          { id: 'kids_deco_tiara', titleFa: 'تاج کودک/دکوری', titleEn: 'Kids / Decorative Tiara' }
        ]
      },
      {
        id: 'forehead_ornament',
        titleFa: 'زیور پیشانی',
        titleEn: 'Forehead Ornament',
        skuPrefix: 'DID-FHD',
        familyId: 'accessories',
        descriptionFa: 'زیور پیشانی سنتی، پلاک و زنجیر پیشانی',
        subcategories: [
          { id: 'maang_tikka_chain', titleFa: 'زنجیر سنتی پیشانی / Maang Tikka', titleEn: 'Maang Tikka' },
          { id: 'forehead_pendant', titleFa: 'پلاک پیشانی', titleEn: 'Forehead Pendant' }
        ]
      }
    ]
  },

  // 3. ست‌ها و پک‌های ترکیبی
  {
    id: 'combo_sets',
    orderNumber: 3,
    titleFa: '۳. ست‌ها و پک‌های ترکیبی',
    titleEn: 'Combo Sets & Gift Packs',
    badgeFa: 'ست‌ها و پک‌ها',
    descriptionFa: 'مجموعه‌های هماهنگ، سرویس کامل عروس، ست‌های هدیه و بسته‌های خانوادگی',
    categories: [
      {
        id: 'full_set',
        titleFa: 'سرویس کامل',
        titleEn: 'Full Jewelry Set',
        skuPrefix: 'DID-FST',
        familyId: 'combo_sets',
        descriptionFa: 'سرویس شامل گردنبند، دستبند، گوشواره و انگشتر هماهنگ',
        subcategories: [
          { id: 'complete_gold_set', titleFa: 'ست کامل طلا', titleEn: 'Complete Gold Set' }
        ]
      },
      {
        id: 'half_set',
        titleFa: 'نیم‌ست',
        titleEn: 'Half Set',
        skuPrefix: 'DID-HST',
        familyId: 'combo_sets',
        descriptionFa: 'نیم‌ست شامل پلاک/گردنبند و گوشواره (یا دستبند)',
        subcategories: [
          { id: 'half_set_standard', titleFa: 'نیم‌ست', titleEn: 'Standard Half Set' }
        ]
      },
      {
        id: 'mother_child_set',
        titleFa: 'ست مادر و کودک',
        titleEn: 'Mother & Child Set',
        skuPrefix: 'DID-MCH',
        familyId: 'combo_sets',
        descriptionFa: 'طراحی ست دوتایی هماهنگ مادر و فرزند',
        subcategories: [
          { id: 'mother_child_pair', titleFa: 'Mother & Child Set', titleEn: 'Mother & Child Set' }
        ]
      },
      {
        id: 'occasion_pack',
        titleFa: 'پک مناسبتی',
        titleEn: 'Gift / Occasion Pack',
        skuPrefix: 'DID-GFT',
        familyId: 'combo_sets',
        descriptionFa: 'بسته‌های کادویی یلدا، نوروز، روز مادر و ولنتاین',
        subcategories: [
          { id: 'gift_pack', titleFa: 'Gift / Occasion Pack', titleEn: 'Gift / Occasion Pack' }
        ]
      },
      {
        id: 'mens_set',
        titleFa: 'ست مردانه',
        titleEn: "Men's Set",
        skuPrefix: 'DID-MST',
        familyId: 'combo_sets',
        descriptionFa: 'ست ترکیبی دکمه سردست، گیره کراوات، حلقه و دستبند مردانه',
        subcategories: [
          { id: 'mens_set_standard', titleFa: "Men's Set", titleEn: "Men's Set" }
        ]
      },
      {
        id: 'everyday_pack',
        titleFa: 'پک اقتصادی / روزمره',
        titleEn: 'Everyday / Value Pack',
        skuPrefix: 'DID-EVR',
        familyId: 'combo_sets',
        descriptionFa: 'پک‌های سبک، مینیمال و قیمت‌مناسب برای استفاده روزانه',
        subcategories: [
          { id: 'everyday_pack_standard', titleFa: 'Everyday / Value Pack', titleEn: 'Everyday / Value Pack' }
        ]
      },
      {
        id: 'kids_teen_pack',
        titleFa: 'پک کودک / نوجوان',
        titleEn: 'Kids / Teen Pack',
        skuPrefix: 'DID-KID',
        familyId: 'combo_sets',
        descriptionFa: 'پک‌های طلا فانتزی، کودکانه و نوجوان',
        subcategories: [
          { id: 'kids_teen_standard', titleFa: 'Kids / Teen Pack', titleEn: 'Kids / Teen Pack' }
        ]
      }
    ]
  },

  // 4. محصولات سرمایه‌ای (Bullion)
  {
    id: 'bullion',
    orderNumber: 4,
    titleFa: '۴. محصولات سرمایه‌ای (Bullion)',
    titleEn: 'Investment Bullion, Bars & Coins',
    badgeFa: 'محصولات سرمایه‌ای',
    descriptionFa: 'انواع شمش استاندارد ۲۴ عیار، سکه‌های بانکی، یادبود و شمش‌های ترکیبی کادویی',
    categories: [
      {
        id: 'standard_bullion',
        titleFa: 'شمش استاندارد',
        titleEn: 'Standard Bullion',
        skuPrefix: 'DID-SBL',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های رسمی استاندارد بین ۱ تا ۱۰۰۰ گرم با سرتیفیکیت',
        subcategories: [
          { id: 'standard_bullion_bar', titleFa: 'Standard Bullion', titleEn: 'Standard Bullion Bar' }
        ]
      },
      {
        id: 'occasion_bullion',
        titleFa: 'شمش مناسبتی',
        titleEn: 'Occasion Bullion',
        skuPrefix: 'DID-OBL',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های کارت‌شده با بسته‌بندی ویژه نوروز، تولد و اعیاد',
        subcategories: [
          { id: 'occasion_bullion_card', titleFa: 'Occasion Bullion', titleEn: 'Occasion Bullion' }
        ]
      },
      {
        id: 'branded_bullion',
        titleFa: 'شمش برنددار جهانی',
        titleEn: 'Branded Bullion',
        skuPrefix: 'DID-BBL',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های معتبر بین‌المللی مانند PAMP، Valcambi و شمش‌های برندینگ برتر',
        subcategories: [
          { id: 'branded_bullion_global', titleFa: 'Branded Bullion', titleEn: 'Global Branded Bullion' }
        ]
      },
      {
        id: 'baby_bullion',
        titleFa: 'شمش کودک / نوزاد',
        titleEn: 'Baby / Kids Bullion',
        skuPrefix: 'DID-KBL',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های کوچک کادویی مناسب هدیه تولد و نوزاد (۰.۱ تا ۱ گرم)',
        subcategories: [
          { id: 'baby_bullion_gift', titleFa: 'Baby / Kids Bullion', titleEn: 'Baby / Kids Bullion' }
        ]
      },
      {
        id: 'custom_bullion',
        titleFa: 'شمش سفارشی',
        titleEn: 'Personalized Bullion',
        skuPrefix: 'DID-CBL',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های حکاکی‌شده با لوگوی سازمانی، اسم و طرح اختصاصی',
        subcategories: [
          { id: 'custom_bullion_personalized', titleFa: 'حکاکی‌شده / Personalized', titleEn: 'Personalized Bullion' }
        ]
      },
      {
        id: 'bank_coin',
        titleFa: 'سکه بانکی',
        titleEn: 'Bank-issued Coin',
        skuPrefix: 'DID-BCN',
        familyId: 'bullion',
        descriptionFa: 'سکه‌های رسمی بانک مرکزی (تمام، نیم، ربع و یک‌گرمی)',
        subcategories: [
          { id: 'bank_issued_coin', titleFa: 'Bank-issued Coin', titleEn: 'Bank-issued Coin' }
        ]
      },
      {
        id: 'commemorative_coin',
        titleFa: 'سکه خصوصی / یادبود',
        titleEn: 'Private / Commemorative Coin',
        skuPrefix: 'DID-CCN',
        familyId: 'bullion',
        descriptionFa: 'مدال‌ها و سکه‌های یادبود شرکتی، تاریخی و کلکسیونی',
        subcategories: [
          { id: 'commemorative_coin_item', titleFa: 'Private / Commemorative Coin', titleEn: 'Commemorative Coin' }
        ]
      },
      {
        id: 'combibar',
        titleFa: 'شمش ترکیبی',
        titleEn: 'CombiBar',
        skuPrefix: 'DID-CMB',
        familyId: 'bullion',
        descriptionFa: 'شمش‌های خردپذیر و قطعه‌قطعه‌شونده (CombiBar)',
        subcategories: [
          { id: 'combibar_separable', titleFa: 'CombiBar', titleEn: 'Separable CombiBar' }
        ]
      }
    ]
  },

  // 5. اقلام مفهومی / نمادین
  {
    id: 'symbolic',
    orderNumber: 5,
    titleFa: '۵. اقلام مفهومی / نمادین',
    titleEn: 'Symbolic & Conceptual Gold',
    badgeFa: 'اقلام مفهومی',
    descriptionFa: 'این خانواده در taxonomy اولیه وجود داشت، اما تعریف آن بعداً بازآفرینی شد؛ شامل محصولات آرت‌گلد، نمادین و مفهومی',
    categories: [
      {
        id: 'symbolic_products',
        titleFa: 'محصولات Symbolic',
        titleEn: 'Symbolic Products',
        skuPrefix: 'DID-SYM',
        familyId: 'symbolic',
        descriptionFa: 'آثار هنری، المان‌های اسطوره‌ای، کهن‌الگوها و مجسمه‌ها و قاب‌های نمادین طلا',
        subcategories: [
          {
            id: 'symbolic_concept_item',
            titleFa: 'اقلام مفهومی و نمادین',
            titleEn: 'Conceptual & Symbolic Gold'
          },
          {
            id: 'mythic_archetype',
            titleFa: 'کهن‌الگوها و نقوش باستانی',
            titleEn: 'Mythic & Ancient Archetypes'
          },
          {
            id: 'art_gold_statue',
            titleFa: 'تندیس، تابلو و آرت‌گلد',
            titleEn: 'Art Gold Sculpture & Frame'
          }
        ]
      }
    ]
  }
];

// Helper Functions
export function getTaxonomyFamilies(): TaxonomyFamily[] {
  return GOLD_TAXONOMY_TREE;
}

export function getCategoriesByFamilyId(familyId: string): TaxonomyCategory[] {
  const fam = GOLD_TAXONOMY_TREE.find((f) => f.id === familyId);
  return fam ? fam.categories : [];
}

export function getSubcategoriesByCategoryId(categoryId: string): TaxonomySubcategory[] {
  for (const fam of GOLD_TAXONOMY_TREE) {
    const cat = fam.categories.find((c) => c.id === categoryId);
    if (cat) return cat.subcategories;
  }
  return [];
}

export function findTaxonomyCategory(categoryId: string): {
  family?: TaxonomyFamily;
  category?: TaxonomyCategory;
} {
  for (const fam of GOLD_TAXONOMY_TREE) {
    const cat = fam.categories.find((c) => c.id === categoryId);
    if (cat) return { family: fam, category: cat };
  }
  return {};
}

export function findTaxonomySubcategory(subcategoryId: string): {
  family?: TaxonomyFamily;
  category?: TaxonomyCategory;
  subcategory?: TaxonomySubcategory;
} {
  for (const fam of GOLD_TAXONOMY_TREE) {
    for (const cat of fam.categories) {
      const sub = cat.subcategories.find((s) => s.id === subcategoryId);
      if (sub) return { family: fam, category: cat, subcategory: sub };
    }
  }
  return {};
}

export function getFlatCategoriesList(): Array<{
  id: string;
  titleFa: string;
  familyId: string;
  familyTitleFa: string;
  skuPrefix: string;
}> {
  const result: Array<{
    id: string;
    titleFa: string;
    familyId: string;
    familyTitleFa: string;
    skuPrefix: string;
  }> = [];

  for (const fam of GOLD_TAXONOMY_TREE) {
    for (const cat of fam.categories) {
      result.push({
        id: cat.id,
        titleFa: cat.titleFa,
        familyId: fam.id,
        familyTitleFa: fam.titleFa,
        skuPrefix: cat.skuPrefix
      });
    }
  }

  return result;
}

/**
 * استانداردهای رسمی عیار طلا در سامانه کاتالوگ دیدار گلد (Standard Gold Carats)
 * طبق استاندارد ملی ایران و معاهدات بین‌المللی شمش و مسکوکات:
 * ۷۵۰: مصنوعات طلا (۱۸ عیار)
 * ۸۷۵: عیار منطقه‌ای و صادراتی (۲۱ عیار)
 * ۹۰۰: سکه بانکی و مسکوکات (۲۱.۶ عیار)
 * ۹۹۵: شمش استاندارد معاملاتی بورس کالا / کارگشایی (۲۴ عیار ۹۹۵)
 * ۹۹۹.۹: شمش اعلای خلوص جهانی Four Nines (۲۴ عیار خالص)
 */
export interface StandardGoldCaratItem {
  id: GoldCarat;
  fineness: string;          // '۷۵۰', '۸۷۵', '۹۰۰', '۹۹۵', '۹۹۹.۹'
  finenessNumber: number;    // 750, 875, 900, 995, 999.9
  caratNumberFa: string;     // '۱۸ عیار', '۲۱ عیار', '۲۱.۶ عیار', '۲۴ عیار (۹۹۵)', '۲۴ عیار (۹۹۹.۹)'
  titleFa: string;           // عنوان نمایشی در کاتالوگ
  fullLabelFa: string;       // برچسب کامل در منوی کشویی و انتخابگر
  domainRoleFa: string;      // کاربرد صنفی (مصنوعات، سکه، شمش بورس...)
  descriptionFa: string;     // توضیحات فنی و درصد خلوص
  purityPercent: number;     // درصد خلوص طلای خالص (۷۵.۰٪، ۸۷.۵٪، ۹۰.۰٪، ۹۹.۵٪، ۹۹.۹۹٪)
  recommendedFamilyId?: string; // خانواده محصول پیشنهادی (مثلا سکه یا شمش)
}

export const STANDARD_GOLD_CARATS: StandardGoldCaratItem[] = [
  {
    id: '18k_750',
    fineness: '۷۵۰',
    finenessNumber: 750,
    caratNumberFa: '۱۸ عیار',
    titleFa: '۱۸ عیار (۷۵۰)',
    fullLabelFa: '۷۵۰ — ۱۸ عیار (استاندارد ملی مصنوعات طلا)',
    domainRoleFa: 'مصنوعات استاندارد و زیورآلات ملی',
    descriptionFa: 'استاندارد ملی و قانونی ساخت زیورآلات و طلا در ایران (خلوص ۷۵۰ در هزار)',
    purityPercent: 75.0,
    recommendedFamilyId: 'jewelry'
  },
  {
    id: '21k_875',
    fineness: '۸۷۵',
    finenessNumber: 875,
    caratNumberFa: '۲۱ عیار',
    titleFa: '۲۱ عیار (۸۷۵)',
    fullLabelFa: '۸۷۵ — ۲۱ عیار (منطقه‌ای / صادراتی)',
    domainRoleFa: 'طلای خلیجی و صادراتی جنوب',
    descriptionFa: 'عیار متداول در بازارهای جنوب ایران و کشورهای حوزه خلیج فارس (خلوص ۸۷۵ در هزار)',
    purityPercent: 87.5,
    recommendedFamilyId: 'jewelry'
  },
  {
    id: '21.6k_900',
    fineness: '۹۰۰',
    finenessNumber: 900,
    caratNumberFa: '۲۱.۶ عیار',
    titleFa: '۲۱.۶ عیار (۹۰۰ سکه‌ای)',
    fullLabelFa: '۹۰۰ — ۲۱.۶ عیار (استاندارد سکه‌های بانکی و مسکوکات)',
    domainRoleFa: 'مسکوکات رسمی بانک مرکزی',
    descriptionFa: 'استاندارد رسمی مسکوکات طلای قانونی (تمام بهار آزادی، امامی، نیم و ربع با خلوص ۹۰۰ در هزار)',
    purityPercent: 90.0,
    recommendedFamilyId: 'bullion'
  },
  {
    id: '24k_995',
    fineness: '۹۹۵',
    finenessNumber: 995,
    caratNumberFa: '۲۴ عیار (۹۹۵)',
    titleFa: '۲۴ عیار (۹۹۵ شمش بورس)',
    fullLabelFa: '۹۹۵ — شمش استاندارد بورس کالا و کارگشایی',
    domainRoleFa: 'شمش معاملاتی بازار سرمایه',
    descriptionFa: 'حداقل خلوص مجاز شمش‌های طلای معاملاتی در بورس کالا و خزانه‌های بانکی ایران (خلوص ۹۹۵ در هزار)',
    purityPercent: 99.5,
    recommendedFamilyId: 'bullion'
  },
  {
    id: '24k_999',
    fineness: '۹۹۹.۹',
    finenessNumber: 999.9,
    caratNumberFa: '۲۴ عیار خالص',
    titleFa: '۲۴ عیار (۹۹۹.۹ شمش خالص)',
    fullLabelFa: '۹۹۹.۹ — ۲۴ عیار خلوص اعلا (Four Nines / جهانی)',
    domainRoleFa: 'شمش اعلای سوئیسی و بین‌المللی',
    descriptionFa: 'بالاترین خلوص جهانی شمش طلا ۴ نُه (Good Delivery خلوص ۹۹۹.۹ در هزار)',
    purityPercent: 99.99,
    recommendedFamilyId: 'bullion'
  }
];
