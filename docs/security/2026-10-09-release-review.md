# Security release review — 9 October 2026

Status: work in progress; NOT a production security sign-off. No deployment or key rotation has been performed in this pass.

## Implemented locally

- Restored session, turn, recap, visual, ingest, outcome, speech and transcription backend routes and their tutor libraries from the recovered backend branch.
- Bound JSON request bodies, restricted browser origins, verified bearer identities without cookie fallback after invalid tokens, checked parent-child ownership and constrained uploads to the authenticated account's storage path.
- Added production database-backed rate limiting that fails closed if the migration is unavailable.
- Added authenticated payment initiation/status/expiry routes. Prices come from database records; client amounts are a consent consistency check. Provider credentials remain on the server.
- Added provider-side transaction verification before webhook processing and draft lease/idempotency migration.
- Removed obsolete secret getters and JavaScript eval from the Flutter client configuration. Payment client calls the server instead of the provider.

## Validation

- Focused security/tutor suites: 54 passing tests across seven suites.
- Broader SkulMate suite: 240 passing, 8 failing across two suites (hybrid-site and mate-voice). Failures include historical copy, asset and voice configuration expectations; these require reconciliation, not deletion to obtain a green run.
- Flutter analysis of the three changed client files: no issues.
- Flutter web release build: passed. Dependency WASM compatibility warnings remain; the JavaScript release was produced.
- Built client configuration scan: passed public allowlist and checks against 14 known private values. This is not an exhaustive secret audit.
- Website full TypeScript check is not clean, including generated historical Next output and existing route/type issues. Fixed the Supabase generic parameter mismatch in billing and image credit helper; re-run full validation before release.

## Release blockers and remaining review

1. Signed-in Vercel account does not list the current www.prepskul.com project. Signed-in Supabase CLI account does not list cpzaxdfxbamdsshdgjyg. Firebase access alone cannot deploy the missing API or database schema.
2. Live tutor-memory tables are absent. Review and apply migrations 106–109 with database management access, including migration tests and RLS authorization tests.
3. Previously distributed private credentials require actual provider rotation/revocation and coordinated server updates. Removing values from a new client does not invalidate old ones.
4. Complete payment migration review: legacy transaction reconciliation, failed-attempt retry policy, invoice insert protections, webhook side-effect recovery and atomic earnings allocation. Keep ENABLE_SECURE_FAPSHI_PAYMENTS disabled until tested.
5. Verify configured tutor model availability, signed upload transcription limits, complete endpoint rate-limit coverage and authenticated end-to-end flows.
6. Reconcile broader suite failures, complete website production build, deploy API/schema, smoke-test authenticated tutoring and sandbox payments, then publish Firebase client and push the reviewed release to delbert.

No real payment was initiated during tests. No unrelated app was created; existing store application identifiers are unchanged.
