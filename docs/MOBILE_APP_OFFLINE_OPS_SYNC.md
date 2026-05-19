# Mobile app — offline operations data (planned)

This web project is the source of truth for **offline scheduling periods**, **individual sessions**, and **portal flows**. The Flutter/mobile app will consume the same Supabase data and selected APIs.

## Planned sync targets

| Web data | Mobile use |
|----------|------------|
| `individual_sessions` (completed / evaluated) | Tutor **total sessions** on profile (merge with on-platform session count) |
| `offline_scheduling_periods.expected_period_revenue_xaf` + `operation_state` | Tutor **earnings** display (85% of active period revenue; 15% PrepSkul commission) |
| `session_tutor_completion_reports` | Attendance / completion signals |
| `session_learner_feedback` | Ratings surfaced on tutor discovery |

## Constants

- Commission: `PREPSKUL_COMMISSION_RATE` (default 15%) — `lib/offline-ops-constants.ts`
- Tutor share: 85% (`TUTOR_EARNINGS_RATE`)

## APIs to reuse (non-exhaustive)

- Admin analytics: `GET /api/admin/analytics/operations-insights?scope=off`
- Portal (token-based): `/api/portal/session/context`, reschedule request/respond
- Session portal URLs: `buildSessionPortalUrls()` in `lib/services/session-portal-access.ts`

When the local mobile repo path is shared, map existing tutor profile models to these fields and define a single `total_sessions` and `offline_earnings_xaf` computed in the app or via a small RPC.
