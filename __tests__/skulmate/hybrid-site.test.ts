import { isHarvestPack, flattenHarvestCorpus } from '@/lib/skulmate/harvest-schema'
import { HARVEST_PACKS } from '@/lib/skulmate/harvest-packs'
import { aliveCopy } from '@/lib/marketing/alive-copy'
import { packById, DEFAULT_REGION_ID } from '@/lib/skulmate/region-packs'
import { getTranslations } from '@/lib/translations'
import { fallbackNotebook } from '@/lib/marketing/notebook'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('harvest schema', () => {
  it('accepts a Cameroon-first pack without locking the tutor to one country', () => {
    const pack = {
      version: 1 as const,
      source: 'test',
      regionId: 'cm',
      notes: 'Calibration only',
      units: [
        {
          id: 'u1',
          regionId: 'cm',
          systemId: 'cm-francophone',
          levelIds: ['cm1'],
          subjectId: 'maths',
          topic: 'Place value',
          language: 'both' as const,
          misconceptions: ['tens and ones swapped'],
          sequence: ['show 34 with sticks'],
          examples: ['34 plantains'],
          examHooks: [],
          transfer: ['market stall'],
          corpus:
            'A CM1 learner in Yaoundé often mixes tens and ones when they write 34 as 43. Ask them to make the number with sticks before writing. Do not tell the tutor they may only teach Cameroon.',
        },
      ],
    }
    expect(isHarvestPack(pack)).toBe(true)
    expect(flattenHarvestCorpus(pack)[0]).toMatch(/plantains/)
    expect(HARVEST_PACKS).toEqual([])
  })
})

