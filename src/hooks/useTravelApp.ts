import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { INITIAL_BOOKINGS, INITIAL_VERIFIED_BOOKING_REFS } from '../data/bookings';
import { INITIAL_NOTIFICATIONS, PAYMENT_CHANNELS } from '../data/constants';
import { PACKAGES_DATA } from '../data/packages';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  cancelPaywuzTransaction,
  createBookingWithPaywuz,
  fetchPaywuzPaymentMethods,
  lookupBookingInSupabase,
  PaywuzGatewayException,
  refreshPaywuzTransactionStatus,
  saveBookingReviewInSupabase
} from '../services/paywuzBackend';
import {
  AppNotification,
  Booking,
  BookingDraft,
  BookingReview,
  DurationFilter,
  GuestInformation,
  InfoPageKey,
  MainTab,
  PaywuzEndpointMode,
  PaywuzPaymentMethod,
  PaywuzTransaction,
  PriceFilter,
  SortBy,
  ToastMessage,
  TripSubTab
} from '../types/travel';
import { calculateBookingPricing, reconcileTravelers } from '../utils/booking';
import { generateBookingReference } from '../utils/formatters';
import { triggerHaptic } from '../utils/nativeExperience';
import { isValidEmail, isValidIndonesianMobile, isValidPhone } from '../utils/validators';

export const TAB_ROUTES: Record<MainTab, string> = {
  home: '/',
  explore: '/explore',
  wishlist: '/wishlist',
  bookings: '/trips',
  profile: '/profile'
};

