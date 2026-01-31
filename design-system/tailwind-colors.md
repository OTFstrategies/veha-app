# Tailwind Color Configuration

## Color Choices

VEHA Dashboard uses a warm, Apple-inspired aesthetic with these Tailwind colors:

- **Primary:** `stone` — Used for text, headers, buttons, navigation
- **Secondary:** `stone` (lighter tones) — Used for accents, task bars, avatars
- **Neutral:** `stone` — Used for backgrounds, cards, surfaces

## Brand Colors

| Name | Hex | Tailwind Equivalent | Usage |
|------|-----|---------------------|-------|
| VEHA Zwart | #2e2d2c | stone-800 | Primary text, headers |
| VEHA Beige | #CBC4B5 | stone-300/400 | Accents, task bars |
| VEHA Light | #f8f7f5 | stone-50 | Backgrounds |

## Semantic Colors

| Purpose | Tailwind | Usage |
|---------|----------|-------|
| Success | `green` | Completed tasks, positive actions |
| Warning | `amber` | On-hold status, attention needed |
| Error | `red` | Errors, delete actions, critical path |
| Info | `blue` | Information, today line, links |

## Usage Examples

### Buttons
```html
<!-- Primary button -->
<button class="bg-stone-800 hover:bg-stone-900 text-white">
  Opslaan
</button>

<!-- Secondary button -->
<button class="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200">
  Annuleren
</button>
```

### Badges/Status
```html
<!-- Active status -->
<span class="bg-green-100 text-green-800 border border-green-200">Actief</span>

<!-- On-hold status -->
<span class="bg-amber-100 text-amber-800 border border-amber-200">On-hold</span>

<!-- Completed status -->
<span class="bg-stone-100 text-stone-600 border border-stone-200">Afgerond</span>
```

### Cards
```html
<div class="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-sm">
  <!-- Card content -->
</div>
```

### Text
```html
<h1 class="text-stone-900 dark:text-stone-100">Heading</h1>
<p class="text-stone-600 dark:text-stone-400">Body text</p>
<span class="text-stone-400 dark:text-stone-500">Muted text</span>
```

## Dark Mode

All components support dark mode using Tailwind's `dark:` prefix. The design inverts the stone scale for dark mode while maintaining warmth.

## Design Philosophy

> "VEHA huisstijl is Apple-geïnspireerd: prikkelarm, veel whitespace, warme grijstinten. Vermijd felle kleuren behalve voor semantische betekenis."

- Generous whitespace
- Subtle shadows
- Warm gray tones
- Color only for meaning (status, actions)
- Clean, professional appearance
