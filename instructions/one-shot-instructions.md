# VEHA Dashboard — Complete Implementation Instructions

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
- **DO** implement empty states when no records exist
- **DO** use test-driven development — write tests first using `tests.md`

---

## Product Overview

VEHA Dashboard is een complete projectplanning en resource management tool voor dienstverlenende MKB-bedrijven in Nederland. Het combineert klantenbeheer, projectplanning met Gantt-weergave, en medewerkerplanning in één overzichtelijke applicatie.

**Sections:**
1. Dashboard — Stats, today's tasks, active projects, capacity
2. Klanten — Hierarchical tree view with contacts, locations, projects
3. Projecten — Gantt chart with split-screen task and resource views
4. Medewerkers — Team management with skills and availability
5. Weekplanning — Weekly calendar showing who works where

---

# Milestone 1: Foundation

## Goal
Set up design tokens, data model types, database schema, and routing.

## Design Tokens
- Primary: stone-800 (#2e2d2c)
- Secondary: stone-300 (#CBC4B5)
- Neutral: stone-50 (#f8f7f5)
- Fonts: Inter (headings/body), IBM Plex Mono (data)

## Core Entities
- Client (with Contacts, Locations)
- Employee (with Availability)
- Project (belongs to Client)
- Task (with hierarchy, Dependencies)
- TaskAssignment (Employee ↔ Task)

## Routes
- `/` — Dashboard
- `/clients` — Clients tree
- `/projects` — Project list
- `/projects/:id` — Gantt view
- `/employees` — Employee list
- `/employees/:id` — Employee detail
- `/weekplanning` — Week calendar

---

# Milestone 2: Dashboard

## Goal
Implement the starting page with stats, tasks, projects, and capacity.

## Components
- `Dashboard.tsx`, `StatsCards.tsx`, `TodayTasks.tsx`
- `ActiveProjects.tsx`, `CapacityWidget.tsx`, `QuickActions.tsx`

## Key Data
- Stats: active projects, tasks today, employees available, attention needed
- Today's tasks with assignees
- Active projects with progress
- Employee capacity hours

---

# Milestone 3: Klanten

## Goal
Implement hierarchical client tree view.

## Components
- `ClientTree.tsx`, `ClientTreeNode.tsx`, `ClientTreeEmpty.tsx`

## Key Features
- Expandable client nodes
- Groups: Contactpersonen, Locaties, Projecten
- Search and filter
- Click project → Gantt

---

# Milestone 4: Projecten

## Goal
Implement Gantt chart with split-screen design.

## Components
- `ProjectGanttScheduler.tsx`, `GanttPanel.tsx`, `SchedulerPanel.tsx`
- `SharedTimeline.tsx`, `TaskBar.tsx`, `DependencyArrow.tsx`

## Critical: Split-Screen
- Gantt panel (top): task-oriented with WBS, dependencies
- Scheduler panel (bottom): resource-oriented
- Synchronized scroll and zoom

---

# Milestone 5: Medewerkers

## Goal
Implement team management with planning and availability.

## Components
- `EmployeeList.tsx`, `EmployeeDetail.tsx`

## Key Features
- Grid/list toggle
- Planning tab with assignments
- Availability tab (ziek/vakantie/vrij)

---

# Milestone 6: Weekplanning

## Goal
Implement weekly calendar showing who works where.

## Components
- `WeekPlanning.tsx`

## Key Features
- Employees as rows, days as columns
- Tasks in cells
- Availability status overrides
- Week navigation

---

## Files Reference

Each section includes:
- `README.md` — Feature overview
- `tests.md` — Test instructions (TDD)
- `components/` — React components
- `types.ts` — TypeScript interfaces
- `sample-data.json` — Test data
- `screenshot.png` — Visual reference

See `product-plan/sections/[section-id]/` for each section's assets.
