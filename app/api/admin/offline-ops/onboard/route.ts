import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { runOfflineOnboarding } from '@/lib/services/offline-onboarding-service';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  agentName: z.enum(['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon']),
  sourceChannel: z.enum(['whatsapp_ads', 'whatsapp_direct', 'phone_call', 'walk_in', 'referral']),
  primary: z.object({
    role: z.enum(['parent', 'student']),
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  child: z
    .object({
      fullName: z.string().min(2),
      /** Legacy: optional; if omitted, server assigns a unique system learner email. */
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .optional(),
  tutor: z.object({
    tutorUserId: z.string().uuid().optional(),
    tutorEmail: z.string().email().optional(),
  }),
  schedule: z.object({
    weeks: z.number().min(1).max(24),
    sessionsPerWeek: z.number().min(1).max(7),
    weekDays: z.array(z.string()).min(1),
    sessionTime: z.string().min(4),
    durationMinutes: z.number().min(30).max(240),
    startDate: z.string().min(8),
    deliveryMode: z.enum(['online', 'onsite', 'hybrid']),
    subject: z.string().min(2),
  }),
  notes: z.string().min(3),
  tracking: z.object({
    paymentStatus: z.enum(['unpaid', 'partial', 'paid', 'refunded']).default('unpaid'),
    paymentEnvironment: z.enum(['real', 'sandbox']).default('real'),
    amountPaid: z.number().min(0).default(0),
    packageTotalAmount: z.number().min(0).optional(),
    nextFollowupAt: z.string().optional(),
  }),
  idempotencyKey: z.string().optional(),
});

function stableIdempotencyKey(payload: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const user = await getServerSession();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await isAdmin(user.id);
    if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const parsed = payloadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const data = parsed.data;

    const idempotencyKey = data.idempotencyKey || stableIdempotencyKey({
      primaryEmail: data.primary.email,
      tutor: data.tutor,
      schedule: data.schedule,
      sourceChannel: data.sourceChannel,
      notes: data.notes,
    });

    let result: Awaited<ReturnType<typeof runOfflineOnboarding>> | null = null;
    let lastErr: unknown = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        result = await runOfflineOnboarding(supabaseAdmin, {
          idempotencyKey,
          adminUserId: user.id,
          agentName: data.agentName,
          sourceChannel: data.sourceChannel,
          primary: data.primary,
          child: data.child ?? null,
          tutor: data.tutor,
          schedule: data.schedule,
          notes: data.notes,
        });
        break;
      } catch (err) {
        lastErr = err;
        if (attempt === 2) throw err;
      }
    }
    if (!result && lastErr) throw lastErr;

    const expectedTotal =
      data.tracking.packageTotalAmount !== undefined
        ? data.tracking.packageTotalAmount
        : data.tracking.amountPaid;

    // Keep offline_operations row for analytics blending + operational list UI.
    const { data: insertedOfflineOp } = await supabaseAdmin.from('offline_operations').insert({
      agent_name: data.agentName,
      source_channel: data.sourceChannel,
      customer_name: data.primary.fullName,
      customer_whatsapp: data.primary.phone || '',
      customer_role: data.primary.role === 'parent' ? 'Parent' : 'Student',
      number_of_learners: data.primary.role === 'parent' ? 1 : 1,
      learner_educational_level: 'Captured in onboarding notes',
      subjects_of_interest: data.schedule.subject,
      tutor_match_type: 'platform_tutor',
      delivery_mode: data.schedule.deliveryMode,
      onboarding_stage: 'matched',
      sessions_completed: 0,
      payment_status: data.tracking.paymentStatus,
      payment_environment: data.tracking.paymentEnvironment,
      amount_paid: data.tracking.amountPaid,
      started_at: `${data.schedule.startDate}T00:00:00.000Z`,
      next_followup_at: data.tracking.nextFollowupAt ? new Date(data.tracking.nextFollowupAt).toISOString() : null,
      converted_to_platform: true,
      notes: data.notes,
    }).select('id').maybeSingle();

    // Best-effort richer linkage fields (for upgraded schema).
    if (insertedOfflineOp?.id && result) {
      const linkagePatch: Record<string, unknown> = {
        offline_run_id: result.runId,
        primary_user_id: result.primaryUserId,
        learner_user_id: result.learnerUserId,
        tutor_user_id: result.tutorUserId,
        recurring_session_id: result.recurringSessionId,
        expected_total_amount: expectedTotal,
      };
      const { error: linkErr } = await supabaseAdmin
        .from('offline_operations')
        .update(linkagePatch)
        .eq('id', insertedOfflineOp.id);
      if (linkErr) {
        console.warn('[offline-ops/onboard] linkage columns update skipped', linkErr.message);
      }
    }

    await sendOpsAlertEmail(
      'Offline onboarding synced',
      `<p>An offline onboarding run was completed.</p>
      <ul>
        <li><strong>Run ID:</strong> ${result.runId ?? 'n/a'}</li>
        <li><strong>Idempotency key:</strong> ${idempotencyKey.slice(0, 12)}...</li>
        <li><strong>Agent:</strong> ${data.agentName}</li>
        <li><strong>Primary user:</strong> ${data.primary.fullName} (${data.primary.email})</li>
        <li><strong>Tutor:</strong> ${result.tutorName}</li>
        <li><strong>Scheduled sessions:</strong> ${result.individualSessionIds.length}</li>
      </ul>`
    );

    return NextResponse.json({
      success: true,
      run: result,
      idempotencyKey,
    });
  } catch (error: any) {
    console.error('[offline-ops/onboard] error', error);
    return NextResponse.json({ error: error?.message || 'Failed to onboard offline learner' }, { status: 500 });
  }
}

