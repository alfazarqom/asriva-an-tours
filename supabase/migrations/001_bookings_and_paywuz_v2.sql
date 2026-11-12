-- Skema Database Supabase untuk Pemesanan ASRIVA Travel & Integrasi Pembayaran Paywuz v2
-- Sumber API resmi: https://paywuz.id/docs/v2

create extension if not exists pgcrypto;

-- 1. Tabel utama pemesanan tamu (tanpa login)
create table if not exists public.bookings (
  booking_reference text primary key,
  package_id text not null,
  package_name text not null,
  option_name text not null,
  destination text not null,
  duration text not null,
  package_image text not null,
  guest jsonb not null,
  travelers jsonb not null,
  departure_date text not null,
  meeting_point text not null,
  departure_location text not null,
  adults integer not null check (adults >= 1),
  children integer not null default 0 check (children >= 0),
  infants integer not null default 0 check (infants >= 0),
  subtotal integer not null check (subtotal >= 0),
  discount_total integer not null default 0 check (discount_total >= 0),
  promo_discount integer not null default 0 check (promo_discount >= 0),
  promo_code_applied text,
  service_fee integer not null default 0 check (service_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  special_request text,
  payment_method_id text not null,
  payment_method_name text not null,
  trip_category text not null default 'upcoming' check (trip_category in ('upcoming', 'completed', 'cancelled')),
  booking_status text not null default 'Menunggu Verifikasi Pembayaran',
  payment_status text not null default 'Belum Dibayar - Menunggu Pembayaran',
  review jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabel transaksi Paywuz v2 (mengikuti persis struktur objek transaksi /v2/transactions/*)
create table if not exists public.paywuz_transactions (
  id uuid primary key,
  order_id text unique not null references public.bookings(booking_reference) on delete cascade,
  status text not null check (status in ('pending', 'settlement', 'success', 'failed', 'cancelled')),
  endpoint_mode text not null check (endpoint_mode in ('va', 'qris', 'retail', 'all')),
  method_type text check (method_type in ('virtual_account', 'qris', 'retail')),
  method_code text,
  method_name text,
  amount integer not null,
  fee_amount integer not null default 0,
  fee_paid_by text not null default 'customer' check (fee_paid_by in ('customer', 'merchant')),
  total_payment integer not null,
  net_amount integer not null,
  payment_url text not null,
  va_number text,
  qr_string text,
  retail_code text,
  customer jsonb,
  metadata jsonb,
  expires_at timestamptz,
  paid_at timestamptz,
  paywuz_created_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Tabel deduplikasi webhook berdasarkan header resmi X-Paywuz-Delivery
create table if not exists public.paywuz_webhook_deliveries (
  delivery_id text primary key,
  event text not null check (event in ('transaction.settlement', 'transaction.paid', 'transaction.failed', 'transaction.cancelled')),
  order_id text not null,
  payload jsonb not null,
  received_at timestamptz not null default now()
);

create index if not exists idx_bookings_created_at on public.bookings (created_at desc);
create index if not exists idx_paywuz_tx_order_id on public.paywuz_transactions (order_id);
create index if not exists idx_paywuz_tx_status on public.paywuz_transactions (status);
create index if not exists idx_paywuz_webhook_order_id on public.paywuz_webhook_deliveries (order_id);

-- Trigger otomatis updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_paywuz_transactions_updated_at on public.paywuz_transactions;
create trigger trg_paywuz_transactions_updated_at
  before update on public.paywuz_transactions
  for each row execute function public.set_updated_at();

-- Row Level Security: akses mutasi dan lookup dilakukan melalui Edge Functions (service_role)
alter table public.bookings enable row level security;
alter table public.paywuz_transactions enable row level security;
alter table public.paywuz_webhook_deliveries enable row level security;

-- Aktifkan Realtime agar status pembayaran dari webhook otomatis memperbarui UI detail pesanan
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.paywuz_transactions;
