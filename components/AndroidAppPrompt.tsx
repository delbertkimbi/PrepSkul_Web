'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.prepskul.prepskul&pcampaignid=web_share';
const DISMISS_KEY = 'prepskul_android_app_prompt_dismissed';
const DISMISS_DAYS = 7;

function isAndroid(userAgent: string): boolean {
  return /android/i.test(userAgent);
}

function shouldShowPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const isAppDomain = hostname === 'app.prepskul.com' || hostname === 'localhost';
  if (!isAppDomain) return false;
  if (!isAndroid(navigator.userAgent)) return false;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return true;
    const at = parseInt(raw, 10);
    if (Number.isNaN(at)) return true;
    const elapsed = (Date.now() - at) / (1000 * 60 * 60 * 24);
    return elapsed > DISMISS_DAYS;
  } catch {
    return true;
  }
}

function dismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  } catch {
    // ignore
  }
}

export function AndroidAppPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowPrompt());
  }, []);

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  const handleOpenStore = () => {
    dismiss();
    setVisible(false);
    window.open(PLAY_STORE_URL, '_blank', 'noopener,noreferrer');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-4 pb-[env(safe-area-inset-bottom)] md:max-w-md md:left-4 md:bottom-4 md:rounded-2xl md:shadow-lg"
      role="dialog"
      aria-label="Get the PrepSkul app"
    >
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-center gap-4">
        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src="/app_logo(blue).png"
            alt="PrepSkul"
            fill
            className="object-contain"
            sizes="48px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">Get the PrepSkul app</p>
          <p className="text-gray-600 text-xs mt-0.5">Better experience on the go. Download from Google Play.</p>
        </div>
        <div className="flex flex-col gap-2 items-end flex-shrink-0">
          <button
            type="button"
            onClick={handleOpenStore}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Download
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-gray-500 text-xs hover:text-gray-700"
            aria-label="Dismiss"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
