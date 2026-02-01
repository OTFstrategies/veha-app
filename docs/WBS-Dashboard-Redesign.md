# Work Breakdown Structure: VEHA Dashboard Redesign

## Document Info
- **Versie**: 1.0
- **Datum**: 2026-02-01
- **Status**: Draft - Wacht op goedkeuring

---

## Overzicht Hoofdcategorieën

| # | Categorie | Prioriteit | Complexiteit |
|---|-----------|------------|--------------|
| 1 | Sidebar Redesign | Hoog | Medium |
| 2 | Dashboard Minimalistisch | Hoog | Hoog |
| 3 | Clients Optimalisatie | Medium | Laag |
| 4 | Projects Uitbreiding | Hoog | Hoog |
| 5 | Resources (was: Employees) | Hoog | Medium |
| 6 | Weekplanning Herstructurering | Medium | Medium |

---

## 1. SIDEBAR REDESIGN

### 1.1 Sidebar Layout Aanpassen
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 1.1.1 | Collapsed state als default | Sidebar standaard ingeklapt met alleen iconen | - |
| 1.1.2 | Hover/click expand | Bij hover of klik sidebar uitklappen met tekst labels | 1.1.1 |
| 1.1.3 | Smooth animatie | CSS transitie voor in/uitklappen (300ms ease) | 1.1.1 |
| 1.1.4 | Icoon-only mode styling | Iconen centreren, consistent formaat (24px) | 1.1.1 |

### 1.2 Theme Toggle Verplaatsen
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 1.2.1 | Verwijderen uit header | Dark/light mode knop uit rechtsboven header halen | - |
| 1.2.2 | Toevoegen aan sidebar | Theme toggle onderaan sidebar plaatsen | 1.2.1 |
| 1.2.3 | Icoon-only weergave | Zon/maan icoon in collapsed state | 1.2.2, 1.1.1 |

### 1.3 User Profile Verplaatsen
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 1.3.1 | Verwijderen uit header | User menu uit rechtsboven header halen | - |
| 1.3.2 | Toevoegen links-onder sidebar | Profiel sectie onderaan sidebar | 1.3.1 |
| 1.3.3 | Avatar in collapsed state | Alleen avatar tonen wanneer ingeklapt | 1.3.2, 1.1.1 |
| 1.3.4 | Expanded profile info | Naam + rol tonen bij uitgeklapte sidebar | 1.3.3 |
| 1.3.5 | Dropdown menu behouden | Logout, settings etc. in dropdown | 1.3.2 |

### 1.4 Header Cleanup
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 1.4.1 | Header vereenvoudigen | Alleen paginatitel behouden | 1.2.1, 1.3.1 |
| 1.4.2 | Meer whitespace header | Padding aanpassen voor cleaner look | 1.4.1 |

---

## 2. DASHBOARD MINIMALISTISCH REDESIGN

### 2.1 Quick Actions Herontwerp
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 2.1.1 | Verwijderen huidige knoppen | "Nieuw Project", "Nieuwe Taak", "Weekplanning" verwijderen | - |
| 2.1.2 | Enkele FAB (Floating Action Button) | Eén plus-knop rechtsboven of rechtsonder | 2.1.1 |
| 2.1.3 | FAB dropdown menu | Bij klik: opties voor Project, Taak, etc. | 2.1.2 |
| 2.1.4 | Keyboard shortcuts | Sneltoetsen voor quick actions (Ctrl+P, Ctrl+T) | 2.1.3 |

### 2.2 Stats Cards Minimaliseren
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 2.2.1 | Iconen verwijderen | Geen iconen meer in stats cards | - |
| 2.2.2 | Tekst reduceren | Alleen essentiële labels, korter | 2.2.1 |
| 2.2.3 | Compacter formaat | Kleinere cards met meer whitespace ertussen | 2.2.2 |
| 2.2.4 | Subtielere styling | Geen borders, subtiele achtergrond of geen | 2.2.3 |

