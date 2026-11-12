import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PAYWUZ_API_BASE = 'https://api.paywuz.id/v2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

type PaywuzStatus = 'pending' | 'settlement' | 'success' | 'failed' | 'cancelled';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function getPaywuzApiKey(): string {
  const apiKey = Deno.env.get('PAYWUZ_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('PAYWUZ_API_KEY belum dikonfigurasi pada Supabase Edge Function Secrets.');
  }
  return apiKey;
}

function getSupabaseAdmin() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim();
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim();
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak tersedia.');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

function mapPaywuzStatusToBookingState(status: PaywuzStatus): {
  trip_category: 'upcoming' | 'cancelled';
  booking_status: string;
  payment_status: string;
} {
  switch (status) {
    case 'settlement':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Menunggu Settlement',
        payment_status: 'Settlement (Menunggu Dana Masuk)'
      };
    case 'success':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Lunas',
        payment_status: 'Lunas (Terverifikasi)'
      };
    case 'failed':
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Paywuz)',
        payment_status: 'Pembayaran Gagal'
      };
    case 'cancelled':
      return {
        trip_category: 'cancelled',
        booking_status: 'Dibatalkan',
        payment_status: 'Dibatalkan'
      };
    case 'pending':
    default:
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Paywuz)',
        payment_status: 'Belum Dibayar - Menunggu Pembayaran'
      };
  }
}

interface CreateTransactionRequest {
  booking: {
    bookingReference: string;
    packageId: string;
    packageName: string;
    optionName: string;
    destination: string;
    duration: string;
    packageImage: string;
    guest: {
      fullName: string;
      email: string;
      phone: string;
      whatsapp: string;
    };
    travelers: unknown[];
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
    bookingStatus?: string;
  };
  paywuz?: {
    endpointMode: 'va' | 'qris' | 'retail' | 'all';
    bank?: string;
    retailer?: 'ALFAMART' | 'INDOMARET';
    redirectUrl?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: { code: 'method_not_allowed', message: 'Method harus POST.' } }, 405);
  }

  try {
    const body = (await req.json()) as CreateTransactionRequest;
    const { booking, paywuz } = body;

    if (!booking?.bookingReference || !booking.guest?.fullName) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'Data booking dan pemesan wajib dilengkapi.' } },
        400
      );
    }

    const supabase = getSupabaseAdmin();

    const { error: insertBookingError } = await supabase.from('bookings').insert({
      booking_reference: booking.bookingReference,
      package_id: booking.packageId,
      package_name: booking.packageName,
      option_name: booking.optionName,
      destination: booking.destination,
      duration: booking.duration,
      package_image: booking.packageImage,
      guest: booking.guest,
      travelers: booking.travelers,
      departure_date: booking.departureDate,
      meeting_point: booking.meetingPoint,
      departure_location: booking.departureLocation,
      adults: booking.adults,
      children: booking.children,
      infants: booking.infants,
      subtotal: booking.subtotal,
      discount_total: booking.discountTotal,
      promo_discount: booking.promoDiscount,
      promo_code_applied: booking.promoCodeApplied ?? null,
      service_fee: booking.serviceFee,
      total_amount: booking.totalAmount,
      special_request: booking.specialRequest ?? null,
      payment_method_id: booking.paymentMethodId,
      payment_method_name: booking.paymentMethodName,
      trip_category: 'upcoming',
      booking_status: paywuz
        ? 'Menunggu Pembayaran (Paywuz)'
        : booking.bookingStatus || 'Menunggu Verifikasi Pembayaran',
      payment_status: 'Belum Dibayar - Menunggu Pembayaran'
    });

    if (insertBookingError) {
      return jsonResponse(
        { error: { code: 'database_error', message: insertBookingError.message } },
        400
      );
    }

    if (!paywuz) {
      return jsonResponse({ bookingReference: booking.bookingReference, transaction: null }, 201);
    }

    const apiKey = getPaywuzApiKey();
    const endpointMode = paywuz.endpointMode;
    const endpointPathMap: Record<'va' | 'qris' | 'retail' | 'all', string> = {
      va: '/transactions/va',
      qris: '/transactions/qris',
      retail: '/transactions/retail',
      all: '/transactions/all'
    };

    const paywuzBody: Record<string, unknown> = {
      orderId: booking.bookingReference,
      amount: Math.round(booking.totalAmount),
      customer: {
        name: booking.guest.fullName.slice(0, 100),
        email: booking.guest.email,
        phone: booking.guest.phone
      },
      metadata: {
        packageId: booking.packageId,
        departureDate: booking.departureDate
      }
    };

    if (paywuz.redirectUrl) {
      paywuzBody.redirectUrl = paywuz.redirectUrl;
    }

    if (endpointMode === 'va' && paywuz.bank) {
      paywuzBody.bank = paywuz.bank;
    }

    if (endpointMode === 'retail') {
      paywuzBody.retailer = paywuz.retailer;
    }

    const upstream = await fetch(`${PAYWUZ_API_BASE}${endpointPathMap[endpointMode]}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paywuzBody)
    });

    const upstreamJson = await upstream.json();

    if (!upstream.ok || !upstreamJson?.data) {
      await supabase.from('bookings').delete().eq('booking_reference', booking.bookingReference);
      return jsonResponse(upstreamJson, upstream.status);
    }

    const tx = upstreamJson.data;
    const mappedBookingState = mapPaywuzStatusToBookingState((tx.status as PaywuzStatus) || 'pending');

    await supabase.from('paywuz_transactions').upsert(
      {
        id: tx.id,
        order_id: tx.orderId,
        status: tx.status,
        endpoint_mode: endpointMode,
        method_type: tx.method?.type ?? null,
        method_code: tx.method?.code ?? null,
        method_name: tx.method?.name ?? null,
        amount: tx.amount,
        fee_amount: tx.fee?.amount ?? 0,
        fee_paid_by: tx.fee?.paidBy ?? 'customer',
        total_payment: tx.totalPayment,
        net_amount: tx.netAmount,
        payment_url: tx.payment?.url ?? '',
        va_number: tx.payment?.vaNumber ?? null,
        qr_string: tx.payment?.qrString ?? null,
        retail_code: tx.payment?.retailCode ?? null,
        customer: tx.customer ?? null,
        metadata: tx.metadata ?? null,
        expires_at: tx.expiresAt ?? null,
        paid_at: tx.paidAt ?? null,
        paywuz_created_at: tx.createdAt ?? null
      },
      { onConflict: 'order_id' }
    );

    await supabase
      .from('bookings')
      .update({
        booking_status: mappedBookingState.booking_status,
        payment_status: mappedBookingState.payment_status,
        trip_category: mappedBookingState.trip_category
      })
      .eq('booking_reference', booking.bookingReference);

    return jsonResponse(
      {
        bookingReference: booking.bookingReference,
        transaction: tx
      },
      upstream.status
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat transaksi Paywuz v2.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
