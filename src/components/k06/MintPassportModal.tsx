import React, { useState } from 'react';
import {
  X,
  Plus,
  Award,
  Scale,
  ShieldCheck,
  Building2,
  FileText,
  AlertCircle,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { ProductSku } from '../../types/k05';

export interface MacroPhotoItem {
  id: string;
  url: string;
  titleFa: string;
  captureArea: string;
  magnification: string;
}

interface MintPassportModalProps {
  products: ProductSku[];
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
}

export const MintPassportModal: React.FC<MintPassportModalProps> = ({
  products,
  onClose,
  onSubmit
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products.length > 0 ? products[0].id : ''
  );
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // تشخیص اولیه ماهیت قطعه (آبشده یا مصنوعات)
  const isInitialAbshodeh =
    selectedProduct?.category === 'coin_medallion' ||
    selectedProduct?.titleFa?.includes('آبشده') ||
    selectedProduct?.titleFa?.includes('شمش');

  const [itemNature, setItemNature] = useState<'manufactured_jewelry' | 'melted_gold'>(
    isInitialAbshodeh ? 'melted_gold' : 'manufactured_jewelry'
  );

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    selectedProduct?.variants[0]?.id || ''
  );
  const selectedVariant = selectedProduct?.variants.find((v) => v.id === selectedVariantId);

  const [actualScaleWeightGrams, setActualScaleWeightGrams] = useState<number>(
    selectedVariant ? selectedVariant.targetWeightGrams : 12.0
  );
  const [scaleModel, setScaleModel] = useState<string>(
    'ترازوی تحلیلی AND FX-300i (دقت ۰.۰۰۱ گرم)'
  );

  // ۳. Assay Laboratory & Hallmark (صرفاً برای آبشده الزامی است، برای مصنوعات اختیاری)
  const [assayLabName, setAssayLabName] = useState<string>(
    itemNature === 'melted_gold' ? 'آزمایشگاه ری‌گیری رسمی زرفام تهران' : ''
  );
  const [assayUnionPermitNo, setAssayUnionPermitNo] = useState<string>(
    itemNature === 'melted_gold' ? 'پروانه اتحادیه: 1402-984' : ''
  );
  const [assayPacketCode, setAssayPacketCode] = useState<string>(
    itemNature === 'melted_gold' ? `ZRF-${Math.floor(Math.random() * 89999 + 10000)}` : ''
  );
  const [hallmarkCode, setHallmarkCode] = useState<string>(
    itemNature === 'melted_gold' ? 'T750-ZRF94' : ''
  );
  const [certifiedFineness, setCertifiedFineness] = useState<string>(
    itemNature === 'melted_gold' ? '750.4' : ''
  );
  const [assayMethod, setAssayMethod] = useState<'both' | 'cupellation_fire_assay' | 'xrf_spectrometry'>('both');
  const [inspectorName, setInspectorName] = useState<string>('مهندس محمدرضا توکلی');

  // ۴. Laser & QC (همه فیلدها اختیاری است)
  const [laserEngravingText, setLaserEngravingText] = useState<string>('');
  const [laserPositionFa, setLaserPositionFa] = useState<string>(
    'جداره داخلی لنگه با پرتو لیزر فایبر'
  );
  const [qcInspectorName, setQcInspectorName] = useState<string>('واحد کنترل کیفیت دیدار');
  const [qcScore, setQcScore] = useState<string>('99.2');
  const [surfaceFinishGradeFa, setSurfaceFinishGradeFa] = useState<string>(
    'سوپرپولیش آینه‌ای ممتاز (Mirror A+)'
  );
  const [porosityCheckFa, setPorosityCheckFa] = useState<string>(
    'فاقد هرگونه حباب یا تخلخل ریخته‌گری (Zero Defect)'
  );
  const [qcNotes, setQcNotes] = useState<string>('آزمون عیارسنجی و استحکام قفل با موفقیت انجام شد.');

  // ۴. شواهد ماکرو - پشتیبانی از چندین عکس
  const [macroPhotos, setMacroPhotos] = useState<MacroPhotoItem[]>([
    {
      id: 'mac-1',
      url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=600&q=80',
      titleFa: 'ماکرو انگ و نشان استاندارد',
      captureArea: 'انگ ری‌گیری و نشان عیار',
      magnification: '50X Micro'
    },
    {
      id: 'mac-2',
      url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
      titleFa: 'بافت سطحی و خطوط پرداخت',
      captureArea: 'جداره داخلی و خط جوش',
      magnification: '30X Macro'
    }
  ]);

  // فیلدهای ورودی عکس ماکرو جدید
  const [newMacroUrl, setNewMacroUrl] = useState<string>('');
  const [newMacroTitle, setNewMacroTitle] = useState<string>('');
  const [newMacroArea, setNewMacroArea] = useState<string>('انگ ری‌گیری و نشان عیار');
  const [newMacroMag, setNewMacroMag] = useState<string>('40X Optical');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      if (prod.variants.length > 0) {
        setSelectedVariantId(prod.variants[0].id);
        setActualScaleWeightGrams(prod.variants[0].targetWeightGrams);
      }
      const isAbshodeh =
        prod.category === 'coin_medallion' ||
        prod.titleFa?.includes('آبشده') ||
        prod.titleFa?.includes('شمش');
      if (isAbshodeh) {
        setItemNature('melted_gold');
        if (!hallmarkCode) setHallmarkCode('T750-ZRF94');
        if (!certifiedFineness) setCertifiedFineness('750.4');
        if (!assayLabName) setAssayLabName('آزمایشگاه ری‌گیری رسمی زرفام تهران');
      }
    }
  };

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    const v = selectedProduct?.variants.find((item) => item.id === variantId);
    if (v) {
      setActualScaleWeightGrams(v.targetWeightGrams);
    }
  };

  const handleAddMacroPhoto = () => {
    if (!newMacroUrl.trim()) return;
    const newPhoto: MacroPhotoItem = {
      id: `mac-${Date.now()}`,
      url: newMacroUrl.trim(),
      titleFa: newMacroTitle.trim() || `شاهد ماکرو ${macroPhotos.length + 1}`,
      captureArea: newMacroArea || 'انگ ری‌گیری و بافت قطعه',
      magnification: newMacroMag || '40X'
    };
    setMacroPhotos([...macroPhotos, newPhoto]);
    setNewMacroUrl('');
    setNewMacroTitle('');
  };

  const handleRemoveMacroPhoto = (id: string) => {
    setMacroPhotos(macroPhotos.filter((p) => p.id !== id));
  };

  const handleQuickAddSampleMacro = (type: 'assay' | 'weld' | 'surface' | 'ingot') => {
    if (type === 'assay') {
      setMacroPhotos([
        ...macroPhotos,
        {
          id: `mac-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=600&q=80',
          titleFa: 'انگ رسمی ری‌گیری ۵۰X',
          captureArea: 'محل کوبش انگ ری‌گیری',
          magnification: '50X Micro'
        }
      ]);
    } else if (type === 'weld') {
      setMacroPhotos([
        ...macroPhotos,
        {
          id: `mac-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
          titleFa: 'بازرسی جوش قفل و اتصالات',
          captureArea: 'مفصل و فنر قفل',
          magnification: '30X Macro'
        }
      ]);
    } else if (type === 'surface') {
      setMacroPhotos([
        ...macroPhotos,
        {
          id: `mac-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
          titleFa: 'بافت آینه‌ای و پرداخت سطحی',
          captureArea: 'سطح بیرونی و اسلیمی',
          magnification: '40X Optical'
        }
      ]);
    } else {
      setMacroPhotos([
        ...macroPhotos,
        {
          id: `mac-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=600&q=80',
          titleFa: 'سطح مقطع و بافت شمش آبشده',
          captureArea: 'محل نمونه‌برداری قیچی ری‌گیری',
          magnification: '20X Macro'
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError('لطفاً یک مدل کالا از کاتالوگ انتخاب نمایید.');
      return;
    }
    if (!actualScaleWeightGrams || actualScaleWeightGrams <= 0) {
      setError('وزن دقیق سنجش‌شده روی ترازو باید بزرگ‌تر از صفر باشد.');
      return;
    }

    // شرط اعتبارسنجی کاربر:
    // صرفاً برای آبشده بخش ۳ (ری‌گیری و انگ رسمی) اجباری است
    // برای مصنوعات ساخته‌شده هیچ‌کدام از فیلدهای ری‌گیری اجباری نیست
    if (itemNature === 'melted_gold') {
      if (!assayLabName.trim()) {
        setError('ثبت نام آزمایشگاه ری‌گیری برای طلای آبشده الزامی است.');
        return;
      }
      if (!assayPacketCode.trim()) {
        setError('ثبت شماره پاکت ری‌گیری برای طلای آبشده الزامی است.');
        return;
      }
      if (!hallmarkCode.trim()) {
        setError('ثبت کد انگ رسمی اتحادیه برای طلای آبشده الزامی است.');
        return;
      }
      const finenessNum = parseFloat(certifiedFineness);
      if (isNaN(finenessNum) || finenessNum < 700 || finenessNum > 999.9) {
        setError('عیار قطعی طلای آبشده باید عددی معتبر بین ۷۰۰ تا ۹۹۹.۹ باشد.');
        return;
      }
    }

    setLoading(true);

    const vMinW = selectedVariant?.minWeightGrams !== undefined
      ? Number(selectedVariant.minWeightGrams)
      : selectedVariant
      ? Number(((selectedVariant.targetWeightGrams || 10) - (selectedVariant.toleranceGrams || 0.25)).toFixed(2))
      : 0;

    const vMaxW = selectedVariant?.maxWeightGrams !== undefined
      ? Number(selectedVariant.maxWeightGrams)
      : selectedVariant
      ? Number(((selectedVariant.targetWeightGrams || 10) + (selectedVariant.toleranceGrams || 0.25)).toFixed(2))
      : 0;

    const withinRange = actualScaleWeightGrams >= vMinW && actualScaleWeightGrams <= vMaxW;

    // مقادیر پیش‌فرض نرم در صورت خالی بودن در مصنوعات
    const resolvedAssayLab = assayLabName.trim() ||
      (itemNature === 'melted_gold' ? 'ری‌گیری رسمی شمش' : 'آزمایشگاه عیار استاندارد سازنده');
    const resolvedPacketCode = assayPacketCode.trim() || '—';
    const resolvedHallmark = hallmarkCode.trim() || (itemNature === 'melted_gold' ? 'T750-INGOT' : 'T750-STD');
    const resolvedFineness = certifiedFineness ? parseFloat(certifiedFineness) : 750.0;

    try {
      await onSubmit({
        itemNature,
        itemNatureFa: itemNature === 'melted_gold' ? 'طلای آبشده و شمش عیاردار' : 'مصنوعات ساخته‌شده طلا',
        productSkuId: selectedProduct.id,
        productSkuCode: selectedProduct.skuCode,
        productTitleFa: selectedProduct.titleFa,
        variantId: selectedVariantId || 'var-default',
        sizeLabelFa: selectedVariant?.sizeLabelFa || 'استاندارد',
        colorFa: selectedVariant?.colorFa || 'طلای زرد ۱۸ عیار',
        carat: selectedProduct.carat || '18k_750',
        caratFa: selectedProduct.caratFa || '۱۸ عیار (۷۵۰)',
        skuWeightRangeFa: selectedVariant ? `${vMinW.toFixed(2)} الی ${vMaxW.toFixed(2)} گرم` : undefined,
        skuMinWeightGrams: vMinW,
        skuMaxWeightGrams: vMaxW,
        isWithinSkuRange: withinRange,
        nominalWeightGrams: selectedVariant ? selectedVariant.targetWeightGrams : selectedProduct.baseWeightGrams,
        actualScaleWeightGrams: Number(actualScaleWeightGrams),
        scaleModel,
        assayLabName: resolvedAssayLab,
        assayUnionPermitNo: assayUnionPermitNo.trim() || 'استاندارد ملی ISIRI',
        assayPacketCode: resolvedPacketCode,
        hallmarkCode: resolvedHallmark,
        certifiedFineness: resolvedFineness,
        assayMethod,
        assayMethodFa:
          assayMethod === 'both'
            ? 'کوپلاسیون رسمی (Fire Assay) و طیف‌سنجی XRF'
            : assayMethod === 'cupellation_fire_assay'
            ? 'کوپلاسیون استاندارد ملی'
            : 'طیف‌سنجی پرتو ایکس XRF',
        inspectorName: inspectorName.trim() || 'کارشناس عیارسنجی دیدار',
        laserEngravingText:
          laserEngravingText.trim() ||
          `DIDAR 750 ${resolvedHallmark} SN-${selectedProduct.skuCode.replace(/\D/g, '')}-001`,
        laserPositionFa: laserPositionFa.trim() || 'جداره داخلی لنگه با پرتو لیزر فایبر',
        qcInspectorName: qcInspectorName.trim() || 'واحد کنترل کیفیت دیدار',
        qcScore: qcScore ? parseFloat(qcScore) : 99.0,
        surfaceFinishGradeFa: surfaceFinishGradeFa.trim() || 'سوپرپولیش آینه‌ای ممتاز (Mirror A+)',
        porosityCheckFa: porosityCheckFa.trim() || 'فاقد هرگونه حباب یا تخلخل ریخته‌گری (Zero Defect)',
        qcNotes: qcNotes.trim() || 'کنترل کیفی و ابعادی انجام شد.',
        macroPhotos,
        macroPhotoUrl: macroPhotos[0]?.url || ''
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در صدور گذرنامه قطعه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-3xl bg-[#161622] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#151520] border-b border-[#28283C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#E5C365]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">صدور گذرنامه دیجیتال قطعه طلا (Mint Passport)</h3>
              <p className="text-xs text-[#A0A0B5]">
                پلاک‌گذاری قطعه فیزیکی، ثبت وزن دقیق ترازو و زنجیره اصالت دیدار
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white hover:bg-[#222234] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[78vh] overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-[#2A1517] border border-[#E5484D]/40 rounded-xl text-xs text-[#FF8B8B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF6B6B]" />
              <span>{error}</span>
            </div>
          )}

          {/* انتخاب ماهیت قطعه (مصنوعات ساخته‌شده vs طلای آبشده) */}
          <div className="p-4 bg-[#191926] rounded-xl border border-[#28283C] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#C8A951]" />
                ماهیت و نوع قطعه جهت تعیین الزامات اعتبارسنجی:
              </span>
              <span className="text-[11px] font-mono font-semibold text-[#E5C365]">
                {itemNature === 'melted_gold' ? 'حالت: طلای آبشده' : 'حالت: مصنوعات طلا'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setItemNature('manufactured_jewelry')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  itemNature === 'manufactured_jewelry'
                    ? 'bg-[#161622] border-[#C8A951] shadow-sm ring-1 ring-[#C8A951]/40'
                    : 'bg-[#191926] border-[#28283C] hover:bg-[#222234] text-[#A0A0B5]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    itemNature === 'manufactured_jewelry'
                      ? 'border-[#C8A951] bg-[#C8A951] text-[#141416]'
                      : 'border-[#3D3D54]'
                  }`}
                >
                  {itemNature === 'manufactured_jewelry' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    مصنوعات ساخته‌شده طلا (النگو، انگشتر، دستبند و...)
                  </div>
                  <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                    بخش ۳ (ری‌گیری و انگ) و بخش ۴ (QC) اختیاری است و الزامی ندارد.
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setItemNature('melted_gold')}
                className={`p-3 rounded-xl border text-right transition-all flex items-start gap-2.5 ${
                  itemNature === 'melted_gold'
                    ? 'bg-[#161622] border-[#C8A951] shadow-sm ring-1 ring-[#C8A951]/40'
                    : 'bg-[#191926] border-[#28283C] hover:bg-[#222234] text-[#A0A0B5]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                    itemNature === 'melted_gold'
                      ? 'border-[#C8A951] bg-[#C8A951] text-[#141416]'
                      : 'border-[#3D3D54]'
                  }`}
                >
                  {itemNature === 'melted_gold' && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#141416]" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>طلای آبشده و شمش کارگاهی</span>
                    <span className="text-[10px] bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30 px-1.5 py-0.2 rounded font-mono font-bold">
                      الزام ری‌گیری
                    </span>
                  </div>
                  <div className="text-[11px] text-[#A0A0B5] mt-0.5">
                    بخش ۳ (مشخصات ری‌گیری، پاکت، انگ و عیار) کاملاً اجباری می‌شود.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ۱. کاتالوگ و مدل مرجع */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-[#28283C] pb-2">
              <FileText className="w-4 h-4 text-[#C8A951]" />
              ۱. انتخاب مدل کالا از کاتالوگ (K05)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  مدل پایه کاتالوگ <span className="text-[#FF6B6B]">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.skuCode} - {p.titleFa}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  تنوع / سایز ساخته‌شده <span className="text-[#FF6B6B]">*</span>
                </label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => handleVariantChange(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                >
                  {selectedProduct?.variants.map((v) => {
                    const minW =
                      v.minWeightGrams !== undefined
                        ? v.minWeightGrams
                        : Number(((v.targetWeightGrams || 10) - (v.toleranceGrams || 0.25)).toFixed(2));
                    const maxW =
                      v.maxWeightGrams !== undefined
                        ? v.maxWeightGrams
                        : Number(((v.targetWeightGrams || 10) + (v.toleranceGrams || 0.25)).toFixed(2));
                    return (
                      <option key={v.id} value={v.id}>
                        {v.sizeLabelFa} - {v.colorFa} (رنج وزنی کاتالوگ: {minW.toFixed(2)} الی {maxW.toFixed(2)} گرم)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* ۲. وزن دقیق و ترازوی کالیبره */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-[#28283C] pb-2">
              <Scale className="w-4 h-4 text-blue-400" />
              ۲. وزن‌سنجی فیزیکی با ترازوی دقیق تحلیلی
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  وزن واقعی قطعه روی ترازو (دقت ۰.۰۰۱ گرم) <span className="text-[#FF6B6B]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={actualScaleWeightGrams}
                    onChange={(e) => setActualScaleWeightGrams(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full text-sm font-mono font-bold px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                  />
                  <span className="absolute left-3 top-2 text-xs text-[#828299]">گرم</span>
                </div>
                {selectedVariant && (() => {
                  const minW =
                    selectedVariant.minWeightGrams !== undefined
                      ? selectedVariant.minWeightGrams
                      : Number(((selectedVariant.targetWeightGrams || 10) - (selectedVariant.toleranceGrams || 0.25)).toFixed(2));
                  const maxW =
                    selectedVariant.maxWeightGrams !== undefined
                      ? selectedVariant.maxWeightGrams
                      : Number(((selectedVariant.targetWeightGrams || 10) + (selectedVariant.toleranceGrams || 0.25)).toFixed(2));
                  const inRange = (actualScaleWeightGrams || 0) >= minW && (actualScaleWeightGrams || 0) <= maxW;
                  const delta = Number(
                    ((actualScaleWeightGrams || 0) - (selectedVariant.targetWeightGrams || 0)).toFixed(3)
                  );
                  return (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#191926] border border-[#28283C] text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#A0A0B5]">رنج استاندارد این SKU در کاتالوگ:</span>
                        <span className="font-mono font-bold text-[#E5C365]">
                          {minW.toFixed(2)} الی {maxW.toFixed(2)} گرم
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[#828299]">
                        <span>میانگین اسمی رنج:</span>
                        <span className="font-mono">
                          {selectedVariant.targetWeightGrams}g (دلتای توزین: {delta >= 0 ? `+${delta}` : delta}g)
                        </span>
                      </div>
                      <div className="pt-1 border-t border-[#28283C]">
                        {actualScaleWeightGrams > 0 &&
                          (inRange ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#3DD68C]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#3DD68C]" />
                              وزن قطعه فیزیکی درون رنج وزنی مجاز SKU است.
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#F5A623]">
                              <AlertTriangle className="w-3.5 h-3.5 text-[#F5A623]" />
                              وزن قطعه فیزیکی خارج از رنج کاتالوگ ({minW.toFixed(2)} تا {maxW.toFixed(2)} گرم) است.
                            </span>
                          ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  مشخصات ترازوی تحلیلی و کالیبراسیون
                </label>
                <input
                  type="text"
                  value={scaleModel}
                  onChange={(e) => setScaleModel(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          {/* ۳. مشخصات ری‌گیری و انگ رسمی (صرفاً برای آبشده اجباری، برای سایر اختیاری) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-[#28283C] pb-2 gap-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ۳. مشخصات ری‌گیری و انگ رسمی (Assay & Hallmark)
              </h4>
              {itemNature === 'melted_gold' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30">
                  <AlertTriangle className="w-3 h-3" />
                  اجباری برای طلای آبشده
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  اختیاری برای مصنوعات ساخته‌شده
                </span>
              )}
            </div>

            {/* راهنمای شرطی */}
            {itemNature === 'melted_gold' ? (
              <div className="p-3 bg-[#C8A951]/10 border border-[#C8A951]/30 rounded-xl text-xs text-[#E5C365] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#C8A951] shrink-0 mt-0.5" />
                <span>
                  <strong>الزام قانونی ری‌گیری آبشده:</strong> با توجه به انتخاب طلای آبشده، ثبت نام آزمایشگاه ری‌گیری، شماره پاکت، کد انگ رسمی و عیار قطعی الزامی است.
                </span>
              </div>
            ) : (
              <div className="p-2.5 bg-[#191926] border border-[#28283C] rounded-xl text-xs text-[#A0A0B5] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#828299] shrink-0 mt-0.5" />
                <span>
                  برای مصنوعات کار ساخته (النگو، انگشتر، زنجیر و...) نیازی به اجباری بودن اطلاعات ری‌گیری نیست و فیلدها اختیاری می‌باشند.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  آزمایشگاه ری‌گیری{' '}
                  {itemNature === 'melted_gold' ? (
                    <span className="text-[#FF6B6B] font-bold">* الزامی</span>
                  ) : (
                    <span className="text-[#828299]">(اختیاری)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={assayLabName}
                  onChange={(e) => setAssayLabName(e.target.value)}
                  placeholder={itemNature === 'melted_gold' ? 'مثال: آزمایشگاه ری‌گیری زرفام تهران' : 'اختیاری - عیار استاندارد سازنده'}
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  کد پاکت ری‌گیری{' '}
                  {itemNature === 'melted_gold' ? (
                    <span className="text-[#FF6B6B] font-bold">* الزامی</span>
                  ) : (
                    <span className="text-[#828299]">(اختیاری)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={assayPacketCode}
                  onChange={(e) => setAssayPacketCode(e.target.value)}
                  placeholder={itemNature === 'melted_gold' ? 'مثال: ZRF-84210' : 'اختیاری'}
                  className="w-full text-xs font-mono px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  کد انگ رسمی (Hallmark){' '}
                  {itemNature === 'melted_gold' ? (
                    <span className="text-[#FF6B6B] font-bold">* الزامی</span>
                  ) : (
                    <span className="text-[#828299]">(اختیاری)</span>
                  )}
                </label>
                <input
                  type="text"
                  value={hallmarkCode}
                  onChange={(e) => setHallmarkCode(e.target.value)}
                  placeholder={itemNature === 'melted_gold' ? 'مثال: T750-ZRF94' : 'اختیاری (مثال: T750)'}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  عیار قطعی سنجش‌شده (Fineness){' '}
                  {itemNature === 'melted_gold' ? (
                    <span className="text-[#FF6B6B] font-bold">* الزامی</span>
                  ) : (
                    <span className="text-[#828299]">(اختیاری - پیش‌فرض ۷۵۰)</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={certifiedFineness}
                    onChange={(e) => setCertifiedFineness(e.target.value)}
                    placeholder="750.4"
                    className="w-full text-sm font-mono font-bold px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                  />
                  <span className="absolute left-3 top-2 text-xs text-[#828299]">/ ۱۰۰۰</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  روش آزمایش عیارسنجی <span className="text-[#828299]">(اختیاری)</span>
                </label>
                <select
                  value={assayMethod}
                  onChange={(e) => setAssayMethod(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                >
                  <option value="both">کوپلاسیون رسمی + آنالیز XRF</option>
                  <option value="cupellation_fire_assay">کوپلاسیون خالص (Fire Assay)</option>
                  <option value="xrf_spectrometry">طیف‌سنجی اشعه ایکس (XRF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  کارشناس ری‌گیر / ثبت‌کننده <span className="text-[#828299]">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  placeholder="اختیاری"
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </div>
          </div>

          {/* ۴. بازرسی کنترل کیفیت و ثبت شواهد (همه فیلدها اختیاری است) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#28283C] pb-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-purple-400" />
                ۴. بازرسی کنترل کیفیت و ثبت شواهد تصویری (QC & Macro Evidence)
              </h4>
              <span className="text-[11px] font-medium text-purple-400 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                همه فیلدها اختیاری است
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  بازرس QC <span className="text-[#828299]">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={qcInspectorName}
                  onChange={(e) => setQcInspectorName(e.target.value)}
                  placeholder="اختیاری"
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  امتیاز کیفی (از ۱۰۰) <span className="text-[#828299]">(اختیاری)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  value={qcScore}
                  onChange={(e) => setQcScore(e.target.value)}
                  placeholder="99.2"
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                  کیفیت پرداخت و سطح <span className="text-[#828299]">(اختیاری)</span>
                </label>
                <input
                  type="text"
                  value={surfaceFinishGradeFa}
                  onChange={(e) => setSurfaceFinishGradeFa(e.target.value)}
                  placeholder="سوپرپولیش آینه‌ای ممتاز"
                  className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EDEDED] mb-1">
                توضیحات و یادداشت فنی QC <span className="text-[#828299]">(اختیاری)</span>
              </label>
              <textarea
                rows={2}
                value={qcNotes}
                onChange={(e) => setQcNotes(e.target.value)}
                placeholder="یادداشت‌های بازرس کنترل کیفی (اختیاری)"
                className="w-full text-xs px-3 py-2 bg-[#191926] border border-[#28283C] rounded-lg text-white"
              />
            </div>

            {/* گالری تصاویر ماکرو - چند عکس */}
            <div className="p-4 bg-[#191926] rounded-xl border border-[#28283C] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">
                    آلبوم تصاویر ماکرو از انگ، بافت و سطوح ({macroPhotos.length} عکس ثبت‌شده)
                  </span>
                </div>
                <span className="text-[11px] text-[#A0A0B5] font-medium">
                  ثبت چند عکس با بزرگ‌نمایی‌های مختلف مجاز است
                </span>
              </div>

              {/* لیست عکس‌های فعلی */}
              {macroPhotos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {macroPhotos.map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      className="p-2.5 bg-[#161622] rounded-lg border border-[#28283C] flex items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={photo.url}
                          alt={photo.titleFa}
                          className="w-12 h-12 rounded-lg object-cover border border-[#28283C] shrink-0 bg-black"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">
                            {photo.titleFa}
                          </div>
                          <div className="text-[11px] text-[#A0A0B5] truncate">
                            {photo.captureArea}
                          </div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-mono font-bold">
                            {photo.magnification}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveMacroPhoto(photo.id)}
                        className="p-1.5 text-[#828299] hover:text-[#FF6B6B] hover:bg-[#2A1517] rounded-lg transition-colors shrink-0"
                        title="حذف تصویر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-[#828299] text-xs bg-[#161622] rounded-lg border border-dashed border-[#28283C]">
                  هنوز هیچ تصویر ماکرویی اضافه نشده است (ثبت تصویر اختیاری است).
                </div>
              )}

              {/* فرم افزودن عکس ماکرو جدید */}
              <div className="pt-2 border-t border-[#28283C] space-y-2">
                <span className="text-[11px] font-bold text-[#EDEDED] block">
                  افزودن عکس ماکرو جدید:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="url"
                      value={newMacroUrl}
                      onChange={(e) => setNewMacroUrl(e.target.value)}
                      placeholder="آدرس تصویر (URL: https://...)"
                      className="w-full text-xs font-mono px-3 py-1.5 bg-[#161622] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newMacroTitle}
                      onChange={(e) => setNewMacroTitle(e.target.value)}
                      placeholder="عنوان (مثال: انگ ری‌گیری)"
                      className="w-full text-xs px-3 py-1.5 bg-[#161622] border border-[#28283C] rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#C8A951]"
                    />
                  </div>
                  <div>
                    <select
                      value={newMacroMag}
                      onChange={(e) => setNewMacroMag(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 bg-[#161622] border border-[#28283C] rounded-lg text-white focus:outline-none"
                    >
                      <option value="50X Micro">بزرگ‌نمایی 50X میکروسکوپی</option>
                      <option value="40X Optical">بزرگ‌نمایی 40X اپتیکال</option>
                      <option value="30X Macro">بزرگ‌نمایی 30X ماکرو</option>
                      <option value="20X Inspection">بزرگ‌نمایی 20X بازرسی</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* نمونه‌های آماده برای تست سریع کاربر */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#A0A0B5]">
                    <span className="flex items-center gap-1 text-[#E5C365] font-semibold">
                      <Sparkles className="w-3 h-3 text-[#C8A951]" />
                      درج نمونه سریع:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuickAddSampleMacro('assay')}
                      className="px-2 py-0.5 bg-[#161622] hover:bg-[#222234] border border-[#28283C] rounded text-[#EDEDED] transition-colors"
                    >
                      + انگ ری‌گیری (50X)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddSampleMacro('weld')}
                      className="px-2 py-0.5 bg-[#161622] hover:bg-[#222234] border border-[#28283C] rounded text-[#EDEDED] transition-colors"
                    >
                      + اتصال قفل (30X)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddSampleMacro('surface')}
                      className="px-2 py-0.5 bg-[#161622] hover:bg-[#222234] border border-[#28283C] rounded text-[#EDEDED] transition-colors"
                    >
                      + پرداخت سطحی (40X)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAddSampleMacro('ingot')}
                      className="px-2 py-0.5 bg-[#161622] hover:bg-[#222234] border border-[#28283C] rounded text-[#EDEDED] transition-colors"
                    >
                      + شمش آبشده (20X)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMacroPhoto}
                    disabled={!newMacroUrl.trim()}
                    className="px-3 py-1 text-xs font-semibold bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1 font-bold shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    افزودن تصویر به آلبوم
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#28283C]">
            <div className="text-[11px] text-[#A0A0B5]">
              {itemNature === 'melted_gold' ? (
                <span className="text-[#E5C365] font-semibold">
                  در حالت طلای آبشده، درج ری‌گیری و کد انگ الزامی است.
                </span>
              ) : (
                <span className="text-[#3DD68C] font-semibold">
                  در حالت مصنوعات طلا، کلیه فیلدهای ری‌گیری و QC اختیاری است.
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#EDEDED] bg-[#191926] border border-[#28283C] rounded-lg hover:bg-[#222234] transition-colors"
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 text-xs font-bold text-[#141416] bg-[#C8A951] hover:bg-[#D9B961] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <span>در حال صدور...</span>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    صدور گذرنامه و ثبت در خزانه
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
