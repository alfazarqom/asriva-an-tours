import React from 'react';
import { Check } from 'lucide-react';
import { ToastMessage } from '../../types/travel';

export interface ToastStackProps {
  toasts: ToastMessage[];
}

export const ToastStack: React.FC<ToastStackProps> = ({ toasts }) => (
  <div className="pointer-events-none absolute top-14 left-3 right-3 z-50 flex flex-col gap-2">
    {toasts.map((toast) => {
      const styles = {
        success: 'bg-emerald-900 text-white',
        error: 'bg-rose-900 text-white',
        warning: 'bg-amber-900 text-white',
        info: 'bg-[#0B2545] text-white'
      }[toast.type];

      return (
        <div
          key={toast.id}
          className={`px-3.5 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 animate-fade-in ${styles}`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span className="flex-1">{toast.message}</span>
        </div>
      );
    })}
  </div>
);
