/**
 * Didar Gold Platform - K05 Narrative Story Gallery
 * Iranian Goldsmithing Heritage, CAD Mold Blueprints & Design Storytelling
 */

import React from 'react';
import { ProductSku } from '../../types/k05.js';
import { Sparkles, Image as ImageIcon, FileText, Layers, ShieldCheck, Tag } from 'lucide-react';

interface NarrativeStoryGalleryProps {
  products: ProductSku[];
  onSelectProduct: (product: ProductSku) => void;
}

export const NarrativeStoryGallery: React.FC<NarrativeStoryGalleryProps> = ({
  products,
  onSelectProduct
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#1E1A14] to-[#16161F] border border-[#3E3420] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C8A951]/20 text-[#C8A951]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#EDEDED]">گالری روایی و هویت طراحی مصنوعات طلا (Design Narratives)</h2>
          </div>
          <p className="text-xs text-[#A0A0B2] leading-relaxed max-w-2xl">
            ثبت شناسنامه هنری و الهام‌بخش هر قطعه؛ پیوند میان هنر اصیل زرگری ایران (اسلیمی صفوی، ملیله‌کاری زنجان و طلاسازی یزد) با فناوری پیشرفته ریخته‌گری القایی و نقشه‌های صنعتی CAD.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-[#14141C] border border-[#2D2D40] text-center shrink-0">
          <span className="text-[10px] text-[#7A7A8E] block">مدل‌های دارای شناسنامه هنری</span>
          <span className="font-mono text-base font-bold text-[#C8A951]">{products.length} مدل</span>
        </div>
      </div>

      {/* Grid of Stories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => {
          const heroAsset = p.narrativeAssets.find(a => a.isPrimary) || p.narrativeAssets[0];
          const cadAsset = p.narrativeAssets.find(a => a.type === 'cad_blueprint');

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-[#16161F] border border-[#262638] overflow-hidden hover:border-[#C8A951]/40 transition-all flex flex-col justify-between group"
            >
              {/* Image & Title */}
              <div>
                <div className="relative h-56 bg-[#0E0E14] overflow-hidden">
                  <img
                    src={heroAsset?.url || 'https://images.unsplash.com/photo-1611591475839-729c24ed9804?auto=format&fit=crop&w=800&q=80'}
                    alt={p.titleFa}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161F] via-transparent to-black/30" />

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-[#C8A951] border border-[#C8A951]/30 backdrop-blur-sm">
                      {p.skuCode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-black/60 text-[#3DD68C] border border-[#3DD68C]/30 backdrop-blur-sm">
                      {p.caratFa}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 left-3">
                    <span className="text-[10px] text-[#C8A951] font-semibold block mb-0.5">
                      سبک: {p.designStyleFa}
                    </span>
                    <h3 className="text-sm font-bold text-[#EDEDED] line-clamp-1">
                      {p.titleFa}
                    </h3>
                  </div>
                </div>

                {/* Narrative Text */}
                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#C8A951] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      روایت و فلسفه طراحی:
                    </span>
                    <p className="text-xs text-[#B0B0C4] leading-relaxed">
                      {p.storylineFa}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#111118] border border-[#20202E] space-y-1 text-xs">
                    <span className="text-[10px] text-[#767688] block">فناوری متالورژی ساخت:</span>
                    <p className="text-[11px] text-[#EDEDED]">
                      {p.craftingTechniqueFa}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#232332] bg-[#14141D] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-[#848498]">
                  <Layers className="w-3.5 h-3.5 text-[#C8A951]" />
                  <span>{p.variants.length} تنوع قالب‌گیری</span>
                </div>

                <button
                  onClick={() => onSelectProduct(p)}
                  className="px-3 py-1.5 rounded-xl bg-[#232332] hover:bg-[#C8A951] hover:text-[#141416] text-[#EDEDED] text-xs font-bold transition-all"
                >
                  مشاهده مشخصات کامل و قالب‌ها
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