### 2.3 Collapsible Sections
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 2.3.1 | Vandaag sectie inklapbaar | Accordion component voor "Vandaag" | - |
| 2.3.2 | Capaciteit sectie inklapbaar | Accordion voor "Capaciteit Deze Week" | - |
| 2.3.3 | Actieve Projecten inklapbaar | Accordion voor projecten overzicht | - |
| 2.3.4 | Smooth animatie | Vloeiende open/close transitie | 2.3.1-2.3.3 |
| 2.3.5 | State persistence | Onthouden welke secties open/dicht zijn | 2.3.4 |

### 2.4 Whitespace & Layout
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 2.4.1 | Grid herindeling | Meer ruimte tussen elementen | - |
| 2.4.2 | Padding vergroten | Minimaal 24px padding rondom secties | 2.4.1 |
| 2.4.3 | Font sizes reviewen | Consistente, cleane typografie | 2.4.2 |
| 2.4.4 | Color palette simplificeren | Minder kleuren, meer contrast | 2.4.3 |

---

## 3. CLIENTS OPTIMALISATIE

### 3.1 Nieuwe Klant Knop
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 3.1.1 | Knop vereenvoudigen | Simpeler design, mogelijk alleen icoon | - |
| 3.1.2 | Consistentie met FAB pattern | Zelfde stijl als dashboard quick action | 2.1.2 |

### 3.2 In/Uitklappen Toggle
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 3.2.1 | Verwijderen plus/min knoppen | Huidige "Alles uitklappen/inklappen" weg | - |
| 3.2.2 | Enkele toggle knop | Eén knop die switcht tussen states | 3.2.1 |
| 3.2.3 | Duidelijk icoon | Expand/collapse icoon (bijv. chevrons) | 3.2.2 |

### 3.3 Sterretje (Primair) Behouden
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 3.3.1 | Documentatie | Tooltip toevoegen: "Primair contactpersoon" | - |

---

## 4. PROJECTS UITBREIDING

### 4.1 Quick Add vanuit Overzicht
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.1.1 | Plus knop in project cards | Direct nieuw project kunnen starten | - |
| 4.1.2 | Inline project creation | Snelle aanmaak zonder volledige modal | 4.1.1 |

### 4.2 Globale Kanban View
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.2.1 | Nieuwe pagina/tab "Kanban" | Globaal kanban overzicht alle projecten | - |
| 4.2.2 | Kolommen: Status-based | Gepland, Actief, On-hold, Afgerond | 4.2.1 |
| 4.2.3 | Project cards in kanban | Project info met klant, locatie | 4.2.2 |
| 4.2.4 | Drag & drop status wijzigen | Projecten verslepen tussen kolommen | 4.2.3 |
| 4.2.5 | Filtering | Filter op klant, type werk, etc. | 4.2.4 |

### 4.3 Globale Gantt View
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.3.1 | Nieuwe pagina/tab "Gantt" | Globaal Gantt overzicht alle projecten | - |
| 4.3.2 | Projecten als bars | Projecten (niet taken) als Gantt items | 4.3.1 |
| 4.3.3 | Klant/locatie labels | Per project de klant tonen | 4.3.2 |
| 4.3.4 | Resources sidebar | Resources kunnen toewijzen aan projecten | 4.3.3 |
| 4.3.5 | Duur in bars (geen kolom) | Geen aparte duur kolom, zichtbaar in bar | 4.3.2 |

### 4.4 Gantt Zoom Functionaliteit
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.4.1 | Scroll zoom implementeren | Mouse wheel / pinch zoom | - |
| 4.4.2 | Dag niveau zoom in | Inzoomen tot dagoverzicht | 4.4.1 |
| 4.4.3 | Jaar niveau zoom uit | Uitzoomen tot jaaroverzicht | 4.4.1 |
| 4.4.4 | Smooth zoom transitie | Vloeiende zoom animatie | 4.4.2, 4.4.3 |
| 4.4.5 | Verwijderen view toggle knoppen | Week/Maand/Kwartaal knoppen weg | 4.4.4 |

