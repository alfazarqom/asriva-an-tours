import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { INITIAL_BOOKINGS, INITIAL_VERIFIED_BOOKING_REFS } from '../data/bookings';
import { INITIAL_NOTIFICATIONS, PAYMENT_CHANNELS } from '../data/constants';
import { PACKAGES_DATA } from '../data/packages';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  AulaaGatewayException,
  cancelAulaaPayment,
  createBookingWithAulaa,
  fetchAulaaPaymentMethods,
  lookupBookingInSupabase,
  refreshAulaaPaymentStatus,
  retryAulaaPayment,
  saveBookingReviewInSupabase
} from '../services/aulaaBackend';
import {
  AppNotification,
  AulaaPaymentMethod,
  AulaaTransaction,
  AulaaTransactionStatus,
  Booking,
  BookingDraft,
  BookingReview,
  DurationFilter,
  GuestInformation,
  InfoPageKey,
  MainTab,
  PriceFilter,
  SortBy,
  ToastMessage,
  TripSubTab
} from '../types/travel';
import { calculateBookingPricing, reconcileTravelers } from '../utils/booking';
import { generateBookingReference } from '../utils/formatters';
import { triggerHaptic } from '../utils/nativeExperience';
import { isValidEmail, isValidPhone } from '../utils/validators';

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
    isSupabaseConfigured() ? 'aulaa_all' : 'bank_transfer_verified'
  );
  const [selectedAulaaMethodCode, setSelectedAulaaMethodCode] = useState<string>('');
  const [aulaaMethods, setAulaaMethods] = useState<AulaaPaymentMethod[]>([]);
  const [aulaaMethodsLoading, setAulaaMethodsLoading] = useState<boolean>(false);
  const [aulaaMethodsError, setAulaaMethodsError] = useState<string>('');
  const [isCheckingAulaaStatus, setIsCheckingAulaaStatus] = useState<boolean>(false);
  const [isCancellingAulaa, setIsCancellingAulaa] = useState<boolean>(false);
  const [isRetryingAulaaPayment, setIsRetryingAulaaPayment] = useState<boolean>(false);
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);

  // Bookings Store & My Trips Filter State
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [tripSubTab, setTripSubTab] = useState<TripSubTab>('upcoming');
  const [lookupRef, setLookupRef] = useState<string>('');
  const [lookupContact, setLookupContact] = useState<string>('');
  const [lookupAccessToken, setLookupAccessToken] = useState<string>('');
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

    const isAulaaChannel =
      chosenPayment?.type === 'aulaa_hosted' || chosenPayment?.type === 'aulaa_direct';

    if (isAulaaChannel && !isSupabaseConfigured()) {
      errors.paymentMethod =
        'Metode Aulaa memerlukan konfigurasi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.';
    }

    if (selectedPaymentId === 'aulaa_direct' && !selectedAulaaMethodCode) {
      errors.paymentMethod = 'Silakan pilih salah satu channel pembayaran Aulaa yang tersedia.';
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
    selectedAulaaMethodCode,
    selectedPaymentId
  ]);

  const loadAulaaMethods = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setAulaaMethods([]);
      setAulaaMethodsError('');
      return;
    }

    setAulaaMethodsLoading(true);
    setAulaaMethodsError('');
    try {
      const methods = await fetchAulaaPaymentMethods();
      setAulaaMethods(methods);
    } catch (err) {
      const msg =
        err instanceof AulaaGatewayException
          ? err.message
          : 'Gagal memuat daftar metode pembayaran Aulaa.';
      setAulaaMethodsError(msg);
      setAulaaMethods([]);
    } finally {
      setAulaaMethodsLoading(false);
    }
  }, []);

  // Muat daftar metode Aulaa secara otomatis saat membuka /checkout
  useEffect(() => {
    if (location.pathname === '/checkout' && isSupabaseConfigured()) {
      void loadAulaaMethods();
    }
  }, [loadAulaaMethods, location.pathname]);

  // Sinkronisasi Realtime dari Supabase Webhook Aulaa
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('aulaa-tx-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'aulaa_transactions' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const orderId = String(row.order_id || '');
          const nextStatus = row.status as AulaaTransactionStatus;
          if (!orderId || !nextStatus) return;

          setBookings((prev) =>
            prev.map((b) => {
              if (b.bookingReference !== orderId) return b;
              const nextPaymentStatus: Booking['paymentStatus'] =
                nextStatus === 'paid'
                  ? 'Lunas (Terverifikasi)'
                  : nextStatus === 'expired'
                    ? 'Kadaluarsa (Melewati Batas Waktu)'
                    : nextStatus === 'failed'
                      ? 'Pembayaran Gagal'
                      : nextStatus === 'cancelled'
                        ? 'Dibatalkan'
                        : nextStatus === 'refunded'
                          ? 'Dana Dikembalikan'
                          : 'Belum Dibayar - Menunggu Pembayaran';

              const nextBookingStatus: Booking['bookingStatus'] =
                nextStatus === 'paid'
                  ? 'Terkonfirmasi - Lunas'
                  : nextStatus === 'expired'
                    ? 'Kadaluarsa'
                    : nextStatus === 'cancelled'
                      ? 'Dibatalkan'
                      : nextStatus === 'refunded'
                        ? 'Dana Dikembalikan'
                        : 'Menunggu Pembayaran (Aulaa)';

              return {
                ...b,
                tripCategory:
                  nextStatus === 'cancelled' || nextStatus === 'expired' || nextStatus === 'refunded' ? 'cancelled' : b.tripCategory,
                bookingStatus: nextBookingStatus,
                paymentStatus: nextPaymentStatus,
                aulaaTransaction: b.aulaaTransaction
                  ? {
                      ...b.aulaaTransaction,
                      status: nextStatus,
                      paymentMethod:
                        (row.payment_method as string | null) ?? b.aulaaTransaction.paymentMethod,
                      feeAmount:
                        typeof row.fee_amount === 'number'
                          ? row.fee_amount
                          : b.aulaaTransaction.feeAmount,
                      totalAmount:
                        typeof row.total_amount === 'number'
                          ? row.total_amount
                          : b.aulaaTransaction.totalAmount,
                      paymentNumber:
                        (row.payment_number as string | null) ?? b.aulaaTransaction.paymentNumber,
                      paidAt: (row.paid_at as string | null) ?? b.aulaaTransaction.paidAt
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
      const isAulaaChannel =
        chosenPayment.type === 'aulaa_hosted' || chosenPayment.type === 'aulaa_direct';

      const selectedMethodObj =
        chosenPayment.type === 'aulaa_direct'
          ? aulaaMethods.find((m) => m.code === selectedAulaaMethodCode)
          : undefined;

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
        paymentMethodName: selectedMethodObj
          ? `Aulaa — ${selectedMethodObj.name}`
          : chosenPayment.name,
        tripCategory: 'upcoming',
        bookingStatus: isAulaaChannel
          ? 'Menunggu Pembayaran (Aulaa)'
          : chosenPayment.type === 'pay_at_office'
            ? 'Terkonfirmasi - Slot Ditahan'
            : 'Menunggu Verifikasi Pembayaran',
        paymentStatus: 'Belum Dibayar - Menunggu Pembayaran'
      };

      if (isAulaaChannel || isSupabaseConfigured()) {
        const result = await createBookingWithAulaa({
          booking: newBooking,
          optionId: bookingDraft.optionId,
          aulaa: isAulaaChannel
            ? {
                paymentMethod:
                  chosenPayment.type === 'aulaa_direct' && selectedAulaaMethodCode
                    ? selectedAulaaMethodCode
                    : undefined,
                paymentMethodName: selectedMethodObj?.name,
                paymentMethodType: selectedMethodObj?.type,
                redirectUrl: `${window.location.origin}/booking/confirmed/${reference}`
              }
            : undefined
        });

        if (!result.accessToken) throw new Error('Token akses booking tidak diterbitkan.');
        if (result.booking) Object.assign(newBooking, result.booking);
        newBooking.accessToken = result.accessToken;
        if (result.transaction) newBooking.aulaaTransaction = result.transaction;
        if (result.paymentError) showToast(result.paymentError.message, 'warning');
      }

      setBookings((prev) => [newBooking, ...prev]);
      setVerifiedBookingRefs((prev) => (prev.includes(reference) ? prev : [reference, ...prev]));
      setLookupRef(reference);
      setLookupContact(guestInfo.email.trim());
      setLookupAccessToken(newBooking.accessToken || '');
      navigate(`/booking/confirmed/${reference}`, { replace: true });
      showToast(`Pemesanan ${reference} berhasil dibuat.`, 'success');
    } catch (err) {
      if (err instanceof AulaaGatewayException) {
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
    aulaaMethods,
    bookingDraft,
    guestInfo,
    isSubmittingBooking,
    navigate,
    sameWhatsappAsPhone,
    selectedAulaaMethodCode,
    selectedPaymentId,
    showToast,
    validateCheckoutForm
  ]);

  const handleRefreshAulaaStatus = useCallback(
    async (bookingReference: string) => {
      if (isCheckingAulaaStatus) return;
      setIsCheckingAulaaStatus(true);
      try {
        const target = bookings.find((b) => b.bookingReference === bookingReference);
        if (!target?.accessToken) throw new AulaaGatewayException('Token akses booking diperlukan. Cari booking kembali menggunakan token Anda.');
        const tx: AulaaTransaction = await refreshAulaaPaymentStatus(bookingReference, target.accessToken);
        setBookings((prev) =>
          prev.map((b) => {
            if (b.bookingReference !== bookingReference) return b;
            const nextPaymentStatus: Booking['paymentStatus'] =
              tx.status === 'paid'
                ? 'Lunas (Terverifikasi)'
                : tx.status === 'expired'
                  ? 'Kadaluarsa (Melewati Batas Waktu)'
                  : tx.status === 'failed'
                    ? 'Pembayaran Gagal'
                    : tx.status === 'cancelled'
                      ? 'Dibatalkan'
                      : tx.status === 'refunded'
                        ? 'Dana Dikembalikan'
                        : 'Belum Dibayar - Menunggu Pembayaran';

            const nextBookingStatus: Booking['bookingStatus'] =
              tx.status === 'paid'
                ? 'Terkonfirmasi - Lunas'
                : tx.status === 'expired'
                  ? 'Kadaluarsa'
                  : tx.status === 'cancelled'
                    ? 'Dibatalkan'
                    : tx.status === 'refunded'
                      ? 'Dana Dikembalikan'
                      : 'Menunggu Pembayaran (Aulaa)';

            return {
              ...b,
              tripCategory:
                tx.status === 'cancelled' || tx.status === 'expired' || tx.status === 'refunded' ? 'cancelled' : b.tripCategory,
              bookingStatus: nextBookingStatus,
              paymentStatus: nextPaymentStatus,
              aulaaTransaction: tx
            };
          })
        );
        showToast(`Status pembayaran Aulaa: ${tx.status}`, 'info');
      } catch (err) {
        const msg = err instanceof AulaaGatewayException ? err.message : 'Gagal memeriksa status transaksi.';
        showToast(msg, 'error');
      } finally {
        setIsCheckingAulaaStatus(false);
      }
    },
    [bookings, isCheckingAulaaStatus, showToast]
  );

  const handleRetryAulaaPayment = useCallback(
    async (bookingReference: string) => {
      if (isRetryingAulaaPayment) return;
      const target = bookings.find((b) => b.bookingReference === bookingReference);
      if (!target?.accessToken) {
        showToast('Token akses booking diperlukan untuk memulihkan invoice.', 'error');
        return;
      }
      setIsRetryingAulaaPayment(true);
      try {
        const tx = await retryAulaaPayment(bookingReference, target.accessToken);
        setBookings((prev) => prev.map((b) => b.bookingReference === bookingReference ? {
          ...b,
          aulaaTransaction: tx,
          bookingStatus: tx.status === 'paid' ? 'Terkonfirmasi - Lunas' : tx.status === 'refunded' ? 'Dana Dikembalikan' : 'Menunggu Pembayaran (Aulaa)',
          paymentStatus: tx.status === 'paid' ? 'Lunas (Terverifikasi)' : tx.status === 'refunded' ? 'Dana Dikembalikan' : 'Belum Dibayar - Menunggu Pembayaran',
          tripCategory: tx.status === 'refunded' || tx.status === 'expired' || tx.status === 'cancelled' ? 'cancelled' : b.tripCategory
        } : b));
        showToast('Invoice Aulaa berhasil dipulihkan.', 'success');
      } catch (err) {
        showToast(err instanceof AulaaGatewayException ? err.message : 'Invoice belum dapat dipulihkan.', 'error');
      } finally {
        setIsRetryingAulaaPayment(false);
      }
    },
    [bookings, isRetryingAulaaPayment, showToast]
  );

  const handleCancelBooking = useCallback(
    async (bookingReference: string) => {
      const target = bookings.find((b) => b.bookingReference === bookingReference);
      if (isSupabaseConfigured() && target?.accessToken) {
        setIsCancellingAulaa(true);
        try {
          if (!target?.accessToken) throw new AulaaGatewayException('Token akses booking diperlukan.');
          const result = await cancelAulaaPayment(bookingReference, target.accessToken);
          setBookings((prev) =>
            prev.map((b) =>
              b.bookingReference === bookingReference
                ? {
                    ...b,
                    tripCategory: 'cancelled',
                    bookingStatus: 'Dibatalkan',
                    paymentStatus: 'Dibatalkan',
                    aulaaTransaction: result.data ?? b.aulaaTransaction
                  }
                : b
            )
          );
          showToast(`Transaksi Aulaa & pemesanan ${bookingReference} dibatalkan.`, 'info');
        } catch (err) {
          const msg =
            err instanceof AulaaGatewayException
              ? err.message
              : 'Transaksi tidak dapat dibatalkan saat ini.';
          showToast(msg, 'error');
        } finally {
          setIsCancellingAulaa(false);
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

      const tokenInput = lookupAccessToken.trim();
      if (!refInput || !contactInput || !tokenInput) {
        setLookupError('Masukkan Kode Booking, email/telepon, dan Token Akses Booking.');
        return;
      }

      let found = bookings.find((b) => {
        const refMatches = b.bookingReference.toUpperCase() === refInput;
        const emailMatches = b.guest.email.toLowerCase() === contactInput;
        const phoneClean = b.guest.phone.replace(/[\s\-()+]/g, '');
        const inputPhoneClean = contactInput.replace(/[\s\-()+]/g, '');
        const phoneMatches = inputPhoneClean.length >= 6 && phoneClean === inputPhoneClean;
        return refMatches && (emailMatches || phoneMatches) && b.accessToken === tokenInput;
      });

      if (!found && isSupabaseConfigured()) {
        const remoteBooking = await lookupBookingInSupabase(refInput, contactInput, tokenInput);
        if (remoteBooking) {
          remoteBooking.accessToken = tokenInput;
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
    [bookings, lookupAccessToken, lookupContact, lookupRef, showToast]
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
    async (bookingReference: string, review: BookingReview) => {
      const target = bookings.find((b) => b.bookingReference === bookingReference);
      if (!target?.accessToken) {
        showToast('Token akses booking diperlukan untuk menyimpan ulasan.', 'error');
        return;
      }
      try {
        await saveBookingReviewInSupabase(bookingReference, review, target.accessToken);
        setBookings((prev) => prev.map((b) => b.bookingReference === bookingReference ? { ...b, review } : b));
        showToast('Terima kasih! Ulasan perjalanan Anda berhasil disimpan.', 'success');
      } catch (err) {
        showToast(err instanceof AulaaGatewayException ? err.message : 'Ulasan belum dapat disimpan.', 'error');
      }
    },
    [bookings, showToast]
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
    selectedAulaaMethodCode,
    setSelectedAulaaMethodCode,
    aulaaMethods,
    aulaaMethodsLoading,
    aulaaMethodsError,
    loadAulaaMethods,
    isCheckingAulaaStatus,
    isCancellingAulaa,
    isRetryingAulaaPayment,
    handleRetryAulaaPayment,
    handleRefreshAulaaStatus,
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
    lookupAccessToken,
    setLookupAccessToken,
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
