# Weekplanning

## Overview

Medewerker-centrische kalenderweergave die laat zien "wie werkt waar" per week.

## Components Provided

- `WeekPlanning.tsx` — Main calendar grid

## Layout

- Rows: Employees (sticky first column)
- Columns: Ma - Vr
- Cells: Tasks or availability status

## Callback Props

| Callback | Description |
|----------|-------------|
| `onTaskClick` | Navigate to project |
| `onEmployeeClick` | Navigate to employee |
| `onWeekChange` | Load different week |

## Visual Reference

See `screenshot.png` for the target UI design.
