import { gregorianToHijri } from '@tabby_ai/hijri-converter';

export const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

export function toHijri(date: Date): HijriDate | null {
  try {
    const result = gregorianToHijri({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    });
    return { ...result, monthName: HIJRI_MONTH_NAMES[result.month - 1] ?? '' };
  } catch {
    return null;
  }
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicDigits(n: number): string {
  return String(n)
    .split('')
    .map((c) => (c >= '0' && c <= '9' ? ARABIC_DIGITS[Number(c)] : c))
    .join('');
}
