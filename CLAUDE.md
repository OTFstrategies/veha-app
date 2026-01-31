# VEHA Dashboard - Project Context

## Overview
VEHA Dashboard is a project planning and resource management tool for Dutch SMB service companies. It combines Gantt chart visualization with team scheduling, client management, and real-time updates.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS with VEHA design tokens (warm stone palette)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand (client) + TanStack Query (server)
- **Deployment**: Vercel

## Deployment

### Vercel Token
De Vercel token is opgeslagen in `.env.local` als `VERCEL_TOKEN`.

Deploy commando:
```bash
vercel --prod --token $VERCEL_TOKEN
```

Of gebruik direct:
```bash
npx vercel --prod --token tYvEOMCPdOUUzSPbypXY9xjH
```

## Project Structure
```
src/
├── app/           # Next.js App Router pages
│   ├── (auth)/    # Public auth routes (login, signup)
│   ├── (app)/     # Protected app routes (dashboard, projects, etc.)
│   └── (portal)/  # Client portal routes
├── components/    # React components
├── hooks/         # Custom React hooks
├── queries/       # TanStack Query hooks
├── stores/        # Zustand stores
├── lib/           # Utilities and Supabase clients
└── types/         # TypeScript definitions
```

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type check
- `vercel --prod` - Deploy to production
