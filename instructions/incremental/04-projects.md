# Milestone 4: Projecten (Projects)

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 3 (Clients) recommended

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

Implement the Projects section — the core Gantt chart view with split-screen task and resource panels.

## Overview

De kern van VEHA Dashboard: projectbeheer met Gantt-weergave. Gebruikers kunnen projecten aanmaken, taken plannen met hiërarchie en dependencies, en voortgang bijhouden.

**Key Functionality:**
- View tasks in Gantt chart with timeline
- Hierarchical task structure (WBS numbering)
- Dependencies between tasks (arrows)
- Track progress per task
- Resource scheduler panel showing who works on what
- Synchronized horizontal scroll and zoom between panels

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/projects/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/projects/components/`:

- `ProjectGanttScheduler.tsx` — Main split-screen container
- `ProjectHeader.tsx` — Project title, status, client link
- `GanttToolbar.tsx` — Zoom controls, view options
- `GanttPanel.tsx` — Task-oriented Gantt view (top)
- `SchedulerPanel.tsx` — Resource-oriented view (bottom)
- `SharedTimeline.tsx` — Synchronized timeline header
- `TimelineHeader.tsx` — Month/day headers
- `TaskBar.tsx` — Individual task bar in timeline
- `DependencyArrow.tsx` — SVG arrows between tasks
- `TaskEditor.tsx` — Side panel for task editing

### Data Layer

The components expect these data shapes (see `types.ts`):

```typescript
interface Project {
  id: string
  name: string
  clientId: string
  clientName: string
  status: ProjectStatus
  startDate: string
  endDate: string
}

interface Task {
  id: string
  projectId: string
  parentId?: string
  wbs: string
  name: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  isMilestone: boolean
  isSummary: boolean
  status: TaskStatus
  assignees: TaskAssignee[]
  children?: Task[]
}

interface Dependency {
  id: string
  predecessorId: string
  successorId: string
  type: 'FS' | 'SS' | 'FF' | 'SF'
  lagDays: number
}
```

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onTaskSelect` | Select task in grid |
| `onTaskEdit` | Open task editor panel |
| `onTaskAdd` | Add new task |
| `onTaskMove` | Drag task to new dates |
| `onTaskResize` | Resize task duration |
| `onDependencyAdd` | Create dependency between tasks |
| `onProgressUpdate` | Update task progress |
| `onZoomChange` | Change timeline zoom level |

### Critical: Split-Screen Design

The project view MUST be split-screen:

1. **Gantt Panel (top)** — Task-oriented view with WBS, hierarchy, dependencies
2. **Scheduler Panel (bottom)** — Resource-oriented view showing employees

**Synchronized behavior:**
- Same timeline across both panels
- Horizontal scroll syncs between panels
- Zoom changes apply to both
- Selecting a task highlights it in both views

### API Endpoints

You'll need endpoints for:
- Get project with all tasks
- CRUD operations for tasks
- Manage dependencies
- Update task progress
- Assign/unassign employees

## Files to Reference

- `product-plan/sections/projects/README.md` — Feature overview
- `product-plan/sections/projects/tests.md` — Test-writing instructions
- `product-plan/sections/projects/components/` — React components
- `product-plan/sections/projects/types.ts` — TypeScript interfaces
- `product-plan/sections/projects/sample-data.json` — Test data
- `product-plan/sections/projects/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: View Project

1. User opens a project (from dashboard or clients)
2. User sees Gantt chart with tasks
3. User sees scheduler panel with resource assignments
4. User can zoom in/out on timeline

### Flow 2: Add Task

1. User clicks "Taak toevoegen"
2. New row appears in task grid
3. User types task name
4. User can set dates, assignees, progress

### Flow 3: Create Dependency

1. User selects a task
2. User adds dependency
3. User selects predecessor task
4. Arrow appears between tasks

### Flow 4: Update Progress

1. User opens task editor
2. User adjusts progress slider
3. Task bar shows progress fill
4. Summary tasks roll up child progress

## Done When

- [ ] Gantt chart renders with real tasks
- [ ] Split-screen with synced scroll/zoom works
- [ ] Task hierarchy displays correctly
- [ ] Dependencies show as arrows
- [ ] Progress updates reflect in bars
- [ ] Resource scheduler shows assignments
- [ ] Task CRUD operations work
- [ ] Zoom controls function
- [ ] Responsive layout
