/**
 * Didar Gold Platform - Domain K03 Security Incident & Event Trail
 */

import React, { useState } from 'react';
import { SecurityEventLog, SecuritySeverity, SecurityEventType } from '../../types/k03.js';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Search,
  Filter,
  Clock,
  Terminal,
  UserCheck
} from 'lucide-react';

interface SecurityLogsViewerProps {
  logs: SecurityEventLog[];
}

export const SecurityLogsViewer: React.FC<SecurityLogsViewerProps> = ({ logs }) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filtered = logs.filter((log) => {
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.username && log.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.actorName && log.actorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.ipAddress.includes(searchTerm);
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (sev: SecuritySeverity) => {
    switch (sev) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5484D]/15 text-[#FF6B6B] border border-[#E5484D]/30 text-[10px] font-bold">
            <ShieldAlert className="w-3 h-3" />
            <span>بحرانی (Critical)</span>
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E5C365]/15 text-[#E5C365] border border-[#E5C365]/30 text-[10px] font-bold">
            <AlertTriangle className="w-3 h-3" />
            <span>هشدار (Warning)</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30 text-[10px] font-medium">
            <Info className="w-3 h-3" />
            <span>اطلاعی (Info)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#181822] p-4 rounded-2xl border border-[#2B2B3C]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7E90]" />
          <input
            type="text"
            placeholder="جستجوی رویداد امنیتی، IP، کاربر..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#121218] border border-[#2B2B3C] rounded-xl pr-9 pl-3 py-2 text-xs text-[#EDEDED] placeholder-[#6E6E80] focus:outline-none focus:border-[#C8A951]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#121218] border border-[#2B2B3C] rounded-xl px-3 py-2 text-xs text-[#9E9EA8] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه سطوح حساسیت (Severity)</option>
            <option value="critical">بحرانی و تهدیدات امنیتی</option>
            <option value="warning">هشدارها و تلاش‌های مشکوک</option>
            <option value="info">رویدادهای عادی و ورودها</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#181822] rounded-2xl border border-[#2B2B3C] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B2B3C] bg-[#14141B] text-[#868698]">
                <th className="py-3 px-4 font-medium">سطح حساسیت</th>
                <th className="py-3 px-4 font-medium">نوع رویداد</th>
                <th className="py-3 px-4 font-medium">کاربر / مجری</th>
                <th className="py-3 px-4 font-medium">شرح کامل رویداد امنیتی</th>
                <th className="py-3 px-4 font-medium">آدرس IP و کلاینت</th>
                <th className="py-3 px-4 font-medium">زمان دقیق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22222E]">
              {filtered.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-[#1E1E2B] transition-colors">
                    <td className="py-3.5 px-4">
                      {getSeverityBadge(log.severity)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#A0A0B0]">
                      {log.eventType}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#EDEDED]">
                        {log.actorName || log.username || 'سیستم خودکار'}
                      </div>
                      {log.username && (
                        <div className="text-[10px] text-[#7E7E90] font-mono">@{log.username}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[#C5C5D5] leading-relaxed max-w-md">
                      {log.details}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#868698]">
                      <div>{log.ipAddress}</div>
                      <div className="text-[10px] text-[#6E6E80] truncate max-w-[180px] font-sans">
                        {log.userAgent}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-[#868698] font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
