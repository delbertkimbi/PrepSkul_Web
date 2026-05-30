# Cron job registry

All jobs use **GET** and header `Authorization: Bearer CRON_SECRET` unless noted. Host: `https://www.prepskul.com` (or your production `NEXT_PUBLIC_APP_URL`). Timezone in cron-job.org UI can be **Africa/Douala** for WAT-aligned schedules.

Heartbeats: `cron_job_heartbeats` (migration `073_cron_job_heartbeats.sql`).

| Job name | Path | Suggested schedule | Heartbeat |
|----------|------|-------------------|-----------|
| process-scheduled-notifications | `/api/cron/process-scheduled-notifications` | Every 5–10 min | yes |
| daily-inactivity | `/api/cron/daily-inactivity` | Daily ~18:00 WAT | yes |
| monday-engagement | `/api/cron/monday-engagement` | Mon ~20:00 WAT | yes |
| monthly-engagement | `/api/cron/monthly-engagement` | 1st ~09:00 WAT | yes |
| calendar-engagement | `/api/cron/calendar-engagement` | Daily ~08:00 WAT | yes |
| behavioural-engagement | `/api/cron/behavioural-engagement` | Every 6h | yes |
| daily-challenge-reminder | `/api/cron/daily-challenge-reminder` | Daily ~17:00 WAT | yes |
| skulmate-weekly-digest | `/api/cron/skulmate-weekly-digest` | Sun 08:00 UTC | yes |
| process-abandoned-booking-reminders | `/api/cron/process-abandoned-booking-reminders` | Daily | partial |
| onboarding-reminders | `/api/cron/onboarding-reminders` | Daily | yes |
| process-pending-earnings | `/api/cron/process-pending-earnings` | Daily | partial |
| tutor-onsite-attendance-reminders | `/api/cron/tutor-onsite-attendance-reminders` | Every 30–60 min | yes |
| daily-matched-tutors | `/api/cron/daily-matched-tutors` | Daily (if enabled) | partial |
| session-approval-reminders | `/api/cron/session-approval-reminders` | Daily | partial |

**Owner:** Platform / backend. **External scheduler:** [cron-job.org](https://cron-job.org) — see `EXTERNAL_CRON_SETUP.md`.

**Analytics:** `notification_campaign_log` (migration `085_notification_campaign_log.sql`) records engagement sends with `campaign_id`.
