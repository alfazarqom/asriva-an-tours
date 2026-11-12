import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

export interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const config = {
    info: {
      bg: 'bg-[#E7F3F8] border-[#BAE6FD] text-[#0B2545]',
      icon: <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#136F99]" />
    },
    warning: {
      bg: 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]',
      icon: <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D97706]" />
    },
    error: {
      bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
      icon: <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
    },
    success: {
      bg: 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#059669]" />
    }
  }[type];

  return (
    <div className={`rounded-xl border p-3 text-xs leading-relaxed flex gap-2.5 ${config.bg} ${className}`}>
      {config.icon}
      <div className="flex-1 min-w-0">
        {title && <div className="font-bold mb-0.5">{title}</div>}
        <div>{children}</div>
      </div>
    </div>
  );
};
