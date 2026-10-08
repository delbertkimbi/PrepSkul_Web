# Website handoff — 8 October 2026

## Changes in this wrap-up

- Current Blender GLB with connected hands, revised feet, improved book grip,
  and an idle default pose that hides all optional accessories.
- Animation-specific speeds, delayed reveal until the initial clip is applied,
  and safe state changes after the viewer finishes updating.
- Onboarding school-level and location questions use conversational poses.
- Setup copy no longer implies the microphone is already listening.
- Male Algieba speech defaults for English/French and refreshed speech cache key.
- Updated root social-share title/description; custom consent-based voices are
  explicitly described as a planned paid option.

## Verification

- Walked the local onboarding through subject, learning goal, lesson format,
  quiet-reading preference and final offer. No subscription or account created.
- Production Next.js build passed.
- Three GLB regression tests passed (container/clips, default accessory
  visibility, absence of old detached finger objects).
- `git diff --check` passed.
- Existing hybrid-site suite: six pass, six fail. The same six failures reproduce
  on unchanged HEAD 53f1de60 in a separate checkout; they include old copy and
  canvas-mascot expectations.
- Full `tsc --noEmit` is not clean: 198 errors, including stale generated route
  types and unrelated application modules. No diagnostics name the changed
  onboarding, mascot, voice route, layout or Mate page files. The repository's
  production build currently skips type validation; build success is not a clean
  full-project typecheck.

## Scope

Local website work only. No main-branch merge, production deployment or app-ID
change. Native app/device voice testing and exact reference-art fidelity remain
outside this website handoff. Public social-preview caches refresh separately
after deployment.
