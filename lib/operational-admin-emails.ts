/**
 * Ops / customer-service distribution list for automated alerts and digests.
 * Override via env OPS_ADMIN_EMAILS (comma-separated).
 */
export const DEFAULT_OPS_ADMIN_EMAILS = ['lekebrian2@gmail.com', 'prepskul@gmail.com'] as const;

export function getOpsAdminEmails(): string[] {
  const raw = process.env.OPS_ADMIN_EMAILS?.trim();
  if (!raw) return [...DEFAULT_OPS_ADMIN_EMAILS];
  return raw
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
