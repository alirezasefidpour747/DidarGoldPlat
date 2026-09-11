/**
 * Didar Gold Platform - K05 Product Catalog Grid
 * Master SKU display with gold specs, wages, variants & quick price calculator
 */

import React, { useState } from 'react';
import { ProductSku, ProductCategory, ProductVariant } from '../../types/k05.js';
import { GOLD_TAXONOMY_TREE, STANDARD_GOLD_CARATS } from '../../data/goldTaxonomy.js';
import {
  Search,
  Filter,
  Layers,
  Scale,
  Sparkles,
  Eye,
  Trash2,
  Calculator,
  Tag,
  ArrowUpDown,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface ProductCatalogGridProps {
  products: ProductSku[];
  onSelectProduct: (product: ProductSku) => void;
  onOpenEstimator: (product: ProductSku, variant?: ProductVariant) => void;
  onDeleteProduct: (id: string) => void;
}

const FAMILY_TABS: { id: string | 'all'; labelFa: string }[] = [
  { id: 'all', labelFa: 'همه خانواده‌ها' },
  { id: 'jewelry', labelFa: '۱. زیورآلات بدنی' },
  { id: 'accessories', labelFa: '۲. اکسسوری‌ها' },
  { id: 'combo_sets', labelFa: '۳. ست‌ها و پک‌ها' },
  { id: 'bullion', labelFa: '۴. مسکوک و شمش' },
  { id: 'symbolic', labelFa: '۵. اقلام مفهومی' }
];

export const ProductCatalogGrid: React.FC<ProductCatalogGridProps> = ({
  products,
  onSelectProduct,
  onOpenEstimator,
  onDeleteProduct
}) => {
  const [selectedFamily, setSelectedFamily] = useState<string | 'all'>('all');
  const [caratFilter, setCaratFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'weight_asc' | 'weight_desc' | 'wage_asc' | 'wage_desc'>('weight_asc');

  const filteredProducts = products.filter((p) => {
    if (selectedFamily !== 'all' && p.familyId && p.familyId !== selectedFamily) {
      return false;
    }
    if (caratFilter !== 'all' && p.carat !== caratFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.titleFa.toLowerCase().includes(q);
      const matchSku = p.skuCode.toLowerCase().includes(q);
      const matchStyle = p.designStyleFa.toLowerCase().includes(q);
      const matchSub = p.subcategoryFa?.toLowerCase().includes(q);
      const matchFamily = p.familyTitleFa?.toLowerCase().includes(q);
      const matchCat = p.categoryFa?.toLowerCase().includes(q);
      const matchTag = p.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchSku && !matchStyle && !matchSub && !matchFamily && !matchCat && !matchTag) return false;
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'weight_asc') return a.baseWeightGrams - b.baseWeightGrams;
    if (sortBy === 'weight_desc') return b.baseWeightGrams - a.baseWeightGrams;
    if (sortBy === 'wage_asc') return a.makerWageValue - b.makerWageValue;
    if (sortBy === 'wage_desc') return b.makerWageValue - a.makerWageValue;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="p-4 rounded-2xl bg-[#16161F] border border-[#262638] space-y-4">
        {/* Family Tabs (Level 1) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {FAMILY_TABS.map((fam) => {
            const isSelected = selectedFamily === fam.id;
            return (
              <button
                key={fam.id}
                onClick={() => setSelectedFamily(fam.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#C8A951] text-[#141416] font-bold shadow-md shadow-[#C8A951]/20'
                    : 'bg-[#1C1C28] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#252536]'
                }`}
              >
                {fam.labelFa}
              </button>
            );
          })}
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7E92]" />
            <input
              type="text"
              placeholder="جستجو در نام مدل، کد SKU، سبک طراحی یا برچسب‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#101017] border border-[#2A2A3C] text-xs text-[#EDEDED] placeholder-[#66667A] focus:outline-none focus:border-[#C8A951] transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#808094] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A951]" />
                عیار:
              </span>
              <select
                value={caratFilter}
                onChange={(e) => setCaratFilter(e.target.value)}
                className="px-2.5 py-2 rounded-xl bg-[#101017] border border-[#2A2A3C] text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="all">همه عیارها</option>
                {STANDARD_GOLD_CARATS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fineness} ({c.caratNumberFa})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#808094] flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                مرتب‌سازی:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-2 rounded-xl bg-[#101017] border border-[#2A2A3C] text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
              >
                <option value="weight_asc">وزن ساخت (سبک به سنگین)</option>
                <option value="weight_desc">وزن ساخت (سنگین به سبک)</option>
                <option value="wage_asc">اجرت ساخت (کمترین اجرت)</option>
                <option value="wage_desc">اجرت ساخت (بیشترین اجرت)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#16161F] border border-[#262638] text-[#808092] space-y-2">
          <Layers className="w-10 h-10 mx-auto text-[#48485C]" />
          <p className="font-semibold text-sm">هیچ محصولی با معیارهای جستجو یافت نشد.</p>
          <p className="text-xs">دسته‌بندی دیگری انتخاب نمایید یا عبارت جستجو را پاک کنید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => {
            const primaryAsset = product.narrativeAssets.find(a => a.isPrimary) || product.narrativeAssets[0];
            const totalStock = product.variants.reduce((acc, v) => acc + v.inStockQuantity, 0);

            return (
              <div
                key={product.id}
                className="rounded-2xl bg-[#16161F] border border-[#272738] overflow-hidden hover:border-[#C8A951]/50 transition-all flex flex-col group"
              >
                {/* Image Header with Badges */}
                <div className="relative h-48 bg-[#0F0F14] overflow-hidden">
                  {primaryAsset ? (
                    <img
                      src={primaryAsset.url}
                      alt={product.titleFa}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#555566]">
                      <ImageIcon className="w-12 h-12 stroke-[1.2]" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161F] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#14141CCC] text-[#C8A951] border border-[#C8A951]/40 backdrop-blur-md">
                      {product.skuCode}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#1F2F24CC] text-[#3DD68C] border border-[#254A34] backdrop-blur-md">
                      {product.caratFa}
                    </span>
                  </div>

                  {/* Category & Subcategory Pill Bottom Right */}
                  <div className="absolute bottom-2 right-3">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#252536EE] text-[#E0E0E8] backdrop-blur-sm flex items-center gap-1">
                      <span>{product.categoryFa}</span>
                      {product.subcategoryFa && (
                        <span className="text-[#C8A951]">/ {product.subcategoryFa}</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm text-[#EDEDED] line-clamp-2 leading-relaxed" title={product.titleFa}>
                      {product.titleFa}
                    </h3>
                    <p className="text-xs text-[#9090A4] line-clamp-2 leading-relaxed">
                      {product.storylineFa}
                    </p>
                  </div>

                  {/* Technical Attributes Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#111118] border border-[#20202E] text-xs">
                    <div>
                      <span className="text-[10px] text-[#78788C] block">رنج وزنی مجاز مدل:</span>
                      <span className="font-mono font-bold text-[#E5C365] flex items-center gap-1">
                        <Scale className="w-3 h-3 text-[#C8A951]" />
                        {product.weightRangeFa || (
                          product.minWeightGrams && product.maxWeightGrams
                            ? `${product.minWeightGrams.toFixed(2)} الی ${product.maxWeightGrams.toFixed(2)} گرم`
                            : `${Number(product.baseWeightGrams || 0).toFixed(2)} گرم`
                        )}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#78788C] block">اجرت ساخت سازنده:</span>
                      <span className="font-mono font-bold text-[#3DD68C] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {product.makerWageDisplay}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#78788C] block">وضعیت نگین:</span>
                      <span className="text-[11px] text-[#B0B0C0] font-medium truncate block">
                        {product.stonesTypeFa}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#78788C] block">موجودی بنکداری:</span>
                      <span className="font-mono text-[11px] font-semibold text-[#EDEDED]">
                        {totalStock} عدد در {product.variants.length} تنوع
                      </span>
                    </div>
                  </div>

                  {/* Variants Quick Badges */}
                  <div className="flex items-center gap-1 overflow-x-auto text-[10px] pb-1">
                    <span className="text-[#656574] shrink-0">تنوع:</span>
                    {product.variants.map((v) => {
                      const minW = v.minWeightGrams !== undefined ? v.minWeightGrams : Number(((v.targetWeightGrams || 10) - (v.toleranceGrams || 0.25)).toFixed(2));
                      const maxW = v.maxWeightGrams !== undefined ? v.maxWeightGrams : Number(((v.targetWeightGrams || 10) + (v.toleranceGrams || 0.25)).toFixed(2));
                      return (
                        <span
                          key={v.id}
                          className="px-1.5 py-0.5 rounded bg-[#1F1F2C] text-[#A0A0B2] border border-[#2C2C3E] shrink-0 font-mono"
                          title={`${v.sizeLabelFa} - ${v.colorFa} (رنج وزنی: ${minW.toFixed(2)} الی ${maxW.toFixed(2)} گرم)`}
                        >
                          {v.sizeLabelFa}
                        </span>
                      );
                    })}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#232332] flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenEstimator(product)}
                      className="px-3 py-1.5 rounded-xl bg-[#222232] hover:bg-[#2E2E44] text-[#E5C365] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#3A3A52]"
                      title="محاسبه قیمت تمام‌شده آنلاین بر مبنای مظنه لحظه‌ای"
                    >
                      <Calculator className="w-3.5 h-3.5 text-[#C8A951]" />
                      <span>برآورد قیمت</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="px-3 py-1.5 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>شناسنامه مدل</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف مدل «${product.titleFa}» از کاتالوگ اطمینان دارید؟`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 rounded-xl text-[#7E7E90] hover:text-[#FF7A7A] hover:bg-[#2A171A] transition-colors"
                        title="حذف از کاتالوگ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
