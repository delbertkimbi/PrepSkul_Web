import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import {
  buildAmbassadorFollowUpReminderBody,
  type FollowUpActivityGroup,
  type FollowUpLeadRow,
} from '@/lib/email_templates/ambassador-followup-reminder';

export const runtime = 'nodejs';

const JOB_NAME = 'ambassador-lead-followups';

function todayDoualaDateString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala' }).format(new Date());
}

function formatDisplayDate(dateLike?: string | null) {
  if (!dateLike) return null;
  try {
    return new Date(`${dateLike}T12:00:00`).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateLike;
  }
}

export async function GET(request: NextRequest) {
  const authError = verifyExternalCron(request);
  if (authError) return authError;

  const supabase = getSupabaseAdmin();
  let runStatus: 'success' | 'failed' = 'failed';
  let processedCount = 0;
  let runError: string | null = null;

  try {
    const today = todayDoualaDateString();
    const appBase = process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com';
    const dashboardUrl = `${appBase}/admin/ambassador-outreach`;

    const { data: leads, error } = await supabase
      .from('ambassador_leads')
      .select(
        `id, full_name, phone, email, city, school, course_interest, status, follow_up_date, notes, outreach_activity_id,
         ambassadors(full_name, email),
         outreach_activities(id, activity_name, activity_type, date)`
      )
      .eq('follow_up_date', today)
      .in('status', ['Contacted', 'Interested', 'Follow Up Needed']);

    if (error) throw new Error(error.message);

    const due = (leads || []).filter((lead) => {
      const sent = (lead as { follow_up_reminder_sent_at?: string | null }).follow_up_reminder_sent_at;
      return !sent || sent < today;
    });

    if (due.length) {
      const groupMap = new Map<string, FollowUpActivityGroup>();

      for (const lead of due) {
        const ambassador = (lead as { ambassadors?: { full_name?: string | null } | null }).ambassadors;
        const activity = (
          lead as {
            outreach_activities?: {
              id: string;
              activity_name: string;
              activity_type?: string | null;
              date?: string | null;
            } | null;
          }
        ).outreach_activities;

        const activityId = activity?.id || lead.outreach_activity_id || null;
        const groupKey = activityId || 'no-activity';
        const activityName = activity?.activity_name || 'Leads without outreach activity';

        const existing = groupMap.get(groupKey) || {
          activityId,
          activityName,
          activityType: activity?.activity_type || null,
          activityDate: formatDisplayDate(activity?.date),
          ambassadorName: ambassador?.full_name || null,
          leads: [],
        };

        const row: FollowUpLeadRow = {
          id: lead.id,
          full_name: lead.full_name,
          phone: lead.phone,
          email: lead.email,
          city: lead.city,
          school: lead.school,
          course_interest: lead.course_interest,
          status: lead.status,
          notes: lead.notes,
          ambassadorName: ambassador?.full_name || null,
        };

        existing.leads.push(row);
        groupMap.set(groupKey, existing);
      }

      const groups = [...groupMap.values()].sort((a, b) =>
        a.activityName.localeCompare(b.activityName)
      );

      const bodyHtml = buildAmbassadorFollowUpReminderBody(today, groups, dashboardUrl);

      await sendOpsAlertEmail(`Ambassador follow-ups due — ${due.length} lead(s)`, bodyHtml, {
        title: 'Ambassador lead follow-up reminder',
        actionUrl: dashboardUrl,
        actionText: 'Review leads in admin',
      });

      const ids = due.map((l) => l.id);
      await supabase
        .from('ambassador_leads')
        .update({ follow_up_reminder_sent_at: today })
        .in('id', ids);
    }

    processedCount = due.length;
    runStatus = 'success';
    return NextResponse.json({ success: true, processed: processedCount, date: today });
  } catch (e: unknown) {
    runError = e instanceof Error ? e.message : 'Failed';
    return NextResponse.json({ error: runError }, { status: 500 });
  } finally {
    try {
      await persistCronHeartbeat(supabase, {
        jobName: JOB_NAME,
        status: runStatus,
        processedCount,
        error: runError,
        metadata: { endpoint: '/api/cron/ambassador-lead-followups' },
      });
    } catch {
      /* ignore */
    }
  }
}
