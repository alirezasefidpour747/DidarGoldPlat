/**
 * Didar Gold Platform - K05 Supply Offers Manager
 * Supplier capacity, workshop production batches, lead times & offered wages
 */

import React, { useState } from 'react';
import { SupplierCapacityOffer, ProductSku } from '../../types/k05.js';
import {
  Factory,
  CheckCircle2,
  Clock,
  Scale,
  Sparkles,
  ShieldCheck,
  Plus,
  Filter,
  Search,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar
} from 'lucide-react';

interface SupplyOffersManagerProps {
  offers: SupplierCapacityOffer[];
  products: ProductSku[];
  onOpenNewOfferModal: () => void;
  onUpdateStatus: (id: string, status: SupplierCapacityOffer['status']) => void;
}

export const SupplyOffersManager: React.FC<SupplyOffersManagerProps> = ({
  offers,
  products,
  onOpenNewOfferModal,
  onUpdateStatus
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredOffers = offers.filter((o) => {
    if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSupplier = o.supplierName.toLowerCase().includes(q);
      const matchProduct = o.productTitleFa.toLowerCase().includes(q);
      const matchCode = o.offerCode.toLowerCase().includes(q);
      const matchCity = o.supplierCityFa.toLowerCase().includes(q);
      if (!matchSupplier && !matchProduct && !matchCode && !matchCity) return false;
    }
    return true;
  });

  const getStatusBadge = (status: SupplierCapacityOffer['status'], label: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-0.5 rounded-lg bg-[#182B1E] text-[#3DD68C] border border-[#234E32] font-bold text-[11px]">{label}</span>;
      case 'negotiating':
        return <span className="px-2 py-0.5 rounded-lg bg-[#2E2816] text-[#E5C365] border border-[#524420] font-bold text-[11px]">{label}</span>;
      case 'paused':
        return <span className="px-2 py-0.5 rounded-lg bg-[#2C201C] text-[#FF9E66] border border-[#543026] font-bold text-[11px]">{label}</span>;
      case 'exhausted':
        return <span className="px-2 py-0.5 rounded-lg bg-[#2D1A1E] text-[#FF7A7A] border border-[#54242C] font-bold text-[11px]">{label}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="p-4 rounded-2xl bg-[#16161F] border border-[#262638] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7E92]" />
            <input
              type="text"
              placeholder="جستجو در نام کارگاه، شهر، مدل یا کد پیشنهاد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#101017] border border-[#2A2A3C] text-xs text-[#EDEDED] placeholder-[#66667A] focus:outline-none focus:border-[#C8A951]"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#101017] border border-[#2A2A3C] text-xs text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال و آماده تولید</option>
            <option value="negotiating">در حال مذاکره</option>
            <option value="paused">موقتاً متوقف‌شده</option>
            <option value="exhausted">تکمیل ظرفیت</option>
          </select>
        </div>

        <button
          onClick={onOpenNewOfferModal}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#141416] text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>ثبت پیشنهاد ظرفیت تولید جدید</span>
        </button>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOffers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#16161F] border border-[#262638] text-[#808092] space-y-2">
            <Factory className="w-10 h-10 mx-auto text-[#48485C]" />
            <p className="font-semibold text-sm">هیچ پیشنهاد ظرفیت تولیدی با این مشخصات یافت نشد.</p>
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="p-4 rounded-2xl bg-[#16161F] border border-[#262638] hover:border-[#383850] transition-all space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#232332]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#20202E] text-[#C8A951] border border-[#2F2F44]">
                    {offer.offerCode}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-1.5">
                      <Factory className="w-3.5 h-3.5 text-[#3DD68C]" />
                      {offer.supplierName}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-[#808096] mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C8A951]" />
                        {offer.supplierCityFa}
                      </span>
                      <span>•</span>
                      <span>گرید اعتباری: {offer.supplierGrade}</span>
                      <span>•</span>
                      <span className="font-mono text-[#EDEDED]">مهلت: {offer.validUntil}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {getStatusBadge(offer.status, offer.statusFa)}

                  <select
                    value={offer.status}
                    onChange={(e) => onUpdateStatus(offer.id, e.target.value as any)}
                    className="px-2 py-1 rounded-lg bg-[#111118] border border-[#2C2C3E] text-[11px] text-[#EDEDED] focus:outline-none focus:border-[#C8A951]"
                  >
                    <option value="active">فعال</option>
                    <option value="negotiating">مذاکره</option>
                    <option value="paused">توقف موقت</option>
                    <option value="exhausted">تکمیل ظرفیت</option>
                  </select>
                </div>
              </div>

              {/* Offer Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3 rounded-xl bg-[#111118] border border-[#20202E] text-xs">
                <div>
                  <span className="text-[10px] text-[#707084] block">مدل اختصاص‌یافته:</span>
                  <span className="font-bold text-[#EDEDED] truncate block text-[11px]" title={offer.productTitleFa}>
                    {offer.productTitleFa}
                  </span>
                  <span className="font-mono text-[10px] text-[#C8A951]">{offer.productSkuCode}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#707084] block">ظرفیت هفتگی کارگاه:</span>
                  <span className="font-mono font-bold text-[#E5C365] text-xs flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    {offer.weeklyCapacityGrams.toLocaleString()} گرم
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#707084] block">حداقل سفارش (MOQ):</span>
                  <span className="font-mono font-bold text-[#EDEDED] text-xs">
                    {offer.minOrderQuantityGrams.toLocaleString()} گرم
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#707084] block">اجرت پیشنهادی ساخت:</span>
                  <span className="font-mono font-bold text-[#3DD68C] text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {offer.offeredWageDisplay}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#707084] block">زمان تحویل هر پارت:</span>
                  <span className="font-mono font-bold text-[#EDEDED] text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#64B5F6]" />
                    {offer.leadTimeDays} روز کاری
                  </span>
                </div>
              </div>

              {/* Guarantees and Notes */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#868698] pt-1">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[#3DD68C]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    تضمین عیارسنجی رسمی ری‌گیری
                  </span>
                  <span>•</span>
                  <span>کسری مجاز ساخت: {offer.lossScrapAllowancePercent}٪</span>
                </div>

                {offer.notes && (
                  <p className="text-[10px] text-[#A0A0B2] truncate max-w-md">
                    {offer.notes}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
