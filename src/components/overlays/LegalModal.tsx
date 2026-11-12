import React from 'react';
import { ModalDialog } from '../ui/ModalDialog';

export interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  onClose: () => void;
  onAcceptAndClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose, onAcceptAndClose }) => (
  <ModalDialog
    open={type !== null}
    title={type === 'terms' ? 'Syarat & Ketentuan' : 'Kebijakan Privasi'}
    onClose={onClose}
    footer={
      <button
        type="button"
        onClick={onAcceptAndClose}
        className="w-full py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold"
      >
        Setujui & Tutup
      </button>
    }
  >
    {type === 'terms' ? (
      <div className="space-y-2.5">
        <p>
          <strong>1. Kebijakan Reservasi Tamu:</strong> Pemesanan yang dikirim melalui ASRIVA Travel & Tours
          menghasilkan catatan reservasi yang diidentifikasi melalui Kode Booking unik Anda.
        </p>
        <p>
          <strong>2. Pembayaran & Verifikasi:</strong> Reservasi berstatus Belum Dibayar / Menunggu Verifikasi
          hingga pelunasan diverifikasi oleh tim Keuangan ASRIVA.
        </p>
        <p>
          <strong>3. Dokumen Peserta:</strong> Peserta bertanggung jawab memastikan identitas resmi yang sah (KTP
          atau Paspor dengan masa berlaku minimal 6 bulan untuk paket internasional).
        </p>
      </div>
    ) : (
      <div className="space-y-2.5">
        <p>
          <strong>1. Tujuan Pengumpulan Data:</strong> Data pemesan dan peserta digunakan semata-mata untuk
          memproses reservasi perjalanan, penerbitan voucher, serta koordinasi logistik tur.
        </p>
        <p>
          <strong>2. Keamanan Pencarian Pemesanan:</strong> Akses rincian pemesanan memerlukan kombinasi Kode Booking
          serta verifikasi Email atau Nomor Telepon yang sesuai.
        </p>
      </div>
    )}
  </ModalDialog>
);
