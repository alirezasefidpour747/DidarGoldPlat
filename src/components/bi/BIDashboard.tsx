/**
 * Didar Gold Platform - Business Intelligence (BI) Layer Control Center
 * Cross-domain executive analytics & strategic decision intelligence:
 * 1. Executive Cockpit (Circulating Gold & Liquidity)
 * 2. Real-Time Gold Flow & Circulation Pipeline
 * 3. Dual-Ledger Risk & Exposure Matrix
 * 4. Metallurgy, Scrap & CPO Yield Intelligence
 * 5. Anomaly Detection & Fraud Sentinel
 * 6. Predictive Scenario Simulator
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Layers,
  ShieldAlert,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Download,
  DollarSign,
  Coins,
  ShieldCheck,
  Scale,
  Zap,
  Activity,
  ChevronRight,
  Eye
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { BiDataPayload, PredictiveScenarioSimulation } from '../../types/bi.js';

interface BIDashboardProps {
  onNavigateToDomain?: (domainId: string) => void;
}

export const BIDashboard: React.FC<BIDashboardProps> = ({ onNavigateToDomain }) => {
  const [data, setData] = useState<BiDataPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'pipeline' | 'exposure' | 'metallurgy' | 'anomalies' | 'scenarios'>('cockpit');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getBiData();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load BI data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleResolveAnomaly = async (id: string) => {
    setResolvingId(id);
    try {
      const res = await api.resolveBiAnomaly(id);
      if (res.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.message || 'خطا در ثبت پیگیری ناهنجاری');
    } finally {
      setResolvingId(null);
    }
  };

  const handleExportBi = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `didar-bi-executive-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center">
        <RefreshCw className="w-10 h-10 text-[#C8A951] animate-spin mb-4" />
        <p className="text-[#E0E0E8] font-medium">در حال تجمیع داده‌های هوش تجاری (Didar Business Intelligence)...</p>
        <p className="text-xs text-[#8E8E9C] mt-1">ترکیب متوازن ترازنامه‌ها، خط لوله گردش فیزیکی طلا، ماتریس ریسک و شبیه‌سازها</p>
      </div>
    );
  }

  if (!data) return null;

  const currentScenario = data.scenarios[selectedScenarioIndex] || data.scenarios[0];

  return (
    <div className="space-y-6">
      {/* Top BI Header Banner */}
      <div className="bg-gradient-to-r from-[#191924] via-[#201F2D] to-[#191924] border border-[#313146] rounded-2xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C8A951]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-[#00D1FF]/15 text-[#00D1FF] border border-[#00D1FF]/30 text-xs font-bold font-mono tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                BI LAYER · هوش تجاری و تصمیم‌گیری کلان
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 text-xs font-mono">
                مظنه مرجع طلا: {data.executiveCockpit.benchmarkGoldRateGram750.toLocaleString('fa-IR')} تومان/گرم
              </span>
              <span className="text-xs text-[#8A8A9E] font-mono">
                به‌روزرسانی: {data.lastUpdatedFa}
              </span>
            </div>

            <h2 className="text-xl lg:text-2xl font-bold text-[#F4F4F8] tracking-tight">
              میز فرماندهی هوش تجاری اکوسیستم دیدار (Executive BI Cockpit)
            </h2>
            <p className="text-xs lg:text-sm text-[#A5A5B8] max-w-3xl leading-relaxed">
              تجمیع بلادرنگ جریان ارزش از تمامی ۲۰ هسته بنیادین: پایش ۱۸.۴ کیلوگرم طلای در گردش، خط لوله جریان فیزیکی، تراز ریسک تعهدات دوگانه طلایی/ریالی و شبیه‌ساز سناریوهای اقتصادی.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end lg:self-center">
            <button
              onClick={handleExportBi}
              className="px-3.5 py-2 rounded-xl bg-[#222232] hover:bg-[#2A2A3E] border border-[#3C3C54] text-xs font-semibold text-[#E5C365] flex items-center gap-2 transition-all cursor-pointer shadow-md"
              title="دریافت گزارش تجمیعی هوش تجاری"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی هوش تجاری (JSON)</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-[#1E1E2A] hover:bg-[#28283A] border border-[#34344A] text-[#C8A951] transition-all cursor-pointer shadow-md disabled:opacity-50"
              title="به‌روزرسانی شاخص‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Golden Executive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#2B2B3C]">
          <div className="bg-[#13131B]/90 p-4 rounded-xl border border-[#27273A] shadow-inner">
            <div className="flex items-center justify-between text-[#8E8E9F] text-[11px] mb-1">
              <span>کل طلای در گردش اکوسیستم</span>
              <Coins className="w-4 h-4 text-[#C8A951]" />
            </div>
            <span className="text-2xl font-bold text-[#E5C365] font-mono block">
              {data.executiveCockpit.circulatingGoldGrams750.toLocaleString('fa-IR')} <span className="text-xs font-sans text-[#A8A8B8]">گرم ۷۵۰</span>
            </span>
            <span className="text-[11px] text-[#3DD68C] mt-1 block font-mono">
              ارزش: {Math.round(data.executiveCockpit.totalFiatValuationToman / 1000000000).toLocaleString('fa-IR')} میلیارد تومان
            </span>
          </div>

          <div className="bg-[#13131B]/90 p-4 rounded-xl border border-[#27273A] shadow-inner">
            <div className="flex items-center justify-between text-[#8E8E9F] text-[11px] mb-1">
              <span>ذخیره خزانه مرکزی (K09)</span>
              <ShieldCheck className="w-4 h-4 text-[#3DD68C]" />
            </div>
            <span className="text-2xl font-bold text-[#3DD68C] font-mono block">
              {data.executiveCockpit.vaultReserveGrams.toLocaleString('fa-IR')} <span className="text-xs font-sans text-[#A8A8B8]">گرم</span>
            </span>
            <span className="text-[11px] text-[#8E8E9E] mt-1 block">
              {((data.executiveCockpit.vaultReserveGrams / data.executiveCockpit.circulatingGoldGrams750) * 100).toFixed(1)}٪ کل موجودی در گاوصندوق امن
            </span>
          </div>

          <div className="bg-[#13131B]/90 p-4 rounded-xl border border-[#27273A] shadow-inner">
            <div className="flex items-center justify-between text-[#8E8E9F] text-[11px] mb-1">
              <span>پوشش وثایق و تضامین (K14)</span>
              <Scale className="w-4 h-4 text-[#00D1FF]" />
            </div>
            <span className="text-2xl font-bold text-[#00D1FF] font-mono block">
              {data.executiveCockpit.overallCollateralCoveragePercent}٪
            </span>
            <span className="text-[11px] text-[#3DD68C] mt-1 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              تعهدات با مازاد وثیقه امن پوشش داده شده
            </span>
          </div>

          <div className="bg-[#13131B]/90 p-4 rounded-xl border border-[#27273A] shadow-inner">
            <div className="flex items-center justify-between text-[#8E8E9F] text-[11px] mb-1">
              <span>شاخص سلامت سلامت اکوسیستم</span>
              <Sparkles className="w-4 h-4 text-[#E5C365]" />
            </div>
            <span className="text-2xl font-bold text-[#EDEDF4] font-mono block">
              {data.executiveCockpit.ecosystemHealthIndex} <span className="text-xs font-sans text-[#7E7E90]">از ۱۰۰</span>
            </span>
            <span className="text-[11px] text-[#8E8E9E] mt-1 block">
              سرعت تسویه: {data.executiveCockpit.settlementNettingVelocityHours} ساعت | {data.executiveCockpit.activeB2BRetailersCount} بنکدار فعال
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#15151F] border border-[#272736] rounded-xl overflow-x-auto custom-horizontal-scrollbar">
        {[
          { id: 'cockpit', label: 'میز فرماندهی و تراز نقدینگی', icon: TrendingUp },
          { id: 'pipeline', label: 'خط لوله گردش فیزیکی طلا', icon: Layers },
          { id: 'exposure', label: 'ماتریس تعهدات و ریسک اعتباری', icon: Scale },
          { id: 'metallurgy', label: 'راندمان کوره، عیارسنجی و CPO', icon: Coins },
          { id: 'anomalies', label: 'دیده‌بان ناهنجاری‌ها و ممیزی', icon: ShieldAlert },
          { id: 'scenarios', label: 'شبیه‌ساز سناریوهای اقتصادی', icon: Sparkles }
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

      {/* Tab 1: Cockpit */}
      {activeTab === 'cockpit' && (
        <div className="space-y-6">
          {/* Dual Balance Sheet View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Gold Balance Sheet */}
            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2 mb-4">
                <Coins className="w-4 h-4 text-[#C8A951]" />
                ترازنامه موجودی فیزیکی طلا (Gold Grams Breakdown)
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[#121219] border border-[#262638] text-xs">
                  <span className="text-[#A5A5B8]">خزانه مرکزی و ذخیره شمش (K09)</span>
                  <span className="font-mono font-bold text-[#3DD68C]">
                    {data.executiveCockpit.vaultReserveGrams.toLocaleString('fa-IR')} گرم ({((data.executiveCockpit.vaultReserveGrams / data.executiveCockpit.circulatingGoldGrams750) * 100).toFixed(1)}٪)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#121219] border border-[#262638] text-xs">
                  <span className="text-[#A5A5B8]">ویترین‌های امانی بنکداری و خرده‌فروشی (K10 / K11)</span>
                  <span className="font-mono font-bold text-[#00D1FF]">
                    {data.executiveCockpit.retailerConsignedGrams.toLocaleString('fa-IR')} گرم ({((data.executiveCockpit.retailerConsignedGrams / data.executiveCockpit.circulatingGoldGrams750) * 100).toFixed(1)}٪)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#121219] border border-[#262638] text-xs">
                  <span className="text-[#A5A5B8]">کیف‌های امن عاملان میدانی در گردش (K09 / K12)</span>
                  <span className="font-mono font-bold text-[#E5C365]">
                    {data.executiveCockpit.fieldAgentBagsGrams.toLocaleString('fa-IR')} گرم ({((data.executiveCockpit.fieldAgentBagsGrams / data.executiveCockpit.circulatingGoldGrams750) * 100).toFixed(1)}٪)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-[#121219] border border-[#262638] text-xs">
                  <span className="text-[#A5A5B8]">تعهدات دریافتنی باز طلایی (K15 / K16)</span>
                  <span className="font-mono font-bold text-[#E5C365]">
                    {data.executiveCockpit.unsettledGoldReceivablesGrams.toLocaleString('fa-IR')} گرم
                  </span>
                </div>
              </div>
            </div>

            {/* Product Category Distribution */}
            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
              <h3 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-[#C8A951]" />
                سهم دسته‌بندی محصولات در ارزش کل زنجیره
              </h3>

              <div className="space-y-3">
                {data.categoryDistributions.map(cat => (
                  <div key={cat.categoryFa} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#EDEDF2]">{cat.categoryFa}</span>
                      <span className="font-mono text-[#E5C365] font-bold">{cat.sharePercent}٪</span>
                    </div>
                    <div className="w-full h-2 bg-[#121218] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C8A951] to-[#E5C365] rounded-full"
                        style={{ width: `${cat.sharePercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#7A7A8E]">
                      <span>وزن: {cat.volumeGrams.toLocaleString('fa-IR')} گرم</span>
                      <span>دوره گردش: {cat.turnoverRateDays} روز</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Gold Flow & Circulation Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C8A951]" />
                  خط لوله پیوسته گردش فیزیکی طلا در اکوسیستم (Gold Flow Pipeline)
                </h3>
                <p className="text-xs text-[#8E8E9E] mt-0.5">ردگیری حجم، سرعت و سلامت طلا در ۸ مرحله از پذیرش اولیه تا بازیافت کوره</p>
              </div>

              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#222232] text-[#3DD68C] border border-[#3DD68C]/30">
                جریان پیوسته و بدون انسداد
              </span>
            </div>

            <div className="space-y-3">
              {data.circulationPipeline.map((node, index) => (
                <div
                  key={node.id}
                  className="bg-[#13131C] border border-[#28283C] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#C8A951]/40 transition-all text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      0{index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#EDEDF2] text-xs">{node.stageFa}</h4>
                      <p className="text-[11px] text-[#7E7E90] font-mono">{node.stageEn} · مرجع: {node.domainSource}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:w-1/2">
                    <div>
                      <span className="text-[#6F6F80] block text-[10px]">حجم طلا (گرم ۷۵۰)</span>
                      <span className="font-mono font-bold text-[#E5C365]">{node.volumeGrams750.toLocaleString('fa-IR')} گرم</span>
                    </div>

                    <div>
                      <span className="text-[#6F6F80] block text-[10px]">ارزش روز (تومان)</span>
                      <span className="font-mono font-semibold text-[#00D1FF]">
                        {Math.round(node.valuationToman / 1000000).toLocaleString('fa-IR')} م.ت
                      </span>
                    </div>

                    <div>
                      <span className="text-[#6F6F80] block text-[10px]">شاخص سرعت</span>
                      <span className="text-[#EDEDF2] text-[11px]">{node.velocityFa}</span>
                    </div>
                  </div>

                  {onNavigateToDomain && (
                    <button
                      onClick={() => onNavigateToDomain(node.domainSource.split(' ')[0])}
                      className="px-2.5 py-1.5 rounded-lg bg-[#222232] hover:bg-[#2C2C40] text-[11px] text-[#C8A951] border border-[#36364A] flex items-center gap-1 shrink-0 self-end md:self-center transition-colors cursor-pointer"
                    >
                      <span>ورود به هسته</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Risk & Exposure Matrix */}
      {activeTab === 'exposure' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-[#C8A951]" />
              ماتریس ریسک و سقف اعتباری رده‌های بنکداری و خرده‌فروشی (Retailer Tiers Exposure)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-[#2C2C3E] text-[#868698]">
                    <th className="py-2.5 px-3">رده تجاری (Tier)</th>
                    <th className="py-2.5 px-3 text-center">تعداد اعضا</th>
                    <th className="py-2.5 px-3 text-center">سقف اعتبار (تومان)</th>
                    <th className="py-2.5 px-3 text-center">اعتبار مصرف‌شده</th>
                    <th className="py-2.5 px-3 text-center">درصد مصرف</th>
                    <th className="py-2.5 px-3 text-center">بدهی طلایی (گرم)</th>
                    <th className="py-2.5 px-3 text-center">پوشش وثیقه</th>
                    <th className="py-2.5 px-3 text-center">وضعیت ریسک</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242436]">
                  {data.exposureMatrix.tiers.map(t => (
                    <tr key={t.tier} className="hover:bg-[#1E1E2C] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#EDEDF2]">{t.tierNameFa}</td>
                      <td className="py-3 px-3 text-center font-mono text-[#A8A8B8]">{t.retailersCount}</td>
                      <td className="py-3 px-3 text-center font-mono text-[#EDEDF2]">{(t.totalCreditCapToman / 1000000000).toLocaleString('fa-IR')} م.ت</td>
                      <td className="py-3 px-3 text-center font-mono text-[#E5C365]">{(t.utilizedCreditToman / 1000000000).toLocaleString('fa-IR')} م.ت</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#EDEDF2]">{t.utilizationPercent}٪</td>
                      <td className="py-3 px-3 text-center font-mono text-[#C8A951]">{t.totalGoldDebtGrams.toLocaleString('fa-IR')} g</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#3DD68C]">{t.collateralCoveragePercent}٪</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          t.riskStatus === 'low' ? 'bg-[#3DD68C]/15 text-[#3DD68C]' :
                          'bg-[#E5C365]/15 text-[#E5C365]'
                        }`}>
                          {t.riskStatus === 'low' ? 'ریسک پایین' : 'ریسک متوسط'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Aging Buckets Table */}
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#C8A951]" />
              جدول سررسید و کهنگی مطالبات طلایی و ریالی (Aging Overdue Buckets)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {data.exposureMatrix.agingBuckets.map(b => (
                <div key={b.rangeDays} className="bg-[#13131B] border border-[#28283C] rounded-xl p-4 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[#EDEDF2]">{b.bucketFa}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#252538] text-[#A8A8B8]">{b.rangeDays}</span>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="flex items-center justify-between text-[#8E8E9E]">
                      <span>حجم طلا:</span>
                      <span className="font-mono font-bold text-[#E5C365]">{b.totalGrams.toLocaleString('fa-IR')} گرم</span>
                    </div>
                    <div className="flex items-center justify-between text-[#8E8E9E]">
                      <span>مبلغ ریالی:</span>
                      <span className="font-mono text-[#00D1FF]">{Math.round(b.totalToman / 1000000).toLocaleString('fa-IR')} م.ت</span>
                    </div>
                    <div className="flex items-center justify-between text-[#8E8E9E]">
                      <span>تعداد طرف حساب‌ها:</span>
                      <span className="font-mono text-[#EDEDF2]">{b.accountsCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Metallurgy & Yield */}
      {activeTab === 'metallurgy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-4 shadow-md">
              <span className="text-[11px] text-[#8E8E9E] block">کل طلای شکسته ورودی به کوره</span>
              <span className="text-xl font-bold text-[#E5C365] font-mono mt-1 block">
                {data.metallurgyAndYield.totalScrapIntakeGrams.toLocaleString('fa-IR')} گرم
              </span>
              <span className="text-[10px] text-[#7A7A8E] mt-0.5 block">از محل بازخرید K19 و معاوضه‌ها</span>
            </div>

            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-4 shadow-md">
              <span className="text-[11px] text-[#8E8E9E] block">شمش آب‌شده ریخته‌گری شده</span>
              <span className="text-xl font-bold text-[#3DD68C] font-mono mt-1 block">
                {data.metallurgyAndYield.totalSmeltedIngotsGrams.toLocaleString('fa-IR')} گرم
              </span>
              <span className="text-[10px] text-[#3DD68C] mt-0.5 block">میانگین افت کوره: {data.metallurgyAndYield.avgSmeltingLossPercent}٪</span>
            </div>

            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-4 shadow-md">
              <span className="text-[11px] text-[#8E8E9E] block">ارزش‌افزوده احیای CPO</span>
              <span className="text-xl font-bold text-[#00D1FF] font-mono mt-1 block">
                {Math.round(data.metallurgyAndYield.cpoEconomicGainToman / 1000000).toLocaleString('fa-IR')} م.ت
              </span>
              <span className="text-[10px] text-[#8E8E9E] mt-0.5 block">{data.metallurgyAndYield.cpoRefurbishedPiecesCount} قطعه با اجرت اقتصادی</span>
            </div>

            <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-4 shadow-md">
              <span className="text-[11px] text-[#8E8E9E] block">گوهرسنگ‌های بازیابی‌شده</span>
              <span className="text-xl font-bold text-[#EDEDF4] font-mono mt-1 block">
                {data.metallurgyAndYield.recycledGemstonesCount} نگین
              </span>
              <span className="text-[10px] text-[#8E8E9E] mt-0.5 block">
                ارزش: {Math.round(data.metallurgyAndYield.recycledGemstonesValuationToman / 1000000).toLocaleString('fa-IR')} میلیون تومان
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Anomaly & Fraud Sentinel */}
      {activeTab === 'anomalies' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#EDEDF4] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#FF4D4D]" />
                سامانه دیده‌بان ناهنجاری‌ها و انحرافات زنجیره (Anomaly & Fraud Sentinel)
              </h3>
              <span className="text-xs font-mono text-[#A8A8B8]">
                {data.anomalyAlerts.filter(a => !a.resolved).length} هشدار در انتظار رسیدگی
              </span>
            </div>

            <div className="space-y-3">
              {data.anomalyAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`border rounded-xl p-4 text-xs transition-all ${
                    alert.resolved
                      ? 'bg-[#121218]/50 border-[#262634] opacity-60'
                      : alert.severity === 'critical'
                      ? 'bg-[#2A1515] border-[#FF4D4D]/40'
                      : alert.severity === 'warning'
                      ? 'bg-[#261E14] border-[#C8A951]/40'
                      : 'bg-[#151922] border-[#00D1FF]/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#EDEDF2]">{alert.code}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#1A1A26] font-mono text-[#C8A951]">
                        {alert.domain}
                      </span>
                      <span className="text-[11px] font-bold text-[#EDEDF2]">{alert.titleFa}</span>
                    </div>

                    <span className="text-[10px] text-[#7A7A8E] font-mono">{alert.detectedAtFa}</span>
                  </div>

                  <p className="text-[#C4C4D4] leading-relaxed mb-3">{alert.descriptionFa}</p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#2D2D3E]">
                    <span className="text-[11px] text-[#A8A8B8]">
                      اقدام پیشنهادی هوش تجاری: <strong className="text-[#EDEDF2]">{alert.suggestedActionFa}</strong>
                    </span>

                    {!alert.resolved ? (
                      <button
                        onClick={() => handleResolveAnomaly(alert.id)}
                        disabled={resolvingId === alert.id}
                        className="px-3 py-1.5 rounded-lg bg-[#3DD68C]/15 hover:bg-[#3DD68C]/25 text-[#3DD68C] border border-[#3DD68C]/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-end sm:self-auto disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{resolvingId === alert.id ? 'ثبت رسیدگی...' : 'تایید پیگیری و رسیدگی'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#3DD68C] flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        رسیدگی شده است
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Predictive Scenario Simulator */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="bg-[#181822] border border-[#2B2B3E] rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-[#E5C365] flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#C8A951]" />
              شبیه‌ساز سناریوهای اقتصادی و نوسانات بازار طلا (What-If Predictive Simulator)
            </h3>
            <p className="text-xs text-[#9E9EB0] max-w-3xl leading-relaxed mb-4">
              محاسبه آنی اثر تغییرات مظنه طلا و جهش‌های فصلی بر ارزش پرتفوی اکوسیستم، ریسک کال مارجین بنکداران و موج بازخرید مصرف‌کنندگان.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {data.scenarios.map((scen, idx) => (
                <button
                  key={scen.id}
                  onClick={() => setSelectedScenarioIndex(idx)}
                  className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                    selectedScenarioIndex === idx
                      ? 'bg-[#2A2417] border-[#C8A951] text-[#E5C365] shadow-md'
                      : 'bg-[#14141C] border-[#29293C] text-[#9E9EB0] hover:border-[#3D3D52]'
                  }`}
                >
                  <span className="text-xs font-bold block text-[#EDEDF4]">{scen.titleFa}</span>
                  <span className="text-[11px] text-[#7A7A8E] mt-1 block">
                    نوسان نرخ: {scen.goldPriceChangePercent > 0 ? `+${scen.goldPriceChangePercent}٪` : `${scen.goldPriceChangePercent}٪`}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Scenario Impact Card */}
            <div className="bg-[#13131C] border border-[#2F2F44] rounded-xl p-5 text-xs">
              <h4 className="text-sm font-bold text-[#EDEDF2] mb-3">{currentScenario.titleFa}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#181824] p-3 rounded-lg border border-[#262638]">
                  <span className="text-[10px] text-[#7E7E90] block">مظنه شبیه‌سازی شده</span>
                  <span className="text-sm font-bold font-mono text-[#E5C365] mt-0.5 block">
                    {currentScenario.simulatedSpotPriceToman.toLocaleString('fa-IR')} تومان
                  </span>
                </div>

                <div className="bg-[#181824] p-3 rounded-lg border border-[#262638]">
                  <span className="text-[10px] text-[#7E7E90] block">ارزش جدید پرتفوی طلا</span>
                  <span className="text-sm font-bold font-mono text-[#00D1FF] mt-0.5 block">
                    {Math.round(currentScenario.projectedPortfolioValuationToman / 1000000000).toLocaleString('fa-IR')} میلیارد تومان
                  </span>
                </div>

                <div className="bg-[#181824] p-3 rounded-lg border border-[#262638]">
                  <span className="text-[10px] text-[#7E7E90] block">تغییر ارزش ترازنامه (دلتا)</span>
                  <span className={`text-sm font-bold font-mono mt-0.5 block ${
                    currentScenario.deltaValuationToman >= 0 ? 'text-[#3DD68C]' : 'text-[#FF4D4D]'
                  }`}>
                    {currentScenario.deltaValuationToman >= 0 ? '+' : ''}
                    {Math.round(currentScenario.deltaValuationToman / 1000000000).toLocaleString('fa-IR')} م.ت
                  </span>
                </div>

                <div className="bg-[#181824] p-3 rounded-lg border border-[#262638]">
                  <span className="text-[10px] text-[#7E7E90] block">احتمال موج تقاضای بازخرید</span>
                  <span className="text-sm font-bold text-[#E5C365] mt-0.5 block">
                    {currentScenario.buybackSurgeRiskFa === 'high' ? 'زیاد' :
                     currentScenario.buybackSurgeRiskFa === 'moderate' ? 'متوسط' : 'عادی'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#191926] border border-[#2D2D40] text-[#C4C4D4] leading-relaxed">
                {currentScenario.summaryFa}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
