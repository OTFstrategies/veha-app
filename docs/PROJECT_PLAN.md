# VEHA Dashboard - Projectplan

## Projectoverzicht

**Project:** VEHA Dashboard - Project Planning & Resource Management Tool
**Klant:** VEHA Ontzorgt (Nederlandse MKB dienstverlener)
**Versie:** 1.1
**Status:** In Ontwikkeling
**Live URL:** https://veha-app.vercel.app

---

## Doelstelling

Een complete project planning en resource management tool voor Nederlandse MKB-bedrijven in de dienstverlening, met focus op:
- Projectplanning met Gantt-weergave
- Resource management en weekplanning
- Klantenbeheer met hierarchische structuur
- Multi-tenant workspace architectuur

---

## Technische Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 14 (App Router) |
| Styling | TailwindCSS + shadcn/ui |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| State | React Query + Zustand |
| Hosting | Vercel |
| Taal | TypeScript |

---

## Database Schema

### Tabellen (15 totaal)

```
Core:
├── workspaces          - Multi-tenant workspaces
├── profiles            - Gebruikersprofielen
└── workspace_members   - Workspace lidmaatschap + rollen

Klanten:
├── clients             - Klantgegevens
├── client_contacts     - Contactpersonen
└── client_locations    - Locaties/vestigingen

Medewerkers:
├── employees           - Personeelsgegevens
└── employee_availability - Beschikbaarheid (ziek/vakantie)

Projecten:
├── projects            - Projecten
├── tasks               - Taken
├── task_dependencies   - Afhankelijkheden tussen taken
└── task_assignments    - Toewijzingen aan medewerkers

Resources:
├── equipment           - Materieel/gereedschap
├── equipment_assignments - Materieeltoewijzingen
└── time_entries        - Urenregistratie
```

### Gebruikersrollen

| Rol | Rechten |
|-----|---------|
| `admin` | Volledige toegang |
| `vault_medewerker` | Intern personeel, volledige projecttoegang |
| `medewerker` | Medewerker, alleen toegewezen werk zien |
| `klant_editor` | Klant, eigen projecten bewerken |
| `klant_viewer` | Klant, alleen lezen |

---

## Milestone Status

### Milestone 0: Project Setup
**Status:** VOLTOOID

- [x] Next.js project geinitialiseerd
- [x] Dependencies geinstalleerd
- [x] TailwindCSS geconfigureerd met VEHA kleuren
- [x] Design tokens toegevoegd
- [x] Fonts geconfigureerd (Inter, IBM Plex Mono)
- [x] Supabase project aangemaakt
- [x] shadcn/ui componenten geinstalleerd

---

### Milestone 1: Database & Auth
**Status:** VOLTOOID

- [x] Database migraties aangemaakt (3 migraties)
- [x] RLS policies geimplementeerd
- [x] Security fix voor function search_path
- [x] Auth pages: `/login`, `/signup`, `/forgot-password`
- [x] Supabase client utilities
- [x] `useAuth`, `useWorkspace` hooks
- [x] Workspace selector UI
- [x] Next.js middleware voor protected routes

**Verificatie:**
- Email/wachtwoord login werkt
- RLS blokkeert cross-workspace toegang

---

### Milestone 2: Dashboard
**Status:** VOLTOOID

- [x] Dashboard pagina met stats cards
- [x] Vandaag widget met taken
- [x] Actieve projecten overzicht
- [x] Capaciteit widget per medewerker
- [x] Quick actions (Nieuw Project, Nieuwe Taak, Weekplanning)

**Verificatie:**
- Stats tonen correcte aantallen
- Capaciteit widget toont benutting

---

### Milestone 3: Clients
**Status:** VOLTOOID

- [x] Client tree component
- [x] Hierarchische weergave (klant -> contacten -> locaties)
- [x] CRUD operaties voor clients
- [x] Zoekfunctionaliteit
- [x] Modal forms voor create/edit

**Verificatie:**
- Tree toont klanten met uitklapbare children
- Zoeken filtert op naam/stad/contact
- Create, edit, delete werkt

---

### Milestone 4: Projects & Gantt
**Status:** VOLTOOID

- [x] Project lijst met filters
- [x] Project detail pagina
- [x] Gantt chart weergave
- [x] Task lijst met WBS nummering
- [x] Timeline met maand/dag weergave
- [x] Task bars op correcte posities
- [x] Resource panel met medewerkers
- [x] Taak toevoegen functionaliteit
- [x] Task drag-to-move
- [x] Task resize handles
- [x] Undo/Redo buttons in Gantt toolbar
- [x] Keyboard shortcuts (Ctrl+Z/Y) voor undo/redo
- [x] Conflict detectie waarschuwingen
- [x] Cascade preview bij dependency wijzigingen
- [ ] Dependency arrows renderen (visueel)
- [ ] Critical path highlighting (visueel toggle aanwezig)

**Verificatie:**
- Gantt toont taken op correcte tijdlijn
- Split panels scrollen synchroon
- Undo/redo werkt met toast feedback
- Conflict badge toont dubbele boekingen
- Cascade preview toont affected tasks

---

### Milestone 5: Employees
**Status:** VOLTOOID

- [x] Medewerker lijst met grid/list toggle
- [x] Medewerker detail pagina
- [x] Planning tab met toegewezen taken
- [x] Beschikbaarheid tab
- [x] Activeren/Deactiveren functionaliteit
- [x] Bewerken functionaliteit

