import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'

describe('Performance: No degradation', () => {
  // P.1 — Build duurt niet langer dan 120 seconden
  it('production build completes within 120s', () => {
    const start = Date.now()
    const result = spawnSync('npm', ['run', 'build'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(120000)
  }, 130000)

  // P.2 — TypeScript check duurt niet langer dan 60 seconden
  it('TypeScript check completes within 60s', () => {
    const start = Date.now()
    const result = spawnSync('npx', ['tsc', '--noEmit'], {
      encoding: 'utf-8',
      timeout: 60000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(60000)
  }, 65000)

  // P.3 — ESLint check duurt niet langer dan 90 seconden
  it('ESLint check completes within 90s', () => {
    const start = Date.now()
    const result = spawnSync('npx', ['eslint', 'src/', '--quiet'], {
      encoding: 'utf-8',
      timeout: 90000,
      shell: true,
    })
    const duration = Date.now() - start
    expect(result.status).toBe(0)
    expect(duration).toBeLessThan(90000)
  }, 95000)
})
