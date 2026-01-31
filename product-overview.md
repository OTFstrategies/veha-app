# VEHA Dashboard — Product Overview

## Summary

VEHA Dashboard is een complete projectplanning en resource management tool voor dienstverlenende MKB-bedrijven in Nederland. Het combineert klantenbeheer, projectplanning met Gantt-weergave, en medewerkerplanning in één overzichtelijke applicatie.

**Doelgroep:** Aannemers, schoonmaakbedrijven, onderhoudsbedrijven, installatiebedrijven (5-50 medewerkers, projectmatig werk).

## Problems & Solutions

1. **Gefragmenteerde tools** → Geïntegreerd systeem voor klanten, projecten, taken en medewerkers
2. **Complexe planning software** → Intuïtieve Gantt-weergave met alleen MKB-relevante features
3. **"Wie werkt waar?" onduidelijkheid** → Weekplanning view per medewerker met beschikbaarheid

## Planned Sections

1. **Dashboard** — Startpagina met overzicht actieve projecten, taken vandaag, capaciteit medewerkers
2. **Klanten** — Hiërarchische tree view met contactpersonen, locaties, en projecten per klant
3. **Projecten** — Gantt chart met taakhiërarchie, dependencies, voortgang en resource scheduler
4. **Medewerkers** — Teambeheer met rollen, vaardigheden en beschikbaarheid
5. **Weekplanning** — Kalenderweergave "wie werkt waar" per week

## Data Model

**Core Entities:**
- Client (Klant) — with Contacts and Locations
- Employee (Medewerker) — with Availability records
- Project — belongs to Client
- Task — belongs to Project, with hierarchy and Dependencies
- Task Assignment — links Employee to Task

See `data-model/` for complete type definitions.

## Design System

**Colors:**
- Primary: Stone (VEHA Zwart #2e2d2c) — text, headers, buttons
- Secondary: Stone (VEHA Beige #CBC4B5) — accents, task bars
- Neutral: Stone (VEHA Light #f8f7f5) — backgrounds

**Typography:**
- Heading: Inter (500, 600, 700)
- Body: Inter (400, 500)
- Mono: IBM Plex Mono (400, 500)

**Design Philosophy:** Apple-geïnspireerd, prikkelarm, veel whitespace, warme grijstinten.

## Implementation Sequence

Build this product in milestones:

1. **Foundation** — Set up design tokens, data model types, and routing structure
2. **Dashboard** — Stats overview, today's tasks, active projects, capacity widget
3. **Clients** — Hierarchical tree view with contacts, locations, projects
4. **Projects** — Gantt chart with split-screen task and resource views
5. **Employees** — Team list, detail view with planning and availability
6. **Weekplanning** — Weekly calendar grid showing assignments

Each milestone has a dedicated instruction document in `instructions/incremental/`.
