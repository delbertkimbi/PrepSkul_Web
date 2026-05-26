import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getServerSession, isAdmin } from '@/lib/supabase-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import {
  runOfflineOnboarding,
  runOfflineOnboardingForExistingUser,
} from '@/lib/services/offline-onboarding-service';
import { sendOpsAlertEmail } from '@/lib/ops-email';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  agentName: z.enum(['Brian', 'Delbert', 'Calvin', 'Brinzel', 'Brandon']),
  sourceChannel: z.enum(['whatsapp_ads', 'whatsapp_direct', 'phone_call', 'walk_in', 'referral']),
  enrollmentKind: z.enum(['new', 'existing']).default('new'),
  existingPrimaryUserId: z.string().uuid().optional(),
  existingChildUserId: z.string().uuid().optional(),
  primary: z.object({
    role: z.enum(['parent', 'student']),
    fullName: z.string().min(2),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  child: z
    .object({
      fullName: z.string().min(2),
      /** Legacy: optional; if omitted, server assigns a unique system learner email. */
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
    .nullable()
    .optional(),
  tutor: z.object({
    tutorUserId: z.string().uuid().optional(),
    tutorEmail: z.string().email().optional(),
  }),
  schedule: z.object({
    weeks: z.number().min(1).max(24),
    sessionsPerWeek: z.number().min(1).max(7),
    weekDays: z.array(z.string()).min(1).optional(),
    dayTimeSlots: z.array(z.object({ day: z.string(), time: z.string() })).optional(),
    sessionTime: z.string().min(4).optional(),
    durationMinutes: z.number().min(30).max(240),
    startDate: z.string().min(8),
    deliveryMode: z.enum(['online', 'onsite', 'hybrid']),
    subject: z.string().min(2),
    subjects: z.array(z.string()).optional(),
    meetLink: z.string().nullable().optional(),
    onsiteLocation: z.string().nullable().optional(),
    onsitePhotoUrl: z.string().nullable().optional(),
    payPerMonthXaf: z.number().nullable().optional(),
    payMonthsCount: z.number().nullable().optional(),
    operationState: z.enum(['active', 'paused', 'stopped']).optional(),
    startMonthLabel: z.string().nullable().optional(),
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

    /** One attempt only: a retry after partial success would recreate auth/profiles then fail the email check. */
    let completedResult: Awaited<ReturnType<typeof runOfflineOnboarding>>;
    if (data.enrollmentKind === 'existing') {
      if (!data.existingPrimaryUserId) {
        throw new Error('Pick an existing PrepSkul account to enroll.');
      }
      completedResult = await runOfflineOnboardingForExistingUser(supabaseAdmin, {
        idempotencyKey,
        adminUserId: user.id,
        agentName: data.agentName,
        sourceChannel: data.sourceChannel,
        primaryUserId: data.existingPrimaryUserId,
        primaryRole: data.primary.role,
        childUserId: data.existingChildUserId || null,
        childFullName: data.child?.fullName || null,
        tutor: data.tutor,
        schedule: data.schedule,
        notes: data.notes,
        tracking: data.tracking,
      });
    } else {
      if (!data.primary.email) {
        throw new Error('Email is required for new-user enrollment.');
      }
      completedResult = await runOfflineOnboarding(supabaseAdmin, {
        idempotencyKey,
        adminUserId: user.id,
        agentName: data.agentName,
        sourceChannel: data.sourceChannel,
        primary: { ...data.primary, email: data.primary.email },
        child: data.child ?? null,
        tutor: data.tutor,
        schedule: data.schedule,
        notes: data.notes,
        tracking: data.tracking,
      });
    }

    await sendOpsAlertEmail(
      'Offline onboarding synced',
      `<p>An offline onboarding run was completed.</p>
      <ul>
        <li><strong>Run ID:</strong> ${completedResult.runId ?? 'n/a'}</li>
        <li><strong>Idempotency key:</strong> ${idempotencyKey.slice(0, 12)}...</li>
        <li><strong>Agent:</strong> ${data.agentName}</li>
        <li><strong>Primary user:</strong> ${data.primary.fullName} (${data.primary.email})</li>
        <li><strong>Tutor:</strong> ${completedResult.tutorName}</li>
        <li><strong>Scheduled sessions:</strong> ${completedResult.individualSessionIds.length}</li>
      </ul>`
    );

    return NextResponse.json({
      success: true,
      run: completedResult,
      offlineOperationId: completedResult.offlineOperationId || null,
      idempotencyKey,
    });
  } catch (error: any) {
    console.error('[offline-ops/onboard] error', error);
    return NextResponse.json({ error: error?.message || 'Failed to onboard offline learner' }, { status: 500 });
  }
}

