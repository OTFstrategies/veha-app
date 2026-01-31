# VEHA Dashboard - Test Documentation

## Test Accounts

Na het uitvoeren van de seed data, maak de volgende test accounts aan via Supabase Auth:

| Email | Wachtwoord | Rol | Beschrijving |
|-------|------------|-----|--------------|
| admin@veha.nl | demo123! | admin | Volledige toegang tot alle functionaliteit |
| planner@veha.nl | demo123! | vault_medewerker | Planning en project management |
| monteur@veha.nl | demo123! | medewerker | Bekijken eigen planning, uren invoeren |
| klant@bedrijf.nl | demo123! | klant_editor | Klantportaal, eigen projecten bekijken |

### Accounts aanmaken

1. Ga naar Supabase Dashboard > Authentication > Users
2. Klik "Add User" > "Create New User"
3. Vul email en wachtwoord in
4. Voeg de gebruiker toe aan de workspace via SQL:

```sql
-- Vervang <USER_ID> met de UUID van de aangemaakte gebruiker
INSERT INTO workspace_members (workspace_id, profile_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '<USER_ID>', 'admin');
```

---

## Test Scenario's

### 1. Authenticatie

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 1.1 | Login met email/wachtwoord | 1. Ga naar /login<br>2. Vul credentials in<br>3. Klik "Inloggen" | Redirect naar dashboard |
| 1.2 | Login met ongeldige credentials | 1. Vul verkeerde wachtwoord in<br>2. Klik "Inloggen" | Foutmelding "Ongeldige inloggegevens" |
| 1.3 | Wachtwoord vergeten | 1. Ga naar /forgot-password<br>2. Vul email in<br>3. Klik verzenden | Bevestigingsmail ontvangen |
| 1.4 | Uitloggen | 1. Klik op profiel<br>2. Klik "Uitloggen" | Redirect naar login pagina |

### 2. Dashboard

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 2.1 | Stats laden | 1. Login als admin<br>2. Bekijk dashboard | Statistieken tonen correcte aantallen |
| 2.2 | Actieve projecten | 1. Bekijk "Actieve Projecten" sectie | Toont projecten met status 'actief' |
| 2.3 | Taken vandaag | 1. Bekijk "Taken Vandaag" sectie | Toont taken waar vandaag binnen start/end date valt |
| 2.4 | Capaciteit widget | 1. Bekijk capaciteit widget | Toont werknemers met hun bezettingspercentage |
| 2.5 | Quick action navigatie | 1. Klik op quick action knop | Navigeert naar juiste pagina |

### 3. Klanten

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 3.1 | Klanten boom laden | 1. Ga naar /clients | Klanten met locaties en contacten zichtbaar |
| 3.2 | Klant toevoegen | 1. Klik "Nieuwe Klant"<br>2. Vul gegevens in<br>3. Opslaan | Klant verschijnt in boom |
| 3.3 | Klant bewerken | 1. Klik edit icon<br>2. Wijzig gegevens<br>3. Opslaan | Wijzigingen opgeslagen |
| 3.4 | Klant verwijderen | 1. Klik delete icon<br>2. Bevestig | Klant verwijderd (alleen admin) |
| 3.5 | Contact toevoegen | 1. Klik "+" bij klant<br>2. Kies "Contact"<br>3. Vul gegevens in | Contact toegevoegd aan klant |
| 3.6 | Locatie toevoegen | 1. Klik "+" bij klant<br>2. Kies "Locatie"<br>3. Vul gegevens in | Locatie toegevoegd aan klant |
| 3.7 | Zoeken | 1. Typ in zoekbalk | Boom filtert op naam/stad/contact |

