/**
 * Didar Gold Platform - Top Navigation Header
 * Gold & Charcoal styling with language switcher and operational indicators
 */

import React, { useState } from 'react';
import { useI18n, SupportedLocale } from '../../lib/i18n.js';
import { ShieldCheck, RefreshCw, Download, Globe, UserCheck, Layers, Database } from 'lucide-react';
import { SupabaseStatusModal } from '../k01/SupabaseStatusModal.js';

interface HeaderProps {
  onRefresh?: () => void;
  isLoading?: boolean;
  activeDomainCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading = false, activeDomainCount = 1 }) => {
  const { t, locale, setLocale } = useI18n();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  const handleExport = (format: 'json' | 'csv') => {
    window.open(`/api/admin/kernel/k01/export?format=${format}`, '_blank');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#16161A]/95 backdrop-blur border-b border-[#2A2A33] px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E5C365] via-[#C8A951] to-[#8C6D23] flex items-center justify-center shadow-lg shadow-[#C8A951]/20 border border-[#F4DC98]/40">
              <span className="font-bold text-[#141416] text-lg tracking-wider">DG</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#F4F4F6] tracking-tight">{t.appName}</h1>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#C8A951]/15 text-[#E5C365] border border-[#C8A951]/30">
                  {t.adminPanel}
                </span>
              </div>
              <p className="text-xs text-[#9E9EA8] line-clamp-1">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Mobile Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="md:hidden p-2 rounded-lg bg-[#202028] border border-[#2F2F3D] text-[#C8A951] hover:bg-[#282834]"
            title={t.refresh}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Actions & Status Tools */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Domain Readiness Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E1E26] border border-[#2C2C38] text-xs text-[#B5B5C2]">
            <Layers className="w-3.5 h-3.5 text-[#C8A951]" />
            <span>K01-K09: <strong className="text-[#3DD68C]">فعال و متصل</strong></span>
            <span className="text-[#555562]">|</span>
            <span>K10-K20: <span className="text-[#9E9EA8]">در صف پیاده‌سازی</span></span>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[#1E1E26] border border-[#2C2C38] rounded-lg p-1">
            <Globe className="w-3.5 h-3.5 text-[#9E9EA8] mx-1.5 hidden sm:block" />
            {(['fa', 'ar', 'en', 'fr'] as SupportedLocale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => setLocale(loc)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  locale === loc
                    ? 'bg-[#C8A951] text-[#141416] font-semibold shadow-sm'
                    : 'text-[#9E9EA8] hover:text-[#EDEDED] hover:bg-[#282834]'
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#C8A951] bg-[#C8A951]/10 hover:bg-[#C8A951]/20 border border-[#C8A951]/30 rounded-lg transition-colors"
              title={t.exportJson}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#B5B5C2] bg-[#22222C] hover:bg-[#2A2A38] border border-[#30303F] rounded-lg transition-colors"
              title={t.exportCsv}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>

          {/* Supabase Cloud Connection Status */}
          <button
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3ECF8E]/10 hover:bg-[#3ECF8E]/20 border border-[#3ECF8E]/30 text-xs text-[#6CE5AC] transition-all cursor-pointer shadow-sm"
            title="وضعیت پایگاه داده ابری Supabase"
          >
            <Database className="w-3.5 h-3.5 text-[#3ECF8E]" />
            <span className="hidden sm:inline font-medium">Supabase Cloud</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E] animate-ping"></span>
          </button>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#E5C365] bg-[#22222C] hover:bg-[#2A2A38] border border-[#333344] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t.refresh}</span>
          </button>

          {/* Current Operator Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#202028] to-[#1C1C22] border border-[#333342] text-xs">
            <div className="w-2 h-2 rounded-full bg-[#3DD68C] animate-pulse"></div>
            <div className="flex flex-col text-right">
              <span className="text-[#E0E0E6] font-medium leading-none">علیرضا سفیدپور</span>
              <span className="text-[10px] text-[#C8A951] leading-tight">مدیر ارشد عملیات هسته</span>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Health & Sync Modal */}
      <SupabaseStatusModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </header>
  );
};
