/**
 * Didar Gold Platform - Kernel Domain K10
 * DispatchModal: Packaging, Tamper-Evident Sealing, and Escort Dispatch
 */

import React, { useState } from 'react';
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
  if (!isOpen || !order) return null;

  const [sealSerial, setSealSerial] = useState(
    order.securitySealSerial || `DID-SEAL-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [waybill, setWaybill] = useState(
    order.waybillNumber || `WB-1403-${order.channel === 'agent_assisted' ? 'AGT' : 'SEC'}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [method, setMethod] = useState<FulfillmentMethod>(order.fulfillmentMethod || 'armored_escort');
  const [escortOfficer, setEscortOfficer] = useState(
    order.agentNameFa || 'سرگرد م. شریفی (سرپرست ترابری مسلح)'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-right my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold ${
              mode === 'pack_seal' ? 'bg-purple-600' : 'bg-cyan-700'
            }`}>
              {mode === 'pack_seal' ? <Lock className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {mode === 'pack_seal' ? 'پلمپ امنیتی بسته طلا (Pack & Seal)' : 'خروج از خزانه و بارگیری تحت اسکورت (Dispatch)'}
              </h2>
              <p className="text-xs text-gray-500">
                سفارش: <span className="font-mono font-bold text-gray-800">{order.orderCode}</span> | {order.retailerNameFa}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {mode === 'pack_seal' ? (
            <>
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 text-xs text-purple-900">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-700" />
                  قوانین الصاق پلمپ امنیتی دیدار (Tamper-Evident Seal)
                </p>
                <p className="text-[11px] leading-relaxed text-purple-800">
                  کلیه محموله‌های طلا باید در پاکت‌های ضدنفوذ هولوگرام‌دار ممهور به شناسه یکتا بسته‌بندی شده و وزن بسته پیش از خروج با دقت صدم گرم ثبت گردد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  شماره سریال پلمپ امنیتی ضدسرقت:
                </label>
                <input
                  type="text"
                  value={sealSerial}
                  onChange={e => setSealSerial(e.target.value)}
                  placeholder="مثال: DID-SEAL-882190"
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  توضیحات و گزارش بازرسی حراست:
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="اقلام با لیست فیزیکی مطابقت داده شد، بدون خط و خش..."
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-cyan-50/70 border border-cyan-200 rounded-xl p-3.5 text-xs text-cyan-900">
                <p className="font-bold mb-1 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-cyan-700" />
                  صورت‌جلسه خروج محموله طلا از خزانه مرکزی
                </p>
                <p className="text-[11px] leading-relaxed text-cyan-800">
                  وزن کل محموله: <strong>{order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams} گرم</strong>. خروج تحت نظارت حراست کل ثبت و بارنامه صادر می‌گردد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  شماره بارنامه حمل امنیتی (Waybill Number):
                </label>
                <input
                  type="text"
                  value={waybill}
                  onChange={e => setWaybill(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg font-mono focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  روش انتقال و ناوگان:
                </label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value as FulfillmentMethod)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
                >
                  <option value="armored_escort">حمل زمینی با خودرو زرهی و اسکورت مسلح</option>
                  <option value="agent_counter_handover">تحویل حضوری توسط ویزیتور میدانی دیدار</option>
                  <option value="vault_pickup">تحویل حضوری نماینده خریدار در باجه ترخیص خزانه</option>
                  <option value="secure_air_courier">پست هوایی بیمه‌شده مسکوکات و طلا</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  مأمور تحویل / سرپرست اسکورت زرهی:
                </label>
                <input
                  type="text"
                  value={escortOfficer}
                  onChange={e => setEscortOfficer(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600"
                />
              </div>
            </>
          )}

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
              className={`px-5 py-2 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                mode === 'pack_seal'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-cyan-700 hover:bg-cyan-800'
              }`}
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
