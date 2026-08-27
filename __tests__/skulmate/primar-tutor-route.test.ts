/**
 * Prompt rules for /api/primar/tutor — traits and speak heard→correct.
 * Pure helpers mirrored from route.ts so we can assert without OpenRouter.
 */

const BANNED = [
  'wrong', 'incorrect', 'mistake', 'error', 'fail', 'bad', 'stupid', 'silly',
  'try harder', 'concentrate', 'pay attention', 'should know', 'easy',
  'slow', 'behind', 'struggl', 'poor', 'weak',
  'faux', 'erreur', 'mauvais', 'bête', 'nul', 'facile', 'lent',
  'four short questions', 'take you through', 'next 4 steps',
]

function isSafeForAChild(line: string): boolean {
  const l = line.toLowerCase()
  if (line.length < 4 || line.length > 160) return false
  if (line.split(/\s+/).length > 24) return false
  if (/[{}<>[\]|`]/.test(line)) return false
  return !BANNED.some((w) => l.includes(w))
}

function speakHint(moment: string, heard?: string, answer?: string): string {
  if (moment !== 'speak') return ''
  if (heard && answer && heard.toLowerCase() !== answer.toLowerCase()) {
    return `I heard '${heard}'. The word is '${answer}' — say it again if you like.`
  }
  if (heard && answer) {
    return `I heard '${heard}'. That's it!`
  }
  return `Say '${answer ?? 'the word'}'.`
}

describe('primar tutor safety', () => {
  it('allows heard→correct speak lines', () => {
    const line = speakHint('speak', 'cot', 'cat')
    expect(line.toLowerCase()).toContain('cot')
    expect(line.toLowerCase()).toContain('cat')
    expect(isSafeForAChild(line)).toBe(true)
  })

  it('rejects session-intro phrasing', () => {
    expect(isSafeForAChild('I will ask you four short questions now.')).toBe(false)
  })

  it('rejects struggle-labeling of the child', () => {
    expect(isSafeForAChild('You struggle with rhyming.')).toBe(false)
  })
})
