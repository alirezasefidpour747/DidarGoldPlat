/**
 * Didar Gold Platform - K05 Product Detail Modal
 * Comprehensive SKU deep dive: Design Narrative, Variants, Casting Tech & Supplier Offers
 */

import React, { useState } from 'react';
import { ProductSku, SupplierCapacityOffer } from '../../types/k05.js';
import {
  X,
  Scale,
  Sparkles,
  Layers,
  CheckCircle2,
  Tag,
  Factory,
  ShieldCheck,
  Calendar,
  FileText,
  Clock,
  Coins,
  Film,
  Play,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductSku | null;
  offers: SupplierCapacityOffer[];
  onClose: () => void;
  onOpenEstimator: (product: ProductSku) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  offers,
  onClose,
  onOpenEstimator
}) => {
  const [activeAssetIndex, setActiveAssetIndex] = useState(0);

  if (!product) return null;

  const relatedOffers = offers.filter(o => o.productSkuId === product.id);
  const currentAsset = product.narrativeAssets[activeAssetIndex] || product.narrativeAssets[0];
  const isVideo = currentAsset && (currentAsset.type === 'video_turn' || currentAsset.url.endsWith('.mp4') || currentAsset.url.endsWith('.webm'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-[#15151E] border border-[#2B2B3E] shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#252536] flex items-center justify-between bg-[#191924]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-xl bg-[#292215] text-[#C8A951] border border-[#C8A951]/40">
              {product.skuCode}
            </span>
            <div>
              <h2 className="text-base font-bold text-[#EDEDED]">{product.titleFa}</h2>
              <div className="flex items-center gap-2 text-xs text-[#8E8EA2] mt-0.5">
                <span className="flex items-center gap-1">
                  {product.familyTitleFa && <span className="text-[#C8A951]">{product.familyTitleFa.split(' ')[1] || product.familyTitleFa} / </span>}
                  <span className="text-[#EDEDED] font-semibold">{product.categoryFa}</span>
                  {product.subcategoryFa && (
                    <span className="text-[#3DD68C]"> / {product.subcategoryFa}</span>
                  )}
                </span>
                <span>•</span>
                <span className="text-[#3DD68C]">{product.caratFa}</span>
                <span>•</span>
                <span>سبک: {product.designStyleFa}</span>
                <span>•</span>
                <span className="text-[#E5C365] font-mono font-medium">
                  رنج وزنی: {product.weightRangeFa || `${(product.minWeightGrams || (product.baseWeightGrams * 0.95)).toFixed(2)} الی ${(product.maxWeightGrams || (product.baseWeightGrams * 1.05)).toFixed(2)} گرم`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7E7E90] hover:text-[#EDEDED] hover:bg-[#252536] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#EDEDED]">
          {/* Top Hero Section: Images + Design Narrative */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Narrative Gallery */}
            <div className="space-y-3">
              <div className="h-64 rounded-2xl bg-[#0E0E14] border border-[#252536] overflow-hidden relative flex items-center justify-center">
                {isVideo ? (
                  <video
                    key={currentAsset?.url}
                    src={currentAsset?.url}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={currentAsset?.url || 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80'}
                    alt={currentAsset?.titleFa || product.titleFa}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-2 right-2 left-2 p-2 rounded-xl bg-black/70 backdrop-blur-sm text-[11px] text-[#D8D8E4] flex items-center justify-between pointer-events-none">
                  <span>{currentAsset?.titleFa || 'نمای استودیویی مدل طلا'}</span>
                  <span className="text-[10px] text-[#C8A951] font-bold flex items-center gap-1">
                    {isVideo ? <Film className="w-3 h-3 text-[#3DD68C]" /> : <ImageIcon className="w-3 h-3 text-[#C8A951]" />}
                    {currentAsset?.typeFa || (isVideo ? 'ویدیو ۳۶۰' : 'تصویر')}
                  </span>
                </div>
              </div>

              {/* Thumbnails */}
              {product.narrativeAssets.length > 1 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {product.narrativeAssets.map((asset, idx) => {
                    const isAssetVideo = asset.type === 'video_turn' || asset.url.endsWith('.mp4') || asset.url.endsWith('.webm');
                    const isSelected = idx === activeAssetIndex;
                    return (
                      <button
                        key={asset.id}
                        type="button"
                        onClick={() => setActiveAssetIndex(idx)}
                        className={`h-20 rounded-xl bg-[#0E0E14] border overflow-hidden relative text-right transition-all group ${
                          isSelected ? 'border-[#C8A951] ring-2 ring-[#C8A951]/30' : 'border-[#232334] hover:border-[#3E3E56]'
                        }`}
                      >
                        {isAssetVideo ? (
                          <div className="w-full h-full relative bg-[#13131D] flex items-center justify-center">
                            <video src={asset.url} className="w-full h-full object-cover opacity-80" muted playsInline />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="p-1 rounded-full bg-black/70 text-[#3DD68C]">
                                <Play className="w-3 h-3 fill-current" />
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
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] text-[#C8C8DC]">
                          {isAssetVideo ? 'ویدیو' : 'تصویر'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Narrative & Crafting Description */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#1B1B27] border border-[#28283C] space-y-3">
                <h4 className="text-xs font-bold text-[#C8A951] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  روایت مفهومی و داستان ساخت (Design Narrative)
                </h4>
                <p className="text-xs text-[#B0B0C4] leading-relaxed">
                  {product.storylineFa}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1B1B27] border border-[#28283C] space-y-2">
                <h4 className="text-xs font-bold text-[#EDEDED] flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-[#3DD68C]" />
                  فناوری ساخت و متالورژی ریخته‌گری
                </h4>
                <p className="text-xs text-[#9E9EB2] leading-relaxed">
                  {product.craftingTechniqueFa}
                </p>
                <div className="pt-2 flex items-center gap-4 text-[11px] text-[#7A7A8E]">
                  <span>تلورانس ریخته‌گری: ±{product.weightTolerancePercent}٪</span>
                  <span>سود بنکداری پیشنهادی: {product.recommendedWholesaleMargin}٪</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {product.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[#20202E] text-[#9A9AB0] border border-[#2C2C3E] text-[10px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Variants Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-[#EDEDED] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C8A951]" />
                جدول تنوع ساخت، سایزبندی و وزن فیزیکی (SKU Variants)
              </h3>
              <span className="text-[11px] text-[#7E7E92]">
                {product.variants.length} سایز و رنگ ثبت‌شده
              </span>
            </div>

            <div className="rounded-2xl border border-[#242434] overflow-hidden bg-[#13131A]">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#1C1C28] text-[#8C8CA0] text-[11px] border-b border-[#242434]">
                    <th className="py-2.5 px-3">کد زیرتنوع</th>
                    <th className="py-2.5 px-3">سایز و ابعاد</th>
                    <th className="py-2.5 px-3">رنگ طلا</th>
                    <th className="py-2.5 px-3">رنج وزنی مجاز SKU</th>
                    <th className="py-2.5 px-3">میانگین رنج (اسمی)</th>
                    <th className="py-2.5 px-3">موجودی بنکداری</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20202E] font-mono text-xs">
                  {product.variants.map((v) => {
                    const minW = v.minWeightGrams !== undefined ? v.minWeightGrams : Number(((v.targetWeightGrams || 10) - (v.toleranceGrams || 0.25)).toFixed(2));
                    const maxW = v.maxWeightGrams !== undefined ? v.maxWeightGrams : Number(((v.targetWeightGrams || 10) + (v.toleranceGrams || 0.25)).toFixed(2));
                    return (
                      <tr key={v.id} className="hover:bg-[#1A1A24]">
                        <td className="py-2.5 px-3 text-[#C8A951] font-bold">{v.skuCode}</td>
                        <td className="py-2.5 px-3 font-sans text-[#EDEDED]">{v.sizeLabelFa}</td>
                        <td className="py-2.5 px-3 font-sans text-[#A8A8B8]">{v.colorFa}</td>
                        <td className="py-2.5 px-3 text-[#E5C365] font-bold">
                          {minW.toFixed(2)} الی {maxW.toFixed(2)} گرم
                        </td>
                        <td className="py-2.5 px-3 text-[#9E9EB0]">
                          {Number(v.targetWeightGrams || 0).toFixed(2)} گرم (±{v.toleranceGrams})
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            v.inStockQuantity > 0 ? 'bg-[#182B1E] text-[#3DD68C]' : 'bg-[#2E181B] text-[#FF7A7A]'
                          }`}>
                            {v.inStockQuantity} عدد
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplier Capacity Offers for this SKU */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs text-[#EDEDED] flex items-center gap-2">
              <Factory className="w-4 h-4 text-[#3DD68C]" />
              پیشنهادهای ظرفیت تولید فعال کارگاه‌های همکار برای این مدل
            </h3>

            {relatedOffers.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#14141C] border border-[#222230] text-center text-[#78788C]">
                هنوز هیچ پیشنهاد ظرفیت ساخت مستقیمی برای این مدل از سوی کارگاه‌ها ثبت نشده است.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {relatedOffers.map((off) => (
                  <div
                    key={off.id}
                    className="p-3.5 rounded-xl bg-[#14141C] border border-[#242436] space-y-2.5"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#20202E]">
                      <div>
                        <span className="font-bold text-[#EDEDED] block text-xs">{off.supplierName}</span>
                        <span className="text-[10px] text-[#7A7A8E]">محل کارگاه: {off.supplierCityFa} • گرید {off.supplierGrade}</span>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#1A2D20] text-[#3DD68C]">
                        {off.statusFa}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div>
                        <span className="text-[10px] text-[#6E6E80] block">ظرفیت هفتگی:</span>
                        <span className="font-mono text-[#E5C365] font-bold">{off.weeklyCapacityGrams.toLocaleString()} گرم</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6E6E80] block">اجرت پیشنهادی:</span>
                        <span className="font-mono text-[#3DD68C] font-bold">{off.offeredWageDisplay}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6E6E80] block">زمان تحویل پارت:</span>
                        <span className="font-mono text-[#EDEDED] font-bold">{off.leadTimeDays} روز کاری</span>
                      </div>
                    </div>

                    {off.notes && (
                      <p className="text-[10px] text-[#868698] bg-[#111116] p-2 rounded-lg">
                        {off.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#252536] bg-[#181822] flex items-center justify-between">
          <button
            onClick={() => onOpenEstimator(product)}
            className="px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
          >
            <Coins className="w-4 h-4" />
            <span>محاسبه قیمت آنلاین تمام‌شده (مظنه امروز)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#222230] hover:bg-[#2C2C3E] text-[#B0B0C0] text-xs font-semibold transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