### 4. Projecten & Gantt

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 4.1 | Project lijst laden | 1. Ga naar /projects | Alle projecten zichtbaar met status |
| 4.2 | Project aanmaken | 1. Klik "Nieuw Project"<br>2. Vul gegevens in<br>3. Opslaan | Project aangemaakt |
| 4.3 | Gantt weergave | 1. Klik op project | Gantt chart met taken en tijdlijn |
| 4.4 | Taak aanmaken | 1. Klik "Nieuwe Taak"<br>2. Vul gegevens in<br>3. Opslaan | Taak verschijnt in Gantt |
| 4.5 | Taak verslepen | 1. Sleep taakbalk | Datum wijzigt, afhankelijkheden updaten |
| 4.6 | Taak resizen | 1. Sleep rand van taakbalk | Duur/einddatum wijzigt |
| 4.7 | Dependency toevoegen | 1. Open taak editor<br>2. Selecteer predecessor | Pijl verschijnt tussen taken |
| 4.8 | Auto-scheduling | 1. Voeg dependency toe<br>2. Wijzig predecessor einddatum | Successor verplaatst automatisch |
| 4.9 | Critical path | 1. Bekijk project met dependencies | Kritieke taken gehighlighted |
| 4.10 | Conflict detectie | 1. Wijs werknemer aan overlappende taken | Conflict warning verschijnt |
| 4.11 | Timeline sync | 1. Scroll in Gantt panel | Scheduler panel scrollt mee |

### 5. Werknemers

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 5.1 | Werknemer lijst | 1. Ga naar /employees | Lijst met alle werknemers |
| 5.2 | Werknemer toevoegen | 1. Klik "Nieuwe Werknemer"<br>2. Vul gegevens in | Werknemer aangemaakt |
| 5.3 | Werknemer detail | 1. Klik op werknemer | Detail pagina met tabs |
| 5.4 | Planning tab | 1. Bekijk Planning tab | Toegewezen taken zichtbaar |
| 5.5 | Beschikbaarheid tab | 1. Bekijk Beschikbaarheid tab | Afwezigheid records zichtbaar |
| 5.6 | Afwezigheid toevoegen | 1. Klik "Afwezigheid"<br>2. Selecteer type/datum | Record toegevoegd |

### 6. Weekplanning

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 6.1 | Week laden | 1. Ga naar /weekplanning | Huidige week met medewerkers/dagen |
| 6.2 | Week navigatie | 1. Klik volgende/vorige week | Andere week geladen |
| 6.3 | Taken weergave | 1. Bekijk cellen | Taken in juiste medewerker/dag cel |
| 6.4 | Beschikbaarheid overlay | 1. Bekijk dag met afwezigheid | Juiste kleur overlay (ziek=rood, etc.) |

### 7. Klantportaal

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 7.1 | Portal dashboard | 1. Login als klant_editor<br>2. Bekijk /portal | Alleen eigen projecten zichtbaar |
| 7.2 | Project bekijken | 1. Klik op project | Read-only project weergave |
| 7.3 | Toegangsbeperking | 1. Probeer /dashboard te openen | Redirect naar portal |
| 7.4 | klant_viewer rol | 1. Login als klant_viewer<br>2. Probeer te bewerken | Geen edit knoppen zichtbaar |

### 8. RLS (Row Level Security)

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 8.1 | Workspace isolatie | 1. Maak 2e workspace<br>2. Login met user van workspace 1 | Data workspace 2 niet zichtbaar |
| 8.2 | Rol beperkingen | 1. Login als medewerker<br>2. Probeer klant te verwijderen | Actie geblokkeerd |

### 9. Dark Mode

| # | Scenario | Stappen | Verwacht Resultaat |
|---|----------|---------|-------------------|
| 9.1 | Toggle dark mode | 1. Klik dark mode toggle | Kleuren wisselen naar donker thema |
| 9.2 | Persistentie | 1. Ververs pagina | Dark mode instelling behouden |

---

## Checklist voor Acceptatie

- [ ] Alle authenticatie flows werken
- [ ] Dashboard toont correcte data
- [ ] Klanten CRUD volledig functioneel
- [ ] Gantt chart met dependencies werkt
- [ ] Auto-scheduling triggert bij dependency changes
- [ ] Critical path correct berekend
- [ ] Conflict detectie werkt
- [ ] Weekplanning toont juiste assignments
- [ ] Klantportaal correct afgeschermd
- [ ] RLS voorkomt cross-workspace toegang
- [ ] Dark mode werkt in alle secties
- [ ] Responsive layout op tablet

---

## Feedback Rapporteren

Gebruik het feedback formulier of mail naar: [feedback@veha.nl]

Bij bugs, graag vermelden:
1. Welk scenario/stap
2. Verwacht vs. werkelijk gedrag
3. Browser + versie
4. Screenshots indien mogelijk
