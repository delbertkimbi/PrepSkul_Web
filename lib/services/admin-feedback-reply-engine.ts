/**
 * Rule-based admin reply composer for learner/parent session feedback.
 * Uses learner comment themes, star rating, and tutor session report together.
 */

export type LearnerFeedbackInput = {
  rating: number;
  comment: string;
};

export type TutorReportInput = {
  attended?: boolean | null;
  topics_covered?: string | null;
  learner_engagement?: string | null;
  issues?: string | null;
  subject_taught?: string | null;
} | null;

export type AdminReplyContext = {
  recipientName?: string | null;
  tutorName?: string | null;
  sessionSubject?: string | null;
  sessionDate?: string | null;
};

type Theme =
  | 'punctuality'
  | 'communication'
  | 'understanding'
  | 'homework'
  | 'tutor_praise'
  | 'tutor_concern'
  | 'venue'
  | 'online_tech'
  | 'pace'
  | 'gratitude'
  | 'child_behavior'
  | 'scheduling'
  | 'general_positive'
  | 'general_negative';

const THEME_PATTERNS: Array<{ theme: Theme; patterns: RegExp[] }> = [
  { theme: 'punctuality', patterns: [/\blate\b/, /\bdelay/, /\bon time\b/, /\bpunctual/, /\bwaited\b/, /\bstarted late\b/] },
  { theme: 'communication', patterns: [/\bexplain/, /\bcommunicat/, /\blisten/, /\blanguage\b/, /\bunderstand me\b/] },
  { theme: 'understanding', patterns: [/\bunderstand/, /\bconfus/, /\bclear\b/, /\bgrasp\b/, /\bconcept/, /\bdifficult\b/] },
  { theme: 'homework', patterns: [/\bhomework\b/, /\bassignment/, /\bpractice\b/, /\bexercise/] },
  { theme: 'tutor_praise', patterns: [/\bgreat tutor\b/, /\bexcellent\b/, /\bpatient\b/, /\bkind\b/, /\bhelpful\b/, /\bknowledgeable\b/] },
  { theme: 'tutor_concern', patterns: [/\brude\b/, /\bunprepared\b/, /\bunprofessional\b/, /\bdistracted\b/, /\bphone\b.*\bsession/] },
  { theme: 'venue', patterns: [/\blocation\b/, /\bvenue\b/, /\bonsite\b/, /\bnoisy\b/, /\bquiet\b/] },
  { theme: 'online_tech', patterns: [/\binternet\b/, /\bconnection\b/, /\bzoom\b/, /\bmeet\b/, /\baudio\b/, /\bvideo\b/] },
  { theme: 'pace', patterns: [/\btoo fast\b/, /\btoo slow\b/, /\bpace\b/, /\brush\b/, /\brushed\b/] },
  { theme: 'gratitude', patterns: [/\bthank/, /\bappreciat/, /\bgrateful\b/] },
  { theme: 'child_behavior', patterns: [/\bchild\b/, /\bson\b/, /\bdaughter\b/, /\bstudent\b.*\bbehav/, /\bfocus\b/] },
  { theme: 'scheduling', patterns: [/\breschedul/, /\bcancel/, /\bmissed\b/, /\babsent\b/] },
];

const NEGATIVE_HINTS = /\b(bad|terrible|awful|disappoint|frustrat|angry|upset|waste|never again|poor|horrible|worst)\b/i;
const POSITIVE_HINTS = /\b(good|great|excellent|wonderful|amazing|love|happy|satisfied|helpful|perfect)\b/i;

