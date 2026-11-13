import { createAdminClient, hashAccessToken, verifyBookingAccess } from '../_shared/security.ts';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
function jsonResponse(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }
function normalizePhone(value: string) { return value.replace(/[^0-9]/g, ''); }
function mapRowToBooking(row: Record<string, unknown>, tx?: Record<string, unknown> | null) {
  return {
    bookingReference: row.booking_reference, createdAt: row.created_at, packageId: row.package_id,
    packageName: row.package_name, optionName: row.option_name, destination: row.destination,
    duration: row.duration, packageImage: row.package_image, guest: row.guest, travelers: row.travelers,
    departureDate: row.departure_date, meetingPoint: row.meeting_point, departureLocation: row.departure_location,
    adults: row.adults, children: row.children, infants: row.infants, subtotal: row.subtotal,
    discountTotal: row.discount_total, promoDiscount: row.promo_discount,
    promoCodeApplied: row.promo_code_applied ?? undefined, serviceFee: row.service_fee,
    totalAmount: row.total_amount, specialRequest: row.special_request ?? undefined,
    paymentMethodId: row.payment_method_id, paymentMethodName: row.payment_method_name,
    tripCategory: row.trip_category, bookingStatus: row.booking_status, paymentStatus: row.payment_status,
    review: row.review ?? undefined,
    aulaaTransaction: tx ? {
      id: tx.id, orderId: tx.order_id, status: tx.status, paymentMethod: tx.payment_method ?? null,
      paymentMethodName: tx.payment_method_name ?? null, paymentMethodType: tx.payment_method_type ?? null,
      amount: tx.amount, feeAmount: tx.fee_amount ?? 0, totalAmount: tx.charged_amount ?? tx.total_amount ?? tx.amount,
      paymentLink: tx.payment_link, paymentNumber: tx.payment_number ?? null, currency: tx.currency ?? 'IDR',
      countryCode: tx.country_code ?? 'ID', expiresAt: tx.expires_at ?? null, paidAt: tx.paid_at ?? null,
      createdAt: tx.aulaa_created_at ?? null
    } : undefined
  };
}
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: { code: 'method_not_allowed' } }, 405);
  try {
    const body = await req.json();
    const action = body.action as string;
    const bookingReference = typeof body.bookingReference === 'string' ? body.bookingReference.trim().toUpperCase() : '';
    const accessToken = typeof body.accessToken === 'string' ? body.accessToken : '';
    if (!bookingReference || !accessToken) return jsonResponse({ error: { code: 'invalid_request', message: 'Kode Booking dan token akses wajib diisi.' } }, 400);
    const supabase = createAdminClient();
    if (!(await verifyBookingAccess(supabase, bookingReference, accessToken))) return jsonResponse({ error: { code: 'not_found', message: 'Booking tidak ditemukan atau token akses tidak valid.' } }, 404);

    if (action === 'save_review') {
      const review = body.review as Record<string, unknown> | undefined;
      const rating = Number(review?.rating);
      const comment = typeof review?.comment === 'string' ? review.comment.trim() : '';
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment || comment.length > 2000) {
        return jsonResponse({ error: { code: 'invalid_review', message: 'Rating 1–5 dan komentar maksimal 2.000 karakter wajib diisi.' } }, 400);
      }
      const { data: booking, error: readError } = await supabase.from('bookings').select('guest,trip_category').eq('booking_reference', bookingReference).maybeSingle();
      if (readError || !booking) return jsonResponse({ error: { code: 'not_found' } }, 404);
      if (booking.trip_category !== 'completed') return jsonResponse({ error: { code: 'review_not_allowed', message: 'Ulasan hanya dapat dikirim setelah perjalanan selesai.' } }, 409);
      const guest = booking.guest as { fullName?: string };
      const { error } = await supabase.from('bookings').update({ review: {
        rating, comment, author: guest.fullName || 'Pelanggan', submittedAt: new Date().toISOString()
      }}).eq('booking_reference', bookingReference).eq('access_token_hash', await hashAccessToken(accessToken));
      if (error) return jsonResponse({ error: { code: 'database_error' } }, 500);
      return jsonResponse({ saved: true });
    }

    if (action !== 'lookup') return jsonResponse({ error: { code: 'invalid_action' } }, 400);
    const contact = typeof body.contact === 'string' ? body.contact.trim() : '';
    const { data: booking, error } = await supabase.from('bookings').select('*').eq('booking_reference', bookingReference).maybeSingle();
    if (error || !booking) return jsonResponse({ error: { code: 'not_found' } }, 404);
    const guest = (booking.guest || {}) as { email?: string; phone?: string };
    const contactLower = contact.toLowerCase();
    const emailMatch = Boolean(contact) && (guest.email || '').toLowerCase() === contactLower;
    const phone = normalizePhone(contact);
    const phoneMatch = phone.length >= 8 && normalizePhone(guest.phone || '') === phone;
    if (!emailMatch && !phoneMatch) return jsonResponse({ error: { code: 'not_found', message: 'Email atau telepon tidak cocok.' } }, 404);

    const { data: tx, error: txError } = await supabase.from('aulaa_transactions').select('*').eq('order_id', bookingReference).maybeSingle();
    if (txError) return jsonResponse({ error: { code: 'database_error' } }, 500);
    return jsonResponse({ booking: mapRowToBooking(booking, tx) });
  } catch {
    return jsonResponse({ error: { code: 'internal_error', message: 'Permintaan booking tidak dapat diproses.' } }, 500);
  }
});
