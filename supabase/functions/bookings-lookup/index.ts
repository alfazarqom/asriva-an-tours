import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
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

function normalizePhone(value: string): string {
  return value.replace(/[\s\-()+]/g, '');
}

function mapRowToBooking(row: Record<string, unknown>, txRow?: Record<string, unknown> | null) {
  return {
    bookingReference: row.booking_reference,
    createdAt: row.created_at,
    packageId: row.package_id,
    packageName: row.package_name,
    optionName: row.option_name,
    destination: row.destination,
    duration: row.duration,
    packageImage: row.package_image,
    guest: row.guest,
    travelers: row.travelers,
    departureDate: row.departure_date,
    meetingPoint: row.meeting_point,
    departureLocation: row.departure_location,
    adults: row.adults,
    children: row.children,
    infants: row.infants,
    subtotal: row.subtotal,
    discountTotal: row.discount_total,
    promoDiscount: row.promo_discount,
    promoCodeApplied: row.promo_code_applied ?? undefined,
    serviceFee: row.service_fee,
    totalAmount: row.total_amount,
    specialRequest: row.special_request ?? undefined,
    paymentMethodId: row.payment_method_id,
    paymentMethodName: row.payment_method_name,
    tripCategory: row.trip_category,
    bookingStatus: row.booking_status,
    paymentStatus: row.payment_status,
    review: row.review ?? undefined,
    paywuzTransaction: txRow
      ? {
          id: txRow.id,
          orderId: txRow.order_id,
          status: txRow.status,
          method: {
            type: txRow.method_type ?? null,
            code: txRow.method_code ?? null,
            name: txRow.method_name ?? null
          },
          amount: txRow.amount,
          fee: {
            amount: txRow.fee_amount,
            paidBy: txRow.fee_paid_by
          },
          totalPayment: txRow.total_payment,
          netAmount: txRow.net_amount,
          payment: {
            url: txRow.payment_url,
            vaNumber: txRow.va_number ?? null,
            qrString: txRow.qr_string ?? null,
            retailCode: txRow.retail_code ?? null
          },
          customer: txRow.customer ?? null,
          metadata: txRow.metadata ?? null,
          expiresAt: txRow.expires_at ?? null,
          paidAt: txRow.paid_at ?? null,
          createdAt: txRow.paywuz_created_at ?? null
        }
      : undefined
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
    const body = await req.json();
    const action = body.action as 'lookup' | 'save_review';
    const supabase = getSupabaseAdmin();

    if (action === 'save_review') {
      const bookingReference = String(body.bookingReference || '').trim();
      const review = body.review;
      if (!bookingReference || !review) {
        return jsonResponse(
          { error: { code: 'invalid_request', message: 'bookingReference dan review wajib diisi.' } },
          400
        );
      }

      const { error } = await supabase
        .from('bookings')
        .update({ review })
        .eq('booking_reference', bookingReference);

      if (error) {
        return jsonResponse({ error: { code: 'database_error', message: error.message } }, 400);
      }
      return jsonResponse({ saved: true }, 200);
    }

    const bookingReference = String(body.bookingReference || '').trim().toUpperCase();
    const contact = String(body.contact || '').trim().toLowerCase();

    if (!bookingReference || !contact) {
      return jsonResponse(
        { error: { code: 'invalid_request', message: 'Kode Booking dan Email/Telepon wajib diisi.' } },
        400
      );
    }

    const { data: bookingRow, error } = await supabase
      .from('bookings')
      .select('*')
      .ilike('booking_reference', bookingReference)
      .maybeSingle();

    if (error || !bookingRow) {
      return jsonResponse({ error: { code: 'not_found', message: 'Data pemesanan tidak ditemukan.' } }, 404);
    }

    const guest = (bookingRow.guest || {}) as { email?: string; phone?: string };
    const emailMatch = (guest.email || '').toLowerCase() === contact;
    const phoneInputClean = normalizePhone(contact);
    const phoneMatch = phoneInputClean.length >= 6 && normalizePhone(guest.phone || '') === phoneInputClean;

    if (!emailMatch && !phoneMatch) {
      return jsonResponse(
        { error: { code: 'not_found', message: 'Email atau nomor telepon tidak cocok dengan Kode Booking.' } },
        404
      );
    }

    const { data: txRow } = await supabase
      .from('paywuz_transactions')
      .select('*')
      .eq('order_id', bookingRow.booking_reference)
      .maybeSingle();

    return jsonResponse({ booking: mapRowToBooking(bookingRow, txRow) }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal mengakses data pemesanan.';
    return jsonResponse({ error: { code: 'internal_error', message } }, 500);
  }
});
