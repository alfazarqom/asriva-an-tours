import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  Booking,
  BookingReview,
  PaywuzEndpointMode,
  PaywuzPaymentMethod,
  PaywuzTransaction
} from '../types/travel';

export interface PaywuzApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    field?: string;
  };
}

export class PaywuzGatewayException extends Error {
  code: string;
  field?: string;

  constructor(message: string, code = 'gateway_error', field?: string) {
    super(message);
    this.name = 'PaywuzGatewayException';
    this.code = code;
    this.field = field;
  }
}

async function extractFunctionError(error: unknown): Promise<PaywuzGatewayException> {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try {
        const body = (await context.json()) as PaywuzApiErrorPayload;
        if (body?.error?.message) {
          return new PaywuzGatewayException(
            body.error.message,
            body.error.code || 'gateway_error',
            body.error.field
          );
        }
      } catch {
        // fallback below
      }
    }
  }
  const msg = error instanceof Error ? error.message : 'Gagal menghubungi layanan Supabase Edge Function.';
  return new PaywuzGatewayException(msg);
}

export async function fetchPaywuzPaymentMethods(
  amount: number
): Promise<PaywuzPaymentMethod[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new PaywuzGatewayException(
      'Konfigurasi Supabase (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('paywuz-payment-methods', {
    body: { amount: Math.round(amount) }
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new PaywuzGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return Array.isArray(data?.data) ? (data.data as PaywuzPaymentMethod[]) : [];
}

export interface CreatePaywuzBookingParams {
  booking: Booking;
  paywuz?: {
    endpointMode: PaywuzEndpointMode;
    bank?: string;
    retailer?: 'ALFAMART' | 'INDOMARET';
    redirectUrl?: string;
  };
}

export async function createBookingWithPaywuz(
  params: CreatePaywuzBookingParams
): Promise<{ bookingReference: string; transaction: PaywuzTransaction | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new PaywuzGatewayException(
      'Konfigurasi Supabase (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('paywuz-create-transaction', {
    body: params
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new PaywuzGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return {
    bookingReference: data?.bookingReference || params.booking.bookingReference,
    transaction: (data?.transaction as PaywuzTransaction | null) ?? null
  };
}

export async function refreshPaywuzTransactionStatus(orderId: string): Promise<PaywuzTransaction> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new PaywuzGatewayException(
      'Konfigurasi Supabase belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('paywuz-transaction-status', {
    body: { orderId }
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new PaywuzGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return data.data as PaywuzTransaction;
}

export async function cancelPaywuzTransaction(
  orderId: string
): Promise<{ data: PaywuzTransaction | null; bookingCancelled?: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new PaywuzGatewayException(
      'Konfigurasi Supabase belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('paywuz-cancel-transaction', {
    body: { orderId }
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new PaywuzGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return data as { data: PaywuzTransaction | null; bookingCancelled?: boolean };
}

export async function lookupBookingInSupabase(
  bookingReference: string,
  contact: string
): Promise<Booking | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  const { data, error } = await supabase.functions.invoke('bookings-lookup', {
    body: { action: 'lookup', bookingReference, contact }
  });

  if (error || data?.error || !data?.booking) {
    return null;
  }

  return data.booking as Booking;
}

export async function saveBookingReviewInSupabase(
  bookingReference: string,
  review: BookingReview
): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) {
    return;
  }

  await supabase.functions.invoke('bookings-lookup', {
    body: { action: 'save_review', bookingReference, review }
  });
}
