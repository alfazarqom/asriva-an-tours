import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'navy' | 'ocean' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'ocean', className = '' }) => {
  const styles: Record<string, string> = {
    navy: 'bg-[#0B2545] text-white',
    ocean: 'bg-[#E7F3F8] text-[#136F99]',
    accent: 'bg-[#FEF3C7] text-[#B45309]',
    success: 'bg-[#ECFDF5] text-[#047857]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
    error: 'bg-[#FEF2F2] text-[#B91C1C]',
    neutral: 'bg-slate-100 text-slate-700'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
