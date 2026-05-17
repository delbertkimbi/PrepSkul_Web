# SkulMate Backend Readiness Status

Last updated: 2026-04-08

## Scope

This checklist covers production readiness for the SkulMate generation backend:
- `PrepSkul_Web/app/api/skulmate/generate/route.ts`
- related env configuration and persistence wiring

## Current Status

- **API contract:** PASS
  - request supports `fileUrl` or `text`
  - now also supports `sourceFileName` for metadata persistence
- **DB persistence:** PASS
  - game insert stores `source_type`
  - now stores `source_file_name`
  - now stores `source_text_snapshot` for text-sourced generations
- **Client mapping:** PASS
  - Flutter model/service map `source_file_name` and `source_text_snapshot`
- **Timeout/retry safety:** PASS
  - file download has timeout + retry with backoff
  - client-side HTTP calls have explicit timeout handling
- **Billing/limits guardrails:** PASS
  - free-limit checks and credit charging paths are present
  - clear error responses for insufficient credits / limits
- **Debug telemetry safety:** PASS (patched)
  - removed hardcoded localhost debug sink calls
  - debug ingest now env-gated via `SKULMATE_DEBUG_INGEST_URL`

## Required Production Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SKULMATE_OPENROUTER_API_KEY` (primary)
- `OPENROUTER_API_KEY` (fallback, optional but recommended)

Optional debug-only:
- `SKULMATE_DEBUG_INGEST_URL`
- `SKULMATE_DEBUG_SESSION_ID`

## Remaining Risks / Next Actions

- **Rate limiting at API edge:** add/verify IP/user throttling for `/api/skulmate/generate`.
- **Observability:** confirm alerting on:
  - generation failure rate spikes
  - extraction failures
  - 402/limit exhaustion spikes
- **Data retention:** define lifecycle policy for stored `source_text_snapshot`.
- **Staging verification:** run end-to-end staging check for:
  - text upload -> source reopen
  - drag-drop generation -> playable route
  - metadata roundtrip in game library

## Quick Verification Commands

From Flutter app side:
- confirm request includes `sourceFileName` when file/image upload is used
- confirm generated game response includes stored metadata fields after reload

From backend side:
- inspect recent `skulmate_games` rows for non-null `source_file_name` and `source_text_snapshot` where expected

