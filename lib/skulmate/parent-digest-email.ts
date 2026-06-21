/**
 * Parent weekly digest email (Resend + branded layout).
 */

import { buildBrandedEmailHtml, escapeHtml } from '@/lib/email_templates/branded-layout'
import type { BuiltParentDigest } from './parent-digest-builder'

export function buildParentDigestEmailHtml(
  digest: BuiltParentDigest,
  locale: 'en' | 'fr' = 'en'
): { subject: string; html: string } {
  const fr = locale === 'fr'
  const child = digest.childName ?? (fr ? 'votre enfant' : 'your child')
  const subject = fr
    ? `Révision SkulMate — ${child}`
    : `SkulMate revision update — ${child}`

  const sm = digest.skulmate
  const statsLines: string[] = []
  if (sm) {
    statsLines.push(
      fr
        ? `• Série : ${sm.streakDays} jour(s)`
        : `• Streak: ${sm.streakDays} day(s)`
    )
    statsLines.push(
      fr
        ? `• ${sm.revisionMinutesLast7Days} min de révision (7 jours)`
        : `• ${sm.revisionMinutesLast7Days} min revision (last 7 days)`
    )
    if (sm.accuracyLast7Days != null) {
      statsLines.push(
        fr
          ? `• Précision : ${sm.accuracyLast7Days}%`
          : `• Accuracy: ${sm.accuracyLast7Days}%`
      )
    }
    if (digest.readinessTitle) {
      statsLines.push(
        fr
          ? `• ${digest.readinessTitle} : ${sm.readinessScore}% (${sm.readinessLabel})`
          : `• ${digest.readinessTitle}: ${sm.readinessScore}% (${sm.readinessLabel})`
      )
    }
  }

  let body = `<p>${fr ? 'Voici un résumé de la semaine pour' : 'Here is this week\'s learning snapshot for'} <strong>${escapeHtml(child)}</strong>.</p>`

  if (digest.learnerContextLine) {
    body += `<p><em>${escapeHtml(digest.learnerContextLine)}</em></p>`
  }

  if (statsLines.length > 0) {
    body += `<div class="detail-box">${statsLines.map((l) => `<p>${escapeHtml(l.replace(/^•\s*/, ''))}</p>`).join('')}</div>`
  }

  if (sm && sm.weakTopicLabels.length > 0) {
    body += `<p><strong>${fr ? 'À renforcer' : 'Needs attention'}:</strong></p><ul>`
    for (const topic of sm.weakTopicLabels.slice(0, 5)) {
      body += `<li>${escapeHtml(topic)}</li>`
    }
    body += `</ul>`
    if (digest.hasActiveTutor && digest.activeTutorNames.length > 0) {
      body += `<p>${fr ? 'Un tuteur accompagne déjà votre enfant' : 'A tutor is already supporting your child'} (<strong>${escapeHtml(digest.activeTutorNames[0])}</strong>) — ${fr ? 'partagez ces points lors de la prochaine séance.' : 'share these focus areas in the next session.'}</p>`
    } else if (digest.messageTone === 'revision_only') {
      body += `<p>${fr ? 'Si ces sujets restent difficiles, un tuteur PrepSkul peut aider.' : 'If these stay tricky, a PrepSkul tutor can help.'}</p>`
    }
  }

  if (digest.sessionHighlights.length > 0) {
    body += `<p><strong>${fr ? 'Dernières séances' : 'Recent tutoring sessions'}:</strong></p>`
    for (const s of digest.sessionHighlights.slice(0, 3)) {
      const who = s.tutorName ? ` — ${escapeHtml(s.tutorName)}` : ''
      body += `<div class="detail-box"><p><strong>${escapeHtml(s.subjectHint ?? (fr ? 'Séance' : 'Session'))}${who}</strong></p><p>${escapeHtml(s.summaryPreview)}</p></div>`
    }
  }

  if (digest.upcomingSessions.length > 0) {
    body += `<p><strong>${fr ? 'Séances à venir' : 'Upcoming sessions'}:</strong></p><ul>`
    for (const u of digest.upcomingSessions) {
      const tutor = u.tutorName ? ` (${escapeHtml(u.tutorName)})` : ''
      body += `<li>${escapeHtml(u.scheduledAt)}${tutor}</li>`
    }
    body += `</ul>`
  }

  if (digest.readinessDisclaimer) {
    body += `<p style="font-size:13px;color:#666;">${escapeHtml(digest.readinessDisclaimer)}</p>`
  }

  const html = buildBrandedEmailHtml({
    recipientName: fr ? 'Parent' : 'there',
    title: fr ? 'Résumé de révision' : 'Revision summary',
    bodyHtml: body,
    actionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.prepskul.com'}/`,
    actionText: fr ? 'Ouvrir PrepSkul' : 'Open PrepSkul',
  })

  return { subject, html }
}

export async function sendParentDigestEmail(params: {
  to: string
  digest: BuiltParentDigest
  locale?: 'en' | 'fr'
}): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, error: 'RESEND_API_KEY not configured' }
  }

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { subject, html } = buildParentDigestEmailHtml(
    params.digest,
    params.locale ?? 'en'
  )
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'PrepSkul <noreply@mail.prepskul.com>'
  const replyTo = process.env.RESEND_REPLY_TO || 'info@prepskul.com'

  const result = await resend.emails.send({
    from: fromEmail.includes('<') ? fromEmail : `PrepSkul <${fromEmail}>`,
    to: params.to,
    replyTo,
    subject,
    html,
  })

  if (result.error) {
    return { ok: false, error: result.error.message }
  }
  return { ok: true }
}
