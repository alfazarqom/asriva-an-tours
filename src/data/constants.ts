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
    id: 'aulaa_all',
    name: 'Aulaa — Semua Metode (QRIS, Virtual Account, Kartu, E-Wallet)',
    type: 'aulaa_hosted',
    description:
      'Metode pembayaran utama ASRIVA. Anda akan diarahkan ke halaman checkout resmi Aulaa untuk memilih QRIS, Virtual Account, atau metode aktif lainnya.',
    statusLabel: 'Utama • Aulaa Checkout',
    available: true
  },
  {
    id: 'aulaa_direct',
    name: 'Aulaa — Pilih Channel Langsung (White-Label)',
    type: 'aulaa_direct',
    description:
      'Kunci metode pembayaran spesifik dari proyek Aulaa (seperti QRIS atau Virtual Account) untuk menampilkan QR Code / nomor pembayaran langsung di halaman konfirmasi.',
    statusLabel: 'Aulaa API • Direct Channel',
    available: true
  },
  {
    id: 'bank_transfer_verified',
    name: 'Transfer Bank (Verifikasi Manual)',
    type: 'manual_verification',
    description:
      'Kirim reservasi Anda sekarang dan selesaikan transfer dengan mencantumkan Kode Booking. Status pembayaran tetap Belum Dibayar hingga diverifikasi oleh tim Keuangan ASRIVA.',
    statusLabel: 'Verifikasi Manual',
    available: true
  },
  {
    id: 'office_settlement',
    name: 'Bayar di Kantor / Konter Resmi ASRIVA',
    type: 'pay_at_office',
    description:
      'Amankan slot reservasi Anda dan lakukan pelunasan langsung di konter layanan tur kami dengan menunjukkan Kode Booking.',
    statusLabel: 'Reservasi Slot',
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
