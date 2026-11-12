import React, { useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Heart,
  MapPin,
  Share2,
  Sparkles,
  Star,
  Users,
  XCircle
} from 'lucide-react';
import { PackageItineraryTimeline } from '../../components/PackageItineraryTimeline';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { PACKAGES_DATA } from '../../data/packages';
import { ReviewItem } from '../../types/travel';
import { formatDateReadable, formatIDR } from '../../utils/formatters';

export interface PackageDetailPageProps {
  packageId: string;
  extraReviews?: ReviewItem[];
  wishlistIds: string[];
  onToggleWishlist: (pkgId: string) => void;
  onSharePackage: () => void;
  onBack: () => void;
  onFallbackToExplore: () => void;
  onOpenDestination: (destinationId: string) => void;
  onStartBooking: (packageId: string) => void;
}

export const PackageDetailPage: React.FC<PackageDetailPageProps> = ({
  packageId,
  extraReviews = [],
  wishlistIds,
  onToggleWishlist,
  onSharePackage,
  onBack,
  onFallbackToExplore,
  onOpenDestination,
  onStartBooking
}) => {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const pkg = PACKAGES_DATA.find((p) => p.id === packageId);

  if (!pkg) {
    return (
      <div className="app-shell">
        <StandaloneHeader title="Detail Paket" onBack={onBack} />
        <div className="app-content p-4">
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="Paket Wisata Tidak Ditemukan"
            description="Paket perjalanan ini tidak tersedia atau telah dihapus."
            actionLabel="Jelajahi Paket Lain"
            onAction={onFallbackToExplore}
          />
        </div>
      </div>
    );
  }

  const effectivePrice = pkg.discountPrice ?? pkg.price;
  const hasDiscount = typeof pkg.discountPrice === 'number' && pkg.discountPrice < pkg.price;
  const safeImgIdx = Math.min(galleryIndex, pkg.images.length - 1);
  const isWishlisted = wishlistIds.includes(pkg.id);
  const combinedReviews = [...extraReviews, ...pkg.reviews];
  const totalReviewCount = pkg.reviewCount + extraReviews.length;
  const computedRating =
    extraReviews.length > 0
      ? (pkg.rating * pkg.reviewCount + extraReviews.reduce((sum, r) => sum + r.rating, 0)) /
        totalReviewCount
      : pkg.rating;

  return (
    <div className="app-shell">
      <StandaloneHeader
        title="Detail Paket Wisata"
        onBack={onBack}
        rightSlot={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleWishlist(pkg.id)}
              aria-label="Simpan ke wishlist"
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onSharePackage}
              aria-label="Bagikan paket"
              className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <div className="app-content pb-6">
        {/* Image Gallery */}
        <div className="relative h-60 w-full bg-slate-900">
          <img
            src={pkg.images[safeImgIdx]}
            alt={`${pkg.name} ${safeImgIdx + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex gap-1.5 bg-black/50 backdrop-blur-xs px-2.5 py-1.5 rounded-full">
              {pkg.images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGalleryIndex(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === safeImgIdx ? 'w-5 bg-white' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
            <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold">
              {safeImgIdx + 1} / {pkg.images.length}
            </span>
          </div>
        </div>

        {pkg.images.length > 1 && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
            {pkg.images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGalleryIndex(i)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                  i === safeImgIdx ? 'border-[#0B2545]' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-4 space-y-4">
          {/* Title, Destination, Rating, Description */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <Badge variant="ocean">{pkg.category}</Badge>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{computedRating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({totalReviewCount} ulasan)</span>
              </div>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 leading-snug mb-1.5">{pkg.name}</h2>

            <button
              type="button"
              onClick={() => onOpenDestination(pkg.destinationId)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#136F99] mb-3"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{pkg.destination}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

            <div className="grid grid-cols-2 gap-2.5 mt-3.5 pt-3.5 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E7F3F8] text-[#136F99] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Durasi</div>
                  <div className="font-bold text-slate-800">{pkg.duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E7F3F8] text-[#136F99] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Ketersediaan</div>
                  <div className="font-bold text-emerald-700">Sisa {pkg.availability} Kursi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">Keunggulan Pengalaman</h3>
            <ul className="space-y-2">
              {pkg.highlights.map((hl, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Meeting Point & Departure Dates */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#136F99]" />
              <span>Jadwal Keberangkatan & Titik Kumpul</span>
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {pkg.departureDates.map((dateStr) => (
                <span
                  key={dateStr}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  {formatDateReadable(dateStr)}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl">
              <div>
                <strong className="text-slate-700">Lokasi Keberangkatan:</strong> {pkg.departureLocation}
              </div>
              <div>
                <strong className="text-slate-700">Titik Kumpul:</strong> {pkg.meetingPoint}
              </div>
            </div>
          </div>

          {/* Interactive Day-by-Day Itinerary */}
          <PackageItineraryTimeline key={pkg.id} itinerary={pkg.itinerary} />

          {/* Included & Excluded Services */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Layanan Termasuk</h3>
              <ul className="space-y-1.5">
                {pkg.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Layanan Tidak Termasuk</h3>
              <ul className="space-y-1.5">
                {pkg.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Important Information & Cancellation Policy */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Catatan Penting</h3>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                {pkg.importantNotes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">Kebijakan Pembatalan</h3>
              <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                {pkg.cancellationPolicy.map((pol, i) => (
                  <li key={i}>{pol}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Ulasan Pelanggan</h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0B2545]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {computedRating.toFixed(1)} ({totalReviewCount})
              </span>
            </div>
            <div className="space-y-2.5">
              {combinedReviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{rev.author}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400 mb-1.5">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3 h-3 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Booking CTA */}
      <div className="bottom-action-bar flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Harga per dewasa</div>
          {hasDiscount && (
            <div className="text-[11px] text-slate-400 line-through leading-none">{formatIDR(pkg.price)}</div>
          )}
          <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(effectivePrice)}</div>
        </div>
        <button
          type="button"
          onClick={() => onStartBooking(pkg.id)}
          className="px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] active:scale-[0.98] transition"
        >
          Pesan Sekarang
        </button>
      </div>
    </div>
  );
};
