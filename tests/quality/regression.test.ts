import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, statSync, existsSync } from 'fs'
import { join, extname } from 'path'

function findFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = []
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        results.push(...findFiles(fullPath, extensions))
      } else if (extensions.includes(extname(entry))) {
        results.push(fullPath)
      }
    }
  } catch { /* skip */ }
  return results
}

describe('Regression: No broken imports after refactoring', () => {
  // R.1 — Geen imports uit verwijderde sections/ directory
  it('no imports reference sections/ directory', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      expect(content, `Found sections/ import in ${file}`).not.toMatch(/from\s+['"].*sections\//)
    }
  })

  // R.2 — Alle getInitials imports wijzen naar @/lib/format
  it('all getInitials imports use shared utility', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('getInitials') && content.includes('import')) {
        const importLines = content.split('\n').filter(l => l.includes('getInitials') && l.includes('import'))
        for (const line of importLines) {
          expect(line, `Wrong getInitials import in ${file}`).toContain('@/lib/format')
        }
      }
    }
  })

  // R.3 — sections/ directory bestaat niet meer
  it('sections/ directory is deleted', () => {
    expect(existsSync('sections')).toBe(false)
  })

  // R.4 — .env.test bestaat (nodig voor tests)
  it('.env.test file exists', () => {
    expect(existsSync('.env.test')).toBe(true)
  })
})
