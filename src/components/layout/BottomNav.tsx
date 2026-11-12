import React from 'react';
import { Briefcase, Compass, Heart, Home, User } from 'lucide-react';
import { MainTab } from '../../types/travel';
import { triggerHaptic } from '../../utils/nativeExperience';

export interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'explore', label: 'Eksplorasi', icon: Compass },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'bookings', label: 'Perjalanan', icon: Briefcase },
  { id: 'profile', label: 'Profil', icon: User }
] as const;

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => (
  <nav className="bottom-nav px-1.5 py-1.5 grid grid-cols-5" aria-label="Navigasi utama">
    {NAV_ITEMS.map((navItem) => {
      const IconComponent = navItem.icon;
      const isActive = activeTab === navItem.id;
      return (
        <button
          key={navItem.id}
          type="button"
          onClick={() => {
            if (!isActive) {
              triggerHaptic(8);
              onChangeTab(navItem.id);
            }
          }}
          className={`py-1.5 rounded-xl flex flex-col items-center justify-center gap-1 transition active:scale-95 ${
            isActive ? 'text-[#0B2545] font-bold' : 'text-slate-400 font-medium hover:text-slate-600'
          }`}
        >
          <div
            className={`px-3 py-1 rounded-full transition-all duration-150 ${
              isActive ? 'bg-[#E7F3F8] text-[#136F99] scale-105' : 'bg-transparent scale-100'
            }`}
          >
            <IconComponent className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-none">{navItem.label}</span>
        </button>
      );
    })}
  </nav>
);
