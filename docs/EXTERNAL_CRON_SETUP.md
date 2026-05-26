# External cron setup (PrepSkul Web)

PrepSkul uses an **external cron provider** (e.g. [cron-job.org](https://cron-job.org)) — **not** Vercel Cron (`vercel.json` is intentionally empty).

All cron endpoints require:

```
Authorization: Bearer <CRON_SECRET>
```

Set `CRON_SECRET` in `.env.local` (same value configured in your cron provider).

Base URL: `https://www.prepskul.com` (or your deployment URL)

---

## Required jobs (automatic emails & reminders)

| Job | Endpoint | Schedule | Purpose |
|-----|----------|----------|---------|
| **Process scheduled notifications** | `GET /api/cron/process-scheduled-notifications` | **Every 1–5 min** | Sends session reminders (24h, 1h, 15m), offline ops emails, match notifications, push |
| Process pending earnings | `GET /api/cron/process-pending-earnings` | Every 15–30 min | Moves tutor earnings pending → active after QA window |

### How session reminder emails work

**On-platform (mobile app):**
1. Mobile books a session → `NotificationHelperService.scheduleSessionReminders()` → `POST /api/notifications/schedule-session-reminders`
2. Web inserts `scheduled_notifications` with mobile-compatible titles/messages (24h, 1h, 15m)
3. External cron runs `process-scheduled-notifications` → sends via standard `sendNotificationEmail` (not offline ops templates)

**Off-platform (admin offline ops):**
1. `lib/services/session-notification-scheduler.ts` schedules rows with `metadata.offline_email = true`
2. Same cron sends via `sendOfflineReminderEmail` / `sendSessionStartEmail` with portal + reschedule links

If reminders are not sending, verify:

- `CRON_SECRET` matches in cron provider and deployment env
- Cron job runs every few minutes
- `scheduled_notifications` has pending rows with `scheduled_for` in the past
- `RESEND_API_KEY` is set
- Check `cron_job_heartbeats` for `process-scheduled-notifications`

---

## Optional engagement jobs

| Endpoint | Suggested schedule |
|----------|-------------------|
| `/api/cron/daily-challenge-reminder` | Daily morning |
| `/api/cron/skulmate-weekly-digest` | Weekly |
| `/api/cron/daily-inactivity` | Daily |
| `/api/cron/daily-matched-tutors` | Daily |
| `/api/cron/onboarding-reminders` | Daily |
| `/api/cron/process-abandoned-booking-reminders` | Daily |
| `/api/cron/session-approval-reminders` | Every 6h |
| `/api/cron/monthly-engagement` | Monthly |
| `/api/cron/monday-engagement` | Weekly (Monday) |
| `/api/cron/behavioural-engagement` | Daily |
| `POST /api/tutor/public-stats` body `{ "refreshAll": true }` | Daily (optional) |

---

## Example cron-job.org configuration

**Process scheduled notifications:**

- URL: `https://www.prepskul.com/api/cron/process-scheduled-notifications`
- Method: GET
- Header: `Authorization: Bearer YOUR_CRON_SECRET`
- Interval: Every 2 minutes

---

## Mobile app presence (Active Users admin page)

Mobile app pings every 2 minutes while open via `POST /api/mobile/presence/ping`.

Admin live view: `/admin/users/active` (auto-refreshes every 20s)

Run SQL: `supabase/mobile_presence.sql`
