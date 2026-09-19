import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Building2,
  User,
  Radio,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { ProvenanceEvent, UniqueItemPassport } from '../../types/k06';

interface ProvenanceTimelineProps {
  events: ProvenanceEvent[];
  passports: UniqueItemPassport[];
  onSelectPassport: (passport: UniqueItemPassport) => void;
}

export const ProvenanceTimeline: React.FC<ProvenanceTimelineProps> = ({
  events,
  passports,
  onSelectPassport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.titleFa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.locationFa.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || e.eventType === filterType;

    return matchesSearch && matchesType;
  });

  const getEventBadge = (type: ProvenanceEvent['eventType']) => {
    switch (type) {
      case 'assay_hallmarked':
        return {
          bg: 'bg-[#C8A951]/15 text-[#E5C365] border-[#C8A951]/40',
          icon: Scale
        };
      case 'vault_intake_qc':
        return {
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
          icon: Building2
        };
      case 'consumer_registered':
        return {
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
          icon: CheckCircle2
        };
      case 'stolen_flagged':
        return {
          bg: 'bg-[#E5484D]/15 text-[#FF6B6B] border-[#E5484D]/40',
          icon: AlertTriangle
        };
      case 'recovered_cleared':
        return {
          bg: 'bg-teal-500/15 text-teal-300 border-teal-500/40',
          icon: ShieldCheck
        };
      default:
        return {
          bg: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-[#161622] p-4 rounded-2xl border border-[#28283C] shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در وقایع زنجیره (شناسه UID، عنوان رویداد، متصدی، شهر)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-[#191926] border border-[#2E2E44] text-[#EDEDED] placeholder-[#767688] rounded-xl focus:outline-none focus:border-[#C8A951] pl-9"
            />
            <Search className="w-4 h-4 text-[#A0A0B5] absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-[#A0A0B5]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-3 py-2 bg-[#191926] border border-[#2E2E44] text-[#EDEDED] rounded-xl focus:outline-none focus:border-[#C8A951]"
          >
            <option value="all">تمام انواع رویدادها</option>
            <option value="assay_hallmarked">سنجش عیار و انگ ری‌گیری</option>
            <option value="vault_intake_qc">پذیرش در خزانه و QC</option>
            <option value="consignment_transferred">تحویل امانی به گالری</option>
            <option value="consumer_registered">فروش و ثبت مالکیت خریدار</option>
            <option value="stolen_flagged">اعلام سرقت در شبکه</option>
            <option value="recovered_cleared">رفع پرچم سرقت</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="bg-[#161622] rounded-2xl p-12 text-center border border-[#28283C] shadow-md">
          <Clock className="w-12 h-12 text-[#6C6C80] mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">هیچ رویدادی با این شرایط یافت نشد</h4>
          <p className="text-xs text-[#A0A0B5] mt-1">عبارت جستجو یا فیلتر را تغییر دهید.</p>
        </div>
      ) : (
        <div className="bg-[#161622] rounded-2xl p-6 border border-[#28283C] shadow-md">
          <div className="relative border-r-2 border-[#28283C] pr-6 mr-3 space-y-8">
            {filteredEvents.map((event) => {
              const badge = getEventBadge(event.eventType);
              const IconComponent = badge.icon;
              const relatedPassport = passports.find((p) => p.id === event.passportId);

              return (
                <div key={event.id} className="relative group">
                  {/* Pin Dot */}
                  <div className="absolute -right-[33px] top-1.5 w-5 h-5 rounded-full bg-[#161622] border-2 border-[#C8A951] flex items-center justify-center group-hover:scale-125 transition-transform shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-[#C8A951]" />
                  </div>

                  {/* Event Card */}
                  <div className="bg-[#191926] hover:bg-[#1E1E2F] p-5 rounded-2xl border border-[#28283C] hover:border-[#C8A951]/40 transition-all shadow-md">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.bg}`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          {event.eventTypeFa}
                        </span>

                        <span className="font-mono text-xs font-bold text-[#E5C365] bg-[#161622] px-2 py-0.5 rounded border border-[#2E2E44]">
                          {event.uid}
                        </span>
                      </div>

                      <span className="text-xs text-[#A0A0B5] font-mono">{event.timestampFa}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1">{event.titleFa}</h4>
                    <p className="text-xs text-[#A0A0B5] leading-relaxed">{event.descriptionFa}</p>

                    {/* Flow & Participants */}
                    <div className="mt-4 pt-3 border-t border-[#242436] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-[#A0A0B5]">
                        <span className="text-[#828299]">انتقال فیزیکی:</span>
                        <span className="font-semibold text-white">{event.fromHolder}</span>
                        <ArrowLeft className="w-3 h-3 text-[#C8A951]" />
                        <span className="font-semibold text-white">{event.toHolder}</span>
                      </div>

                      <div className="text-[#A0A0B5]">
                        <span className="text-[#828299]">متصدی / ناظر:</span>{' '}
                        <span className="font-medium text-white">
                          {event.actorName} ({event.actorRoleFa})
                        </span>
                      </div>

                      <div className="text-[#A0A0B5]">
                        <span className="text-[#828299]">موقعیت ثبت:</span>{' '}
                        <span className="font-medium text-white">{event.locationFa}</span>
                      </div>
                    </div>

                    {/* Cryptographic Proof & Passport Link */}
                    <div className="mt-3 pt-2.5 border-t border-[#242436] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="font-mono text-[#828299] dir-ltr text-right">
                        هش تراکنش دفتر کل: <span className="text-[#C8A951]">{event.blockHash}</span>
                      </div>

                      {relatedPassport && (
                        <button
                          onClick={() => onSelectPassport(relatedPassport)}
                          className="text-[#E5C365] hover:text-[#FFD875] font-semibold hover:underline flex items-center gap-1"
                        >
                          مشاهده شناسنامه کامل مصنوع ({relatedPassport.productSkuCode})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
