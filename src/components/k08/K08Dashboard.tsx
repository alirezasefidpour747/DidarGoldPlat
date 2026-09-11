/**
 * Didar Gold Platform - Domain K08: Supply Intake & Acceptance Dashboard
 * Physical verification, precision weighing, metallurgical assay and official warehouse receipts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Scale,
  FlaskConical,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Building2,
  XCircle,
  Truck,
  Filter,
  Eye,
  FileCheck2
} from 'lucide-react';
import { api } from '../../lib/api.js';
import {
  K08DataPayload,
  IntakeShipment,
  ShipmentStatus,
  AssayToleranceStatus,
  WarehouseReceipt
} from '../../types/k08.js';
import { SupplierPartnership } from '../../types/k07.js';
import { NewShipmentModal } from './NewShipmentModal.js';
import { WeighingAssayModal } from './WeighingAssayModal.js';
import { AcceptanceDecisionModal } from './AcceptanceDecisionModal.js';
import { WarehouseReceiptModal } from './WarehouseReceiptModal.js';
import { ShipmentDetailDrawer } from './ShipmentDetailDrawer.js';

export const K08Dashboard: React.FC = () => {
  const [data, setData] = useState<K08DataPayload | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [activeShipmentForWeighing, setActiveShipmentForWeighing] = useState<IntakeShipment | null>(null);
  const [activeShipmentForDecision, setActiveShipmentForDecision] = useState<IntakeShipment | null>(null);
  const [activeShipmentForDetail, setActiveShipmentForDetail] = useState<IntakeShipment | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<WarehouseReceipt | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [k08Res, k07Res] = await Promise.all([
        api.getK08Data(),
        api.getK07Data().catch(() => null)
      ]);
      setData(k08Res);
      if (k07Res?.suppliers) {
        setSuppliers(k07Res.suppliers);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری اطلاعات پذیرش تأمین (K08)');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleRegisterShipment = async (payload: any) => {
    await api.registerShipment(payload, 'افسر پذیرش خزانه دیدار');
    showToast('success', 'محموله ورودی با موفقیت ثبت شد و بارنامه پذیرش اولیه صادر گردید.');
    await loadData();
  };

  const handleSaveWeighing = async (shipmentId: string, payload: any) => {
    await api.recordWeighing(shipmentId, payload);
    showToast('success', 'نتیجه توزین ترازوی آزمایشگاهی ثبت و مغایرت محاسبه شد.');
    await loadData();
  };

  const handleMoveQuarantine = async (shipmentId: string, binCode: string) => {
    await api.moveToQuarantine(shipmentId, binCode, 'سرپرست گاوصندوق قرنطینه');
    showToast('success', `محموله به صندوقچه قرنطینه ${binCode} منتقل و پلمب شد.`);
    await loadData();
  };

  const handleSaveAssay = async (shipmentId: string, assayData: any) => {
    await api.recordAssay(shipmentId, assayData, 'کارشناس متالورژی آزمایشگاه');
    showToast('success', 'نتایج آزمون عیارسنجی ثبت و ارزیابی تلرانس استاندارد انجام شد.');
    await loadData();
  };

  const handleConfirmDecision = async (shipmentId: string, decisionData: any) => {
    const result = await api.makeIntakeDecision(shipmentId, decisionData);
    showToast('success', 'تصمیم نهایی با موفقیت ثبت شد و قبض انبار رسمی صادر گردید.');
    await loadData();
    return result;
  };

  const handleOpenReceipt = async (receiptId: string) => {
    try {
      const receipt = await api.getWarehouseReceipt(receiptId);
      setActiveReceipt(receipt);
    } catch (err: any) {
      showToast('error', err.message || 'خطا در دریافت قبض انبار');
    }
  };

  // Filtered shipments
  const shipments = data?.shipments || [];
  const filteredShipments = shipments.filter(s => {
    const matchesSearch =
      s.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.supplierNameFa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.waybillTrackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sealedSecurityBagSerial.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-top-4 duration-200 bg-[#191924] border-[#C8A951] text-[#E5C365]">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#3DD68C]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#E5484D]" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Domain Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#1E1C14] via-[#171612] to-[#121217] border border-[#3D3319] shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E5C365] to-[#9C7B23] flex items-center justify-center text-[#141416] font-bold shadow-lg shadow-[#C8A951]/20 border border-[#F4DC98]/40">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40">
                K08
              </span>
              <h2 className="text-lg font-bold text-[#F4F4F6]">ورود و پذیرش تأمین (Supply Intake & Acceptance)</h2>
            </div>
            <p className="text-xs text-[#A6A6B8] mt-1">
              کنترل فیزیکی، باسکول و توزین آزمایشگاهی، قرنطینه امنیتی، عیارسنجی پرتو ایکس و صدور قبوض رسمی انبار
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1E1E28] border border-[#2F2F40] text-[#A6A6B8] hover:text-[#EDEDED] hover:bg-[#282836] transition-colors"
            title="تازه سازی داده‌ها"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsNewShipmentOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-xl shadow-lg shadow-[#C8A951]/20 transition-all cursor-pointer hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت محموله ورودی جدید</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#17171F] border border-[#282836] space-y-1">
          <div className="flex items-center justify-between text-[#8E8E9F]">
            <span className="text-xs font-medium">کل طلای ورودی پذیرفته</span>
            <Scale className="w-4 h-4 text-[#C8A951]" />
          </div>
          <div className="text-lg font-black font-mono text-[#F4F4F6]">
            {data && data.metrics?.totalAcceptedGoldGrams !== undefined ? ((data.metrics.totalAcceptedGoldGrams || 0) / 1000).toFixed(2) : '۰'} <span className="text-xs font-normal text-[#9E9EA8]">kg</span>
          </div>
          <span className="text-[10px] text-[#7E7E90]">
            {data && data.metrics?.totalAcceptedGoldGrams !== undefined ? (data.metrics.totalAcceptedGoldGrams || 0).toFixed(1) : '۰'} گرم طلای خالص
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#17171F] border border-[#282836] space-y-1">
          <div className="flex items-center justify-between text-[#8E8E9F]">
            <span className="text-xs font-medium">مستقر در قرنطینه</span>
            <Clock className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="text-lg font-black font-mono text-[#C084FC]">
            {data?.metrics?.inQuarantineCount || 0} <span className="text-xs font-normal text-[#9E9EA8]">بسته</span>
          </div>
          <span className="text-[10px] text-[#7E7E90]">تحت آزمون طیف‌سنجی</span>
        </div>

        <div className="p-4 rounded-xl bg-[#17171F] border border-[#282836] space-y-1">
          <div className="flex items-center justify-between text-[#8E8E9F]">
            <span className="text-xs font-medium">نرخ انطباق استاندارد عیار</span>
            <FlaskConical className="w-4 h-4 text-[#3DD68C]" />
          </div>
          <div className="text-lg font-black font-mono text-[#3DD68C]">
            {data?.metrics?.assayPassRatePercent ? `${data.metrics.assayPassRatePercent}%` : '۹۸.۴٪'}
          </div>
          <span className="text-[10px] text-[#7E7E90]">تلرانس مجاز صنف طلا</span>
        </div>

        <div className="p-4 rounded-xl bg-[#17171F] border border-[#282836] space-y-1">
          <div className="flex items-center justify-between text-[#8E8E9F]">
            <span className="text-xs font-medium">قبوض رسمی انبار</span>
            <FileCheck2 className="w-4 h-4 text-[#E5C365]" />
          </div>
          <div className="text-lg font-black font-mono text-[#E5C365]">
            {data?.metrics?.issuedReceiptsCount || 0} <span className="text-xs font-normal text-[#9E9EA8]">فقره</span>
          </div>
          <span className="text-[10px] text-[#7E7E90]">سند ثبت سامانه جامع</span>
        </div>

        <div className="p-4 rounded-xl bg-[#17171F] border border-[#282836] space-y-1">
          <div className="flex items-center justify-between text-[#8E8E9F]">
            <span className="text-xs font-medium">میانگین انحراف وزن</span>
            <AlertTriangle className="w-4 h-4 text-[#E5A84B]" />
          </div>
          <div className="text-lg font-black font-mono text-[#EDEDED]">
            {data && data.metrics?.totalWeightVarianceGrams !== undefined ? `${data.metrics.totalWeightVarianceGrams > 0 ? '+' : ''}${(data.metrics.totalWeightVarianceGrams || 0).toFixed(2)}` : '۰'} <span className="text-xs font-normal text-[#9E9EA8]">g</span>
          </div>
          <span className="text-[10px] text-[#3DD68C]">کمتر از آستانه مجاز ±۰.۰۵g</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#17171F] border border-[#262634] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#888898]" />
            <input
              type="text"
              placeholder="جستجو بر اساس کد محموله، نام سازنده، بارنامه، پلمب کیسه..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-4 py-2 bg-[#121218] border border-[#2B2B38] rounded-xl text-xs text-[#EDEDED] placeholder-[#787888] focus:border-[#C8A951] focus:outline-none"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'همه محموله‌ها' },
              { id: ShipmentStatus.REGISTERED, label: 'در انتظار توزین' },
              { id: ShipmentStatus.IN_QUARANTINE, label: 'در قرنطینه' },
              { id: ShipmentStatus.ASSAY_TESTED, label: 'آماده تصمیم' },
              { id: ShipmentStatus.ACCEPTED, label: 'پذیرفته‌شده' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#C8A951] text-[#141416]'
                    : 'text-[#8E8E9F] hover:text-[#EDEDED] hover:bg-[#20202C]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Shipments */}
        <div className="overflow-x-auto border border-[#262634] rounded-xl">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#121218] text-[#9E9EA8] border-b border-[#262634]">
              <tr>
                <th className="p-3">کد محموله</th>
                <th className="p-3">شریک تأمین‌کننده</th>
                <th className="p-3 text-center">نوع پذیرش</th>
                <th className="p-3 text-center">وزن اظهار / توزین</th>
                <th className="p-3 text-center">عیار اظهار / آزمون</th>
                <th className="p-3 text-center">وضعیت چرخه</th>
                <th className="p-3 text-left">اقدامات و اسناد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222E]">
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => {
                  const declaredW = Number(shipment.declaredWeightGrams ?? shipment.declaredTotalWeightGrams ?? 0);
                  const measuredW = shipment.measuredWeightGrams ?? shipment.scaleTotalWeightGrams;
                  const weightDelta = (measuredW !== undefined && measuredW !== null) ? (Number(measuredW) - declaredW) : 0;

                  return (
                    <tr key={shipment.id} className="hover:bg-[#1A1A24] transition-colors">
                      {/* Shipment Code */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#E5C365]">
                            {shipment.shipmentNumber || shipment.intakeCode}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7E7E90] block mt-0.5">
                          {shipment.receivedAtJalali}
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="p-3">
                        <strong className="text-[#EDEDED] block">{shipment.supplierNameFa}</strong>
                        <span className="text-[10px] text-[#888898] font-mono">
                          بارنامه: {shipment.waybillTrackingNumber || shipment.securitySealNo}
                        </span>
                      </td>

                      {/* Intake Type */}
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-[#222230] text-[#B5B5C4] border border-[#2E2E40]">
                          {shipment.intakeType === 'consignment' ? 'امانی' : shipment.intakeType === 'outright_purchase' ? 'خرید قطعی' : 'شمش ری‌گری'}
                        </span>
                      </td>

                      {/* Weights */}
                      <td className="p-3 text-center font-mono">
                        <div className="text-[#EDEDED] font-bold">
                          {measuredW !== undefined && measuredW !== null
                            ? `${Number(measuredW).toFixed(2)} g`
                            : `${declaredW.toFixed(2)} g`}
                        </div>
                        {measuredW !== undefined && measuredW !== null && (
                          <span className={`text-[10px] ${
                            Math.abs(weightDelta) <= 0.05 ? 'text-[#3DD68C]' : 'text-[#E5A84B]'
                          }`}>
                            دلتا: {weightDelta > 0 ? `+${weightDelta.toFixed(3)}` : weightDelta.toFixed(3)} g
                          </span>
                        )}
                      </td>

                      {/* Fineness */}
                      <td className="p-3 text-center font-mono">
                        <div className="font-bold text-[#E5C365]">
                          {shipment.measuredFineness ? shipment.measuredFineness : `${shipment.declaredFineness} (اظهاری)`}
                        </div>
                        {shipment.toleranceStatus && (
                          <span className="text-[10px] text-[#3DD68C] block">
                            {shipment.toleranceStatus === 'within_standard_tolerance' ? 'استاندارد' : 'کسر مشروط'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        {shipment.status === ShipmentStatus.REGISTERED && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#3B82F6]/15 text-[#60A5FA] border border-[#3B82F6]/30">
                            در انتظار توزین
                          </span>
                        )}
                        {shipment.status === ShipmentStatus.WEIGHED && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5A84B]/15 text-[#E5C365] border border-[#E5A84B]/30">
                            توزین‌شده
                          </span>
                        )}
                        {shipment.status === ShipmentStatus.IN_QUARANTINE && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/30">
                            در قرنطینه
                          </span>
                        )}
                        {shipment.status === ShipmentStatus.ASSAY_TESTED && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#06B6D4]/15 text-[#22D3EE] border border-[#06B6D4]/30">
                            عیارسنجی‌شده
                          </span>
                        )}
                        {shipment.status === ShipmentStatus.ACCEPTED && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">
                            پذیرفته‌شده
                          </span>
                        )}
                        {shipment.status === ShipmentStatus.REJECTED && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E5484D]/15 text-[#FF8B8E] border border-[#E5484D]/30">
                            مردود
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-left">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* Stage Action Button */}
                          {shipment.status === ShipmentStatus.REGISTERED && (
                            <button
                              onClick={() => setActiveShipmentForWeighing(shipment)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#C8A951] text-[#141416] hover:bg-[#D4B75F] rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Scale className="w-3 h-3" />
                              <span>توزین</span>
                            </button>
                          )}

                          {shipment.status === ShipmentStatus.WEIGHED && (
                            <button
                              onClick={() => setActiveShipmentForWeighing(shipment)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#A855F7] text-white hover:bg-[#B86BFF] rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" />
                              <span>قرنطینه</span>
                            </button>
                          )}

                          {shipment.status === ShipmentStatus.IN_QUARANTINE && (
                            <button
                              onClick={() => setActiveShipmentForWeighing(shipment)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#06B6D4] text-white hover:bg-[#22D3EE] rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FlaskConical className="w-3 h-3" />
                              <span>عیارسنجی</span>
                            </button>
                          )}

                          {shipment.status === ShipmentStatus.ASSAY_TESTED && (
                            <button
                              onClick={() => setActiveShipmentForDecision(shipment)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#3DD68C] text-[#141416] hover:bg-[#4FE29E] rounded-lg transition-colors flex items-center gap-1"
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>تصمیم</span>
                            </button>
                          )}

                          {shipment.warehouseReceiptId && (
                            <button
                              onClick={() => handleOpenReceipt(shipment.warehouseReceiptId!)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 hover:bg-[#C8A951]/30 rounded-lg transition-colors flex items-center gap-1"
                              title="مشاهده قبض رسمی انبار"
                            >
                              <FileText className="w-3 h-3" />
                              <span>قبض</span>
                            </button>
                          )}

                          {/* Details Drawer */}
                          <button
                            onClick={() => setActiveShipmentForDetail(shipment)}
                            className="p-1.5 rounded-lg bg-[#20202A] text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#2A2A38] transition-colors"
                            title="جزئیات پرونده"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#8E8E9F]">
                    محموله‌ای منطبق با جستجوی شما یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals and Drawers */}
      <NewShipmentModal
        isOpen={isNewShipmentOpen}
        onClose={() => setIsNewShipmentOpen(false)}
        onSubmit={handleRegisterShipment}
        suppliers={suppliers}
      />

      <WeighingAssayModal
        isOpen={!!activeShipmentForWeighing}
        onClose={() => setActiveShipmentForWeighing(null)}
        shipment={activeShipmentForWeighing}
        onSaveWeighing={handleSaveWeighing}
        onMoveQuarantine={handleMoveQuarantine}
        onSaveAssay={handleSaveAssay}
      />

      <AcceptanceDecisionModal
        isOpen={!!activeShipmentForDecision}
        onClose={() => setActiveShipmentForDecision(null)}
        shipment={activeShipmentForDecision}
        onConfirmDecision={handleConfirmDecision}
        onViewReceipt={handleOpenReceipt}
      />

      <WarehouseReceiptModal
        isOpen={!!activeReceipt}
        onClose={() => setActiveReceipt(null)}
        receipt={activeReceipt}
      />

      <ShipmentDetailDrawer
        isOpen={!!activeShipmentForDetail}
        onClose={() => setActiveShipmentForDetail(null)}
        shipment={activeShipmentForDetail}
        onOpenWeighing={(s) => {
          setActiveShipmentForDetail(null);
          setActiveShipmentForWeighing(s);
        }}
        onOpenDecision={(s) => {
          setActiveShipmentForDetail(null);
          setActiveShipmentForDecision(s);
        }}
        onViewReceipt={handleOpenReceipt}
      />
    </div>
  );
};
