import { NextResponse } from 'next/server';

// iOS Universal Links association file.
// Served at: https://www.prepskul.com/.well-known/apple-app-site-association
//
// Configure in Vercel env:
// - IOS_APP_ID (format: TEAMID.bundleid)  e.g. ABCDE12345.com.prepskul.app
//
// We include tutor profile paths so shared tutor links open the app directly.

export const runtime = 'nodejs';

export async function GET() {
  const appId = process.env.IOS_APP_ID || '';

  const payload = {
    applinks: {
      apps: [],
      details: appId
        ? [
            {
              appID: appId,
              paths: [
                '/tutor/*',
                '/messages/*',
                '/bookings/*',
                '/sessions/*',
                '/payments/*',
                '/*',
              ],
            },
          ]
        : [],
    },
  };

  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  });
}

