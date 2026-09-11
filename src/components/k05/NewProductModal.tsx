/**
 * Didar Gold Platform - K05 New Product SKU Modal
 * Register new master gold design with variants, casting specs and wage structure
 */

import React, { useState } from 'react';
import { ProductCategory, GoldCarat, WageType, StonesType, ProductVariant, NarrativeAsset } from '../../types/k05.js';
import { getMasterDataTags, saveMasterDataTag, MasterDataTag } from '../../data/masterDataTags.js';
import {
  GOLD_TAXONOMY_TREE,
  TaxonomyFamily,
  TaxonomyCategory,
  TaxonomySubcategory,
  STANDARD_GOLD_CARATS
} from '../../data/goldTaxonomy.js';
import {
  X,
  Plus,
  Trash2,
  Layers,
  Scale,
  Sparkles,
  CheckCircle2,
  FileText,
  Database,
  Tag,
  Search,
  Film,
  Video,
  Image as ImageIcon,
  Star,
  Play,
  Check,
  ChevronRight
} from 'lucide-react';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [titleFa, setTitleFa] = useState('');
  const [skuCode, setSkuCode] = useState('');

  // ۳ سطح دسته‌بندی کاتالوگ (Taxonomy Tree)
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('jewelry');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ring');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('wedding_band');

  const currentFamily = GOLD_TAXONOMY_TREE.find((f) => f.id === selectedFamilyId) || GOLD_TAXONOMY_TREE[0];
  const currentCategories = currentFamily.categories;
  const currentCategoryObj = currentCategories.find((c) => c.id === selectedCategoryId) || currentCategories[0];
  const currentSubcategories = currentCategoryObj ? currentCategoryObj.subcategories : [];
  const currentSubcategoryObj = currentSubcategories.find((s) => s.id === selectedSubcategoryId) || currentSubcategories[0];

  const handleFamilyChange = (famId: string) => {
    setSelectedFamilyId(famId);
    const fam = GOLD_TAXONOMY_TREE.find((f) => f.id === famId);
    if (fam && fam.categories.length > 0) {
      const firstCat = fam.categories[0];
      setSelectedCategoryId(firstCat.id);
      if (firstCat.subcategories.length > 0) {
        setSelectedSubcategoryId(firstCat.subcategories[0].id);
      }
      if (!skuCode || skuCode.startsWith('DID-')) {
        setSkuCode(`${firstCat.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryId(catId);
    const cat = currentCategories.find((c) => c.id === catId);
    if (cat && cat.subcategories.length > 0) {
      setSelectedSubcategoryId(cat.subcategories[0].id);
    }
    if (cat && (!skuCode || skuCode.startsWith('DID-'))) {
      setSkuCode(`${cat.skuPrefix}-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  const handleSubcategoryChange = (subId: string) => {
    setSelectedSubcategoryId(subId);
  };

  const [carat, setCarat] = useState<GoldCarat>('18k_750');
  const [minWeightGrams, setMinWeightGrams] = useState(11.5);
  const [maxWeightGrams, setMaxWeightGrams] = useState(13.5);
  const [weightTolerancePercent, setWeightTolerancePercent] = useState(2.0);
  const [makerWageType, setMakerWageType] = useState<WageType>('percentage');
  const [makerWageValue, setMakerWageValue] = useState(6.0);
  const [recommendedWholesaleMargin, setRecommendedWholesaleMargin] = useState(2.0);
  const [stonesType, setStonesType] = useState<StonesType>('no_stones');
  const [stonesWeightDeducted, setStonesWeightDeducted] = useState(false);
  const [designStyleFa, setDesignStyleFa] = useState('اسلیمی کلاسیک');
  const [storylineFa, setStorylineFa] = useState('');
  const [craftingTechniqueFa, setCraftingTechniqueFa] = useState('ریخته‌گری دقیق القایی');

  // Master Data Tags State
  const [masterTags, setMasterTags] = useState<MasterDataTag[]>(() => getMasterDataTags());
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'پرفروش_بنکداری',
    'ریخته‌گری_دقیق',
    'بدون_کسری',
    'اسلیمی_صفوی'
  ]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [selectedTagCategory, setSelectedTagCategory] = useState<string>('all');
  const [newCustomTagName, setNewCustomTagName] = useState('');
  const [newCustomTagCategory, setNewCustomTagCategory] = useState<MasterDataTag['category']>('commercial');

  // Multi-Asset Studio Gallery (Images & Videos) State
  const [narrativeAssets, setNarrativeAssets] = useState<Array<{
    id: string;
    type: 'photo_hero' | 'photo_detail' | 'video_turn' | 'render_3d';
    typeFa: string;
    url: string;
    titleFa: string;
    isPrimary: boolean;
  }>>([
    {
      id: 'ast-init-1',
      type: 'photo_hero',
      typeFa: 'تصویر اصلی استودیویی',
      url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80',
      titleFa: 'نمای استودیویی کاتالوگ (پس‌زمینه سفید)',
      isPrimary: true
    },
    {
      id: 'ast-init-2',
      type: 'photo_detail',
      typeFa: 'نمای نزدیک (ماکرو)',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
      titleFa: 'ماکرو از جزئیات تراش‌ها و آینه‌کاری',
      isPrimary: false
    },
    {
      id: 'ast-init-3',
      type: 'video_turn',
      typeFa: 'ویدیوی معرفی ۳۶۰ درجه',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-ring-rotating-on-a-black-background-40742-large.mp4',
      titleFa: 'ویدیوی استودیویی چرخش ۳۶۰ درجه روی پایه گردان',
      isPrimary: false
    }
  ]);

  // New Asset Form State
  const [showAddAssetForm, setShowAddAssetForm] = useState(false);
  const [newAssetType, setNewAssetType] = useState<'photo_hero' | 'photo_detail' | 'video_turn' | 'render_3d'>('photo_detail');
  const [newAssetUrl, setNewAssetUrl] = useState('');
  const [newAssetTitle, setNewAssetTitle] = useState('');

  // Variants list with weight ranges (No initial stock - stock is minted in K06)
  const [variants, setVariants] = useState<Array<{
    sizeLabelFa: string;
    color: 'yellow' | 'white' | 'rose' | 'dual_tone';
    minWeightGrams: number;
    maxWeightGrams: number;
    targetWeightGrams: number;
  }>>([
    { sizeLabelFa: 'سایز ۲ (استاندارد ۵۷ میلی‌متر)', color: 'yellow', minWeightGrams: 11.50, maxWeightGrams: 12.50, targetWeightGrams: 12.0 },
    { sizeLabelFa: 'سایز ۳ (۶۰ میلی‌متر)', color: 'yellow', minWeightGrams: 12.50, maxWeightGrams: 13.50, targetWeightGrams: 13.0 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddVariant = () => {
    const nextNum = variants.length + 1;
    const minW = minWeightGrams ? Number(minWeightGrams.toFixed(2)) : 10.0;
    const maxW = maxWeightGrams ? Number(maxWeightGrams.toFixed(2)) : 12.0;
    setVariants([
      ...variants,
      {
        sizeLabelFa: `سایز ${nextNum}`,
        color: 'yellow',
        minWeightGrams: minW,
        maxWeightGrams: maxW,
        targetWeightGrams: Number(((minW + maxW) / 2).toFixed(2))
      }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Master Data Tags Handlers
  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleAddNewMasterTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCustomTagName.trim()) return;
    const created = saveMasterDataTag({
      name: newCustomTagName.trim(),
      category: newCustomTagCategory
    });
    setMasterTags(getMasterDataTags());
    if (!selectedTags.includes(created.name)) {
      setSelectedTags([...selectedTags, created.name]);
    }
    setNewCustomTagName('');
  };

  // Multi-Media Studio Assets Handlers
  const handleAddMediaAsset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAssetUrl.trim()) return;
    const typeTitles: Record<string, string> = {
      photo_hero: 'تصویر اصلی استودیویی',
      photo_detail: 'نمای نزدیک (ماکرو)',
      video_turn: 'ویدیوی معرفی ۳۶۰ درجه',
      render_3d: 'رندر ۳بعدی صنعتی'
    };
    const newAsset = {
      id: `ast-custom-${Date.now()}`,
      type: newAssetType,
      typeFa: typeTitles[newAssetType] || 'رسانه استودیویی',
      url: newAssetUrl.trim(),
      titleFa: newAssetTitle.trim() || typeTitles[newAssetType],
      isPrimary: narrativeAssets.length === 0
    };
    setNarrativeAssets([...narrativeAssets, newAsset]);
    setNewAssetUrl('');
    setNewAssetTitle('');
    setShowAddAssetForm(false);
  };

  const handleRemoveAsset = (id: string) => {
    const remaining = narrativeAssets.filter(a => a.id !== id);
    if (remaining.length > 0 && !remaining.some(a => a.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    setNarrativeAssets(remaining);
  };

  const handleSetPrimaryAsset = (id: string) => {
    setNarrativeAssets(narrativeAssets.map(a => ({
      ...a,
      isPrimary: a.id === id
    })));
  };

  const handleAddSampleAsset = (type: 'macro' | 'video' | 'render') => {
    if (type === 'macro') {
      setNarrativeAssets([
        ...narrativeAssets,
        {
          id: `ast-sample-${Date.now()}`,
          type: 'photo_detail',
          typeFa: 'نمای نزدیک (ماکرو)',
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          titleFa: 'ماکرو از تراش‌های روی طلا و پرداخت آینه‌ای',
          isPrimary: false
        }
      ]);
    } else if (type === 'video') {
      setNarrativeAssets([
        ...narrativeAssets,
        {
          id: `ast-sample-${Date.now()}`,
          type: 'video_turn',
          typeFa: 'ویدیوی معرفی ۳۶۰ درجه',
          url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-ring-rotating-on-a-black-background-40742-large.mp4',
          titleFa: 'ویدیوی استودیویی چرخش ۳۶۰ درجه روی پایه گردان',
          isPrimary: false
        }
      ]);
    } else if (type === 'render') {
      setNarrativeAssets([
        ...narrativeAssets,
        {
          id: `ast-sample-${Date.now()}`,
          type: 'render_3d',
          typeFa: 'رندر ۳بعدی صنعتی',
          url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
          titleFa: 'رندر سه‌بعدی CAD با نورپردازی گرم',
          isPrimary: false
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFa.trim()) {
      setError('عنوان مدل کالا الزامی است.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const matchedCarat = STANDARD_GOLD_CARATS.find(c => c.id === carat);
      const caratFa = matchedCarat ? matchedCarat.titleFa : '۱۸ عیار (۷۵۰)';

      const colorLabels: Record<string, string> = {
        yellow: 'طلای زرد',
        white: 'طلای سفید',
        rose: 'طلای رزگلد',
        dual_tone: 'دو رنگ'
      };

      const categoryFa = currentCategoryObj?.titleFa || 'انگشتر';
      const subcategoryFa = currentSubcategoryObj?.titleFa || 'استاندارد';
      const prefix = currentCategoryObj?.skuPrefix || `DID-${selectedCategoryId.substring(0, 3).toUpperCase()}`;

      const generatedSku = skuCode.trim() || `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

      const formattedVariants: ProductVariant[] = variants.map((v, idx) => {
        const minW = Number(v.minWeightGrams) || Number(minWeightGrams) || 10;
        const maxW = Number(v.maxWeightGrams) || Number(maxWeightGrams) || (minW + 1);
        const target = Number(((minW + maxW) / 2).toFixed(2));
        return {
          id: `var-new-${Date.now()}-${idx}`,
          skuCode: `${generatedSku}-V${idx + 1}`,
          sizeLabelFa: v.sizeLabelFa,
          color: v.color,
          colorFa: colorLabels[v.color] || 'طلای زرد',
          minWeightGrams: minW,
          maxWeightGrams: maxW,
          weightRangeFa: `${minW.toFixed(2)} الی ${maxW.toFixed(2)} گرم`,
          targetWeightGrams: target,
          toleranceGrams: Number(((maxW - minW) / 2).toFixed(2)) || 0.25,
          inStockQuantity: 0, // در کاتالوگ موجودی اولیه صفر است؛ با صدور پاسپورت فیزیکی در K06 یا پذیرش در انبار شارژ می‌شود
          barcode: `6269000${Math.floor(100000 + Math.random() * 900000)}`
        };
      });

      const allMin = formattedVariants.map(v => v.minWeightGrams || 0).filter(w => w > 0);
      const allMax = formattedVariants.map(v => v.maxWeightGrams || 0).filter(w => w > 0);
      const prodMin = minWeightGrams > 0 ? minWeightGrams : (allMin.length > 0 ? Math.min(...allMin) : 10.0);
      const prodMax = maxWeightGrams > 0 ? maxWeightGrams : (allMax.length > 0 ? Math.max(...allMax) : 12.0);
      const prodTarget = Number(((prodMin + prodMax) / 2).toFixed(2));

      await onSubmit({
        skuCode: generatedSku,
        titleFa,
        familyId: currentFamily.id,
        familyTitleFa: currentFamily.titleFa,
        category: selectedCategoryId as ProductCategory,
        categoryFa,
        subcategoryId: selectedSubcategoryId,
        subcategoryFa,
        carat,
        caratFa,
        baseWeightGrams: prodTarget,
        minWeightGrams: prodMin,
        maxWeightGrams: prodMax,
        weightRangeFa: `${prodMin.toFixed(2)} الی ${prodMax.toFixed(2)} گرم`,
        weightTolerancePercent: Number(weightTolerancePercent),
        makerWageType,
        makerWageValue: Number(makerWageValue),
        recommendedWholesaleMargin: Number(recommendedWholesaleMargin),
        stonesType,
        stonesTypeFa: stonesType === 'no_stones' ? 'بدون نگین' : 'دارای نگین',
        stonesWeightDeducted,
        designStyleFa,
        storylineFa: storylineFa.trim() || 'طراحی متناسب با خط تولید بنکداری دیدار گلد با بالاترین استاندارد ساخت.',
        craftingTechniqueFa,
        tags: selectedTags.length > 0 ? selectedTags : ['طلا', 'بنکداری'],
        status: 'active',
        variants: formattedVariants,
        narrativeAssets: narrativeAssets.length > 0 ? narrativeAssets : [
          {
            id: `ast-${Date.now()}`,
            type: 'photo_hero',
            typeFa: 'تصویر استودیویی اصلی',
            url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80',
            titleFa: 'نمای استودیویی مدل',
            isPrimary: true
          }
        ]
      });

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت مدل کالا.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#15151E] border border-[#2B2B3E] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#252536] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C8A951]/20 text-[#C8A951]">
              <Plus className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#EDEDED]">تعریف مدل جدید در کاتالوگ طلا (New SKU)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7E7E90] hover:text-[#EDEDED] hover:bg-[#252536] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-[#2E181B] border border-[#522026] text-[#FF7A7A] text-xs">
              {error}
            </div>
          )}

          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[#A0A0B4] font-medium block">نام تجاری مدل طلا *</label>
              <input
                type="text"
                required
                placeholder="مثلا: النگو طلا ۱۸ عیار طرح پروا ریخته‌گری"
                value={titleFa}
                onChange={(e) => setTitleFa(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">کد SKU پیشنهادی</label>
              <input
                type="text"
                placeholder="خودکار (DID-BNG-...)"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* ۳ سطح سلسله‌مراتب دسته‌بندی کاتالوگ طلا (Gold Product Taxonomy 3 Levels) */}
          <div className="p-4 rounded-2xl bg-[#14141E] border border-[#2B2B3E] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242436] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#282114] text-[#C8A951] border border-[#C8A951]/30 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
                    دسته‌بندی ۳ سطحی کاتالوگ طلا (Gold Taxonomy)
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-[#C8A951]/10 text-[#E5C365] border border-[#C8A951]/30">
                      ۳ سطح مرتبط
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8A8A9E]">
                    تعیین خانواده اصلی (Level 1)، دسته محصول (Level 2) و زیردسته / نوع قطعه (Level 3)
                  </p>
                </div>
              </div>

              {/* مسیر انتخاب‌شده (Taxonomy Breadcrumb) */}
              <div className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl bg-[#1B1B26] border border-[#2E2E40] text-[#A0A0B8]">
                <span className="text-[#C8A951] font-semibold">{currentFamily.badgeFa}</span>
                <ChevronRight className="w-3 h-3 text-[#5A5A72] rotate-180" />
                <span className="text-[#EDEDED] font-semibold">{currentCategoryObj?.titleFa}</span>
                {currentSubcategoryObj && (
                  <>
                    <ChevronRight className="w-3 h-3 text-[#5A5A72] rotate-180" />
                    <span className="text-[#3DD68C] font-semibold">{currentSubcategoryObj.titleFa}</span>
                  </>
                )}
              </div>
            </div>

            {/* Level 1: خانواده اصلی (Main Family) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#C8A951] flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-[#C8A951]/20 text-[#C8A951] text-[10px] flex items-center justify-center font-mono font-bold">1</span>
                Level 1 — خانواده اصلی محصول (Main Family):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {GOLD_TAXONOMY_TREE.map((fam) => {
                  const isActive = fam.id === selectedFamilyId;
                  return (
                    <button
                      key={fam.id}
                      type="button"
                      onClick={() => handleFamilyChange(fam.id)}
                      className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between ${
                        isActive
                          ? 'bg-[#282115] border-[#C8A951] text-[#EDEDED] shadow-sm ring-1 ring-[#C8A951]/50'
                          : 'bg-[#181824] border-[#2A2A3C] text-[#8E8EA2] hover:bg-[#1E1E2C] hover:text-[#D0D0E0]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold truncate">{fam.badgeFa}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#C8A951]" />}
                      </div>
                      <span className="text-[10px] text-[#6E6E82] truncate font-mono">{fam.titleEn}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#78788C]">
                {currentFamily.descriptionFa}
              </p>
            </div>

            {/* Level 2 & Level 3 in 2 responsive columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Level 2: Category */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#EDEDED] flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-mono font-bold">2</span>
                    Level 2 — Category (گروه / دسته محصول):
                  </label>
                  <span className="text-[10px] font-mono text-[#E5C365] bg-[#C8A951]/10 px-1.5 py-0.5 rounded border border-[#C8A951]/20">
                    کد پیشوند: {currentCategoryObj?.skuPrefix}
                  </span>
                </div>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181824] border border-[#2F2F44] text-[#EDEDED] focus:outline-none focus:border-[#C8A951] text-xs font-semibold"
                >
                  {currentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.titleFa} {cat.titleEn ? `(${cat.titleEn})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#7A7A8E]">
                  {currentCategoryObj?.descriptionFa || 'دسته‌بندی پایه قطعه جهت تعیین کدینگ و ساخت'}
                </p>
              </div>

              {/* Level 3: Subcategory / Product Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-mono font-bold">3</span>
                  Level 3 — Subcategory / Product Type (زیردسته / نوع قطعه):
                </label>
                <select
                  value={selectedSubcategoryId}
                  onChange={(e) => handleSubcategoryChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181824] border border-[#2F2F44] text-[#EDEDED] focus:outline-none focus:border-[#C8A951] text-xs font-semibold"
                >
                  {currentSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.titleFa} {sub.titleEn ? `(${sub.titleEn})` : ''}
                    </option>
                  ))}
                </select>

                {/* Subcategory interactive fast-chips */}
                {currentSubcategories.length > 1 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {currentSubcategories.map((sub) => {
                      const isSubActive = sub.id === selectedSubcategoryId;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubcategoryChange(sub.id)}
                          className={`px-2 py-0.5 rounded-lg text-[11px] transition-all ${
                            isSubActive
                              ? 'bg-[#C8A951] text-black font-bold shadow-xs'
                              : 'bg-[#1F1F2E] text-[#A0A0B4] hover:bg-[#2A2A3E] hover:text-[#EDEDED] border border-[#2E2E42]'
                          }`}
                        >
                          {sub.titleFa}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Note if Symbolic Family selected */}
            {selectedFamilyId === 'symbolic' && (
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200">
                <strong>توضیح اقلام مفهومی / نمادین:</strong> این بخش شامل تندیس‌ها و مجسمه‌های آرت‌گلد، کهن‌الگوها و نمادهای اسطوره‌ای با هویت هنری و سفارشی است.
              </div>
            )}
          </div>

          {/* Carat & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[#A0A0B4] font-medium block text-xs">
                  عیار استاندارد <span className="text-[#C8A951]">*</span>
                </label>
                {(() => {
                  const currentCaratObj = STANDARD_GOLD_CARATS.find(c => c.id === carat);
                  return currentCaratObj ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#252536] text-[#C8A951] font-mono border border-[#C8A951]/20">
                      خلوص: {currentCaratObj.purityPercent}٪ (عیار {currentCaratObj.fineness})
                    </span>
                  ) : null;
                })()}
              </div>

              {/* Fast selector for 5 Standard Carats (۷۵۰, ۸۷۵, ۹۰۰, ۹۹۵, ۹۹۹.۹) */}
              <div className="grid grid-cols-5 gap-1.5">
                {STANDARD_GOLD_CARATS.map((c) => {
                  const isSelected = carat === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCarat(c.id)}
                      className={`py-2 px-1 text-center rounded-xl border transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[#C8A951] border-[#C8A951] text-[#121218] font-bold shadow-md shadow-[#C8A951]/20'
                          : 'bg-[#14141E] border-[#29293C] text-[#EDEDED] hover:bg-[#1E1E2C] hover:border-[#3D3D54]'
                      }`}
                    >
                      <span className="font-mono text-xs font-black">{c.fineness}</span>
                      <span className={`text-[9px] mt-0.5 whitespace-nowrap ${isSelected ? 'text-black/80 font-bold' : 'text-[#88889C]'}`}>
                        {c.caratNumberFa}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dropdown Select with full details */}
              <select
                value={carat}
                onChange={(e) => setCarat(e.target.value as GoldCarat)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951] text-xs font-medium"
              >
                {STANDARD_GOLD_CARATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullLabelFa}
                  </option>
                ))}
              </select>

              {/* Contextual description of selected standard carat */}
              {(() => {
                const currentCaratObj = STANDARD_GOLD_CARATS.find(c => c.id === carat);
                if (!currentCaratObj) return null;
                return (
                  <div className="p-2 rounded-xl bg-[#181826] border border-[#2B2B3E] text-[11px] text-[#A0A0B8] flex items-center justify-between gap-2">
                    <span className="text-[#C8A951] font-semibold whitespace-nowrap">
                      {currentCaratObj.domainRoleFa}:
                    </span>
                    <span className="text-[10px] text-[#9A9AB0] text-left truncate">
                      {currentCaratObj.descriptionFa}
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">
                رنج وزنی کلی مدل (گرم)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="از"
                    value={minWeightGrams}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMinWeightGrams(val);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#E5C365] font-mono text-center focus:outline-none focus:border-[#C8A951]"
                  />
                  <span className="text-[10px] text-[#78788C] block text-center mt-0.5">از (حداقل)</span>
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="تا"
                    value={maxWeightGrams}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMaxWeightGrams(val);
                    }}
                    className="w-full px-2.5 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#E5C365] font-mono text-center focus:outline-none focus:border-[#C8A951]"
                  />
                  <span className="text-[10px] text-[#78788C] block text-center mt-0.5">تا (حداکثر)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wages & Margin */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">نوع محاسبه اجرت</label>
              <select
                value={makerWageType}
                onChange={(e) => setMakerWageType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="percentage">درصدی از ارزش طلای خام</option>
                <option value="fixed_per_gram">مبلغ ثابت ریالی به ازای هر گرم</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">
                {makerWageType === 'percentage' ? 'میزان اجرت ساخت (درصد)' : 'اجرت هر گرم (ریال)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={makerWageValue}
                onChange={(e) => setMakerWageValue(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">سود بنکداری پیشنهادی (درصد)</label>
              <input
                type="number"
                step="0.1"
                value={recommendedWholesaleMargin}
                onChange={(e) => setRecommendedWholesaleMargin(parseFloat(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] font-mono focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Stones and Design Style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">وضعیت سنگ و نگین</label>
              <select
                value={stonesType}
                onChange={(e) => setStonesType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="no_stones">تمام طلا (بدون نگین)</option>
                <option value="cubic_zirconia">نگین اتمی (با کسر وزن سنگ)</option>
                <option value="certified_gemstones">جواهر و سنگ شناسنامه‌دار</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">سبک طراحی</label>
              <input
                type="text"
                value={designStyleFa}
                onChange={(e) => setDesignStyleFa(e.target.value)}
                placeholder="مثلا: فیوژن هندسی، سنتی یزد"
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#A0A0B4] font-medium block">فناوری تولید و ساخت</label>
              <input
                type="text"
                value={craftingTechniqueFa}
                onChange={(e) => setCraftingTechniqueFa(e.target.value)}
                placeholder="مثلا: ریخته‌گری القایی، برش لیزر"
                className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              />
            </div>
          </div>

          {/* Narrative Storyline */}
          <div className="space-y-1">
            <label className="text-[#A0A0B4] font-medium block">روایت و داستان مفهومی طرح (Narrative)</label>
            <textarea
              rows={2}
              placeholder="توضیح الهام‌بخش هنری یا فلسفه ساخت قطعه جهت معرفی در کاتالوگ بنکداری..."
              value={storylineFa}
              onChange={(e) => setStorylineFa(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111118] border border-[#2B2B3C] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          {/* Variants Configuration */}
          <div className="space-y-2 p-3 rounded-xl bg-[#111118] border border-[#252536]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-[#C8A951]">زیرتنوع‌های SKU و رنج وزنی هر سایز:</span>
                <p className="text-[10px] text-[#8C8CA0]">
                  برای هر SKU رنج وزنی (از حداقل تا حداکثر بر اساس تلورانس ساخت) را مشخص کنید. موجودی اولیه صفر است و با صدور گذرنامه در K06 یا ورود به انبار ثبت می‌شود.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="text-[11px] font-bold text-[#3DD68C] hover:underline flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                افزودن SKU جدید
              </button>
            </div>

            {/* Table Header for Variant Inputs */}
            <div className="hidden sm:grid grid-cols-12 gap-2 px-2 py-1 text-[10px] text-[#7E7E94] font-medium">
              <span className="col-span-4">سایز و مشخصات ابعادی</span>
              <span className="col-span-3">رنگ آلیاژ طلا</span>
              <span className="col-span-2 text-center">از (حداقل وزن g)</span>
              <span className="col-span-2 text-center">تا (حداکثر وزن g)</span>
              <span className="col-span-1 text-center">حذف</span>
            </div>

            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#171722] p-2 rounded-lg text-[11px] items-center">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="عنوان سایز (مثلا سایز ۱)"
                      value={v.sizeLabelFa}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i].sizeLabelFa = e.target.value;
                        setVariants(next);
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#0F0F14] border border-[#28283A] text-[#EDEDED]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={v.color}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i].color = e.target.value as any;
                        setVariants(next);
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#0F0F14] border border-[#28283A] text-[#EDEDED]"
                    >
                      <option value="yellow">طلای زرد</option>
                      <option value="white">طلای سفید</option>
                      <option value="rose">رزگلد</option>
                      <option value="dual_tone">دو رنگ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="از (Min)"
                      title="حداقل وزن رنج (گرم)"
                      value={v.minWeightGrams}
                      onChange={(e) => {
                        const next = [...variants];
                        const val = parseFloat(e.target.value) || 0;
                        next[i].minWeightGrams = val;
                        next[i].targetWeightGrams = Number(((val + (next[i].maxWeightGrams || val)) / 2).toFixed(2));
                        setVariants(next);
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#0F0F14] border border-[#28283A] text-[#E5C365] font-mono text-center"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="تا (Max)"
                      title="حداکثر وزن رنج (گرم)"
                      value={v.maxWeightGrams}
                      onChange={(e) => {
                        const next = [...variants];
                        const val = parseFloat(e.target.value) || 0;
                        next[i].maxWeightGrams = val;
                        next[i].targetWeightGrams = Number((((next[i].minWeightGrams || val) + val) / 2).toFixed(2));
                        setVariants(next);
                      }}
                      className="w-full px-2 py-1.5 rounded bg-[#0F0F14] border border-[#28283A] text-[#E5C365] font-mono text-center"
                    />
                  </div>

                  <div className="sm:col-span-1 flex justify-center">
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(i)}
                        className="p-1 text-[#78788C] hover:text-[#FF7A7A]"
                        title="حذف این تنوع"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Data Tags Section */}
          <div className="p-3.5 rounded-xl bg-[#111118] border border-[#252536] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#C8A951]" />
                <span className="font-bold text-xs text-[#EDEDED]">
                  حوزه مستر دیتا: برچسب‌ها و طبقه‌بندی‌های استاندارد (Master Data Tags)
                </span>
              </div>
              <span className="text-[10px] text-[#8C8CA0]">
                {selectedTags.length} برچسب انتخاب‌شده برای این مدل
              </span>
            </div>

            {/* Selected Tags Display */}
            <div className="p-2.5 rounded-lg bg-[#161622] border border-[#2B2B3E] min-h-[42px] flex flex-wrap items-center gap-1.5">
              {selectedTags.length === 0 ? (
                <span className="text-[11px] text-[#6B6B82] italic">
                  هیچ برچسبی انتخاب نشده است. از دسته‌های مستر دیتا در زیر کلیک کنید یا برچسب جدید بنویسید.
                </span>
              ) : (
                selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/40 text-[11px] font-medium transition-all"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className="text-[#C8A951] hover:text-[#FF7A7A] transition-colors p-0.5"
                      title="حذف این برچسب"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Master Data Categories & Search */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                  {[
                    { id: 'all', label: 'همه حوزه‌ها' },
                    { id: 'commercial', label: 'بازار و فروش' },
                    { id: 'manufacturing', label: 'تکنیک و ساخت' },
                    { id: 'gemstones', label: 'نگین و گوهر' },
                    { id: 'style', label: 'سبک و دیزاین' },
                    { id: 'usage', label: 'کاربرد و مناسبت' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedTagCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                        selectedTagCategory === cat.id
                          ? 'bg-[#C8A951] text-[#111118] font-bold'
                          : 'bg-[#1A1A26] text-[#8E8EA2] hover:bg-[#252536]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3 h-3 text-[#787890] absolute right-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="جستجو در مستر دیتا..."
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    className="w-full pr-7 pl-2 py-1 rounded-lg bg-[#0F0F16] border border-[#28283A] text-[#EDEDED] text-[10px] focus:outline-none focus:border-[#C8A951]"
                  />
                </div>
              </div>

              {/* Tag Cloud Pills */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#0E0E14] border border-[#20202E] max-h-32 overflow-y-auto">
                {masterTags
                  .filter((t) => {
                    const matchCat = selectedTagCategory === 'all' || t.category === selectedTagCategory;
                    const matchSearch = !tagSearchQuery.trim() || t.name.toLowerCase().includes(tagSearchQuery.toLowerCase());
                    return matchCat && matchSearch;
                  })
                  .map((t) => {
                    const isSelected = selectedTags.includes(t.name);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleTag(t.name)}
                        className={`px-2 py-1 rounded-md text-[10px] transition-all flex items-center gap-1 border ${
                          isSelected
                            ? 'bg-[#C8A951]/25 text-[#FFDF80] border-[#C8A951]/60 font-medium shadow-sm'
                            : 'bg-[#181824] text-[#A0A0B6] border-[#2A2A3E] hover:border-[#C8A951]/40 hover:text-[#EDEDED]'
                        }`}
                      >
                        {isSelected ? <Check className="w-2.5 h-2.5 text-[#C8A951]" /> : <Plus className="w-2.5 h-2.5 text-[#6E6E82]" />}
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
              </div>

              {/* Create New Master Tag */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="افزودن برچسب جدید به مستر دیتا (مثلا: تراش_خورشیدی)..."
                  value={newCustomTagName}
                  onChange={(e) => setNewCustomTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewMasterTag();
                    }
                  }}
                  className="flex-1 min-w-[180px] px-2.5 py-1.5 rounded-lg bg-[#0F0F16] border border-[#28283A] text-[#EDEDED] text-[11px] focus:outline-none focus:border-[#C8A951]"
                />
                <select
                  value={newCustomTagCategory}
                  onChange={(e) => setNewCustomTagCategory(e.target.value as any)}
                  className="px-2 py-1.5 rounded-lg bg-[#0F0F16] border border-[#28283A] text-[#EDEDED] text-[11px] focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="commercial">حوزه: بازار و فروش</option>
                  <option value="manufacturing">حوزه: تکنیک و ساخت</option>
                  <option value="gemstones">حوزه: نگین و گوهر</option>
                  <option value="style">حوزه: سبک و دیزاین</option>
                  <option value="usage">حوزه: کاربرد و مناسبت</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddNewMasterTag}
                  className="px-3 py-1.5 rounded-lg bg-[#252538] hover:bg-[#C8A951] text-[#EDEDED] hover:text-[#111118] text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ثبت در مستر دیتا</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multi-Media Studio Assets (Multiple Photos & Videos) */}
          <div className="p-3.5 rounded-xl bg-[#111118] border border-[#252536] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#C8A951]" />
                  <span className="font-bold text-xs text-[#EDEDED]">
                    چندرسانه‌ای استودیویی: تصاویر متعدد و ویدیوهای معرفی (Studio Media)
                  </span>
                </div>
                <p className="text-[10px] text-[#8C8CA0] mt-0.5">
                  امکان بارگذاری چندین عکس استودیویی (پشت‌سفید، ماکرو) و ویدیوهای ۳۶۰ درجه یا تیزر مدل طلا
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowAddAssetForm(!showAddAssetForm)}
                  className="px-2.5 py-1 rounded-lg bg-[#C8A951]/20 hover:bg-[#C8A951]/30 text-[#E5C365] border border-[#C8A951]/40 text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>افزودن رسانه جدید</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleAsset('video')}
                  className="px-2 py-1 rounded-lg bg-[#1D1D2C] hover:bg-[#29293E] text-[#B0B0C4] text-[10px] flex items-center gap-1 transition-colors"
                  title="افزودن نمونه فایل ویدیویی ۳۶۰ درجه"
                >
                  <Video className="w-3 h-3 text-[#3DD68C]" />
                  <span>+ نمونه ویدیو ۳۶۰</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddSampleAsset('macro')}
                  className="px-2 py-1 rounded-lg bg-[#1D1D2C] hover:bg-[#29293E] text-[#B0B0C4] text-[10px] flex items-center gap-1 transition-colors"
                  title="افزودن نمونه عکس جزئیات ماکرو"
                >
                  <ImageIcon className="w-3 h-3 text-[#E5C365]" />
                  <span>+ نمونه ماکرو</span>
                </button>
              </div>
            </div>

            {/* Add Asset Inline Form */}
            {showAddAssetForm && (
              <div className="p-3 rounded-lg bg-[#181824] border border-[#303046] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#E5C365]">مشخصات رسانه جدید (عکس / ویدیو):</span>
                  <button
                    type="button"
                    onClick={() => setShowAddAssetForm(false)}
                    className="text-[#88889C] hover:text-[#EDEDED]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-[#8C8CA0] block mb-1">نوع رسانه</label>
                    <select
                      value={newAssetType}
                      onChange={(e) => setNewAssetType(e.target.value as any)}
                      className="w-full px-2 py-1.5 rounded-lg bg-[#0F0F16] border border-[#2B2B3C] text-[#EDEDED] text-[11px]"
                    >
                      <option value="photo_hero">تصویر اصلی استودیویی (Hero)</option>
                      <option value="photo_detail">نمای نزدیک و ماکرو از جزئیات</option>
                      <option value="video_turn">ویدیوی معرفی ۳۶۰ درجه / تیزر</option>
                      <option value="render_3d">رندر سه‌بعدی صنعتی CAD</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[10px] text-[#8C8CA0] block mb-1">عنوان فارسی رسانه</label>
                    <input
                      type="text"
                      placeholder="مثلا: ویدیوی نمای ۳۶۰ درجه روی دست یا ماکرو از تراش‌ها"
                      value={newAssetTitle}
                      onChange={(e) => setNewAssetTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#0F0F16] border border-[#2B2B3C] text-[#EDEDED] text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#8C8CA0] block mb-1">نشانی اینترنتی فایل تصویر یا ویدیو (URL مستقیم یا CDN)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/video.mp4 یا https://example.com/image.jpg"
                      value={newAssetUrl}
                      onChange={(e) => setNewAssetUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0F0F16] border border-[#2B2B3C] text-[#EDEDED] font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddMediaAsset}
                      className="px-4 py-1.5 rounded-lg bg-[#C8A951] text-[#111118] font-bold text-[11px] hover:bg-[#D8B961] transition-colors shrink-0"
                    >
                      تأیید و درج
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Media Assets Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {narrativeAssets.map((asset) => {
                const isVideo = asset.type === 'video_turn' || asset.url.endsWith('.mp4') || asset.url.endsWith('.webm');
                return (
                  <div
                    key={asset.id}
                    className={`relative rounded-xl border p-2 bg-[#151520] transition-all flex flex-col justify-between ${
                      asset.isPrimary ? 'border-[#C8A951] shadow-md shadow-[#C8A951]/10' : 'border-[#28283A] hover:border-[#38384E]'
                    }`}
                  >
                    {/* Media Preview Box */}
                    <div className="w-full h-28 rounded-lg bg-[#0B0B10] overflow-hidden relative border border-[#1E1E2C] flex items-center justify-center">
                      {isVideo ? (
                        <div className="w-full h-full relative group">
                          <video
                            src={asset.url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            autoPlay
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <span className="p-1.5 rounded-full bg-black/60 text-[#3DD68C] backdrop-blur-xs">
                              <Play className="w-4 h-4 fill-current" />
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={asset.url}
                          alt={asset.titleFa}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Primary Badge */}
                      {asset.isPrimary && (
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#C8A951] text-[#111118] text-[9px] font-bold flex items-center gap-1 shadow">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>شاخص کاتالوگ</span>
                        </div>
                      )}

                      {/* Type Pill */}
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] text-[#D8D8E6] backdrop-blur-xs flex items-center gap-1">
                        {isVideo ? <Film className="w-2.5 h-2.5 text-[#3DD68C]" /> : <ImageIcon className="w-2.5 h-2.5 text-[#C8A951]" />}
                        <span>{asset.typeFa}</span>
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="pt-2 space-y-1.5">
                      <span className="text-[11px] font-medium text-[#EDEDED] block truncate" title={asset.titleFa}>
                        {asset.titleFa}
                      </span>
                      <span className="text-[9px] font-mono text-[#78788C] block truncate" dir="ltr" title={asset.url}>
                        {asset.url}
                      </span>

                      <div className="flex items-center justify-between pt-1 border-t border-[#20202E]">
                        {!asset.isPrimary ? (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryAsset(asset.id)}
                            className="text-[10px] text-[#A0A0B8] hover:text-[#C8A951] flex items-center gap-1 transition-colors"
                          >
                            <Star className="w-3 h-3" />
                            <span>تصویر اصلی</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#C8A951] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>پیش‌فرض</span>
                          </span>
                        )}

                        {narrativeAssets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAsset(asset.id)}
                            className="p-1 text-[#78788C] hover:text-[#FF7A7A] transition-colors"
                            title="حذف این رسانه"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#252536] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#222230] text-[#A0A0B4] hover:bg-[#2C2C3E] transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] font-bold flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'در حال ثبت...' : 'ثبت مدل در کاتالوگ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
