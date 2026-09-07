/**
 * Didar Gold Platform - Immutable Audit Trail Viewer
 */

import React, { useState } from 'react';
import { AuditEvent } from '../../types/k01.js';
import { useI18n } from '../../lib/i18n.js';
import { Search, History, Shield, Filter, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuditTrailViewerProps {
  auditLogs: AuditEvent[];
}

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ auditLogs }) => {
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedTargetType, setSelectedTargetType] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.targetId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchAction = selectedAction === 'all' || log.action === selectedAction;
    const matchTarget = selectedTargetType === 'all' || log.targetType === selectedTargetType;

    return matchSearch && matchAction && matchTarget;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3DD68C]/15 text-[#3DD68C] border border-[#3DD68C]/30">ثبت جدید (CREATE)</span>;
      case 'UPDATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#65A7E5]/15 text-[#65A7E5] border border-[#65A7E5]/30">ویرایش (UPDATE)</span>;
      case 'STATUS_CHANGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5A84B]/15 text-[#E5A84B] border border-[#E5A84B]/30">تغییر وضعیت (STATUS)</span>;
      case 'ARCHIVE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30">بایگانی (ARCHIVE)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#2A2A38] text-[#C8A951] border border-[#3E3E52]">{action}</span>;
    }
  };

  const getTargetTypeLabel = (type: string) => {
    switch (type) {
      case 'party': return 'شخص حقیقی';
      case 'organization': return 'سازمان / کسب‌وکار';
      case 'membership': return 'پیوند عضویت';
      case 'document': return 'سند انطباق';
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#171720] border border-[#272736] p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A7A8A]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی رویداد با نام مجری، شرح تغییر، شناسه موجودیت..."
            className="w-full bg-[#121217] border border-[#2C2C3C] focus:border-[#C8A951] text-xs text-[#EDEDED] pr-9 pl-4 py-2.5 rounded-xl outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه انواع عملیات</option>
            <option value="CREATE">ثبت اولیه (CREATE)</option>
            <option value="UPDATE">ویرایش داده‌ها (UPDATE)</option>
            <option value="STATUS_CHANGE">تغییر وضعیت (STATUS)</option>
            <option value="ARCHIVE">بایگانی (ARCHIVE)</option>
          </select>

          <select
            value={selectedTargetType}
            onChange={(e) => setSelectedTargetType(e.target.value)}
            className="bg-[#121217] border border-[#2C2C3C] text-xs text-[#CECED8] px-3 py-2.5 rounded-xl outline-none focus:border-[#C8A951]"
          >
            <option value="all">همه رده‌های موجودیت</option>
            <option value="party">شخص حقیقی</option>
            <option value="organization">سازمان</option>
            <option value="membership">پیوند عضویت</option>
            <option value="document">اسناد صندوق</option>
          </select>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-[#171720] border border-[#272736] rounded-2xl p-4 shadow-lg space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7A7A8A]">
            رویداد حسابرسی منطبق با فیلتر یافت نشد.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-xl bg-[#191924] border border-[#262636] hover:border-[#38384E] transition-colors space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getActionBadge(log.action)}
                  <span className="text-xs text-[#C8A951] font-semibold">
                    {getTargetTypeLabel(log.targetType)}
                  </span>
                  <span className="font-mono text-[11px] text-[#7A7A8A]">
                    [{log.targetId}]
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8A8A9A]">
                  <span className="font-semibold text-[#EDEDED]">{log.actorName}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">
                    {new Date(log.timestamp).toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>

              <div className="text-xs text-[#D8D8E2] leading-relaxed pt-1">
                {log.description}
              </div>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="pt-2">
                  <div className="p-2 rounded-lg bg-[#121218] border border-[#242432] text-[11px] font-mono text-[#9E9EA8] overflow-x-auto">
                    {JSON.stringify(log.metadata, null, 2)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
