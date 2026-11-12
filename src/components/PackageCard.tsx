import React from 'react';
import { Calendar, ChevronRight, Clock, Heart, MapPin, Star } from 'lucide-react';
import { TravelPackage } from '../types/travel';
import { formatDateReadable, formatIDR } from '../utils/formatters';
import { Badge } from './ui/Badge';

export interface PackageCardProps {
  pkg: TravelPackage;
  onSelect: (pkgId: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (pkgId: string) => void;
  compact?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onSelect,
  isWishlisted,
  onToggleWishlist,
  compact = false
}) => {
  const effectivePrice = pkg.discountPrice ?? pkg.price;
  const hasDiscount = typeof pkg.discountPrice === 'number' && pkg.discountPrice < pkg.price;
  const discountPercent = hasDiscount ? Math.round(((pkg.price - pkg.discountPrice!) / pkg.price) * 100) : 0;

  if (compact) {
    return (
      <div
        onClick={() => onSelect(pkg.id)}
        className="w-[248px] shrink-0 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs active:scale-[0.99] transition cursor-pointer flex flex-col"
      >
        <div className="relative h-32 w-full bg-slate-200">
          <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" />
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0B2545]/85 text-white backdrop-blur-xs">
            {pkg.category}
          </span>
          <button
            type="button"
            aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(pkg.id);
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
          </button>
          {hasDiscount && (
            <span className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D97706] text-white">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 mb-1">
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-[#136F99] shrink-0" />
                <span className="truncate">{pkg.destination}</span>
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-slate-700 shrink-0">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {pkg.rating.toFixed(1)}
              </span>
            </div>
            <h4 className="text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5">{pkg.name}</h4>
            <div className="text-[11px] text-slate-500 flex items-center justify-between mb-2.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {pkg.duration}
              </span>
              <span className="text-[10px] font-semibold text-emerald-700">Sisa {pkg.availability} kursi</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
            <div>
              {hasDiscount && (
                <div className="text-[10px] text-slate-400 line-through">{formatIDR(pkg.price)}</div>
              )}
              <div className="text-sm font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</div>
              <div className="text-[10px] text-slate-400">per dewasa</div>
            </div>
            <span className="px-2.5 py-1.5 rounded-lg bg-[#E7F3F8] text-[#136F99] text-[11px] font-bold">
              Detail
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(pkg.id)}
      className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs active:scale-[0.99] transition cursor-pointer"
    >
      <div className="relative h-44 w-full bg-slate-200">
        <img src={pkg.images[0]} alt={pkg.name} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#0B2545] shadow-xs">
            {pkg.category}
          </span>
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#D97706] text-white shadow-xs">
              Hemat {discountPercent}%
            </span>
          )}
        </div>
        <button
          type="button"
          aria-label={isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(pkg.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 text-slate-700 flex items-center justify-center shadow-xs active:scale-90 transition"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-600'}`} />
        </button>

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px]">
          <span className="inline-flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            {pkg.destination}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {pkg.rating.toFixed(1)} ({pkg.reviewCount})
            </span>
            <span className="inline-flex items-center gap-1 bg-black/45 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3" />
              {pkg.duration}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="text-[15px] font-bold text-slate-900 leading-snug mb-1.5">{pkg.name}</h3>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
          <span className="inline-flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-[#136F99] shrink-0" />
            <span className="truncate">
              Jadwal terdekat: <strong className="text-slate-700">{formatDateReadable(pkg.departureDates[0])}</strong>
            </span>
          </span>
          <Badge variant="success" className="shrink-0">
            Tersedia {pkg.availability} kursi
          </Badge>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Mulai dari</div>
            {hasDiscount && (
              <div className="text-xs text-slate-400 line-through leading-tight">{formatIDR(pkg.price)}</div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</span>
              <span className="text-[11px] text-slate-500">/ pax</span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(pkg.id);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow-xs hover:bg-[#06172D] active:scale-[0.98] transition inline-flex items-center gap-1"
          >
            <span>Lihat Detail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
