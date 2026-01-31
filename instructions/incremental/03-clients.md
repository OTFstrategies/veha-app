# Milestone 3: Klanten (Clients)

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Foundation) complete

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

Implement the Clients section — a hierarchical tree view showing all clients with their contacts, locations, and projects.

## Overview

Centraal beheer van alle klanten met hiërarchische weergave. Elke klant kan worden ge-expand om contactpersonen, locaties en projecten te zien.

**Key Functionality:**
- View all clients in a hierarchical tree
- Expand/collapse clients to see contacts, locations, projects
- Search clients by name, city, or contact name
- Filter by active/inactive status
- Click project to navigate to Gantt view
- Add new clients, contacts, locations, projects

## Recommended Approach: Test-Driven Development

Before implementing this section, **write tests first** based on the test specifications provided.

See `product-plan/sections/clients/tests.md` for detailed test-writing instructions.

## What to Implement

### Components

Copy the section components from `product-plan/sections/clients/components/`:

- `ClientTree.tsx` — Main tree container with search/filter
- `ClientTreeNode.tsx` — Individual client with expandable groups
- `ClientTreeEmpty.tsx` — Empty state component

### Data Layer

The components expect these data shapes (see `types.ts`):

```typescript
interface Client {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  phone?: string
  email?: string
  notes?: string
  is_active: boolean
  contacts: ClientContact[]
  locations: ClientLocation[]
  projects: ClientProject[]
}

interface ClientContact {
  id: string
  name: string
  role?: string
  phone?: string
  email?: string
  is_primary: boolean
}

interface ClientLocation {
  id: string
  name: string
  address?: string
  city?: string
  postal_code?: string
  is_primary: boolean
}

interface ClientProject {
  id: string
  name: string
  status: ProjectStatus
  progress: number
  start_date?: string
  end_date?: string
}
```

### Callbacks

Wire up these user actions:

| Callback | Description |
|----------|-------------|
| `onClientSelect` | Called when client row clicked |
| `onProjectClick` | Navigate to project Gantt view |
| `onAddClient` | Open client creation form |
| `onEditClient` | Open client edit form |
| `onDeleteClient` | Delete client with confirmation |
| `onAddContact` | Add contact to client |
| `onAddLocation` | Add location to client |
| `onAddProject` | Create project for client |

### API Endpoints

You'll need endpoints for:
- List all clients with nested contacts, locations, projects
- CRUD operations for clients
- CRUD operations for contacts
- CRUD operations for locations
- Project creation (links to Projects section)

## Files to Reference

- `product-plan/sections/clients/README.md` — Feature overview
- `product-plan/sections/clients/tests.md` — Test-writing instructions
- `product-plan/sections/clients/components/` — React components
- `product-plan/sections/clients/types.ts` — TypeScript interfaces
- `product-plan/sections/clients/sample-data.json` — Test data
- `product-plan/sections/clients/screenshot.png` — Visual reference

## Expected User Flows

### Flow 1: Browse Clients

1. User navigates to Klanten
2. User sees tree with all clients (collapsed)
3. User expands client to see contacts, locations, projects
4. User can search or filter by status

### Flow 2: Navigate to Project

1. User expands client's Projecten group
2. User clicks on a project
3. User navigates to project Gantt view

### Flow 3: Add New Client

1. User clicks "Nieuwe Klant" button
2. User fills in client details
3. User saves
4. New client appears in tree

### Flow 4: Add Contact to Client

1. User expands client
2. User clicks + on Contactpersonen group
3. User fills in contact details
4. Contact appears under client

## Done When

- [ ] Client tree loads with real data
- [ ] Expand/collapse works for all levels
- [ ] Search filters clients correctly
- [ ] Status filter works
- [ ] Project clicks navigate to Gantt
- [ ] CRUD operations work for clients, contacts, locations
- [ ] Empty state shows when no clients
- [ ] Responsive on mobile