describe('PrepSkul marketing copy', () => {
  it('treats PrepSkul as the product and SkulMate as the in-app experience', () => {
    const copy = aliveCopy('en')
    const blob = [
      copy.hero.title,
      copy.hero.subtitle,
      copy.science.title,
      copy.science.body,
      copy.cta.title,
      copy.faq.map((item) => item.q + ' ' + item.a).join(' '),
    ].join(' ')

    expect(copy.hero.title).toMatch(/right level/)
    expect(copy.hero.title).toMatch(/beauty in getting there/)
    expect(copy.hero.titleLead).toMatch(/right level/)
    expect(copy.hero.titleRest).toMatch(/beauty in getting there/)
    expect(copy.hero.title).not.toMatch(/Talk it through/)
    expect(copy.hero.title).not.toMatch(/person when you want one/)
    expect(copy.hero.title).not.toMatch(/actually teaches/)
    expect(copy.hero.subtitle).toMatch(/PrepSkul helps you make sense/)
    expect(copy.hero.subtitle).toMatch(/practise with confidence/)
    expect(copy.hero.subtitle).toMatch(/find the right tutor/)
    expect(copy.hero.subtitle).not.toMatch(/browse tutors here, then book or request in the app/)
    expect(aliveCopy('fr').hero.subtitle).toMatch(/PrepSkul/)
    expect(copy.hero.statLine).toMatch(/11,280\+/)
    expect(copy.hero.statLine).toMatch(/sessions tutored/)
    expect(copy.hero.statLine).toMatch(/4\.8\/5/)
    expect(copy.hero.statLine).toMatch(/minutes tutored/)
    expect(copy.hero.statLine).not.toMatch(/600\+/)
    expect(copy.hero.statLine).not.toMatch(/35 cities/)
    expect(copy.hero.statLine).not.toMatch(/5,639/)
    expect(copy.hero.statLine).not.toMatch(/104,169/)
    expect(copy.hero.statLine).not.toMatch(/GCE/)
    expect(copy.hero.stats).toHaveLength(3)
    expect(copy.hero.stats[0]?.start).toBe(11280)
    expect(copy.hero.stats[1]?.start).toBe(4.8)
    expect(copy.hero.stats[2]?.start).toBe(174360)
    expect(copy.hero.stats[2]?.liveMs).toBeGreaterThan(0)
    expect(copy.hero.stats[0]?.liveMin).toBeGreaterThan(0)
    expect(copy.hero.stats[2]?.liveMax).toBeGreaterThan(copy.hero.stats[2]?.liveMin || 0)
    expect(copy.hero.stats[0]?.liveMin).not.toBe(copy.hero.stats[2]?.liveMin)
    expect(copy.hero.stats.every((stat) => !/GCE|BEPC|Bac/i.test(stat.value + stat.label))).toBe(true)
    expect(copy.audienceKicker).toMatch(/Students, parents, and teachers/)
    expect(copy.audienceKicker).not.toMatch(/WHO PREPSKUL/)
    expect(copy.hero.primary).not.toMatch(/Try Mate/)
    expect(blob).toMatch(/PrepSkul is the tutoring product/)
    expect(blob).toMatch(/feature of PrepSkul/)
    expect(blob).not.toMatch(/PrepSkul is Mate/)
    expect(copy.science.title).toMatch(/remembers your next step/)
    expect(copy.science.title).not.toMatch(/tutor in the app/)
    expect(copy.tools.every((tool) => tool.tile.startsWith('/onboard/art/'))).toBe(true)
    expect(copy.audiences.every((aud) => !aud.image.startsWith('/marketing/'))).toBe(true)
    expect(copy.notebook.title).toMatch(/notebook/i)
    expect(copy.toolsTitle).toMatch(/lesson with Mate/)
    expect(copy.tools.map((tool) => tool.body).join(' ')).not.toMatch(/frozen chat/)
    expect(copy.tools.map((tool) => tool.body).join(' ')).not.toMatch(/linear undo/)
    expect(copy.tools.find((tool) => tool.id === 'talk')?.body).toMatch(/already listening/)
    expect(copy.tools.find((tool) => tool.id === 'practice')?.body).toMatch(/Start there instead/)
    expect(copy.tools.find((tool) => tool.id === 'subjects')?.body).toMatch(/primary school to university/)
    expect(copy.split.title).toMatch(/Mate first/)
    expect(copy.split.body).not.toMatch(/Next\.js|Supabase|tutor_profiles/)
    expect(copy.find.lead).not.toMatch(/tutor_profiles|database/)
    expect(copy.cta.body).not.toMatch(/in the app/)
  })

  it('talks about tutors and lessons, not site-versus-app plumbing', () => {
    const copy = aliveCopy('en')
    expect(copy.find.lead).toMatch(/Profiles and availability change/)
    expect(copy.find.request).toMatch(/Request a tutor/)
    expect(copy.find.bookInApp).toMatch(/Book a class/)
    expect(copy.split.body).toMatch(/human hour/)
    expect(copy.hybrid.title).toMatch(/sit with you/)
    expect(copy.hybrid.body).toMatch(/Live online, or at the table/)
    expect(copy.hybrid.body).not.toMatch(/same database/)
    expect(copy.hybrid.title).not.toMatch(/Book them in the app/)
    const how = copy.faq.find((item) => item.q.includes('human tutor'))
    expect(how?.a).toMatch(/request a match/)
    expect(how?.a).not.toMatch(/WebRTC|tutor_profiles|database/)
    const withPerson = copy.faq.find((item) => item.q.includes('as well as Mate'))
    expect(withPerson?.a).toMatch(/hold the week/)
  })

  it('covers subjects, ages, always-on talk, and hybrid tutors', () => {
    const faq = aliveCopy('en').faq.map((item) => item.q + ' ' + item.a).join(' ')
    expect(faq).toMatch(/SIL/)
    expect(faq).toMatch(/University/)
    expect(faq).toMatch(/no tap-to-talk/i)
    expect(faq).toMatch(/request/)
    expect(faq).toMatch(/match you/)
    expect(faq).not.toMatch(/WebRTC/)
    expect(faq).not.toMatch(/only teach Cameroon/)
    expect(DEFAULT_REGION_ID).toBe('cm')
    expect(packById('cm').systems.length).toBe(2)
  })

  it('keeps the homepage hero in PrepSkul voice', () => {
    const hero = getTranslations('en').home.hero
    expect(hero.title).toMatch(/right level/)
    expect(hero.title).toMatch(/beauty in getting there/)
    expect(hero.title).not.toMatch(/Talk it through/)
    expect(hero.title).not.toMatch(/actually teaches/)
    expect(hero.getStarted).toBe('Get started')
    expect(hero.subtitle).toMatch(/SkulMate helps you understand/)
    expect(hero.subtitle).toMatch(/trusted tutor/)
    expect(hero.subtitle).toMatch(/next step/)
  })
})

describe('notebook SEO blocks', () => {
  it('ships three Cameroon-first notes with unique slugs and tiles', () => {
    const posts = fallbackNotebook('en')
    expect(posts).toHaveLength(3)
    expect(new Set(posts.map((post) => post.slug)).size).toBe(3)
    expect(posts.every((post) => post.tile.startsWith('/onboard/art/'))).toBe(true)
    expect(posts.map((post) => post.title + post.body).join(' ')).toMatch(/SkulMate/)
    expect(posts.map((post) => post.body).join(' ')).toMatch(/PrepSkul/)
    expect(fallbackNotebook('fr')).toHaveLength(3)
  })
})

