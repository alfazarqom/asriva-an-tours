import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const AULAA_API_BASE = 'https://api.aulaa.co/v1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

type AulaaStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}

function getAulaaApiKey(): string {
  const apiKey = Deno.env.get('AULAA_API_KEY')?.trim();
  if (!apiKey) {
    throw new Error('AULAA_API_KEY belum dikonfigurasi pada Supabase Edge Function Secrets.');
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

function mapAulaaStatusToBookingState(status: AulaaStatus): {
  trip_category: 'upcoming' | 'cancelled';
  booking_status: string;
  payment_status: string;
} {
  switch (status) {
    case 'paid':
      return {
        trip_category: 'upcoming',
        booking_status: 'Terkonfirmasi - Lunas',
        payment_status: 'Lunas (Terverifikasi)'
      };
    case 'expired':
      return {
        trip_category: 'cancelled',
        booking_status: 'Kadaluarsa',
        payment_status: 'Kadaluarsa (Melewati Batas Waktu)'
      };
    case 'cancelled':
      return {
        trip_category: 'cancelled',
        booking_status: 'Dibatalkan',
        payment_status: 'Dibatalkan'
      };
    case 'failed':
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Aulaa)',
        payment_status: 'Pembayaran Gagal'
      };
    case 'pending':
    default:
      return {
        trip_category: 'upcoming',
        booking_status: 'Menunggu Pembayaran (Aulaa)',
        payment_status: 'Belum Dibayar - Menunggu Pembayaran'
      };
  }
}

interface CreatePaymentRequest {
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
  aulaa?: {
    paymentMethod?: string;
    paymentMethodName?: string;
    paymentMethodType?: string;
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
    const body = (await req.json()) as CreatePaymentRequest;
    const { booking, aulaa } = body;

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
      booking_status: aulaa
        ? 'Menunggu Pembayaran (Aulaa)'
        : booking.bookingStatus || 'Menunggu Verifikasi Pembayaran',
      payment_status: 'Belum Dibayar - Menunggu Pembayaran'
    });

    if (insertBookingError) {
      return jsonResponse(
        { error: { code: 'database_error', message: insertBookingError.message } },
        400
      );
    }

    if (!aulaa) {
      return jsonResponse({ bookingReference: booking.bookingReference, transaction: null }, 201);
    }

    const apiKey = getAulaaApiKey();
    const aulaaPayload: Record<string, unknown> = {
      order_id: booking.bookingReference,
      amount: Math.round(booking.totalAmount)
    };

    if (aulaa.paymentMethod) {
      aulaaPayload.payment_method = aulaa.paymentMethod;
    }
    if (aulaa.redirectUrl) {
      aulaaPayload.redirect_url = aulaa.redirectUrl;
    }

    const upstream = await fetch(`${AULAA_API_BASE}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(aulaaPayload)
    });

    const upstreamJson = await upstream.json();
    const p =
      upstreamJson?.data && typeof upstreamJson.data === 'object'
        ? (upstreamJson.data as Record<string, unknown>)
        : (upstreamJson as Record<string, unknown>);

    if (!upstream.ok || !p?.id) {
      await supabase.from('bookings').delete().eq('booking_reference', booking.bookingReference);
      const errMessage =
        (upstreamJson?.error as { message?: string } | undefined)?.message ||
        (upstreamJson?.message as string | undefined) ||
        'Gagal membuat tagihan di Aulaa.';
      return jsonResponse(
        {
          error: {
            code: (upstreamJson?.error as { code?: string } | undefined)?.code || 'aulaa_error',
            message: errMessage
          }
        },
        upstream.status >= 400 ? upstream.status : 400
      );
    }

    const txId = String(p.id);
    const txStatus = ((p.status as string) || 'pending') as AulaaStatus;
    const amount = Number(p.amount ?? Math.round(booking.totalAmount));
    const feeAmount = Number(p.fee_amount ?? 0);
    const totalAmount = Number(p.total_amount ?? amount + feeAmount);
    const paymentLink = String(p.payment_link || `https://payment.aulaa.co/pay/${txId}`);
    const paymentNumber = p.payment_number ? String(p.payment_number) : null;
    const paymentMethod = p.payment_method ? String(p.payment_method) : aulaa.paymentMethod ?? null;
    const paymentMethodName = aulaa.paymentMethodName ?? paymentMethod;
    const paymentMethodType = aulaa.paymentMethodType ?? null;
    const currency = String(p.currency || 'IDR');
    const countryCode = String(p.country_code || 'ID');
    const expiresAt = (p.expires_at ?? p.expired_at ?? null) as string | null;
    const paidAt = (p.paid_at ?? null) as string | null;
    const createdAt = (p.created_at ?? null) as string | null;

    const mappedBookingState = mapAulaaStatusToBookingState(txStatus);

    await supabase.from('aulaa_transactions').upsert(
      {
        id: txId,
        order_id: String(p.order_id || booking.bookingReference),
        status: txStatus,
        payment_method: paymentMethod,
        payment_method_name: paymentMethodName,
        payment_method_type: paymentMethodType,
        amount,
        fee_amount: feeAmount,
        total_amount: totalAmount,
        payment_link: paymentLink,
        payment_number: paymentNumber,
        currency,
        country_code: countryCode,
        redirect_url: aulaa.redirectUrl ?? null,
        expires_at: expiresAt,
        paid_at: paidAt,
        aulaa_created_at: createdAt,
        raw_response: upstreamJson
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
        transaction: {
          id: txId,
          orderId: String(p.order_id || booking.bookingReference),
          status: txStatus,
          paymentMethod,
          paymentMethodName,
          paymentMethodType,
          amount,
          feeAmount,
          totalAmount,
          paymentLink,
          paymentNumber,
          currency,
          countryCode,
          expiresAt,
          paidAt,
          createdAt
        }
      },
      201
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal membuat transaksi Aulaa.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
