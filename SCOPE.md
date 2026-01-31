# VEHA Dashboard - Detailed Project Scope

## Executive Summary

VEHA Dashboard is a project planning and resource management tool for Dutch SMB service companies. It combines Gantt chart visualization with team scheduling, client management, and real-time updates.

---

## Technical Architecture

### Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: TailwindCSS with VEHA design tokens (warm stone palette)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Zustand (client) + React Query (server)
- **Deployment**: Vercel

### Directory Structure
```
src/
├── app/
│   ├── (auth)/          # Public auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── (app)/           # Protected app routes
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/[id]/
│   │   ├── employees/[id]/
│   │   └── weekplanning/
│   └── (portal)/        # Client portal routes
├── components/
│   ├── ui/              # Base UI components (shadcn-style)
│   ├── layout/          # Sidebar, Header, AppShell
│   ├── dashboard/       # Dashboard-specific components
│   ├── clients/         # Client tree components
│   ├── projects/        # Gantt/Scheduler components
│   ├── employees/       # Employee management components
│   └── weekplanning/    # Week calendar components
├── lib/
│   ├── supabase/        # Supabase client utilities
│   ├── scheduling/      # Auto-scheduling, CPM, conflict detection
│   └── utils/           # Utility functions
├── queries/             # Data fetching with React Query
├── stores/              # Zustand stores
└── types/               # TypeScript definitions
```

---

## Milestones & Tasks

### Milestone 1: Database & Auth [CURRENT]
**Status**: In Progress

#### Tasks:
1. **Auth Pages** - Create login, signup, forgot-password pages
2. **Auth Callbacks** - Handle Supabase auth callbacks
3. **Workspace Selection** - Multi-workspace selector UI
4. **Auth Hooks** - useAuth, useWorkspace, useUser hooks
5. **Protected Routes** - Middleware for route protection

#### Deliverables:
- Working email/password authentication
- Magic link support
- Workspace selection after login
- Session persistence

---

### Milestone 2: Dashboard
**Status**: Pending (blocked by M1)

#### Tasks:
1. **App Layout** - Create AppShell with sidebar navigation
2. **Dashboard Page** - Wire up Dashboard component
3. **Dashboard Queries** - Create aggregation queries for stats
4. **Navigation Handlers** - Wire callbacks to router

#### Deliverables:
- Stats cards with live counts
- Today's tasks list grouped by project
- Active projects grid
- Capacity widget

---

### Milestone 3: Clients
**Status**: Pending

#### Tasks:
1. **Client List Page** - Wire ClientTree component
2. **Client Queries** - CRUD operations for clients/contacts/locations
3. **Client Forms** - Modal forms for create/edit
4. **Client Detail View** - Expanded client information

#### Deliverables:
- Hierarchical client tree view
- Full CRUD for clients, contacts, locations
- Search and filter functionality

---

### Milestone 4: Projects & Gantt
**Status**: Pending (Most Complex)

#### Tasks:
1. **Project List Page** - Grid of projects with filters
2. **Project Detail Page** - Gantt/Scheduler split view
3. **Task CRUD** - Create, edit, delete tasks
4. **Task Drag/Resize** - Drag to change dates
5. **Dependency Management** - Add/remove task dependencies
6. **Auto-Scheduling Engine** - Calculate dates based on dependencies
7. **Critical Path Algorithm** - Forward/backward pass CPM
8. **Conflict Detection** - Check employee double-booking
9. **Realtime Updates** - Supabase subscription for task changes

#### Business Logic:
```typescript
// Auto-scheduling (when dependency changes)
function recalculateTaskDates(taskId: string) {
  // 1. Get all predecessors
  // 2. Find latest predecessor end date
  // 3. Apply lag days
  // 4. Set successor start date
  // 5. Recursively update successor's successors
}

// Critical Path
function calculateCriticalPath(projectId: string) {
  // 1. Forward pass: calculate early start/finish
  // 2. Backward pass: calculate late start/finish
  // 3. Tasks where ES == LS are on critical path
}

// Conflict Detection
function detectConflicts(employeeId: string, dateRange: DateRange) {
  // Query overlapping task assignments
  // Return conflicting task details
}
```

#### Deliverables:
- Split-screen Gantt/Scheduler view
- Dependency arrows
- Auto-scheduling on dependency change
- Critical path highlighting
- Conflict warnings

---

### Milestone 5: Employees
**Status**: Pending

#### Tasks:
1. **Employee List** - Grid/list view with filters
2. **Employee Detail** - Tabs for planning/availability
3. **Availability Management** - Add/edit unavailable periods
4. **Profile Linking** - Connect Employee to Supabase Profile

#### Deliverables:
- Employee directory
- Availability calendar
- Task assignment overview

---

### Milestone 6: Week Planning
**Status**: Pending

#### Tasks:
1. **Week Calendar** - Employee rows × day columns
2. **Task Aggregation** - Group assignments by day
3. **Availability Overlay** - Show sick/vacation status
4. **Week Navigation** - Previous/next week controls

#### Deliverables:
- Weekly overview of all assignments
- Visual availability indicators
- Quick navigation

---

### Milestone 7: Client Portal
**Status**: Pending

#### Tasks:
1. **Portal Layout** - Simplified navigation
2. **Portal Dashboard** - Client-specific project view
3. **Read-only Project View** - View progress, no editing
4. **Permission Enforcement** - klant_editor/klant_viewer roles

#### Deliverables:
- Client-facing dashboard
- Project progress visibility
- Role-based access control

---

### Milestone 8: Polish & Deploy
**Status**: Pending

#### Tasks:
1. **React Query Optimization** - Caching, prefetching
2. **Error Boundaries** - Graceful error handling
3. **Loading States** - Skeleton screens
4. **Dark Mode Testing** - Verify all components
5. **Responsive Testing** - Tablet/mobile layouts
6. **Vercel Deployment** - Production setup

#### Deliverables:
- Optimized performance
- Complete error handling
- Full dark mode support
- Production deployment

---

## Agent Execution Plan

To parallelize development, we'll use multiple agents:

### Agent 1: Auth & Layout
- Implements auth pages
- Creates app layout with sidebar
- Sets up protected routes

### Agent 2: Dashboard & Queries
- Wires dashboard components
- Creates React Query hooks
- Implements data aggregation

### Agent 3: Clients Module
- Client CRUD operations
- Client tree functionality
- Forms and modals

### Agent 4: Projects & Gantt Core
- Project list and detail pages
- Gantt panel integration
- Task CRUD

### Agent 5: Scheduling Engine
- Auto-scheduling logic
- Critical path calculation
- Conflict detection

### Agent 6: Employees & Week Planning
- Employee management
- Week planning calendar
- Availability tracking

---

## Success Criteria

1. ✅ Auth flow works (signup, login, magic link)
2. ⬜ Dashboard shows accurate stats
3. ⬜ Client tree with full CRUD
4. ⬜ Gantt renders tasks with dependencies
5. ⬜ Auto-scheduling triggers on dependency change
6. ⬜ Critical path calculation works
7. ⬜ Employee conflict detection works
8. ⬜ Week planning shows correct assignments
9. ⬜ Client portal restricts access correctly
10. ⬜ RLS blocks cross-workspace data
11. ⬜ Dark mode works throughout
12. ⬜ Deployed to Vercel successfully
