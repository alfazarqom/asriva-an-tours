import { Traveler } from '../types/travel';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDateReadable(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(dateObj.getTime())) return isoDate;
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function calculateReturnDate(departureIso: string, durationDays: number): string {
  if (!departureIso) return '-';
  const parts = departureIso.split('-');
  if (parts.length !== 3) return '-';
  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(dateObj.getTime())) return '-';
  dateObj.setDate(dateObj.getDate() + Math.max(0, durationDays - 1));
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return formatDateReadable(`${y}-${m}-${d}`);
}

export function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  return `ASR-${ym}-${suffix}`;
}

export function formatTravelerTypeLabel(type: Traveler['type']): string {
  if (type === 'Adult') return 'Dewasa';
  if (type === 'Child') return 'Anak';
  return 'Bayi';
}
