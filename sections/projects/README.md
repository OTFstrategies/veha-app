# Projecten (Projects)

## Overview

De kern van VEHA Dashboard: projectbeheer met Gantt-weergave. Split-screen design met Gantt panel (taken) en Scheduler panel (resources).

## Components Provided

- `ProjectGanttScheduler.tsx` — Main split-screen container
- `ProjectHeader.tsx` — Project title, status, client link
- `GanttToolbar.tsx` — Zoom controls, view options
- `GanttPanel.tsx` — Task-oriented Gantt view
- `SchedulerPanel.tsx` — Resource-oriented view
- `SharedTimeline.tsx` — Synchronized timeline
- `TaskBar.tsx` — Task bars in timeline
- `DependencyArrow.tsx` — SVG dependency arrows
- `TaskEditor.tsx` — Task edit side panel

## Critical: Split-Screen Design

Both panels share the same timeline and synchronize:
- Horizontal scroll
- Zoom level
- Task selection

## Callback Props

| Callback | Description |
|----------|-------------|
| `onTaskSelect` | Select task |
| `onTaskEdit` | Open editor |
| `onTaskAdd` | Add new task |
| `onZoomChange` | Change zoom level |

## Visual Reference

See `screenshot.png` for the target UI design.
