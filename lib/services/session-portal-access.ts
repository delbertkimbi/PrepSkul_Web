import crypto from 'crypto';

const TUTOR_BASE = () => process.env.NEXT_PUBLIC_TUTOR_PORTAL_URL || 'https://tutor.prepskul.com';
const LEARNER_BASE = () => process.env.NEXT_PUBLIC_LEARNER_PORTAL_URL || 'https://learner.prepskul.com';

function portalSecret() {
  const s = process.env.SESSION_PORTAL_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error('SESSION_PORTAL_SECRET or CRON_SECRET must be set for portal links');
  return s;
}

type PortalPayload = {
  sessionId: string;
  role: 'tutor' | 'learner';
  exp: number;
};

function signPayload(payload: PortalPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', portalSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifySignedToken(token: string): PortalPayload {
  const [body, sig] = token.split('.');
  if (!body || !sig) throw new Error('Invalid token');
  const expected = crypto.createHmac('sha256', portalSecret()).update(body).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error('Invalid token');
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as PortalPayload;
  if (payload.exp < Date.now()) throw new Error('Token expired');
  if (!payload.sessionId || !payload.role) throw new Error('Invalid token payload');
  return payload;
}

export function createSessionPortalToken(sessionId: string, role: 'tutor' | 'learner', expiresInDays = 90) {
  const exp = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  return signPayload({ sessionId, role, exp });
}

export function verifySessionPortalAccessToken(token: string) {
  const payload = verifySignedToken(token);
  return {
    sessionId: payload.sessionId,
    role: payload.role,
    purpose: payload.role === 'tutor' ? ('tutor_report' as const) : ('learner_feedback' as const),
  };
}

export function buildSessionPortalUrls(sessionId: string, expiresInDays = 90) {
  const tutorToken = createSessionPortalToken(sessionId, 'tutor', expiresInDays);
  const learnerToken = createSessionPortalToken(sessionId, 'learner', expiresInDays);
  return {
    tutorReportUrl: `${TUTOR_BASE()}/session-hub?token=${encodeURIComponent(tutorToken)}`,
    learnerFeedbackUrl: `${LEARNER_BASE()}/session-hub?token=${encodeURIComponent(learnerToken)}`,
    tutorToken,
    learnerToken,
  };
}
