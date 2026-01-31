# Milestone 6: Weekplanning

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete, Milestone 5 (Employees) recommended

---

## Goal

Implement the Weekplanning section — weekly calendar showing who works where.

## Overview

Medewerker-centrische kalenderweergave die laat zien "wie werkt waar". Essentieel voor voormannen en planners om de dagelijkse/wekelijkse bezetting te overzien.

**Key Functionality:**
- View week calendar with all employees as rows
- See tasks assigned per employee per day
- View availability status (sick, vacation, etc.)
- Navigate between weeks
- Click tasks to go to project

## What to Implement

### Components

- `WeekPlanning.tsx` — Main calendar grid component

### Data Structure

```typescript
interface WeekPlanningDay {
  date: string
  dayName: string
  dayNumber: number
  isToday: boolean
}

interface EmployeeWeekRow {
  employee: { id, name, role, initials, color }
  days: DayCell[]
}

interface DayCell {
  availability?: { status, notes }
  tasks: { id, name, projectName, clientName }[]
}
```

### Callbacks

| Callback | Description |
|----------|-------------|
| `onTaskClick` | Navigate to project Gantt |
| `onEmployeeClick` | Navigate to employee detail |
| `onWeekChange` | Load different week |

## Done When

- [ ] Calendar shows all active employees
- [ ] Tasks appear in correct cells
- [ ] Availability (sick/vacation) shows with colors
- [ ] Week navigation works
- [ ] Today column highlighted
- [ ] Task clicks navigate to project
- [ ] Responsive on mobile
