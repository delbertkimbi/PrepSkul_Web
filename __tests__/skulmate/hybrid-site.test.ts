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

    expect(copy.hero.primary).toBe('Get started')
    expect(copy.hero.subtitle).toMatch(/AI tutor inside PrepSkul/)
    expect(copy.hero.subtitle).toMatch(/browse tutors/)
    expect(copy.hero.subtitle).toMatch(/preferences/)
    expect(copy.hero.subtitle).not.toMatch(/browse tutors here, then book or request in the app/)
    expect(aliveCopy('fr').hero.subtitle).toMatch(/tuteur IA/)
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
    expect(copy.science.title).toMatch(/already gets you/)
    expect(copy.science.title).not.toMatch(/tutor in the app/)
    expect(copy.tools.every((tool) => tool.tile.startsWith('/onboard/art/'))).toBe(true)
    expect(copy.audiences.every((aud) => !aud.image.startsWith('/marketing/'))).toBe(true)
    expect(copy.notebook.title).toMatch(/notebook/i)
    expect(copy.toolsTitle).toMatch(/lesson with Mate/)
    expect(copy.tools.map((tool) => tool.body).join(' ')).not.toMatch(/frozen chat/)
    expect(copy.tools.map((tool) => tool.body).join(' ')).not.toMatch(/linear undo/)
    expect(copy.tools.find((tool) => tool.id === 'talk')?.body).toMatch(/already listening/)
    expect(copy.tools.find((tool) => tool.id === 'practice')?.body).toMatch(/did not land/)
    expect(copy.tools.find((tool) => tool.id === 'subjects')?.body).toMatch(/hist-geo/)
    expect(copy.split.title).toMatch(/Mate first/)
    expect(copy.split.body).not.toMatch(/Next\.js|Supabase|tutor_profiles/)
    expect(copy.find.lead).not.toMatch(/tutor_profiles|database/)
    expect(copy.cta.body).not.toMatch(/in the app/)
  })

  it('talks about tutors and lessons, not site-versus-app plumbing', () => {
    const copy = aliveCopy('en')
    expect(copy.find.lead).toMatch(/Real people/)
    expect(copy.find.request).toMatch(/Request a tutor/)
    expect(copy.find.bookInApp).toMatch(/Book a class/)
    expect(copy.split.body).toMatch(/human hour/)
    expect(copy.hybrid.title).toMatch(/sit with you/)
    expect(copy.hybrid.body).toMatch(/Live online, or at the table/)
    expect(copy.hybrid.body).not.toMatch(/same database/)
    expect(copy.hybrid.title).not.toMatch(/Book them in the app/)
    const how = copy.faq.find((item) => item.q.includes('human tutor'))
    expect(how?.a).toMatch(/match you/)
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
    expect(hero.title).toMatch(/Learn with a tutor who actually teaches/)
    expect(hero.getStarted).toBe('Get started')
    expect(hero.subtitle).toMatch(/SkulMate, the AI tutor inside PrepSkul/)
    expect(hero.subtitle).toMatch(/browse tutors/)
    expect(hero.subtitle).toMatch(/preferences/)
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
    expect(matePaint).toMatch(/const top = 20/)
    expect(matePaint).toMatch(/if \(this.mood === mood && this.prev === mood\) return/)
  })

  it('keeps the tutor photo still and animates Mate beside the live stats', () => {
    const home = readFileSync(join(process.cwd(), 'components/marketing/alive-home.tsx'), 'utf8')
    const mate = readFileSync(join(process.cwd(), 'components/marketing/mate-point.tsx'), 'utf8')
    expect(home).toMatch(/african-tutor-teaching-student-at-home-with-books-/)
    expect(home).toMatch(/MatePoint/)
    expect(home).toMatch(/Laurel/)
    expect(home).toMatch(/staggerMs/)
    expect(home).toMatch(/lg:pt-24/)
    expect(home).not.toMatch(/lg:pb-20 lg:pt-8/)
    expect(home).toMatch(/ps-live-stats/)
    expect(home).not.toMatch(/MateOrbit/)
    expect(home).not.toMatch(/mate-wave\.png/)
    expect(mate).toMatch(/<svg/)
    expect(mate).not.toMatch(/\.png/)
    const ticker = readFileSync(join(process.cwd(), 'components/marketing/live-ticker.tsx'), 'utf8')
    expect(ticker).toMatch(/ps-odometer/)
    expect(ticker).toMatch(/randomBump/)
    expect(ticker).toMatch(/randomWait/)
    expect(ticker).toMatch(/staggerMs/)
    expect(ticker).toMatch(/LAST_TICK_KEY/)
    expect(ticker).toMatch(/ps-odometer-reel/)
  })

  it('uses the canvas PrepMate for marketing pictures, not static cutouts', () => {
    const home = readFileSync(join(process.cwd(), 'components/marketing/alive-home.tsx'), 'utf8')
    const find = readFileSync(join(process.cwd(), 'components/marketing/find-directory.tsx'), 'utf8')
    const matePage = readFileSync(join(process.cwd(), 'app/[locale]/mate/page.tsx'), 'utf8')
    expect(home).toMatch(/PrepMate/)
    expect(home).toMatch(/mood="idle"/)
    expect(home).not.toMatch(/mood="talk"/)
    expect(home).toMatch(/mood="cheer"/)
    expect(home).toMatch(/ps-cutout-navy/)
    expect(home).toMatch(/h-16 sm:h-20/)
    expect(home).not.toMatch(/mate-talk\.png/)
    expect(home).not.toMatch(/mate-cheer\.png/)
    expect(find).toMatch(/PrepMate/)
    expect(find).toMatch(/mood="think"/)
    expect(find).not.toMatch(/mate-think\.png/)
    expect(find).not.toMatch(/No request form/)
    expect(find).not.toMatch(/tutor_requests from the app/)
    expect(matePage).toMatch(/PrepMate/)
    expect(matePage).toMatch(/ps-mate-well/)
    expect(matePage).not.toMatch(/h-56 w-56/)
    expect(matePage).toMatch(/already gets you/)
    expect(matePage).not.toMatch(/teaches in the PrepSkul app/)
    expect(matePage).not.toMatch(/mate-cheer\.png/)
  })

  it('keeps notebook in the crawler background', () => {
    const sitemap = readFileSync(join(process.cwd(), 'app/sitemap.ts'), 'utf8')
    const robots = readFileSync(join(process.cwd(), 'app/robots.ts'), 'utf8')
    const llms = readFileSync(join(process.cwd(), 'app/llms.txt/route.ts'), 'utf8')
    const css = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
    expect(sitemap).toMatch(/notebook/)
    expect(robots).toMatch(/llms\.txt/)
    expect(robots).toMatch(/notebook/)
    expect(llms).toMatch(/Notebook/)
    expect(css).not.toMatch(/hero-circular-shape/)
    expect(css).not.toMatch(/linear-gradient\(135deg/)
    expect(css).toMatch(/ps-footer-tear/)
  })
})
