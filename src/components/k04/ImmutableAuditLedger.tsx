/**
 * Didar Gold Platform - K04: Immutable Audit Ledger
 * Cryptographic SHA-256 Hash Chained Audit Trail
 */

import React, { useState } from 'react';
import { AuditLogEntry, ChainIntegrityReport } from '../../types/k04.js';
import {
  ShieldCheck,
  Hash,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Search,
  ExternalLink,
  Lock,
  Layers,
  FileCode,
  X,
  Filter
} from 'lucide-react';

interface ImmutableAuditLedgerProps {
  entries: AuditLogEntry[];
  chainIntegrity: ChainIntegrityReport;
  onVerifyIntegrity: () => Promise<void>;
  isVerifying: boolean;
}

export const ImmutableAuditLedger: React.FC<ImmutableAuditLedgerProps> = ({
  entries,
  chainIntegrity,
  onVerifyIntegrity,
  isVerifying
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (selectedDomain !== 'all' && entry.domainCode !== selectedDomain) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = entry.actionTitleFa.toLowerCase().includes(q);
      const matchActor = entry.actorName.toLowerCase().includes(q);
      const matchHash = entry.entryHash.toLowerCase().includes(q);
      const matchEntity = entry.targetId.toLowerCase().includes(q);
      if (!matchAction && !matchActor && !matchHash && !matchEntity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Cryptographic Chain Integrity Banner */}
      <div className={`p-4 rounded-2xl border transition-all ${
        chainIntegrity.isValid
          ? 'bg-[#122218] border-[#254A34]'
          : 'bg-[#331116] border-[#FF4D4D]'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              chainIntegrity.isValid ? 'bg-[#1D3B28] text-[#3DD68C]' : 'bg-[#47171E] text-[#FF6B6B]'
            }`}>
              {chainIntegrity.isValid ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-[#EDEDED]">
                  {chainIntegrity.isValid
                    ? 'وضعیت زنجیره تغییرناپذیر SHA-256: یکپارچه و معتبر'
                    : 'هشدار امنیتی: نقض یکپارچگی یا تغییر غیرمجاز در زنجیره لاگ‌ها!'}
                </h4>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#A0A0B2] border border-white/5">
                  {chainIntegrity.verifiedBlocksCount} بلوک پیوسته
                </span>
              </div>
              <p className="text-xs text-[#9FA0B0] mt-0.5">
                توالی هر ردیف لاگ با ترکیب هش قبلی (Chained Merkle Tree) تضمین می‌کند حتی مدیر دیتابیس نیز قادر به دستکاری یا حذف وقایع نیست.
              </p>
            </div>
          </div>

          <button
            onClick={onVerifyIntegrity}
            disabled={isVerifying}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202E24] text-[#3DD68C] border border-[#3DD68C]/40 hover:bg-[#283D30] font-semibold text-xs transition-colors shrink-0 shadow-sm"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'در حال راستی‌آزمایی هش‌ها...' : 'راستی‌آزمایی محاسباتی زنجیره'}</span>
          </button>
        </div>

        {/* Chain Hashes Display */}
        <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="bg-black/30 p-2 rounded-lg truncate text-[#8B8B9E]">
            <span className="text-[#C8A951] ml-1">Genesis Block:</span>
            {chainIntegrity.genesisHash}
          </div>
          <div className="bg-black/30 p-2 rounded-lg truncate text-[#8B8B9E]">
            <span className="text-[#3DD68C] ml-1">Latest Head Hash:</span>
            {chainIntegrity.latestHash}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#15151D] p-3.5 rounded-2xl border border-[#262634]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#727284]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس عنوان اقدام، نام مجری، هش رمزنگاری، یا شناسه رکورد..."
            className="w-full bg-[#1C1C26] border border-[#2F2F40] rounded-xl pr-9 pl-4 py-2 text-xs text-[#EDEDED] placeholder-[#6E6E80] focus:outline-none focus:border-[#C8A951]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="bg-[#1C1C26] border border-[#2F2F40] rounded-xl px-3 py-2 text-xs text-[#B5B5C4] focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">تمام هسته‌ها (K01 تا K04)</option>
            <option value="K04">هسته K04 (تأییدات، استثناها و حسابرسی)</option>
            <option value="K03">هسته K03 (احراز هویت و MFA)</option>
            <option value="K02">هسته K02 (پذیرش و سقف اعتبارات)</option>
            <option value="K01">هسته K01 (هویت و اشخاص)</option>
          </select>
        </div>
      </div>

      {/* Audit Blocks Table */}
      <div className="bg-[#15151E] rounded-2xl border border-[#272736] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-[#1C1C26] text-[#8C8CA0] border-b border-[#292938]">
                <th className="py-3 px-4 font-semibold">بلوک #</th>
                <th className="py-3 px-4 font-semibold">زمان و دامنه</th>
                <th className="py-3 px-4 font-semibold">شرح اقدام و رویداد</th>
                <th className="py-3 px-4 font-semibold">کاربر مجری (Actor)</th>
                <th className="py-3 px-4 font-semibold">اثر طلا / مالی</th>
                <th className="py-3 px-4 font-semibold">امضای هش SHA-256</th>
                <th className="py-3 px-4 font-semibold text-center">جزئیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232330]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#78788C]">
                    رکوردی با مشخصات جستجویافته در زنجیره حسابرسی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-[#1A1A25] transition-colors"
                  >
                    {/* Sequence */}
                    <td className="py-3 px-4 font-mono font-bold text-[#C8A951]">
                      #{entry.sequenceNumber}
                    </td>

                    {/* Timestamp & Domain */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#252536] text-[#C8A951] font-bold">
                          {entry.domainCode}
                        </span>
                        <span className="font-mono text-[11px] text-[#A2A2B4]">
                          {entry.timestamp}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#6E6E80] font-mono block mt-0.5">
                        IP: {entry.ipAddress}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 max-w-[260px]">
                      <span className="font-semibold text-[#EDEDED] block truncate" title={entry.actionTitleFa}>
                        {entry.actionTitleFa}
                      </span>
                      <span className="text-[10px] text-[#808092] font-mono block truncate">
                        {entry.targetEntity}:{entry.targetId}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[#EDEDED] font-medium block">
                        {entry.actorName}
                      </span>
                      <span className="text-[10px] text-[#858598] block">
                        {entry.actorRoleFa}
                      </span>
                    </td>

                    {/* Gold / Financial Impact */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono">
                      {entry.details?.goldWeightGrams ? (
                        <span className="text-[#E5C365] font-semibold block">
                          {Number(entry.details.goldWeightGrams).toLocaleString()} گرم
                        </span>
                      ) : (
                        <span className="text-[#656574]">—</span>
                      )}
                      {entry.details?.financialValueIrr ? (
                        <span className="text-[10px] text-[#9E9EA8] block">
                          {(Number(entry.details.financialValueIrr) / 1000000).toLocaleString()} م ریال
                        </span>
                      ) : null}
                    </td>

                    {/* Cryptographic Hash */}
                    <td className="py-3 px-4 font-mono text-[10px] max-w-[180px]">
                      <div className="truncate text-[#3DD68C] font-semibold flex items-center gap-1" title={entry.entryHash}>
                        <Hash className="w-3 h-3 text-[#C8A951] shrink-0" />
                        <span>{entry.entryHash.substring(0, 16)}...</span>
                      </div>
                      <div className="truncate text-[#68687A] text-[9px]" title={`هش قبلی: ${entry.previousHash}`}>
                        Prev: {entry.previousHash.substring(0, 12)}...
                      </div>
                    </td>

                    {/* Action to view raw JSON */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="p-1.5 rounded-lg text-[#9A9AB0] hover:text-[#EDEDED] hover:bg-[#252534] transition-colors"
                        title="مشاهده ساختار داده تغییرناپذیر"
                      >
                        <FileCode className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Inspection Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#181822] border border-[#313144] rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-[#2B2B3C]">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#C8A951]" />
                <h4 className="text-xs font-bold text-[#EDEDED]">
                  بسته اطلاعات تغییرناپذیر بلوک #{selectedEntry.sequenceNumber}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEntry(null)}
                className="p-1 rounded-lg text-[#88889C] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#121218] border border-[#222230] font-mono text-[11px] space-y-1">
                <div><span className="text-[#C8A951]">Action:</span> {selectedEntry.actionCode} - {selectedEntry.actionTitleFa}</div>
                <div><span className="text-[#3DD68C]">Hash:</span> {selectedEntry.entryHash}</div>
                <div><span className="text-[#8E8EA0]">PrevHash:</span> {selectedEntry.previousHash}</div>
              </div>

              <div className="text-[11px] text-[#9A9AB0] font-semibold">محتوای متاداده (Payload Details JSON):</div>
              <pre className="p-3 rounded-xl bg-[#101017] border border-[#222230] font-mono text-[11px] text-[#A6E22E] overflow-x-auto max-h-60">
                {JSON.stringify(selectedEntry.details, null, 2)}
              </pre>
            </div>

            <div className="pt-3 border-t border-[#2B2B3C] flex justify-end">
              <button
                onClick={() => setSelectedEntry(null)}
                className="px-4 py-1.5 rounded-xl bg-[#222230] text-xs text-[#EDEDED]"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
