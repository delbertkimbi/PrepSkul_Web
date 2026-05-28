export type PaymentEnv = 'real' | 'sandbox';

export type PaymentEnvInput = {
  payment_environment?: string | null;
  payment_method?: string | null;
  fapshi_trans_id?: string | null;
  /** booking_request rows without payment_environment are legacy/sandbox test checkouts */
  source?: 'on_platform' | 'off_platform' | 'booking_request';
};

/**
 * Production vs sandbox for analytics.
 * - Explicit payment_environment wins.
 * - payment_requests without payment_environment = 'real' are excluded (typically Fapshi sandbox tests).
 * - session_payments use fingerprint fallback when env is unset.
 */
export function classifyPaymentEnvironment(row: PaymentEnvInput): PaymentEnv {
  const env = (row.payment_environment || '').toLowerCase();
  if (env === 'sandbox') return 'sandbox';
  if (env === 'real') return 'real';

  if (row.source === 'booking_request') {
    return 'sandbox';
  }

  const fingerprint = `${row.payment_method || ''} ${row.fapshi_trans_id || ''}`.toLowerCase();
  if (/sandbox|test|demo|sb[-_]|_sb\b/.test(fingerprint)) {
    return 'sandbox';
  }

  return 'real';
}

export function isRealPayment(row: PaymentEnvInput) {
  return classifyPaymentEnvironment(row) === 'real';
}
