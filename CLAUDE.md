# VEHA Dashboard

## Project

Project planning en resource management dashboard voor Nederlandse MKB-dienstverleners.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4, Huisstijl design system
- **Auth:** Supabase Auth
- **Database:** Supabase PostgreSQL + Realtime
- **State:** Zustand (client) + TanStack Query (server)
- **UI:** shadcn/ui (New York style), Framer Motion, GSAP
- **Fonts:** DM Sans (headings), Inter (body), JetBrains Mono (code) via next/font/google
- **Deployment:** Vercel

## Deployment

Deploy commando:

```bash
vercel --prod --token $VERCEL_TOKEN
```

## Design System

Huisstijl met **warm stone accent** (#CBC4B5):

- Zinc palette als primair, warm stone als secundair/decoratief
- Warm stone ALLEEN voor: Gantt task bars, brand identity elementen
- NIET voor: buttons, focus rings, primary actions
- Bron: `~/.claude/design-system/HUISSTIJL.md`

## Speciale CSS

- **Gantt tokens:** `--gantt-task-bar`, `--gantt-today-line` (blauw, UX conventie), etc.
- **Scrollbar styling:** Custom webkit scrollbar (behouden)
- **Collapsible CSS:** `.collapsible-content`, `.chevron-icon` (behouden)
- `--info: #3b82f6` is semantisch blauw (toegestaan)

## Project Structure

```
src/
  app/
    (auth)/      # Public auth routes
    (app)/       # Protected app routes
    (portal)/    # Client portal
    globals.css  # Huisstijl + warm stone + Gantt tokens
    layout.tsx   # Font loading (NIET wijzigen, fonts correct)
  components/
    ui/          # shadcn/ui componenten
  hooks/         # Custom React hooks
  queries/       # TanStack Query hooks
  stores/        # Zustand stores
  lib/
    utils.ts     # cn() utility
    motion/      # Framer Motion + GSAP presets
  types/         # TypeScript definitions
```

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
