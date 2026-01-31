# Data Model

## Core Entiteiten

### Client (Klant)
Een bedrijf of organisatie waarvoor projecten worden uitgevoerd.

**Attributen**:
- Naam
- Adres, stad, postcode
- Telefoon, email
- Notities
- Actief status

**Relaties**:
- Heeft meerdere **Contactpersonen**
- Heeft meerdere **Locaties**
- Heeft meerdere **Projecten**

---

### Client Contact (Contactpersoon)
Een persoon bij een klant waarmee gecommuniceerd wordt.

**Attributen**:
- Naam
- Rol/functie
- Telefoon, email
- Is primair contact (ja/nee)

**Relaties**:
- Behoort tot één **Client**

---

### Client Location (Locatie)
Een fysieke werklocatie van een klant.

**Attributen**:
- Naam (bijv. "Hoofdkantoor", "Filiaal Zuid")
- Adres, stad, postcode
- Notities
- Is primaire locatie

**Relaties**:
- Behoort tot één **Client**
- Kan worden toegewezen aan **Projects**

---

### Employee (Medewerker)
Een persoon die werk uitvoert op projecten.

**Attributen**:
- Naam
- Rol (uitvoerder, voorman, specialist, projectleider)
- Email, telefoon
- Uurtarief
- Capaciteit uren per week (default 40)
- Vaardigheden (straatwerk, kitwerk, reinigen, etc.)
- Kleur (voor kalender weergave)
- Actief status

**Relaties**:
- Kan meerdere **Task Assignments** hebben
- Heeft **Availability** records

---

### Employee Availability (Beschikbaarheid)
Registratie van niet-werkbare dagen.

**Attributen**:
- Datum
- Status (beschikbaar, ziek, vakantie, vrij, training)
- Notities

**Relaties**:
- Behoort tot één **Employee**

---

### Project
Een verzameling taken uitgevoerd voor een klant.

**Attributen**:
- Naam
- Beschrijving
- Werktype (straatwerk, kitwerk, reinigen, kantoor, overig)
- Status (gepland, actief, on-hold, afgerond, geannuleerd)
- Start- en einddatum
- Budget uren
- Werkelijke uren
- Notities

**Relaties**:
- Behoort tot één **Client**
- Kan één **Location** hebben
- Heeft meerdere **Tasks**

---

### Task (Taak)
Een uit te voeren werkonderdeel binnen een project.

**Attributen**:
- WBS nummer ("1.0", "1.1", "2.0")
- Naam
- Beschrijving
- Start- en einddatum
- Duur in dagen
- Voortgang (0-100%)
- Is milestone (ja/nee)
- Is samenvatting taak (ja/nee)
- Status (todo, in_progress, done)
- Prioriteit (low, normal, high, urgent)
- Sorteervolgorde

**Relaties**:
- Behoort tot één **Project**
- Kan een **Parent Task** hebben (hiërarchie)
- Heeft meerdere **Child Tasks**
- Heeft meerdere **Dependencies** (predecessor/successor)
- Heeft meerdere **Task Assignments**

---

### Dependency (Afhankelijkheid)
Relatie tussen taken die bepaalt wanneer een taak kan starten.

**Attributen**:
- Type (FS=Finish-to-Start, SS=Start-to-Start, FF=Finish-to-Finish, SF=Start-to-Finish)
- Lag dagen (vertraging, kan negatief zijn)

**Relaties**:
- Heeft één **Predecessor Task**
- Heeft één **Successor Task**

---

### Task Assignment (Toewijzing)
Koppeling van een medewerker aan een taak.

**Attributen**:
- Geplande uren
- Werkelijke uren
- Notities

**Relaties**:
- Behoort tot één **Task**
- Behoort tot één **Employee**

---

### Time Entry (Urenregistratie)
Logging van gewerkte uren.

**Attributen**:
- Datum
- Uren
- Beschrijving

**Relaties**:
- Behoort tot één **Task**
- Behoort tot één **Employee**

---

### Equipment (Materieel)
Voertuigen, machines en gereedschap.

**Attributen**:
- Naam
- Type (voertuig, machine, gereedschap)
- Kenteken (voor voertuigen)
- Dagtarief
- Status (beschikbaar, in_gebruik, onderhoud, defect)
- Notities
- Actief status

**Relaties**:
- Heeft meerdere **Equipment Assignments**

---

### Equipment Assignment (Materieel Toewijzing)
Koppeling van materieel aan een taak.

**Attributen**:
- Start- en einddatum
- Notities

**Relaties**:
- Behoort tot één **Task**
- Behoort tot één **Equipment**

---

## Entity Relationship Diagram

```
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   Client    │─────<│ Client Contact  │      │  Employee   │
│             │      └─────────────────┘      │             │
│             │      ┌─────────────────┐      │             │
│             │─────<│ Client Location │      │             │
└──────┬──────┘      └─────────────────┘      └──────┬──────┘
       │                                             │
       │ 1:N                                         │ 1:N
       ▼                                             ▼
┌─────────────┐                              ┌──────────────────┐
│   Project   │                              │ Emp. Availability│
│             │                              └──────────────────┘
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐      ┌─────────────────┐
│    Task     │─────<│   Dependency    │
│             │      └─────────────────┘
│  (parent_id │      ┌─────────────────┐      ┌─────────────┐
│   = self)   │─────<│ Task Assignment │>─────│  Employee   │
│             │      └─────────────────┘      └─────────────┘
│             │      ┌─────────────────┐
│             │─────<│   Time Entry    │
│             │      └─────────────────┘
│             │      ┌─────────────────┐      ┌─────────────┐
│             │─────<│ Equip Assignment│>─────│  Equipment  │
└─────────────┘      └─────────────────┘      └─────────────┘
```

---

## Dependency Types

| Type | Naam | Betekenis |
|------|------|-----------|
| **FS** | Finish-to-Start | Successor start na predecessor eindigt |
| **SS** | Start-to-Start | Successor start wanneer predecessor start |
| **FF** | Finish-to-Finish | Successor eindigt wanneer predecessor eindigt |
| **SF** | Start-to-Finish | Successor eindigt wanneer predecessor start |

Default is **FS** (meest voorkomend).

---

## Status Waarden

### Project Status
- `gepland` — Nog niet gestart
- `actief` — In uitvoering
- `on-hold` — Tijdelijk gepauzeerd
- `afgerond` — Voltooid
- `geannuleerd` — Geannuleerd

### Task Status
- `todo` — Nog niet begonnen
- `in_progress` — In uitvoering
- `done` — Afgerond

### Employee Availability Status
- `beschikbaar` — Normaal inzetbaar
- `ziek` — Ziekmelding
- `vakantie` — Vakantie
- `vrij` — Vrije dag
- `training` — Opleiding/cursus
