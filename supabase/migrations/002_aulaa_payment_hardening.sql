-- Aulaa hardening: trusted package pricing, guest access tokens, and atomic payment events.
create extension if not exists pgcrypto;

create table if not exists public.travel_package_pricing (
  package_id text primary key,
  package_name text not null,
  destination text not null,
  duration text not null,
  package_image text not null,
  meeting_point text not null,
  departure_location text not null,
  base_price integer not null check (base_price > 0),
  discount_price integer check (discount_price is null or discount_price > 0),
  child_multiplier numeric(6,4) not null check (child_multiplier >= 0 and child_multiplier <= 1),
  infant_multiplier numeric(6,4) not null check (infant_multiplier >= 0 and infant_multiplier <= 1),
  min_travelers integer not null,
  max_travelers integer not null,
  options jsonb not null,
  departure_dates date[] not null,
  active boolean not null default true
);

insert into public.travel_package_pricing
(package_id, package_name, destination, duration, package_image, meeting_point, departure_location, base_price, discount_price, child_multiplier, infant_multiplier, min_travelers, max_travelers, options, departure_dates)
values
('pkg-bali-ubud-4d3n','Bali Ubud & Nusa Penida Signature Escape','Bali & Nusa Penida','4 Hari 3 Malam','https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80','Pintu Kedatangan Bandara Internasional Ngurah Rai (DPS) / Hotel Bali Selatan','Denpasar, Bali',5450000,4690000,0.75,0.15,2,12,'[{"id":"opt-4star","name":"Paket Butik Bintang 4 Signature","priceDelta":0},{"id":"opt-5star-villa","name":"Upgrade Vila Kolam Renang Privat","priceDelta":2450000}]','{2026-11-20,2026-11-27,2026-12-04,2026-12-18,2027-01-08}'),
('pkg-komodo-phinisi-3d2n','Pelayaran Phinisi Komodo & Pulau Padar','Labuan Bajo & Komodo','3 Hari 2 Malam','https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=1000&q=80','Bandara Komodo (LBJ) atau Dermaga Pelabuhan Labuan Bajo','Labuan Bajo, Flores',6200000,5590000,0.80,0.10,1,10,'[{"id":"opt-deluxe-cabin","name":"Kabin Ensuite Dek Bawah","priceDelta":0},{"id":"opt-master-ocean","name":"Master Suite Ocean-View Dek Atas","priceDelta":1650000}]','{2026-11-21,2026-11-28,2026-12-05,2026-12-19,2027-01-15}'),
('pkg-japan-golden-7d6n','Rute Emas Jepang: Tokyo, Gunung Fuji & Kyoto','Tokyo & Kyoto','7 Hari 6 Malam','https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80','Aula Kedatangan Terminal 1 Bandara Internasional Narita (NRT)','Tokyo (NRT) / Kepulangan Osaka (KIX)',21800000,19950000,0.85,0.20,2,16,'[{"id":"opt-standard-japan","name":"Hotel Kota Bintang 4 Standar","priceDelta":0},{"id":"opt-premium-japan","name":"Hotel Deluxe Pusat Kota Premier","priceDelta":3800000}]','{2026-12-02,2026-12-16,2027-01-20,2027-03-24}'),
('pkg-bromo-sewu-3d2n','Ekspedisi Privat Sunrise Bromo & Tumpak Sewu','Bromo & Tumpak Sewu','3 Hari 2 Malam','https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1000&q=80','Bandara Internasional Juanda (SUB) / Stasiun Surabaya Gubeng','Surabaya / Malang, Jawa Timur',3350000,2890000,0.85,0.10,2,8,'[{"id":"opt-private-standard","name":"Ekspedisi Privat (Penginapan Nyaman)","priceDelta":0},{"id":"opt-private-jiwajawa","name":"Ekspedisi Privat (Resor Jiwa Jawa)","priceDelta":1150000}]','{2026-11-20,2026-11-27,2026-12-11,2026-12-25,2027-01-09}'),
('pkg-swiss-alpine-6d5n','Kereta Panorama Alpen Swiss: Zurich, Lucerne & Jungfrau','Pegunungan Alpen Swiss & Lucerne','6 Hari 5 Malam','https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1000&q=80','Stasiun Kereta Bandara Zurich (ZRH)','Zurich, Swiss',34500000,null,0.70,0.15,2,10,'[{"id":"opt-swiss-2nd","name":"Kereta Swiss Kelas 2 + Hotel Bintang 4","priceDelta":0},{"id":"opt-swiss-1st","name":"Upgrade Kereta Panorama Kelas 1","priceDelta":4900000}]','{2026-12-10,2027-01-14,2027-02-18,2027-05-12}'),
('pkg-bali-group-corporate-3d2n','Tur Grup Eksplorasi Budaya & Pesisir Bali','Bali & Nusa Penida','3 Hari 2 Malam','https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1000&q=80','Bandara Internasional Ngurah Rai (DPS)','Kuta / Nusa Dua, Bali',2950000,2490000,0.75,0.10,1,25,'[{"id":"opt-group-twin","name":"Kamar Berbagi Twin / Triple","priceDelta":0},{"id":"opt-group-single","name":"Kamar Single (1 Orang / Kamar)","priceDelta":850000}]','{2026-11-22,2026-11-29,2026-12-06,2026-12-20}')
on conflict (package_id) do update set
 package_name=excluded.package_name, destination=excluded.destination, duration=excluded.duration,
 package_image=excluded.package_image, meeting_point=excluded.meeting_point, departure_location=excluded.departure_location, base_price=excluded.base_price, discount_price=excluded.discount_price,
 child_multiplier=excluded.child_multiplier, infant_multiplier=excluded.infant_multiplier,
 min_travelers=excluded.min_travelers, max_travelers=excluded.max_travelers,
 options=excluded.options, departure_dates=excluded.departure_dates, active=true;

