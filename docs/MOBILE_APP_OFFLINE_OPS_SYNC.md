# Mobile app — offline operations data sync

This web project is the source of truth for **offline scheduling periods**, **individual sessions**, and **portal flows**. The Flutter/mobile app reads the same Supabase tables via denormalized fields on `tutor_profiles`.

## Unified tutor stats (on + off platform)

| Field | Source | Mobile use |
|-------|--------|------------|
| `tutor_profiles.total_sessions_completed` | DB trigger `refresh_tutor_public_stats` | **Lessons** on learner profile, **Sessions** on tutor dashboard Quick Stats |
| `tutor_profiles.total_students` | Same trigger | **Students** on profile + dashboard |
| `tutor_profiles.offline_tutor_earnings_xaf` | 85% of active `offline_scheduling_periods` | Added to **Active Balance** in PrepSkul Wallet |
| `tutor_earnings` (pending/active) | On-platform Fapshi payments | Wallet pending/active balances |

### Why profile showed 0 lessons before

The mobile app queried `individual_sessions` directly. RLS only allows participants to see their own sessions, so learners browsing tutor profiles always got **0**. Stats now come from `tutor_profiles`, which is publicly readable for approved tutors.

### SQL to run (Supabase)

Apply `PrepSkul_Web/supabase/tutor_public_stats.sql` in the Supabase SQL editor. This creates triggers and backfills all tutors.

### Refresh API (web)

- `GET /api/tutor/public-stats?tutorIds=uuid1,uuid2` — batch read stats (authenticated)
- `POST /api/tutor/public-stats` — refresh one tutor or all (`{ tutorUserId }` or `{ refreshAll: true }`)

Cron example: `POST /api/tutor/public-stats` with `Authorization: Bearer $CRON_SECRET` and `{ "refreshAll": true }`.

## Admin analytics

- `GET /api/admin/analytics/operations-insights?scope=on` — on-platform sessions + paid revenue
- `scope=off` — offline periods
- `scope=combined` — both

## Constants

- Commission: 15% (`PREPSKUL_COMMISSION_RATE`)
- Tutor share: 85% (`TUTOR_EARNINGS_RATE`)

## Mobile files updated

- `lib/core/services/tutor_service.dart` — reads `total_sessions_completed` from `tutor_profiles`
- `lib/features/tutor/screens/tutor_home_screen.dart` — Quick Stats from `tutor_profiles`
- `lib/features/booking/services/session_payment_service.dart` — includes offline earnings in wallet total
