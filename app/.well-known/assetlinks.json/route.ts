import { NextResponse } from 'next/server';

// Android App Links association file.
// Served at: https://www.prepskul.com/.well-known/assetlinks.json
//
// Configure in Vercel env:
// - ANDROID_APP_PACKAGE (default: com.prepskul.app)
// - ANDROID_SHA256_CERT_FINGERPRINTS (comma-separated SHA-256 fingerprints)
//
// Example:
// ANDROID_SHA256_CERT_FINGERPRINTS=AA:BB:...:FF,11:22:...:99

export const runtime = 'nodejs';

function parseFingerprints(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function GET() {
  const packageName = process.env.ANDROID_APP_PACKAGE || 'com.prepskul.app';
  const fingerprints = parseFingerprints(process.env.ANDROID_SHA256_CERT_FINGERPRINTS);

  const payload = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: fingerprints,
      },
    },
  ];

  return NextResponse.json(payload, {
    headers: {
      // Keep it cacheable, but allow updates.
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}

