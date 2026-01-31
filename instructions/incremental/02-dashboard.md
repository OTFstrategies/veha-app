# Milestone 2: Dashboard

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## About These Instructions

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Data model definitions (TypeScript types and sample data)
- UI/UX specifications (user flows, requirements, screenshots)
- Design system tokens (colors, typography, spacing)
- Test-writing instructions for each section (for TDD approach)

**What you need to build:**
- Backend API endpoints and database schema
- Authentication and authorization
- Data fetching and state management
- Business logic and validation
- Integration of the provided UI components with real data

**Important guidelines:**
- **DO NOT** redesign or restyle the provided components — use them as-is
- **DO** wire up the callback props to your routing and API calls
- **DO** replace sample data with real data from your backend
- **DO** implement proper error handling and loading states
- **DO** implement empty states when no records exist (first-time users, after deletions)
- **DO** use test-driven development — write tests first using `tests.md` instructions
- The components are props-based and ready to integrate — focus on the backend and data layer

---

## Goal

Implement the Dashboard — the starting page showing an overview of active projects, today's tasks, capacity, and quick actions.

## Overview

Het Dashboard is de startpagina van VEHA Dashboard. Het geeft gebruikers een direct overzicht van de huidige status: actieve projecten, taken voor vandaag, capaciteit van medewerkers, en quick actions.

**Key Functionality:**
- View statistics: active projects, today's tasks, available employees, attention needed
- See today's tasks grouped by project
- View active project cards with progress
- Check employee capacity for the week
- Quick actions to create projects/tasks or go to weekplanning

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/dashboard/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/dashboard/components/`:

- `Dashboard.tsx` — Main dashboard layout
- `StatsCards.tsx` — Four stat cards at top
- `TodayTasks.tsx` — Today's tasks grouped by project
- `ActiveProjects.tsx` — Project cards grid
- `CapacityWidget.tsx` — Employee capacity bars
- `QuickActions.tsx` — Quick action buttons

### Data Layer

The components expect these data shapes (see `types.ts`):

```typescript
interface DashboardStats {
  activeProjects: number
  newProjectsThisMonth: number
  tasksToday: number
  tasksCompleted: number
  employeesAvailable: number
  employeesTotal: number
  projectsNeedingAttention: number
}

interface TodayTask {
  id: string
  name: string
  progress: number
  assignees: { id: string; name: string; initials: string; color: string }[]
  projectId: string
  projectName: string
  clientName: string
}

interface ActiveProject {
  id: string
  name: string
  clientName: string
  progress: number
  startDate: string
  endDate: string
  status: ProjectStatus
  assignees: { id: string; initials: string; color: string }[]
  needsAttention?: boolean
}

interface EmployeeCapacity {
  id: string
  name: string
  role: string
  initials: string
  color: string
  plannedHours: number
  availableHours: number
}
```

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onTaskClick` | Navigate to project Gantt view |
| `onProjectClick` | Navigate to project detail |
| `onStatCardClick` | Navigate to relevant section |
| `onNewProject` | Open project creation form |
| `onNewTask` | Open task creation form |
| `onWeekplanning` | Navigate to weekplanning |

### API Endpoints

You'll need endpoints to fetch:
- Dashboard statistics (aggregated counts)
- Today's tasks with assignees
- Active projects with progress
- Employee capacity for current week

## Files to Reference

- `product-plan/sections/dashboard/README.md` — Feature overview
- `product-plan/sections/dashboard/tests.md` — Test-writing instructions
- `product-plan/sections/dashboard/components/` — React components
- `product-plan/sections/dashboard/types.ts` — TypeScript interfaces
- `product-plan/sections/dashboard/sample-data.json` — Test data
- `product-plan/sections/dashboard/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View Daily Overview

1. User opens the app or clicks Dashboard
2. User sees stat cards: active projects, today's tasks, available employees, attention needed
3. User can click any stat card to navigate to details

### Flow 2: Navigate to Task

1. User sees task list under "Vandaag"
2. User clicks on a task
3. User navigates to the project Gantt view

### Flow 3: Check Capacity

1. User views capacity widget showing employee hours
2. User sees who is overbooked (red bar)
3. User clicks "Weekplanning" to see full view

## Done When

- [ ] Stats cards show real aggregated data
- [ ] Today's tasks load from database
- [ ] Active projects display with real progress
- [ ] Capacity widget shows actual planned hours
- [ ] All navigation callbacks work
- [ ] Empty states display when no data
- [ ] Responsive on mobile
