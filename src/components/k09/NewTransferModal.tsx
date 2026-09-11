/**
 * Didar Gold Platform - Kernel Domain K09
 * New Stock Transfer & Custody Handover Modal
 */

import React, { useState } from 'react';
import { StockTransfer, VaultLocation, AgentBag } from '../../types/k09.js';
import { X, ArrowRightLeft, Shield, Scale, Truck, AlertCircle } from 'lucide-react';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Partial<StockTransfer>) => Promise<void>;
  locations: VaultLocation[];
  bags: AgentBag[];
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  locations,
  bags
}) => {
  const [sourceType, setSourceType] = useState<'vault' | 'bag'>('vault');
  const [sourceLocationId, setSourceLocationId] = useState(locations[0]?.id || '');
  const [destinationType, setDestinationType] = useState<'vault' | 'bag'>('bag');
  const [destinationLocationId, setDestinationLocationId] = useState(bags[0]?.id || '');
  const [transferReasonFa, setTransferReasonFa] = useState('تجهیز شیفت میدانی ویزیتور با مصنوعات النگو و دستبند ۱۸ عیار');
  const [totalWeightGrams, setTotalWeightGrams] = useState<number>(1250.5);
  const [itemsCount, setItemsCount] = useState<number>(35);
  const [courierOrEscortNameFa, setCourierOrEscortNameFa] = useState('محمود سلطانی (مامور حراست و ترابری امن)');
  const [escortNationalIdMasked, setEscortNationalIdMasked] = useState('۰۴۵***۹۹۲۱');
  const [securitySealSerial, setSecuritySealSerial] = useState(`SEAL-SEC-${Math.floor(10000 + Math.random() * 90000)}`);
  const [notes, setNotes] = useState('پروتکل امنیتی دوامضایی رعایت شده و پلمپ در حضور نماینده حراست الصاق شد.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalWeightGrams || totalWeightGrams <= 0) {
      setError('وزن طلا باید عددی معتبر و بزرگتر از صفر باشد.');
      return;
    }
    if (!itemsCount || itemsCount <= 0) {
      setError('تعداد قطعات باید بزرگتر از صفر باشد.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const srcName =
        sourceType === 'vault'
          ? locations.find((l) => l.id === sourceLocationId)?.nameFa || 'خزانه مبدأ'
          : bags.find((b) => b.id === sourceLocationId)?.bagTitleFa || 'کیف مبدأ';

      const dstName =
        destinationType === 'vault'
          ? locations.find((l) => l.id === destinationLocationId)?.nameFa || 'خزانه مقصد'
          : bags.find((b) => b.id === destinationLocationId)?.bagTitleFa || 'کیف مقصد';

      await onSubmit({
        sourceType,
        sourceLocationId,
        sourceLocationNameFa: srcName,
        destinationType,
        destinationLocationId,
        destinationLocationNameFa: dstName,
        transferReasonFa,
        totalWeightGrams: Number(totalWeightGrams),
        itemsCount: Number(itemsCount),
        courierOrEscortNameFa,
        escortNationalIdMasked,
        securitySealSerial,
        notes
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت حواله انتقال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#181822] border border-[#2D2D3D] rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D3D] bg-[#14141C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#C8A951]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">صدور حواله انتقال فیزیکی طلا و تحویل امانت</h2>
              <p className="text-xs text-[#9E9EA8]">جابجایی امن بین خزانه‌ها، گاوصندوق‌ها و کیف‌های هوشمند ویزیتورها</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#767688] hover:text-white hover:bg-[#252533] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Source & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#12121A] border border-[#242434]">
            {/* Source */}
            <div className="space-y-2">
              <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                مبدأ جابجایی (تحویل‌دهنده)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('vault');
                    setSourceLocationId(locations[0]?.id || '');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition ${
                    sourceType === 'vault'
                      ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#C8A951] font-bold'
                      : 'bg-[#1C1C26] border-[#2E2E40] text-[#9E9EA8]'
                  }`}
                >
                  خزانه / انبار
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSourceType('bag');
                    setSourceLocationId(bags[0]?.id || '');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition ${
                    sourceType === 'bag'
                      ? 'bg-[#C8A951]/20 border-[#C8A951] text-[#C8A951] font-bold'
                      : 'bg-[#1C1C26] border-[#2E2E40] text-[#9E9EA8]'
                  }`}
                >
                  کیف ویزیتور
                </button>
              </div>

              {sourceType === 'vault' ? (
                <select
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A26] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nameFa} ({l.currentGoldWeightGrams.toLocaleString('fa-IR')} گرم)
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A26] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                >
                  {bags.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bagTitleFa} - {b.assignedAgentNameFa}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <span className="font-semibold text-[#EDEDED] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                مقصد جابجایی (تحویل‌گیرنده)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('bag');
                    setDestinationLocationId(bags[0]?.id || '');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition ${
                    destinationType === 'bag'
                      ? 'bg-[#3DD68C]/20 border-[#3DD68C] text-[#3DD68C] font-bold'
                      : 'bg-[#1C1C26] border-[#2E2E40] text-[#9E9EA8]'
                  }`}
                >
                  کیف ویزیتور
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDestinationType('vault');
                    setDestinationLocationId(locations[0]?.id || '');
                  }}
                  className={`flex-1 py-1 px-2 rounded-lg border text-center transition ${
                    destinationType === 'vault'
                      ? 'bg-[#3DD68C]/20 border-[#3DD68C] text-[#3DD68C] font-bold'
                      : 'bg-[#1C1C26] border-[#2E2E40] text-[#9E9EA8]'
                  }`}
                >
                  خزانه / انبار
                </button>
              </div>

              {destinationType === 'bag' ? (
                <select
                  value={destinationLocationId}
                  onChange={(e) => setDestinationLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A26] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                >
                  {bags.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bagTitleFa} - {b.assignedAgentNameFa}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={destinationLocationId}
                  onChange={(e) => setDestinationLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A1A26] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nameFa}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">علت و انگیزه جابجایی موجودی</label>
            <input
              type="text"
              value={transferReasonFa}
              onChange={(e) => setTransferReasonFa(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              placeholder="مثال: تجهیز و شارژ کیف ویزیتور بازار بزرگ با مصنوعات ۱۸ عیار"
            />
          </div>

          {/* Weight & Pieces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-[#C8A951]" />
                مجموع وزن طلای ارسالی (گرم)
              </label>
              <input
                type="number"
                step="0.01"
                value={totalWeightGrams}
                onChange={(e) => setTotalWeightGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#B5B5C2] mb-1 font-medium">تعداد قطعات فیزیکی طلا</label>
              <input
                type="number"
                value={itemsCount}
                onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          {/* Escort and Security Seal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#12121A] border border-[#242434]">
            <div>
              <label className="block text-[#B5B5C2] mb-1">نام مأمور حمل / اسکورت</label>
              <input
                type="text"
                value={courierOrEscortNameFa}
                onChange={(e) => setCourierOrEscortNameFa(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#B5B5C2] mb-1">کد ملی مأمور</label>
              <input
                type="text"
                value={escortNationalIdMasked}
                onChange={(e) => setEscortNationalIdMasked(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#EDEDED] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#B5B5C2] mb-1">شماره پلمپ امنیتی</label>
              <input
                type="text"
                value={securitySealSerial}
                onChange={(e) => setSecuritySealSerial(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#1A1A26] border border-[#2C2C3E] rounded-lg text-[#C8A951] font-mono focus:border-[#C8A951] focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#B5B5C2] mb-1 font-medium">ملاحظات و شروط تحویل امانت</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#12121A] border border-[#2C2C3E] rounded-xl text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#252533]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-[#20202C] hover:bg-[#2A2A3A] text-[#EDEDED] font-medium transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#C8A951] hover:bg-[#D8B961] text-[#14141A] font-bold transition shadow-lg flex items-center gap-2"
            >
              {submitting ? 'در حال صدور حواله...' : 'تأیید و صدور حواله ترانزیت طلا'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