**Verificatie:**
- Lijst toont alle medewerkers met filters
- Detail toont toewijzingen en beschikbaarheid
- Activeren/deactiveren werkt

---

### Milestone 6: Week Planning
**Status:** VOLTOOID

- [x] Week kalender weergave
- [x] Medewerker rijen
- [x] Dag kolommen (ma-vr)
- [x] Week navigatie
- [x] Taken tonen per medewerker/dag

**Verificatie:**
- Kalender toont huidige week met navigatie
- Taken verschijnen in correcte cellen
- Beschikbaarheid overlays werken

---

### Milestone 7: Client Portal
**Status:** VOLTOOID

- [x] Portal layout in `src/app/(portal)/`
- [x] Portal dashboard voor klanten
- [x] Read-only project weergave
- [x] Read-only Gantt view
- [x] Task progress bars
- [x] `klant_editor`/`klant_viewer` permissies

**Verificatie:**
- Portal toont projecten met progress
- Gantt toont taken read-only
- Klant kan alleen eigen projecten zien

---

### Milestone 8: Polish & Deploy
**Status:** VOLTOOID

- [x] React Query caching
- [x] Error boundaries
- [x] Loading skeletons
- [x] Dark mode volledig getest
- [x] Responsive breakpoints
- [x] Deployed naar Vercel
- [x] Toast notifications (all CRUD operations)
- [x] Action menus voor resources
- [ ] Optimistic updates

---

## Test Resultaten

**Datum:** 4 februari 2026
**Totaal:** 48 tests uitgevoerd, 48 geslaagd

| Categorie | Tests | Status |
|-----------|-------|--------|
| Feature 1-3 (Resources) | 12 | Alle geslaagd |
| Feature 4 (CRUD Toasts) | 5 | Alle geslaagd |
| Feature 5-6 (Portal) | 11 | Alle geslaagd |
| Feature 7-10 (Gantt) | 20 | Alle geslaagd |

---

## Resterende Werkzaamheden

### Medium Prioriteit

| Item | Beschrijving | Geschatte Inspanning |
|------|--------------|---------------------|
| Dependency Arrows | Visuele pijlen tussen taken in Gantt | Medium |
| Critical Path Visual | Rode highlighting van kritieke pad | Klein |

### Lage Prioriteit

| Item | Beschrijving | Geschatte Inspanning |
|------|--------------|---------------------|
| Optimistic Updates | Snellere UI response | Klein |
| Magic Link Auth | Passwordless login optie | Klein |
| Export functie | PDF/Excel export van planning | Medium |
| Mobile-friendly Portal | Responsive portal layout | Medium |

---

## Infrastructuur

### Supabase Project

- **Project ID:** ikpmlhmbooaxfrlpzcfa
- **URL:** https://ikpmlhmbooaxfrlpzcfa.supabase.co
- **Database:** VEHA Hub (gedeelde database met veha-hub.vercel.app)
- **Region:** EU
- **Plan:** Pro

> **Let op:** VEHA Dashboard gebruikt nu de VEHA Hub database voor SSO en gedeelde workspace data.

### Vercel Deployment

- **URL:** https://veha-app.vercel.app
- **Framework:** Next.js
- **Node Version:** 18.x

---

## Projectstructuur

```
veha-app/
├── supabase/
│   └── migrations/           # Database migraties
│       ├── 001_initial_schema.sql
│       ├── 002_fix_function_search_path.sql
│       └── 003_sample_data.sql
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login, signup, forgot-password
│   │   ├── (app)/            # Protected routes
│   │   │   ├── dashboard/
│   │   │   ├── clients/
│   │   │   ├── projects/[id]/
│   │   │   ├── employees/[id]/
│   │   │   └── weekplanning/
│   │   └── (portal)/         # Client portal
│   ├── components/
│   │   ├── ui/               # shadcn/ui componenten
│   │   ├── layout/           # Sidebar, Header
│   │   ├── dashboard/        # Dashboard widgets
│   │   ├── clients/          # Client tree
│   │   ├── projects/         # Gantt, TaskEditor
│   │   ├── employees/        # Employee list/detail
│   │   ├── portal/           # Portal components
│   │   └── weekplanning/     # Week calendar
│   ├── lib/
│   │   ├── supabase/         # Client utilities
│   │   ├── scheduling/       # Auto-scheduling, conflict detection
│   │   └── utils/            # Helpers
│   ├── hooks/                # React hooks
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript definitions
├── docs/
│   ├── PROJECT_PLAN.md       # Dit document
│   ├── plans/                # Implementation plans
│   ├── test-reports/         # Test reports
│   └── verifications/        # Verification reports
└── public/
```

---

## Contactgegevens

**Admin Account:** stelten@vehaontzorgt.nl
**Workspace:** VEHA Ontzorgt

---

## Changelog

| Datum | Versie | Wijzigingen |
|-------|--------|-------------|
| 31-01-2026 | 1.0.0 | Initiele release met core functionaliteit |
| 04-02-2026 | 1.1.0 | Features 1-10: Toast notifications, Portal improvements, Gantt undo/redo, Conflict detection, Cascade preview |

---

*Document bijgewerkt op: 4 februari 2026*
