# PrepSkul Website Update Blueprint

**Status:** Decision-ready UX, content, and implementation brief  
**Prepared:** 13 July 2026  
**Primary objective:** Reposition PrepSkul from “a tutoring website” to a trusted guided-learning ecosystem without making the offer harder to understand or act on.

---

## 1. Executive decision

The website should be rebuilt around one clear promise:

> **PrepSkul helps every learner move from being taught to truly understanding—through expert tutors, AI-powered learning support, and practical programs.**

The current site is clean, usable, and credible at first glance. It clearly communicates home and online tutoring, has responsive layouts, bilingual foundations, useful FAQs, and several working conversion paths. Its main weakness is strategic rather than cosmetic: it presents tutoring as the whole company, while PrepSkul is becoming a broader ecosystem that includes tutoring, SkulMate, PEAP, SBC, school partnerships, tutor development, and community impact.

The update should therefore do three things:

1. Preserve a simple route for parents and learners who need a tutor now.
2. Introduce the larger guided-learning vision in concrete, outcome-focused language.
3. Prove the vision with real products, real programs, real people, and verifiable impact.

This is not a recommendation to make the homepage abstract or investor-oriented. “Building Africa’s educational infrastructure” is a useful internal vision and partnership message, but it is too broad to serve as the primary consumer promise. Visitors should understand the learner benefit before they are asked to admire the ambition.

---

## 2. Evidence reviewed

This blueprint combines:

