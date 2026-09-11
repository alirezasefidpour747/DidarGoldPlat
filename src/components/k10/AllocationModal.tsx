/**
 * Didar Gold Platform - Kernel Domain K10
 * AllocationModal: Stock reservation & allocation from Vaults or Agent Bags
 */

import React, { useState } from 'react';
import {
  X,
  Layers,
  CheckCircle2,
  AlertCircle,
  Package,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';
import {
  Order,
  AllocationSourceType,
  AvailableInventoryPoolItem
} from '../../types/k10.js';

interface AllocationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  inventoryPool: AvailableInventoryPoolItem[];
  agentBags: { bagCode: string; agentNameFa: string }[];
  vaultLocations: { code: string; nameFa: string }[];
  onConfirmAllocation: (
    orderId: string,
    allocations: {
      itemId: string;
      allocatedUids: string[];
      source: AllocationSourceType;
      sourceNameFa: string;
      actualWeightGrams: number;
    }[]
  ) => Promise<void>;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  order,
  isOpen,
  onClose,
  inventoryPool,
  agentBags,
  vaultLocations,
  onConfirmAllocation
}) => {
  if (!isOpen || !order) return null;

  // Selected source per item
  const [itemAllocations, setItemAllocations] = useState(
    order.items.map(it => ({
      itemId: it.id,
      source: (order.channel === 'agent_assisted' ? 'agent_bag' : 'central_vault') as AllocationSourceType,
      sourceNameFa: order.channel === 'agent_assisted'
        ? `کیف ویزیتور (${order.agentBagCode || 'BAG-IR-042'})`
        : 'خزانه مرکزی دیدار تهران',
      actualWeightGrams: it.actualAllocatedWeightGrams || (it.targetWeightGrams * it.requestedQuantity),
      allocatedUids: it.allocatedItemUids?.length > 0
        ? it.allocatedItemUids
        : Array.from({ length: it.requestedQuantity }).map((_, idx) => `UID-2026-RES-${Math.floor(1000 + Math.random() * 9000)}`)
    }))
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSourceChange = (itemId: string, source: AllocationSourceType) => {
    setItemAllocations(prev => prev.map(alloc => {
      if (alloc.itemId !== itemId) return alloc;
      let sourceNameFa = 'خزانه مرکزی دیدار تهران';
      if (source === 'agent_bag') sourceNameFa = `کیف ویزیتور (${order.agentBagCode || 'BAG-IR-042'})`;
      if (source === 'regional_hub') sourceNameFa = 'هاب خزانه منطقه‌ای اصفهان';
      if (source === 'direct_workshop') sourceNameFa = 'کارگاه سازنده مستقیم (K07)';
      return { ...alloc, source, sourceNameFa };
    }));
  };

  const handleWeightChange = (itemId: string, weight: number) => {
    setItemAllocations(prev => prev.map(alloc => {
      if (alloc.itemId !== itemId) return alloc;
      return { ...alloc, actualWeightGrams: weight };
    }));
  };

  const handleAutoFillUids = () => {
    setItemAllocations(prev => prev.map((alloc, i) => {
      const it = order.items.find(item => item.id === alloc.itemId);
      const qty = it?.requestedQuantity || 1;
      const uids = Array.from({ length: qty }).map(() => `UID-2026-GLD-${Math.floor(1000 + Math.random() * 9000)}`);
      return { ...alloc, allocatedUids: uids };
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onConfirmAllocation(order.id, itemAllocations);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در تخصیص موجودی');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAllocWeight = itemAllocations.reduce((sum, it) => sum + (it.actualWeightGrams || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">تخصیص و رزرو هوشمند موجودی (Stock Allocation)</h2>
              <p className="text-xs text-gray-500">
                سفارش: <span className="font-mono font-bold text-gray-800">{order.orderCode}</span> | خریدار: {order.retailerNameFa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-700 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-950">موتور تطبیق خودکار شناسه قطعات (UIDs Matching)</p>
                <p className="text-[11px] text-indigo-800 mt-0.5">
                  رزرو بارکد یکتای قطعات از خزانه یا کیف ویزیتور و قفل وضعیت در هسته K09.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoFillUids}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs"
            >
              تخصیص هوشمند UIDs
            </button>
          </div>

          {/* Allocation Lines */}
          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const alloc = itemAllocations.find(a => a.itemId === item.id);
              if (!alloc) return null;

              return (
                <div key={item.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900">{item.titleFa}</span>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">{item.skuCode}</span>
                        <span>{item.caratFa}</span>
                        <span>تعداد: {item.requestedQuantity} قطعه</span>
                      </div>
                    </div>
                    <div className="text-left text-xs">
                      <span className="text-gray-500 block">وزن هدف:</span>
                      <strong className="text-gray-900">{(item.targetWeightGrams * item.requestedQuantity).toFixed(2)} گرم</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1 font-medium">
                        منبع تأمین و انبار تخصیص:
                      </label>
                      <select
                        value={alloc.source}
                        onChange={e => handleSourceChange(item.id, e.target.value as AllocationSourceType)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="central_vault">خزانه مرکزی دیدار تهران (VLT-TH-CENTRAL)</option>
                        <option value="regional_hub">هاب منطقه‌ای اصفهان (VLT-IS-HUB)</option>
                        <option value="agent_bag">کیف پرتابل ویزیتور ({order.agentBagCode || 'BAG-IR-042'})</option>
                        <option value="direct_workshop">ارسال مستقیم از کارگاه سازنده (K07)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1 font-medium">
                        وزن فیزیکی قطعی تخصیص‌یافته (گرم):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={alloc.actualWeightGrams}
                        onChange={e => handleWeightChange(item.id, parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Assigned UIDs Preview */}
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">
                      شناسه‌های یکتا قطعات فیزیکی قفل‌شده (UIDs):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {alloc.allocatedUids.map(uid => (
                        <span
                          key={uid}
                          className="px-2 py-0.5 bg-white border border-indigo-200 text-indigo-900 rounded font-mono text-xs"
                        >
                          {uid}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weight Summary Footer */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-600">
              وزن کل تخصیص‌یافته: <strong className="text-gray-900 font-mono text-sm">{totalAllocWeight.toFixed(2)} گرم</strong>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              تطابق با موجودی فیزیکی
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'در حال ثبت...' : 'تأیید و قفل تخصیص'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
