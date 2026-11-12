import React from 'react';
import { Bell, Plane, User } from 'lucide-react';

export interface AppHeaderProps {
  unreadNotificationsCount: number;
  onLogoClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  unreadNotificationsCount,
  onLogoClick,
  onNotificationsClick,
  onProfileClick
}) => (
  <header className="app-header px-4 h-[52px] pt-[6px]! pb-[6px]! flex items-center justify-between">
    <div onClick={onLogoClick} className="flex items-center gap-2.5 cursor-pointer">
      <div className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center shadow-xs">
        <Plane className="w-5 h-5" />
      </div>
      <div>
        <div className="text-sm font-black tracking-tight text-[#0B2545] leading-none">ASRIVA</div>
        <div className="text-[10px] font-bold tracking-widest text-[#136F99] mt-0.5">TRAVEL & TOURS</div>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={onNotificationsClick}
        className="relative w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center hover:bg-slate-200 transition"
      >
        <Bell className="w-4 h-4" />
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D97706]" />
        )}
      </button>

      <button
        type="button"
        aria-label="Pintasan profil"
        onClick={onProfileClick}
        className="w-9 h-9 rounded-xl bg-[#E7F3F8] text-[#0B2545] flex items-center justify-center font-bold text-xs"
      >
        <User className="w-4 h-4" />
      </button>
    </div>
  </header>
);
