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
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Scale
        };
      case 'vault_intake_qc':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: Building2
        };
      case 'consumer_registered':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      case 'stolen_flagged':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: AlertTriangle
        };
      case 'recovered_cleared':
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
          icon: ShieldCheck
        };
      default:
        return {
          bg: 'bg-purple-100 text-purple-900 border-purple-300',
          icon: Clock
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در وقایع زنجیره (شناسه UID، عنوان رویداد، متصدی، شهر)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 pl-9"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">هیچ رویدادی با این شرایط یافت نشد</h4>
          <p className="text-xs text-slate-500 mt-1">عبارت جستجو یا فیلتر را تغییر دهید.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="relative border-r-2 border-slate-200 pr-6 mr-3 space-y-8">
            {filteredEvents.map((event) => {
              const badge = getEventBadge(event.eventType);
              const IconComponent = badge.icon;
              const relatedPassport = passports.find((p) => p.id === event.passportId);

              return (
                <div key={event.id} className="relative group">
                  {/* Pin Dot */}
                  <div className="absolute -right-[33px] top-1.5 w-5 h-5 rounded-full bg-white border-2 border-purple-600 flex items-center justify-center group-hover:scale-125 transition-transform shadow-xs">
                    <div className="w-2 h-2 rounded-full bg-purple-600" />
                  </div>

                  {/* Event Card */}
                  <div className="bg-slate-50 hover:bg-amber-50/20 p-5 rounded-2xl border border-slate-200 hover:border-amber-300 transition-all shadow-2xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badge.bg}`}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                          {event.eventTypeFa}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {event.uid}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 font-mono">{event.timestampFa}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">{event.titleFa}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{event.descriptionFa}</p>

                    {/* Flow & Participants */}
                    <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-400">انتقال فیزیکی:</span>
                        <span className="font-semibold text-slate-800">{event.fromHolder}</span>
                        <ArrowLeft className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-800">{event.toHolder}</span>
                      </div>

                      <div className="text-slate-600">
                        <span className="text-slate-400">متصدی / ناظر:</span>{' '}
                        <span className="font-medium text-slate-800">
                          {event.actorName} ({event.actorRoleFa})
                        </span>
                      </div>

                      <div className="text-slate-600">
                        <span className="text-slate-400">موقعیت ثبت:</span>{' '}
                        <span className="font-medium text-slate-800">{event.locationFa}</span>
                      </div>
                    </div>

                    {/* Cryptographic Proof & Passport Link */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <div className="font-mono text-slate-400 dir-ltr text-right">
                        هش تراکنش دفتر کل: <span className="text-slate-600">{event.blockHash}</span>
                      </div>

                      {relatedPassport && (
                        <button
                          onClick={() => onSelectPassport(relatedPassport)}
                          className="text-amber-800 hover:text-amber-950 font-semibold hover:underline flex items-center gap-1"
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
