import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// A phone alias is not proof that the caller owns the phone number. Legacy
// accounts must use a verified recovery flow before their email is confirmed.
export async function POST() {
  return NextResponse.json(
    { error: 'Phone account verification is required. Contact support.' },
    { status: 403 },
  );
}
