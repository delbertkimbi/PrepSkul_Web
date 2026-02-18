'use client';

import { useEffect } from 'react';

type AutoRedirectProps = {
  to: string;
  // Optional fallback URL (useful for deep links).
  fallbackTo?: string;
  // Delay before fallback (ms).
  fallbackDelayMs?: number;
};

export default function AutoRedirect({
  to,
  fallbackTo,
  fallbackDelayMs = 900,
}: AutoRedirectProps) {
  useEffect(() => {
    let fallbackTimer: any = null;

    try {
      // Attempt primary redirect (may be a deep link).
      window.location.href = to;

      if (fallbackTo && fallbackTo !== to) {
        fallbackTimer = setTimeout(() => {
          try {
            window.location.replace(fallbackTo);
          } catch (_) {
            window.location.href = fallbackTo;
          }
        }, fallbackDelayMs);
      }
    } catch (_) {
      // If anything goes wrong, try the fallback immediately.
      if (fallbackTo) {
        try {
          window.location.replace(fallbackTo);
        } catch (_) {
          window.location.href = fallbackTo;
        }
      }
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [to, fallbackTo, fallbackDelayMs]);

  return null;
}

