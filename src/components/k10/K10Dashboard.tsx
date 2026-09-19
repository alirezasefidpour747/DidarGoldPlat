/**
 * Didar Gold Platform - Kernel Domain K10 Dashboard
 * Orders, Allocation & Fulfillment (سفارش، تخصیص و ایفای سفارش)
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  ShieldCheck,
  Layers,
  Scale,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Lock,
  ArrowUpRight,
  Sparkles,
  MapPin,
  Barcode,
  TrendingUp,
  UserCheck,
  ChevronDown
} from 'lucide-react';
import {
  Order,
  OrderStatus,
  OrderChannel,
  K10DataPayload,
  ProofOfDelivery,
  AllocationSourceType,
  FulfillmentMethod
} from '../../types/k10.js';
import { api } from '../../lib/api.js';
import { OrderDetailDrawer } from './OrderDetailDrawer.js';
import { NewOrderModal } from './NewOrderModal.js';
import { AllocationModal } from './AllocationModal.js';
import { DispatchModal } from './DispatchModal.js';
import { PodVerificationModal } from './PodVerificationModal.js';

type K10SubTab = 'orders' | 'allocation' | 'fulfillment' | 'pod';

export const K10Dashboard: React.FC = () => {
  const [data, setData] = useState<K10DataPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<K10SubTab>('orders');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Modals & Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [dispatchModalState, setDispatchModalState] = useState<{
    isOpen: boolean;
    mode: 'pack_seal' | 'dispatch';
    order: Order | null;
  }>({ isOpen: false, mode: 'pack_seal', order: null });
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);

  // Load Data
  const loadK10Data = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const payload = await api.getK10Data();
      setData(payload);
      if (selectedOrder) {
        const refreshed = payload.orders.find(o => o.id === selectedOrder.id);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با هسته K10');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadK10Data();
  }, []);

  // Handler: Create Order
  const handleCreateOrder = async (orderData: Partial<Order>) => {
    await api.createOrder(orderData);
    await loadK10Data();
  };

  // Handler: Allocate Stock
  const handleConfirmAllocation = async (
    orderId: string,
    allocations: {
      itemId: string;
      allocatedUids: string[];
      source: AllocationSourceType;
      sourceNameFa: string;
      actualWeightGrams: number;
    }[]
  ) => {
    await api.allocateOrderStock(orderId, allocations);
    await loadK10Data();
  };

  // Handler: Pack & Seal
  const handleConfirmPackSeal = async (orderId: string, sealSerial: string, notes?: string) => {
    await api.packAndSealOrder(orderId, sealSerial, notes);
    await loadK10Data();
  };

  // Handler: Dispatch
  const handleConfirmDispatch = async (
    orderId: string,
    carrierInfo: { waybill: string; method: FulfillmentMethod; escortOfficerNameFa: string }
  ) => {
    await api.dispatchOrder(orderId, carrierInfo);
    await loadK10Data();
  };

  // Handler: POD
  const handleConfirmPod = async (orderId: string, podData: Partial<ProofOfDelivery>) => {
    await api.verifyOrderPod(orderId, podData);
    await loadK10Data();
  };

  // Handler: Cancel Order
  const handleCancelOrder = async (order: Order) => {
    if (!window.confirm(`آیا از لغو سفارش ${order.orderCode} اطمینان دارید؟`)) return;
    await api.cancelOrder(order.id, 'درخواست انصراف کاربر');
    await loadK10Data();
  };

  // Filtered Orders
  const orders = data?.orders || [];
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.retailerNameFa.includes(searchTerm) ||
      order.retailerCityFa.includes(searchTerm) ||
      (order.securitySealSerial && order.securitySealSerial.includes(searchTerm)) ||
      (order.waybillNumber && order.waybillNumber.includes(searchTerm)) ||
      order.items.some(i => i.titleFa.includes(searchTerm) || i.skuCode.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || order.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'در انتظار تخصیص', bg: 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/30' };
      case 'credit_approved':
        return { label: 'تأیید مالی', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
      case 'allocated':
        return { label: 'تخصیص‌یافته', bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' };
      case 'packed_sealed':
        return { label: 'پلمپ امنیتی', bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'dispatched':
        return { label: 'در مسیر حمل', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'delivered':
        return { label: 'تحویل قطعی (POD)', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'completed':
        return { label: 'تکمیل‌شده', bg: 'bg-[#28283C] text-[#EDEDED] border-[#3E3E58]' };
      case 'cancelled':
        return { label: 'لغوشده', bg: 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/30' };
      default:
        return { label: status, bg: 'bg-[#191926] text-[#A0A0B5] border-[#28283C]' };
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E15] text-[#EDEDED] pb-16 text-right" dir="rtl">
      
      {/* Top Header */}
      <div className="border-b border-[#28283C] bg-[#151520] shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C8A951] to-[#997B2E] text-[#141416] flex items-center justify-center font-bold text-lg shadow-sm border border-[#E5C365]/40">
                K10
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">سفارش، تخصیص و ایفای سفارش</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    فعال و عملیاتی
                  </span>
                </div>
                <p className="text-xs text-[#A0A0B5] mt-0.5">
                  سفارش مستقیم و با ویزیتور، تخصیص از خزانه و کیف، پلمپ ضدجعل و اثبات تحویل فیزیکی (POD)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadK10Data}
                disabled={isLoading}
                className="p-2 text-[#A0A0B5] hover:text-white bg-[#191926] border border-[#28283C] rounded-lg hover:bg-[#222234] transition-colors shadow-xs"
                title="به‌روزرسانی اطلاعات"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#C8A951]' : ''}`} />
              </button>

              <button
                onClick={() => setIsNewOrderModalOpen(true)}
                className="px-4 py-2 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                ثبت سفارش جدید طلا (New B2B Order)
              </button>
            </div>

          </div>

          {/* Sub-Tabs Bar */}
          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-[#28283C] overflow-x-auto">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-[#C8A951] text-[#141416] shadow-xs'
                  : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
              }`}
            >
              <Package className="w-4 h-4" />
              صف سفارشات و رهگیری چرخه ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('allocation')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'allocation'
                  ? 'bg-[#C8A951] text-[#141416] shadow-xs'
                  : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
              }`}
            >
              <Layers className="w-4 h-4" />
              میز تخصیص و رزرو هوشمند موجودی
              {data?.metrics.pendingAllocationCount ? (
                <span className="bg-[#141416] text-[#E5C365] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {data.metrics.pendingAllocationCount}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab('fulfillment')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'fulfillment'
                  ? 'bg-[#C8A951] text-[#141416] shadow-xs'
                  : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
              }`}
            >
              <Truck className="w-4 h-4" />
              بسته‌بندی، پلمپ و اعزام اسکورت
            </button>

            <button
              onClick={() => setActiveTab('pod')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'pod'
                  ? 'bg-[#C8A951] text-[#141416] shadow-xs'
                  : 'text-[#A0A0B5] hover:text-white hover:bg-[#191926]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              دفتر اسناد اثبات تحویل (POD Ledger)
            </button>
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">

        {/* Operational Metrics Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3.5 shadow-xs">
              <span className="text-[#A0A0B5] text-xs block mb-1">سفارشات فعال در جریان:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-white">{data.metrics.activeOrdersCount}</span>
                <span className="text-[11px] text-[#828299]">از {data.metrics.totalOrdersCount} کل</span>
              </div>
            </div>

            <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3.5 shadow-xs">
              <span className="text-[#A0A0B5] text-xs block mb-1">طلای در مسیر حمل (زرهی):</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-cyan-400">{data.metrics.inTransitGoldGrams}</span>
                <span className="text-[11px] text-cyan-400/80 font-semibold">گرم طلا</span>
              </div>
            </div>

            <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3.5 shadow-xs">
              <span className="text-[#A0A0B5] text-xs block mb-1">تحویل امروز با سند POD:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-emerald-400">{data.metrics.todayFulfilledGoldGrams}</span>
                <span className="text-[11px] text-emerald-400/80 font-semibold">گرم ({data.metrics.todayFulfilledOrdersCount} پلمپ)</span>
              </div>
            </div>

            <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3.5 shadow-xs">
              <span className="text-[#A0A0B5] text-xs block mb-1">کسری و انتظار تخصیص:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono text-[#E5C365]">{data.metrics.totalPendingAllocationGrams}</span>
                <span className="text-[11px] text-[#C8A951] font-semibold">گرم ({data.metrics.pendingAllocationCount} سفارش)</span>
              </div>
            </div>

            <div className="bg-[#161622] border border-[#28283C] rounded-xl p-3.5 shadow-xs col-span-2 md:col-span-1">
              <span className="text-[#A0A0B5] text-xs block mb-1">ارزش کل گردش عمده‌فروشی:</span>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono text-white">
                  {(data.metrics.totalWholesaleValueToman / 1000000).toLocaleString('fa-IR')}
                </span>
                <span className="text-[11px] text-[#828299]">میلیون تومان</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Orders & Lifecycle Queue */}
        {activeTab === 'orders' && (
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl shadow-xs overflow-hidden">
            
            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-[#28283C] bg-[#151520] flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#828299] absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="جستجو با کد سفارش، خریدار، شهر، کالا یا پلمپ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-9 pl-3 py-1.5 text-xs bg-[#191926] border border-[#28283C] text-white rounded-lg focus:ring-1 focus:ring-[#C8A951] placeholder-[#828299]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#191926] border border-[#28283C] rounded-lg text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="submitted">در انتظار تخصیص</option>
                  <option value="allocated">تخصیص‌یافته</option>
                  <option value="packed_sealed">پلمپ امنیتی</option>
                  <option value="dispatched">در مسیر حمل</option>
                  <option value="delivered">تحویل قطعی (POD)</option>
                  <option value="cancelled">لغوشده</option>
                </select>

                <select
                  value={channelFilter}
                  onChange={e => setChannelFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#191926] border border-[#28283C] rounded-lg text-[#EDEDED] focus:ring-1 focus:ring-[#C8A951]"
                >
                  <option value="all">همه کانال‌ها</option>
                  <option value="direct_retailer">سفارش مستقیم پورتال</option>
                  <option value="agent_assisted">سفارش میدانی با ویزیتور</option>
                  <option value="phone_trade_desk">سفارش میز معامله دیدار</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#151520] border-b border-[#28283C] text-[#A0A0B5] font-semibold">
                  <tr>
                    <th className="px-4 py-3">شناسه سفارش</th>
                    <th className="px-4 py-3">خریدار و شهر</th>
                    <th className="px-4 py-3">کانال و تحویل</th>
                    <th className="px-4 py-3">اقلام و عیار</th>
                    <th className="px-4 py-3">وزن طلا (گرم)</th>
                    <th className="px-4 py-3">مبلغ فاکتور</th>
                    <th className="px-4 py-3">پلمپ / بارنامه</th>
                    <th className="px-4 py-3">وضعیت</th>
                    <th className="px-4 py-3 text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#28283C]">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#828299]">
                        سفارشی با معیارهای انتخاب‌شده یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const badge = getStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-[#C8A951]/5 transition-colors">
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-white block">{order.orderCode}</span>
                            <span className="text-[11px] text-[#828299] font-mono">{order.orderDateFa}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-white block">{order.retailerNameFa}</span>
                            <span className="text-[11px] text-[#A0A0B5]">{order.retailerCityFa}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-[#EDEDED] font-medium block">{order.channelFa}</span>
                            <span className="text-[11px] text-[#828299]">{order.fulfillmentMethodFa}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-wrap gap-1">
                              {order.items.map(it => (
                                <span
                                  key={it.id}
                                  className="text-[10px] bg-[#C8A951]/15 text-[#E5C365] px-1.5 py-0.5 rounded border border-[#C8A951]/30"
                                >
                                  {it.caratFa}
                                </span>
                              ))}
                            </div>
                            <span className="text-[11px] text-[#828299] mt-1 block">
                              {order.items.length} ردیف ({order.totalPiecesCount} قطعه)
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono font-bold text-white block">
                              {(order.totalActualAllocatedWeightGrams || order.totalEstimatedWeightGrams).toFixed(2)}
                            </span>
                            <span className="text-[11px] text-[#828299]">معادل ۷۵۰: {order.pureGoldEquivalentGrams.toFixed(2)}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-bold text-white block">
                              {order.grandTotalToman.toLocaleString('fa-IR')}
                            </span>
                            <span className="text-[10px] text-[#A0A0B5]">{order.paymentTermFa}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-[11px]">
                            {order.securitySealSerial ? (
                              <span className="text-purple-300 bg-purple-500/15 px-1.5 py-0.5 rounded border border-purple-500/30 block">
                                {order.securitySealSerial}
                              </span>
                            ) : (
                              <span className="text-[#828299]">—</span>
                            )}
                            {order.waybillNumber && (
                              <span className="text-cyan-300 bg-cyan-500/15 px-1.5 py-0.5 rounded border border-cyan-500/30 block mt-1">
                                {order.waybillNumber}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setIsDetailDrawerOpen(true);
                                }}
                                className="p-1.5 text-[#A0A0B5] hover:text-[#E5C365] hover:bg-[#191926] rounded-md transition-colors"
                                title="مشاهده جزئیات سفارش"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {['submitted', 'partially_allocated'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsAllocationModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded text-[11px] font-bold"
                                >
                                  تخصیص
                                </button>
                              )}

                              {order.status === 'allocated' && (
                                <button
                                  onClick={() => {
                                    setDispatchModalState({ isOpen: true, mode: 'pack_seal', order });
                                  }}
                                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold"
                                >
                                  پلمپ
                                </button>
                              )}

                              {order.status === 'packed_sealed' && (
                                <button
                                  onClick={() => {
                                    setDispatchModalState({ isOpen: true, mode: 'dispatch', order });
                                  }}
                                  className="px-2 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[11px] font-semibold"
                                >
                                  خروج
                                </button>
                              )}

                              {order.status === 'dispatched' && (
                                <button
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    setIsPodModalOpen(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                                >
                                  ثبت POD
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* Tab 2: Stock Allocation Matrix */}
        {activeTab === 'allocation' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Pending Orders */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    صف سفارشات نیازمند تخصیص موجودی
                  </h3>
                  <span className="text-xs bg-[#C8A951]/15 text-[#E5C365] px-2.5 py-0.5 rounded-full border border-[#C8A951]/30">
                    {orders.filter(o => ['submitted', 'partially_allocated'].includes(o.status)).length} سفارش منتظر
                  </span>
                </div>

                <div className="space-y-3">
                  {orders.filter(o => ['submitted', 'partially_allocated'].includes(o.status)).map(ord => (
                    <div key={ord.id} className="p-4 bg-[#191926] rounded-xl border border-[#28283C] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">{ord.orderCode}</span>
                          <span className="text-xs text-[#A0A0B5]">({ord.retailerNameFa})</span>
                        </div>
                        <p className="text-xs text-[#828299] mt-1">
                          وزن اقلام: <strong className="text-[#EDEDED]">{ord.totalEstimatedWeightGrams} گرم</strong> | کانال: {ord.channelFa}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsAllocationModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#C8A951] hover:bg-[#D9B961] text-[#141416] rounded-lg text-xs font-bold shadow-xs transition-colors"
                      >
                        ورود به میز تخصیص
                      </button>
                    </div>
                  ))}

                  {orders.filter(o => ['submitted', 'partially_allocated'].includes(o.status)).length === 0 && (
                    <div className="py-8 text-center text-[#828299] text-xs">
                      تمامی سفارشات جاری موجودی فیزیکی دریافت کرده‌اند.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Vault & Bag Stock Summary */}
            <div className="space-y-4">
              <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#E5C365]" />
                  موجودی خزانه‌ها و کیف‌های ویزیتوری
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#A0A0B5] block mb-1 font-semibold">خزانه‌های رسمی:</span>
                    {data.vaultLocations.map(vlt => (
                      <div key={vlt.id} className="p-2.5 bg-[#191926] rounded-lg border border-[#28283C] mb-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#EDEDED]">{vlt.nameFa}</span>
                          <span className="block text-[11px] font-mono text-[#828299]">{vlt.code}</span>
                        </div>
                        <span className="font-mono font-bold text-[#E5C365]">
                          {vlt.totalGoldWeightGrams.toLocaleString('fa-IR')} گرم
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-[#28283C]">
                    <span className="text-[#A0A0B5] block mb-1 font-semibold">کیف‌های میدانی ویزیتورها:</span>
                    {data.agentBags.map(bag => (
                      <div key={bag.id} className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 mb-2 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-blue-300">{bag.bagCode}</span>
                          <span className="block text-[11px] text-blue-400">{bag.agentNameFa}</span>
                        </div>
                        <div className="text-left font-mono">
                          <span className="font-bold text-blue-200 block">{bag.currentWeightGrams} گرم</span>
                          <span className="text-[10px] text-blue-400">{bag.piecesCount} قطعه</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Fulfillment & Dispatch Logistics */}
        {activeTab === 'fulfillment' && data && (
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#28283C] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  مدیریت پلمپ امنیتی و لجستیک ترابری
                </h3>
                <p className="text-xs text-[#A0A0B5] mt-0.5">
                  الصاق پلمپ‌های ضدسرقت هولوگرام‌دار و اعزام خودروهای زرهی حمل طلا
                </p>
              </div>
              <span className="text-xs bg-cyan-500/15 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/30 font-semibold">
                {orders.filter(o => ['allocated', 'packed_sealed', 'dispatched'].includes(o.status)).length} محموله در چرخه ترخیص
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.filter(o => ['allocated', 'packed_sealed', 'dispatched'].includes(o.status)).map(ord => (
                <div key={ord.id} className="p-4 bg-[#191926] rounded-xl border border-[#28283C] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{ord.orderCode}</span>
                      <p className="text-xs font-semibold text-[#A0A0B5] mt-0.5">{ord.retailerNameFa}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadge(ord.status).bg}`}>
                      {getStatusBadge(ord.status).label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-[#A0A0B5] bg-[#161622] p-3 rounded-lg border border-[#28283C]">
                    <div>
                      <span className="text-[#828299] block">روش حمل:</span>
                      <strong className="text-[#EDEDED]">{ord.fulfillmentMethodFa}</strong>
                    </div>
                    <div>
                      <span className="text-[#828299] block">وزن محموله:</span>
                      <strong className="text-[#EDEDED] font-mono">
                        {(ord.totalActualAllocatedWeightGrams || ord.totalEstimatedWeightGrams).toFixed(2)} گرم
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#828299] block">شماره پلمپ:</span>
                      <strong className="text-purple-300 font-mono">{ord.securitySealSerial || 'در انتظار الصاق'}</strong>
                    </div>
                    <div>
                      <span className="text-[#828299] block">شماره بارنامه:</span>
                      <strong className="text-cyan-300 font-mono">{ord.waybillNumber || 'در انتظار صدور'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs text-[#A0A0B5] hover:text-white border border-[#28283C] rounded-lg hover:bg-[#222234] transition-colors"
                    >
                      پرونده کامل
                    </button>

                    {ord.status === 'allocated' && (
                      <button
                        onClick={() => {
                          setDispatchModalState({ isOpen: true, mode: 'pack_seal', order: ord });
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        الصاق پلمپ امنیتی
                      </button>
                    )}

                    {ord.status === 'packed_sealed' && (
                      <button
                        onClick={() => {
                          setDispatchModalState({ isOpen: true, mode: 'dispatch', order: ord });
                        }}
                        className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        صدور بارنامه و اعزام
                      </button>
                    )}

                    {ord.status === 'dispatched' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setIsPodModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        ثبت تحویل POD
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Proof of Delivery (POD) Archive */}
        {activeTab === 'pod' && data && (
          <div className="bg-[#161622] border border-[#28283C] rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#28283C] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  دفتر اسناد و شواهد اثبات تحویل قطعی (POD Archive)
                </h3>
                <p className="text-xs text-[#A0A0B5] mt-0.5">
                  سوابق الکترونیک وزن‌سنجی مقصد، تأییدیه رمز OTP و امضای حقوقی تحویل‌گیرنده
                </p>
              </div>
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
                {orders.filter(o => o.pod).length} سند ثبت‌شده
              </span>
            </div>

            <div className="space-y-3">
              {orders.filter(o => o.pod).map(ord => {
                const pod = ord.pod!;
                return (
                  <div key={ord.id} className="p-4 bg-[#191926] rounded-xl border border-[#28283C] hover:border-emerald-500/40 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{ord.orderCode}</span>
                          <span className="font-semibold text-[#EDEDED]">{ord.retailerNameFa}</span>
                          <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {pod.verifiedAtFa}
                          </span>
                        </div>
                        <p className="text-xs text-[#A0A0B5] mt-1">
                          تحویل‌گیرنده: <strong className="text-white">{pod.recipientNameFa}</strong> ({pod.recipientRoleFa}) | مأمور: {pod.handoverOfficerNameFa}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div>
                          <span className="text-[#828299] block text-[10px]">وزن خروج:</span>
                          <span className="font-bold text-[#EDEDED]">{pod.scaleWeightAtDispatchGrams.toFixed(2)} گرم</span>
                        </div>
                        <div>
                          <span className="text-[#828299] block text-[10px]">وزن مقصد:</span>
                          <span className="font-bold text-[#EDEDED]">{pod.scaleWeightAtHandoverGrams.toFixed(2)} گرم</span>
                        </div>
                        <div>
                          <span className="text-[#828299] block text-[10px]">مغایرت:</span>
                          <span className="font-bold text-emerald-400">
                            {pod.weightDiscrepancyGrams === 0 ? '۰.۰۰' : pod.weightDiscrepancyGrams} گرم
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsDetailDrawerOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs bg-[#161622] border border-[#28283C] text-[#EDEDED] hover:bg-[#222234] rounded-lg transition-colors font-sans"
                        >
                          مشاهده سند POD
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Drawer: Order Detail */}
      <OrderDetailDrawer
        order={selectedOrder}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onOpenAllocate={ord => {
          setSelectedOrder(ord);
          setIsAllocationModalOpen(true);
        }}
        onOpenPackSeal={ord => {
          setDispatchModalState({ isOpen: true, mode: 'pack_seal', order: ord });
        }}
        onOpenDispatch={ord => {
          setDispatchModalState({ isOpen: true, mode: 'dispatch', order: ord });
        }}
        onOpenVerifyPod={ord => {
          setSelectedOrder(ord);
          setIsPodModalOpen(true);
        }}
        onCancelOrder={handleCancelOrder}
      />

      {/* Modal: New Order */}
      {data && (
        <NewOrderModal
          isOpen={isNewOrderModalOpen}
          onClose={() => setIsNewOrderModalOpen(false)}
          onSubmit={handleCreateOrder}
          supportedRetailers={data.supportedRetailers}
          agentBags={data.agentBags}
        />
      )}

      {/* Modal: Allocation */}
      {data && selectedOrder && (
        <AllocationModal
          order={selectedOrder}
          isOpen={isAllocationModalOpen}
          onClose={() => setIsAllocationModalOpen(false)}
          inventoryPool={data.inventoryPool}
          agentBags={data.agentBags}
          vaultLocations={data.vaultLocations}
          onConfirmAllocation={handleConfirmAllocation}
        />
      )}

      {/* Modal: Pack & Seal / Dispatch */}
      {dispatchModalState.order && (
        <DispatchModal
          order={dispatchModalState.order}
          mode={dispatchModalState.mode}
          isOpen={dispatchModalState.isOpen}
          onClose={() => setDispatchModalState({ isOpen: false, mode: 'pack_seal', order: null })}
          onConfirmPackSeal={handleConfirmPackSeal}
          onConfirmDispatch={handleConfirmDispatch}
        />
      )}

      {/* Modal: POD Verification */}
      {selectedOrder && (
        <PodVerificationModal
          order={selectedOrder}
          isOpen={isPodModalOpen}
          onClose={() => setIsPodModalOpen(false)}
          onConfirmPod={handleConfirmPod}
        />
      )}

    </div>
  );
};
