# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Or in CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');
```

## Font Usage

### Inter (Headings & Body)

**Usage:** Page titles, section headers, card titles, body text, labels, UI elements

**Weights:**
- 400 (Regular) — Body text, descriptions
- 500 (Medium) — Labels, emphasized text
- 600 (Semibold) — Section headers, card titles
- 700 (Bold) — Page titles, important headings

```css
/* Tailwind classes */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### IBM Plex Mono (Technical)

**Usage:** Data tables, WBS numbers, dates, technical values, code

**Weights:**
- 400 (Regular) — Data display
- 500 (Medium) — Emphasized data

```css
/* Tailwind class */
.font-mono { font-family: 'IBM Plex Mono', monospace; }
```

## Type Scale

| Size | Tailwind | Rem | Usage |
|------|----------|-----|-------|
| xs | `text-xs` | 0.75rem | Captions, labels |
| sm | `text-sm` | 0.875rem | Body small, table cells |
| base | `text-base` | 1rem | Body default |
| lg | `text-lg` | 1.125rem | Lead text |
| xl | `text-xl` | 1.25rem | Section titles |
| 2xl | `text-2xl` | 1.5rem | Page subtitles |
| 3xl | `text-3xl` | 1.875rem | Page titles |

## Examples

### Page Header
```html
<h1 class="text-2xl font-semibold text-stone-900">Dashboard</h1>
<p class="text-sm text-stone-500">Welkom terug! Hier is je overzicht.</p>
```

### Card Title
```html
<h3 class="text-lg font-medium text-stone-800">Actieve Projecten</h3>
```

### Data Table
```html
<td class="font-mono text-sm text-stone-600">1.2</td>
<td class="font-mono text-sm text-stone-600">03-02</td>
```

### Stats
```html
<span class="text-3xl font-bold text-stone-900">24</span>
<span class="text-sm text-stone-500">taken vandaag</span>
```

## Design Notes

> "Inter is de primaire font voor zowel headings als body text - clean, modern, goede leesbaarheid. IBM Plex Mono voor data en technische informatie geeft een professionele uitstraling."
