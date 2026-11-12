/**
 * Mengunci zoom viewport (pinch-zoom, double-tap zoom, ctrl+wheel, shortcut keyboard)
 * serta menyediakan helper umpan balik haptik agar pengalaman web terasa seperti aplikasi native.
 */

const isInsideInteractiveMap = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('.leaflet-container'));
};

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
};

export function initNativeViewportLock(): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  let lastTouchEnd = 0;

  // Blokir Safari/iOS gesture pinch zoom pada seluruh halaman
  const handleGesture = (event: Event) => {
    event.preventDefault();
  };

  // Blokir multi-touch pinch zoom di luar peta interaktif
  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length > 1 && !isInsideInteractiveMap(event.target)) {
      event.preventDefault();
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length > 1 && !isInsideInteractiveMap(event.target)) {
      event.preventDefault();
    }
  };

  // Blokir double-tap zoom pada iOS/Android
  const handleTouchEnd = (event: TouchEvent) => {
    const now = Date.now();
    if (
      now - lastTouchEnd <= 320 &&
      !isEditableElement(event.target) &&
      !isInsideInteractiveMap(event.target)
    ) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  };

  // Blokir trackpad pinch & Ctrl/Cmd + scroll zoom
  const handleWheel = (event: WheelEvent) => {
    if ((event.ctrlKey || event.metaKey) && !isInsideInteractiveMap(event.target)) {
      event.preventDefault();
    }
  };

  // Blokir shortcut keyboard zoom (Ctrl/Cmd + '+', '-', '=', '0')
  const handleKeyDown = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '_', '0'].includes(event.key)) {
      event.preventDefault();
    }
  };

  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown, { passive: false });

  return () => {
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown);
  };
}

export function triggerHaptic(durationMs = 8): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(durationMs);
    } catch {
      // Abaikan jika browser membatasi getaran sebelum interaksi penuh
    }
  }
}
