import { NextRequest, NextResponse } from 'next/server';
import { processTutorPayout } from '@/lib/services/process-tutor-payout';

/**
 * POST /api/payouts/process
 * Body: { payoutRequestId, adminId }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payoutRequestId, adminId } = body;

    const result = await processTutorPayout(payoutRequestId, adminId);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payout processing initiated',
      data: {
        payoutRequestId: result.payoutRequestId,
        transId: result.transId,
        dateInitiated: result.dateInitiated,
        status: result.status,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('❌ Error processing payout:', error);
    return NextResponse.json({ error: 'Internal server error', message }, { status: 500 });
  }
}
