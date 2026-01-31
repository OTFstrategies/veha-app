# Test Instructions: Klanten

## Key User Flows to Test

### Flow 1: Browse Clients
- Client tree loads with all clients
- Expand/collapse works on client nodes
- Search filters by name, city, contact

### Flow 2: View Client Details
- Expand client shows Contactpersonen, Locaties, Projecten groups
- Each group shows count
- Items display correctly with details

### Flow 3: Navigate to Project
- Click project in tree → navigate to Gantt
- Project shows status badge and progress

### Flow 4: CRUD Operations
- Add client → appears in tree
- Edit client → changes saved
- Delete client → removed with confirmation
- Add contact/location → appears under client

## Empty State Tests

- No clients → shows ClientTreeEmpty component
- Client with no contacts → shows "(geen contactpersonen)"
- Client with no projects → shows "(geen projecten)"
- Search with no results → shows appropriate message
