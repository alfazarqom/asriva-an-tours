import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface StandaloneHeaderProps {
  title: string;
  onBack: () => void;
  rightSlot?: React.ReactNode;
}

export const StandaloneHeader: React.FC<StandaloneHeaderProps> = ({ title, onBack, rightSlot }) => (
  <header className="app-header px-3.5 pt-[6px]! pb-[6px]! flex items-center justify-between gap-2">
    <button
      type="button"
      onClick={onBack}
      aria-label="Kembali"
      className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition shrink-0"
    >
      <ChevronLeft className="w-5 h-5" />
    </button>
    <h1 className="text-[15px] font-bold text-slate-900 truncate flex-1 text-center">{title}</h1>
    <div className="min-w-[36px] flex justify-end shrink-0">{rightSlot}</div>
  </header>
);
