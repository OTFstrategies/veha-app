# Milestone 1: Foundation

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the foundational elements: design tokens, data model types, routing structure, and base layout.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Key Colors:**
- Primary: stone-800 (#2e2d2c) — text, headers, buttons
- Secondary: stone-300 (#CBC4B5) — accents, task bars
- Neutral: stone-50 (#f8f7f5) — backgrounds

**Fonts:**
- Inter — headings and body text
- IBM Plex Mono — data tables, WBS numbers, dates

### 2. Data Model Types

Create TypeScript interfaces for your core entities. See `product-plan/data-model/README.md` for the complete data model.

**Core Entities:**
- Client (with nested Contacts and Locations)
- Employee (with Availability records)
- Project (belongs to Client)
- Task (belongs to Project, supports hierarchy)
- TaskAssignment (links Employee to Task)
- Dependency (links predecessor/successor Tasks)

### 3. Database Schema

Based on the data model, create your database tables:

**Primary Tables:**
- `clients` — id, name, address, city, postal_code, phone, email, notes, is_active
- `client_contacts` — id, client_id, name, role, phone, email, is_primary
- `client_locations` — id, client_id, name, address, city, postal_code, is_primary
- `employees` — id, name, role, email, phone, hourly_rate, capacity_hours, skills[], color, is_active
- `employee_availability` — id, employee_id, date, status, notes
- `projects` — id, client_id, location_id, name, description, work_type, status, start_date, end_date, budget_hours
- `tasks` — id, project_id, parent_id, wbs, name, description, start_date, end_date, duration_days, progress, is_milestone, is_summary, status, priority, sort_order
- `task_assignments` — id, task_id, employee_id, planned_hours, actual_hours, notes
- `dependencies` — id, predecessor_id, successor_id, type, lag_days

### 4. Routing Structure

Create placeholder routes for each section:

| Route | Section | Description |
|-------|---------|-------------|
| `/` | Dashboard | Main overview page |
| `/clients` | Clients | Client tree view |
| `/clients/:id` | Client Detail | Individual client (future) |
| `/projects` | Projects | Project list |
| `/projects/:id` | Project Detail | Gantt chart view |
| `/employees` | Employees | Team list |
| `/employees/:id` | Employee Detail | Individual employee |
| `/weekplanning` | Weekplanning | Weekly calendar |

### 5. Base Layout

Create a simple layout structure:
- Sidebar navigation (can be placeholder)
- Main content area
- Responsive breakpoints

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/data-model/` — Type definitions

## Done When

- [ ] Design tokens are configured (colors, fonts imported)
- [ ] Data model types are defined in TypeScript
- [ ] Database schema is created
- [ ] Routes exist for all sections (can be placeholder pages)
- [ ] Base layout renders with navigation structure
- [ ] Light/dark mode toggle works
- [ ] Responsive on mobile
