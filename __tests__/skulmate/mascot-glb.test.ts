import { readFileSync } from 'fs'
import { join } from 'path'

const bytes = readFileSync(join(process.cwd(), 'public/3d/skulmate.glb'))
const document = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString())

describe('shipped Mate character', () => {
  it('ships a valid GLB container and the expected interaction clips', () => {
    expect(bytes.readUInt32LE(0)).toBe(0x46546c67)
    expect(bytes.readUInt32LE(8)).toBe(bytes.length)
    expect(document.animations).toHaveLength(33)
    expect(document.animations.map((a: {name: string}) => a.name)).toEqual(expect.arrayContaining([
      '01_idle', '02_wave', '09_thinking', '12_reading',
      '16_listening', '17_success', '18_try_again', '33_talk',
    ]))
  })

  it('hides accessories before the first animation tick', () => {
    const props = document.nodes.filter((n: {name?: string}) => n.name?.startsWith('prop.'))
    expect(props).toHaveLength(7)
    for (const prop of props) {
      expect(prop.scale).toHaveLength(3)
      expect(Math.max(...prop.scale)).toBeLessThan(0.001)
    }
  })

  it('does not ship the detached finger objects', () => {
    expect(document.nodes.some((n: {name?: string}) => n.name?.startsWith('Finger.'))).toBe(false)
    expect(document.nodes.filter((n: {name?: string}) => /^Hand\.[LR]$/.test(n.name ?? ''))).toHaveLength(2)
  })
})
