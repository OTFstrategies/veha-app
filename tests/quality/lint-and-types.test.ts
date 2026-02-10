import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'
import { readdirSync, readFileSync, statSync } from 'fs'
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

describe('Code Quality: Lint & Type Safety', () => {
  // L.1 — TypeScript compileert zonder errors
  it('TypeScript compiles without errors', () => {
    const result = spawnSync('npx', ['tsc', '--noEmit'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 130000)

  // L.2 — Geen console.log in productie code
  it('no console.log in src/', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
        expect(line, `Found console.log in ${file}:${i + 1}`).not.toMatch(/console\.log\(/)
      }
    }
  })

  // L.3 — ESLint geeft geen errors (warnings OK)
  it('ESLint passes without errors', () => {
    const result = spawnSync('npx', ['eslint', 'src/', '--quiet'], {
      encoding: 'utf-8',
      timeout: 120000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 130000)

  // L.4 — Build slaagt
  it('production build succeeds', () => {
    const result = spawnSync('npm', ['run', 'build'], {
      encoding: 'utf-8',
      timeout: 180000,
      shell: true,
    })
    expect(result.status).toBe(0)
  }, 200000)

  // L.5 — Geen duplicate getInitials definities
  it('getInitials is only defined in src/lib/format.ts', () => {
    const srcFiles = findFiles('src', ['.ts', '.tsx'])
    const definitionFiles: string[] = []
    for (const file of srcFiles) {
      const content = readFileSync(file, 'utf-8')
      if (content.includes('function getInitials') || content.match(/const getInitials\s*=/)) {
        definitionFiles.push(file)
      }
    }
    expect(definitionFiles).toHaveLength(1)
    expect(definitionFiles[0]).toContain('format.ts')
  })
})
