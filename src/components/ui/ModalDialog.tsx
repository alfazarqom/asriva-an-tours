import React from 'react';
import { X } from 'lucide-react';

export interface ModalDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const ModalDialog: React.FC<ModalDialogProps> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-[440px] max-h-[82%] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 text-xs text-slate-600 leading-relaxed">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};
