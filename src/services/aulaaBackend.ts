import { isSupabaseConfigured, supabase } from '../lib/supabase';
import {
  AulaaPaymentMethod,
  AulaaTransaction,
  Booking,
  BookingReview
} from '../types/travel';

export interface AulaaApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    field?: string;
  };
}

export class AulaaGatewayException extends Error {
  code: string;
  field?: string;

  constructor(message: string, code = 'gateway_error', field?: string) {
    super(message);
    this.name = 'AulaaGatewayException';
    this.code = code;
    this.field = field;
  }
}

async function extractFunctionError(error: unknown): Promise<AulaaGatewayException> {
  if (error && typeof error === 'object' && 'context' in error) {
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === 'function') {
      try {
        const body = (await context.json()) as AulaaApiErrorPayload;
        if (body?.error?.message) {
          return new AulaaGatewayException(
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
  return new AulaaGatewayException(msg);
}

export async function fetchAulaaPaymentMethods(): Promise<AulaaPaymentMethod[]> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new AulaaGatewayException(
      'Konfigurasi Supabase (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('aulaa-payment-methods', {
    body: {}
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new AulaaGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return Array.isArray(data?.methods) ? (data.methods as AulaaPaymentMethod[]) : [];
}

export interface CreateAulaaBookingParams {
  booking: Booking;
  aulaa?: {
    paymentMethod?: string;
    paymentMethodName?: string;
    paymentMethodType?: string;
    redirectUrl?: string;
  };
}

export async function createBookingWithAulaa(
  params: CreateAulaaBookingParams
): Promise<{ bookingReference: string; transaction: AulaaTransaction | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new AulaaGatewayException(
      'Konfigurasi Supabase (VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY) belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('aulaa-create-payment', {
    body: params
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new AulaaGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return {
    bookingReference: data?.bookingReference || params.booking.bookingReference,
    transaction: (data?.transaction as AulaaTransaction | null) ?? null
  };
}

export async function refreshAulaaPaymentStatus(orderId: string): Promise<AulaaTransaction> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new AulaaGatewayException(
      'Konfigurasi Supabase belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('aulaa-payment-status', {
    body: { orderId }
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new AulaaGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return data.data as AulaaTransaction;
}

export async function cancelAulaaPayment(
  orderId: string
): Promise<{ data: AulaaTransaction | null; bookingCancelled?: boolean }> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new AulaaGatewayException(
      'Konfigurasi Supabase belum diatur.',
      'supabase_not_configured'
    );
  }

  const { data, error } = await supabase.functions.invoke('aulaa-cancel-payment', {
    body: { orderId }
  });

  if (error) {
    throw await extractFunctionError(error);
  }
  if (data?.error?.message) {
    throw new AulaaGatewayException(data.error.message, data.error.code || 'gateway_error', data.error.field);
  }

  return data as { data: AulaaTransaction | null; bookingCancelled?: boolean };
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
