/**
 * Didar Gold Platform - Domain K08: New Shipment Intake Modal
 * Registers consignment and intake parcels before physical verification
 */

import React, { useState } from 'react';
import { X, PackagePlus, Truck, Scale, ShieldAlert, FileText, Building2 } from 'lucide-react';
import { IntakeType } from '../../types/k08.js';
import { SupplierPartnership } from '../../types/k07.js';

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  suppliers: SupplierPartnership[];
}

export const NewShipmentModal: React.FC<NewShipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  suppliers
}) => {
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [intakeType, setIntakeType] = useState<IntakeType>(IntakeType.CONSIGNMENT);
  const [declaredWeightGrams, setDeclaredWeightGrams] = useState<number>(500);
  const [declaredPiecesCount, setDeclaredPiecesCount] = useState<number>(20);
  const [declaredFineness, setDeclaredFineness] = useState<number>(750);
  const [carrierName, setCarrierName] = useState('شرکت حمل و ترابری امنیتی پارس طلا');
  const [deliveryAgentName, setDeliveryAgentName] = useState('حمیدرضا شمس‌الدین');
  const [deliveryAgentNationalId, setDeliveryAgentNationalId] = useState('0074839201');
  const [waybillTrackingNumber, setWaybillTrackingNumber] = useState('WB-2026-9041');
  const [sealedSecurityBagSerial, setSealedSecurityBagSerial] = useState('BAG-SEC-8821');
  const [description, setDescription] = useState('محموله پالت زیورآلات طلای ۱۸ عیار النگو و زنجیر بدون سنگ');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (declaredWeightGrams <= 0) {
      setError('وزن اعلامی باید بزرگتر از صفر باشد.');
      return;
    }
    if (declaredPiecesCount <= 0) {
      setError('تعداد اقلام اعلامی نامعتبر است.');
      return;
    }

    try {
      setSubmitting(true);
      const selectedSup = suppliers.find(s => s.id === supplierId);
      await onSubmit({
        supplierId: supplierId || (suppliers[0] ? suppliers[0].id : 'SUP-MAN-01'),
        supplierNameFa: selectedSup ? selectedSup.companyNameFa : 'تأمین‌کننده مستقل زرگری',
        intakeType,
        declaredWeightGrams,
        declaredPiecesCount,
        declaredFineness,
        carrierName,
        deliveryAgentName,
        deliveryAgentNationalId,
        waybillTrackingNumber,
        sealedSecurityBagSerial,
        description,
        actorName: 'افسر پذیرش خزانه دیدار'
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'خطا در ثبت محموله ورودی');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#181820] border border-[#2F2F3D] rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A38] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 border border-[#C8A951]/30 flex items-center justify-center text-[#E5C365]">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F4F6]">ثبت محموله ورودی جدید (پذیرش تأمین)</h2>
              <p className="text-xs text-[#9E9EA8]">دریافت فیزیکی بسته امنیتی و صدور بارنامه پذیرش اولیه خزانه</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888898] hover:text-[#F4F4F6] hover:bg-[#252533] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#E5484D]/10 border border-[#E5484D]/30 text-xs text-[#FF8B8E] flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#CECED8] mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C8A951]" />
                شریک تأمین‌کننده (K07)
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              >
                {suppliers.length > 0 ? (
                  suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.companyNameFa} ({sup.partnershipType === 'consignment' ? 'امانی' : 'سازنده'})
                    </option>
                  ))
                ) : (
                  <option value="SUP-MAN-01">سازندگی طلای پارس نور (امانی)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#CECED8] mb-1.5">
                نوع پذیرش فیزیکی
              </label>
              <select
                value={intakeType}
                onChange={(e) => setIntakeType(e.target.value as IntakeType)}
                className="w-full px-3 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none"
              >
                <option value={IntakeType.CONSIGNMENT}>تأمین امانی سازنده (Consignment)</option>
                <option value={IntakeType.OUTRIGHT_PURCHASE}>خرید قطعی شمش/آبشده (Outright Purchase)</option>
                <option value={IntakeType.MELTING_BAR}>شمش آبشده ری‌گری جهت تولید</option>
                <option value={IntakeType.REPAIR_RETURN}>برگشت از تعمیرات یا تغییر وزن</option>
              </select>
            </div>
          </div>

          {/* Declared Quantities */}
          <div className="p-3.5 rounded-xl bg-[#13131A] border border-[#252533] space-y-3">
            <h3 className="text-xs font-bold text-[#E5C365] flex items-center gap-2">
              <Scale className="w-3.5 h-3.5" />
              مقادیر و اوزان اعلامی در فاکتور بارنامه تأمین‌کننده
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  وزن کل اعلامی (گرم)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={declaredWeightGrams}
                  onChange={(e) => setDeclaredWeightGrams(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] font-mono focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  تعداد اقلام فیزیکی (قطعه)
                </label>
                <input
                  type="number"
                  required
                  value={declaredPiecesCount}
                  onChange={(e) => setDeclaredPiecesCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] font-mono focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  عیار اسمی اظهارشده
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={declaredFineness}
                  onChange={(e) => setDeclaredFineness(parseFloat(e.target.value) || 750)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] font-mono focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
                <span className="text-[10px] text-[#78788C]">استاندارد طلای ۱۸ عیار: ۷۵۰</span>
              </div>
            </div>
          </div>

          {/* Transport & Courier Info */}
          <div className="p-3.5 rounded-xl bg-[#13131A] border border-[#252533] space-y-3">
            <h3 className="text-xs font-bold text-[#3DD68C] flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" />
              اطلاعات حامل امنیتی و پلمب محموله
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  شرکت حامل ترابری
                </label>
                <input
                  type="text"
                  required
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  شماره بارنامه ترابری
                </label>
                <input
                  type="text"
                  required
                  value={waybillTrackingNumber}
                  onChange={(e) => setWaybillTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] font-mono focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  نام پیک / مأمور تحویل‌دهنده
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAgentName}
                  onChange={(e) => setDeliveryAgentName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] focus:border-[#C8A951] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#A6A6B8] mb-1">
                  سریال پلمب کیسه امنیتی
                </label>
                <input
                  type="text"
                  required
                  value={sealedSecurityBagSerial}
                  onChange={(e) => setSealedSecurityBagSerial(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1B1B24] border border-[#303040] rounded-xl text-xs text-[#F4F4F6] font-mono focus:border-[#C8A951] focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#CECED8] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#C8A951]" />
              شرح محموله و اقلام
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] focus:border-[#C8A951] focus:outline-none resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A2A38]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED] hover:bg-[#20202A] rounded-xl transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-xl shadow-lg shadow-[#C8A951]/20 transition-all flex items-center gap-2"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت محموله و ورود به فرآیند توزین'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
