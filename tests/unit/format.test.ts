import { describe, it, expect } from 'vitest'
import { getInitials } from '@/lib/format'

describe('getInitials', () => {
  // U.1 — Null input
  it('returns ? for null', () => {
    expect(getInitials(null)).toBe('?')
  })

  // U.2 — Undefined input
  it('returns ? for undefined', () => {
    expect(getInitials(undefined)).toBe('?')
  })

  // U.3 — Empty string
  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  // U.4 — Single name
  it('returns single initial for one word', () => {
    expect(getInitials('Jan')).toBe('J')
  })

  // U.5 — Two names (happy path)
  it('returns two initials for two words', () => {
    expect(getInitials('Jan de Vries')).toBe('JD')
  })

  // U.6 — Three+ names (max 2 initials)
  it('returns max 2 initials for three words', () => {
    expect(getInitials('Jan Willem de Vries')).toBe('JW')
  })

  // U.7 — Lowercase names (uppercase output)
  it('uppercases initials', () => {
    expect(getInitials('jan de vries')).toBe('JD')
  })

  // U.8 — Whitespace-only string
  it('handles whitespace-only input without crash', () => {
    const result = getInitials('   ')
    expect(result).toBeDefined()
  })
})
