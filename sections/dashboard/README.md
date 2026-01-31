# Dashboard

## Overview

Het Dashboard is de startpagina van VEHA Dashboard. Het geeft gebruikers een direct overzicht van de huidige status: actieve projecten, taken voor vandaag, capaciteit van medewerkers, en quick actions.

## Components Provided

- `Dashboard.tsx` — Main layout combining all widgets
- `StatsCards.tsx` — Four stat cards (projects, tasks, availability, attention)
- `TodayTasks.tsx` — Today's tasks grouped by project
- `ActiveProjects.tsx` — Project cards grid with progress
- `CapacityWidget.tsx` — Employee capacity bars
- `QuickActions.tsx` — Quick action buttons

## Callback Props

| Callback | Description |
|----------|-------------|
| `onTaskClick` | Navigate to project Gantt |
| `onProjectClick` | Navigate to project detail |
| `onStatCardClick` | Navigate to relevant section |
| `onNewProject` | Open project creation |
| `onNewTask` | Open task creation |
| `onWeekplanning` | Navigate to weekplanning |

## Visual Reference

See `screenshot.png` for the target UI design.
