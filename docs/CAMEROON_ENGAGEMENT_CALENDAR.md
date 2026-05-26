# Cameroon engagement calendar

Region code in metadata: `CM`. Future countries can add parallel entries with `region` field.

Defined in `PrepSkul_Web/lib/notifications/calendar-cm.ts`. Delivered by `/api/cron/calendar-engagement` (morning WAT) and as highest priority in daily boost.

| Date (WAT) | ID | Roles | Theme |
|------------|-----|-------|--------|
| 11 Feb | youth_day | all | National pride, learning habit |
| 20 May | national_day | all | National pride, sessions / progress |
| 5 Sep | back_to_school_sep | student, learner, parent | Term start, book tutor |

Copy variants use learner `learning_path` / goals: **studies**, **career**, **exams** (see `message-catalog.ts`).

To add a date: extend `CALENDAR_CM` array with `month`, `day`, `roles`, `messageFor`, and register cron (no code change needed beyond catalog).
