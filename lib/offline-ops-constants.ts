export const ADMIN_WHATSAPP = '+237653301997';
export const COMMISSION_RATE = Number(process.env.PREPSKUL_COMMISSION_RATE || '0.15');
export const TUTOR_EARNINGS_RATE = 1 - COMMISSION_RATE;

export function computePackageTotalDue(payPerMonth: number | string, payMonths: number | string) {
  const perMonth = Number(payPerMonth || 0);
  const months = Number(payMonths || 0);
  if (!perMonth || !months) return 0;
  return Math.round(perMonth * months);
}
