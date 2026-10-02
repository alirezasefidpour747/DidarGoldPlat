/**
 * Didar B2B - P01 Product Core & Taxonomy Hub
 * Production UI for Retailer Safe Catalog, Supplier Product/Offer Entry,
 * and Product Ops Review/Approval/Publishing Workflow.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api.js';
import {
  Package,
  Layers,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Eye,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Tag,
  Building,
  RefreshCw,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Scale
} from 'lucide-react';

export const P01ProductHub: React.FC = () => {
  const [activeView, setActiveView] = useState<'retailer' | 'supplier' | 'ops' | 'taxonomy'>('retailer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Taxonomy State
  const [taxonomyTree, setTaxonomyTree] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('');

  // Retailer Catalog State
  const [retailerProducts, setRetailerProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);

  // Supplier State
  const [supplierProducts, setSupplierProducts] = useState<any[]>([]);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentProductForOffers, setCurrentProductForOffers] = useState<any | null>(null);
  const [productOffers, setProductOffers] = useState<any[]>([]);

  // Product Ops State
  const [opsQueue, setOpsQueue] = useState<any[]>([]);
  const [opsFilter, setOpsFilter] = useState<string>('SUBMITTED');
  const [selectedOpsDetail, setSelectedOpsDetail] = useState<any | null>(null);
  const [reviewNoteModal, setReviewNoteModal] = useState<{ action: 'REJECT' | 'REQUEST_CHANGES'; productId: string } | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Product Draft Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSubcat, setNewProdSubcat] = useState('');
  const [newProdCode, setNewProdCode] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdTechDesc, setNewProdTechDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdKarat, setNewProdKarat] = useState(18);

  // Offer Form State
  const [offerWeightType, setOfferWeightType] = useState<'EXACT' | 'RANGE'>('EXACT');
  const [offerExactWeight, setOfferExactWeight] = useState<number | ''>(4.5);
  const [offerWeightMin, setOfferWeightMin] = useState<number | ''>(3.0);
  const [offerWeightMax, setOfferWeightMax] = useState<number | ''>(6.0);
  const [offerFeeType, setOfferFeeType] = useState<'PERCENT' | 'RANGE_PERCENT' | 'FIXED'>('PERCENT');
  const [offerFeeValue, setOfferFeeValue] = useState<number | ''>(10.0);
  const [offerFeeMin, setOfferFeeMin] = useState<number | ''>(9.0);
  const [offerFeeMax, setOfferFeeMax] = useState<number | ''>(13.0);
  const [offerAvailability, setOfferAvailability] = useState<'AVAILABLE' | 'MADE_TO_ORDER'>('AVAILABLE');
  const [offerLeadTime, setOfferLeadTime] = useState<number>(0);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Load Initial Taxonomy & Catalog
  const loadTaxonomy = useCallback(async () => {
    try {
      const [tree, subcats] = await Promise.all([
        api.getTaxonomyTree(),
        api.getTaxonomySubcategories(),
      ]);
      setTaxonomyTree(tree || []);
      setSubcategories(subcats || []);
      if (subcats && subcats.length > 0 && !newProdSubcat) {
        setNewProdSubcat(subcats[0].id);
      }
    } catch (e: any) {
      console.warn('Error loading taxonomy:', e);
    }
  }, [newProdSubcat]);

  const loadRetailerCatalog = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getRetailerCatalog({
        subcategoryId: selectedSubcatId || undefined,
        search: searchQuery || undefined,
      });
      setRetailerProducts(data || []);
    } catch (e: any) {
      setError(e?.message || 'خطا در بارگذاری کاتالوگ');
    } finally {
      setLoading(false);
    }
  }, [selectedSubcatId, searchQuery]);

  const loadSupplierProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getSupplierProducts();
      setSupplierProducts(data || []);
    } catch (e: any) {
      console.warn('Supplier product load:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOpsQueue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProductOpsQueue(opsFilter);
      setOpsQueue(data || []);
    } catch (e: any) {
      console.warn('Ops queue load:', e);
    } finally {
      setLoading(false);
    }
  }, [opsFilter]);

  useEffect(() => {
    loadTaxonomy();
  }, [loadTaxonomy]);

  useEffect(() => {
    if (activeView === 'retailer') loadRetailerCatalog();
    if (activeView === 'supplier') loadSupplierProducts();
    if (activeView === 'ops') loadOpsQueue();
  }, [activeView, loadRetailerCatalog, loadSupplierProducts, loadOpsQueue]);

  // Product Creation Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdSubcat) {
      showNotification('error', 'لطفاً نام محصول و زیرشاخه را تکمیل کنید.');
      return;
    }
    try {
      setLoading(true);
      await api.createSupplierProduct({
        name: newProdName,
        subcategoryId: newProdSubcat,
        productCode: newProdCode || undefined,
        description: newProdDesc,
        technicalDescription: newProdTechDesc,
        primaryImage: newProdImage || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop',
        karat: Number(newProdKarat),
      });
      showNotification('success', 'پیش‌نویس محصول با موفقیت ایجاد شد.');
      setShowNewProductModal(false);
      setNewProdName('');
      setNewProdCode('');
      setNewProdDesc('');
      await loadSupplierProducts();
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در ثبت محصول');
    } finally {
      setLoading(false);
    }
  };

  // Open Offers Modal
  const openOffersModal = async (product: any) => {
    setCurrentProductForOffers(product);
    try {
      const offers = await api.getSupplierOffers(product.id);
      setProductOffers(offers || []);
      setShowOfferModal(true);
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در دریافت آفرها');
    }
  };

  // Create Offer Handler
  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProductForOffers) return;

    if (offerFeeType === 'FIXED') {
      showNotification('error', 'کارمزد ثابت (FIXED) تا تصمیم مالک پروژه درباره واحد و مبنا غیرفعال است.');
      return;
    }

    try {
      setLoading(true);
      await api.createSupplierOffer(currentProductForOffers.id, {
        weightType: offerWeightType,
        exactWeight: offerWeightType === 'EXACT' ? Number(offerExactWeight) : undefined,
        weightMin: offerWeightType === 'RANGE' ? Number(offerWeightMin) : undefined,
        weightMax: offerWeightType === 'RANGE' ? Number(offerWeightMax) : undefined,
        makingFeeType: offerFeeType,
        makingFeeValue: offerFeeType === 'PERCENT' ? Number(offerFeeValue) : undefined,
        makingFeeMin: offerFeeType === 'RANGE_PERCENT' ? Number(offerFeeMin) : undefined,
        makingFeeMax: offerFeeType === 'RANGE_PERCENT' ? Number(offerFeeMax) : undefined,
        availabilityType: offerAvailability,
        leadTimeDays: Number(offerLeadTime),
      });
      showNotification('success', 'پیشنهاد قیمت (Offer) با موفقیت ثبت شد.');
      const updatedOffers = await api.getSupplierOffers(currentProductForOffers.id);
      setProductOffers(updatedOffers || []);
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در ثبت آفر');
    } finally {
      setLoading(false);
    }
  };

  // Submit Product for Review Handler
  const handleSubmitForReview = async (productId: string) => {
    try {
      setLoading(true);
      await api.submitProductForReview(productId);
      showNotification('success', 'محصول با موفقیت به صف بازبینی عملیات محصول دیدار ارسال شد.');
      await loadSupplierProducts();
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در ارسال برای بازبینی');
    } finally {
      setLoading(false);
    }
  };

  // Product Ops Actions
  const handleOpsAction = async (action: 'APPROVE' | 'PUBLISH' | 'UNPUBLISH', productId: string) => {
    try {
      setLoading(true);
      if (action === 'APPROVE') {
        await api.approveProduct(productId);
        showNotification('success', 'محصول با موفقیت تایید شد.');
      } else if (action === 'PUBLISH') {
        await api.publishProduct(productId);
        showNotification('success', 'محصول با موفقیت در کاتالوگ خرده‌فروشی منتشر شد.');
      } else if (action === 'UNPUBLISH') {
        await api.unpublishProduct(productId);
        showNotification('success', 'محصول از انتشار خارج و غیرفعال شد.');
      }
      setSelectedOpsDetail(null);
      await loadOpsQueue();
    } catch (err: any) {
      showNotification('error', err?.message || 'خطای عملیات');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewNoteSubmit = async () => {
    if (!reviewNoteModal || !reviewNote.trim()) {
      showNotification('error', 'درج توضیحات الزامی است.');
      return;
    }
    try {
      setLoading(true);
      if (reviewNoteModal.action === 'REJECT') {
        await api.rejectProduct(reviewNoteModal.productId, reviewNote.trim());
        showNotification('success', 'محصول رد شد.');
      } else {
        await api.requestProductChanges(reviewNoteModal.productId, reviewNote.trim());
        showNotification('success', 'درخواست اصلاحات به تامین‌کننده ارسال شد.');
      }
      setReviewNoteModal(null);
      setReviewNote('');
      setSelectedOpsDetail(null);
      await loadOpsQueue();
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در ثبت تصمیم');
    } finally {
      setLoading(false);
    }
  };

  const openOpsDetail = async (productId: string) => {
    try {
      setLoading(true);
      const detail = await api.getProductOpsDetail(productId);
      setSelectedOpsDetail(detail);
    } catch (err: any) {
      showNotification('error', err?.message || 'خطا در دریافت جزییات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'success'
              ? 'bg-[#18231c] border-[#22c55e]/40 text-[#4ade80]'
              : 'bg-[#2b181a] border-[#ef4444]/40 text-[#f87171]'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[#18181F] via-[#14141A] to-[#101014] border border-[#C8A951]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/30">
                پکیج P01 فعال
              </span>
              <span className="text-xs text-[#9E9EA8]">هسته کاتالوگ طلا، طبقه‌بندی ۳ سطحی و جریان تایید آفرها</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#C8A951]" />
              مرکز مدیریت کاتالوگ و محصولات طلا (Didar Product Core)
            </h1>
          </div>

          {/* Role / Workspace View Selector */}
          <div className="flex items-center bg-[#1D1D26] p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveView('retailer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'retailer'
                  ? 'bg-gradient-to-r from-[#C8A951] to-[#8C6D23] text-black font-bold shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              کاتالوگ خرده‌فروشی
            </button>
            <button
              onClick={() => setActiveView('supplier')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'supplier'
                  ? 'bg-gradient-to-r from-[#C8A951] to-[#8C6D23] text-black font-bold shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              کارتابل تامین‌کننده
            </button>
            <button
              onClick={() => setActiveView('ops')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'ops'
                  ? 'bg-gradient-to-r from-[#C8A951] to-[#8C6D23] text-black font-bold shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              صف بررسی دیدار (Ops)
            </button>
            <button
              onClick={() => setActiveView('taxonomy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeView === 'taxonomy'
                  ? 'bg-gradient-to-r from-[#C8A951] to-[#8C6D23] text-black font-bold shadow-md'
                  : 'text-[#9E9EA8] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              درخت طبقه‌بندی طلا
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: RETAILER CATALOG */}
      {activeView === 'retailer' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-[#15151A] p-4 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#9E9EA8] absolute right-3 top-3" />
                <input
                  type="text"
                  placeholder="جستجو بر اساس نام مدل، کد کالا یا توضیحات طلا..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1C1C24] border border-white/10 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-[#686873] focus:outline-none focus:border-[#C8A951]"
                />
              </div>
              <button
                onClick={loadRetailerCatalog}
                className="px-4 py-2 bg-[#252530] hover:bg-[#30303D] text-white text-xs font-medium rounded-xl transition-all"
              >
                جستجو
              </button>
            </div>

            {/* Subcategory Pill Filter */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
              <button
                onClick={() => setSelectedSubcatId('')}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                  selectedSubcatId === '' ? 'bg-[#C8A951] text-black font-bold' : 'bg-[#1F1F28] text-[#9E9EA8] hover:text-white'
                }`}
              >
                همه زیرشاخه‌ها
              </button>
              {subcategories.slice(0, 7).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcatId(sub.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    selectedSubcatId === sub.id ? 'bg-[#C8A951] text-black font-bold' : 'bg-[#1F1F28] text-[#9E9EA8] hover:text-white'
                  }`}
                >
                  {sub.nameFa}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Safe Projection Note */}
          <div className="bg-[#181D26] border border-[#38bdf8]/20 rounded-xl p-3.5 flex items-center justify-between text-xs text-[#bae6fd]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
              <span>
                <strong>حریم خصوصی تجاری فعال است:</strong> در نمای خرده‌فروشی، هیچ نام، شناسه یا شرایط تجاری داخلی تامین‌کنندگان نمایش داده نمی‌شود.
              </span>
            </div>
            <span className="text-[11px] text-[#7dd3fc]">نمایش تنها محصولات تاییدشده و منتشرشده</span>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="p-12 text-center text-[#9E9EA8] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C8A951]" />
              در حال بارگذاری کاتالوگ...
            </div>
          ) : retailerProducts.length === 0 ? (
            <div className="p-12 text-center bg-[#15151A] rounded-xl border border-white/5 text-[#9E9EA8]">
              محصولی با این مشخصات در کاتالوگ عمومی یافت نشد.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {retailerProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProductDetail(p)}
                  className="bg-[#15151A] border border-white/5 hover:border-[#C8A951]/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container */}
                    <div className="h-48 w-full bg-[#1C1C24] relative overflow-hidden">
                      {p.primaryImage ? (
                        <img
                          src={p.primaryImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#686873]">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-[#E5C365] border border-[#C8A951]/30">
                        {p.subcategory?.nameFa}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                        {p.availability === 'AVAILABLE' ? 'موجود در انبار' : 'سفارشی'}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-[#E5C365] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#9E9EA8] line-clamp-2 leading-relaxed">
                        {p.description || 'بدون توضیحات'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px]">
                        <div className="bg-[#1C1C24] p-2 rounded-lg">
                          <span className="text-[#686873] block mb-0.5">عیار و جنس</span>
                          <span className="font-bold text-white">{p.karat} عیار ({p.material === 'gold' ? 'طلای استاندارد' : p.material})</span>
                        </div>
                        <div className="bg-[#1C1C24] p-2 rounded-lg">
                          <span className="text-[#686873] block mb-0.5">کد اختصاصی</span>
                          <span className="font-mono text-white text-[10px]">{p.productCode}</span>
                        </div>
                      </div>

                      {/* Commercial Indicators */}
                      <div className="bg-[#1B1B22] p-2.5 rounded-xl border border-white/5 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-[#9E9EA8]">
                          <span className="flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                            بازه وزن تقریبی:
                          </span>
                          <span className="font-bold text-white">
                            {p.indicativeWeightRange
                              ? `${p.indicativeWeightRange.min.toFixed(2)} تا ${p.indicativeWeightRange.max.toFixed(2)} گرم`
                              : 'طبق سفارش'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[#9E9EA8]">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-[#C8A951]" />
                            بازه اجرت ساخت:
                          </span>
                          <span className="font-bold text-[#E5C365]">
                            {p.indicativeMakingFeeRange
                              ? `${p.indicativeMakingFeeRange.min}٪ تا ${p.indicativeMakingFeeRange.max}٪`
                              : 'بر اساس سفارش'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0">
                    <button className="w-full py-2 bg-[#20202A] hover:bg-[#C8A951] hover:text-black text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5">
                      <span>مشاهده جزییات و استعلام</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SUPPLIER WORKSPACE */}
      {activeView === 'supplier' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-[#15151A] p-4 rounded-xl border border-white/5">
            <div>
              <h2 className="text-base font-bold text-white">محصولات ثبت‌شده توسط کارگاه / تامین‌کننده</h2>
              <p className="text-xs text-[#9E9EA8] mt-0.5">
                تعریف مدل‌های اختصاصی طلا، درج مشخصات عیار و ساخت، افزودن آفر و ارسال به صف بازبینی دیدار
              </p>
            </div>
            <button
              onClick={() => setShowNewProductModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#C8A951] to-[#8C6D23] hover:brightness-110 text-black text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-[#C8A951]/20"
            >
              <Plus className="w-4 h-4" />
              ثبت مدل جدید طلا
            </button>
          </div>

          {/* Supplier Products Table */}
          <div className="bg-[#15151A] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#1C1C24] text-[#9E9EA8] border-b border-white/5">
                <tr>
                  <th className="p-3.5">کد محصول</th>
                  <th className="p-3.5">نام مدل</th>
                  <th className="p-3.5">زیرشاخه طلا</th>
                  <th className="p-3.5">عیار</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {supplierProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#9E9EA8]">
                      شما هنوز محصولی ثبت نکرده‌اید. برای شروع دکمه «ثبت مدل جدید طلا» را بزنید.
                    </td>
                  </tr>
                ) : (
                  supplierProducts.map(({ product: p, subcategoryNameFa }: any) => {
                    const statusColors: Record<string, string> = {
                      DRAFT: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                      SUBMITTED: 'bg-amber-950/60 text-amber-400 border-amber-500/30',
                      CHANGES_REQUESTED: 'bg-rose-950/60 text-rose-400 border-rose-500/30',
                      APPROVED: 'bg-blue-950/60 text-blue-400 border-blue-500/30',
                      PUBLISHED: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30',
                      REJECTED: 'bg-red-950/60 text-red-400 border-red-500/30',
                    };
                    const statusTitles: Record<string, string> = {
                      DRAFT: 'پیش‌نویس',
                      SUBMITTED: 'در حال بازبینی دیدار',
                      CHANGES_REQUESTED: 'نیازمند اصلاحات',
                      APPROVED: 'تاییدشده (آماده انتشار)',
                      PUBLISHED: 'منتشرشده در کاتالوگ',
                      REJECTED: 'ردشده',
                    };

                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3.5 font-mono text-[11px] text-[#C8A951]">{p.productCode}</td>
                        <td className="p-3.5 font-semibold">{p.name}</td>
                        <td className="p-3.5 text-[#9E9EA8]">{subcategoryNameFa || 'نامشخص'}</td>
                        <td className="p-3.5">{p.karat} عیار</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              statusColors[p.status] || 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {statusTitles[p.status] || p.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openOffersModal(p)}
                              className="px-2.5 py-1 bg-[#252530] hover:bg-[#323242] text-white rounded-lg text-[11px] flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3 text-[#C8A951]" />
                              مدیریت آفرها
                            </button>

                            {(p.status === 'DRAFT' || p.status === 'CHANGES_REQUESTED') && (
                              <button
                                onClick={() => handleSubmitForReview(p.id)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-md shadow-amber-600/20"
                              >
                                <Send className="w-3 h-3" />
                                ارسال به بررسی
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PRODUCT OPS REVIEW QUEUE */}
      {activeView === 'ops' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#15151A] p-4 rounded-xl border border-white/5">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#C8A951]" />
                صف حاکمیت و بازبینی محصولات طلا (Product Operations Queue)
              </h2>
              <p className="text-xs text-[#9E9EA8] mt-0.5">
                تطبیق عیار ۷۵۰، بررسی تصاویر، ارزیابی آفرهای کارگاه‌ها و صدور فرمان انتشار کاتالوگ
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-[#1C1C24] p-1 rounded-xl border border-white/5">
              {[
                { key: 'SUBMITTED', title: 'در انتظار بازبینی' },
                { key: 'CHANGES_REQUESTED', title: 'اصلاح خواسته‌شده' },
                { key: 'APPROVED', title: 'تاییدشده‌ها' },
                { key: 'PUBLISHED', title: 'منتشرشده‌ها' },
                { key: 'ALL', title: 'همه' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setOpsFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    opsFilter === f.key
                      ? 'bg-[#C8A951] text-black font-bold'
                      : 'text-[#9E9EA8] hover:text-white'
                  }`}
                >
                  {f.title}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Table */}
          <div className="bg-[#15151A] rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#1C1C24] text-[#9E9EA8] border-b border-white/5">
                <tr>
                  <th className="p-3.5">کد کالا</th>
                  <th className="p-3.5">نام مدل</th>
                  <th className="p-3.5">تامین‌کننده مبدا</th>
                  <th className="p-3.5">زیرشاخه</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5 text-center">عملیات نظارتی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {opsQueue.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#9E9EA8]">
                      هیچ محصولی در این فیلتر صف بازبینی وجود ندارد.
                    </td>
                  </tr>
                ) : (
                  opsQueue.map(({ product: p, subcategoryNameFa, supplierName }: any) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-[#C8A951]">{p.productCode}</td>
                      <td className="p-3.5 font-semibold">{p.name}</td>
                      <td className="p-3.5 text-[#E5C365] font-medium">{supplierName || 'سازمان مبدا'}</td>
                      <td className="p-3.5 text-[#9E9EA8]">{subcategoryNameFa}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#252530] text-white border border-white/10">
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => openOpsDetail(p.id)}
                          className="px-3 py-1 bg-[#C8A951] hover:brightness-110 text-black font-bold rounded-lg text-[11px] inline-flex items-center gap-1 shadow-md shadow-[#C8A951]/20"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          بررسی پرونده
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: TAXONOMY TREE */}
      {activeView === 'taxonomy' && (
        <div className="space-y-6">
          <div className="bg-[#15151A] p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#C8A951]" />
                درخت استاندارد طبقه‌بندی طلای دیدار (Deterministic Gold Taxonomy)
              </h2>
              <p className="text-xs text-[#9E9EA8] mt-0.5">
                طبقه‌بندی قطعی سه‌سطحی: شاخه اصلی (Main Category) ← نوع زیورآلات (Product Category) ← زیرشاخه ساختاری (Subcategory)
              </p>
            </div>
            <span className="text-xs px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded-lg">
              تعداد گره‌های فعال: {subcategories.length + 9}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {taxonomyTree.map((mainCat) => (
              <div key={mainCat.id} className="bg-[#15151A] border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#C8A951]/20 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365] font-bold">
                      {mainCat.sortOrder}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-white">{mainCat.nameFa}</h3>
                      <span className="text-[10px] text-[#9E9EA8] font-mono">{mainCat.nameEn}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    شاخه اصلی
                  </span>
                </div>

                <div className="space-y-3">
                  {(mainCat.children || []).map((prodCat: any) => (
                    <div key={prodCat.id} className="bg-[#1C1C24] p-3 rounded-xl border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#E5C365] flex items-center gap-1.5">
                          <Tag className="w-3 h-3 text-[#C8A951]" />
                          {prodCat.nameFa} ({prodCat.nameEn})
                        </span>
                        <span className="text-[10px] text-[#686873]">سطح ۲</span>
                      </div>

                      {/* Subcategories */}
                      <div className="pr-4 border-r-2 border-[#C8A951]/30 space-y-1">
                        {(prodCat.children || []).map((sub: any) => (
                          <div key={sub.id} className="text-[11px] text-[#D4D4D8] flex items-center justify-between py-0.5">
                            <span>• {sub.nameFa}</span>
                            <span className="font-mono text-[9px] text-[#686873]">{sub.code}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: NEW PRODUCT CREATION */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#C8A951]" />
                ثبت مدل جدید طلا (پیش‌نویس تامین‌کننده)
              </h3>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-[#9E9EA8] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9E9EA8] mb-1">نام و عنوان مدل طلا *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: دستبند النگویی طرح لوتوس عیار ۷۵۰"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C8A951]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9E9EA8] mb-1">زیرشاخه ساختاری طلا *</label>
                  <select
                    value={newProdSubcat}
                    onChange={(e) => setNewProdSubcat(e.target.value)}
                    className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C8A951]"
                  >
                    {subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nameFa}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#9E9EA8] mb-1">عیار استاندارد</label>
                  <select
                    value={newProdKarat}
                    onChange={(e) => setNewProdKarat(Number(e.target.value))}
                    className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C8A951]"
                  >
                    <option value={18}>۱۸ عیار (۷۵۰)</option>
                    <option value={24}>۲۴ عیار (۹۹۹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9E9EA8] mb-1">کد محصول اختصاصی (اختیاری)</label>
                <input
                  type="text"
                  placeholder="در صورت خالی بودن، کد سیستمی ایجاد می‌شود"
                  value={newProdCode}
                  onChange={(e) => setNewProdCode(e.target.value)}
                  className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-[#9E9EA8] mb-1">لینک تصویر اصلی محصول</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white text-left font-mono focus:outline-none focus:border-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-[#9E9EA8] mb-1">توضیحات و مشخصات ساخت</label>
                <textarea
                  rows={2}
                  placeholder="توضیحات مربوط به ساختار طلا، قفل، بافت یا روش ریخته‌گری..."
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-[#14141A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C8A951]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 bg-[#252530] text-white rounded-xl hover:bg-[#323242]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-[#C8A951] hover:brightness-110 text-black font-bold rounded-xl shadow-lg shadow-[#C8A951]/20 flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  ثبت پیش‌نویس
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUPPLIER OFFERS MANAGEMENT */}
      {showOfferModal && currentProductForOffers && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white">مدیریت پیشنهادهای ساخت (Supplier Offers)</h3>
                <span className="text-xs text-[#E5C365]">{currentProductForOffers.name}</span>
              </div>
              <button onClick={() => setShowOfferModal(false)} className="text-[#9E9EA8] hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Existing Offers List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#9E9EA8]">آفرهای ثبت‌شده شما روی این مدل طلا:</h4>
              {productOffers.length === 0 ? (
                <div className="bg-[#14141A] p-4 rounded-xl text-center text-xs text-[#686873]">
                  هنوز هیچ پیشنهادی ثبت نشده است. ثبت حداقل یک پیشنهاد برای ارسال محصول به بررسی الزامی است.
                </div>
              ) : (
                <div className="space-y-2">
                  {productOffers.map((o: any) => (
                    <div
                      key={o.id}
                      className="bg-[#14141A] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            وزن: {o.weightType === 'EXACT' ? `${o.exactWeight} گرم (دقیق)` : `${o.weightMin} تا ${o.weightMax} گرم (بازه)`}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                            {o.availabilityType === 'AVAILABLE' ? 'موجود' : 'سفارشی'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#C8A951]">
                          اجرت ساخت:{' '}
                          {o.makingFeeType === 'PERCENT'
                            ? `${o.makingFeeValue}٪ درصدی`
                            : `${o.makingFeeMin}٪ تا ${o.makingFeeMax}٪ (بازه)`}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Offer Form */}
            <div className="bg-[#14141A] p-4 rounded-xl border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#C8A951]" />
                افزودن پیشنهاد شرایط ساخت جدید:
              </h4>

              <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
                {/* Weight Section */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#9E9EA8] mb-1">نوع وزن‌دهی</label>
                    <select
                      value={offerWeightType}
                      onChange={(e) => setOfferWeightType(e.target.value as any)}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="EXACT">وزن دقیق (EXACT)</option>
                      <option value="RANGE">بازه وزنی (RANGE)</option>
                    </select>
                  </div>

                  {offerWeightType === 'EXACT' ? (
                    <div>
                      <label className="block text-[#9E9EA8] mb-1">وزن دقیق طلا (گرم) *</label>
                      <input
                        type="number"
                        step="0.001"
                        required
                        value={offerExactWeight}
                        onChange={(e) => setOfferExactWeight(Number(e.target.value))}
                        className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[#9E9EA8] mb-1">حداقل وزن (گرم) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={offerWeightMin}
                          onChange={(e) => setOfferWeightMin(Number(e.target.value))}
                          className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[#9E9EA8] mb-1">حداکثر وزن (گرم) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={offerWeightMax}
                          onChange={(e) => setOfferWeightMax(Number(e.target.value))}
                          className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Making Fee Section */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#9E9EA8] mb-1">نوع اجرت ساخت</label>
                    <select
                      value={offerFeeType}
                      onChange={(e) => setOfferFeeType(e.target.value as any)}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="PERCENT">درصدی معین (PERCENT)</option>
                      <option value="RANGE_PERCENT">بازه درصدی (RANGE_PERCENT)</option>
                      <option value="FIXED">مبلغ ثابت (FIXED - غیرفعال)</option>
                    </select>
                  </div>

                  {offerFeeType === 'PERCENT' ? (
                    <div>
                      <label className="block text-[#9E9EA8] mb-1">درصد اجرت (٪) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={offerFeeValue}
                        onChange={(e) => setOfferFeeValue(Number(e.target.value))}
                        className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  ) : offerFeeType === 'RANGE_PERCENT' ? (
                    <>
                      <div>
                        <label className="block text-[#9E9EA8] mb-1">حداقل اجرت (٪) *</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={offerFeeMin}
                          onChange={(e) => setOfferFeeMin(Number(e.target.value))}
                          className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[#9E9EA8] mb-1">حداکثر اجرت (٪) *</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={offerFeeMax}
                          onChange={(e) => setOfferFeeMax(Number(e.target.value))}
                          className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 bg-rose-950/40 border border-rose-500/30 p-2 rounded-xl text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      طبق قانون حاکم P01، کارمزد ثابت تا تعیین واحد تسویه ریال/تومان/گرم توسط مالک غیرفعال است.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9E9EA8] mb-1">وضعیت دسترسی</label>
                    <select
                      value={offerAvailability}
                      onChange={(e) => setOfferAvailability(e.target.value as any)}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="AVAILABLE">موجود در ویترین / آماده تحویل</option>
                      <option value="MADE_TO_ORDER">تولید بر اساس سفارش کارگاهی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#9E9EA8] mb-1">مدت‌زمان ساخت (روز کاری)</label>
                    <input
                      type="number"
                      min="0"
                      value={offerLeadTime}
                      onChange={(e) => setOfferLeadTime(Number(e.target.value))}
                      className="w-full bg-[#1C1C24] border border-white/10 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#C8A951] hover:brightness-110 text-black font-bold rounded-xl shadow-lg shadow-[#C8A951]/20 flex items-center gap-1.5"
                  >
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    ثبت پیشنهاد قیمت
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRODUCT OPS REVIEW DETAIL & ACTIONS */}
      {selectedOpsDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded">
                  {selectedOpsDetail.product.productCode}
                </span>
                <h3 className="font-black text-base text-white mt-1">{selectedOpsDetail.product.name}</h3>
              </div>
              <button onClick={() => setSelectedOpsDetail(null)} className="text-[#9E9EA8] hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            {/* Product Basic Info */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#14141A] p-3 rounded-xl border border-white/5">
                <span className="text-[#686873] block mb-1">سازمان تامین‌کننده</span>
                <span className="font-bold text-[#E5C365]">{selectedOpsDetail.supplier?.displayName}</span>
              </div>
              <div className="bg-[#14141A] p-3 rounded-xl border border-white/5">
                <span className="text-[#686873] block mb-1">زیرشاخه ساختاری طلا</span>
                <span className="font-bold text-white">{selectedOpsDetail.subcategory?.nameFa}</span>
              </div>
              <div className="bg-[#14141A] p-3 rounded-xl border border-white/5">
                <span className="text-[#686873] block mb-1">وضعیت فعلی در پایگاه‌داده</span>
                <span className="font-bold text-emerald-400">{selectedOpsDetail.product.status}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#14141A] p-3 rounded-xl border border-white/5 text-xs text-[#D4D4D8] space-y-1">
              <span className="text-[#9E9EA8] font-bold block">توضیحات و مشخصات ساخت:</span>
              <p>{selectedOpsDetail.product.description || 'توضیحاتی ثبت نشده است.'}</p>
            </div>

            {/* Multi-Supplier Offers Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#C8A951]" />
                پیشنهادهای ثبت‌شده تامین‌کنندگان (Multi-Supplier Offers):
              </h4>
              <div className="bg-[#14141A] rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1C1C24] text-[#9E9EA8]">
                    <tr>
                      <th className="p-2.5">تامین‌کننده</th>
                      <th className="p-2.5">شرایط وزن</th>
                      <th className="p-2.5">اجرت ساخت</th>
                      <th className="p-2.5">دسترسی</th>
                      <th className="p-2.5">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {selectedOpsDetail.offers.map(({ offer: o, supplierDisplayName }: any) => (
                      <tr key={o.id}>
                        <td className="p-2.5 font-bold text-[#E5C365]">{supplierDisplayName}</td>
                        <td className="p-2.5">
                          {o.weightType === 'EXACT' ? `${o.exactWeight} گرم` : `${o.weightMin} تا ${o.weightMax} گرم`}
                        </td>
                        <td className="p-2.5 text-[#C8A951]">
                          {o.makingFeeType === 'PERCENT' ? `${o.makingFeeValue}٪` : `${o.makingFeeMin}٪ - ${o.makingFeeMax}٪`}
                        </td>
                        <td className="p-2.5">{o.availabilityType === 'AVAILABLE' ? 'موجود' : 'سفارشی'}</td>
                        <td className="p-2.5 text-[10px] text-emerald-400 font-bold">{o.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Lifecycle History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#9E9EA8] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C8A951]" />
                تاریخچه تغییرات وضعیت چرخه حیات (Lifecycle History):
              </h4>
              <div className="bg-[#14141A] p-3 rounded-xl border border-white/5 space-y-2 max-h-36 overflow-y-auto text-[11px]">
                {selectedOpsDetail.history.length === 0 ? (
                  <span className="text-[#686873]">هنوز سابقه‌ای ثبت نشده است.</span>
                ) : (
                  selectedOpsDetail.history.map((h: any) => (
                    <div key={h.id} className="flex items-center justify-between border-b border-white/5 pb-1 last:border-0">
                      <div>
                        <span className="text-zinc-400">{h.fromStatus} ← </span>
                        <span className="text-[#E5C365] font-bold">{h.toStatus}: </span>
                        <span className="text-white">{h.reason || 'بدون توضیح'}</span>
                      </div>
                      <span className="text-[10px] text-[#686873] font-mono">
                        {new Date(h.createdAt).toLocaleTimeString('fa-IR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Bar (Product Ops Decision Gates) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReviewNoteModal({ action: 'REQUEST_CHANGES', productId: selectedOpsDetail.product.id })}
                  className="px-3.5 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  درخواست اصلاحات
                </button>
                <button
                  onClick={() => setReviewNoteModal({ action: 'REJECT', productId: selectedOpsDetail.product.id })}
                  className="px-3.5 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  رد محصول
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedOpsDetail.product.status === 'SUBMITTED' && (
                  <button
                    onClick={() => handleOpsAction('APPROVE', selectedOpsDetail.product.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تایید محصول (Approve)
                  </button>
                )}

                {selectedOpsDetail.product.status === 'APPROVED' && (
                  <button
                    onClick={() => handleOpsAction('PUBLISH', selectedOpsDetail.product.id)}
                    disabled={loading}
                    className="px-5 py-2 bg-[#C8A951] hover:brightness-110 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#C8A951]/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    انتشار رسمی در کاتالوگ خرده‌فروشی
                  </button>
                )}

                {selectedOpsDetail.product.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleOpsAction('UNPUBLISH', selectedOpsDetail.product.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    خروج از انتشار
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: REVIEW NOTE FOR REJECT / REQUEST CHANGES */}
      {reviewNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#C8A951]" />
              {reviewNoteModal.action === 'REJECT' ? 'ثبت دلیل رد محصول' : 'ثبت توضیحات درخواست اصلاحات'}
            </h3>
            <p className="text-xs text-[#9E9EA8]">
              این توضیحات در تاریخچه چرخه حیات کالا ثبت شده و برای تامین‌کننده نمایش داده خواهد شد.
            </p>
            <textarea
              rows={4}
              required
              placeholder="توضیحات دقیق را وارد فرمایید..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              className="w-full bg-[#14141A] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#C8A951]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewNoteModal(null)}
                className="px-4 py-2 bg-[#252530] text-white text-xs rounded-xl"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleReviewNoteSubmit}
                disabled={loading || !reviewNote.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black text-xs font-bold rounded-xl"
              >
                ثبت تصمیم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: RETAILER PRODUCT DETAIL MODAL */}
      {selectedProductDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181820] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#C8A951] bg-[#C8A951]/10 px-2 py-0.5 rounded">
                  {selectedProductDetail.productCode}
                </span>
                <h3 className="font-black text-base text-white mt-1">{selectedProductDetail.name}</h3>
              </div>
              <button onClick={() => setSelectedProductDetail(null)} className="text-[#9E9EA8] hover:text-white font-bold text-lg">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-60 rounded-xl bg-[#14141A] overflow-hidden">
                <img
                  src={selectedProductDetail.primaryImage}
                  alt={selectedProductDetail.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-[#14141A] p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="flex justify-between text-[#9E9EA8]">
                    <span>زیرشاخه:</span>
                    <span className="font-bold text-white">{selectedProductDetail.subcategory?.nameFa}</span>
                  </div>
                  <div className="flex justify-between text-[#9E9EA8]">
                    <span>عیار استاندارد طلا:</span>
                    <span className="font-bold text-white">{selectedProductDetail.karat} عیار (۷۵۰)</span>
                  </div>
                  <div className="flex justify-between text-[#9E9EA8]">
                    <span>بازه وزن تقریبی:</span>
                    <span className="font-bold text-white">
                      {selectedProductDetail.indicativeWeightRange
                        ? `${selectedProductDetail.indicativeWeightRange.min} تا ${selectedProductDetail.indicativeWeightRange.max} گرم`
                        : 'سفارشی'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9E9EA8]">
                    <span>بازه اجرت ساخت:</span>
                    <span className="font-bold text-[#E5C365]">
                      {selectedProductDetail.indicativeMakingFeeRange
                        ? `${selectedProductDetail.indicativeMakingFeeRange.min}٪ تا ${selectedProductDetail.indicativeMakingFeeRange.max}٪`
                        : 'بر اساس سفارش'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#9E9EA8]">
                    <span>وضعیت آمادگی:</span>
                    <span className="font-bold text-emerald-400">
                      {selectedProductDetail.availability === 'AVAILABLE' ? 'موجود' : 'تولید سفارشی'}
                    </span>
                  </div>
                </div>

                <div className="bg-[#14141A] p-3 rounded-xl border border-white/5 text-[#D4D4D8]">
                  <span className="font-bold text-[#9E9EA8] block mb-1">مشخصات فنی و هنری:</span>
                  <p className="leading-relaxed">
                    {selectedProductDetail.technicalDescription || selectedProductDetail.description || 'فاقد مشخصات الحاقی.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setSelectedProductDetail(null)}
                className="px-5 py-2 bg-[#252530] text-white text-xs rounded-xl hover:bg-[#323242]"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