describe('hybrid marketing chrome', () => {
  it('hides notebook from the homepage and product nav', () => {
    const page = readFileSync(join(process.cwd(), 'app/[locale]/page.tsx'), 'utf8')
    const header = readFileSync(join(process.cwd(), 'components/header.tsx'), 'utf8')
    const footer = readFileSync(join(process.cwd(), 'components/footer.tsx'), 'utf8')
    expect(page).not.toMatch(/listNotebookPosts/)
    expect(header).not.toMatch(/\/notebook/)
    expect(footer).not.toMatch(/\/notebook/)
    expect(footer).toMatch(/ps-footer/)
    expect(footer).toMatch(/ps-navy/)
    expect(footer).toMatch(/ps-footer-tear/)
    expect(footer).not.toMatch(/bg-\[#fffdf7\]/)
    expect(footer).not.toMatch(/PaperSheet/)
    expect(footer).toMatch(/\/mate/)
    expect(footer).not.toMatch(/Become a PrepSkul Tutor/)
    const notFound = readFileSync(join(process.cwd(), 'app/not-found.tsx'), 'utf8')
    expect(notFound).toMatch(/PaperNotFound/)
    const paper404 = readFileSync(join(process.cwd(), 'components/marketing/paper-not-found.tsx'), 'utf8')
    expect(paper404).toMatch(/This page is not here/)
    expect(paper404).toMatch(/PrepMate/)
    const matePaint = readFileSync(join(process.cwd(), 'components/onboard/prep-mate.tsx'), 'utf8')
    expect(matePaint).toContain('<SkulMate3D')
    expect(matePaint).toContain('state={mood === "talk" ? "talk" : pose}')
  })

  it('uses the agreed hero and contextual real 3D Mate states', () => {
    const home = readFileSync(join(process.cwd(), 'components/marketing/alive-home.tsx'), 'utf8')
    const mate = readFileSync(join(process.cwd(), 'components/onboard/prep-mate.tsx'), 'utf8')
    const matePage = readFileSync(join(process.cwd(), 'app/[locale]/mate/page.tsx'), 'utf8')
    expect(home).toContain('/images/prepskul-learning-hero.webp')
    expect(home).toMatch(/px-4.*sm:px-6/)
    expect(home).toContain('ps-live-stats')
    expect(home).toContain('<LandingMate scene="welcome"')
    expect(home).toContain('<LandingMate scene="learn"')
    expect(home).toContain('<LandingMate scene="celebrate"')
    expect(mate).toContain('<SkulMate3D')
    expect(matePage).toContain('state="teaching"')
    expect(home).not.toMatch(/mate-(wave|talk|cheer)\.png/)
  })

  it('keeps programs and contact on the hybrid paper site, not leftover catalog pages', () => {
    const programs = readFileSync(join(process.cwd(), 'app/[locale]/programs/page.tsx'), 'utf8')
    const contact = readFileSync(join(process.cwd(), 'app/[locale]/contact/page.tsx'), 'utf8')
    const how = readFileSync(join(process.cwd(), 'app/[locale]/how-it-works/page.tsx'), 'utf8')
    const quotes = readFileSync(join(process.cwd(), 'app/[locale]/testimonials/page.tsx'), 'utf8')
    expect(programs).toMatch(/PaperSheet/)
    expect(programs).toMatch(/c\.programs/)
    expect(programs).toMatch(/hosted/)
    expect(programs).toMatch(/id="sbc"/)
    expect(programs).toMatch(/id="peap"/)
    expect(programs).toMatch(/c\.programs\.values/)
    expect(programs).toMatch(/c\.programs\.sbc/)
    expect(programs).toMatch(/c\.programs\.peap/)
    expect(programs).toMatch(/c\.programs\.sbc\.gallery/)
    expect(programs).toMatch(/c\.programs\.peap\.photo/)
    expect(programs).not.toMatch(/ps-h2/)
    expect(programs).toMatch(/aspect-\[4\/3\]/)
    expect(programs).toMatch(/sm:text-3xl/)
    expect(programs).not.toMatch(/href="#sbc"/)
    expect(programs).not.toMatch(/tone="navy"/)
    expect(programs).not.toMatch(/font-black uppercase/)
    expect(programs).not.toMatch(/text-\[1\.65rem\]/)
    expect(programs).not.toMatch(/program\.kicker/)
    expect(programs).not.toMatch(/hostedTitle/)
    expect(programs).not.toMatch(/PEAPShowcase/)
    expect(programs).not.toMatch(/95%/)
    expect(programs).not.toMatch(/\/contact/)
    expect(programs).toMatch(/\/onboard/)
    expect(programs).not.toMatch(/\/find/)
    expect(aliveCopy('en').programs.hosted.map((item) => item.id)).toEqual(['sbc', 'peap'])
    expect(aliveCopy('en').programs.hosted[0]?.href).toBe('https://sbc.prepskul.com')
    expect(aliveCopy('en').programs.hosted[0]?.cover).toMatch(/sbc-camp-side/)
    expect(aliveCopy('en').programs.hosted[1]?.cover).toMatch(/program2/)
    expect(aliveCopy('en').programs.values).toHaveLength(4)
    expect(aliveCopy('en').programs.sbc.kicker).toBe('Summer Build Camp')
    expect(aliveCopy('en').programs.hosted[0]?.body).toMatch(/one-week STEM, AI, and innovation camp/)
    expect(aliveCopy('en').programs.hosted[0]?.body).toMatch(/aged 9 to 18/)
    expect(aliveCopy('en').programs.hosted[0]?.body).toMatch(/make things, test ideas/)
    expect(aliveCopy('en').programs.hosted[0]?.body).toMatch(/solve real problems/)
    expect(aliveCopy('en').programs.sbc.gallery.join(' ')).toMatch(/sbc-camp-room/)
    expect(aliveCopy('en').programs.sbc.done).toMatch(/August 2026/)
    expect(aliveCopy('en').programs.peap.done).toMatch(/March 2026/)
    expect(aliveCopy('en').programs.sbc.stats.map((item) => item.label).join(' ')).not.toMatch(/Young innovators/)
    expect(aliveCopy('en').programs.values.map((item) => item.body).join(' ')).not.toMatch(/dump the sheet/)
    expect(aliveCopy('en').audiences.find((item) => item.id === 'teachers')?.image).not.toMatch(/african-tutor-teaching-student-at-home/)
    expect(contact).toMatch(/PaperSheet/)
    expect(contact).not.toMatch(/emailjs/)
    expect(contact).toMatch(/mailto:info@prepskul.com/)
    expect(how).toMatch(/redirect/)
    expect(quotes).toMatch(/redirect/)
  })

  it('keeps About and SkulMate on the hybrid story, not leftover movement copy', () => {
    const about = readFileSync(join(process.cwd(), 'app/[locale]/about/page.tsx'), 'utf8')
    const footer = readFileSync(join(process.cwd(), 'components/footer.tsx'), 'utf8')
    const t = getTranslations('en')
    expect(about).toMatch(/titleLead/)
    expect(about).toMatch(/titleRest/)
    expect(about).toMatch(/\/programs/)
    expect(about).not.toMatch(/titleAccent/)
    expect(t.about.hero.titleLead).toMatch(/A tutor for every question/)
    expect(t.about.hero.titleRest).toMatch(/Ready when you are/)
    expect(t.about.hero.subtitle).toMatch(/SkulMate/)
    expect(t.about.hero.subtitle).toMatch(/PrepSkul app/)
    expect(t.about.story.paragraph1).toMatch(/built into the PrepSkul app/)
    expect(t.about.values.growth.title).toBe('Understand')
    expect(`${t.about.hero.subtitle} ${t.about.story.paragraph1} ${t.about.mission.description}`).not.toMatch(/movement/)
    expect(`${t.about.hero.subtitle} ${t.about.cta.title}`).not.toMatch(/We Believe/)
    expect(t.footer.description).toMatch(/SkulMate in the app/)
    expect(t.footer.description).not.toMatch(/full potential/)
    expect(aliveCopy('en').programs.hostedTitle).toBe('Programs')
    expect(aliveCopy('fr').programs.hostedTitle).toBe('Nos programmes')
    expect(footer).toMatch(/t\.footer\.description/)
  })

  it('keeps notebook in the crawler background', () => {
    const sitemap = readFileSync(join(process.cwd(), 'app/sitemap.ts'), 'utf8')
    const robots = readFileSync(join(process.cwd(), 'app/robots.ts'), 'utf8')
    const llms = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8')
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
    expect(sitemap).toMatch(/notebook/)
    expect(sitemap).toMatch(/programs/)
    expect(sitemap).not.toMatch(/how-it-works/)
    expect(sitemap).not.toMatch(/testimonials/)
    expect(robots).toMatch(/sitemap\.xml/)
    expect(robots).toContain("allow: ['/']")
    expect(robots).toContain("disallow: ['/api/', '/admin/']")
    expect(llms).toMatch(/Notebook/)
    expect(css).not.toMatch(/hero-circular-shape/)
    expect(css).toMatch(/ps-footer-tear/)
    expect(css).toMatch(/\.ps-live-stats \+ \.ps-torn/)
    expect(css).toMatch(/flex: none/)
  })
})
