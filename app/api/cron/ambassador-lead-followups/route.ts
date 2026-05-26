import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { verifyExternalCron, persistCronHeartbeat } from '@/lib/cron-auth';
import { sendOpsAlertEmail } from '@/lib/ops-email';
import { escapeHtml } from '@/lib/email_templates/branded-layout';

export const runtime = 'nodejs';

const JOB_NAME = 'ambassador-lead-followups';

function todayDoualaDateString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Douala' }).format(new Date());
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

    const { data: leads, error } = await supabase
      .from('ambassador_leads')
      .select(
        'id, full_name, phone, email, city, school, course_interest, status, follow_up_date, notes, ambassadors(full_name, email)'
      )
      .eq('follow_up_date', today)
      .in('status', ['Contacted', 'Interested', 'Follow Up Needed']);

    if (error) throw new Error(error.message);

    const due = (leads || []).filter((lead) => {
      const sent = (lead as { follow_up_reminder_sent_at?: string | null }).follow_up_reminder_sent_at;
      return !sent || sent < today;
    });

    if (due.length) {
      const rows = due
        .map((lead) => {
          const ambassador = (lead as { ambassadors?: { full_name?: string | null } | null }).ambassadors;
          return `<tr>
            <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(lead.full_name)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(lead.phone)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(lead.status)}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(ambassador?.full_name || '—')}</td>
          </tr>`;
        })
        .join('');

      const bodyHtml = `
        <p>You have <strong>${due.length}</strong> ambassador lead${due.length === 1 ? '' : 's'} due for follow-up today (${escapeHtml(today)}).</p>
        <p>Please reach out and update their status on the ambassador outreach dashboard.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:16px;">
          <thead>
            <tr style="background:#f1f5f9;text-align:left;">
              <th style="padding:8px;">Lead</th>
              <th style="padding:8px;">Phone</th>
              <th style="padding:8px;">Status</th>
              <th style="padding:8px;">Ambassador</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;

      await sendOpsAlertEmail(`Ambassador follow-ups due today (${due.length})`, bodyHtml, {
        title: 'Ambassador lead follow-ups',
        actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.prepskul.com'}/admin/ambassador-outreach`,
        actionText: 'Open outreach dashboard',
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
