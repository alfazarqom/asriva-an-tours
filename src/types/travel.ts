export type ItineraryActivityType = 'transport' | 'sightseeing' | 'meal' | 'stay';

export interface ItineraryActivity {
  time: string;
  title: string;
  detail?: string;
  type: ItineraryActivityType;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  activities?: ItineraryActivity[];
  meals?: string[];
  accommodation?: string;
}

export interface PackageOptionTier {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
}

export interface ReviewItem {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
}

export interface TravelPackage {
  id: string;
  slug: string;
  name: string;
  description: string;
  destination: string;
  destinationId: string;
  category: string;
  images: string[];
  duration: string;
  durationDays: number;
  price: number;
  discountPrice?: number;
  childPriceMultiplier: number;
  infantPriceMultiplier: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  packageOptions: PackageOptionTier[];
  departureDates: string[];
  meetingPoint: string;
  departureLocation: string;
  travelSchedule: string;
  accommodationSummary: string;
  transportationSummary: string;
  itinerary: ItineraryItem[];
  inclusions: string[];
  exclusions: string[];
  importantNotes: string[];
  cancellationPolicy: string[];
  reviews: ReviewItem[];
  availability: number;
  minTravelers: number;
  maxTravelers: number;
  featured?: boolean;
  recommended?: boolean;
  specialOffer?: boolean;
}

export interface AttractionItem {
  name: string;
  description: string;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DestinationInfo {
  id: string;
  name: string;
  country: string;
  region: string;
  category: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
  bestTimeToVisit: string;
  language: string;
  currency: string;
  timezone: string;
  featured?: boolean;
  mapCenter: {
    lat: number;
    lng: number;
  };
  mapZoom: number;
  popularAttractions: AttractionItem[];
}

export interface Traveler {
  id: string;
  type: 'Adult' | 'Child' | 'Infant';
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | '';
  identityNumber: string;
  specialRequirements: string;
}

export interface BookingDraft {
  packageId: string;
  optionId: string;
  departureDate: string;
  adults: number;
  children: number;
  infants: number;
  travelers: Traveler[];
  promoCode: string;
  specialRequest: string;
}

export interface GuestInformation {
  fullName: string;
  email: string;
  phone: string;
  whatsapp: string;
}

export type PaywuzMethodType = 'virtual_account' | 'qris' | 'retail';
export type PaywuzEndpointMode = 'va' | 'qris' | 'retail' | 'all';
export type PaywuzTransactionStatus = 'pending' | 'settlement' | 'success' | 'failed' | 'cancelled';

export interface PaywuzPaymentMethod {
  code: string;
  name: string;
  type: PaywuzMethodType;
  limits: {
    min: number;
    max: number;
  };
  fee: {
    flat: number;
    percent: number;
    amount: number | null;
  };
  available: boolean | null;
}

export interface PaywuzTransaction {
  id: string;
  orderId: string;
  status: PaywuzTransactionStatus;
  method: {
    type: PaywuzMethodType | null;
    code: string | null;
    name: string | null;
  };
  amount: number;
  fee: {
    amount: number;
    paidBy: 'customer' | 'merchant';
  };
  totalPayment: number;
  netAmount: number;
  payment: {
    url: string;
    vaNumber: string | null;
    qrString: string | null;
    retailCode: string | null;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  } | null;
  metadata: Record<string, unknown> | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface PaymentChannelOption {
  id: string;
  name: string;
  type: 'paywuz_v2' | 'manual_verification' | 'pay_at_office';
  description: string;
  statusLabel: string;
  available: boolean;
}

export interface BookingReview {
  rating: number;
  comment: string;
  author: string;
  submittedAt: string;
}

export interface Booking {
  bookingReference: string;
  createdAt: string;
  packageId: string;
  packageName: string;
  optionName: string;
  destination: string;
  duration: string;
  packageImage: string;
  guest: GuestInformation;
  travelers: Traveler[];
  departureDate: string;
  meetingPoint: string;
  departureLocation: string;
  adults: number;
  children: number;
  infants: number;
  subtotal: number;
  discountTotal: number;
  promoDiscount: number;
  promoCodeApplied?: string;
  serviceFee: number;
  totalAmount: number;
  specialRequest?: string;
  paymentMethodId: string;
  paymentMethodName: string;
  tripCategory: 'upcoming' | 'completed' | 'cancelled';
  bookingStatus:
    | 'Menunggu Pembayaran (Paywuz)'
    | 'Menunggu Verifikasi Pembayaran'
    | 'Terkonfirmasi - Menunggu Settlement'
    | 'Terkonfirmasi - Slot Ditahan'
    | 'Terkonfirmasi - Lunas'
    | 'Selesai'
    | 'Dibatalkan';
  paymentStatus:
    | 'Belum Dibayar - Menunggu Pembayaran'
    | 'Settlement (Menunggu Dana Masuk)'
    | 'Lunas (Terverifikasi)'
    | 'Pembayaran Gagal'
    | 'Dibatalkan';
  paywuzTransaction?: PaywuzTransaction;
  review?: BookingReview;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

export type MainTab = 'home' | 'explore' | 'wishlist' | 'bookings' | 'profile';

export type InfoPageKey = 'about' | 'contact' | 'help' | 'terms' | 'privacy';

export type StandaloneView =
  | null
  | { type: 'destination'; destinationId: string }
  | { type: 'package'; packageId: string }
  | { type: 'booking'; packageId: string }
  | { type: 'checkout' }
  | { type: 'confirmation'; bookingReference: string }
  | { type: 'bookingDetail'; bookingReference: string }
  | { type: 'infoPage'; page: InfoPageKey };

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export type PriceFilter = 'all' | 'under5m' | '5mto15m' | 'above15m';
export type DurationFilter = 'all' | '1to3' | '4to5' | '6plus';
export type SortBy = 'recommended' | 'price_asc' | 'price_desc' | 'rating_desc';
export type TripSubTab = 'upcoming' | 'completed' | 'cancelled';

export interface PricingBreakdown {
  optionDelta: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  adultsTotal: number;
  childrenTotal: number;
  infantsTotal: number;
  baseSubtotal: number;
  packageDiscountTotal: number;
  subtotalAfterPackageDiscount: number;
  promoDiscount: number;
  promoCodeValid: boolean;
  promoLabel?: string;
  serviceFee: number;
  totalAmount: number;
  totalTravelers: number;
}