alter table public.bookings add column if not exists access_token_hash text;
alter table public.bookings add column if not exists payment_create_state text not null default 'not_started';
alter table public.bookings add column if not exists idempotency_key text;
create unique index if not exists bookings_idempotency_key_uidx on public.bookings(idempotency_key) where idempotency_key is not null;

alter table public.aulaa_transactions drop constraint if exists aulaa_transactions_status_check;
alter table public.aulaa_transactions add constraint aulaa_transactions_status_check
  check (status in ('pending','paid','expired','cancelled','failed','refunded'));
alter table public.aulaa_transactions add column if not exists charged_amount integer;
alter table public.aulaa_transactions add column if not exists refunded_at timestamptz;

alter table public.aulaa_webhook_events add column if not exists event_fingerprint text;
alter table public.aulaa_webhook_events add column if not exists processed_at timestamptz;
alter table public.aulaa_webhook_events add column if not exists processing_error text;
create unique index if not exists aulaa_webhook_event_fingerprint_uidx
  on public.aulaa_webhook_events(event_fingerprint);

alter table public.travel_package_pricing enable row level security;
revoke all on public.travel_package_pricing from anon, authenticated;
grant select on public.travel_package_pricing to service_role;

create or replace function public.create_guest_booking(p_booking jsonb, p_access_token_hash text, p_idempotency_key text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_pkg public.travel_package_pricing%rowtype;
  v_opt jsonb;
  v_ref text;
  v_adults int;
  v_children int;
  v_infants int;
  v_total_people int;
  v_option_delta int;
  v_base_unit int;
  v_effective_unit int;
  v_base_subtotal int;
  v_adults_total int;
  v_children_total int;
  v_infants_total int;
  v_discount_total int;
  v_subtotal int;
  v_promo text;
  v_promo_discount int := 0;
  v_service_fee int;
  v_total int;
  v_promo_min int;
  v_promo_amount int;
  v_guest jsonb;
  v_travelers jsonb;
  v_departure date;
begin
  if p_access_token_hash is null or length(p_access_token_hash) <> 64 then
    raise exception using errcode='22023', message='invalid_access_token_hash';
  end if;
  v_ref := upper(trim(p_booking->>'bookingReference'));
  if v_ref is null or v_ref !~ '^[A-Z0-9-]{8,40}$' then
    raise exception using errcode='22023', message='invalid_booking_reference';
  end if;
  if p_idempotency_key is null or length(p_idempotency_key) < 16 or length(p_idempotency_key) > 128 then
    raise exception using errcode='22023', message='invalid_idempotency_key';
  end if;
  select * into v_pkg from public.travel_package_pricing
    where package_id = p_booking->>'packageId' and active = true;
  if not found then raise exception using errcode='22023', message='invalid_package'; end if;

  v_adults := coalesce((p_booking->>'adults')::int,0);
  v_children := coalesce((p_booking->>'children')::int,0);
  v_infants := coalesce((p_booking->>'infants')::int,0);
  v_total_people := v_adults + v_children + v_infants;
  if v_adults < 1 or v_children < 0 or v_infants < 0
    or v_total_people < v_pkg.min_travelers or v_total_people > v_pkg.max_travelers then
    raise exception using errcode='22023', message='invalid_traveler_count';
  end if;
  v_departure := (p_booking->>'departureDate')::date;
  if not (v_departure = any(v_pkg.departure_dates)) then
    raise exception using errcode='22023', message='invalid_departure_date';
  end if;
  v_guest := p_booking->'guest';
  v_travelers := p_booking->'travelers';
  if jsonb_typeof(v_guest) <> 'object' or length(trim(coalesce(v_guest->>'fullName',''))) < 2
    or length(trim(coalesce(v_guest->>'email',''))) < 5
    or position('@' in coalesce(v_guest->>'email','')) < 2
    or length(regexp_replace(coalesce(v_guest->>'phone',''), '[^0-9]', '', 'g')) < 8 then
    raise exception using errcode='22023', message='invalid_guest';
  end if;
  if jsonb_typeof(v_travelers) <> 'array' or jsonb_array_length(v_travelers) <> v_total_people then
    raise exception using errcode='22023', message='invalid_travelers';
  end if;
  if (select count(*) from jsonb_array_elements(v_travelers) as t(value) where t.value->>'type'='Adult') <> v_adults
    or (select count(*) from jsonb_array_elements(v_travelers) as t(value) where t.value->>'type'='Child') <> v_children
    or (select count(*) from jsonb_array_elements(v_travelers) as t(value) where t.value->>'type'='Infant') <> v_infants then
    raise exception using errcode='22023', message='traveler_type_count_mismatch';
  end if;
  if coalesce(p_booking->>'paymentMethodId','') not in ('aulaa_all','aulaa_direct','bank_transfer_verified','office_settlement') then
    raise exception using errcode='22023', message='invalid_payment_method';
  end if;
  if exists(select 1 from jsonb_array_elements(v_travelers) as t(value) where length(trim(coalesce(t.value->>'fullName',''))) < 2) then
    raise exception using errcode='22023', message='traveler_name_required';
  end if;

  select value into v_opt from jsonb_array_elements(v_pkg.options)
    where value->>'id' = p_booking->>'optionId';
  if v_opt is null then raise exception using errcode='22023', message='invalid_package_option'; end if;
  v_option_delta := (v_opt->>'priceDelta')::int;
  v_base_unit := v_pkg.base_price + v_option_delta;
  v_effective_unit := coalesce(v_pkg.discount_price,v_pkg.base_price) + v_option_delta;
  v_base_subtotal := v_adults*v_base_unit
    + v_children*round(v_base_unit*v_pkg.child_multiplier)::int
    + v_infants*round(v_base_unit*v_pkg.infant_multiplier)::int;
  v_adults_total := v_adults*v_effective_unit;
  v_children_total := v_children*round(v_effective_unit*v_pkg.child_multiplier)::int;
  v_infants_total := v_infants*round(v_effective_unit*v_pkg.infant_multiplier)::int;
  v_subtotal := v_adults_total+v_children_total+v_infants_total;
  v_discount_total := greatest(0,v_base_subtotal-v_subtotal);
  v_promo := upper(trim(coalesce(p_booking->>'promoCodeApplied','')));
  if v_promo='ASRIVA250' then v_promo_amount:=250000; v_promo_min:=3000000;
  elsif v_promo='BEYOND500' then v_promo_amount:=500000; v_promo_min:=8000000;
  else v_promo_amount:=0; v_promo_min:=0; v_promo:=null; end if;
  if v_promo is not null and v_subtotal >= v_promo_min then v_promo_discount:=v_promo_amount;
  else v_promo:=null; end if;
  v_service_fee := case when v_subtotal > 0 then 50000 else 0 end;
  v_total := greatest(0,v_subtotal-v_promo_discount+v_service_fee);

  if exists(select 1 from public.bookings where booking_reference=v_ref or idempotency_key=p_idempotency_key) then
    raise exception using errcode='23505', message='booking_already_exists';
  end if;

  insert into public.bookings (
    booking_reference, package_id, package_name, option_name, destination, duration, package_image,
    guest, travelers, departure_date, meeting_point, departure_location, adults, children, infants,
    subtotal, discount_total, promo_discount, promo_code_applied, service_fee, total_amount,
    special_request, payment_method_id, payment_method_name, trip_category, booking_status, payment_status,
    access_token_hash, payment_create_state, idempotency_key
  ) values (
    v_ref, v_pkg.package_id, v_pkg.package_name, v_opt->>'name', v_pkg.destination, v_pkg.duration, v_pkg.package_image,
    v_guest, v_travelers, v_departure::text, v_pkg.meeting_point, v_pkg.departure_location,
    v_adults,v_children,v_infants,v_subtotal,v_discount_total,v_promo_discount,v_promo,v_service_fee,v_total,
    nullif(p_booking->>'specialRequest',''), p_booking->>'paymentMethodId',
    coalesce(p_booking->>'paymentMethodName','Aulaa'), 'upcoming',
    case p_booking->>'paymentMethodId'
      when 'office_settlement' then 'Terkonfirmasi - Slot Ditahan'
      when 'bank_transfer_verified' then 'Menunggu Verifikasi Pembayaran'
      else 'Menunggu Pembayaran (Aulaa)' end,
    'Belum Dibayar - Menunggu Pembayaran',p_access_token_hash,'created',p_idempotency_key
  );
  return jsonb_build_object(
    'bookingReference',v_ref,'packageName',v_pkg.package_name,'destination',v_pkg.destination,
    'duration',v_pkg.duration,'packageImage',v_pkg.package_image,'optionName',v_opt->>'name',
    'subtotal',v_subtotal,'discountTotal',v_discount_total,'promoDiscount',v_promo_discount,
    'promoCodeApplied',v_promo,'serviceFee',v_service_fee,'totalAmount',v_total
  );
end;
$$;

create or replace function public.persist_aulaa_payment(p_order_id text, p_payment jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_booking public.bookings%rowtype;
begin
  select * into v_booking from public.bookings where booking_reference=p_order_id for update;
  if not found then raise exception using errcode='P0002', message='booking_not_found'; end if;
  if (p_payment->>'order_id') is distinct from p_order_id
    or (p_payment->>'amount')::int is distinct from v_booking.total_amount
    or coalesce(p_payment->>'currency','IDR') <> 'IDR'
    or coalesce(p_payment->>'country_code','ID') <> 'ID' then
    raise exception using errcode='22023', message='aulaa_payment_mismatch';
  end if;
  insert into public.aulaa_transactions (
    id,order_id,status,payment_method,payment_method_name,payment_method_type,
    amount,fee_amount,total_amount,charged_amount,payment_link,payment_number,currency,country_code,
    redirect_url,expires_at,paid_at,aulaa_created_at,raw_response
  ) values (
    (p_payment->>'id')::uuid,p_order_id,coalesce(p_payment->>'status','pending'),
    p_payment->>'payment_method',p_payment->>'payment_method_name',p_payment->>'payment_method_type',
    (p_payment->>'amount')::int,coalesce((p_payment->>'fee_amount')::int,0),
    coalesce((p_payment->>'charged_amount')::int,(p_payment->>'amount')::int),
    coalesce((p_payment->>'charged_amount')::int,(p_payment->>'amount')::int),
    p_payment->>'payment_link',p_payment->>'payment_number',coalesce(p_payment->>'currency','IDR'),
    coalesce(p_payment->>'country_code','ID'),p_payment->>'redirect_url',
    nullif(p_payment->>'expired_at','')::timestamptz,nullif(p_payment->>'paid_at','')::timestamptz,
    nullif(p_payment->>'created_at','')::timestamptz,p_payment
  )
  on conflict(order_id) do update set
    id=excluded.id,status=excluded.status,payment_method=excluded.payment_method,
    payment_method_name=excluded.payment_method_name,payment_method_type=excluded.payment_method_type,
    amount=excluded.amount,fee_amount=excluded.fee_amount,total_amount=excluded.total_amount,
    charged_amount=excluded.charged_amount,payment_link=excluded.payment_link,
    payment_number=excluded.payment_number,currency=excluded.currency,country_code=excluded.country_code,
    expires_at=excluded.expires_at,paid_at=excluded.paid_at,raw_response=excluded.raw_response;
  update public.bookings set payment_create_state='created',
    trip_category=case when p_payment->>'status'='paid' then 'upcoming' when p_payment->>'status' in ('expired','cancelled','refunded') then 'cancelled' else trip_category end,
    booking_status=case p_payment->>'status'
      when 'paid' then 'Terkonfirmasi - Lunas'
      when 'expired' then 'Kadaluarsa'
      when 'cancelled' then 'Dibatalkan'
      when 'refunded' then 'Dana Dikembalikan'
      else 'Menunggu Pembayaran (Aulaa)' end,
    payment_status=case p_payment->>'status'
      when 'paid' then 'Lunas (Terverifikasi)'
      when 'expired' then 'Kadaluarsa (Melewati Batas Waktu)'
      when 'cancelled' then 'Dibatalkan'
      when 'refunded' then 'Dana Dikembalikan'
      when 'failed' then 'Pembayaran Gagal'
      else 'Belum Dibayar - Menunggu Pembayaran' end
    where booking_reference=p_order_id;
end;
$$;

create or replace function public.process_aulaa_webhook(p_payload jsonb,p_event_fingerprint text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order text := p_payload->>'order_id';
  v_status text := p_payload->>'status';
  v_tx public.aulaa_transactions%rowtype;
  v_booking public.bookings%rowtype;
  v_event_id uuid;
  v_amount int := (p_payload->>'amount')::int;
  v_currency text := coalesce(p_payload->>'currency','IDR');
  v_country text := coalesce(p_payload->>'country_code','ID');
begin
  if v_order is null or v_status is null or p_event_fingerprint is null or v_status not in ('pending','paid','expired','cancelled','failed','refunded') then
    raise exception using errcode='22023',message='invalid_webhook_payload';
  end if;
  insert into public.aulaa_webhook_events(order_id,status,payment_method,amount,payload,event_fingerprint)
  values(v_order,v_status,p_payload->>'payment_method',v_amount,p_payload,p_event_fingerprint)
  on conflict(event_fingerprint) do nothing returning id into v_event_id;
  if v_event_id is null then return jsonb_build_object('duplicate',true); end if;

  select * into v_tx from public.aulaa_transactions where order_id=v_order for update;
  select * into v_booking from public.bookings where booking_reference=v_order for update;
  if not found or v_tx.id is null then raise exception using errcode='P0002',message='transaction_not_found'; end if;
  if (p_payload->>'id') is not null and (p_payload->>'id')::uuid <> v_tx.id then
    raise exception using errcode='22023',message='payment_id_mismatch';
  end if;
  if v_amount <> v_tx.amount or v_currency <> v_tx.currency or v_country <> v_tx.country_code then
    raise exception using errcode='22023',message='payment_amount_or_currency_mismatch';
  end if;
  if (v_status='pending' and v_tx.status <> 'pending')
    or (v_status='refunded' and v_tx.status <> 'paid')
    or (v_tx.status='refunded' and v_status <> 'refunded')
    or (v_tx.status='paid' and v_status not in ('paid','refunded'))
    or (v_tx.status in ('expired','cancelled','failed') and v_status not in (v_tx.status,'paid')) then
    update public.aulaa_webhook_events set processing_error='stale_or_invalid_transition',processed_at=now() where id=v_event_id;
    return jsonb_build_object('ignored',true,'reason','stale_or_invalid_transition');
  end if;

  update public.aulaa_transactions set status=v_status,
    payment_method=coalesce(p_payload->>'payment_method',payment_method),
    fee_amount=coalesce(nullif(p_payload->>'fee_amount','')::int,fee_amount),
    charged_amount=coalesce(nullif(p_payload->>'charged_amount','')::int,charged_amount),
    total_amount=coalesce(nullif(p_payload->>'charged_amount','')::int,total_amount),
    paid_at=case when v_status='paid' then coalesce(nullif(p_payload->>'paid_at','')::timestamptz,paid_at,now()) else paid_at end,
    refunded_at=case when v_status='refunded' then now() else refunded_at end
    where order_id=v_order;
  update public.bookings set
    trip_category=case when v_status in ('expired','cancelled','refunded') then 'cancelled' else 'upcoming' end,
    booking_status=case v_status
      when 'paid' then 'Terkonfirmasi - Lunas'
      when 'expired' then 'Kadaluarsa'
      when 'cancelled' then 'Dibatalkan'
      when 'refunded' then 'Dana Dikembalikan'
      when 'failed' then 'Pembayaran Gagal'
      else 'Menunggu Pembayaran (Aulaa)' end,
    payment_status=case v_status
      when 'paid' then 'Lunas (Terverifikasi)'
      when 'expired' then 'Kadaluarsa (Melewati Batas Waktu)'
      when 'cancelled' then 'Dibatalkan'
      when 'refunded' then 'Dana Dikembalikan'
      when 'failed' then 'Pembayaran Gagal'
      else 'Belum Dibayar - Menunggu Pembayaran' end
    where booking_reference=v_order;
  update public.aulaa_webhook_events set processed_at=now(),processing_error=null where id=v_event_id;
  return jsonb_build_object('processed',true,'status',v_status);
end;
$$;

revoke all on function public.create_guest_booking(jsonb,text,text) from public,anon,authenticated;
revoke all on function public.persist_aulaa_payment(text,jsonb) from public,anon,authenticated;
revoke all on function public.process_aulaa_webhook(jsonb,text) from public,anon,authenticated;
grant execute on function public.create_guest_booking(jsonb,text,text) to service_role;
grant execute on function public.persist_aulaa_payment(text,jsonb) to service_role;
grant execute on function public.process_aulaa_webhook(jsonb,text) to service_role;