### 4.5 Toolbar Simplificeren
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.5.1 | Dropdown voor opties | Eén dropdown met alle acties | - |
| 4.5.2 | Taak toevoegen in dropdown | "Nieuwe taak" optie | 4.5.1 |
| 4.5.3 | Afhankelijkheden in dropdown | Toggle in dropdown menu | 4.5.1 |
| 4.5.4 | Kritieke pad in dropdown | Toggle in dropdown menu | 4.5.1 |
| 4.5.5 | "Vandaag" knop behouden | Standalone blijft | - |
| 4.5.6 | Herstel knoppen behouden | Undo/reset standalone | - |
| 4.5.7 | Weergave toggles verwijderen | Vervangen door zoom | 4.4.5 |

### 4.6 Notities & Kleine Taken
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 4.6.1 | Notitie sectie toevoegen | Per project notities kunnen maken | - |
| 4.6.2 | Quick tasks type | Kleine taken: "Bel X", "Bestel Y" | - |
| 4.6.3 | Notitie editor | Rich text of markdown support | 4.6.1 |
| 4.6.4 | Quick task checklist | Checkboxes voor kleine taken | 4.6.2 |

---

## 5. RESOURCES (VOORHEEN EMPLOYEES)

### 5.1 Hernoemen naar Resources
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 5.1.1 | Menu item hernoemen | "Employees" → "Resources" | - |
| 5.1.2 | Page title aanpassen | Header aanpassen | 5.1.1 |
| 5.1.3 | Database/API updates | Endpoints en modellen updaten indien nodig | 5.1.2 |

### 5.2 Resource Categorieën
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 5.2.1 | Tabs voor categorieën | Medewerkers, Materialen, Middelen | 5.1.1 |
| 5.2.2 | Medewerkers tab | Human resources (huidige employees) | 5.2.1 |
| 5.2.3 | Materialen tab | Equipment (bijv. hogedrukunits) | 5.2.1 |
| 5.2.4 | Middelen tab | Overige resources | 5.2.1 |
| 5.2.5 | Database model Materialen | Nieuwe tabel voor materialen | 5.2.3 |
| 5.2.6 | Database model Middelen | Nieuwe tabel voor middelen | 5.2.4 |
| 5.2.7 | Beschikbaarheid tracking | Per resource: waar ingezet, wanneer vrij | 5.2.5, 5.2.6 |

### 5.3 Avatar/Cards Redesign
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 5.3.1 | Verwijderen gekleurde avatars | Geen AH, BV, etc. met felle kleuren | - |
| 5.3.2 | Minimalistisch avatar design | Subtiele initialen of foto | 5.3.1 |
| 5.3.3 | Card layout vereenvoudigen | Minder visuele elementen | 5.3.2 |
| 5.3.4 | Consistent met rest van app | Zelfde design taal als andere pagina's | 5.3.3 |

### 5.4 Nieuwe Resource Knop
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 5.4.1 | Knop vereenvoudigen | Simpeler, consistent met FAB pattern | 2.1.2 |
| 5.4.2 | Context-aware | Knop past aan op actieve tab (Medewerker/Materiaal/Middel) | 5.2.1 |

---

## 6. WEEKPLANNING HERSTRUCTURERING

### 6.1 Verplaatsen onder Resources
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 6.1.1 | Verwijderen uit hoofdmenu | Weekplanning niet meer als los menu item | 5.1.1 |
| 6.1.2 | Sub-navigatie Resources | Tab of sectie binnen Resources pagina | 6.1.1 |
| 6.1.3 | URL structuur aanpassen | /resources/planning of /resources?view=planning | 6.1.2 |

