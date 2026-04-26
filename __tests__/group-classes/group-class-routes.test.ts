import fs from 'fs'

describe('Group class API routes', () => {
  it('group-classes route exposes GET and POST handlers', () => {
    const content = fs.readFileSync('app/api/group-classes/route.ts', 'utf8')
    expect(content).toContain('export async function GET')
    expect(content).toContain('export async function POST')
    expect(content).toContain("listPublishedGroupClasses")
    expect(content).toContain("createGroupClassListing")
    expect(content).toContain("getAuthenticatedSupabaseForApi")
  })

  it('publish route is protected and calls publish service', () => {
    const content = fs.readFileSync(
      'app/api/group-classes/[id]/publish/route.ts',
      'utf8',
    )
    expect(content).toContain("export async function POST")
    expect(content).toContain("getAuthenticatedSupabaseForApi")
    expect(content).toContain("publishGroupClassListing")
    expect(content).toContain("Unauthorized")
  })

  it('enroll route is protected and calls reserve service', () => {
    const content = fs.readFileSync(
      'app/api/group-classes/[id]/enroll/route.ts',
      'utf8',
    )
    expect(content).toContain("export async function POST")
    expect(content).toContain("getAuthenticatedSupabaseForApi")
    expect(content).toContain("reserveGroupClassSeat")
    expect(content).toContain("Unauthorized")
  })

  it('routes include observability event logs', () => {
    const root = fs.readFileSync('app/api/group-classes/route.ts', 'utf8')
    const publish = fs.readFileSync(
      'app/api/group-classes/[id]/publish/route.ts',
      'utf8',
    )
    const enroll = fs.readFileSync(
      'app/api/group-classes/[id]/enroll/route.ts',
      'utf8',
    )
    expect(root).toContain("[group-class-api] listing_create")
    expect(root).toContain("[group-class-api] listings_read")
    expect(publish).toContain("[group-class-api] listing_publish")
    expect(enroll).toContain("[group-class-api] seat_enroll")
  })

  it('join route validates token with auth and enrollment gating', () => {
    const join = fs.readFileSync(
      'app/api/group-classes/join/[token]/route.ts',
      'utf8',
    )
    expect(join).toContain("export async function GET")
    expect(join).toContain("getAuthenticatedSupabaseForApi")
    expect(join).toContain("from('group_class_listings')")
    expect(join).toContain("from('group_class_enrollments')")
    expect(join).toContain("eq('status', 'paid')")
  })
})

