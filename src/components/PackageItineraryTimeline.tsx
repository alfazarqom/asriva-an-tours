import React, { useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Clock,
  Compass,
  Hotel,
  Plane,
  Utensils
} from 'lucide-react';
import { ItineraryActivityType, ItineraryItem } from '../types/travel';

export interface PackageItineraryTimelineProps {
  itinerary: ItineraryItem[];
}

const getActivityMeta = (type: ItineraryActivityType) => {
  switch (type) {
    case 'transport':
      return {
        icon: Plane,
        badgeClass: 'bg-[#E7F3F8] text-[#136F99] border-[#136F99]/15',
        dotClass: 'bg-[#136F99]'
      };
    case 'meal':
      return {
        icon: Utensils,
        badgeClass: 'bg-amber-50 text-[#D97706] border-amber-200/80',
        dotClass: 'bg-[#D97706]'
      };
    case 'stay':
      return {
        icon: Hotel,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        dotClass: 'bg-emerald-600'
      };
    case 'sightseeing':
    default:
      return {
        icon: Compass,
        badgeClass: 'bg-slate-100 text-[#0B2545] border-slate-200/80',
        dotClass: 'bg-[#0B2545]'
      };
  }
};

export const PackageItineraryTimeline: React.FC<PackageItineraryTimelineProps> = ({ itinerary }) => {
  const [expandedDays, setExpandedDays] = useState<number[]>(() =>
    itinerary.length > 0 ? [itinerary[0].day] : []
  );
  const [activeDay, setActiveDay] = useState<number | null>(() =>
    itinerary.length > 0 ? itinerary[0].day : null
  );
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  if (itinerary.length === 0) {
    return null;
  }

  const allExpanded = itinerary.length > 0 && expandedDays.length === itinerary.length;

  const toggleDay = (day: number) => {
    setActiveDay(day);
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  };

  const handleSelectStripDay = (day: number) => {
    setActiveDay(day);
    setExpandedDays((prev) => (prev.includes(day) ? prev : [...prev, day]));
    const target = dayRefs.current[day];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedDays([]);
    } else {
      setExpandedDays(itinerary.map((item) => item.day));
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
      {/* Header & Bulk Expand Control */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Rencana Perjalanan (Itinerary)</h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E7F3F8] text-[#136F99] text-[10px] font-bold">
              <CalendarDays className="w-3 h-3" />
              {itinerary.length} Hari
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Ketuk setiap hari untuk melihat detail jadwal aktivitas terencana
          </p>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          className="shrink-0 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-[#0B2545] transition"
        >
          {allExpanded ? 'Tutup Semua' : 'Buka Semua'}
        </button>
      </div>

      {/* Horizontal Visual Day-by-Day Route Strip */}
      <div
        className="flex items-center overflow-x-auto no-scrollbar pb-1"
        role="navigation"
        aria-label="Navigasi hari itinerary"
      >
        {itinerary.map((item, idx) => {
          const isOpen = expandedDays.includes(item.day);
          const isFocused = activeDay === item.day;
          return (
            <React.Fragment key={item.day}>
              <button
                type="button"
                onClick={() => handleSelectStripDay(item.day)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition ${
                  isFocused
                    ? 'bg-[#0B2545] text-white border-[#0B2545] shadow-xs'
                    : isOpen
                      ? 'bg-[#E7F3F8] text-[#0B2545] border-[#136F99]/30'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-extrabold ${
                    isFocused
                      ? 'bg-white/20 text-white'
                      : isOpen
                        ? 'bg-[#136F99] text-white'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.day}
                </span>
                <span>Hari {item.day}</span>
              </button>
              {idx < itinerary.length - 1 && (
                <div
                  className={`w-4 h-0.5 shrink-0 transition-colors ${
                    isOpen && expandedDays.includes(itinerary[idx + 1].day)
                      ? 'bg-[#136F99]/60'
                      : 'bg-slate-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Vertical Expandable Day-by-Day Timeline */}
      <div className="relative space-y-2.5 before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E7F3F8]">
        {itinerary.map((item) => {
          const isExpanded = expandedDays.includes(item.day);
          const activityCount = item.activities?.length ?? 0;
          const panelId = `itinerary-day-panel-${item.day}`;
          const buttonId = `itinerary-day-btn-${item.day}`;

          return (
            <div
              key={item.day}
              ref={(el) => {
                dayRefs.current[item.day] = el;
              }}
              className="relative pl-10"
            >
              {/* Day Marker Node */}
              <div
                className={`absolute left-0 top-3 w-8 h-8 rounded-full text-xs font-extrabold flex items-center justify-center border-2 transition-colors ${
                  isExpanded
                    ? 'bg-[#0B2545] text-white border-[#E7F3F8] shadow-xs'
                    : 'bg-white text-[#0B2545] border-[#136F99]/30'
                }`}
              >
                {item.day}
              </div>

              {/* Day Card */}
              <div
                className={`rounded-2xl border transition-colors overflow-hidden ${
                  isExpanded
                    ? 'border-[#136F99]/30 bg-slate-50/60'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={panelId}
                  onClick={() => toggleDay(item.day)}
                  className="w-full text-left p-3 flex items-start justify-between gap-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#136F99]">
                        Hari {item.day}
                      </span>
                      {activityCount > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {activityCount} aktivitas
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-900 leading-snug">{item.title}</div>

                    {/* Compact preview metadata when collapsed */}
                    {!isExpanded && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] text-slate-500">
                        {item.meals && item.meals.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-800">
                            <Utensils className="w-2.5 h-2.5 text-[#D97706]" />
                            {item.meals.join(', ')}
                          </span>
                        )}
                        {item.accommodation && (
                          <span className="inline-flex items-center gap-1 truncate max-w-[200px]">
                            <Hotel className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item.accommodation}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isExpanded
                        ? 'bg-[#0B2545] text-white rotate-180'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Expanded Day Content */}
                {isExpanded && (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="px-3 pb-3.5 pt-1 border-t border-slate-200/70 space-y-3"
                  >
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                    {/* Planned Activities Timeline */}
                    {item.activities && item.activities.length > 0 && (
                      <div className="bg-white rounded-xl p-3 border border-slate-200/70 space-y-2.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Jadwal Aktivitas Terencana
                        </div>
                        <div className="space-y-2.5 relative before:absolute before:left-[13px] before:top-2.5 before:bottom-2.5 before:w-px before:bg-slate-200">
                          {item.activities.map((act, idx) => {
                            const meta = getActivityMeta(act.type);
                            const IconComponent = meta.icon;
                            return (
                              <div key={idx} className="relative pl-8 flex items-start justify-between gap-2">
                                <div
                                  className={`absolute left-0 top-0.5 w-7 h-7 rounded-lg border flex items-center justify-center ${meta.badgeClass}`}
                                >
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#136F99] mb-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{act.time}</span>
                                  </div>
                                  <div className="text-xs font-bold text-slate-900 leading-snug">
                                    {act.title}
                                  </div>
                                  {act.detail && (
                                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                      {act.detail}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Meals & Accommodation Badges */}
                    {(item.meals?.length || item.accommodation) && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.meals && item.meals.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                            <Utensils className="w-3 h-3 text-[#D97706]" />
                            {item.meals.join(', ')}
                          </span>
                        )}
                        {item.accommodation && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                            <Hotel className="w-3 h-3 text-emerald-600" />
                            {item.accommodation}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
