import React from 'react';
import { Briefcase, MessageSquarePlus, Pencil, Star } from 'lucide-react';
import { BookingProgressTracker } from '../../components/BookingProgressTracker';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Booking, TripSubTab } from '../../types/travel';
import { formatDateReadable, formatIDR } from '../../utils/formatters';

export interface MyTripsPageProps {
  bookings: Booking[];
  verifiedBookingRefs: string[];
  tripSubTab: TripSubTab;
  onChangeTripSubTab: (tab: TripSubTab) => void;
  lookupRef: string;
  onChangeLookupRef: (value: string) => void;
  lookupContact: string;
  onChangeLookupContact: (value: string) => void;
  lookupError: string;
  onLookupBooking: (e: React.FormEvent) => void;
  onOpenBookingDetail: (bookingReference: string) => void;
  onOpenReviewModal: (bookingReference: string) => void;
  onNavigateToExplore: () => void;
}

const TRIP_TAB_LABELS: Record<TripSubTab, string> = {
  upcoming: 'Akan Datang',
  completed: 'Selesai',
  cancelled: 'Dibatalkan'
};

export const MyTripsPage: React.FC<MyTripsPageProps> = ({
  bookings,
  verifiedBookingRefs,
  tripSubTab,
  onChangeTripSubTab,
  lookupRef,
  onChangeLookupRef,
  lookupContact,
  onChangeLookupContact,
  lookupError,
  onLookupBooking,
  onOpenBookingDetail,
  onOpenReviewModal,
  onNavigateToExplore
}) => {
  const unlockedBookings = bookings.filter((b) => verifiedBookingRefs.includes(b.bookingReference));
  const filteredTrips = unlockedBookings.filter((b) => b.tripCategory === tripSubTab);

  return (
    <div className="p-4 space-y-4 pb-8">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900">Perjalanan Saya</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Pantau progres reservasi, ulas perjalanan selesai, atau cari pemesanan tamu dengan Kode Booking.
        </p>
      </div>

      {/* Trip Category Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/70">
        {(
          [
            { id: 'upcoming', label: 'Akan Datang' },
            { id: 'completed', label: 'Selesai' },
            { id: 'cancelled', label: 'Dibatalkan' }
          ] as const
        ).map((tab) => {
          const count = unlockedBookings.filter((b) => b.tripCategory === tab.id).length;
          const active = tripSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChangeTripSubTab(tab.id)}
              className={`py-2 px-1.5 rounded-lg text-[11px] font-bold transition ${
                active ? 'bg-white text-[#0B2545] shadow-2xs' : 'text-slate-600'
              }`}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Verified Trips List */}
      {filteredTrips.length > 0 ? (
        <div className="space-y-3.5">
          {filteredTrips.map((b) => {
            const isConfirmed = b.bookingStatus === 'Terkonfirmasi - Slot Ditahan';
            const badgeVariant =
              b.tripCategory === 'cancelled'
                ? 'error'
                : b.tripCategory === 'completed'
                ? 'success'
                : isConfirmed
                ? 'ocean'
                : 'warning';

            return (
              <div
                key={b.bookingReference}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-[#0B2545]">{b.bookingReference}</span>
                  <Badge variant={badgeVariant}>{b.bookingStatus}</Badge>
                </div>

                <div className="flex gap-3">
                  <img
                    src={b.packageImage}
                    alt={b.packageName}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 leading-snug">{b.packageName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.destination}</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Pembayaran: <strong>{b.paymentStatus}</strong>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Tracker */}
                <BookingProgressTracker bookingStatus={b.bookingStatus} tripCategory={b.tripCategory} />

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Keberangkatan</div>
                    <div className="font-bold text-slate-800">{formatDateReadable(b.departureDate)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Total Pembayaran</div>
                    <div className="font-bold text-[#0B2545]">{formatIDR(b.totalAmount)}</div>
                  </div>
                </div>

                {/* Submitted Review Card for Completed Trips */}
                {b.tripCategory === 'completed' && b.review && (
                  <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`w-3.5 h-3.5 ${
                              idx < b.review!.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-slate-800 ml-1">
                          {b.review.rating}/5
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenReviewModal(b.bookingReference)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#136F99] hover:underline"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit Ulasan
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">"{b.review.comment}"</p>
                    <div className="text-[10px] text-slate-500">
                      Oleh {b.review.author} • {b.review.submittedAt}
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                {b.tripCategory === 'completed' && !b.review ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenBookingDetail(b.bookingReference)}
                      className="py-2.5 px-3 rounded-xl bg-[#E7F3F8] text-[#136F99] text-xs font-bold active:scale-[0.98] transition"
                    >
                      Lihat Detail
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenReviewModal(b.bookingReference)}
                      className="py-2.5 px-3 rounded-xl bg-[#0B2545] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-xs hover:bg-[#06172D] active:scale-[0.98] transition"
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Beri Ulasan</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onOpenBookingDetail(b.bookingReference)}
                    className="w-full py-2.5 rounded-xl bg-[#E7F3F8] text-[#136F99] text-xs font-bold active:scale-[0.99] transition"
                  >
                    Lihat Detail Pemesanan
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Briefcase className="w-6 h-6" />}
          title={`Belum Ada Perjalanan ${TRIP_TAB_LABELS[tripSubTab]}`}
          description={
            tripSubTab === 'upcoming'
              ? 'Pesan paket perjalanan atau cari reservasi yang sudah ada di bawah ini menggunakan Kode Booking.'
              : `Anda tidak memiliki riwayat perjalanan berstatus ${TRIP_TAB_LABELS[tripSubTab].toLowerCase()}.`
          }
          actionLabel={tripSubTab === 'upcoming' ? 'Jelajahi Paket' : undefined}
          onAction={tripSubTab === 'upcoming' ? onNavigateToExplore : undefined}
        />
      )}

      {/* Guest Booking Lookup Form */}
      <form
        onSubmit={onLookupBooking}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3"
      >
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cari Pemesanan Tamu</h3>
          <p className="text-[11px] text-slate-500">
            Masukkan Kode Booking beserta Email atau Nomor Telepon yang digunakan saat checkout.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Kode Booking</label>
          <input
            type="text"
            value={lookupRef}
            onChange={(e) => onChangeLookupRef(e.target.value.toUpperCase())}
            placeholder="Contoh: ASR-2611-XXXXXX"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email atau Nomor Telepon</label>
          <input
            type="text"
            value={lookupContact}
            onChange={(e) => onChangeLookupContact(e.target.value)}
            placeholder="Masukkan email atau nomor telepon saat pemesanan"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
        </div>

        {lookupError && <AlertBanner type="error">{lookupError}</AlertBanner>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow-xs hover:bg-[#06172D] active:scale-[0.99] transition"
        >
          Cari & Verifikasi Pemesanan
        </button>
      </form>
    </div>
  );
};
