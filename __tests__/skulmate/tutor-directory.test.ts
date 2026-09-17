import { toPublicTutor } from '@/lib/tutors/directory'

describe('public tutor directory', () => {
  it('maps only public fields from tutor_profiles', () => {
    const card = toPublicTutor({
      user_id: 'abc',
      subjects: ['Maths', 'Physics'],
      specializations: ['GCE'],
      city: 'Buea',
      rating: 4.2,
      admin_approved_rating: 4.8,
      profile_photo_url: 'https://cdn.example/p.jpg',
      total_sessions_completed: 12,
      id_document_url: 'secret-doc',
      payout_account: 'hidden',
      profiles: { full_name: 'Ada N.', email: 'hidden@x.com', avatar_url: 'https://cdn.example/a.jpg' },
    })

    expect(card).toEqual({
      id: 'abc',
      name: 'Ada N.',
      subjects: ['Maths', 'Physics', 'GCE'],
      city: 'Buea',
      rating: 4.8,
      photoUrl: 'https://cdn.example/p.jpg',
      sessions: 12,
    })
    expect(JSON.stringify(card)).not.toMatch(/hidden@|secret-doc|payout/)
  })

  it('does not invent a person when the row has no user id', () => {
    expect(toPublicTutor({ subjects: ['Maths'], profiles: { full_name: 'Amina N.' } })).toBeNull()
  })
})
