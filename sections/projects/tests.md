# Test Instructions: Projecten

## Key User Flows to Test

### Flow 1: View Project Gantt
- Tasks render in grid with WBS numbers
- Timeline shows task bars
- Dependencies show as arrows
- Progress fills in task bars

### Flow 2: Task Operations
- Add task → new row in grid
- Edit task → side panel opens
- Update progress → bar updates
- Delete task → removed with confirm

### Flow 3: Split-Screen Sync
- Scroll Gantt → Scheduler scrolls too
- Zoom → both panels zoom
- Select task → highlighted in both

### Flow 4: Timeline Navigation
- Zoom in/out works
- "Vandaag" button shows today
- Timeline header shows dates

## Empty State Tests

- New project → empty task grid
- No assignments → scheduler shows available employees
