# Test Instructions: Dashboard

## Key User Flows to Test

### Flow 1: View Statistics
- Stats cards display correct counts
- Clicking stat card navigates to relevant section

### Flow 2: Today's Tasks
- Tasks grouped by project
- Click task → navigate to project Gantt
- Empty state when no tasks today

### Flow 3: Active Projects
- Project cards show name, client, progress
- Click project → navigate to detail
- Empty state when no active projects

### Flow 4: Capacity Widget
- Shows employee hours (planned/available)
- Overbooked employees highlighted in red
- Click "Weekplanning" navigates correctly

## Empty State Tests

- No tasks today → shows "Geen taken gepland voor vandaag"
- No active projects → shows empty state
- No employees → capacity widget handles gracefully
