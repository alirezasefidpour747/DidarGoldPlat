/**
 * Didar Gold Platform - Independent Database & Storage Engine Modal
 * 100% Self-Hosted & Independent: Zero dependency on Supabase or external vendor clouds.
 */

import React, { useState, useEffect } from 'react';
import { api, DatabaseHealthData } from '../../lib/api.js';
import { Database, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, X, Server } from 'lucide-react';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<DatabaseHealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setSyncResult(null);
    try {
      const data = await api.getDatabaseHealth();
      setHealth(data);
    } catch {
      setHealth(null);
      setSyncResult('وضعیت ذخیره‌سازی قابل تأیید نیست؛ سرویس سلامت پاسخ نداد.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#171720] border border-[#2F2F40] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292938]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C8A951]/10 border border-[#C8A951]/30 flex items-center justify-center text-[#C8A951]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#EDEDED]">وضعیت ذخیره‌سازی و پایگاه داده</h3>
              <p className="text-[11px] text-[#868694]">گزارش صریح قابلیت‌های پیاده‌سازی‌شده و پیاده‌سازی‌نشده</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#868694] hover:text-[#EDEDED] hover:bg-[#22222E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          {loading && !health ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#868694] text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C8A951]" />
              <span>در حال پایش وضعیت پایگاه داده محلی و سرور...</span>
            </div>
          ) : health ? (
            <>
              {/* Status Banner */}
              <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${health.ready ? 'bg-[#3DD68C]/10 border-[#3DD68C]/30 text-[#4EE59D]' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
                {health.ready ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <span>{health.ready ? 'اتصال PostgreSQL با کوئری واقعی تأیید شد' : 'اتصال PostgreSQL در دسترس نیست'}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#3DD68C]/20 text-[#3DD68C] font-mono">
                      {health.latencyMs}ms
                    </span>
                  </div>
                  <div className="text-[11px] mt-0.5 opacity-90">{health.message}</div>
                </div>
              </div>

              {/* Specs List */}
              <div className="p-3.5 rounded-xl bg-[#121217] border border-[#242432] space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">موتور ذخیره‌سازی فعال:</span>
                  <span className="font-bold text-[#C8A951]">
                    PostgreSQL · K01 system of record
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">اتصال PostgreSQL تأییدشده:</span>
                  <span className={`flex items-center gap-1 font-semibold ${health.connectivityVerified ? 'text-[#3DD68C]' : 'text-amber-300'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{health.connectivityVerified ? 'بله — SELECT 1 موفق' : 'خیر'}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">دامنه مهاجرت‌شده:</span>
                  <span className="font-mono text-[11px] text-[#EDEDED]">K01</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#868694]">دامنه‌های مهاجرت‌نشده:</span>
                  <span className="text-[11px] text-amber-300">K02 تا K20</span>
                </div>
              </div>

              {/* CI/CD & Self-Hosted Note */}
              <div className="p-3 rounded-xl bg-[#191924] border border-[#2B2B3E] text-[11px] text-[#A6A6B8] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#C8A951] font-semibold">
                  <Server className="w-3.5 h-3.5" />
                  <span>Package 2 · PostgreSQL foundation</span>
                </div>
                <p className="leading-relaxed">
                  K01 اکنون از PostgreSQL استفاده می‌کند. احراز هویت و اعمال RBAC هنوز پیاده‌سازی نشده‌اند و انتشار تولید مسدود است.
                </p>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div className="p-2.5 rounded-lg bg-[#20202E] border border-[#333348] text-[11px] text-[#EDEDED]">
                  {syncResult}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-start pt-2">
                <button
                  onClick={fetchHealth}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1E28] hover:bg-[#252534] border border-[#2E2E3E] text-xs text-[#9E9EA8] hover:text-[#EDEDED] transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#C8A951]' : ''}`} />
                  <span>بررسی مجدد اتصال</span>
                </button>

              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-xl border bg-red-500/10 border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{syncResult || 'وضعیت ذخیره‌سازی قابل تأیید نیست.'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
