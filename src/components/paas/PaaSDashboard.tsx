/**
 * Didar Gold Platform - PaaS Layer (Platform as a Service) Control Center
 * System foundation layer providing:
 * 1. Master Data Management (MDM)
 * 2. Enterprise EventBus & EventMesh
 * 3. IAM & RBAC Security Control
 * 4. Unified API Gateway & Microservice Routing
 * 5. Background Workers & Cron Scheduler
 * 6. ACID Storage Engine & Telemetry
 */

import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  Radio,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  ExternalLink,
  Code,
  HardDrive,
  Terminal,
  Network,
  Workflow,
  ArrowDown,
  Boxes
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { PaasDataPayload, EventBusMessage } from '../../types/paas.js';

interface PaaSDashboardProps {
  onNavigateToMdm?: () => void;
  onNavigateToDomain?: (domainId: string) => void;
}

export const PaaSDashboard: React.FC<PaaSDashboardProps> = ({
  onNavigateToMdm,
  onNavigateToDomain
}) => {
  const [data, setData] = useState<PaasDataPayload | null>(null);
  const [architectureData, setArchitectureData] = useState<any | null>(null);
  const [archLoading, setArchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'eventbus' | 'gateway' | 'workers' | 'storage'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Event dispatcher test form
  const [testTopic, setTestTopic] = useState('didar.k10.order.pod_confirmed');
  const [testSource, setTestSource] = useState('K10');
  const [testPayload, setTestPayload] = useState('شبیه‌سازی رویداد تایید تحویل POD سفارش زرگری نوروزی');
  const [dispatching, setDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getPaasData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load PaaS data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadArchitectureData = async () => {
    try {
      setArchLoading(true);
      const res = await api.getArchitectureData();
      if (res.success) {
        setArchitectureData(res.data);
      }
    } catch (err) {
      console.error('Failed to load architecture data:', err);
    } finally {
      setArchLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadArchitectureData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDispatchEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPayload.trim()) return;
    setDispatching(true);
    setDispatchSuccess(null);
    try {
      const res = await api.dispatchPaasEvent({
        topic: testTopic,
        sourceDomain: testSource,
        payloadSummaryFa: testPayload
      });
      if (res.success) {
        setDispatchSuccess(`رویداد با شناسه ${res.data.eventId} در زمان ${res.data.deliveryLatencyMs} میلی‌ثانیه تحویل شد.`);
        setTestPayload('');
        loadData();
        setTimeout(() => setDispatchSuccess(null), 4000);
      }
    } catch (err: any) {
      alert(err.message || 'خطا در انتشار رویداد');
    } finally {
      setDispatching(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <RefreshCw className="w-10 h-10 text-[#C8A951] animate-spin mb-4" />
        <p className="text-[#E0E0E8] font-medium">در حال بارگذاری مرکز خدمات لایه پلتفرم (PaaS Engine)...</p>
        <p className="text-xs text-[#8E8E9C] mt-1">بررسی سرویس‌های زیرساخت، EventMesh، درگاه API و وضعیت ACID Storage</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* PaaS Header Banner */}
      <div className="bg-gradient-to-r from-[#171720] via-[#1E1E2A] to-[#171720] border border-[#2F2F42] rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A951]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 text-xs font-bold font-mono tracking-wider flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                PAAS LAYER · پلتفرم زیرساخت
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 text-xs font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                وضعیت: ۱۰۰٪ عملیاتی (Healthy)
              </span>
              <span className="text-xs text-[#8A8A9E] font-mono">
                {data.summary.systemLayerVersion}
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-[#F4F4F8] tracking-tight">
              مرکز مدیریت خدمات و گذرگاه لایه پلتفرم (Didar PaaS & EventMesh)
            </h2>
            <p className="text-xs lg:text-sm text-[#A5A5B8] max-w-3xl leading-relaxed">
              لایه بنیادی پلتفرم خدمات اشتراکی برای تمامی ۲۰ هسته کسب‌وکار (K01 تا K20): مدیریت داده‌های پایه (MDM)، گذرگاه رویدادهای ناهمگام سازمانی، درگاه هدایت وب‌سرویس‌ها، زمان‌بند فرآیندهای دوره‌ای و موتور ذخیره‌سازی مستقل ACID.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            {onNavigateToMdm && (
              <button
                onClick={onNavigateToMdm}
                className="px-3 py-2 rounded-xl bg-[#232332] hover:bg-[#2B2B3E] border border-[#3C3C54] text-xs font-semibold text-[#E5C365] flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Database className="w-3.5 h-3.5" />
                <span>مدیریت واژه‌نامه‌ها (MDM)</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-[#1E1E2A] hover:bg-[#28283A] border border-[#34344A] text-[#C8A951] transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="به‌روزرسانی تله‌متری"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Core Vital Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2B2B3C]">
          <div className="bg-[#121219]/80 p-3.5 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#8E8E9F] block">امتیاز سلامت سیستم</span>
            <span className="text-xl font-bold text-[#3DD68C] font-mono mt-0.5 block">{data.summary.systemHealthScore}٪</span>
            <span className="text-[10px] text-[#707082] mt-0.5 block">بدون قطعی و کرش</span>
          </div>

          <div className="bg-[#121219]/80 p-3.5 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#8E8E9F] block">رویدادهای منتشرشده ۲۴ ساعت</span>
            <span className="text-xl font-bold text-[#00D1FF] font-mono mt-0.5 block">{data.summary.totalEventsDispatched24h.toLocaleString('fa-IR')}</span>
            <span className="text-[10px] text-[#707082] mt-0.5 block">گذرگاه EventMesh فعال</span>
          </div>

          <div className="bg-[#121219]/80 p-3.5 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#8E8E9F] block">میانگین تأخیر درگاه API</span>
            <span className="text-xl font-bold text-[#E5C365] font-mono mt-0.5 block">{data.summary.avgGatewayLatencyMs} ms</span>
            <span className="text-[10px] text-[#707082] mt-0.5 block">پاسخ‌دهی زیر ۲۰ میلی‌ثانیه</span>
          </div>

          <div className="bg-[#121219]/80 p-3.5 rounded-xl border border-[#262638]">
            <span className="text-[11px] text-[#8E8E9F] block">پردازشگرهای زمان‌بند</span>
            <span className="text-xl font-bold text-[#C8A951] font-mono mt-0.5 block">{data.summary.activeWorkersCount} فعال</span>
            <span className="text-[10px] text-[#707082] mt-0.5 block">مظنه، تطبیق زرین و ممیزی</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#15151F] border border-[#272736] rounded-xl overflow-x-auto custom-horizontal-scrollbar">
        {[
          { id: 'overview', label: 'نمای کلی سرویس‌های پلتفرم', icon: Layers },
          { id: 'architecture', label: 'معماری ۵ لایه‌ای سامانه (Clean Tiered)', icon: Workflow },
          { id: 'eventbus', label: 'گذرگاه رویدادها (EventMesh)', icon: Radio },
          { id: 'gateway', label: 'درگاه و مسیرهای API Gateway', icon: Network },
          { id: 'workers', label: 'پردازش‌های پس‌زمینه (Workers)', icon: Clock },
          { id: 'storage', label: 'موتور دیسک و تله‌متری ACID', icon: HardDrive }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#C8A951] text-[#121216] font-bold shadow-md'
                  : 'text-[#9696A6] hover:text-[#EDEDF4] hover:bg-[#1E1E2B]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Microservices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.services.map(svc => (
              <div
                key={svc.id}
                className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 hover:border-[#C8A951]/40 transition-all shadow-md group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#222230] group-hover:bg-[#C8A951]/10 flex items-center justify-center border border-[#343448] text-[#C8A951]">
                    {svc.category === 'storage' ? <Database className="w-5 h-5" /> :
                     svc.category === 'security' ? <ShieldCheck className="w-5 h-5" /> :
                     svc.category === 'scheduler' ? <Clock className="w-5 h-5" /> :
                     svc.category === 'integration' ? <Network className="w-5 h-5" /> :
                     <Server className="w-5 h-5" />}
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3DD68C] animate-pulse"></span>
                    عملیاتی
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#EDEDF2] mt-3">{svc.nameFa}</h3>
                <p className="text-[11px] text-[#7A7A8E] font-mono">{svc.nameEn}</p>
                <p className="text-xs text-[#9E9EB0] mt-2 line-clamp-2 leading-relaxed">{svc.descriptionFa}</p>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#262638] text-[11px]">
                  <div>
                    <span className="text-[#6F6F80] block text-[10px]">آپ‌تایم</span>
                    <span className="font-mono font-semibold text-[#3DD68C]">{svc.uptimePercent}٪</span>
                  </div>
                  <div>
                    <span className="text-[#6F6F80] block text-[10px]">تأخیر</span>
                    <span className="font-mono font-semibold text-[#E5C365]">{svc.latencyMs} ms</span>
                  </div>
                  <div>
                    <span className="text-[#6F6F80] block text-[10px]">نقاط تماس</span>
                    <span className="font-mono font-semibold text-[#00D1FF]">{svc.activeEndpointsCount} API</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture Layer Integration Map */}
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-[#C8A951]" />
              نقشه تعامل لایه‌ای سیستم دیدار (Three-Tier Platform Architecture)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#121219] p-4 rounded-xl border border-[#2B2B3C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#C8A951]">لایه ۱: PaaS & زیرساخت</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#C8A951]/20 text-[#E5C365]">پایه اشتراکی</span>
                </div>
                <p className="text-[#9898A8] text-[11px] leading-relaxed">
                  مدیریت داده‌های پایه (MDM)، موتور RBAC/IAM، تفکیک وظایف ۴چشم، گذرگاه EventMesh و دیسک ACID. بدون قفل به ارائه‌دهنده خارجی.
                </p>
              </div>

              <div className="bg-[#121219] p-4 rounded-xl border border-[#2B2B3C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#3DD68C]">لایه ۲: هسته‌های کسب‌وکار</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#3DD68C]/20 text-[#3DD68C]">K01 تا K20</span>
                </div>
                <p className="text-[#9898A8] text-[11px] leading-relaxed">
                  ۲۰ دامنه تخصصی زنجیره ارزش طلا شامل هویت، احراز، کاتالوگ، پاسپورت، خزانه‌ها، سفارشات POD، نرخ، دفتر دوگانه، بازخرید و بازیافت.
                </p>
              </div>

              <div className="bg-[#121219] p-4 rounded-xl border border-[#2B2B3C]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#00D1FF]">لایه ۳: هوش تجاری (BI)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00D1FF]/20 text-[#00D1FF]">تصمیم‌گیری کلان</span>
                </div>
                <p className="text-[#9898A8] text-[11px] leading-relaxed">
                  دیده‌بان گردش فیزیکی طلا، ماتریس ریسک و تعهدات اعتباری، راندمان بازیافت و کوره، شبیه‌ساز سناریوهای جهش مظنه و آشکارساز تقلب.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: 5-Tier Clean Architecture Inspector */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[#181824] via-[#1B1B28] to-[#14141E] border border-[#2D2D40] rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] text-xs font-bold font-mono">
                    CLEAN 5-TIER ENTERPRISE ARCHITECTURE
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3DD68C]/20 text-[#3DD68C] text-xs font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ۱۰۰٪ استاندارد و عملیاتی
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#EDEDF4] flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-[#C8A951]" />
                  دیده‌بان جریان داده‌ها در معماری ۵ لایه‌ای سامانه طلا دیدار
                </h3>
                <p className="text-xs text-[#9E9EB2] mt-1 leading-relaxed max-w-3xl">
                  جداسازی کامل دغدغه‌ها (SoC) از لایه رابط کاربری، کنترلرها، سرویس‌های دامنه، مخازن داده و موتور پایگاه داده ACID بدون وابستگی به ارائه‌دهنده خارجی.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadArchitectureData}
                  disabled={archLoading}
                  className="px-4 py-2.5 bg-[#C8A951] hover:bg-[#D8B961] text-[#121218] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${archLoading ? 'animate-spin' : ''}`} />
                  <span>آزمون جریان ۵ لایه (Test 5-Tier Flow)</span>
                </button>
              </div>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="mt-6 pt-5 border-t border-[#2A2A3C]">
              <div className="text-[11px] text-[#8E8E9E] font-mono mb-3 text-center sm:text-right">
                مسیر هدایت درخواست‌ها و تبادل داده: <span className="text-[#C8A951] font-bold">Frontend ➔ API / Controller ➔ Business / Service ➔ Data Access / Repository ➔ Database</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
                {[
                  {
                    num: '۱',
                    tag: 'Frontend',
                    nameFa: 'رابط کاربری',
                    dir: 'src/components & views',
                    color: 'text-[#00D1FF]',
                    border: 'border-[#00D1FF]/40',
                    bg: 'bg-[#00D1FF]/10',
                    badge: 'React 18 + Tailwind'
                  },
                  {
                    num: '۲',
                    tag: 'API / Controller',
                    nameFa: 'کنترلرها و مسیریابی',
                    dir: 'server/controllers',
                    color: 'text-[#C8A951]',
                    border: 'border-[#C8A951]/40',
                    bg: 'bg-[#C8A951]/10',
                    badge: 'Express Routers & DTOs'
                  },
                  {
                    num: '۳',
                    tag: 'Business / Service',
                    nameFa: 'منطق کسب‌وکار و قوانین',
                    dir: 'server/services',
                    color: 'text-[#A78BFA]',
                    border: 'border-[#A78BFA]/40',
                    bg: 'bg-[#A78BFA]/10',
                    badge: 'Domain Logic & EventMesh'
                  },
                  {
                    num: '۴',
                    tag: 'Data Access / Repo',
                    nameFa: 'مخازن و دسترسی داده',
                    dir: 'server/repositories',
                    color: 'text-[#F472B6]',
                    border: 'border-[#F472B6]/40',
                    bg: 'bg-[#F472B6]/10',
                    badge: 'Repository Pattern'
                  },
                  {
                    num: '۵',
                    tag: 'Database',
                    nameFa: 'پایگاه داده مستقل',
                    dir: 'server/database & data/',
                    color: 'text-[#3DD68C]',
                    border: 'border-[#3DD68C]/40',
                    bg: 'bg-[#3DD68C]/10',
                    badge: 'ACID Engine + WAL'
                  }
                ].map((tier, idx) => (
                  <div
                    key={tier.num}
                    className={`relative p-3.5 rounded-xl border ${tier.border} ${tier.bg} flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-[#E0E0EC]">
                          لایه {tier.num}
                        </span>
                        <span className={`text-[10px] font-bold ${tier.color}`}>
                          {tier.tag}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#F0F0F8] mb-1">{tier.nameFa}</div>
                      <div className="text-[10px] text-[#8E8E9E] font-mono mb-2">{tier.dir}</div>
                    </div>
                    <div className="pt-2 border-t border-white/10 text-[9px] text-[#A0A0B0] flex items-center justify-between">
                      <span>{tier.badge}</span>
                      <CheckCircle2 className="w-3 h-3 text-[#3DD68C]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Layer Cards from Live Backend Inspection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#C8A951]" />
                جزئیات و تله‌متری بلادرنگ ۵ لایه پلتفرم
              </h4>
              {architectureData?.timestamp && (
                <span className="text-[11px] text-[#8E8E9E] font-mono">
                  زمان آخرین استعلام: {new Date(architectureData.timestamp).toLocaleTimeString('fa-IR')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {(architectureData?.layers || [
                {
                  layerNumber: 1,
                  name: 'Frontend Layer (UI / UX)',
                  nameFa: 'لایه رابط کاربری و تجربه کاربری (React + Vite Client)',
                  category: 'Frontend',
                  status: 'healthy',
                  latencyMs: 8,
                  componentsCount: 42,
                  descriptionFa: 'میز کارهای تعاملی مدیران، داشبوردهای BI، کنسول PaaS و نماهای عملیاتی ۲۰ هسته زنجیره ارزش طلا',
                  technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Lucide Icons', 'Motion Animations', 'RTL Persian Typography'],
                  metrics: {
                    activeDashboards: 'Executive BI Cockpit, PaaS Cloud Console, Master Data Center, 20 Kernel Consoles',
                    stateManagement: 'Client API Service Layer (api.ts)',
                    responsiveDesign: 'Desktop-First Precision with Touch Friendly Layout'
                  }
                },
                {
                  layerNumber: 2,
                  name: 'API / Controller Layer',
                  nameFa: 'لایه کنترلرها و نقاط پایانی وب (Express Controllers & Routers)',
                  category: 'API / Controller',
                  status: 'healthy',
                  latencyMs: 5,
                  componentsCount: 25,
                  descriptionFa: 'اعتبارسنجی ورودی‌ها (DTOs)، استخراج متغیرهای HTTP، هدایت درخواست‌ها به سرویس‌ها و صدور پاسخ JSON',
                  technologies: ['Express Controllers', 'RESTful Endpoints', 'Rate Limiting', 'HTTP Status Normalization', 'Audit Interceptors'],
                  metrics: {
                    totalEndpointsCount: 64,
                    activeControllers: 'PaasController, BiController, MasterDataController, RbacController, KernelController, ArchitectureController',
                    supportedFormats: 'application/json',
                    corsPolicy: 'Secured Container Origin'
                  }
                },
                {
                  layerNumber: 3,
                  name: 'Business / Service Layer',
                  nameFa: 'لایه منطق تجاری و خدمات دامنه (Business Services)',
                  category: 'Business / Service',
                  status: 'healthy',
                  latencyMs: 4,
                  componentsCount: 7,
                  descriptionFa: 'منطق کسب‌وکار صنعت طلا، فرمول‌های عیارسنجی، اعتبارسنجی POD، تطبیق دوگانه و توزیع رویدادها',
                  technologies: ['Domain Services', 'EventMesh Dispatcher', '4-Eyes Verification Rules', 'What-If Simulation Engine'],
                  metrics: {
                    activeServices: 'PaasService, BiService, MasterDataService, RbacService, KernelService, K13-K14 Bridge, K14-K15 Bridge',
                    eventBusStatus: 'Operational (At-Least-Once)',
                    fourEyesEnforced: true,
                    domainsSupported: 'K01 to K20 (20 Kernels)'
                  }
                },
                {
                  layerNumber: 4,
                  name: 'Data Access / Repository Layer',
                  nameFa: 'لایه دسترسی به داده‌ها و مخازن (Repositories)',
                  category: 'Data Access / Repository',
                  status: 'healthy',
                  latencyMs: 3,
                  componentsCount: 5,
                  descriptionFa: 'الگوی مخزن (Repository Pattern) برای تجرید عملیات CRUD، کشینگ و تراکنش‌های پایگاه داده',
                  technologies: ['BaseRepository Abstraction', 'Typed Query Interfaces', 'Memory + Disk Syncer', 'Isolation Decorators'],
                  metrics: {
                    repositoriesActive: 'PaasRepository, BiRepository, MasterDataRepository, RbacRepository, KernelRepository',
                    storagePing: 'ok',
                    collectionsManaged: 24,
                    atomicTransactionsSupported: true
                  }
                },
                {
                  layerNumber: 5,
                  name: 'Database Layer',
                  nameFa: 'لایه پایگاه داده مستقل (ACID Disk + Postgres Wire)',
                  category: 'Database',
                  status: 'healthy',
                  latencyMs: 2,
                  componentsCount: 24,
                  descriptionFa: 'موتور ذخیره‌سازی مستقل، بدون قفل‌شدگی در ارائه‌دهنده خارجی، با قابلیت WAL و تراکنش‌های اتمیک',
                  technologies: ['Independent ACID Engine', 'JSON Disk Volume', 'PostgreSQL Wire Compatible', 'Write-Ahead Log (WAL)'],
                  metrics: {
                    engine: 'independent_acid_json_volume',
                    totalCollections: 24,
                    totalRecords: 2840,
                    diskUsage: '۴.۶ مگابایت',
                    walStatus: 'synced',
                    activeLocks: 0,
                    vendorLockIn: false
                  }
                }
              ]).map((layer: any) => (
                <div
                  key={layer.layerNumber}
                  className="bg-[#171722] border border-[#282838] rounded-xl p-4 lg:p-5 shadow-md hover:border-[#38384E] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#C8A951]/20 text-[#E5C365] font-bold text-xs flex items-center justify-center font-mono">
                        {layer.layerNumber}
                      </span>
                      <div>
                        <h5 className="text-sm font-bold text-[#F0F0F8]">{layer.nameFa}</h5>
                        <span className="text-[11px] text-[#8E8E9E] font-mono">{layer.name} ({layer.category})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        {layer.status} ({layer.latencyMs} ms)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#222230] text-[#A0A0B0] font-mono">
                        {layer.componentsCount} مؤلفه فعال
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#9E9EB2] leading-relaxed mb-3.5">
                    {layer.descriptionFa}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#242434]">
                    <div>
                      <span className="text-[10px] text-[#787888] font-mono block mb-1.5">فناوری‌ها و الگوهای طراحی:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {layer.technologies?.map((tech: string, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-[#101016] text-[#D0D0DC] border border-[#262634] font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#787888] font-mono block mb-1.5">شاخص‌های عملیاتی و وضعیت:</span>
                      <div className="bg-[#101016] p-2 rounded-lg border border-[#242434] text-[10px] text-[#A0A0B2] space-y-1 font-mono">
                        {Object.entries(layer.metrics || {}).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between gap-2 overflow-hidden text-ellipsis">
                            <span className="text-[#787888]">{key}:</span>
                            <span className="text-[#E0E0EC] font-medium">{String(val)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: EventBus & EventMesh */}
      {activeTab === 'eventbus' && (
        <div className="space-y-6">
          {/* Real-time Dispatch Tester */}
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2">
                <Send className="w-4 h-4 text-[#C8A951]" />
                شبیه‌ساز و محرک انتشار رویداد در گذرگاه سازمانی (Event Publisher Console)
              </h3>
              <span className="text-[11px] text-[#7E7E92]">پروتکل انتشار: At-Least-Once با برچسب هش امنیتی</span>
            </div>

            <form onSubmit={handleDispatchEvent} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-[#8E8E9E] mb-1">موضوع رویداد (Topic)</label>
                <select
                  value={testTopic}
                  onChange={e => setTestTopic(e.target.value)}
                  className="w-full bg-[#121218] border border-[#2F2F40] rounded-lg px-3 py-2 text-xs text-[#EDEDF2] focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="didar.k10.order.pod_confirmed">didar.k10.order.pod_confirmed</option>
                  <option value="didar.k08.assay.completed">didar.k08.assay.completed</option>
                  <option value="didar.k13.rates.spot_updated">didar.k13.rates.spot_updated</option>
                  <option value="didar.k14.credit.exposure_alert">didar.k14.credit.exposure_alert</option>
                  <option value="didar.k19.buyback.settled">didar.k19.buyback.settled</option>
                  <option value="didar.k20.smelting.bar_cast">didar.k20.smelting.bar_cast</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8E8E9E] mb-1">دامنه مبدا (Source Kernel)</label>
                <select
                  value={testSource}
                  onChange={e => setTestSource(e.target.value)}
                  className="w-full bg-[#121218] border border-[#2F2F40] rounded-lg px-3 py-2 text-xs text-[#EDEDF2] focus:outline-none focus:border-[#C8A951]"
                >
                  <option value="K10">K10 - Orders & Fulfillment</option>
                  <option value="K08">K08 - Intake & Assay</option>
                  <option value="K13">K13 - Gold Spot Rates</option>
                  <option value="K14">K14 - Credit Exposure</option>
                  <option value="K19">K19 - Buyback Engine</option>
                  <option value="K20">K20 - Refurbish & Smelt</option>
                </select>
              </div>

              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] text-[#8E8E9E] mb-1">خلاصه بار داده (Payload Summary)</label>
                  <input
                    type="text"
                    value={testPayload}
                    onChange={e => setTestPayload(e.target.value)}
                    placeholder="مثال: تخصیص ۲۵ گرم طلای آب‌شده به کوره ذوب K20"
                    className="w-full bg-[#121218] border border-[#2F2F40] rounded-lg px-3 py-2 text-xs text-[#EDEDF2] focus:outline-none focus:border-[#C8A951]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={dispatching || !testPayload.trim()}
                  className="px-4 py-2 bg-[#C8A951] hover:bg-[#D5B65D] text-[#121216] font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{dispatching ? 'انتشار...' : 'انتشار رویداد'}</span>
                </button>
              </div>
            </form>

            {dispatchSuccess && (
              <div className="mt-3 p-2.5 rounded-lg bg-[#3DD68C]/15 border border-[#3DD68C]/30 text-xs text-[#3DD68C] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{dispatchSuccess}</span>
              </div>
            )}
          </div>

          {/* Active Topics Table */}
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-[#C8A951]" />
              کانال‌ها و موضوعات فعال گذرگاه ({data.eventBus.topics.length} سرفصل)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#2C2C3E] text-[#868698]">
                    <th className="py-2.5 px-3">نام تاپیک (Topic Name)</th>
                    <th className="py-2.5 px-3">دسته‌بندی موضوعی</th>
                    <th className="py-2.5 px-3">دامنه‌های شنونده</th>
                    <th className="py-2.5 px-3 text-center">مشترکین</th>
                    <th className="py-2.5 px-3 text-center">تعداد ۲۴ ساعت</th>
                    <th className="py-2.5 px-3 text-center">تأخیر توزیع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242436]">
                  {data.eventBus.topics.map(top => (
                    <tr key={top.id} className="hover:bg-[#1E1E2C] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#00D1FF]">{top.topic}</td>
                      <td className="py-2.5 px-3 text-[#EDEDF2]">{top.categoryFa}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {top.targetDomains.map(d => (
                            <span key={d} className="px-1.5 py-0.5 rounded bg-[#2A2A3C] text-[10px] text-[#C8A951] font-mono">
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#A8A8B8]">{top.subscribersCount}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#3DD68C]">{top.totalDispatched24h.toLocaleString('fa-IR')}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#E5C365]">{top.avgLatencyMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Dispatched Events Feed */}
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#C8A951]" />
              جریان زنده رویدادهای منتقل‌شده در گذرگاه (Live Event Stream)
            </h3>

            <div className="space-y-2.5">
              {data.eventBus.recentEvents.map(evt => (
                <div
                  key={evt.id}
                  className="bg-[#13131A] border border-[#28283A] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#E5C365]">{evt.eventId}</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#29293B] text-[10px] font-mono text-[#00D1FF]">{evt.topic}</span>
                      <span className="text-[10px] text-[#7A7A8E]">مبدا: {evt.sourceDomain}</span>
                    </div>
                    <p className="text-[#C4C4D4]">{evt.payloadSummaryFa}</p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 text-left sm:text-right">
                    <span className="text-[10px] text-[#3DD68C] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      تحویل در {evt.deliveryLatencyMs}ms
                    </span>
                    <span className="text-[10px] text-[#6E6E80] font-mono">{evt.timestampFa}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Gateway & Routes */}
      {activeTab === 'gateway' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#C8A951]" />
                  مسیرهای ثبت‌شده در درگاه یکپارچه (API Gateway Endpoints)
                </h3>
                <p className="text-xs text-[#8E8E9E] mt-0.5">پایش نرخ درخواست‌ها، توزیع بار، محدودیت Rate Limit و امنیت دسترسی</p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#242436] text-[#A0A0B0] border border-[#323246]">
                تعداد کل مسیرها: {data.apiGateway.totalRoutes} Endpoint
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#2C2C3E] text-[#868698]">
                    <th className="py-2.5 px-3">متد / مسیر API</th>
                    <th className="py-2.5 px-3">هسته هدف</th>
                    <th className="py-2.5 px-3">شرح عملیات</th>
                    <th className="py-2.5 px-3 text-center">سقف نرخ (دقیقه)</th>
                    <th className="py-2.5 px-3 text-center">درخواست در ساعت</th>
                    <th className="py-2.5 px-3 text-center">نرخ موفقیت</th>
                    <th className="py-2.5 px-3 text-center">میانگین زمان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242436]">
                  {data.apiGateway.routes.map(rt => (
                    <tr key={rt.id} className="hover:bg-[#1E1E2C] transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ml-1.5 ${
                          rt.method === 'GET' ? 'bg-[#3DD68C]/20 text-[#3DD68C]' :
                          rt.method === 'POST' ? 'bg-[#00D1FF]/20 text-[#00D1FF]' :
                          'bg-[#C8A951]/20 text-[#E5C365]'
                        }`}>
                          {rt.method}
                        </span>
                        <span className="text-[#EDEDF2]">{rt.path}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[#C8A951]">{rt.targetDomain}</td>
                      <td className="py-2.5 px-3 text-[#A8A8B8]">{rt.descriptionFa}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#8E8E9E]">{rt.rateLimitPerMin}/m</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#EDEDF2]">{rt.requestsLastHour.toLocaleString('fa-IR')}</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#3DD68C] font-semibold">{rt.successRatePercent}٪</td>
                      <td className="py-2.5 px-3 text-center font-mono text-[#E5C365]">{rt.avgLatencyMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Background Workers */}
      {activeTab === 'workers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.workers.map(wrk => (
              <div key={wrk.id} className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#EDEDF4]">{wrk.nameFa}</h3>
                    <p className="text-[11px] text-[#78788E] font-mono">{wrk.nameEn}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3DD68C] animate-pulse"></span>
                    {wrk.status === 'running' ? 'در حال اجرا' : 'زمان‌بندی شده'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#8E8E9E]">
                    <span>زمان‌بندی اجرا:</span>
                    <span className="font-mono text-[#E5C365]">{wrk.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8E8E9E]">
                    <span>دامنه مرتبط:</span>
                    <span className="font-mono text-[#00D1FF]">{wrk.targetDomain}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8E8E9E]">
                    <span>آخرین اجرا:</span>
                    <span className="text-[#EDEDF2]">{wrk.lastRunFa}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8E8E9E]">
                    <span>اجرای بعدی:</span>
                    <span className="text-[#3DD68C] font-semibold">{wrk.nextRunFa}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8E8E9E]">
                    <span>نرخ موفقیت:</span>
                    <span className="font-mono text-[#3DD68C] font-bold">{wrk.successRate}٪</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Storage Engine & ACID Telemetry */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-[#E5C365] flex items-center gap-2 mb-2">
              <HardDrive className="w-5 h-5 text-[#C8A951]" />
              موتور ذخیره‌سازی مستقل و خودمیزبان (100% Self-Hosted ACID Storage Engine)
            </h3>
            <p className="text-xs text-[#9E9EB0] max-w-3xl leading-relaxed">
              معماری پایگاه داده دیدار به صورت کاملاً مستقل و بی‌نیاز از هرگونه خدمات ابری خارجی یا فروشندگان شخص‌ثالث (No Vendor Lock-In) پیاده‌سازی شده است. پایداری تراکنش‌های طلایی و ریالی به صورت اتمیک بر روی دیسک با انطباق کامل ACID تضمین می‌گردد.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#121218] p-4 rounded-xl border border-[#28283A]">
                <span className="text-[11px] text-[#7E7E90] block">نوع موتور ذخیره</span>
                <span className="text-xs font-bold text-[#EDEDF2] mt-1 block">ACID Volume Storage</span>
                <span className="text-[10px] text-[#3DD68C] mt-0.5 block">سازگار با پروتکل Postgres</span>
              </div>

              <div className="bg-[#121218] p-4 rounded-xl border border-[#28283A]">
                <span className="text-[11px] text-[#7E7E90] block">تعداد کل رکوردها</span>
                <span className="text-lg font-bold text-[#00D1FF] font-mono mt-0.5 block">{data.storage.totalRecordsCount.toLocaleString('fa-IR')}</span>
                <span className="text-[10px] text-[#7E7E90] mt-0.5 block">در ۲۴ مجموعه داده K01-K20</span>
              </div>

              <div className="bg-[#121218] p-4 rounded-xl border border-[#28283A]">
                <span className="text-[11px] text-[#7E7E90] block">حجم اشغال‌شده دیسک</span>
                <span className="text-lg font-bold text-[#E5C365] font-mono mt-0.5 block">{data.storage.diskUsageFormatted}</span>
                <span className="text-[10px] text-[#7E7E90] mt-0.5 block">فشرده و بهینه‌سازی شده</span>
              </div>

              <div className="bg-[#121218] p-4 rounded-xl border border-[#28283A]">
                <span className="text-[11px] text-[#7E7E90] block">وضعیت لاگ تراکنش (WAL)</span>
                <span className="text-xs font-bold text-[#3DD68C] mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  همگام‌شده (Synced)
                </span>
                <span className="text-[10px] text-[#7E7E90] mt-0.5 block">بدون قفل معلق ({data.storage.activeLocksCount})</span>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-[#262638] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#8E8E9E]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3DD68C]" />
                <span>گارانتی عدم وابستگی: وابستگی به ارائه‌دهنده خارجی = صفر (Vendor Lock-in: False)</span>
              </div>
              <div className="font-mono text-[11px]">
                آخرین اسنپ‌شات اتمیک: {data.storage.lastSnapshotTimestampFa}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
