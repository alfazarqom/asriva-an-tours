import React from 'react';
import { DurationFilter, PriceFilter } from '../../types/travel';
import { BottomSheet } from '../ui/BottomSheet';

export interface ExploreFilterSheetProps {
  open: boolean;
  onClose: () => void;
  priceFilter: PriceFilter;
  onChangePriceFilter: (value: PriceFilter) => void;
  durationFilter: DurationFilter;
  onChangeDurationFilter: (value: DurationFilter) => void;
  onResetFilters: () => void;
  resultCount: number;
}

export const ExploreFilterSheet: React.FC<ExploreFilterSheetProps> = ({
  open,
  onClose,
  priceFilter,
  onChangePriceFilter,
  durationFilter,
  onChangeDurationFilter,
  onResetFilters,
  resultCount
}) => (
  <BottomSheet open={open} title="Filter Paket Wisata" onClose={onClose}>
    <div className="space-y-4 text-xs">
      <div>
        <div className="font-bold text-slate-900 mb-2">Rentang Harga (per dewasa)</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'Semua Harga' },
            { id: 'under5m', label: 'Di bawah Rp 5 Jt' },
            { id: '5mto15m', label: 'Rp 5 Jt – 15 Jt' },
            { id: 'above15m', label: 'Di atas Rp 15 Jt' }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangePriceFilter(opt.id as PriceFilter)}
              className={`py-2.5 px-3 rounded-xl border font-semibold ${
                priceFilter === opt.id
                  ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="font-bold text-slate-900 mb-2">Durasi Perjalanan</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: 'Semua Durasi' },
            { id: '1to3', label: '1 – 3 Hari' },
            { id: '4to5', label: '4 – 5 Hari' },
            { id: '6plus', label: '6+ Hari' }
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeDurationFilter(opt.id as DurationFilter)}
              className={`py-2.5 px-3 rounded-xl border font-semibold ${
                durationFilter === opt.id
                  ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-700"
        >
          Atur Ulang
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-[#0B2545] text-white font-bold"
        >
          Terapkan ({resultCount})
        </button>
      </div>
    </div>
  </BottomSheet>
);
