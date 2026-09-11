/**
 * Didar Gold Platform - Kernel Domain K05 Dashboard
 * Domain K05: Products, Catalog, Variants, Narrative Assets & Supplier Capacity Offers
 * کاتالوگ محصولات، مدل‌های طلا، تنوع ساخت، گالری روایی و پیشنهادهای ظرفیت تولید کارگاه‌ها
 */

import React, { useState, useEffect } from 'react';
import { K05DataPayload, ProductSku, ProductVariant, SupplierCapacityOffer, LiveGoldSpotRate } from '../../types/k05.js';
import { api } from '../../lib/api.js';
import {
  Package,
  Layers,
  Factory,
  Sparkles,
  Scale,
  TrendingUp,
  Plus,
  Coins,
  Calculator,
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { ProductCatalogGrid } from './ProductCatalogGrid.js';
import { ProductDetailModal } from './ProductDetailModal.js';
import { NewProductModal } from './NewProductModal.js';
import { SupplyOffersManager } from './SupplyOffersManager.js';
import { NewOfferModal } from './NewOfferModal.js';
import { GoldPriceEstimatorModal } from './GoldPriceEstimatorModal.js';
import { NarrativeStoryGallery } from './NarrativeStoryGallery.js';

export const K05Dashboard: React.FC = () => {
  const [data, setData] = useState<K05DataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'offers' | 'estimator' | 'narratives'>('catalog');

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<ProductSku | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [showEstimatorModal, setShowEstimatorModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getK05Data();
      setData(res);
    } catch (err: unknown) {
      console.error('Error loading K05 data:', err);
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری اطلاعات کاتالوگ و تأمین (K05)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      const created = await api.createProduct(productData);
      showToast('success', `مدل «${created.titleFa}» با موفقیت در کاتالوگ ثبت گردید.`);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در ثبت مدل کالا.');
      throw err;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await api.deleteProduct(id);
      showToast('success', 'مدل کالا با موفقیت از کاتالوگ حذف گردید.');
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در حذف مدل کالا.');
    }
  };

  const handleCreateSupplyOffer = async (offerData: any) => {
    try {
      const created = await api.createSupplyOffer(offerData);
      showToast('success', `پیشنهاد ظرفیت با کد ${created.offerCode} ثبت گردید.`);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در ثبت پیشنهاد ظرفیت.');
      throw err;
    }
  };

  const handleUpdateOfferStatus = async (id: string, status: SupplierCapacityOffer['status']) => {
    try {
      const updated = await api.updateOfferStatus(id, status);
      showToast('success', `وضعیت به «${updated.statusFa}» به‌روز شد.`);
      await loadData();
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'خطا در تغییر وضعیت پیشنهاد.');
    }
  };

  const handleUpdateMarketRate = async (rates: Partial<LiveGoldSpotRate>) => {
    try {
      await api.updateMarketRate(rates);
      showToast('success', 'نرخ روز بازار طلا به‌روزرسانی شد.');
      await loadData();
    } catch (err: unknown) {
      showToast('error', 'خطا در به‌روزرسانی نرخ بازار.');
    }
  };

  if (loading && !data) {
    return (
      <div className="p-12 text-center text-[#A0A0B2] space-y-3">
        <RotateCw className="w-8 h-8 animate-spin mx-auto text-[#C8A951]" />
        <p className="text-sm font-semibold">در حال بارگذاری کاتالوگ مدل‌های طلا و پیشنهادهای ظرفیت ساخت...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl bg-[#28181A] border border-[#522026] text-center space-y-4 max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-[#FF7A7A] mx-auto" />
        <h3 className="font-bold text-sm text-[#FF7A7A]">خطا در اتصال به هسته K05</h3>
        <p className="text-xs text-[#E0B4B4]">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 rounded-xl bg-[#C8A951] text-[#141416] font-bold text-xs hover:bg-[#D8B961]"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const { products = [], supplyOffers = [], metrics, marketRate } = data!;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 ${
            notification.type === 'success'
              ? 'bg-[#182F22] border-[#2C5E40] text-[#3DD68C]'
              : 'bg-[#331C1F] border-[#662830] text-[#FF7A7A]'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#FF7A7A]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner with live gold ticker and quick actions */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#171722] via-[#1A1A27] to-[#171722] border border-[#2B2B3E] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#C8A951]/20 text-[#C8A951] border border-[#C8A951]/30">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#EDEDED]">
                  هسته K05: محصول، کاتالوگ، تنوع و پیشنهاد تأمین
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#244230] text-[#3DD68C] border border-[#326B4B]">
                  عملیاتی (Active)
                </span>
              </div>
              <p className="text-xs text-[#8E8EA0] mt-0.5">
                تعریف مدل کالا، تنوع سایزبندی ساخت، گالری روایی و مدیریت پیشنهادهای ظرفیت تولید هفتگی کارگاه‌ها
              </p>
            </div>
          </div>
        </div>

        {/* Live Market Spot Gold Ticker */}
        <div className="flex items-center gap-2 self-stretch lg:self-auto justify-between lg:justify-end">
          <div className="px-3.5 py-2 rounded-xl bg-[#12121A] border border-[#272738] flex items-center gap-3">
            <div>
              <span className="text-[10px] text-[#78788C] block">نرخ طلای ۱۸ عیار (۷۵۰):</span>
              <span className="font-mono text-xs font-bold text-[#C8A951]">
                {Math.round(marketRate.gold18kGramIrr / 10).toLocaleString()} تومان / گرم
              </span>
            </div>
            <div className="h-7 w-[1px] bg-[#2A2A3C]" />
            <div>
              <span className="text-[10px] text-[#78788C] block">مظنه ۱۷ عیار:</span>
              <span className="font-mono text-xs font-bold text-[#EDEDED]">
                {Math.round(marketRate.mesghal17kIrr / 10).toLocaleString()} تومان
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowEstimatorModal(true)}
            className="p-2.5 rounded-xl bg-[#232334] hover:bg-[#2C2C42] text-[#C8A951] border border-[#35354E] transition-colors"
            title="ماشین‌حساب برآورد مظنه و قیمت تمام‌شده"
          >
            <Calculator className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#16161F] border border-[#272738] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8C8CA0]">
            <span>مدل‌های کاتالوگ (SKUs)</span>
            <Package className="w-4 h-4 text-[#C8A951]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#EDEDED]">
            {metrics.totalProductsCount}
          </div>
          <span className="text-[10px] text-[#3DD68C] block">
            {metrics.activeSkusCount} مدل فعال و در گردش
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16161F] border border-[#272738] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8C8CA0]">
            <span>ظرفیت ساخت هفتگی</span>
            <Factory className="w-4 h-4 text-[#3DD68C]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#3DD68C]">
            {metrics.totalWeeklyCapacityKg.toLocaleString()} کیلوگرم
          </div>
          <span className="text-[10px] text-[#808096] block">
            از {metrics.activeSuppliersCount} کارگاه و سازنده فعال
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16161F] border border-[#272738] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8C8CA0]">
            <span>میانگین اجرت ساخت سازنده</span>
            <Sparkles className="w-4 h-4 text-[#E5C365]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#E5C365]">
            {metrics.averageMakerWagePercent}٪
          </div>
          <span className="text-[10px] text-[#808096] block">
            بر مبنای ارزش روز طلای خام
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#16161F] border border-[#272738] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8C8CA0]">
            <span>موجودی آماده تحویل بنکداری</span>
            <Scale className="w-4 h-4 text-[#64B5F6]" />
          </div>
          <div className="font-mono text-xl font-bold text-[#EDEDED]">
            {(metrics.totalAvailableStockGrams / 1000).toFixed(2)} کیلوگرم
          </div>
          <span className="text-[10px] text-[#808096] block">
            معادل {metrics.totalAvailableStockGrams.toLocaleString()} گرم
          </span>
        </div>
      </div>

      {/* Tabs & Action Buttons Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#252536] pb-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'catalog'
                ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
                : 'bg-[#181824] text-[#A0A0B2] hover:text-[#EDEDED] hover:bg-[#222232]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>کاتالوگ محصولات ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'offers'
                ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
                : 'bg-[#181824] text-[#A0A0B2] hover:text-[#EDEDED] hover:bg-[#222232]'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>پیشنهادهای ظرفیت تولید ({supplyOffers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('narratives')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'narratives'
                ? 'bg-[#C8A951] text-[#141416] shadow-md shadow-[#C8A951]/20'
                : 'bg-[#181824] text-[#A0A0B2] hover:text-[#EDEDED] hover:bg-[#222232]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>گالری روایی و هویت ساخت</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowNewProductModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>تعریف مدل جدید</span>
          </button>

          <button
            onClick={() => setShowNewOfferModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#1F2F24] hover:bg-[#283E30] text-[#3DD68C] border border-[#2E5A3D] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Factory className="w-3.5 h-3.5" />
            <span>ثبت ظرفیت کارگاه</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'catalog' && (
        <ProductCatalogGrid
          products={products}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setShowDetailModal(true);
          }}
          onOpenEstimator={(p, v) => {
            setSelectedProduct(p);
            setShowEstimatorModal(true);
          }}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {activeTab === 'offers' && (
        <SupplyOffersManager
          offers={supplyOffers}
          products={products}
          onOpenNewOfferModal={() => setShowNewOfferModal(true)}
          onUpdateStatus={handleUpdateOfferStatus}
        />
      )}

      {activeTab === 'narratives' && (
        <NarrativeStoryGallery
          products={products}
          onSelectProduct={(p) => {
            setSelectedProduct(p);
            setShowDetailModal(true);
          }}
        />
      )}

      {/* Modals */}
      {showDetailModal && (
        <ProductDetailModal
          product={selectedProduct}
          offers={supplyOffers}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProduct(null);
          }}
          onOpenEstimator={(p) => {
            setShowDetailModal(false);
            setSelectedProduct(p);
            setShowEstimatorModal(true);
          }}
        />
      )}

      {showNewProductModal && (
        <NewProductModal
          isOpen={showNewProductModal}
          onClose={() => setShowNewProductModal(false)}
          onSubmit={handleCreateProduct}
        />
      )}

      {showNewOfferModal && (
        <NewOfferModal
          isOpen={showNewOfferModal}
          products={products}
          onClose={() => setShowNewOfferModal(false)}
          onSubmit={handleCreateSupplyOffer}
        />
      )}

      {showEstimatorModal && (
        <GoldPriceEstimatorModal
          isOpen={showEstimatorModal}
          product={selectedProduct}
          products={products}
          marketRate={marketRate}
          onClose={() => setShowEstimatorModal(false)}
          onUpdateMarketRate={handleUpdateMarketRate}
        />
      )}
    </div>
  );
};
