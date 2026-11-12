import React from 'react';
import { Briefcase, CheckCircle2, Copy, MessageSquarePlus, Star } from 'lucide-react';
import { AulaaPaymentBox } from '../../components/AulaaPaymentBox';
import { BookingProgressTracker } from '../../components/BookingProgressTracker';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { Booking, ToastMessage } from '../../types/travel';
import { formatDateReadable, formatIDR, formatTravelerTypeLabel } from '../../utils/formatters';

export interface BookingResultPageProps {
  bookingReference: string;
  isConfirmationScreen: boolean;
  bookings: Booking[];
  isCheckingAulaaStatus?: boolean;
  isCancellingAulaa?: boolean;
  onRefreshAulaaStatus?: (bookingReference: string) => void;
  onBack: () => void;
  onFallbackToBookings: () => void;
  onOpenBookingDetail: (bookingReference: string) => void;
  onOpenReviewModal: (bookingReference: string) => void;
  onCancelBooking: (bookingReference: string) => void;
  onReturnHome: () => void;
  onShowToast: (message: string, type?: ToastMessage['type']) => void;
}

export const BookingResultPage: React.FC<BookingResultPageProps> = ({
  bookingReference,
  isConfirmationScreen,
  bookings,
  isCheckingAulaaStatus = false,
  isCancellingAulaa = false,
  onRefreshAulaaStatus,
  onBack,
  onFallbackToBookings,
  onOpenBookingDetail,
  onOpenReviewModal,
  onCancelBooking,
  onReturnHome,
  onShowToast
}) => {
  const booking = bookings.find((b) => b.bookingReference === bookingReference);
  if (!booking) {
    return (
      <div className="app-shell">
        <StandaloneHeader title="Detail Pemesanan" onBack={onBack} />
        <div className="app-content p-4">
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="Data Pemesanan Tidak Tersedia"
            description="Kami tidak dapat menemukan data pemesanan ini pada sesi Anda."
            actionLabel="Ke Perjalanan Saya"
            onAction={onFallbackToBookings}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <StandaloneHeader
        title={isConfirmationScreen ? 'Konfirmasi Pemesanan' : 'Detail Perjalanan'}
        onBack={onBack}
      />

      <div className="app-content p-4 space-y-4 pb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <Badge variant={booking.tripCategory === 'cancelled' ? 'error' : 'success'} className="mb-1.5">
            {booking.bookingStatus}
          </Badge>
          <h2 className="text-lg font-extrabold text-slate-900">
            {isConfirmationScreen ? 'Reservasi Berhasil Dicatat' : 'Rincian Reservasi'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Simpan Kode Booking di bawah ini untuk melihat atau mengelola reservasi Anda kapan saja di menu Perjalanan
            Saya.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-dashed border-[#136F99]/40 flex items-center justify-between">
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-slate-400">Kode Booking</div>
              <div className="text-base font-extrabold tracking-wider text-[#0B2545]">
                {booking.bookingReference}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(booking.bookingReference);
                onShowToast('Kode Booking berhasil disalin!', 'success');
              }}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1 active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              Salin
            </button>
          </div>
        </div>

        <BookingProgressTracker
          bookingStatus={booking.bookingStatus}
          tripCategory={booking.tripCategory}
        />

        <AlertBanner
          type={
            booking.tripCategory === 'cancelled' ||
            booking.paymentStatus === 'Pembayaran Gagal' ||
            booking.paymentStatus === 'Kadaluarsa (Melewati Batas Waktu)'
              ? 'error'
              : booking.paymentStatus === 'Lunas (Terverifikasi)'
              ? 'success'
              : 'warning'
          }
          title={`Status Pembayaran: ${booking.paymentStatus}`}
        >
          Metode penyelesaian: <strong>{booking.paymentMethodName}</strong>.{' '}
          {booking.aulaaTransaction
            ? 'Selesaikan pembayaran melalui halaman checkout Aulaa atau instruksi di bawah ini, lalu cek status transaksi secara berkala.'
            : `Cantumkan kode ${booking.bookingReference} saat menyelesaikan pembayaran bersama ASRIVA Travel & Tours.`}
        </AlertBanner>

        {booking.aulaaTransaction && (
          <AulaaPaymentBox
            transaction={booking.aulaaTransaction}
            isCheckingStatus={isCheckingAulaaStatus}
            isCancelling={isCancellingAulaa}
            onRefreshStatus={() => onRefreshAulaaStatus?.(booking.bookingReference)}
            onCancelTransaction={() => onCancelBooking(booking.bookingReference)}
            onShowToast={onShowToast}
          />
        )}

        {/* Package & Departure Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Informasi Paket & Keberangkatan</h3>
          <div className="flex gap-3 pb-3 border-b border-slate-100">
            <img
              src={booking.packageImage}
              alt={booking.packageName}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div>
              <div className="font-bold text-slate-900 text-sm">{booking.packageName}</div>
              <div className="text-[11px] font-semibold text-[#136F99] mt-0.5">{booking.optionName}</div>
              <div className="text-slate-500 mt-0.5">
                {booking.destination} • {booking.duration}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tanggal Keberangkatan</span>
            <span className="font-bold text-slate-900">{formatDateReadable(booking.departureDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Jumlah Peserta</span>
            <span className="font-bold text-slate-900">
              {booking.adults} Dewasa
              {booking.children > 0 ? `, ${booking.children} Anak` : ''}
              {booking.infants > 0 ? `, ${booking.infants} Bayi` : ''}
            </span>
          </div>
          <div>
            <div className="text-slate-500">Titik Kumpul</div>
            <div className="font-semibold text-slate-800 mt-0.5">{booking.meetingPoint}</div>
          </div>
        </div>

        {/* Guest & Travelers */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Pemesan & Daftar Peserta</h3>
          <div className="p-2.5 rounded-xl bg-slate-50 space-y-1">
            <div className="font-bold text-slate-900">{booking.guest.fullName}</div>
            <div className="text-slate-600">{booking.guest.email}</div>
            <div className="text-slate-600">Telepon: {booking.guest.phone}</div>
          </div>
          <div className="space-y-1.5 pt-1">
            {booking.travelers.map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="font-semibold text-slate-800">
                  {idx + 1}. {t.fullName}
                </span>
                <span className="text-slate-500">
                  {formatTravelerTypeLabel(t.type)} • {t.gender === 'Male' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatIDR(booking.subtotal)}</span>
          </div>
          {booking.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Diskon Paket</span>
              <span>-{formatIDR(booking.discountTotal)}</span>
            </div>
          )}
          {booking.promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Promo ({booking.promoCodeApplied})</span>
              <span>-{formatIDR(booking.promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Biaya Layanan</span>
            <span>{formatIDR(booking.serviceFee)}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900">Total Tagihan</span>
            <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(booking.totalAmount)}</span>
          </div>
        </div>

        {booking.tripCategory === 'completed' && booking.review && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Ulasan Anda</h3>
              <button
                type="button"
                onClick={() => onOpenReviewModal(booking.bookingReference)}
                className="text-xs font-bold text-[#136F99] hover:underline"
              >
                Edit Ulasan
              </button>
            </div>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-4 h-4 ${
                    idx < booking.review!.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-slate-600 leading-relaxed">"{booking.review.comment}"</p>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          {isConfirmationScreen && (
            <button
              type="button"
              onClick={() => onOpenBookingDetail(booking.bookingReference)}
              className="w-full py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-xs"
            >
              Lihat Detail Pemesanan
            </button>
          )}
          {booking.tripCategory === 'completed' && !booking.review && (
            <button
              type="button"
              onClick={() => onOpenReviewModal(booking.bookingReference)}
              className="w-full py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-xs inline-flex items-center justify-center gap-2"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-300" />
              <span>Beri Ulasan Perjalanan</span>
            </button>
          )}
          {booking.tripCategory === 'upcoming' && !booking.aulaaTransaction && (
            <button
              type="button"
              onClick={() => onCancelBooking(booking.bookingReference)}
              className="w-full py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold"
            >
              Batalkan Reservasi
            </button>
          )}
          <button
            type="button"
            onClick={onReturnHome}
            className="w-full py-3 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm font-bold"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
