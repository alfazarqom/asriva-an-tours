import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Booking, BookingReview } from '../../types/travel';
import { formatDateReadable } from '../../utils/formatters';
import { ModalDialog } from '../ui/ModalDialog';

export interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSubmitReview: (bookingReference: string, review: BookingReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Sangat Kurang',
  2: 'Kurang Memuaskan',
  3: 'Cukup Baik',
  4: 'Sangat Baik',
  5: 'Luar Biasa!'
};

export const ReviewModal: React.FC<ReviewModalProps> = ({ booking, onClose, onSubmitReview }) => {
  const [rating, setRating] = useState<number>(5);
  const [author, setAuthor] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!booking) return;
    setRating(booking.review?.rating ?? 5);
    setAuthor(booking.review?.author ?? booking.guest.fullName ?? '');
    setComment(booking.review?.comment ?? '');
    setError('');
  }, [booking]);

  if (!booking) return null;

  const isEditing = Boolean(booking.review);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Silakan pilih rating bintang (1–5).');
      return;
    }
    const cleanComment = comment.trim();
    if (cleanComment.length < 10) {
      setError('Tulis komentar minimal 10 karakter agar bermanfaat bagi wisatawan lain.');
      return;
    }

    const submittedAt = new Date().toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric'
    });

    onSubmitReview(booking.bookingReference, {
      rating,
      comment: cleanComment,
      author: author.trim() || booking.guest.fullName || 'Wisatawan ASRIVA',
      submittedAt
    });
    onClose();
  };

  return (
    <ModalDialog
      open={Boolean(booking)}
      title={isEditing ? 'Edit Ulasan Perjalanan' : 'Beri Ulasan Perjalanan'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Trip Summary */}
        <div className="flex gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <img
            src={booking.packageImage}
            alt={booking.packageName}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 line-clamp-1">{booking.packageName}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{booking.destination}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Berangkat {formatDateReadable(booking.departureDate)}
            </div>
          </div>
        </div>

        {/* Star Rating Selector */}
        <div className="text-center py-2">
          <div className="text-xs font-bold text-slate-800 mb-2">
            Bagaimana pengalaman perjalanan Anda?
          </div>
          <div className="flex items-center justify-center gap-2" role="radiogroup" aria-label="Rating bintang">
            {[1, 2, 3, 4, 5].map((starValue) => {
              const active = starValue <= rating;
              return (
                <button
                  key={starValue}
                  type="button"
                  role="radio"
                  aria-checked={rating === starValue}
                  aria-label={`${starValue} bintang`}
                  onClick={() => {
                    setRating(starValue);
                    if (error) setError('');
                  }}
                  className="p-1 rounded-lg hover:scale-110 active:scale-95 transition"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      active ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-xs font-bold text-[#D97706] mt-1.5">{RATING_LABELS[rating]}</div>
        </div>

        {/* Reviewer Name */}
        <div>
          <label htmlFor="review-author" className="block text-[11px] font-bold text-slate-700 mb-1">
            Nama Tampilan
          </label>
          <input
            id="review-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Nama Anda"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#136F99]"
          />
        </div>

        {/* Review Comment */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="review-comment" className="block text-[11px] font-bold text-slate-700">
              Ceritakan Pengalaman Anda <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400">{comment.trim().length} karakter</span>
          </div>
          <textarea
            id="review-comment"
            rows={4}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              if (error) setError('');
            }}
            placeholder="Bagikan kesan tentang pemandu wisata, akomodasi, jadwal, dan momen terbaik Anda..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#136F99]"
          />
          {error && <p className="text-[11px] text-rose-600 mt-1">{error}</p>}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 py-2.5 rounded-xl bg-[#0B2545] text-white text-xs font-bold shadow-xs hover:bg-[#06172D] active:scale-[0.98] transition"
          >
            {isEditing ? 'Simpan Perubahan' : 'Kirim Ulasan'}
          </button>
        </div>
      </form>
    </ModalDialog>
  );
};
