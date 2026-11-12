import React from 'react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction
}) => (
  <div className="flex flex-col items-center justify-center text-center py-10 px-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
    <div className="w-12 h-12 rounded-2xl bg-[#E7F3F8] text-[#136F99] flex items-center justify-center mb-3">
      {icon}
    </div>
    <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mb-4">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-semibold active:scale-[0.98] transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
