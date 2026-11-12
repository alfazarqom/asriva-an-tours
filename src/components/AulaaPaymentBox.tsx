import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  Wallet,
  XCircle
} from 'lucide-react';
import { AulaaTransaction, ToastMessage } from '../types/travel';
import { formatIDR } from '../utils/formatters';
import { Badge } from './ui/Badge';

export interface AulaaPaymentBoxProps {
  transaction: AulaaTransaction;
  isCheckingStatus: boolean;
  isCancelling: boolean;
  onRefreshStatus: () => void;
  onCancelTransaction: () => void;
  onShowToast: (message: string, type?: ToastMessage['type']) => void;
}

const STATUS_DISPLAY: Record<
  AulaaTransaction['status'],
  { label: string; variant: 'warning' | 'ocean' | 'success' | 'error' | 'neutral' }
> = {
  pending: { label: 'Menunggu Pembayaran (pending)', variant: 'warning' },
  paid: { label: 'Berhasil / Lunas (paid)', variant: 'success' },
  expired: { label: 'Kadaluarsa (expired)', variant: 'error' },
  failed: { label: 'Gagal (failed)', variant: 'error' },
  cancelled: { label: 'Dibatalkan (cancelled)', variant: 'neutral' }
};

function isQrPayment(tx: AulaaTransaction): boolean {
  if (!tx.paymentNumber) return false;
  if (tx.paymentMethod === 'qris' || tx.paymentMethodType === 'qr_code') return true;
  return tx.paymentNumber.startsWith('000201');
}

export const AulaaPaymentBox: React.FC<AulaaPaymentBoxProps> = ({
  transaction,
  isCheckingStatus,
  isCancelling,
  onRefreshStatus,
  onCancelTransaction,
  onShowToast
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const showQrCode = isQrPayment(transaction);
  const qrPayload = showQrCode ? transaction.paymentNumber : null;

  useEffect(() => {
    let active = true;
    if (!qrPayload) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0B2545',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [qrPayload]);

  const statusMeta = STATUS_DISPLAY[transaction.status] || STATUS_DISPLAY.pending;
  const canCancel = transaction.status === 'pending';

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#136F99]/30 shadow-xs space-y-3.5 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#136F99]">
            Pembayaran Aulaa
          </div>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            {transaction.paymentMethodName ||
              transaction.paymentMethod ||
              'Pilih Metode di Halaman Checkout Aulaa'}
          </h3>
        </div>
        <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
      </div>

      {/* QRIS QR Code (ketika payment_method dikunci ke QRIS & payment_number tersedia) */}
      {showQrCode && transaction.paymentNumber && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0B2545]">
            <QrCode className="w-3.5 h-3.5 text-[#136F99]" />
            <span>Pindai QRIS untuk Membayar</span>
          </div>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QRIS ${transaction.orderId}`}
              className="w-48 h-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xs"
            />
          ) : (
            <div className="w-48 h-48 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          )}
          <div className="text-[10px] text-slate-500">
            Scan menggunakan aplikasi e-wallet atau mobile banking berlogo QRIS.
          </div>
        </div>
      )}

      {/* Non-QR Payment Number (Virtual Account / Kode Pembayaran) */}
      {!showQrCode && transaction.paymentNumber && (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
              <Wallet className="w-3 h-3 text-[#136F99]" />
              <span>
                Nomor Pembayaran{' '}
                {transaction.paymentMethod ? `(${transaction.paymentMethod.toUpperCase()})` : ''}
              </span>
            </div>
            <div className="text-base font-extrabold tracking-wider text-[#0B2545] mt-0.5 break-all select-text">
              {transaction.paymentNumber}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(transaction.paymentNumber!);
              onShowToast('Nomor pembayaran berhasil disalin!', 'success');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1 shrink-0 active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            Salin
          </button>
        </div>
      )}

      {/* Aulaa Amount & Fee Breakdown */}
      <div className="rounded-xl bg-slate-50 p-3 space-y-1.5 border border-slate-100">
        <div className="flex justify-between text-slate-600">
          <span>Nominal Tagihan (amount)</span>
          <span className="font-semibold text-slate-900">{formatIDR(transaction.amount)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Biaya Transaksi (fee_amount)</span>
          <span className="font-semibold text-slate-900">{formatIDR(transaction.feeAmount)}</span>
        </div>
        <div className="flex justify-between pt-1.5 border-t border-slate-200/70">
          <span className="font-bold text-slate-900">Total Dibayar (total_amount)</span>
          <span className="font-extrabold text-[#0B2545]">{formatIDR(transaction.totalAmount)}</span>
        </div>
      </div>

      {/* Expiry / Paid Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        {transaction.paidAt ? (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dibayar pada {new Date(transaction.paidAt).toLocaleString('id-ID')}
          </span>
        ) : transaction.expiresAt ? (
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            Batas bayar: {new Date(transaction.expiresAt).toLocaleString('id-ID')}
          </span>
        ) : null}
        <span className="font-mono text-[10px] text-slate-400">ID: {transaction.id.slice(0, 8)}...</span>
      </div>

      {/* Hosted Payment Link & Status / Cancel Actions */}
      <div className="space-y-2 pt-1">
        {transaction.paymentLink && transaction.status === 'pending' && (
          <a
            href={transaction.paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-[#136F99] text-white text-xs font-bold shadow-xs hover:bg-[#0f5c80] transition flex items-center justify-center gap-1.5"
          >
            <span>Buka Halaman Pembayaran Aulaa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={isCheckingStatus}
            onClick={onRefreshStatus}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-[#0B2545] text-xs font-bold hover:bg-slate-50 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
          >
            {isCheckingStatus ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            <span>Cek Status Transaksi</span>
          </button>

          {canCancel && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={onCancelTransaction}
              className="py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-100 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {isCancelling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              <span>Batalkan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