function hashSeed(...parts: string[]) {
  let h = 0;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function detectThemes(comment: string): Theme[] {
  const c = comment.toLowerCase();
  const found: Theme[] = [];
  for (const { theme, patterns } of THEME_PATTERNS) {
    if (patterns.some((p) => p.test(c))) found.push(theme);
  }
  if (found.length === 0) {
    if (POSITIVE_HINTS.test(c)) found.push('general_positive');
    else if (NEGATIVE_HINTS.test(c)) found.push('general_negative');
  }
  return [...new Set(found)];
}

function firstName(name?: string | null) {
  if (!name?.trim()) return null;
  return name.trim().split(/\s+/)[0];
}

function formatSessionWhen(date?: string | null, time?: string | null) {
  if (!date) return null;
  const t = time ? String(time).slice(0, 5) : '';
  return `${date}${t ? ` at ${t}` : ''}`;
}

function excerptQuote(comment: string, max = 140) {
  const t = comment.trim();
  if (!t) return null;
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 60 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function engagementLabel(raw?: string | null) {
  const e = (raw || '').toLowerCase();
  if (!e) return null;
  if (/excellent|very good|high|great|strong/.test(e)) return 'strong';
  if (/good|positive|engaged/.test(e)) return 'good';
  if (/low|poor|weak|distracted|passive/.test(e)) return 'low';
  return raw.trim();
}

function tutorReportParagraph(
  tr: TutorReportInput,
  tutorName: string | null,
  themes: Theme[],
  rating: number,
  seed: number
): string | null {
  if (!tr) return null;

  const tutor = tutorName || 'your tutor';
  const eng = engagementLabel(tr.learner_engagement);
  const topics = tr.topics_covered?.trim();
  const issues = tr.issues?.trim();
  const attended = tr.attended;

  const parts: string[] = [];

  if (attended === false) {
    parts.push(
      pick(
        [
          `We also reviewed ${tutor}'s report, which noted that the session did not take place as scheduled. We are following up on attendance and will make sure the next slot is confirmed with you in advance.`,
          `${tutor} indicated the session was not held. We have flagged this internally and will align with you on a make-up or next step that works for your family.`,
        ],
        seed,
        1
      )
    );
  } else if (attended === true) {
    if (topics) {
      parts.push(
        pick(
          [
            `${tutor} reported that the lesson covered ${topics.length > 80 ? `${topics.slice(0, 80)}…` : topics}, which helps us track progress alongside your comments.`,
            `On our side, ${tutor} shared that they worked through: ${topics.length > 100 ? `${topics.slice(0, 100)}…` : topics}.`,
          ],
          seed,
          2
        )
      );
    }

    if (eng === 'strong' || eng === 'good') {
      if (rating >= 4) {
        parts.push(
          pick(
            [
              `${tutor} described your learner's engagement during the session as ${eng === 'strong' ? 'very strong' : 'good'}, which lines up with what you shared — that is encouraging for us.`,
              `It is helpful that both your feedback and ${tutor}'s notes point to solid engagement in class.`,
            ],
            seed,
            3
          )
        );
      } else if (rating <= 2) {
        parts.push(
          pick(
            [
              `We also read ${tutor}'s report, where engagement was described as ${eng === 'strong' ? 'strong' : 'positive'} even though your experience was difficult. We want to understand that gap, so we will speak with ${tutor} and adjust the approach for the next lesson.`,
              `${tutor}'s notes mention reasonable engagement, but your rating tells us something did not feel right on your end. We take both seriously and will coordinate with ${tutor} before the next session.`,
            ],
            seed,
            4
          )
        );
      }
    } else if (eng === 'low') {
      parts.push(
        pick(
          [
            `${tutor} noted that engagement was lower than usual, which matches the concerns in your message. We will work with ${tutor} on pacing and activities that suit your learner better.`,
            `Both your feedback and ${tutor}'s report suggest the session was hard to sustain focus-wise. We will discuss concrete changes with ${tutor} for next time.`,
          ],
          seed,
          5
        )
      );
    }

    if (issues) {
      const issueLower = issues.toLowerCase();
      const learnerAlsoRaised =
        themes.includes('punctuality') && /late|delay|time/.test(issueLower);
      parts.push(
        pick(
          [
            learnerAlsoRaised
              ? `${tutor} raised a similar point about timing/logistics ("${issues.length > 90 ? `${issues.slice(0, 90)}…` : issues}"), so we are treating punctuality as a priority for the next class.`
              : `${tutor} flagged the following from their side: "${issues.length > 110 ? `${issues.slice(0, 110)}…` : issues}". We have added this to the case notes for follow-up.`,
          ],
          seed,
          6
        )
      );
    }
  }

  return parts.length ? parts.join('\n\n') : null;
}

function themeResponse(themes: Theme[], rating: number, seed: number): string {
  const byTheme: Partial<Record<Theme, string[]>> = {
    punctuality: [
      'Punctuality matters to us. We have reminded your tutor about starting on time and will monitor the next session closely.',
      'Thank you for flagging the timing issue. We have spoken with your tutor about being ready at the agreed time.',
    ],
    communication: [
      'Clear communication is central to a good lesson. We will ask your tutor to check understanding more often and invite questions throughout.',
      'We appreciate you mentioning how explanations landed. We will align with your tutor on clearer, step-by-step teaching.',
    ],
    understanding: [
      'It sounds like some concepts still felt unclear. We will ask your tutor to recap key ideas and use examples that match your learner\'s level.',
      'We want the next lesson to feel less confusing. Your tutor will focus on reinforcement and practice on the topics you raised.',
    ],
    homework: [
      'We will make sure practice/homework expectations are realistic and explained at the end of class.',
      'Thank you for mentioning follow-up work. We will coordinate with your tutor on manageable assignments.',
    ],
    tutor_praise: [
      'We are glad the tutor is making a positive impression. We will pass your kind words along — it helps tutors stay motivated.',
      'It is great to hear good things about the teaching style. We will keep supporting this pairing.',
    ],
    tutor_concern: [
      'We are sorry if the tutor\'s conduct did not meet our standards. This is being reviewed with the tutor and our operations team.',
      'Professionalism is non-negotiable for us. We are addressing your concern directly with the tutor involved.',
    ],
    venue: [
      'Learning environment matters. We will confirm the setup with your tutor and adjust location or conditions where possible.',
      'Thank you for describing the setting. We will make sure the next session is arranged in a suitable space.',
    ],
    online_tech: [
      'Technical issues are frustrating. Please share your preferred backup (phone hotspot, alternate link) and we will brief your tutor before the next online class.',
      'We will remind your tutor to test the link and audio a few minutes early to avoid disruption.',
    ],
    pace: [
      'Pace is something we can tune. We will ask your tutor to slow down or add extension activities based on what you described.',
      'We will align with your tutor on a pace that feels comfortable for your learner.',
    ],
    gratitude: [
      'Your appreciation means a lot to the team and to your tutor.',
      'Thank you for the warm words — we will share them with your tutor.',
    ],
    child_behavior: [
      'Every learner is different. We will discuss strategies with your tutor to keep your child engaged and supported.',
      'We will work with your tutor on approaches that fit your child\'s temperament and focus level.',
    ],
    scheduling: [
      'We understand schedule changes can be stressful. Our team can help reschedule if needed — just let us know preferred times.',
      'We have noted the scheduling concern and will make sure upcoming sessions are confirmed clearly.',
    ],
    general_positive: [
      'We are pleased the session went well overall. We will keep building on what is working.',
      'Thank you for the encouraging feedback — we will maintain this standard going forward.',
    ],
    general_negative: [
      'We are sorry the session did not meet your expectations. We are reviewing what happened and will respond with a clear plan.',
      'Your honesty helps us improve. We are treating this as a priority case.',
    ],
  };

  if (themes.length === 0) {
    if (rating >= 4) return pick(byTheme.general_positive!, seed, 10);
    if (rating <= 2) return pick(byTheme.general_negative!, seed, 10);
    return 'We have logged your comments and will follow up with your tutor before the next lesson.';
  }

  const primary = themes[0];
  const secondary = themes[1];

  let body = pick(byTheme[primary] || byTheme.general_negative!, seed, 10);

  if (secondary && byTheme[secondary]) {
    const extra = pick(byTheme[secondary]!, seed, 20);
    if (!body.includes(extra.slice(0, 30))) body += ` ${extra}`;
  }

  if (rating <= 2 && !body.toLowerCase().includes('sorry')) {
    body = `We are genuinely sorry this session fell short. ${body}`;
  }

  return body;
}

function openingLine(name: string | null, rating: number, seed: number): string {
  const fn = firstName(name);
  const greet = fn ? pick([`Hi ${fn},`, `Hello ${fn},`, `Good day ${fn},`], seed) : pick(['Hi,', 'Hello,', 'Good day,'], seed);

  if (rating >= 5) {
    return `${greet}\n\nThank you for the excellent rating and for taking time to write to us.`;
  }
  if (rating >= 4) {
    return `${greet}\n\nThank you for your thoughtful feedback after the recent session.`;
  }
  if (rating === 3) {
    return `${greet}\n\nThank you for sharing an honest mid-range rating — we read your comments carefully.`;
  }
  if (rating >= 1) {
    return `${greet}\n\nThank you for your honest feedback. We know a ${rating}-star experience is not what we aim for, and we are looking into this personally.`;
  }
  return `${greet}\n\nThank you for getting in touch about the session.`;
}

function closingLine(seed: number): string {
  return pick(
    [
      'If anything else comes up before the next class, reply here on WhatsApp and we will help quickly.\n\nWarm regards,\nPrepSkul Team',
      'Please do not hesitate to message us if you would like the next lesson adjusted (topics, pace, or format).\n\nKind regards,\nPrepSkul',
      'We are here if you need support before the next session.\n\nBest wishes,\nPrepSkul Operations',
    ],
    seed,
    30
  );
}

/**
 * Compose a human, context-aware admin reply for WhatsApp or email.
 */
export function composeAdminFeedbackReply(
  learner: LearnerFeedbackInput,
  tutorReport: TutorReportInput,
  context: AdminReplyContext = {}
): string {
  const rating = Math.min(5, Math.max(0, Number(learner.rating) || 0));
  const comment = (learner.comment || '').trim();
  const seed = hashSeed(comment, String(rating), context.recipientName || '', JSON.stringify(tutorReport || {}));

  const themes = detectThemes(comment);
  const when = formatSessionWhen(context.sessionDate, null);
  const subject = context.sessionSubject?.trim();

  const blocks: string[] = [openingLine(context.recipientName, rating, seed)];

  if (subject || when) {
    const ref = [subject && `your ${subject} session`, when && `on ${when}`].filter(Boolean).join(' ');
    blocks.push(`This note is regarding ${ref}.`);
  }

  const quote = excerptQuote(comment);
  if (quote) {
    blocks.push(
      pick(
        [
          `You wrote: "${quote}" — we wanted to respond to that specifically.`,
          `We noted your comment: "${quote}".`,
          `Regarding what you shared ("${quote}"), here is our response:`,
        ],
        seed,
        7
      )
    );
  }

  blocks.push(themeResponse(themes, rating, seed));

  const tutorBlock = tutorReportParagraph(tutorReport, context.tutorName || null, themes, rating, seed);
  if (tutorBlock) blocks.push(tutorBlock);
  else if (tutorReport === null && rating <= 3) {
    blocks.push(
      'Our team is also reviewing the tutor\'s session report so we have the full picture before the next lesson.'
    );
  }

  if (rating >= 4 && themes.includes('gratitude')) {
    blocks.push('We will keep encouraging consistency on both sides.');
  }

  blocks.push(closingLine(seed));

  return blocks.filter(Boolean).join('\n\n');
}

/** Cameroon-friendly WhatsApp deep link with prefilled message. */
export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string | null {
  let d = (phone || '').replace(/\D/g, '');
  if (!d) return null;
  if (d.startsWith('0')) d = `237${d.slice(1)}`;
  else if (d.length === 9 && !d.startsWith('237')) d = `237${d}`;
  return `https://wa.me/${d}?text=${encodeURIComponent(message)}`;
}
