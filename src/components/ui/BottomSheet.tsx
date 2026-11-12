import React from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/50 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-h-[85%] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