export function useTravelApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab: MainTab = useMemo(() => {
    switch (location.pathname) {
      case '/explore':
        return 'explore';
      case '/wishlist':
        return 'wishlist';
      case '/trips':
        return 'bookings';
      case '/profile':
        return 'profile';
      default:
        return 'home';
    }
  }, [location.pathname]);

  const setActiveTab = useCallback(
    (tab: MainTab) => {
      const target = TAB_ROUTES[tab];
      if (location.pathname !== target) {
        navigate(target);
      }
    },
    [location.pathname, navigate]
  );

  const goBack = useCallback(
    (fallbackPath = '/') => {
      if (location.key !== 'default') {
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    },
    [location.key, navigate]
  );

  // Storefront Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState<string>('All');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('recommended');
  const [filterSheetOpen, setFilterSheetOpen] = useState<boolean>(false);

  // Wishlist & Notifications State
  const [wishlistIds, setWishlistIds] = useState<string[]>(['pkg-bali-ubud-4d3n']);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationModalOpen, setNotificationModalOpen] = useState<boolean>(false);

  // Booking Draft & Checkout State
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>({
    packageId: PACKAGES_DATA[0].id,
    optionId: PACKAGES_DATA[0].packageOptions[0].id,
    departureDate: PACKAGES_DATA[0].departureDates[0] || '',
    adults: 2,
    children: 0,
    infants: 0,
    travelers: reconcileTravelers([], 2, 0, 0),
    promoCode: '',
    specialRequest: ''
  });

  const [guestInfo, setGuestInfo] = useState<GuestInformation>({
    fullName: '',
    email: '',
    phone: '',
    whatsapp: ''
  });
  const [sameWhatsappAsPhone, setSameWhatsappAsPhone] = useState<boolean>(true);
  const [contactIsMainTraveler, setContactIsMainTraveler] = useState<boolean>(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>(
    isSupabaseConfigured() ? 'paywuz_all' : 'bank_transfer_verified'
  );
  const [selectedPaywuzBank, setSelectedPaywuzBank] = useState<string>('');
  const [selectedPaywuzRetailer, setSelectedPaywuzRetailer] = useState<'ALFAMART' | 'INDOMARET' | ''>('');
  const [paywuzMethods, setPaywuzMethods] = useState<PaywuzPaymentMethod[]>([]);
  const [paywuzMethodsLoading, setPaywuzMethodsLoading] = useState<boolean>(false);
  const [paywuzMethodsError, setPaywuzMethodsError] = useState<string>('');
  const [isCheckingPaywuzStatus, setIsCheckingPaywuzStatus] = useState<boolean>(false);
  const [isCancellingPaywuz, setIsCancellingPaywuz] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Bookings Store & My Trips Filter State
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [tripSubTab, setTripSubTab] = useState<TripSubTab>('upcoming');
  const [lookupRef, setLookupRef] = useState<string>('');
  const [lookupContact, setLookupContact] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');
  const [verifiedBookingRefs, setVerifiedBookingRefs] = useState<string[]>(INITIAL_VERIFIED_BOOKING_REFS);
  const [reviewBookingRef, setReviewBookingRef] = useState<string | null>(null);

  // Global Modals & Toasts
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3400);
  }, []);

  const toggleWishlist = useCallback(
    (pkgId: string) => {
      triggerHaptic(10);
      const exists = wishlistIds.includes(pkgId);
      setWishlistIds((prev) =>
        prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
      );
      if (exists) {
        showToast('Dihapus dari Wishlist.', 'info');
      } else {
        showToast('Disimpan ke Wishlist.', 'success');
      }
    },
    [showToast, wishlistIds]
  );

  // Sync WhatsApp when checkbox active
  useEffect(() => {
    if (sameWhatsappAsPhone) {
      setGuestInfo((prev) => ({ ...prev, whatsapp: prev.phone }));
    }
  }, [sameWhatsappAsPhone, guestInfo.phone]);

  // Sync Main Traveler when "Contact Person is the Main Traveler" is toggled
  useEffect(() => {
    if (contactIsMainTraveler) {
      setBookingDraft((prev) => {
        if (prev.travelers.length === 0) return prev;
        const updated = [...prev.travelers];
        updated[0] = {
          ...updated[0],
          fullName: guestInfo.fullName
        };
        return { ...prev, travelers: updated };
      });
    }
  }, [contactIsMainTraveler, guestInfo.fullName]);

  const activeBookingPackage = useMemo(() => {
    return PACKAGES_DATA.find((p) => p.id === bookingDraft.packageId) || PACKAGES_DATA[0];
  }, [bookingDraft.packageId]);

  const activePricing = useMemo(() => {
    return calculateBookingPricing(
      activeBookingPackage,
      bookingDraft.optionId,
      bookingDraft.adults,
      bookingDraft.children,
      bookingDraft.infants,
      bookingDraft.promoCode
    );
  }, [
    activeBookingPackage,
    bookingDraft.optionId,
    bookingDraft.adults,
    bookingDraft.children,
    bookingDraft.infants,
    bookingDraft.promoCode
  ]);

  const filteredPackages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PACKAGES_DATA.filter((pkg) => {
      if (q) {
        const matchName = pkg.name.toLowerCase().includes(q);
        const matchDest = pkg.destination.toLowerCase().includes(q);
        const matchCat = pkg.category.toLowerCase().includes(q);
        const matchDesc = pkg.description.toLowerCase().includes(q);
        if (!matchName && !matchDest && !matchCat && !matchDesc) return false;
      }
      if (selectedCategory !== 'Semua' && pkg.category !== selectedCategory) return false;
      if (selectedDestinationFilter !== 'All' && pkg.destinationId !== selectedDestinationFilter) return false;

      const effPrice = pkg.discountPrice ?? pkg.price;
      if (priceFilter === 'under5m' && effPrice >= 5000000) return false;
      if (priceFilter === '5mto15m' && (effPrice < 5000000 || effPrice > 15000000)) return false;
      if (priceFilter === 'above15m' && effPrice <= 15000000) return false;

      if (durationFilter === '1to3' && pkg.durationDays > 3) return false;
      if (durationFilter === '4to5' && (pkg.durationDays < 4 || pkg.durationDays > 5)) return false;
      if (durationFilter === '6plus' && pkg.durationDays < 6) return false;

      return true;
    });

    return [...list].sort((a, b) => {
      const priceA = a.discountPrice ?? a.price;
      const priceB = b.discountPrice ?? b.price;
      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating_desc') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [searchQuery, selectedCategory, selectedDestinationFilter, priceFilter, durationFilter, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'Semua') count++;
    if (selectedDestinationFilter !== 'All') count++;
    if (priceFilter !== 'all') count++;
    if (durationFilter !== 'all') count++;
    return count;
  }, [selectedCategory, selectedDestinationFilter, priceFilter, durationFilter]);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  // Navigation Helpers
  const openPackageDetail = useCallback(
    (packageId: string) => {
      navigate(`/packages/${packageId}`);
    },
    [navigate]
  );

  const openDestinationDetail = useCallback(
    (destinationId: string) => {
      navigate(`/destinations/${destinationId}`);
    },
    [navigate]
  );

  const openInfoPage = useCallback(
    (page: InfoPageKey) => {
      navigate(`/info/${page}`);
    },
    [navigate]
  );

  const openBookingDetail = useCallback(
    (bookingReference: string) => {
      navigate(`/booking/${bookingReference}`);
    },
    [navigate]
  );

  const resetAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('Semua');
    setSelectedDestinationFilter('All');
    setPriceFilter('all');
    setDurationFilter('all');
  }, []);

  const resetSheetFilters = useCallback(() => {
    setSelectedCategory('Semua');
    setSelectedDestinationFilter('All');
    setPriceFilter('all');
    setDurationFilter('all');
  }, []);

  const syncBookingPackage = useCallback((packageId: string): boolean => {
    const pkg = PACKAGES_DATA.find((p) => p.id === packageId);
    if (!pkg) return false;

    setBookingDraft((prev) => {
      if (prev.packageId === pkg.id) return prev;
      const validAdults = Math.min(Math.max(pkg.minTravelers, 2), pkg.maxTravelers);
      return {
        packageId: pkg.id,
        optionId: pkg.packageOptions[0].id,
        departureDate: pkg.departureDates[0] || '',
        adults: validAdults,
        children: 0,
        infants: 0,
        travelers: reconcileTravelers([], validAdults, 0, 0),
        promoCode: '',
        specialRequest: ''
      };
    });
    return true;
  }, []);

  const startBookingForPackage = useCallback(
    (packageId: string) => {
      const pkg = PACKAGES_DATA.find((p) => p.id === packageId);
      if (!pkg) {
        showToast('Paket wisata yang dipilih tidak ditemukan.', 'error');
        return;
      }

      setBookingDraft((prev) => {
        const isSamePkg = prev.packageId === pkg.id;
        const defaultAdults = Math.max(pkg.minTravelers, isSamePkg ? prev.adults : 2);
        const validAdults = Math.min(defaultAdults, pkg.maxTravelers);
        const validChildren = isSamePkg && validAdults + prev.children <= pkg.maxTravelers ? prev.children : 0;
        const validInfants = isSamePkg ? prev.infants : 0;
        const validDate =
          isSamePkg && pkg.departureDates.includes(prev.departureDate)
            ? prev.departureDate
            : pkg.departureDates[0] || '';
        const validOption =
          isSamePkg && pkg.packageOptions.some((o) => o.id === prev.optionId)
            ? prev.optionId
            : pkg.packageOptions[0].id;

        return {
          packageId: pkg.id,
          optionId: validOption,
          departureDate: validDate,
          adults: validAdults,
          children: validChildren,
          infants: validInfants,
          travelers: reconcileTravelers(isSamePkg ? prev.travelers : [], validAdults, validChildren, validInfants),
          promoCode: isSamePkg ? prev.promoCode : '',
          specialRequest: isSamePkg ? prev.specialRequest : ''
        };
      });
      setFormErrors({});
      navigate(`/packages/${pkg.id}/book`);
    },
    [navigate, showToast]
  );

  const updateTravelerCounts = useCallback(
    (newAdults: number, newChildren: number, newInfants: number) => {
      const pkg = activeBookingPackage;
      const totalSeats = newAdults + newChildren;
      if (newAdults < 1) {
        showToast('Minimal 1 peserta dewasa diperlukan.', 'warning');
        return;
      }
      if (totalSeats > pkg.maxTravelers) {
        showToast(`Maksimal ${pkg.maxTravelers} peserta diperbolehkan untuk paket ini.`, 'warning');
        return;
      }
      if (newInfants > newAdults) {
        showToast('Jumlah bayi tidak boleh melebihi peserta dewasa.', 'warning');
        return;
      }

      setBookingDraft((prev) => {
        const nextTravelers = reconcileTravelers(prev.travelers, newAdults, newChildren, newInfants);
        if (contactIsMainTraveler && nextTravelers.length > 0) {
          nextTravelers[0] = { ...nextTravelers[0], fullName: guestInfo.fullName };
        }
        return {
          ...prev,
          adults: newAdults,
          children: newChildren,
          infants: newInfants,
          travelers: nextTravelers
        };
      });
    },
    [activeBookingPackage, contactIsMainTraveler, guestInfo.fullName, showToast]
  );

  const handleProceedToCheckout = useCallback(() => {
    const pkg = activeBookingPackage;
    const totalSeats = bookingDraft.adults + bookingDraft.children;
    if (!bookingDraft.departureDate) {
      showToast('Silakan pilih tanggal keberangkatan terlebih dahulu.', 'error');
      return;
    }
    if (totalSeats < pkg.minTravelers) {
      showToast(`Paket ini mensyaratkan minimal ${pkg.minTravelers} peserta.`, 'error');
      return;
    }
    if (totalSeats > pkg.maxTravelers) {
      showToast(`Maksimal ${pkg.maxTravelers} peserta diperbolehkan.`, 'error');
      return;
    }
    setFormErrors({});
    navigate('/checkout');
  }, [
    activeBookingPackage,
    bookingDraft.adults,
    bookingDraft.children,
    bookingDraft.departureDate,
    navigate,
    showToast
  ]);

  const validateCheckoutForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!bookingDraft.packageId) errors.package = 'Belum ada paket wisata yang dipilih.';
    if (!bookingDraft.departureDate) errors.departureDate = 'Tanggal keberangkatan wajib dipilih.';

    if (!guestInfo.fullName.trim() || guestInfo.fullName.trim().length < 3) {
      errors.guestFullName = 'Masukkan nama lengkap pemesan (minimal 3 karakter).';
    }
    if (!guestInfo.email.trim() || !isValidEmail(guestInfo.email)) {
      errors.guestEmail = 'Masukkan alamat email yang valid untuk konfirmasi pemesanan.';
    }
    if (!guestInfo.phone.trim() || !isValidPhone(guestInfo.phone)) {
      errors.guestPhone = 'Masukkan nomor telepon yang valid (8–15 digit).';
    }
    const effectiveWa = sameWhatsappAsPhone ? guestInfo.phone : guestInfo.whatsapp;
    if (effectiveWa && !isValidPhone(effectiveWa)) {
      errors.guestWhatsapp = 'Masukkan nomor WhatsApp yang valid.';
    }

    bookingDraft.travelers.forEach((t, idx) => {
      if (!t.fullName.trim() || t.fullName.trim().length < 2) {
        errors[`traveler_${idx}_name`] = `Nama lengkap Peserta #${idx + 1} wajib diisi.`;
      }
      if (!t.gender) {
        errors[`traveler_${idx}_gender`] = `Pilih jenis kelamin untuk Peserta #${idx + 1}.`;
      }
    });

    const chosenPayment = PAYMENT_CHANNELS.find((c) => c.id === selectedPaymentId);
    if (!chosenPayment || !chosenPayment.available) {
      errors.paymentMethod = 'Silakan pilih metode penyelesaian pembayaran yang tersedia.';
    }

    if (selectedPaymentId.startsWith('paywuz_') && !isSupabaseConfigured()) {
      errors.paymentMethod =
        'Metode Paywuz v2 memerlukan konfigurasi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.';
    }

    if (selectedPaymentId === 'paywuz_qris' && !isValidIndonesianMobile(guestInfo.phone)) {
      errors.guestPhone =
        'Pembayaran QRIS Paywuz memerlukan nomor HP Indonesia yang valid (08xx, 62xx, atau +62).';
    }

    if (selectedPaymentId === 'paywuz_retail' && !selectedPaywuzRetailer) {
      errors.paymentMethod = 'Pilih gerai retail (Alfamart atau Indomaret) untuk pembayaran retail.';
    }

    if (!agreedTerms) {
      errors.terms = 'Anda wajib menyetujui Syarat & Ketentuan serta Kebijakan Privasi.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    agreedTerms,
    bookingDraft,
    guestInfo,
    sameWhatsappAsPhone,
    selectedPaymentId,
    selectedPaywuzRetailer
  ]);

  const loadPaywuzMethods = useCallback(async (amount: number) => {
    if (!isSupabaseConfigured()) {
      setPaywuzMethods([]);
      setPaywuzMethodsError('');
      return;
    }

    setPaywuzMethodsLoading(true);
    setPaywuzMethodsError('');
    try {
      const methods = await fetchPaywuzPaymentMethods(amount);
      setPaywuzMethods(methods);
    } catch (err) {
      const msg =
        err instanceof PaywuzGatewayException
          ? err.message
          : 'Gagal memuat daftar channel pembayaran Paywuz v2.';
      setPaywuzMethodsError(msg);
      setPaywuzMethods([]);
    } finally {
      setPaywuzMethodsLoading(false);
    }
  }, []);

  // Muat daftar channel Paywuz v2 secara otomatis saat membuka /checkout
  useEffect(() => {
    if (location.pathname === '/checkout' && isSupabaseConfigured()) {
      void loadPaywuzMethods(activePricing.totalAmount);
    }
  }, [activePricing.totalAmount, loadPaywuzMethods, location.pathname]);

  // Sinkronisasi Realtime dari Supabase Webhook Paywuz v2
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('paywuz-tx-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'paywuz_transactions' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const orderId = String(row.order_id || '');
          const nextStatus = row.status as PaywuzTransaction['status'];
          if (!orderId || !nextStatus) return;

          setBookings((prev) =>
            prev.map((b) => {
              if (b.bookingReference !== orderId) return b;
              const nextPaymentStatus: Booking['paymentStatus'] =
                nextStatus === 'settlement'
                  ? 'Settlement (Menunggu Dana Masuk)'
                  : nextStatus === 'success'
                    ? 'Lunas (Terverifikasi)'
                    : nextStatus === 'failed'
                      ? 'Pembayaran Gagal'
                      : nextStatus === 'cancelled'
                        ? 'Dibatalkan'
                        : 'Belum Dibayar - Menunggu Pembayaran';

              const nextBookingStatus: Booking['bookingStatus'] =
                nextStatus === 'settlement'
                  ? 'Terkonfirmasi - Menunggu Settlement'
                  : nextStatus === 'success'
                    ? 'Terkonfirmasi - Lunas'
                    : nextStatus === 'cancelled'
                      ? 'Dibatalkan'
                      : 'Menunggu Pembayaran (Paywuz)';

              return {
                ...b,
                tripCategory: nextStatus === 'cancelled' ? 'cancelled' : b.tripCategory,
                bookingStatus: nextBookingStatus,
                paymentStatus: nextPaymentStatus,
                paywuzTransaction: b.paywuzTransaction
                  ? {
                      ...b.paywuzTransaction,
                      status: nextStatus,
                      paidAt: (row.paid_at as string | null) ?? b.paywuzTransaction.paidAt,
                      method: {
                        type: (row.method_type as PaywuzTransaction['method']['type']) ?? b.paywuzTransaction.method.type,
                        code: (row.method_code as string | null) ?? b.paywuzTransaction.method.code,
                        name: (row.method_name as string | null) ?? b.paywuzTransaction.method.name
                      }
                    }
                  : undefined
              };
            })
          );
        }
      )
      .subscribe();

    return () => {
      void supabase?.removeChannel(channel);
    };
  }, []);

  const handleConfirmBooking = useCallback(async () => {
    if (isSubmittingBooking) return;
    if (!validateCheckoutForm()) {
      showToast('Mohon lengkapi seluruh kolom wajib yang ditandai merah.', 'error');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const chosenPayment = PAYMENT_CHANNELS.find((c) => c.id === selectedPaymentId)!;
      const chosenOption =
        activeBookingPackage.packageOptions.find((o) => o.id === bookingDraft.optionId) ||
        activeBookingPackage.packageOptions[0];
      const reference = generateBookingReference();
      const effectiveWhatsapp = sameWhatsappAsPhone ? guestInfo.phone.trim() : guestInfo.whatsapp.trim();
      const isPaywuzChannel = chosenPayment.type === 'paywuz_v2';

      const newBooking: Booking = {
        bookingReference: reference,
        createdAt: new Date().toISOString(),
        packageId: activeBookingPackage.id,
        packageName: activeBookingPackage.name,
        optionName: chosenOption.name,
        destination: activeBookingPackage.destination,
        duration: activeBookingPackage.duration,
        packageImage: activeBookingPackage.images[0],
        guest: {
          fullName: guestInfo.fullName.trim(),
          email: guestInfo.email.trim(),
          phone: guestInfo.phone.trim(),
          whatsapp: effectiveWhatsapp
        },
        travelers: bookingDraft.travelers.map((t) => ({
          ...t,
          fullName: t.fullName.trim(),
          identityNumber: t.identityNumber.trim(),
          specialRequirements: t.specialRequirements.trim()
        })),
        departureDate: bookingDraft.departureDate,
        meetingPoint: activeBookingPackage.meetingPoint,
        departureLocation: activeBookingPackage.departureLocation,
        adults: bookingDraft.adults,
        children: bookingDraft.children,
        infants: bookingDraft.infants,
        subtotal: activePricing.baseSubtotal,
        discountTotal: activePricing.packageDiscountTotal,
        promoDiscount: activePricing.promoDiscount,
        promoCodeApplied: activePricing.promoCodeValid ? bookingDraft.promoCode.trim().toUpperCase() : undefined,
        serviceFee: activePricing.serviceFee,
        totalAmount: activePricing.totalAmount,
        specialRequest: bookingDraft.specialRequest.trim(),
        paymentMethodId: chosenPayment.id,
        paymentMethodName: chosenPayment.name,
        tripCategory: 'upcoming',
        bookingStatus: isPaywuzChannel
          ? 'Menunggu Pembayaran (Paywuz)'
          : chosenPayment.type === 'pay_at_office'
            ? 'Terkonfirmasi - Slot Ditahan'
            : 'Menunggu Verifikasi Pembayaran',
        paymentStatus: 'Belum Dibayar - Menunggu Pembayaran'
      };

      if (isPaywuzChannel || isSupabaseConfigured()) {
        const endpointMode: PaywuzEndpointMode =
          selectedPaymentId === 'paywuz_va'
            ? 'va'
            : selectedPaymentId === 'paywuz_qris'
              ? 'qris'
              : selectedPaymentId === 'paywuz_retail'
                ? 'retail'
                : 'all';

        const result = await createBookingWithPaywuz({
          booking: newBooking,
          paywuz: isPaywuzChannel
            ? {
                endpointMode,
                bank: endpointMode === 'va' && selectedPaywuzBank ? selectedPaywuzBank : undefined,
                retailer:
                  endpointMode === 'retail' && selectedPaywuzRetailer
                    ? selectedPaywuzRetailer
                    : undefined,
                redirectUrl: `${window.location.origin}/booking/confirmed/${reference}`
              }
            : undefined
        });

        if (result.transaction) {
          newBooking.paywuzTransaction = result.transaction;
        }
      }

      setBookings((prev) => [newBooking, ...prev]);
      setVerifiedBookingRefs((prev) => (prev.includes(reference) ? prev : [reference, ...prev]));
      setLookupRef(reference);
      setLookupContact(guestInfo.email.trim());
      navigate(`/booking/confirmed/${reference}`, { replace: true });
      showToast(`Pemesanan ${reference} berhasil dibuat.`, 'success');
    } catch (err) {
      if (err instanceof PaywuzGatewayException) {
        if (err.field === 'customer') {
          setFormErrors((prev) => ({ ...prev, guestPhone: err.message }));
        }
        showToast(err.message, 'error');
      } else {
        showToast('Gagal memproses permintaan pemesanan. Silakan coba lagi.', 'error');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  }, [
    activeBookingPackage,
    activePricing,
    bookingDraft,
    guestInfo,
    isSubmittingBooking,
    navigate,
    sameWhatsappAsPhone,
    selectedPaymentId,
    selectedPaywuzBank,
    selectedPaywuzRetailer,
    showToast,
    validateCheckoutForm
  ]);

  const handleRefreshPaywuzStatus = useCallback(
    async (bookingReference: string) => {
      if (isCheckingPaywuzStatus) return;
      setIsCheckingPaywuzStatus(true);
      try {
        const tx = await refreshPaywuzTransactionStatus(bookingReference);
        setBookings((prev) =>
          prev.map((b) => {
            if (b.bookingReference !== bookingReference) return b;
            const nextPaymentStatus: Booking['paymentStatus'] =
              tx.status === 'settlement'
                ? 'Settlement (Menunggu Dana Masuk)'
                : tx.status === 'success'
                  ? 'Lunas (Terverifikasi)'
                  : tx.status === 'failed'
                    ? 'Pembayaran Gagal'
                    : tx.status === 'cancelled'
                      ? 'Dibatalkan'
                      : 'Belum Dibayar - Menunggu Pembayaran';

            const nextBookingStatus: Booking['bookingStatus'] =
              tx.status === 'settlement'
                ? 'Terkonfirmasi - Menunggu Settlement'
                : tx.status === 'success'
                  ? 'Terkonfirmasi - Lunas'
                  : tx.status === 'cancelled'
                    ? 'Dibatalkan'
                    : 'Menunggu Pembayaran (Paywuz)';

            return {
              ...b,
              tripCategory: tx.status === 'cancelled' ? 'cancelled' : b.tripCategory,
              bookingStatus: nextBookingStatus,
              paymentStatus: nextPaymentStatus,
              paywuzTransaction: tx
            };
          })
        );
        showToast(`Status transaksi Paywuz: ${tx.status}`, 'info');
      } catch (err) {
        const msg = err instanceof PaywuzGatewayException ? err.message : 'Gagal memeriksa status transaksi.';
        showToast(msg, 'error');
      } finally {
        setIsCheckingPaywuzStatus(false);
      }
    },
    [isCheckingPaywuzStatus, showToast]
  );

  const handleCancelBooking = useCallback(
    async (bookingReference: string) => {
      const target = bookings.find((b) => b.bookingReference === bookingReference);
      const hasPaywuzTx = Boolean(target?.paywuzTransaction);

      if (hasPaywuzTx && isSupabaseConfigured()) {
        setIsCancellingPaywuz(true);
        try {
          const result = await cancelPaywuzTransaction(bookingReference);
          setBookings((prev) =>
            prev.map((b) =>
              b.bookingReference === bookingReference
                ? {
                    ...b,
                    tripCategory: 'cancelled',
                    bookingStatus: 'Dibatalkan',
                    paymentStatus: 'Dibatalkan',
                    paywuzTransaction: result.data ?? b.paywuzTransaction
                  }
                : b
            )
          );
          showToast(`Transaksi Paywuz & pemesanan ${bookingReference} dibatalkan.`, 'info');
        } catch (err) {
          const msg =
            err instanceof PaywuzGatewayException
              ? err.message
              : 'Transaksi tidak dapat dibatalkan saat ini.';
          showToast(msg, 'error');
        } finally {
          setIsCancellingPaywuz(false);
        }
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.bookingReference === bookingReference
            ? {
                ...b,
                tripCategory: 'cancelled',
                bookingStatus: 'Dibatalkan',
                paymentStatus: 'Dibatalkan'
              }
            : b
        )
      );
      showToast(`Pemesanan ${bookingReference} telah dibatalkan.`, 'info');
    },
    [bookings, showToast]
  );

  const handleLookupBooking = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLookupError('');
      const refInput = lookupRef.trim().toUpperCase();
      const contactInput = lookupContact.trim().toLowerCase();

      if (!refInput || !contactInput) {
        setLookupError('Masukkan Kode Booking serta Email atau Nomor Telepon yang terdaftar.');
        return;
      }

      let found = bookings.find((b) => {
        const refMatches = b.bookingReference.toUpperCase() === refInput;
        const emailMatches = b.guest.email.toLowerCase() === contactInput;
        const phoneClean = b.guest.phone.replace(/[\s\-()+]/g, '');
        const inputPhoneClean = contactInput.replace(/[\s\-()+]/g, '');
        const phoneMatches = inputPhoneClean.length >= 6 && phoneClean === inputPhoneClean;
        return refMatches && (emailMatches || phoneMatches);
      });

      if (!found && isSupabaseConfigured()) {
        const remoteBooking = await lookupBookingInSupabase(refInput, contactInput);
        if (remoteBooking) {
          found = remoteBooking;
          setBookings((prev) =>
            prev.some((b) => b.bookingReference === remoteBooking.bookingReference)
              ? prev
              : [remoteBooking, ...prev]
          );
        }
      }

      if (!found) {
        setLookupError(
          'Data pemesanan tidak ditemukan. Periksa kembali Kode Booking dan Email atau Nomor Telepon yang digunakan saat checkout.'
        );
        return;
      }

      setVerifiedBookingRefs((prev) =>
        prev.includes(found.bookingReference) ? prev : [found.bookingReference, ...prev]
      );
      setTripSubTab(found.tripCategory);
      showToast('Pemesanan berhasil diverifikasi.', 'success');
    },
    [bookings, lookupContact, lookupRef, showToast]
  );

  const clearFieldError = useCallback((field: string) => {
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const openNotificationsModal = useCallback(() => {
    setNotificationModalOpen(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }, []);

  const clearGuestSession = useCallback(() => {
    setGuestInfo({ fullName: '', email: '', phone: '', whatsapp: '' });
    setVerifiedBookingRefs([]);
    showToast('Data sesi tamu telah dibersihkan.', 'info');
  }, [showToast]);

  const activeReviewBooking = useMemo(
    () => bookings.find((b) => b.bookingReference === reviewBookingRef) ?? null,
    [bookings, reviewBookingRef]
  );

  const handleSubmitReview = useCallback(
    (bookingReference: string, review: BookingReview) => {
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingReference === bookingReference
            ? {
                ...b,
                review
              }
            : b
        )
      );
      void saveBookingReviewInSupabase(bookingReference, review);
      showToast('Terima kasih! Ulasan perjalanan Anda berhasil disimpan.', 'success');
    },
    [showToast]
  );

  return {
    activeTab,
    setActiveTab,
    goBack,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDestinationFilter,
    setSelectedDestinationFilter,
    priceFilter,
    setPriceFilter,
    durationFilter,
    setDurationFilter,
    sortBy,
    setSortBy,
    filterSheetOpen,
    setFilterSheetOpen,
    wishlistIds,
    toggleWishlist,
    notifications,
    unreadNotificationsCount,
    notificationModalOpen,
    setNotificationModalOpen,
    openNotificationsModal,
    bookingDraft,
    setBookingDraft,
    activeBookingPackage,
    activePricing,
    filteredPackages,
    activeFilterCount,
    guestInfo,
    setGuestInfo,
    sameWhatsappAsPhone,
    setSameWhatsappAsPhone,
    contactIsMainTraveler,
    setContactIsMainTraveler,
    selectedPaymentId,
    setSelectedPaymentId,
    selectedPaywuzBank,
    setSelectedPaywuzBank,
    selectedPaywuzRetailer,
    setSelectedPaywuzRetailer,
    paywuzMethods,
    paywuzMethodsLoading,
    paywuzMethodsError,
    loadPaywuzMethods,
    isCheckingPaywuzStatus,
    isCancellingPaywuz,
    handleRefreshPaywuzStatus,
    agreedTerms,
    setAgreedTerms,
    formErrors,
    clearFieldError,
    isSubmittingBooking,
    bookings,
    tripSubTab,
    setTripSubTab,
    lookupRef,
    setLookupRef,
    lookupContact,
    setLookupContact,
    lookupError,
    verifiedBookingRefs,
    legalModal,
    setLegalModal,
    toasts,
    showToast,
    openPackageDetail,
    openDestinationDetail,
    openInfoPage,
    openBookingDetail,
    syncBookingPackage,
    resetAllFilters,
    resetSheetFilters,
    startBookingForPackage,
    updateTravelerCounts,
    handleProceedToCheckout,
    handleConfirmBooking,
    handleCancelBooking,
    handleLookupBooking,
    clearGuestSession,
    reviewBookingRef,
    setReviewBookingRef,
    activeReviewBooking,
    handleSubmitReview
  };
}
