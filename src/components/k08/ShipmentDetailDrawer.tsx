/**
 * Didar Gold Platform - Domain K08: Shipment Detail Drawer
 * Deep inspection of individual intake shipments, timeline audit and stage actions
 */

import React from 'react';
import {
  X,
  Package,
  Scale,
  FlaskConical,
  ShieldCheck,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { IntakeShipment, ShipmentStatus, AssayToleranceStatus } from '../../types/k08.js';

interface ShipmentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: IntakeShipment | null;
  onOpenWeighing: (shipment: IntakeShipment) => void;
  onOpenDecision: (shipment: IntakeShipment) => void;
  onViewReceipt: (receiptId: string) => void;
}

export const ShipmentDetailDrawer: React.FC<ShipmentDetailDrawerProps> = ({
  isOpen,
  onClose,
  shipment,
  onOpenWeighing,
  onOpenDecision,
  onViewReceipt
}) => {
  if (!isOpen || !shipment) return null;

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.REGISTERED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">ثبت‌شده / در انتظار توزین</span>;
      case ShipmentStatus.WEIGHED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#E5A84B]/15 text-[#E5C365] border border-[#E5A84B]/30">توزین‌شده / در انتظار قرنطینه</span>;
      case ShipmentStatus.IN_QUARANTINE:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/30">در گاوصندوق قرنطینه</span>;
      case ShipmentStatus.ASSAY_TESTED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30">عیارسنجی انجام شد</span>;
      case ShipmentStatus.ACCEPTED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">پذیرش رسمی در خزانه</span>;
      case ShipmentStatus.REJECTED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-[#E5484D]/15 text-[#FF8B8E] border border-[#E5484D]/30">مردود و عودت</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#16161E] border-r border-[#2B2B3A] w-full max-w-xl h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#262634] mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm px-2.5 py-0.5 rounded-lg bg-[#C8A951]/20 text-[#E5C365] font-bold">
                  {shipment.shipmentNumber}
                </span>
                <h2 className="text-base font-bold text-[#F4F4F6]">جزئیات پرونده پذیرش تأمین</h2>
              </div>
              <p className="text-xs text-[#9E9EA8] mt-1">تأمین‌کننده: {shipment.supplierNameFa}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#888898] hover:text-[#F4F4F6] hover:bg-[#252533] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status & Quick Action Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1D1D28] border border-[#2F2F42] mb-5">
            <div>
              <span className="text-[11px] text-[#888898] block mb-1">مرحله فعلی در زنجیره پذیرش:</span>
              {getStatusBadge(shipment.status)}
            </div>

            <div className="flex items-center gap-2">
              {shipment.status === ShipmentStatus.REGISTERED && (
                <button
                  onClick={() => onOpenWeighing(shipment)}
                  className="px-3 py-1.5 rounded-lg bg-[#C8A951] text-[#141416] text-xs font-bold hover:bg-[#D4B75F] flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>انجام توزین</span>
                </button>
              )}

              {shipment.status === ShipmentStatus.WEIGHED && (
                <button
                  onClick={() => onOpenWeighing(shipment)}
                  className="px-3 py-1.5 rounded-lg bg-[#A855F7] text-white text-xs font-bold hover:bg-[#B666FF] flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>ورود به قرنطینه</span>
                </button>
              )}

              {shipment.status === ShipmentStatus.IN_QUARANTINE && (
                <button
                  onClick={() => onOpenWeighing(shipment)}
                  className="px-3 py-1.5 rounded-lg bg-[#06B6D4] text-white text-xs font-bold hover:bg-[#22D3EE] flex items-center gap-1.5"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>ثبت عیارسنجی</span>
                </button>
              )}

              {shipment.status === ShipmentStatus.ASSAY_TESTED && (
                <button
                  onClick={() => onOpenDecision(shipment)}
                  className="px-3 py-1.5 rounded-lg bg-[#3DD68C] text-[#141416] text-xs font-bold hover:bg-[#4FE29E] flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>تصمیم نهایی پذیرش</span>
                </button>
              )}

              {shipment.warehouseReceiptId && (
                <button
                  onClick={() => onViewReceipt(shipment.warehouseReceiptId!)}
                  className="px-3 py-1.5 rounded-lg bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 text-xs font-bold hover:bg-[#C8A951]/30 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>قبض انبار</span>
                </button>
              )}
            </div>
          </div>

          {/* Measurements Comparison Grid */}
          <div className="space-y-4 mb-5">
            <h3 className="text-xs font-bold text-[#E5C365] flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              تطبیق اظهارنامه تأمین‌کننده با ارزیابی آزمایشگاه
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#121218] border border-[#252533]">
                <span className="text-[11px] text-[#888898] block">وزن اعلامی فاکتور:</span>
                <span className="text-sm font-mono font-bold text-[#EDEDED] mt-0.5 block">
                  {Number(shipment.declaredWeightGrams ?? shipment.declaredTotalWeightGrams ?? 0).toFixed(2)} g
                </span>
                <span className="text-[10px] text-[#6E6E80]">{shipment.declaredPiecesCount ?? shipment.totalPieces ?? 0} قطعه اظهارشده</span>
              </div>

              <div className="p-3 rounded-xl bg-[#121218] border border-[#252533]">
                <span className="text-[11px] text-[#888898] block">وزن ترازوی آزمایشگاه:</span>
                <span className="text-sm font-mono font-bold text-[#3DD68C] mt-0.5 block">
                  {(shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams) !== undefined && (shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams) !== null
                    ? `${Number(shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams).toFixed(3)} g`
                    : 'در انتظار توزین'}
                </span>
                {(shipment.weightDiscrepancyGrams !== undefined || shipment.weightDeltaGrams !== undefined) && (
                  <span className={`text-[10px] font-mono ${
                    Math.abs(Number(shipment.weightDiscrepancyGrams ?? shipment.weightDeltaGrams ?? 0)) <= 0.05 ? 'text-[#3DD68C]' : 'text-[#E5A84B]'
                  }`}>
                    مغایرت: {Number(shipment.weightDiscrepancyGrams ?? shipment.weightDeltaGrams ?? 0) > 0 ? `+${Number(shipment.weightDiscrepancyGrams ?? shipment.weightDeltaGrams ?? 0).toFixed(3)}` : Number(shipment.weightDiscrepancyGrams ?? shipment.weightDeltaGrams ?? 0).toFixed(3)} g
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-[#121218] border border-[#252533]">
                <span className="text-[11px] text-[#888898] block">عیار اسمی فاکتور:</span>
                <span className="text-sm font-mono font-bold text-[#EDEDED] mt-0.5 block">
                  {shipment.declaredFineness} (۱۸ عیار)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#121218] border border-[#252533]">
                <span className="text-[11px] text-[#888898] block">عیار آزمون طیف‌سنجی:</span>
                <span className="text-sm font-mono font-bold text-[#E5C365] mt-0.5 block">
                  {shipment.measuredFineness || 'در انتظار آزمون'}
                </span>
                {shipment.finenessDiscrepancy !== undefined && (
                  <span className={`text-[10px] font-mono ${
                    shipment.finenessDiscrepancy >= 0 ? 'text-[#3DD68C]' : 'text-[#E5484D]'
                  }`}>
                    اختلاف عیار: {shipment.finenessDiscrepancy > 0 ? `+${shipment.finenessDiscrepancy}` : shipment.finenessDiscrepancy}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Transport & Quarantine Details */}
          <div className="p-3.5 rounded-xl bg-[#121218] border border-[#252533] space-y-2.5 mb-5 text-xs">
            <h4 className="font-bold text-[#CECED8] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#C8A951]" />
              مشخصات حامل و زنجیره حفاظتی
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[#9E9EA8]">
              <div>شرکت ترابری: <strong className="text-[#EDEDED]">{shipment.carrierName}</strong></div>
              <div>پیک تحویل‌دهنده: <strong className="text-[#EDEDED]">{shipment.deliveryAgentName}</strong></div>
              <div>شماره بارنامه: <strong className="text-[#EDEDED] font-mono">{shipment.waybillTrackingNumber}</strong></div>
              <div>سریال پلمب کیسه: <strong className="text-[#EDEDED] font-mono">{shipment.sealedSecurityBagSerial}</strong></div>
              {shipment.quarantineBinCode && (
                <div className="col-span-2 text-[#C084FC]">
                  صندوقچه قرنطینه: <strong className="font-mono">{shipment.quarantineBinCode}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Acceptance / Audit Trail */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#CECED8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C8A951]" />
              تاریخچه و امضاهای دیجیتال زنجیره تأمین
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#14141B] border border-[#22222E] flex items-center justify-between">
                <div>
                  <strong className="text-[#EDEDED] block">ثبت اولیه ورود محموله</strong>
                  <span className="text-[11px] text-[#7E7E90]">{shipment.receivedAtJalali}</span>
                </div>
                <span className="text-[#3DD68C] text-[11px]">پذیرفته‌شده در گیت ورودی</span>
              </div>

              {shipment.weighingOfficer && (
                <div className="p-2.5 rounded-lg bg-[#14141B] border border-[#22222E] flex items-center justify-between">
                  <div>
                    <strong className="text-[#EDEDED] block">توزین دقیق آزمایشگاهی</strong>
                    <span className="text-[11px] text-[#7E7E90]">افسر: {shipment.weighingOfficer}</span>
                  </div>
                  <span className="font-mono text-[#3DD68C] text-[11px]">
                    {Number(shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams ?? 0).toFixed(3)} g
                  </span>
                </div>
              )}

              {shipment.vaultLocationFa && (
                <div className="p-2.5 rounded-lg bg-[#14141B] border border-[#22222E] flex items-center justify-between">
                  <div>
                    <strong className="text-[#EDEDED] block">استقرار قطعی در خزانه</strong>
                    <span className="text-[11px] text-[#7E7E90]">{shipment.vaultLocationFa}</span>
                  </div>
                  <span className="text-[#C8A951] text-[11px] font-bold">پذیرفته‌شده</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#262634] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#A6A6B8] hover:text-[#EDEDED] bg-[#1E1E28] rounded-xl transition-colors"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