### 6.2 Resource Type Switcher
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 6.2.1 | Toggle: Medewerkers | Planning view voor medewerkers | 6.1.2 |
| 6.2.2 | Toggle: Materialen | Planning view voor materialen | 6.1.2, 5.2.3 |
| 6.2.3 | Toggle: Middelen | Planning view voor middelen | 6.1.2, 5.2.4 |
| 6.2.4 | Gecombineerde view | Alle resources in één overzicht (optioneel) | 6.2.1-6.2.3 |

### 6.3 Uren Beschikbaarheid Display
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 6.3.1 | Per cel: uren info | Bij klik/hover: beschikbaar vs ingepland | 6.1.2 |
| 6.3.2 | Visuele indicator | Progress bar of kleurcodering | 6.3.1 |
| 6.3.3 | Tooltip met details | "Jan: 6/8 uur ingepland" | 6.3.2 |
| 6.3.4 | Quick edit mogelijkheid | Direct uren kunnen aanpassen | 6.3.3 |

### 6.4 Bezetting Overzicht
| ID | Taak | Beschrijving | Afhankelijk van |
|----|------|--------------|-----------------|
| 6.4.1 | Totaal bezetting per dag | Overzicht alle resources samen | 6.3.1 |
| 6.4.2 | Overboeking warning | Alert bij >100% bezetting | 6.4.1 |
| 6.4.3 | Capaciteit summary | Header met totaal beschikbaar/ingepland | 6.4.2 |

---

## Implementatie Volgorde (Voorgesteld)

### Fase 1: Basis Redesign (Sidebar + Dashboard)
1. 1.1 Sidebar Layout
2. 1.2 Theme Toggle
3. 1.3 User Profile
4. 2.1 Quick Actions
5. 2.2 Stats Cards
6. 2.4 Whitespace & Layout

### Fase 2: Dashboard Interactie
1. 2.3 Collapsible Sections
2. 3.1 Clients Knop
3. 3.2 In/Uitklappen Toggle

### Fase 3: Resources Herstructurering
1. 5.1 Hernoemen
2. 5.2 Categorieën (incl. database)
3. 5.3 Avatar Redesign
4. 5.4 Nieuwe Resource Knop

### Fase 4: Weekplanning Integratie
1. 6.1 Verplaatsen
2. 6.2 Resource Switcher
3. 6.3 Uren Display
4. 6.4 Bezetting Overzicht

### Fase 5: Projects Uitbreiding
1. 4.1 Quick Add
2. 4.5 Toolbar Simplificeren
3. 4.6 Notities & Quick Tasks
4. 4.4 Gantt Zoom

### Fase 6: Globale Views
1. 4.2 Globale Kanban
2. 4.3 Globale Gantt

---

## Totaal Overzicht

| Categorie | Aantal Taken | Geschatte Complexiteit |
|-----------|--------------|------------------------|
| 1. Sidebar | 15 | Medium |
| 2. Dashboard | 17 | Hoog |
| 3. Clients | 4 | Laag |
| 4. Projects | 24 | Hoog |
| 5. Resources | 15 | Medium |
| 6. Weekplanning | 13 | Medium |
| **TOTAAL** | **88** | - |

---

## Open Vragen voor Opdrachtgever

1. **FAB positie**: Rechtsboven of rechtsonder voor de + knop?
2. **Collapsed sidebar width**: 64px of 80px wanneer ingeklapt?
3. **Resource types**: Zijn er naast Medewerkers, Materialen, Middelen nog andere categorieën?
4. **Notities format**: Plain text, markdown, of rich text editor?
5. **Gantt zoom levels**: Wat is het minimum (uur?) en maximum (5 jaar?) zoom niveau?
6. **Materialen tracking**: Moeten materialen ook uren hebben of alleen beschikbaar ja/nee?

---

*Dit document dient als basis voor implementatie. Elke taak moet worden goedgekeurd voordat ontwikkeling start.*