- The supplied GPT conversation and redesign brief.
- A desktop and mobile review of the live [PrepSkul website](https://www.prepskul.com/en) on 13 July 2026.
- Reviews of the live Programs experience and the available SBC experience.
- The current Next.js implementation, including the homepage, navigation, Programs, About, PEAP, SBC, translations, metadata, footer, and public assets.

The linked ChatGPT project itself required a browser sign-in. The supplied text export contained the detailed recommendations needed for this comparison.

### Important distinction

Claims and numbers in this document that come from the current site are observations, not automatically approved facts. Every statistic, quotation, partner logo, testimonial identity, result, and date must be validated by PrepSkul before it is republished.

---

## 3. Current-state UX assessment

### What already works

| Area | What works | Why it matters |
|---|---|---|
| Visual foundation | Clean typography, restrained blue palette, generous whitespace, rounded cards, modern app mockup | The redesign can evolve the existing system instead of discarding it |
| Immediate service clarity | Visitors quickly understand online, home, and group tutoring | This supports high-intent parents and learners |
| Responsive foundation | The homepage stacks cleanly and CTAs become full-width on mobile | The site is not starting from a broken mobile base |
| Local relevance | Cameroon, GCE, BEPC, Baccalauréat, home tutoring, and FCFA-based services are present | The offer feels grounded in the market |
| Bilingual structure | English and French content architecture already exists | This is essential for Cameroon and future regional growth |
| Conversion availability | “Get Started,” contact, tutor application, app downloads, and program CTAs are visible | Visitors are not left without an action |
| Policy and safety foundation | Privacy, terms, safeguarding, and code of conduct are linked | Strong trust material exists and should become more visible contextually |
| PEAP visibility | PEAP has a homepage showcase with purpose, program details, and imagery | The site has begun moving beyond generic tutoring |
| SBC depth | SBC has its own detailed program experience, curriculum, outcomes, pricing, FAQ, and partner path | This is closer to the productized-program model the new site needs |

### What currently weakens the experience

| Priority | Finding | Evidence and impact | Direction |
|---|---|---|---|
| Critical | SBC still invites registration after its stated deadline | The code says registration closed 30 June 2026, but “Register Now/Today” remains active on 13 July 2026 | Switch the page to the correct live state immediately: late registration, closed, in progress, recap, or next-edition waitlist |
| Critical | Social proof is not reliably credible | Named testimonials use generic/stock-style portraits; some outcomes and timelines appear difficult to verify from the page | Publish only consented, attributable proof with real photos, program/session context, date, and approved wording |
| Critical | Store and social links contain trust-breaking errors | The App Store badge links to Google Play; the LinkedIn link points to an admin dashboard URL | Correct destinations and test every external link |
| High | The homepage promise is generic and tutoring-only | “Connect & Learn at the Right Level/Pace/Stride” and the phone mockup frame PrepSkul as a tutor marketplace | Lead with the understanding gap, then show tutoring, SkulMate, and programs as connected solutions |
| High | The animated hero headline is visually unstable | Desktop and mobile captures showed incomplete words such as “Strid” and “Le”; the DOM initially exposes only a cursor | Use a stable, complete H1. Animation can support the message but should not carry essential meaning |
| High | Programs means “subjects,” not flagship programs | The Programs page lists Mathematics, Sciences, Coding, Art, Music, and exam preparation; PEAP and SBC are not the organizing model | Separate **Tutoring & Subjects** from **Programs & Experiences** |
| High | SkulMate is absent from the public story | The current homepage, primary navigation, and main Programs page do not explain the AI learning product | Add a real SkulMate overview only when approved product visuals and capability claims are available |
| High | The information architecture hides the ecosystem | Navigation contains only Home, About, Programs, Contact, and Get Started | Organize around user needs: Learn, Programs, Schools/Partners, Impact, About |
| High | Impact claims conflict or lack context | Current code displays 600+ learners, 1,000+ sessions, 130+ tutors, and 7+ cities; PEAP says 500+ learners while related copy says “thousands” discovered PrepSkul | Create a single evidence register with definitions, date ranges, sources, and owners |
| Medium | The homepage becomes a long catalogue | Learning modes, subject categories, PEAP, testimonials, FAQ, and CTA appear sequentially without a strong narrative transition | Use a problem → solution → proof → pathways → action sequence |
| Medium | Program imagery is inconsistent | A mix of real-looking photography, illustrations, logos, and contained poster graphics creates different levels of authenticity | Establish an image hierarchy: real PrepSkul photography first, product UI second, branded illustration third |
| Medium | CTA labels and destinations are inconsistent | “Get Started” opens the app, “Start Learning” opens Contact, and program buttons may route to generic Contact | Give every CTA a predictable intent and destination |
| Medium | Footer does not represent the company breadth | It emphasizes quick links, contact, and app downloads but not AI, programs, schools, impact, resources, or press | Rebuild footer around the new information architecture |
| Medium | About lacks the human founding reason | The page has story, mission, and values, but not the founder’s personal motivation suggested in the notes | Add a concise, verifiable founder story with a real portrait and timeline |
| Medium | SEO metadata is still tutoring-only | Root title is “Find Trusted Home and Online Tutors in Cameroon”; localized metadata defaults to tutoring language | Create page-specific metadata aligned to each intent while retaining high-value tutoring search terms |
| Medium | Technical SEO implementation needs correction | The locale layout sets the canonical to `/{locale}` for all nested pages; the Open Graph fallback uses a square logo as a 1200×630 image; Google verification is a placeholder | Give every page its own canonical, title, description, social image, and valid verification data |
| Medium | Accessibility details are incomplete | Mobile menu lacks an exposed expanded state; widespread motion needs consistent reduced-motion handling | Add `aria-expanded`, active-page state, focus management, reduced-motion behavior, and keyboard testing |

---

## 4. Positioning and messaging system

### Brand category

**Guided-learning ecosystem**

This is more ownable than “tutoring marketplace” and easier for a parent to understand than “educational infrastructure.” It can hold the current and future portfolio without overclaiming.

### Core message

**Bridging classroom teaching and individual understanding.**

This is the strongest idea from the GPT conversation. It identifies a familiar problem, creates space for both human and AI support, and does not depend on one product.

### Recommended homepage message

**Headline**  
From classroom teaching to real understanding.

**Supporting copy**  
PrepSkul combines trusted tutors, personalized learning tools, and practical programs to help every learner understand difficult concepts, build confidence, and keep progressing.

**Primary CTA**  
Find Learning Support

**Secondary CTA**  
Explore Programs

**Tertiary text link, when SkulMate is ready**  
Meet SkulMate

### Audience-specific value propositions

| Audience | Main question | PrepSkul answer | Primary action |
|---|---|---|---|
| Parent | “Can I find safe, effective support for my child?” | Verified tutors, tailored plans, progress visibility, safeguarding | Find a Tutor |
| Learner | “Can someone help me finally understand?” | Tutor guidance, explanations, practice, programs, and AI support | Start Learning |
| School | “Can PrepSkul improve support beyond the classroom?” | Structured programs, tutor capacity, SkulMate, learner insight | Partner With Us |
| Sponsor/NGO | “Is the impact real and scalable?” | Program evidence, communities reached, stories, reports | View Impact / Partner |
| Tutor | “Can I grow and earn as an educator?” | Tutor opportunities, training, tools, community, standards | Become a Tutor |

### Tone rules

- Lead with outcomes: understand, improve, build, prepare, progress.
- Use short, direct sentences and locally familiar language.
- Avoid unqualified superlatives such as “best,” “world-class,” or “Africa’s leading.”
- Avoid presenting roadmap concepts as available features.
- Explain AI through learner tasks, not technical terminology.
- Do not use “infrastructure” as the main consumer headline; reserve it for About, Schools, Impact, and partnership materials.
- Use “Africa” as ambition and direction, while accurately stating where services are currently available.

---

## 5. Recommended information architecture

The GPT proposal contains too many top-level items. A large navigation would increase choice anxiety and be difficult on mobile. Use a compact structure with grouped menus.

### Primary navigation

1. **Learn**
   - Find a Tutor
   - Home Tutoring
   - Online Learning
   - Group Learning
   - Meet SkulMate
2. **Programs**
   - Programs Overview
   - Summer Build Camp
   - PEAP
   - Workshops and School Programs
3. **For Schools**
4. **Impact**
5. **About**
   - Our Story
   - Team
   - Safeguarding
   - Contact

**Utility actions:** EN/FR, Become a Tutor, Get Started.

### Footer expansion

- Learn: tutoring modes, subjects, SkulMate, app.
- Programs: SBC, PEAP, workshops, program archive.
- Organizations: schools, NGOs, sponsors, community partners.
- Company: About, team, impact, careers, contact.
- Resources: articles, parent guides, exam resources, FAQs.
- Trust: safeguarding, code of conduct, privacy, terms.
- Media: press, brand/media kit, social channels.

### Route plan

| Route | Purpose | Release |
|---|---|---|
| `/[locale]` | Ecosystem homepage | Phase 1 |
| `/[locale]/tutoring` | Tutoring overview and mode selection | Phase 1 |
| `/[locale]/programs` | Flagship programs and evergreen archive | Phase 1 |
| `/[locale]/programs/peap` | PEAP evidence, outcomes, gallery, next action | Phase 1 |
| `/sbc` or `/[locale]/programs/sbc` | SBC live-state page and archive | Phase 1 |
| `/[locale]/skulmate` | Product story, how it works, product visuals, availability | Phase 2, after claim review |
| `/[locale]/schools` | School problems, solutions, delivery model, partnership CTA | Phase 2 |
| `/[locale]/impact` | Metrics, locations, program results, reports, stories | Phase 2 |
| `/[locale]/stories` | Verified learner, parent, tutor, and partner stories | Phase 2 |
| `/[locale]/resources` | Searchable resource hub | Phase 3 |
| `/[locale]/about` | Founder story, mission, team, values, timeline | Phase 1 |

The public marketing routes should remain distinct from authenticated product routes such as learner, tutor, admin, Academy, and Ticha dashboards.

---

## 6. Homepage experience specification

The homepage should tell one story, not display every service with equal emphasis.

### 1. Header

- Compact navigation from the proposed architecture.
- Primary CTA should state the action, preferably **Find Support** or **Get Started** after destination testing.
- Secondary utility link: **Become a Tutor**.
- Mobile menu must expose expanded state, trap focus while open, close on navigation, and keep language selection accessible.

### 2. Hero: promise and pathways

- Use one static, complete H1.
- Show authentic PrepSkul learners, tutors, or a carefully art-directed ecosystem collage.
- Provide one primary and one secondary CTA; do not make three large buttons compete.
- Add a small trust line below the CTAs, once validated: location coverage, safeguarding, tutor verification, or learner count.
- Do not place a tutoring-only app mockup as the dominant visual if the copy claims an ecosystem.

### 3. The problem: teaching is not always understanding

Use a brief, human explanation:

> A classroom lesson must move at one pace. Learners do not. When a concept is missed, the gap often follows the learner into the next topic.

Avoid dramatic, unsupported national statistics. A clear observation is enough.

### 4. The PrepSkul learning loop

Show a simple four-stage model:

1. **Understand the learner** — goals, level, challenge, context.
2. **Guide the next step** — tutor, program, or learning tool.
3. **Practice with purpose** — explanation, exercises, projects, revision.
4. **Track progress** — learner confidence, mastery, and next recommendations.

This is more coherent than a list of Tutors → AI → Programs → Schools → Community, which describes the company but not the learner experience.

### 5. Choose your pathway

Use three outcome-led cards:

- **Personalized Tutoring** — Find the right tutor for academic or skills support.
- **Programs and Experiences** — Build, revise, collaborate, and prepare through SBC, PEAP, and workshops.
- **SkulMate** — Revisit lessons, ask questions, and practise at the right level. Label as **Coming soon**, **Pilot**, or **Available** based on the real product state.

Each card must have a distinct destination and action.

### 6. Meet SkulMate

This section should be included only with approved product claims and genuine interface or hardware visuals.

Recommended narrative:

- What problem it solves.
- What the learner does.
- What happens next.
- What the learner or parent gains.

Example five-step flow:

1. Capture or add a lesson.
2. Turn it into organized learning material.
3. Ask for explanations at the learner’s level.
4. Practise with questions, flashcards, or revision activities.
5. See progress and identify the next learning gap.

Do not publish speculative features such as automatic classroom recording, offline AI, parent updates, teacher analytics, or real-time understanding unless they exist, are approved for public disclosure, and meet consent/privacy requirements.

### 7. Programs as proof

Feature SBC and PEAP as evidence of delivery, not just advertisements.

Each card should show:

- A real program image.
- The problem or goal.
- Audience and location.
- Current state: Open, Closed, In Progress, Completed, or Waitlist.
- One validated outcome.
- “View the program” rather than a generic “Get Started.”

### 8. Impact and trust

Use no more than four validated figures on the homepage. Every figure should have a definition and “as of” date in the underlying content record.

Add partner/school logos only with permission. Link to a complete Impact page for methodology, stories, and reports.

### 9. Real stories

Use two or three strong stories rather than a carousel of generic quotations. Each should include:

- Real, consented image or approved video.
- Full or first name according to consent.
- Role, school/program, city, and date where appropriate.
- Specific change or result.
- Optional link to the full story.

If imagery cannot be consented, use a clearly labeled anonymous story without a stock portrait that implies identity.

### 10. Resources preview

Show three useful resources after the core commercial story is stable. Prioritize evergreen local intent:

- GCE and exam preparation.
- Parent guide to choosing a tutor.
- Study methods and learning gaps.
- Safe and responsible AI for learning.

### 11. Final CTA

Offer audience-aware actions:

- Find learning support.
- Explore programs.
- Partner as a school or organization.

Avoid ending every journey at a generic contact form.

---

## 7. Page-level requirements

### Tutoring

- Explain online, home, and group modes.
- Let visitors filter or state level, subject, location, and schedule before account creation where possible.
- Explain tutor verification, matching, pricing range, rescheduling, progress reporting, and safeguarding.
- Use real tutor profiles with qualifications and verified metrics.
- Clarify whether the website sends visitors to the app, WhatsApp, or a coordinator—and use that route consistently.

### Programs overview

- Present PEAP, SBC, workshops, and school programs as products.
- Keep subjects and tutoring categories on the Tutoring page.
- Give every program a status badge and edition/year.
- Provide an archive so completed programs continue building trust.
- Allow visitors to filter by age/level, goal, delivery mode, location, and status when the catalogue grows.

### SBC

- Correct the expired 30 June 2026 deadline state immediately.
- Preserve the strong curriculum, outcomes, pricing, FAQ, and partner content already implemented.
- Replace generic hero imagery with real SBC photography as soon as it exists.
- During the program, switch the primary action to updates, gallery, or next-edition interest.
- After the program, publish projects, Demo Day, mentors, attendance, outcomes, testimonials, and an approved photo/video gallery.
- Maintain edition URLs or an archive so future SBC pages do not overwrite past evidence.

### PEAP

- Create a dedicated evergreen page.
- Explain the examination challenge, target learners, delivery method, topics, tutors, schedule, and access model.
- Clearly label the edition and current state.
- Validate the 500+ learner figure and remove or substantiate “thousands.”
- Add real session images, class clips, subject coverage, attendance methodology, and verified learner outcomes.
- Replace the current generic “Get Started” with **View Results**, **Join the Next Edition**, or the correct live action.

### SkulMate

- Treat it as a product, not a decorative AI section.
- State the product stage prominently.
- Show real product screens/renders and label conceptual imagery as concept where necessary.
- Demonstrate one complete learner task from input to outcome.
- Explain consent, data handling, recording behavior, and school/parent controls before promoting classroom capture.
- Separate “Available now” from “On the roadmap.”
- Use early-access or school-pilot CTAs only if there is an operational follow-up process.

### For Schools and Partners

- Lead with school problems: differentiated support, learning gaps, revision, teacher capacity, visibility, and digital access.
- Offer defined engagement models instead of a generic partnership request.
- Show safeguarding, delivery process, responsibilities, support, and reporting.
- Add a downloadable one-page overview only after content and contact ownership are approved.

### Impact

- Provide metric definitions, time range, data source, and last-updated date.
- Show cities/communities only when geographic data is accurate and safe to publish.
- Combine numbers with program evidence and stories.
- Offer annual or program reports when available.
- Distinguish learners registered, learners attended, learners completed, sessions delivered, and people reached.

### About

- Add “Why PrepSkul exists” before the generic mission and values.
- Tell the founder story concisely and factually.
- Use real team photography and roles.
- Show a short company timeline and the move from tutoring to guided learning.
- Connect mission to active products rather than leaving it abstract.

---

## 8. Content and asset requirements

### Content evidence register

Create a maintained dataset with these fields:

| Field | Example |
|---|---|
| Claim | “500+ PEAP learners” |
| Exact definition | Unique registered learners / attendees / completions |
| Period | March–April 2026 |
| Source | Registration export, attendance logs, survey |
| Owner | Program lead |
| Approved wording | Public-facing copy |
| Last verified | Date |
| Publication status | Approved / pending / retired |

No statistic should be hard-coded in multiple components without one canonical content source.

### Photography shot list

Prioritize a small, high-quality real library:

1. Tutor and learner in a genuine home session.
2. Online tutoring session with both sides of the experience.
3. PEAP class, tutor explanation, learner collaboration, and revision materials.
4. SBC building, mentoring, teamwork, prototype, presentation, and Demo Day.
5. Founder and team portraits.
6. Parent conversation or approved parent story.
7. School partnership and classroom context.
8. SkulMate product in use, plus clean UI captures/renders.

For every asset, store consent scope, names/anonymous status, program, date, location, alt-text description, photographer, and usage rights.

### Product visuals

- Use real screens whenever possible.
- Do not show functionality that users cannot access.
- Use captions such as “Product concept,” “Pilot interface,” or “Current app” when status could be misunderstood.
- Keep interface text large enough to understand on mobile.

### Content missing before a full launch

- Approved SkulMate capability and availability sheet.
- Verified impact numbers and definitions.
- Real testimonials with consent records.
- Founder story and timeline.
- Partner/school logo permissions.
- PEAP program archive assets.
- SBC current-state decision and post-program content plan.
- School partnership offer and responsible contact owner.
- Correct App Store availability/link status.

---

## 9. Design system direction

### Keep

- PrepSkul blue as the primary brand anchor.
- Poppins/Lato or a similarly friendly, readable pairing.
- White space, clear grids, soft corners, and restrained elevation.
- Local African learner context.
- English/French parity.

### Improve

- Establish a type scale and reduce one-off sizes.
- Use stable headings rather than typewriter-dependent meaning.
- Create consistent components for program status, proof, quotes, galleries, product flows, and CTA bands.
- Use one photography treatment across the main brand while allowing programs a controlled accent system.
- Keep glass effects and gradients secondary to legibility.
- Prefer meaningful motion: reveal a process, state, or relationship. Avoid constant decorative motion.
- Respect `prefers-reduced-motion` globally.

### Visual hierarchy

1. Real PrepSkul photography.
2. Real product UI and hardware visuals.
3. Data visualization and program artifacts.
4. Branded illustrations.
5. Generic stock photography only as a temporary, clearly managed fallback.

---

## 10. Conversion model

The site currently mixes app, contact, and program destinations under similar CTA labels. Introduce a CTA contract:

| CTA | Destination | Use |
|---|---|---|
| Find a Tutor | Tutor discovery or guided intake | High-intent parent/learner |
| Start Learning | Short pathway selector | Visitors unsure which solution fits |
| Explore Programs | Programs overview | Program discovery |
| Join the Waitlist | Edition-specific form | Closed/upcoming program |
| Meet SkulMate | Product page | AI product education |
| Request Early Access | Operational SkulMate form | Only when follow-up exists |
| Partner With Us | Schools/partners intake | Institutional leads |
| Become a Tutor | Tutor application | Educator acquisition |

### Recommended “Start Learning” pathway

Ask no more than four questions:

1. Who needs support?
2. What is the goal?
3. What level/age group?
4. Preferred mode/location?

Then recommend a tutor, program, or product path. Do not force account creation before explaining the recommendation.

---

## 11. Accessibility, performance, and SEO acceptance criteria

### Accessibility

- One descriptive H1 per page.
- Complete essential text exists without animation.
- Keyboard access and visible focus for every interaction.
- Mobile menu reports expanded state and manages focus.
- Color contrast meets WCAG 2.2 AA.
- Real alt text; decorative assets use empty alt text.
- Captions/transcripts for meaningful video.
- Forms have labels, inline errors, summaries, and recovery guidance.
- Carousels, counters, and motion respect reduced-motion settings.
- English and French pages use the correct language attribute.

### Performance

- Target Core Web Vitals at the 75th percentile: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
- Reserve dimensions for images, mockups, embeds, and animated content.
- Use responsive images and modern formats.
- Lazy-load below-the-fold galleries and video posters; do not autoplay heavy video on mobile.
- Keep client-side animation libraries out of static sections where CSS or server rendering is sufficient.
- Test on an average Android device and constrained mobile connection, not desktop only.

### SEO and discoverability

- Page-specific titles, descriptions, canonical URLs, Open Graph images, and structured data.
- Fix canonical generation so nested pages do not all point to `/en` or `/fr`.
- Replace placeholder verification metadata.
- Use Article, FAQ, Event, Course, Organization, and Breadcrumb schema only where the visible page supports it.
- Give past program editions durable, indexable pages.
- Preserve tutoring search intent while expanding into PEAP, SBC, exam support, schools, and guided learning.
- Add internal links from resource content to the relevant service or program, not only to Contact.

---

## 12. Delivery roadmap

### Phase 0 — credibility repairs (1–3 days)

- Correct SBC registration state and deadline messaging.
- Fix App Store and LinkedIn destinations.
- Audit every statistic and testimonial; remove anything not currently defensible.
- Replace misleading stock portraits attached to named testimonials.
- Align CTA labels with destinations.
- Fix the unstable hero H1 and animated counter fallback.

### Phase 1 — foundation and primary journey (2–4 weeks)

- Approve positioning and copy system.
- Build the new header, footer, homepage, Tutoring, Programs overview, PEAP, and About pages.
- Integrate SBC into the main PrepSkul ecosystem while preserving its program identity.
- Establish reusable program, proof, story, gallery, and CTA components.
- Implement route-specific SEO and analytics events.
- Complete EN/FR content and accessibility review before launch.

### Phase 2 — product and institutional trust (2–4 weeks)

- Launch SkulMate after product-claim, privacy, and visual review.
- Launch Schools/Partners and Impact.
- Add verified stories, partner proof, and reports.
- Introduce the guided “Start Learning” pathway.

### Phase 3 — authority and growth (ongoing)

- Launch resource hub and editorial workflow.
- Publish program archives, case studies, and annual impact updates.
- Test homepage messaging and CTA routes.
- Add search only when the content library is large enough to justify it.

---

## 13. Measurement plan

Track success by journey rather than page views alone.

| Goal | Primary metric | Supporting metrics |
|---|---|---|
| Clarify the offer | Pathway selection rate | Scroll to pathway, navigation usage, bounce by landing page |
| Grow tutoring | Qualified tutoring starts | Intake completion, tutor profile views, app handoff success |
| Grow programs | Program-detail engagement | Waitlist/registration completion, gallery/video engagement |
| Establish SkulMate | Product understanding and qualified interest | How-it-works completion, early access/school pilot leads |
| Build institutional trust | Qualified school/partner leads | Impact-page visits, case-study/report engagement |
| Improve credibility | Proof interaction and conversion lift | Story views, partner proof engagement, assisted conversions |

Analytics events should include CTA name, page, audience/path, destination, locale, and program edition. Do not record sensitive learner information in analytics.

---

## 14. Content governance

Assign an owner and review date to:

- Homepage facts and CTAs.
- Program status and edition dates.
- Pricing.
- SkulMate capabilities and roadmap.
- Impact metrics.
- Testimonials and consent.
- Partner logos.
- Legal and safeguarding content.
- English/French parity.

Program pages need state transitions, not manual rediscovery each year:

**Upcoming → Registration open → Registration closed → In progress → Completed/recap → Next-edition waitlist**

The page CTA, dates, structured data, banner, and form availability should all change from the same program-status source.

---

## 15. Definition of done

The first redesign release is complete when:

- A first-time visitor can explain PrepSkul in one sentence after viewing the hero and next two sections.
- A parent can find tutoring support without learning company jargon.
- SBC and PEAP have accurate current states and durable program pages.
- SkulMate is either clearly explained with approved evidence or intentionally deferred—not vaguely implied.
- All published metrics and stories have sources, owners, and approval.
- Every primary CTA has one predictable destination.
- English and French journeys are complete.
- Mobile, keyboard, reduced-motion, screen-reader, performance, and broken-link checks pass.
- Route-specific metadata, canonical URLs, sitemap entries, and social previews are verified.
- The site communicates an ecosystem while still converting users for today’s available services.

---

## Final product principle

The strongest future PrepSkul website will not look advanced merely because it uses gradients, motion, hardware renders, or AI language. It will feel advanced because it makes a complex ecosystem simple, proves that the work is real, and always gives each visitor a clear next step.

