import React from 'react';
import { Mail, MessageCircle, Phone, Plane } from 'lucide-react';
import { StandaloneHeader } from '../../components/ui/StandaloneHeader';
import { InfoPageKey } from '../../types/travel';

export interface InfoPageProps {
  page: InfoPageKey;
  onBack: () => void;
}

const INFO_TITLES: Record<InfoPageKey, string> = {
  about: 'Tentang ASRIVA Travel & Tours',
  contact: 'Hubungi Kami',
  help: 'Pusat Bantuan & FAQ',
  terms: 'Syarat & Ketentuan',
  privacy: 'Kebijakan Privasi'
};

export const InfoPage: React.FC<InfoPageProps> = ({ page, onBack }) => (
  <div className="app-shell">
    <StandaloneHeader title={INFO_TITLES[page]} onBack={onBack} />
    <div className="app-content p-4 space-y-4 pb-8 text-xs text-slate-600 leading-relaxed">
      {page === 'about' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B2545] text-white flex items-center justify-center">
            <Plane className="w-6 h-6" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">ASRIVA TRAVEL & TOURS</h2>
          <p className="font-semibold text-[#136F99]">Discover More. Travel Beyond.</p>
          <p>
            ASRIVA Travel & Tours adalah platform pemesanan perjalanan digital modern yang dikurasi untuk menghadirkan
            pengalaman wisata domestik dan internasional terbaik—mulai dari liburan pulau privat, ekspedisi Phinisi,
            hingga perjalanan kereta panorama dunia.
          </p>
        </div>
      )}

      {page === 'contact' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <h2 className="text-base font-extrabold text-slate-900">Konsultasi & Dukungan Perjalanan</h2>
          <p>Hubungi tim layanan pelanggan kami untuk pertanyaan paket, penawaran grup, atau verifikasi pemesanan.</p>
          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#136F99]" />
              <div>
                <div className="font-bold text-slate-900">Layanan Telepon</div>
                <div>+62 21 5098 4410 (Sen–Sab, 08:30–18:00 WIB)</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-[#136F99]" />
              <div>
                <div className="font-bold text-slate-900">WhatsApp Concierge</div>
                <div>+62 811 9088 2210</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#136F99]" />
              <div>
                <div className="font-bold text-slate-900">Email Reservasi</div>
                <div>reservations@asrivatravel.co.id</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'help' && (
        <div className="space-y-3">
          {[
            {
              q: 'Apakah saya harus membuat akun untuk memesan paket wisata?',
              a: 'Tidak perlu. ASRIVA Travel & Tours mendukung penuh Guest Checkout. Anda cukup mengisi data pemesan dan peserta saat checkout.'
            },
            {
              q: 'Bagaimana cara mengecek status pemesanan saya setelah checkout?',
              a: 'Buka tab Perjalanan di navigasi bawah, lalu masukkan Kode Booking beserta Email atau Nomor Telepon yang digunakan saat pemesanan.'
            },
            {
              q: 'Kapan status pembayaran saya berubah menjadi Lunas?',
              a: 'Setelah transfer atau pelunasan di konter diverifikasi oleh tim Keuangan ASRIVA menggunakan Kode Booking Anda, status pembayaran akan diperbarui.'
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/80">
              <div className="font-bold text-slate-900 text-sm mb-1">{faq.q}</div>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>
      )}

      {page === 'terms' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <h2 className="text-sm font-bold text-slate-900">1. Reservasi Tamu & Masa Berlaku</h2>
          <p>
            Setiap pemesanan yang dikirim melalui ASRIVA Travel & Tours menghasilkan Kode Booking unik. Ketersediaan
            kursi ditahan sesuai batas waktu penyelesaian pembayaran yang tertera.
          </p>
          <h2 className="text-sm font-bold text-slate-900">2. Harga & Layanan Termasuk</h2>
          <p>
            Seluruh harga tercantum dalam mata uang Rupiah (IDR) dan mencakup layanan yang disebutkan secara eksplisit
            pada bagian Layanan Termasuk di masing-masing paket.
          </p>
        </div>
      )}

      {page === 'privacy' && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
          <h2 className="text-sm font-bold text-slate-900">1. Pengumpulan Data Guest Checkout</h2>
          <p>
            Kami mengumpulkan informasi kontak pemesan (nama, email, nomor telepon/WhatsApp) serta data peserta
            semata-mata untuk keperluan reservasi tur, check-in hotel, manifes transportasi, dan asuransi perjalanan.
          </p>
          <h2 className="text-sm font-bold text-slate-900">2. Verifikasi & Keamanan Akses</h2>
          <p>
            Pencarian pemesanan memerlukan kombinasi Kode Booking serta Email atau Nomor Telepon terdaftar guna
            melindungi privasi pelanggan.
          </p>
        </div>
      )}
    </div>
  </div>
);
