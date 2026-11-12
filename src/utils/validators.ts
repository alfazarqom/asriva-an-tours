export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+]/g, '');
  return /^\d{8,15}$/.test(digits);
}

export function isValidIndonesianMobile(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+62|62|0)8\d{7,12}$/.test(cleaned);
}
