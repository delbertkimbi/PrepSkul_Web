export function getStartedUrl(): string {
    // Desktop rendering safety
    if (typeof window === "undefined") {
      return "https://app.prepskul.com"
    }
  
    const userAgent = navigator.userAgent || navigator.vendor
  
    // Detect Android devices
    if (/android/i.test(userAgent)) {
      return "https://play.google.com/store/apps/details?id=com.prepskul.prepskul"
    }
  
    // Detect iPhone, iPad, iPod
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return "https://app.prepskul.com"
    }
  
    // Desktop and other devices
    return "https://app.prepskul.com"
  }