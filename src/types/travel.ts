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

export type AulaaMethodType = 'qr_code' | 'virtual_account' | 'card' | 'ewallet' | 'retail' | string;
export type AulaaTransactionStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed' | 'refunded';

export interface AulaaPaymentMethod {
  code: string;
  name: string;
  type: AulaaMethodType;
  isAvailable: boolean;
  minAmount: number;
  maxAmount: number;
}

export interface AulaaTransaction {
  id: string;
  orderId: string;
  status: AulaaTransactionStatus;
  paymentMethod: string | null;
  paymentMethodName: string | null;
  paymentMethodType: string | null;
  amount: number;
  feeAmount: number;
  totalAmount: number;
  paymentLink: string;
  paymentNumber: string | null;
  currency: string;
  countryCode: string;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string | null;
}

export interface PaymentChannelOption {
  id: string;
  name: string;
  type: 'aulaa_hosted' | 'aulaa_direct' | 'manual_verification' | 'pay_at_office';
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
    | 'Menunggu Pembayaran (Aulaa)'
    | 'Menunggu Verifikasi Pembayaran'
    | 'Terkonfirmasi - Slot Ditahan'
    | 'Terkonfirmasi - Lunas'
    | 'Kadaluarsa'
    | 'Selesai'
    | 'Dibatalkan'
    | 'Dana Dikembalikan';
  paymentStatus:
    | 'Belum Dibayar - Menunggu Pembayaran'
    | 'Lunas (Terverifikasi)'
    | 'Kadaluarsa (Melewati Batas Waktu)'
    | 'Pembayaran Gagal'
    | 'Dibatalkan'
    | 'Dana Dikembalikan';
  accessToken?: string;
  aulaaTransaction?: AulaaTransaction;
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
