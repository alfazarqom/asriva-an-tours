import { AppNotification, PaymentChannelOption } from '../types/travel';

export const TRAVEL_CATEGORIES = [
  'Semua',
  'Tur Domestik',
  'Tur Internasional',
  'Petualangan',
  'Liburan Keluarga',
  'Honeymoon',
  'Private Trip',
  'Tur Grup'
];

export const PROMO_CODES: Record<string, { label: string; amount: number; minSpend: number }> = {
  ASRIVA250: { label: 'Promo Sambutan ASRIVA Diskon Rp 250.000', amount: 250000, minSpend: 3000000 },
  BEYOND500: { label: 'Promo Travel Beyond Diskon Rp 500.000', amount: 500000, minSpend: 8000000 }
};

export const PAYMENT_CHANNELS: PaymentChannelOption[] = [
  {
    id: 'paywuz_all',
    name: 'Paywuz — Semua Metode (VA, QRIS, Retail)',
    type: 'paywuz_v2',
    description:
      'Lanjutkan ke halaman pembayaran resmi Paywuz untuk memilih Virtual Account, QRIS, atau Gerai Retail yang tersedia.',
    statusLabel: 'Paywuz v2 • /transactions/all',
    available: true
  },
  {
    id: 'paywuz_va',
    name: 'Paywuz — Virtual Account (VA)',
    type: 'paywuz_v2',
    description:
      'Buat nomor Virtual Account melalui endpoint Paywuz v2 atau pilih bank di halaman pembayaran Paywuz.',
    statusLabel: 'Paywuz v2 • /transactions/va',
    available: true
  },
  {
    id: 'paywuz_qris',
    name: 'Paywuz — QRIS',
    type: 'paywuz_v2',
    description:
      'Bayar instan dengan QRIS. Membutuhkan nama, email, dan nomor HP Indonesia aktif (08xx / 62xx / +62).',
    statusLabel: 'Paywuz v2 • /transactions/qris',
    available: true
  },
  {
    id: 'paywuz_retail',
    name: 'Paywuz — Gerai Retail (Alfamart / Indomaret)',
    type: 'paywuz_v2',
    description:
      'Dapatkan kode pembayaran untuk dibayar di kasir Alfamart atau Indomaret.',
    statusLabel: 'Paywuz v2 • /transactions/retail',
    available: true
  },
  {
    id: 'bank_transfer_verified',
    name: 'Transfer Bank (Verifikasi Manual)',
    type: 'manual_verification',
    description:
      'Kirim reservasi Anda sekarang dan selesaikan transfer dengan mencantumkan Kode Booking. Status pembayaran tetap Belum Dibayar hingga diverifikasi oleh tim Keuangan ASRIVA.',
    statusLabel: 'Tersedia — Verifikasi Manual',
    available: true
  },
  {
    id: 'office_settlement',
    name: 'Bayar di Kantor / Konter Resmi ASRIVA',
    type: 'pay_at_office',
    description:
      'Amankan slot reservasi Anda dan lakukan pelunasan langsung di konter layanan tur kami dengan menunjukkan Kode Booking.',
    statusLabel: 'Tersedia — Reservasi Slot',
    available: true
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Kode Promo Musiman Tersedia',
    message:
      'Gunakan kode ASRIVA250 saat pemesanan untuk potongan Rp 250.000 dengan minimum transaksi Rp 3.000.000.',
    time: 'Hari ini',
    unread: true
  },
  {
    id: 'n2',
    title: 'Fitur Guest Checkout Aktif',
    message: 'Pesan paket wisata domestik maupun internasional tanpa perlu mendaftar atau login akun.',
    time: '2 hari lalu',
    unread: false
  }
];

export const HOME_TESTIMONIALS = [
  {
    name: 'Nadia Kartika',
    trip: 'Bali Ubud & Nusa Penida Escape',
    quote:
      'Pemesanan tanpa perlu buat akun sangat praktis. Driver kami di Ubud dan penyeberangan fast boat sangat tepat waktu.'
  },
  {
    name: 'Rendra Pratama',
    trip: 'Pelayaran Phinisi Komodo',
    quote:
      'Rincian biaya jelas dari awal sampai akhir. Matahari terbit di Pulau Padar melampaui semua ekspektasi kami.'
  },
  {
    name: 'Siti Rahmawati',
    trip: 'Rute Emas Jepang 7H6M',
    quote:
      'Pesan untuk keluarga berempat sangat mudah. Cek kode booking di menu Perjalanan juga cepat.'
  }
];
