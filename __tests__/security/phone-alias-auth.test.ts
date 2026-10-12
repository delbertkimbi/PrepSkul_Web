import { POST as confirmAlias } from '@/app/api/mobile/auth/confirm-phone-alias/route'
import { POST as signUpWithPhone } from '@/app/api/mobile/auth/phone-signup/route'

describe('phone alias ownership', () => {
  it('does not confirm an alias without verified ownership', async () => {
    const response = await confirmAlias()
    expect(response.status).toBe(403)
  })

  it('does not create a confirmed account from a supplied number', async () => {
    const response = await signUpWithPhone()
    expect(response.status).toBe(403)
  })
})
