/**
 * Didar Gold Platform - Kernel Domain K10
 * DispatchModal: Packaging, Tamper-Evident Sealing, and Escort Dispatch
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Truck,
  Package,
  Barcode,
  CheckCircle2,
  AlertCircle,
  Lock,
  FileText
} from 'lucide-react';
import { Order, FulfillmentMethod } from '../../types/k10.js';

interface DispatchModalProps {
  order: Order | null;
  mode: 'pack_seal' | 'dispatch';
  isOpen: boolean;
  onClose: () => void;
  onConfirmPackSeal: (orderId: string, sealSerial: string, notes?: string) => Promise<void>;
  onConfirmDispatch: (
    orderId: string,
    carrierInfo: { waybill: string; method: FulfillmentMethod; escortOfficerNameFa: string }
  ) => Promise<void>;
}

export const DispatchModal: React.FC<DispatchModalProps> = ({
  order,
  mode,
  isOpen,
  onClose,
  onConfirmPackSeal,
  onConfirmDispatch
}) => {
  const [sealSerial, setSealSerial] = useState(
    order?.securitySealSerial || `DID-SEAL-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [waybill, setWaybill] = useState(
    order?.waybillNumber || `WB-1403-${order?.channel === 'agent_assisted' ? 'AGT' : 'SEC'}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [method, setMethod] = useState<FulfillmentMethod>(order?.fulfillmentMethod || 'armored_escort');
  const [escortOfficer, setEscortOfficer] = useState(
    order?.agentNameFa || 'سرگرد م. شریفی (سرپرست ترابری مسلح)'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (order) {
      setSealSerial(order.securitySealSerial || `DID-SEAL-${Math.floor(100000 + Math.random() * 900000)}`);
      setWaybill(order.waybillNumber || `WB-1403-${order.channel === 'agent_assisted' ? 'AGT' : 'SEC'}-${Math.floor(100 + Math.random() * 900)}`);
      setMethod(order.fulfillmentMethod || 'armored_escort');
      setEscortOfficer(order.agentNameFa || 'سرگرد م. شریفی (سرپرست ترابری مسلح)');
    }
  }, [order?.id, order?.securitySealSerial, order?.waybillNumber]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      setIsSubmitting(true);
      if (mode === 'pack_seal') {
        if (!sealSerial.trim()) {
          setErrorMsg('شماره سریال پلمپ امنیتی الزامی است.');
          return;
        }
        await onConfirmPackSeal(order.id, sealSerial, notes);
      } else {
        if (!waybill.trim()) {
          setErrorMsg('شماره بارنامه امنیتی الزامی است.');
          return;
        }
        await onConfirmDispatch(order.id, {
          waybill,
          method,
          escortOfficerNameFa: escortOfficer
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در ثبت عملیات لجستیک');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-[#161622] text-[#EDEDED] rounded-2xl shadow-2xl border border-[#28283C] overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#28283C] bg-[#151520] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold">
              {mode === 'pack_seal' ? <Lock className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {mode === 'pack_seal' ? 'پلمپ امنیتی بسته طلا (Pack & Seal)' : 'خروج از خزانه و بارگیری تحت اسکورت (Dispatch)'}
              </h2>
              <p className="text-xs text-[#A0A0B5]">
                سفارش: <span className="font-mono font-bold text-[#E5C365]">{order.orderCode}</span> | {order.retailerNameFa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A0A0B5] hover:text-white rounded-lg hover:bg-[#191926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-[#E5484D]/15 border border-[#E5484D]/30 text-[#FF6B6B] rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF6B6B] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'pack_seal' ? (
            <>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3.5 text-xs text-purple-200">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-purple-300">
                  <Shield className="w-4 h-4 text-purple-400" />
                  قوانین الصاق پلمپ امنیتی دیدار (Tamper-Evident Seal)
                </p>
                <p className="text-[11px] leading-relaxed text-purple-200/80">
                  کلیه محموله‌های طلا باید در پاکت‌های ضدنفوذ هولوگرام‌دار ممهور به شناسه یکتا بسته‌بندی شده و وزن بسته پیش از خروج با دقت صدم گرم ثبت گردد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                  شماره سریال پلمپ امنیتی ضدسرقت:
                </label>
                <input
                  type="text"
                  value={sealSerial}
                  onChange={e => setSealSerial(e.target.value)}
                  placeholder="مثال: DID-SEAL-882190"
                  className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg font-mono focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                  توضیحات و گزارش بازرسی حراست:
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="اقلام با لیست فیزیکی مطابقت داده شد، بدون خط و خش..."
                  className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-200">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-cyan-300">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  صورت‌جلسه خروج محموله طلا از خزانه مرکزی
                </p>
                <p className="text-[11px] leading-relaxed text-cyan-200/80">
                  وزن کل محموله: <strong className="text-white">{order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams} گرم</strong>. خروج تحت نظارت حراست کل ثبت و بارنامه صادر می‌گردد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                  شماره بارنامه حمل امنیتی (Waybill Number):
                </label>
                <input
                  type="text"
                  value={waybill}
                  onChange={e => setWaybill(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg font-mono focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                  روش انتقال و ناوگان:
                </label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as FulfillmentMethod)}
                  className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:ring-1 focus:ring-[#C8A951]"
                >
                  <option value="armored_escort" className="bg-[#191926]">حمل زمینی با خودرو زرهی و اسکورت مسلح</option>
                  <option value="agent_counter_handover" className="bg-[#191926]">تحویل حضوری توسط ویزیتور میدانی دیدار</option>
                  <option value="vault_pickup" className="bg-[#191926]">تحویل حضوری نماینده خریدار در باجه ترخیص خزانه</option>
                  <option value="secure_air_courier" className="bg-[#191926]">پست هوایی بیمه‌شده مسکوکات و طلا</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A0A0B5] mb-1">
                  مأمور تحویل / سرپرست اسکورت زرهی:
                </label>
                <input
                  type="text"
                  value={escortOfficer}
                  onChange={e => setEscortOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#191926] border border-[#28283C] text-[#EDEDED] rounded-lg focus:ring-1 focus:ring-[#C8A951]"
                />
              </div>
            </>
          )}

          <div className="pt-3 border-t border-[#28283C] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#A0A0B5] hover:text-white border border-[#28283C] hover:bg-[#191926] rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? 'در حال پردازش...'
                : mode === 'pack_seal'
                ? 'تأیید پلمپ امنیتی'
                : 'تأیید خروج و اعزام اسکورت'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
