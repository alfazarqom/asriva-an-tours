import React from 'react';
import {
  Briefcase,
  Building2,
  ChevronRight,
  FileText,
  Headphones,
  Heart,
  HelpCircle,
  LogOut,
  Settings,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { GuestInformation, InfoPageKey } from '../../types/travel';

export interface ProfilePageProps {
  guestInfo: GuestInformation;
  onChangeGuestInfo: React.Dispatch<React.SetStateAction<GuestInformation>>;
  wishlistCount: number;
  verifiedBookingCount: number;
  onNavigateToWishlist: () => void;
  onNavigateToBookings: () => void;
  onOpenInfoPage: (page: InfoPageKey) => void;
  onClearGuestSession: () => void;
}

const INFO_MENU_ITEMS: { label: string; icon: React.ReactNode; page: InfoPageKey }[] = [
  { label: 'Pusat Bantuan & FAQ', icon: <HelpCircle className="w-4 h-4" />, page: 'help' },
  { label: 'Hubungi Kami', icon: <Headphones className="w-4 h-4" />, page: 'contact' },
  { label: 'Tentang ASRIVA Travel & Tours', icon: <Building2 className="w-4 h-4" />, page: 'about' },
  { label: 'Syarat & Ketentuan', icon: <FileText className="w-4 h-4" />, page: 'terms' },
  { label: 'Kebijakan Privasi', icon: <ShieldCheck className="w-4 h-4" />, page: 'privacy' }
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  guestInfo,
  onChangeGuestInfo,
  wishlistCount,
  verifiedBookingCount,
  onNavigateToWishlist,
  onNavigateToBookings,
  onOpenInfoPage,
  onClearGuestSession
}) => (
  <div className="p-4 space-y-4 pb-8">
    {/* Profile Photo & Guest Header */}
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
      <div className="w-14 h-14 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center shrink-0 font-extrabold text-lg">
        {guestInfo.fullName.trim() ? guestInfo.fullName.trim().slice(0, 2).toUpperCase() : 'AS'}
      </div>
      <div className="min-w-0 flex-1">
        <Badge variant="ocean" className="mb-1">
          Profil Wisatawan Tamu
        </Badge>
        <h2 className="text-base font-extrabold text-slate-900 truncate">
          {guestInfo.fullName.trim() || 'Penjelajah Tamu ASRIVA'}
        </h2>
        <p className="text-xs text-slate-500 truncate">
          {guestInfo.email.trim() || 'Tidak memerlukan pendaftaran akun'}
        </p>
      </div>
    </div>

    {/* Personal & Contact Information */}
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Informasi Pribadi & Kontak</h3>
        <p className="text-[11px] text-slate-500">Otomatis mengisi formulir guest checkout Anda</p>
      </div>
      <div className="space-y-2.5">
        <input
          type="text"
          value={guestInfo.fullName}
          onChange={(e) => onChangeGuestInfo((prev) => ({ ...prev, fullName: e.target.value }))}
          placeholder="Nama Lengkap"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
        />
        <input
          type="email"
          value={guestInfo.email}
          onChange={(e) => onChangeGuestInfo((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Alamat Email"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
        />
        <input
          type="tel"
          value={guestInfo.phone}
          onChange={(e) => onChangeGuestInfo((prev) => ({ ...prev, phone: e.target.value }))}
          placeholder="Nomor Telepon / WhatsApp"
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
        />
      </div>
    </div>

    {/* Quick Shortcuts: Wishlist & Booking History */}
    <div className="grid grid-cols-2 gap-2.5">
      <button
        type="button"
        onClick={onNavigateToWishlist}
        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left active:scale-[0.98] transition"
      >
        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
          <Heart className="w-4 h-4" />
        </div>
        <div className="text-xs font-bold text-slate-900">Wishlist</div>
        <div className="text-[11px] text-slate-500">{wishlistCount} paket tersimpan</div>
      </button>

      <button
        type="button"
        onClick={onNavigateToBookings}
        className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs text-left active:scale-[0.98] transition"
      >
        <div className="w-9 h-9 rounded-xl bg-[#E7F3F8] text-[#136F99] flex items-center justify-center mb-2">
          <Briefcase className="w-4 h-4" />
        </div>
        <div className="text-xs font-bold text-slate-900">Riwayat Pemesanan</div>
        <div className="text-[11px] text-slate-500">{verifiedBookingCount} perjalanan</div>
      </button>
    </div>

    {/* Settings, Support & Reset Session */}
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
      {INFO_MENU_ITEMS.map((item) => (
        <button
          key={item.page}
          type="button"
          onClick={() => onOpenInfoPage(item.page)}
          className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition"
        >
          <div className="flex items-center gap-3">
            <span className="text-[#136F99]">{item.icon}</span>
            <span className="text-xs font-semibold text-slate-800">{item.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      ))}

      <button
        type="button"
        onClick={onClearGuestSession}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-rose-50/50 transition text-rose-600"
      >
        <div className="flex items-center gap-3">
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-bold">Bersihkan Sesi Tamu / Keluar</span>
        </div>
        <Settings className="w-4 h-4 opacity-50" />
      </button>
    </div>
  </div>
);
