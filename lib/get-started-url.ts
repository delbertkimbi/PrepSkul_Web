export const APP_ORIGIN =
  process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() || "https://app.prepskul.com"
// Local Flutter testing is opt-in: set NEXT_PUBLIC_APP_ORIGIN only while
// running that app server. Starting the website does not start Flutter.
export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.prepskul.prepskul"

/** Book, request, pay, and live class live in the app. The marketing site only links here. */
export function getStartedUrl(): string {
  if (typeof window === "undefined") return APP_ORIGIN

  const userAgent = navigator.userAgent || navigator.vendor
  if (/android/i.test(userAgent)) return PLAY_STORE_URL
  return APP_ORIGIN
}
