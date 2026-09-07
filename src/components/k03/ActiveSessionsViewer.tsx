/**
 * Didar Gold Platform - Domain K03 Active Sessions & Device Monitor
 */

import React, { useState } from 'react';
import { AuthSession } from '../../types/k03.js';
import {
  Laptop,
  Smartphone,
  Server,
  LogOut,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  Activity,
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface ActiveSessionsViewerProps {
  sessions: AuthSession[];
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeAllUserSessions: (userId: string) => Promise<void>;
}

export const ActiveSessionsViewer: React.FC<ActiveSessionsViewerProps> = ({
  sessions,
  onRevokeSession,
  onRevokeAllUserSessions
}) => {
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const activeSessions = sessions.filter(s => !s.isRevoked);

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await onRevokeSession(id);
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Laptop className="w-5 h-5 text-[#C8A951]" />;
      case 'mobile':
      case 'tablet':
        return <Smartphone className="w-5 h-5 text-[#3DD68C]" />;
      case 'pos_terminal':
        return <Server className="w-5 h-5 text-[#0091FF]" />;
      default:
        return <Laptop className="w-5 h-5 text-[#9E9EA8]" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-[#181822] p-4 rounded-2xl border border-[#2B2B3C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C8A951]/15 flex items-center justify-center border border-[#C8A951]/30">
            <Activity className="w-5 h-5 text-[#C8A951]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#EDEDED] flex items-center gap-2">
              <span>نشست‌های فعال و دسترسی‌های زنده صنف طلا</span>
              <span className="px-2 py-0.5 rounded-full bg-[#3DD68C]/15 text-[#3DD68C] text-[10px] font-mono">
                {activeSessions.length} نشست زنده
              </span>
            </h3>
            <p className="text-[11px] text-[#868698] mt-0.5">
              مدیریت و کنترل دستگاه‌های متصل، پایانه‌های فروشگاهی و ابطال نشست‌های مشکوک به صورت آنی
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSessions.map((session) => {
          return (
            <div
              key={session.id}
              className={`p-4 rounded-2xl border transition-all ${
                session.isCurrent
                  ? 'bg-[#191924] border-[#C8A951]/60 shadow-lg shadow-[#C8A951]/5'
                  : 'bg-[#181822] border-[#2B2B3C] hover:border-[#38384E]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14141B] flex items-center justify-center border border-[#262634] shrink-0">
                    {getDeviceIcon(session.deviceType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#EDEDED]">
                        {session.deviceName}
                      </span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C8A951]/20 text-[#E5C365] border border-[#C8A951]/40 text-[9px] font-bold">
                          این دستگاه (نشست جاری شما)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#9E9EA8] mt-0.5 font-medium">
                      کاربر: <span className="text-[#EDEDED] font-semibold">{session.fullName}</span> ({session.username})
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevoke(session.id)}
                    disabled={revokingId === session.id}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#E5484D]/15 text-[#FF6B6B] hover:bg-[#E5484D]/25 border border-[#E5484D]/30 text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                    title="ابطال این نشست"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>ابطال</span>
                  </button>
                )}
              </div>

              {/* Session Meta Info */}
              <div className="mt-4 pt-3 border-t border-[#232330] grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#868698]">
                  <MapPin className="w-3.5 h-3.5 text-[#7E7E90]" />
                  <span className="truncate">{session.locationApprox}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#868698]">
                  <Clock className="w-3.5 h-3.5 text-[#7E7E90]" />
                  <span>فعالیت: {session.lastActivityAt}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between text-[10px] text-[#7E7E90] pt-1">
                  <span className="font-mono">IP: {session.ipAddress}</span>
                  <span>سیستم‌عامل: {session.os} • {session.browser}</span>
                </div>
              </div>

              {/* MFA Verified badge */}
              <div className="mt-3 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1 text-[#3DD68C]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>احراز دوعاملی برای این نشست تایید شده است</span>
                </div>
                <span className="text-[#686878]">انقضا: {session.expiresAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
