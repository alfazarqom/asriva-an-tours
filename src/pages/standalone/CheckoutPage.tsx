import React from 'react';
import { Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import { AlertBanner } from '../../components/ui/AlertBanner';
import { Badge } from '../../components/ui/Badge';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { PAYMENT_CHANNELS } from '../../data/constants';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  BookingDraft,
  GuestInformation,
  PaywuzPaymentMethod,
  PricingBreakdown,
  ToastMessage,
  TravelPackage
} from '../../types/travel';
import {
  calculateReturnDate,
  formatDateReadable,
  formatIDR,
  formatTravelerTypeLabel
} from '../../utils/formatters';

export interface CheckoutPageProps {
  activeBookingPackage: TravelPackage;
  bookingDraft: BookingDraft;
  activePricing: PricingBreakdown;
  guestInfo: GuestInformation;
  sameWhatsappAsPhone: boolean;
  contactIsMainTraveler: boolean;
  selectedPaymentId: string;
  selectedPaywuzBank: string;
  selectedPaywuzRetailer: 'ALFAMART' | 'INDOMARET' | '';
  paywuzMethods: PaywuzPaymentMethod[];
  paywuzMethodsLoading: boolean;
  paywuzMethodsError: string;
  onRetryPaywuzMethods: () => void;
  onSelectPaywuzBank: (bank: string) => void;
  onSelectPaywuzRetailer: (retailer: 'ALFAMART' | 'INDOMARET' | '') => void;
  agreedTerms: boolean;
  formErrors: Record<string, string>;
  isSubmittingBooking: boolean;
  onChangeBookingDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  onChangeGuestInfo: React.Dispatch<React.SetStateAction<GuestInformation>>;
  onChangeSameWhatsappAsPhone: (checked: boolean) => void;
  onChangeContactIsMainTraveler: (checked: boolean) => void;
  onSelectPaymentId: (id: string) => void;
  onChangeAgreedTerms: (checked: boolean) => void;
  onClearFieldError: (field: string) => void;
  onOpenLegalModal: (type: 'terms' | 'privacy') => void;
  onShowToast: (message: string, type?: ToastMessage['type']) => void;
  onBackToBooking: (packageId: string) => void;
  onConfirmBooking: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  activeBookingPackage,
  bookingDraft,
  activePricing,
  guestInfo,
  sameWhatsappAsPhone,
  contactIsMainTraveler,
  selectedPaymentId,
  selectedPaywuzBank,
  selectedPaywuzRetailer,
  paywuzMethods,
  paywuzMethodsLoading,
  paywuzMethodsError,
  onRetryPaywuzMethods,
  onSelectPaywuzBank,
  onSelectPaywuzRetailer,
  agreedTerms,
  formErrors,
  isSubmittingBooking,
  onChangeBookingDraft,
  onChangeGuestInfo,
  onChangeSameWhatsappAsPhone,
  onChangeContactIsMainTraveler,
  onSelectPaymentId,
  onChangeAgreedTerms,
  onClearFieldError,
  onOpenLegalModal,
  onShowToast,
  onBackToBooking,
  onConfirmBooking
}) => {
  const pkg = activeBookingPackage;
  const chosenOption = pkg.packageOptions.find((o) => o.id === bookingDraft.optionId) || pkg.packageOptions[0];
  const returnDate = calculateReturnDate(bookingDraft.departureDate, pkg.durationDays);
  const supabaseReady = isSupabaseConfigured();

  const vaChannels = paywuzMethods.filter((m) => m.type === 'virtual_account');
  const qrisChannel = paywuzMethods.find((m) => m.type === 'qris');
  const retailChannels = paywuzMethods.filter((m) => m.type === 'retail');

  return (
    <div className="app-shell">
      <StandaloneHeader
        title="Guest Checkout"
        onBack={() => onBackToBooking(pkg.id)}
        rightSlot={
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Tanpa Login
          </span>
        }
      />

      <div className="app-content p-4 space-y-4 pb-8">
        <AlertBanner type="info" title="Pemesanan Tanpa Akun & Tanpa Login">
          Selesaikan reservasi Anda secara langsung sebagai tamu. Kode Booking dan konfirmasi rencana perjalanan akan
          diterbitkan segera setelah pemesanan dikirim.
        </AlertBanner>

        {/* Booking Summary */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ringkasan Pemesanan</h2>
          <div className="flex gap-3 pb-3 border-b border-slate-100">
            <img src={pkg.images[0]} alt={pkg.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-slate-900 leading-snug">{pkg.name}</div>
              <div className="text-[11px] font-semibold text-[#136F99] mt-0.5">{chosenOption.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{pkg.destination}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-3 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Berangkat</div>
              <div className="font-bold text-slate-800">{formatDateReadable(bookingDraft.departureDate)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Kembali</div>
              <div className="font-bold text-slate-800">{returnDate}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Peserta</div>
              <div className="font-bold text-slate-800">
                {bookingDraft.adults} Dws
                {bookingDraft.children > 0 ? `, ${bookingDraft.children} Ank` : ''}
                {bookingDraft.infants > 0 ? `, ${bookingDraft.infants} Byi` : ''}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Person (Guest Information) */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Informasi Pemesan (Kontak Utama)</h2>
            <p className="text-xs text-slate-500">
              Digunakan untuk pengiriman konfirmasi pemesanan dan verifikasi di menu Perjalanan Saya.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={guestInfo.fullName}
              onChange={(e) => {
                onChangeGuestInfo((prev) => ({ ...prev, fullName: e.target.value }));
                if (formErrors.guestFullName) onClearFieldError('guestFullName');
              }}
              placeholder="Contoh: Budi Santoso"
              className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                formErrors.guestFullName ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
              }`}
            />
            {formErrors.guestFullName && <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestFullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={guestInfo.email}
              onChange={(e) => {
                onChangeGuestInfo((prev) => ({ ...prev, email: e.target.value }));
                if (formErrors.guestEmail) onClearFieldError('guestEmail');
              }}
              placeholder="nama@email.com"
              className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                formErrors.guestEmail ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
              }`}
            />
            {formErrors.guestEmail && <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestEmail}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Telepon <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              value={guestInfo.phone}
              onChange={(e) => {
                onChangeGuestInfo((prev) => ({ ...prev, phone: e.target.value }));
                if (formErrors.guestPhone) onClearFieldError('guestPhone');
              }}
              placeholder="Contoh: 081234567890"
              className={`w-full rounded-xl border px-3 py-2.5 text-xs text-slate-900 focus:outline-none ${
                formErrors.guestPhone ? 'border-rose-500 bg-rose-50/30' : 'border-slate-200 focus:border-[#136F99]'
              }`}
            />
            {formErrors.guestPhone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestPhone}</p>}
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={sameWhatsappAsPhone}
                onChange={(e) => onChangeSameWhatsappAsPhone(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-[#0B2545]"
              />
              <span>Nomor WhatsApp sama dengan Nomor Telepon</span>
            </label>

            {!sameWhatsappAsPhone && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor WhatsApp</label>
                <input
                  type="tel"
                  value={guestInfo.whatsapp}
                  onChange={(e) => onChangeGuestInfo((prev) => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="Contoh: 081234567890"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
                />
                {formErrors.guestWhatsapp && (
                  <p className="text-[11px] text-rose-600 mt-1">{formErrors.guestWhatsapp}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Traveler Information */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Data Peserta Perjalanan ({bookingDraft.travelers.length} Peserta)
            </h2>
            <p className="text-xs text-slate-500">Isi nama peserta sesuai dengan KTP atau Paspor yang berlaku.</p>
          </div>

          {bookingDraft.travelers.length > 0 && bookingDraft.travelers[0].type === 'Adult' && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#E7F3F8]/80 border border-[#BAE6FD] text-xs font-semibold text-[#0B2545] cursor-pointer">
              <input
                type="checkbox"
                checked={contactIsMainTraveler}
                onChange={(e) => {
                  const checked = e.target.checked;
                  onChangeContactIsMainTraveler(checked);
                  if (checked) {
                    onChangeBookingDraft((prev) => {
                      const copy = [...prev.travelers];
                      if (copy[0]) copy[0] = { ...copy[0], fullName: guestInfo.fullName };
                      return { ...prev, travelers: copy };
                    });
                  }
                }}
                className="w-4 h-4 rounded accent-[#0B2545]"
              />
              <span>Pemesan adalah Peserta Utama</span>
            </label>
          )}

          <div className="space-y-3">
            {bookingDraft.travelers.map((traveler, index) => {
              const isLockedByContact = index === 0 && contactIsMainTraveler;
              const nameErr = formErrors[`traveler_${index}_name`];
              const genderErr = formErrors[`traveler_${index}_gender`];

              return (
                <div key={traveler.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Peserta #{index + 1} ({formatTravelerTypeLabel(traveler.type)})
                    </span>
                    {index === 0 && <Badge variant="navy">Peserta Utama</Badge>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nama Lengkap <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={traveler.fullName}
                      disabled={isLockedByContact}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeBookingDraft((prev) => {
                          const updated = [...prev.travelers];
                          updated[index] = { ...updated[index], fullName: val };
                          return { ...prev, travelers: updated };
                        });
                        if (nameErr) onClearFieldError(`traveler_${index}_name`);
                      }}
                      placeholder="Nama lengkap sesuai identitas"
                      className={`w-full rounded-xl border px-3 py-2 text-xs bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-600 focus:outline-none ${
                        nameErr ? 'border-rose-500' : 'border-slate-200 focus:border-[#136F99]'
                      }`}
                    />
                    {nameErr && <p className="text-[11px] text-rose-600 mt-0.5">{nameErr}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Jenis Kelamin <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={traveler.gender}
                        onChange={(e) => {
                          const val = e.target.value as 'Male' | 'Female' | '';
                          onChangeBookingDraft((prev) => {
                            const updated = [...prev.travelers];
                            updated[index] = { ...updated[index], gender: val };
                            return { ...prev, travelers: updated };
                          });
                          if (genderErr) onClearFieldError(`traveler_${index}_gender`);
                        }}
                        className={`w-full rounded-xl border px-2.5 py-2 text-xs bg-white text-slate-900 focus:outline-none ${
                          genderErr ? 'border-rose-500' : 'border-slate-200 focus:border-[#136F99]'
                        }`}
                      >
                        <option value="">Pilih</option>
                        <option value="Male">Laki-laki</option>
                        <option value="Female">Perempuan</option>
                      </select>
                      {genderErr && <p className="text-[11px] text-rose-600 mt-0.5">{genderErr}</p>}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={traveler.dateOfBirth}
                        onChange={(e) => {
                          const val = e.target.value;
                          onChangeBookingDraft((prev) => {
                            const updated = [...prev.travelers];
                            updated[index] = { ...updated[index], dateOfBirth: val };
                            return { ...prev, travelers: updated };
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#136F99]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Nomor KTP / Paspor (Opsional)
                    </label>
                    <input
                      type="text"
                      value={traveler.identityNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        onChangeBookingDraft((prev) => {
                          const updated = [...prev.travelers];
                          updated[index] = { ...updated[index], identityNumber: val };
                          return { ...prev, travelers: updated };
                        });
                      }}
                      placeholder="Nomor identitas atau paspor"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-900 focus:outline-none focus:border-[#136F99]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment Method Selection */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Metode & Penyelesaian Pembayaran</h2>
              <p className="text-xs text-slate-500">
                Pilih pembayaran otomatis Paywuz v2 atau metode verifikasi manual ASRIVA.
              </p>
            </div>
            {supabaseReady && (
              <button
                type="button"
                disabled={paywuzMethodsLoading}
                onClick={onRetryPaywuzMethods}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-[#136F99] hover:bg-slate-50"
              >
                <RefreshCw className={`w-3 h-3 ${paywuzMethodsLoading ? 'animate-spin' : ''}`} />
                <span>Muat Channel</span>
              </button>
            )}
          </div>

          {!supabaseReady && (
            <AlertBanner type="warning" title="Konfigurasi Backend Supabase Diperlukan untuk Paywuz v2">
              Atur <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, serta secret{' '}
              <code>PAYWUZ_API_KEY</code> pada Supabase Edge Functions untuk mengaktifkan transaksi Paywuz v2.
            </AlertBanner>
          )}

          {supabaseReady && paywuzMethodsError && (
            <AlertBanner type="error" title="Gagal Memuat Channel Paywuz v2">
              {paywuzMethodsError}
            </AlertBanner>
          )}

          <div className="space-y-2.5">
            {PAYMENT_CHANNELS.map((channel) => {
              const isPaywuz = channel.type === 'paywuz_v2';
              const isSelected = selectedPaymentId === channel.id;

              let channelAvailableForAmount = channel.available;
              let limitNote = '';
              if (isPaywuz && !supabaseReady) {
                channelAvailableForAmount = false;
              } else if (isPaywuz && paywuzMethods.length > 0) {
                if (channel.id === 'paywuz_qris' && qrisChannel) {
                  channelAvailableForAmount = qrisChannel.available !== false;
                  if (!channelAvailableForAmount) {
                    limitNote = `Batas nominal QRIS: ${formatIDR(qrisChannel.limits.min)} – ${formatIDR(qrisChannel.limits.max)}`;
                  } else if (qrisChannel.fee.amount !== null) {
                    limitNote = `Biaya Paywuz QRIS: ${formatIDR(qrisChannel.fee.amount)}`;
                  }
                } else if (channel.id === 'paywuz_retail') {
                  const anyRetailAvailable = retailChannels.some((r) => r.available !== false);
                  channelAvailableForAmount = retailChannels.length === 0 ? false : anyRetailAvailable;
                  if (!anyRetailAvailable && retailChannels[0]) {
                    limitNote = `Batas nominal Retail: ${formatIDR(retailChannels[0].limits.min)} – ${formatIDR(retailChannels[0].limits.max)}`;
                  }
                } else if (channel.id === 'paywuz_va' && vaChannels.length > 0) {
                  const anyVaAvailable = vaChannels.some((v) => v.available !== false);
                  channelAvailableForAmount = anyVaAvailable;
                }
              }

              return (
                <div
                  key={channel.id}
                  onClick={() => {
                    if (!channelAvailableForAmount) {
                      onShowToast(
                        !supabaseReady && isPaywuz
                          ? 'Konfigurasi Supabase diperlukan untuk menjalankan Edge Function Paywuz v2.'
                          : limitNote || 'Channel pembayaran tidak tersedia untuk nominal ini.',
                        'warning'
                      );
                      return;
                    }
                    onSelectPaymentId(channel.id);
                    if (formErrors.paymentMethod) onClearFieldError('paymentMethod');
                  }}
                  className={`p-3.5 rounded-xl border transition ${
                    !channelAvailableForAmount
                      ? 'border-slate-200 bg-slate-50 opacity-70 cursor-not-allowed'
                      : isSelected
                      ? 'border-[#136F99] bg-[#E7F3F8]/70 cursor-pointer'
                      : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected && channelAvailableForAmount ? 'border-[#136F99]' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && channelAvailableForAmount && (
                          <div className="w-2 h-2 rounded-full bg-[#136F99]" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-900">{channel.name}</span>
                    </div>
                    <Badge
                      variant={
                        !channelAvailableForAmount
                          ? 'neutral'
                          : isPaywuz
                          ? 'ocean'
                          : 'warning'
                      }
                    >
                      {!supabaseReady && isPaywuz ? 'Butuh Supabase' : channel.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed pl-6">{channel.description}</p>
                  {limitNote && (
                    <p className="text-[10px] font-semibold text-[#136F99] pl-6 mt-1">{limitNote}</p>
                  )}

                  {/* Bank selector when Paywuz Virtual Account is selected */}
                  {isSelected && channel.id === 'paywuz_va' && channelAvailableForAmount && (
                    <div
                      className="mt-2.5 ml-6 p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="block text-[11px] font-bold text-slate-700">
                        Pilih Bank Virtual Account (opsional)
                      </label>
                      <select
                        value={selectedPaywuzBank}
                        onChange={(e) => onSelectPaywuzBank(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-[#136F99]"
                      >
                        <option value="">Pilih bank nanti di halaman pembayaran Paywuz</option>
                        {vaChannels.map((va) => (
                          <option key={va.code} value={va.code} disabled={va.available === false}>
                            {va.name} ({va.code})
                            {va.fee.amount !== null ? ` • Biaya ${formatIDR(va.fee.amount)}` : ''}
                            {va.available === false ? ' (Di luar limit)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Retailer selector when Paywuz Retail is selected */}
                  {isSelected && channel.id === 'paywuz_retail' && channelAvailableForAmount && (
                    <div
                      className="mt-2.5 ml-6 p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="block text-[11px] font-bold text-slate-700">
                        Pilih Gerai Retail <span className="text-rose-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['ALFAMART', 'INDOMARET'] as const).map((code) => {
                          const apiItem = retailChannels.find((r) => r.code === code);
                          const disabled = apiItem ? apiItem.available === false : false;
                          const active = selectedPaywuzRetailer === code;
                          return (
                            <button
                              key={code}
                              type="button"
                              disabled={disabled}
                              onClick={() => {
                                onSelectPaywuzRetailer(code);
                                if (formErrors.paymentMethod) onClearFieldError('paymentMethod');
                              }}
                              className={`p-2 rounded-lg border text-left text-xs font-bold transition ${
                                disabled
                                  ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                  : active
                                  ? 'border-[#136F99] bg-[#E7F3F8] text-[#0B2545]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div>{apiItem?.name || code}</div>
                              {apiItem?.fee.amount !== null && apiItem?.fee.amount !== undefined && (
                                <div className="text-[10px] font-normal text-slate-500">
                                  Biaya {formatIDR(apiItem.fee.amount)}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {formErrors.paymentMethod && <p className="text-[11px] text-rose-600">{formErrors.paymentMethod}</p>}
        </section>

        {/* Price Breakdown */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2 text-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Rincian Harga</h2>
          <div className="flex justify-between text-slate-600">
            <span>Harga Dasar Paket ({activePricing.totalTravelers} Peserta)</span>
            <span className="font-semibold text-slate-900">{formatIDR(activePricing.baseSubtotal)}</span>
          </div>
          {activePricing.packageDiscountTotal > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Diskon Paket</span>
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
        </section>

        {/* Terms Agreement */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => {
                onChangeAgreedTerms(e.target.checked);
                if (formErrors.terms) onClearFieldError('terms');
              }}
              className="w-4 h-4 mt-0.5 rounded accent-[#0B2545] shrink-0"
            />
            <span className="leading-relaxed">
              Saya menyetujui{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalModal('terms');
                }}
                className="font-bold text-[#136F99] underline"
              >
                Syarat & Ketentuan
              </button>{' '}
              serta{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegalModal('privacy');
                }}
                className="font-bold text-[#136F99] underline"
              >
                Kebijakan Privasi
              </button>{' '}
              ASRIVA Travel & Tours.
            </span>
          </label>
          {formErrors.terms && <p className="text-[11px] text-rose-600 mt-1.5">{formErrors.terms}</p>}
        </section>
      </div>

      {/* Sticky Bottom Action */}
      <div className="bottom-action-bar flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase text-slate-400">Total Pembayaran</div>
          <div className="text-base font-extrabold text-[#0B2545]">{formatIDR(activePricing.totalAmount)}</div>
        </div>
        <button
          type="button"
          disabled={isSubmittingBooking}
          onClick={onConfirmBooking}
          className="px-5 py-3 rounded-xl bg-[#0B2545] text-white text-sm font-bold shadow-md hover:bg-[#06172D] disabled:opacity-50 active:scale-[0.98] transition inline-flex items-center gap-2"
        >
          {isSubmittingBooking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <span>Konfirmasi Pemesanan</span>
          )}
        </button>
      </div>
    </div>
  );
};
