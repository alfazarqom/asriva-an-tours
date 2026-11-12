import React from 'react';
import { CheckCircle2, ChevronRight, Minus, Plus, Tag } from 'lucide-react';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Badge } from '../../components/ui/Badge';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { PACKAGES_DATA } from '../../data/packages';
import { BookingDraft, PricingBreakdown, TravelPackage } from '../../types/travel';
import { calculateReturnDate, formatDateReadable, formatIDR } from '../../utils/formatters';

export interface BookingPageProps {
  packageId: string;
  activeBookingPackage: TravelPackage;
  bookingDraft: BookingDraft;
  activePricing: PricingBreakdown;
  onChangeBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  onUpdateTravelerCounts: (adults: number, children: number, infants: number) => void;
  onBack: (packageId: string) => void;
  onProceedToCheckout: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  packageId,
  activeBookingPackage,
  bookingDraft,
  activePricing,
  onChangeBookingDraft,
  onUpdateTravelerCounts,
  onBack,
  onProceedToCheckout
}) => {
  const pkg = PACKAGES_DATA.find((p) => p.id === packageId) || activeBookingPackage;
  const totalSeats = bookingDraft.adults + bookingDraft.children;
  const isCountValid =
    totalSeats >= pkg.minTravelers && totalSeats <= pkg.maxTravelers && Boolean(bookingDraft.departureDate);

  return (
    <div className="app-shell">
      <StandaloneHeader title="Atur Pemesanan" onBack={() => onBack(pkg.id)} />

      <div className="app-content p-4 space-y-4 pb-8">
        {/* Selected Package Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex gap-3">
          <img src={pkg.images[0]} alt={pkg.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <Badge variant="ocean" className="mb-1">
              {pkg.category}
            </Badge>
            <h2 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{pkg.name}</h2>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
              <span>{pkg.destination}</span>
              <span>•</span>
              <span>{pkg.duration}</span>
            </div>
          </div>
        </div>

        {/* Select Package Options */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5">
          <h3 className="text-sm font-bold text-slate-900">Pilih Opsi Paket</h3>
          {pkg.packageOptions.map((opt) => {
            const selected = bookingDraft.optionId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeBookingDraft((prev) => ({ ...prev, optionId: opt.id }))}
                className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                  selected ? 'border-[#136F99] bg-[#E7F3F8]/70' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{opt.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.description}</div>
                  <div className="text-[11px] font-bold text-[#136F99] mt-1">
                    {opt.priceDelta === 0 ? 'Termasuk dalam harga dasar' : `+${formatIDR(opt.priceDelta)} / dewasa`}
                  </div>
                </div>
                {selected && <CheckCircle2 className="w-4 h-4 text-[#136F99] shrink-0 mt-0.5" />}
              </button>
            );
          })}
        </div>

        {/* Departure Date Selector */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <label className="block text-sm font-bold text-slate-900 mb-1">
            Pilih Tanggal Keberangkatan <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">Pilih jadwal keberangkatan yang tersedia.</p>
          <div className="grid grid-cols-2 gap-2">
            {pkg.departureDates.map((dateStr) => {
              const isSelected = bookingDraft.departureDate === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onChangeBookingDraft((prev) => ({ ...prev, departureDate: dateStr }))}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{formatDateReadable(dateStr)}</div>
                    <div className="text-[10px] opacity-75">
                      Selesai {calculateReturnDate(dateStr, pkg.durationDays)}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-[#136F99] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Participant Counters */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jumlah Peserta</h3>
              <p className="text-[11px] text-slate-500">
                Min. {pkg.minTravelers} – Maks. {pkg.maxTravelers} kursi per pemesanan
              </p>
            </div>
            <Badge variant="neutral">{activePricing.totalTravelers} Pax</Badge>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">Dewasa (12+ thn)</div>
              <div className="text-[11px] text-[#136F99] font-semibold">
                {formatIDR(activePricing.adultUnitPrice)} / pax
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults - 1, bookingDraft.children, bookingDraft.infants)
                }
                disabled={bookingDraft.adults <= 1}
                aria-label="Kurangi peserta dewasa"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.adults}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults + 1, bookingDraft.children, bookingDraft.infants)
                }
                disabled={bookingDraft.adults + bookingDraft.children >= pkg.maxTravelers}
                aria-label="Tambah peserta dewasa"
                className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">Anak-anak (2–11 thn)</div>
              <div className="text-[11px] text-[#136F99] font-semibold">
                {formatIDR(activePricing.childUnitPrice)} / pax
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults, bookingDraft.children - 1, bookingDraft.infants)
                }
                disabled={bookingDraft.children <= 0}
                aria-label="Kurangi peserta anak"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.children}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults, bookingDraft.children + 1, bookingDraft.infants)
                }
                disabled={bookingDraft.adults + bookingDraft.children >= pkg.maxTravelers}
                aria-label="Tambah peserta anak"
                className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">Bayi (Di bawah 2 thn)</div>
              <div className="text-[11px] text-[#136F99] font-semibold">
                {formatIDR(activePricing.infantUnitPrice)} / pax
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults, bookingDraft.children, bookingDraft.infants - 1)
                }
                disabled={bookingDraft.infants <= 0}
                aria-label="Kurangi bayi"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-slate-900">{bookingDraft.infants}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateTravelerCounts(bookingDraft.adults, bookingDraft.children, bookingDraft.infants + 1)
                }
                disabled={bookingDraft.infants >= bookingDraft.adults}
                aria-label="Tambah bayi"
                className="w-9 h-9 rounded-xl bg-[#0B2545] text-white flex items-center justify-center disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {totalSeats < pkg.minTravelers && (
            <AlertBanner type="warning">
              Paket ini mensyaratkan minimal <strong>{pkg.minTravelers} peserta</strong> (Dewasa + Anak). Silakan
              tambahkan {pkg.minTravelers - totalSeats} peserta lagi.
            </AlertBanner>
          )}
        </div>

        {/* Apply Discount Code */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <label htmlFor="booking-promo" className="block text-sm font-bold text-slate-900">
            Kode Promo / Diskon
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="booking-promo"
                type="text"
                value={bookingDraft.promoCode}
                onChange={(e) =>
                  onChangeBookingDraft((prev) => ({ ...prev, promoCode: e.target.value.toUpperCase() }))
                }
                placeholder="Coba ASRIVA250 atau BEYOND500"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-semibold uppercase text-slate-900 focus:outline-none focus:border-[#136F99]"
              />
            </div>
            {bookingDraft.promoCode && (
              <button
                type="button"
                onClick={() => onChangeBookingDraft((prev) => ({ ...prev, promoCode: '' }))}
                className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-600"
              >
                Hapus
              </button>
            )}
          </div>
          {bookingDraft.promoCode.trim() !== '' && (
            <p
              className={`text-[11px] font-semibold ${
                activePricing.promoCodeValid ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {activePricing.promoCodeValid
                ? `Diterapkan: ${activePricing.promoLabel}`
                : 'Kode memerlukan minimum transaksi atau tidak dikenali (Tersedia: ASRIVA250, BEYOND500).'}
            </p>
          )}
        </div>

        {/* Special Request */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <label htmlFor="booking-special-req" className="block text-sm font-bold text-slate-900 mb-1">
            Permintaan Khusus (Opsional)
          </label>
          <textarea
            id="booking-special-req"
            rows={2}
            value={bookingDraft.specialRequest}
            onChange={(e) => onChangeBookingDraft((prev) => ({ ...prev, specialRequest: e.target.value }))}
            placeholder="Preferensi makanan, pengaturan tempat tidur kamar, atau bantuan aksesibilitas..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#136F99]"
          />
        </div>

        {/* Booking Price Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Ringkasan Biaya Pemesanan</h3>
          <div className="flex justify-between text-slate-600">
            <span>
              Dewasa ({bookingDraft.adults} × {formatIDR(activePricing.adultUnitPrice)})
            </span>
            <span className="font-semibold text-slate-900">{formatIDR(activePricing.adultsTotal)}</span>
          </div>
          {bookingDraft.children > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>
                Anak ({bookingDraft.children} × {formatIDR(activePricing.childUnitPrice)})
              </span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.childrenTotal)}</span>
            </div>
          )}
          {bookingDraft.infants > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>
                Bayi ({bookingDraft.infants} × {formatIDR(activePricing.infantUnitPrice)})
              </span>
              <span className="font-semibold text-slate-900">{formatIDR(activePricing.infantsTotal)}</span>
            </div>
          )}
          {activePricing.packageDiscountTotal > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Hemat Promo Paket</span>
              <span className="font-semibold">-{formatIDR(activePricing.packageDiscountTotal)}</span>
            </div>
          )}
          {activePricing.promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Kode Promo ({bookingDraft.promoCode.trim().toUpperCase()})</span>
              <span className="font-semibold">-{formatIDR(activePricing.promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Biaya Layanan & Administrasi</span>
            <span className="font-semibold text-slate-900">{formatIDR(activePricing.serviceFee)}</span>
          </div>
          <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-900">Total Pembayaran</span>
            <span className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="bottom-action-bar flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase text-slate-400">
            Total ({activePricing.totalTravelers} Pax)
          </div>
          <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</div>
        </div>
        <button
          type="button"
          disabled={!isCountValid}
          onClick={onProceedToCheckout}
          className="px-6 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] transition inline-flex items-center gap-1.5"
        >
          <span>Lanjutkan</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
