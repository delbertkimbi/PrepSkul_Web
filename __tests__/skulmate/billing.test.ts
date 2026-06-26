import { deckAppendCreditsRequired } from '@/lib/skulmate/billing'

describe('skulmate billing', () => {
  it('deck append uses manual text credit tier', () => {
    expect(
      deckAppendCreditsRequired({
        creditsPerManualTextGame: 2,
        creditsPerDocTextGame: 5,
        creditsPerImageGameBase: 10,
        freeDocTextGamesPerDay: 2,
        freeImageGamesPerDay: 4,
        maxImagesPerPromptFree: 3,
        maxImagesPerPromptPaid: 5,
      })
    ).toBe(2)
  })
})
