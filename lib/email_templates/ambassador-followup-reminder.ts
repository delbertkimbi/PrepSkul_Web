import { escapeHtml } from '@/lib/email_templates/branded-layout';

export type FollowUpLeadRow = {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  city: string;
  school: string;
  course_interest: string;
  status: string;
  notes?: string | null;
  ambassadorName?: string | null;
};

export type FollowUpActivityGroup = {
  activityId: string | null;
  activityName: string;
  activityType?: string | null;
  activityDate?: string | null;
  ambassadorName?: string | null;
  leads: FollowUpLeadRow[];
};

export function buildAmbassadorFollowUpReminderBody(
  todayLabel: string,
  groups: FollowUpActivityGroup[],
  dashboardUrl: string
): string {
  const totalLeads = groups.reduce((n, g) => n + g.leads.length, 0);

  const groupBlocks = groups
    .map((group) => {
      const leadRows = group.leads
        .map(
          (lead) => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(lead.full_name)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(lead.phone)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(lead.status)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(lead.course_interest)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${escapeHtml(lead.ambassadorName || '—')}</td>
        </tr>`
        )
        .join('');

      const metaParts = [
        group.activityType ? `<strong>Type:</strong> ${escapeHtml(group.activityType)}` : '',
        group.activityDate ? `<strong>Activity date:</strong> ${escapeHtml(group.activityDate)}` : '',
        group.ambassadorName ? `<strong>Ambassador:</strong> ${escapeHtml(group.ambassadorName)}` : '',
      ].filter(Boolean);

      return `
      <div style="margin:24px 0 0;">
        <h3 style="margin:0 0 8px;font-size:16px;color:#1B2C4F;">${escapeHtml(group.activityName)}</h3>
        ${metaParts.length ? `<p style="margin:0 0 12px;font-size:13px;color:#64748b;">${metaParts.join(' · ')}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f8f9fa;text-align:left;">
              <th style="padding:8px 10px;">Lead</th>
              <th style="padding:8px 10px;">Phone</th>
              <th style="padding:8px 10px;">Status</th>
              <th style="padding:8px 10px;">Interest</th>
              <th style="padding:8px 10px;">Ambassador</th>
            </tr>
          </thead>
          <tbody>${leadRows}</tbody>
        </table>
      </div>`;
    })
    .join('');

  return `
    <p>Today is <strong>${escapeHtml(todayLabel)}</strong>. You have <strong>${totalLeads}</strong> ambassador lead${totalLeads === 1 ? '' : 's'} scheduled for follow-up.</p>
    <p>Please review the leads below — grouped by outreach activity — and update their status after you reach out.</p>
    ${groupBlocks}
    <p style="margin-top:28px;font-size:14px;">Open the outreach dashboard to see full details, notes, and contact history.</p>
    <p style="font-size:13px;color:#64748b;word-break:break-all;">Dashboard: <a href="${escapeHtml(dashboardUrl)}">${escapeHtml(dashboardUrl)}</a></p>`;
}
