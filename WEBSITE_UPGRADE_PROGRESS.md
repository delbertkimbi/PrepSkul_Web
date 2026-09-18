# PrepSkul Website Upgrade Progress

**Updated:** 15 July 2026  
**Current slice:** Phase 0 credibility repairs + Phase 1 public foundation

## Completed

- Repositioned the homepage around PrepSkul’s message: **bridging classroom teaching and individual understanding**.
- Replaced tutor-marketplace messaging with a connected system: human guidance, guided programs, and the SkulMate learning companion.
- Rebuilt the hero with PrepSkul’s existing branded tutor-and-learner asset and the message **“From teaching to understanding.”**
- Simplified the public design into a white-first system with navy typography, restrained blue accents, quiet grey section changes, simple borders, and minimal visual effects.
- Removed decorative entrance animation, floating interface elements, background patterns, scroll reveals, and parallax from the core public pages so the message and real imagery lead.
- Replaced the animated/typewriter H1 with a stable, accessible headline.
- Added the learner-first flow: Understand → Guide → Practise → Progress.
- Added distinct pathways for tutoring, programs, and SkulMate.
- Added a clearly labeled SkulMate concept section with product-stage disclosure.
- Corrected the SkulMate classroom visual: no phone, all learners face the teacher, and the wristband is the only personal device.
- Added program status labels for SBC and PEAP.
- Closed SBC registration across the SBC header, landing page, footer, and registration route.
- Rebuilt the Programs page around flagship programs rather than subject categories.
- Rebuilt the Programs overview in the new guidance-layer design system, using real program artifacts and a documented design model.
- Added a bilingual, evergreen PEAP 2026 archive with program purpose, delivery sequence, verified artifacts, future-interest routing, canonical URLs, and social metadata.
- Added a school/organization partnership pathway.
- Added a dedicated bilingual Schools and Partners page with engagement models, partnership process, safeguarding boundaries, institutional audiences, and route-specific SEO.
- Replaced generic testimonials and unsupported homepage statistics with trust, safeguarding, and evidence principles.
- Rebuilt the primary navigation and mobile menu with `aria-expanded` support.
- Rebuilt the footer around Learn, Programs, Company, and Trust.
- Removed the broken App Store promotion until a valid iOS destination exists.
- Replaced the LinkedIn admin-dashboard URL with a public company URL.
- Updated English and French positioning, homepage content, navigation, Programs content, footer content, and metadata.
- Replaced the square-logo social preview with the existing branded PrepSkul tutor-and-learner visual.
- Removed the incorrect locale-root canonical inherited by every nested page.
- Removed placeholder Google verification metadata.

## Verification

- Production build: **passed** with Next.js 15.5.9.
- Changed-file TypeScript check: **no errors reported**.
- Full repository typecheck: still fails on pre-existing admin, API, Supabase, Ticha, test declaration, and generated-type issues outside this website slice.
- Local browser QA: completed for the homepage, Programs, PEAP, and Schools journeys at 1280px desktop and 390px mobile widths; no horizontal overflow found.

## Current public architecture

- Homepage: ecosystem story and guided pathways.
- Programs: flagship programs, program status, and future program lines.
- PEAP: evergreen 2026 program archive and future-interest pathway.
- Schools: partnership models, process, trust boundaries, and institutional inquiry route.
- SBC: complete program page with registration closed for the 2026 deadline.
- Existing About, Contact, Tutors, safeguarding, legal, and app journeys remain available.

## Next implementation slice

1. Dedicated SkulMate product page with approved capability and privacy boundaries.
2. Impact page backed by an approved evidence register.
3. About-page founder story and team section after factual copy and real photography are supplied.
4. Contact-path routing so tutoring, SkulMate, PEAP, and partnership inquiries receive different forms and follow-up ownership.
5. Cross-page accessibility, keyboard, performance, and broken-link review.
