import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Creating a confirmed account from a caller supplied number lets anyone
// claim another person's phone. Re-enable only with verified phone ownership.
export async function POST() {
  return NextResponse.json(
    { error: 'Phone signup requires verification. Please use email signup.' },
    { status: 403 },
  );
}
