/**
 * Didar Gold Platform - Supabase Cloud Connectivity & Sync Modal
 */

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Cloud, ShieldCheck, X, Zap } from 'lucide-react';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SupabaseHealthData {
  configured: boolean;
  url: string | null;
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  status: 'connected' | 'unreachable' | 'not_configured';
  message: string;
  latencyMs?: number;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<SupabaseHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setSyncResult(null);
    try {
      const data = await api.getSupabaseHealth();
      setHealth(data);
    } catch {
      setHealth({
        configured: false,
        url: null,
        hasSecretKey: false,
        hasPublishableKey: false,
        status: 'unreachable',
        message: 'خطا در ارتباط با سرور'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.syncToSupabase();
      setSyncResult(res.message);
      await fetchHealth();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطای همگام‌سازی';
      setSyncResult(`خطا: ${msg}`);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292938]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 flex items-center justify-center text-[#3ECF8E]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">پایگاه داده ابری Supabase</h3>
              <p className="text-[11px] text-[#868694]">زیرساخت ذخیره‌سازی داده‌های توزیع‌شده دیدار طلا</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#868694] hover:text-[#EDEDED] hover:bg-[#22222E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {loading && !health ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#868694] text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#3ECF8E]" />
              <span>در حال پایش وضعیت سرویس Supabase...</span>
            </div>
          ) : health ? (
            <>
              {/* Status Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                  health.status === 'connected'
                    ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#6CE5AC]'
                    : health.status === 'not_configured'
                    ? 'bg-[#E5A84B]/10 border-[#E5A84B]/30 text-[#FFBA52]'
                    : 'bg-[#E5484D]/10 border-[#E5484D]/30 text-[#FF8585]'
                }`}
              >
                {health.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">
                    {health.status === 'connected'
                      ? 'اتصال پایگاه داده ابری فعال است'
                      : health.status === 'not_configured'
                      ? 'پیکربندی ناقص'
                      : 'سرویس در دسترس نیست'}
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">{health.message}</div>
                </div>
              </div>

              {/* Specs List */}
              <div className="p-3.5 rounded-xl bg-[#121217] border border-[#242432] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">آدرس پروژه (SUPABASE_URL):</span>
                  <span className="font-mono text-[11px] text-[#C8A951] dir-ltr select-all">
                    {health.url || 'تنظیم‌نشده'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">کلید سرویس و دسترسی ارشد (Secret Key):</span>
                  <span className="flex items-center gap-1.5">
                    {health.hasSecretKey ? (
                      <span className="text-[#3ECF8E] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>فعال (محفوظ در سرور)</span>
                      </span>
                    ) : (
                      <span className="text-[#E5484D]">یافت نشد</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">کلید عمومی (Publishable Key):</span>
                  <span className="flex items-center gap-1.5">
                    {health.hasPublishableKey ? (
                      <span className="text-[#3ECF8E] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>فعال</span>
                      </span>
                    ) : (
                      <span className="text-[#E5484D]">یافت نشد</span>
                    )}
                  </span>
                </div>

                {health.latencyMs !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#868694]">مدت زمان پاسخ (Latency):</span>
                    <span className="font-mono text-[11px] text-[#EDEDED] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#3ECF8E]" />
                      <span>{health.latencyMs} میلی‌ثانیه</span>
                    </span>
                  </div>
                )}
              </div>

              {syncResult && (
                <div className="p-3 rounded-xl bg-[#1C1C28] border border-[#3A3A4E] text-xs text-[#E5C365]">
                  {syncResult}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#292938]">
          <button
            onClick={fetchHealth}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#20202C] hover:bg-[#282838] text-xs text-[#9E9EA8] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>آزمایش مجدد اتصال</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing || !health?.configured}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#3ECF8E] hover:bg-[#4AE29D] text-[#111115] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#3ECF8E]/10"
            >
              <Cloud className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
              <span>{syncing ? 'در حال همگام‌سازی...' : 'همگام‌سازی ابری K01'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
