import React from 'react';
import { Check, CheckCircle2, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { Booking } from '../types/travel';

export interface BookingProgressTrackerProps {
  bookingStatus: Booking['bookingStatus'];
  tripCategory: Booking['tripCategory'];
}

interface StageConfig {
  key: 'pending' | 'confirmed' | 'completed';
  label: string;
  caption: string;
}

const STAGES: StageConfig[] = [
  {
    key: 'pending',
    label: 'Menunggu',
    caption: 'Menunggu verifikasi pembayaran atau konfirmasi oleh tim ASRIVA.'
  },
  {
    key: 'confirmed',
    label: 'Terkonfirmasi',
    caption: 'Slot perjalanan telah diamankan dan siap menuju hari keberangkatan.'
  },
  {
    key: 'completed',
    label: 'Selesai',
    caption: 'Perjalanan telah selesai. Bagikan ulasan Anda untuk membantu wisatawan lain!'
  }
];

function resolveStageIndex(
  bookingStatus: Booking['bookingStatus'],
  tripCategory: Booking['tripCategory']
): number {
  if (tripCategory === 'completed' || bookingStatus === 'Selesai') return 2;
  if (bookingStatus.startsWith('Terkonfirmasi')) return 1;
  return 0;
}

export const BookingProgressTracker: React.FC<BookingProgressTrackerProps> = ({
  bookingStatus,
  tripCategory
}) => {
  if (tripCategory === 'cancelled' || bookingStatus === 'Dibatalkan') {
    return (
      <div className="rounded-xl bg-rose-50/80 border border-rose-200/80 px-3 py-2.5 flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
          <XCircle className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] font-bold text-rose-900">Reservasi Dibatalkan</div>
          <div className="text-[10px] text-rose-700 leading-snug">
            Pemesanan ini tidak lagi aktif dalam jadwal keberangkatan.
          </div>
        </div>
      </div>
    );
  }

  const currentStageIdx = resolveStageIndex(bookingStatus, tripCategory);
  const progressWidth = currentStageIdx === 0 ? '0%' : currentStageIdx === 1 ? '50%' : '100%';
  const activeStage = STAGES[currentStageIdx];

  return (
    <div
      className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 space-y-2.5"
      aria-label={`Progres pemesanan: ${activeStage.label}`}
    >
      <div className="flex items-center justify-between text-[10px]">
        <span className="font-bold uppercase tracking-wider text-slate-500">Status Perjalanan</span>
        <span
          className={`font-bold ${
            currentStageIdx === 2
              ? 'text-emerald-700'
              : currentStageIdx === 1
              ? 'text-[#136F99]'
              : 'text-[#D97706]'
          }`}
        >
          Tahap {currentStageIdx + 1} dari 3 • {activeStage.label}
        </span>
      </div>

      {/* Stepper Track & Nodes */}
      <div className="relative flex items-start justify-between px-2">
        {/* Background Rail */}
        <div className="absolute top-3 left-6 right-6 h-1 rounded-full bg-slate-200" />
        {/* Active Progress Rail */}
        <div
          className="absolute top-3 left-6 right-6 h-1 overflow-hidden rounded-full pointer-events-none"
        >
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              currentStageIdx === 2 ? 'bg-emerald-600' : 'bg-[#136F99]'
            }`}
            style={{ width: progressWidth }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIdx || (currentStageIdx === 2 && idx === 2);
          const isCurrent = idx === currentStageIdx && currentStageIdx < 2;
          const isPendingCurrent = isCurrent && idx === 0;

          let nodeClasses = 'bg-white border-2 border-slate-200 text-slate-400';
          if (isCompleted) {
            nodeClasses =
              currentStageIdx === 2
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#136F99] text-white shadow-xs';
            if (currentStageIdx === 2 && idx === 2) {
              nodeClasses += ' ring-4 ring-emerald-100';
            }
          } else if (isPendingCurrent) {
            nodeClasses = 'bg-[#D97706] text-white ring-4 ring-amber-100 shadow-xs';
          } else if (isCurrent) {
            nodeClasses = 'bg-[#0B2545] text-white ring-4 ring-[#E7F3F8] shadow-xs';
          }

          const renderIcon = () => {
            if (isCompleted) return <Check className="w-3.5 h-3.5 stroke-[2.75]" />;
            if (idx === 0) return <Clock className="w-3.5 h-3.5" />;
            if (idx === 1) return <ShieldCheck className="w-3.5 h-3.5" />;
            return <CheckCircle2 className="w-3.5 h-3.5" />;
          };

          return (
            <div key={stage.key} className="relative z-10 flex flex-col items-center w-20">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${nodeClasses}`}
              >
                {renderIcon()}
              </div>
              <span
                className={`mt-1.5 text-[10px] text-center leading-tight ${
                  idx <= currentStageIdx ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5 border-t border-slate-200/60">
        {activeStage.caption}
      </p>
    </div>
  );
};
