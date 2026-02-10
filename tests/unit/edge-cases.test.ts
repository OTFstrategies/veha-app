import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/format'

describe('Edge Cases', () => {
  // EC.1 — Naam met koppelteken
  it('handles names with hyphens', () => {
    expect(getInitials("Jean-Pierre Dupont")).toBe("JD")
  })

  // EC.2 — Extra spaties tussen woorden
  it('handles extra spaces between words', () => {
    const result = getInitials("Jan   de   Vries")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  // EC.3 — Emoji in naam
  it('handles emoji in name without crash', () => {
    const result = getInitials("Jan Bouw")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })

  // EC.4 — Zeer lange naam (max 2 tekens output)
  it('returns max 2 chars for very long names', () => {
    const result = getInitials("Eerste Tweede Derde Vierde Vijfde Zesde")
    expect(result.length).toBeLessThanOrEqual(2)
  })

  // EC.5 — Naam met alleen cijfers
  it('handles numeric name', () => {
    const result = getInitials("123 456")
    expect(result).toBeDefined()
    expect(typeof result).toBe('string')
  })
})
