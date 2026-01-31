# Milestone 5: Medewerkers (Employees)

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

---

## Goal

Implement the Employees section — team management with roles, skills, planning, and availability.

## Overview

Beheer van medewerkers met hun rollen, vaardigheden en beschikbaarheid. Basis voor resource toewijzingen in projecten en weekplanning.

**Key Functionality:**
- View all employees in grid or list view
- Search and filter by role or status
- View employee detail with planning tab
- Track availability (sick, vacation, etc.)

## What to Implement

### Components

- `EmployeeList.tsx` — Main list with grid/list toggle
- `EmployeeDetail.tsx` — Detail view with Planning and Availability tabs

### Callbacks

| Callback | Description |
|----------|-------------|
| `onEmployeeSelect` | Navigate to employee detail |
| `onAddEmployee` | Open employee creation form |
| `onEditEmployee` | Open employee edit form |
| `onAddAvailability` | Add availability record |

## Done When

- [ ] Employee list loads with real data
- [ ] Grid and list views work
- [ ] Search and filters function
- [ ] Employee detail shows info and tabs
- [ ] Planning tab shows assignments
- [ ] Availability CRUD works
- [ ] Responsive on mobile
