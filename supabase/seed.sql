-- =============================================================================
-- VEHA Dashboard - Seed Data
-- Run this after applying all migrations
-- =============================================================================

-- Note: This seed file uses fixed UUIDs for predictable demo data.
-- In production, these would be generated dynamically.

-- =============================================================================
-- 1. Workspace
-- =============================================================================

INSERT INTO workspaces (id, name, slug) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'VEHA Demo', 'veha-demo');

-- =============================================================================
-- 2. Clients (5 clients with contacts and locations)
-- =============================================================================

-- Client 1: Gemeente Amsterdam
INSERT INTO clients (id, workspace_id, name, address, city, postal_code, phone, email, notes, is_active) VALUES
  ('10000000-0000-0000-0000-000000000001', 
   '00000000-0000-0000-0000-000000000001',
   'Gemeente Amsterdam', 
   'Amstel 1', 
   'Amsterdam', 
   '1011 PN', 
   '020-1234567', 
   'beheer@amsterdam.nl',
   'Jaarcontract voor openbare ruimte onderhoud',
   true);

INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
  ('11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Jan de Vries', 'Projectmanager', '06-12345678', 'j.devries@amsterdam.nl', true),
  ('11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Karin Bakker', 'Teamleider Beheer', '06-23456789', 'k.bakker@amsterdam.nl', false);

INSERT INTO client_locations (id, client_id, name, address, city, postal_code, is_primary) VALUES
  ('12000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Centrum', 'Dam 1', 'Amsterdam', '1012 JL', true),
  ('12000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Zuid', 'Zuidas 100', 'Amsterdam', '1082 MD', false),
  ('12000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'West', 'Haarlemmerweg 200', 'Amsterdam', '1051 HX', false);

-- Client 2: Woningcorporatie Eigen Haard
INSERT INTO clients (id, workspace_id, name, address, city, postal_code, phone, email, notes, is_active) VALUES
  ('10000000-0000-0000-0000-000000000002', 
   '00000000-0000-0000-0000-000000000001',
   'Eigen Haard', 
   'Arlandaweg 88', 
   'Amsterdam', 
   '1043 EX', 
   '020-9876543', 
   'onderhoud@eigenhaard.nl',
   'Planmatig onderhoud en gevelrenovatie projecten',
   true);

INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
  ('11000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Marieke Jansen', 'Coördinator Onderhoud', '06-34567890', 'm.jansen@eigenhaard.nl', true);

INSERT INTO client_locations (id, client_id, name, address, city, postal_code, is_primary) VALUES
  ('12000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Complex Oost', 'Molukkenstraat 50-100', 'Amsterdam', '1095 AW', true),
  ('12000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Complex Noord', 'Buiksloterdijk 1-50', 'Amsterdam', '1034 SB', false);

-- Client 3: VVE De Pijp
INSERT INTO clients (id, workspace_id, name, address, city, postal_code, phone, email, notes, is_active) VALUES
  ('10000000-0000-0000-0000-000000000003', 
   '00000000-0000-0000-0000-000000000001',
   'VVE De Pijp', 
   'Ferdinand Bolstraat 150', 
   'Amsterdam', 
   '1072 LN', 
   '020-5551234', 
   'bestuur@vvedepijp.nl',
   'Kleinschalige gevelrenovatie en kitwerk',
   true);

INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
  ('11000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003', 'Peter van Dam', 'Voorzitter', '06-45678901', 'p.vandam@vvedepijp.nl', true);

INSERT INTO client_locations (id, client_id, name, address, city, postal_code, is_primary) VALUES
  ('12000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Hoofdlocatie', 'Ferdinand Bolstraat 150', 'Amsterdam', '1072 LN', true);

-- Client 4: Winkelcentrum Oostpoort
INSERT INTO clients (id, workspace_id, name, address, city, postal_code, phone, email, notes, is_active) VALUES
  ('10000000-0000-0000-0000-000000000004', 
   '00000000-0000-0000-0000-000000000001',
   'Winkelcentrum Oostpoort', 
   'Waterdijk 50', 
   'Amsterdam', 
   '1098 TE', 
   '020-6667890', 
   'beheer@oostpoort.nl',
   'Regulier onderhoud en schoonmaak',
   true);

INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
  ('11000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000004', 'Linda Vermeer', 'Centrummanager', '06-56789012', 'l.vermeer@oostpoort.nl', true);

INSERT INTO client_locations (id, client_id, name, address, city, postal_code, is_primary) VALUES
  ('12000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Winkelcentrum', 'Waterdijk 50', 'Amsterdam', '1098 TE', true);

-- Client 5: Kantoorcomplex Sloterdijk
INSERT INTO clients (id, workspace_id, name, address, city, postal_code, phone, email, notes, is_active) VALUES
  ('10000000-0000-0000-0000-000000000005', 
   '00000000-0000-0000-0000-000000000001',
   'Kantoorcomplex Sloterdijk', 
   'Radarweg 60', 
   'Amsterdam', 
   '1043 NT', 
   '020-7778901', 
   'facility@sloterdijk.nl',
   'Gevelreiniging en onderhoud parkeerterrein',
   true);

INSERT INTO client_contacts (id, client_id, name, role, phone, email, is_primary) VALUES
  ('11000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'Robert Klein', 'Facility Manager', '06-67890123', 'r.klein@sloterdijk.nl', true);

INSERT INTO client_locations (id, client_id, name, address, city, postal_code, is_primary) VALUES
  ('12000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'Hoofdgebouw', 'Radarweg 60', 'Amsterdam', '1043 NT', true),
  ('12000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Parkeergarage', 'Radarweg 58', 'Amsterdam', '1043 NT', false);

-- =============================================================================
-- 3. Employees (8 employees with different roles)
-- =============================================================================

INSERT INTO employees (id, workspace_id, name, role, email, phone, hourly_rate, weekly_capacity, skills, color, is_active) VALUES
  -- Projectleiders
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
   'Tom Hendriks', 'projectleider', 't.hendriks@veha.nl', '06-10000001', 65.00, 40, 
   ARRAY['planning', 'klantcontact', 'straatwerk'], '#3b82f6', true),
  
  -- Voormannen
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
   'Bas van Dijk', 'voorman', 'b.vandijk@veha.nl', '06-10000002', 55.00, 40, 
   ARRAY['straatwerk', 'leiding geven', 'machines'], '#10b981', true),
   
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 
   'Erik Smit', 'voorman', 'e.smit@veha.nl', '06-10000003', 55.00, 40, 
   ARRAY['kitwerk', 'gevelrenovatie', 'leiding geven'], '#f59e0b', true),

  -- Specialisten
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 
   'Mohammed El Amrani', 'specialist', 'm.elamrani@veha.nl', '06-10000004', 50.00, 40, 
   ARRAY['kitwerk', 'voegwerk', 'gevelreinigen'], '#8b5cf6', true),
   
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 
   'Daan de Boer', 'specialist', 'd.deboer@veha.nl', '06-10000005', 50.00, 40, 
   ARRAY['straatwerk', 'betonreparatie', 'machines'], '#ec4899', true),

  -- Uitvoerders
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 
   'Kevin Visser', 'uitvoerder', 'k.visser@veha.nl', '06-10000006', 42.00, 40, 
   ARRAY['straatwerk', 'reinigen'], '#06b6d4', true),
   
  ('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 
   'Stefan Mulder', 'uitvoerder', 's.mulder@veha.nl', '06-10000007', 42.00, 40, 
   ARRAY['kitwerk', 'schilderwerk'], '#84cc16', true),
   
  ('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 
   'Ahmed Hassan', 'uitvoerder', 'a.hassan@veha.nl', '06-10000008', 42.00, 32, 
   ARRAY['reinigen', 'straatwerk'], '#f97316', true);

-- =============================================================================
-- 4. Employee Availability (sample records for current/next week)
-- =============================================================================

-- Using dynamic dates relative to current date
INSERT INTO employee_availability (employee_id, date, status, notes) VALUES
  -- Kevin is ziek
  ('20000000-0000-0000-0000-000000000006', CURRENT_DATE, 'ziek', 'Griep'),
  ('20000000-0000-0000-0000-000000000006', CURRENT_DATE + 1, 'ziek', 'Griep'),
  
  -- Stefan heeft vakantie volgende week
  ('20000000-0000-0000-0000-000000000007', CURRENT_DATE + 7, 'vakantie', 'Skivakantie'),
  ('20000000-0000-0000-0000-000000000007', CURRENT_DATE + 8, 'vakantie', 'Skivakantie'),
  ('20000000-0000-0000-0000-000000000007', CURRENT_DATE + 9, 'vakantie', 'Skivakantie'),
  ('20000000-0000-0000-0000-000000000007', CURRENT_DATE + 10, 'vakantie', 'Skivakantie'),
  ('20000000-0000-0000-0000-000000000007', CURRENT_DATE + 11, 'vakantie', 'Skivakantie'),
  
  -- Daan heeft training morgen
  ('20000000-0000-0000-0000-000000000005', CURRENT_DATE + 1, 'training', 'VCA cursus'),
  
  -- Ahmed werkt parttime (vrij op vrijdag)
  ('20000000-0000-0000-0000-000000000008', CURRENT_DATE + (5 - EXTRACT(DOW FROM CURRENT_DATE)::int), 'vrij', 'Parttime contract');

-- =============================================================================
-- 5. Projects (3 projects with tasks and dependencies)
-- =============================================================================

-- Project 1: Straatwerk Centrum Amsterdam (actief, lopend project)
INSERT INTO projects (id, workspace_id, client_id, location_id, name, description, work_type, status, start_date, end_date, budget_hours, actual_hours, progress, notes) VALUES
  ('30000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   '12000000-0000-0000-0000-000000000001',
   'Herstraten Dam-gebied',
   'Volledige herstraatwerkzaamheden rondom de Dam, inclusief nieuwe drainage',
   'straatwerk',
   'actief',
   CURRENT_DATE - 14,
   CURRENT_DATE + 28,
   480,
   180,
   35,
   'Let op: werken alleen buiten winkeltijden');

-- Tasks for Project 1
INSERT INTO tasks (id, project_id, parent_id, wbs, name, description, start_date, end_date, duration, progress, is_milestone, is_summary, status, priority, sort_order) VALUES
  -- Summary: Voorbereiding
  ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', NULL, 
   '1', 'Voorbereiding', 'Voorbereidende werkzaamheden', 
   CURRENT_DATE - 14, CURRENT_DATE - 8, 5, 100, false, true, 'done', 'high', 1),
  
  ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 
   '1.1', 'Materiaal bestellen', 'Klinkers en zand bestellen bij leverancier', 
   CURRENT_DATE - 14, CURRENT_DATE - 12, 3, 100, false, false, 'done', 'high', 2),
  
  ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 
   '1.2', 'Werkgebied afzetten', 'Hekken plaatsen en verkeersplan uitvoeren', 
   CURRENT_DATE - 11, CURRENT_DATE - 10, 2, 100, false, false, 'done', 'normal', 3),
  
  ('31000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 
   '1.3', 'Materiaal levering', 'Ontvangst en controle materialen', 
   CURRENT_DATE - 9, CURRENT_DATE - 8, 1, 100, true, false, 'done', 'normal', 4),

  -- Summary: Uitvoering
  ('31000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', NULL, 
   '2', 'Uitvoering', 'Hoofdwerkzaamheden', 
   CURRENT_DATE - 7, CURRENT_DATE + 21, 21, 40, false, true, 'in_progress', 'high', 5),
  
  ('31000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005', 
   '2.1', 'Oude bestrating verwijderen', 'Opbreken bestaande klinkers en afvoeren', 
   CURRENT_DATE - 7, CURRENT_DATE - 1, 5, 100, false, false, 'done', 'normal', 6),
  
  ('31000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005', 
   '2.2', 'Drainage aanleggen', 'Nieuwe drainagebuizen plaatsen', 
   CURRENT_DATE, CURRENT_DATE + 4, 5, 30, false, false, 'in_progress', 'high', 7),
  
  ('31000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005', 
   '2.3', 'Zandbed aanbrengen', 'Nieuwe funderingslaag aanbrengen en verdichten', 
   CURRENT_DATE + 5, CURRENT_DATE + 9, 5, 0, false, false, 'todo', 'normal', 8),
  
  ('31000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000005', 
   '2.4', 'Nieuwe bestrating leggen', 'Klinkers leggen in patroon volgens ontwerp', 
   CURRENT_DATE + 10, CURRENT_DATE + 21, 10, 0, false, false, 'todo', 'normal', 9),

  -- Summary: Afronding
  ('31000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', NULL, 
   '3', 'Afronding', 'Afrondende werkzaamheden', 
   CURRENT_DATE + 22, CURRENT_DATE + 28, 5, 0, false, true, 'todo', 'normal', 10),
  
  ('31000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000010', 
   '3.1', 'Invoegen en afwerken', 'Voegen aanbrengen en bestrating inwassen', 
   CURRENT_DATE + 22, CURRENT_DATE + 24, 3, 0, false, false, 'todo', 'normal', 11),
  
  ('31000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000010', 
   '3.2', 'Oplevering', 'Eindcontrole en oplevering aan klant', 
   CURRENT_DATE + 27, CURRENT_DATE + 28, 1, 0, true, false, 'todo', 'high', 12);

-- Dependencies for Project 1
INSERT INTO task_dependencies (predecessor_id, successor_id, dependency_type, lag_days) VALUES
  ('31000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000004', 'FS', 0),  -- Bestellen -> Levering
  ('31000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000006', 'FS', 0),  -- Afzetten -> Verwijderen
  ('31000000-0000-0000-0000-000000000004', '31000000-0000-0000-0000-000000000006', 'FS', 0),  -- Levering -> Verwijderen
  ('31000000-0000-0000-0000-000000000006', '31000000-0000-0000-0000-000000000007', 'FS', 0),  -- Verwijderen -> Drainage
  ('31000000-0000-0000-0000-000000000007', '31000000-0000-0000-0000-000000000008', 'FS', 0),  -- Drainage -> Zandbed
  ('31000000-0000-0000-0000-000000000008', '31000000-0000-0000-0000-000000000009', 'FS', 0),  -- Zandbed -> Bestrating
  ('31000000-0000-0000-0000-000000000009', '31000000-0000-0000-0000-000000000011', 'FS', 0),  -- Bestrating -> Invoegen
  ('31000000-0000-0000-0000-000000000011', '31000000-0000-0000-0000-000000000012', 'FS', 2);  -- Invoegen -> Oplevering (2 dagen wachten)

-- Assignments for Project 1
INSERT INTO task_assignments (task_id, employee_id, planned_hours, actual_hours, notes) VALUES
  ('31000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 4, 4, NULL),   -- Tom: bestellen
  ('31000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 8, 8, NULL),   -- Bas: afzetten
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 40, 40, NULL), -- Bas: verwijderen
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 40, 40, NULL), -- Daan: verwijderen
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 40, 35, NULL), -- Kevin: verwijderen
  ('31000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', 40, 12, NULL), -- Bas: drainage
  ('31000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 40, 12, NULL), -- Daan: drainage
  ('31000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', 40, 0, NULL),  -- Bas: zandbed
  ('31000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000005', 40, 0, NULL),  -- Daan: zandbed
  ('31000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', 80, 0, NULL),  -- Bas: bestrating
  ('31000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000005', 80, 0, NULL),  -- Daan: bestrating
  ('31000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', 64, 0, NULL),  -- Ahmed: bestrating
  ('31000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000002', 24, 0, NULL),  -- Bas: invoegen
  ('31000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000001', 4, 0, NULL);   -- Tom: oplevering

-- Project 2: Gevelrenovatie Eigen Haard (gepland, start binnenkort)
INSERT INTO projects (id, workspace_id, client_id, location_id, name, description, work_type, status, start_date, end_date, budget_hours, actual_hours, progress, notes) VALUES
  ('30000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000002',
   '12000000-0000-0000-0000-000000000004',
   'Gevelrenovatie Complex Oost',
   'Voegwerk en kitwerk aan 25 woningen in de Molukkenstraat',
   'kitwerk',
   'gepland',
   CURRENT_DATE + 14,
   CURRENT_DATE + 56,
   640,
   0,
   0,
   'Bewoners zijn geïnformeerd via brief');

-- Tasks for Project 2
INSERT INTO tasks (id, project_id, parent_id, wbs, name, description, start_date, end_date, duration, progress, is_milestone, is_summary, status, priority, sort_order) VALUES
  ('32000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', NULL, 
   '1', 'Voorbereiding', 'Voorbereidende werkzaamheden', 
   CURRENT_DATE + 14, CURRENT_DATE + 18, 5, 0, false, true, 'todo', 'high', 1),
  
  ('32000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000001', 
   '1.1', 'Steigers plaatsen', 'Gevelsteigers opbouwen langs alle gevels', 
   CURRENT_DATE + 14, CURRENT_DATE + 16, 3, 0, false, false, 'todo', 'high', 2),
  
  ('32000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000001', 
   '1.2', 'Gevelinspectie', 'Inventarisatie beschadigingen per woning', 
   CURRENT_DATE + 17, CURRENT_DATE + 18, 2, 0, false, false, 'todo', 'normal', 3),

  ('32000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', NULL, 
   '2', 'Uitvoering', 'Renovatiewerkzaamheden', 
   CURRENT_DATE + 21, CURRENT_DATE + 49, 21, 0, false, true, 'todo', 'normal', 4),
  
  ('32000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000004', 
   '2.1', 'Oude voegen verwijderen', 'Beschadigde voegen uitkrabben', 
   CURRENT_DATE + 21, CURRENT_DATE + 28, 6, 0, false, false, 'todo', 'normal', 5),
  
  ('32000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000004', 
   '2.2', 'Nieuw voegwerk aanbrengen', 'Nieuwe voegen aanbrengen met correcte mortel', 
   CURRENT_DATE + 29, CURRENT_DATE + 42, 10, 0, false, false, 'todo', 'normal', 6),
  
  ('32000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000004', 
   '2.3', 'Kitwerk uitvoeren', 'Kozijnen en gevelaansluitingen kitten', 
   CURRENT_DATE + 43, CURRENT_DATE + 49, 5, 0, false, false, 'todo', 'normal', 7),

  ('32000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000002', NULL, 
   '3', 'Afronding', 'Afrondende werkzaamheden', 
   CURRENT_DATE + 50, CURRENT_DATE + 56, 5, 0, false, true, 'todo', 'normal', 8),
  
  ('32000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000008', 
   '3.1', 'Steigers afbouwen', 'Steigers demonteren en afvoeren', 
   CURRENT_DATE + 50, CURRENT_DATE + 52, 3, 0, false, false, 'todo', 'normal', 9),
  
  ('32000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000008', 
   '3.2', 'Eindoplevering', 'Inspectie met opdrachtgever', 
   CURRENT_DATE + 55, CURRENT_DATE + 56, 1, 0, true, false, 'todo', 'high', 10);

-- Dependencies for Project 2
INSERT INTO task_dependencies (predecessor_id, successor_id, dependency_type, lag_days) VALUES
  ('32000000-0000-0000-0000-000000000002', '32000000-0000-0000-0000-000000000003', 'FS', 0),  -- Steigers -> Inspectie
  ('32000000-0000-0000-0000-000000000003', '32000000-0000-0000-0000-000000000005', 'FS', 2),  -- Inspectie -> Voegen verwijderen
  ('32000000-0000-0000-0000-000000000005', '32000000-0000-0000-0000-000000000006', 'FS', 0),  -- Verwijderen -> Nieuw voegwerk
  ('32000000-0000-0000-0000-000000000006', '32000000-0000-0000-0000-000000000007', 'FS', 0),  -- Voegwerk -> Kitwerk
  ('32000000-0000-0000-0000-000000000007', '32000000-0000-0000-0000-000000000009', 'FS', 0),  -- Kitwerk -> Steigers afbouwen
  ('32000000-0000-0000-0000-000000000009', '32000000-0000-0000-0000-000000000010', 'FS', 2); -- Afbouwen -> Oplevering

-- Assignments for Project 2
INSERT INTO task_assignments (task_id, employee_id, planned_hours, actual_hours, notes) VALUES
  ('32000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 24, 0, NULL),  -- Erik: steigers
  ('32000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 8, 0, NULL),   -- Erik: inspectie
  ('32000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 8, 0, NULL),   -- Tom: inspectie
  ('32000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 48, 0, NULL),  -- Erik: voegen verwijderen
  ('32000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 48, 0, NULL),  -- Mohammed: voegen verwijderen
  ('32000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000003', 80, 0, NULL),  -- Erik: nieuw voegwerk
  ('32000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 80, 0, NULL),  -- Mohammed: nieuw voegwerk
  ('32000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000007', 80, 0, NULL),  -- Stefan: nieuw voegwerk
  ('32000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 40, 0, NULL),  -- Mohammed: kitwerk
  ('32000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 40, 0, NULL),  -- Stefan: kitwerk
  ('32000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000003', 24, 0, NULL),  -- Erik: steigers afbouwen
  ('32000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000001', 4, 0, NULL);   -- Tom: oplevering

-- Project 3: Gevelreiniging Kantoorcomplex (klein project, bijna klaar)
INSERT INTO projects (id, workspace_id, client_id, location_id, name, description, work_type, status, start_date, end_date, budget_hours, actual_hours, progress, notes) VALUES
  ('30000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000005',
   '12000000-0000-0000-0000-000000000008',
   'Jaarlijkse gevelreiniging',
   'Complete gevelreiniging hoofdgebouw met hoogwerker',
   'reinigen',
   'actief',
   CURRENT_DATE - 7,
   CURRENT_DATE + 3,
   80,
   64,
   80,
   'Alleen werken op werkdagen 07:00-16:00');

-- Tasks for Project 3
INSERT INTO tasks (id, project_id, parent_id, wbs, name, description, start_date, end_date, duration, progress, is_milestone, is_summary, status, priority, sort_order) VALUES
  ('33000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', NULL, 
   '1', 'Noordgevel reinigen', 'Noordzijde gebouw reinigen', 
   CURRENT_DATE - 7, CURRENT_DATE - 5, 3, 100, false, false, 'done', 'normal', 1),
  
  ('33000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', NULL, 
   '2', 'Oostgevel reinigen', 'Oostzijde gebouw reinigen', 
   CURRENT_DATE - 4, CURRENT_DATE - 2, 3, 100, false, false, 'done', 'normal', 2),
  
  ('33000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', NULL, 
   '3', 'Zuidgevel reinigen', 'Zuidzijde gebouw reinigen', 
   CURRENT_DATE - 1, CURRENT_DATE + 1, 3, 50, false, false, 'in_progress', 'normal', 3),
  
  ('33000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', NULL, 
   '4', 'Westgevel reinigen', 'Westzijde gebouw reinigen', 
   CURRENT_DATE + 2, CURRENT_DATE + 3, 2, 0, false, false, 'todo', 'normal', 4),
  
  ('33000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', NULL, 
   '5', 'Oplevering', 'Eindcontrole', 
   CURRENT_DATE + 3, CURRENT_DATE + 3, 1, 0, true, false, 'todo', 'high', 5);

-- Dependencies for Project 3
INSERT INTO task_dependencies (predecessor_id, successor_id, dependency_type, lag_days) VALUES
  ('33000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000002', 'FS', 0),
  ('33000000-0000-0000-0000-000000000002', '33000000-0000-0000-0000-000000000003', 'FS', 0),
  ('33000000-0000-0000-0000-000000000003', '33000000-0000-0000-0000-000000000004', 'FS', 0),
  ('33000000-0000-0000-0000-000000000004', '33000000-0000-0000-0000-000000000005', 'FS', 0);

-- Assignments for Project 3
INSERT INTO task_assignments (task_id, employee_id, planned_hours, actual_hours, notes) VALUES
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 16, 16, NULL),  -- Mohammed
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', 8, 8, NULL),    -- Ahmed
  ('33000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 16, 16, NULL),  -- Mohammed
  ('33000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000008', 8, 8, NULL),    -- Ahmed
  ('33000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 16, 8, NULL),   -- Mohammed
  ('33000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008', 8, 4, NULL),    -- Ahmed
  ('33000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 12, 0, NULL),   -- Mohammed
  ('33000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000008', 4, 0, NULL),    -- Ahmed
  ('33000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', 2, 0, NULL);    -- Tom: oplevering

-- =============================================================================
-- 6. Equipment
-- =============================================================================

INSERT INTO equipment (id, workspace_id, name, equipment_type, license_plate, daily_rate, status, notes, is_active) VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
   'Bedrijfsbus 1', 'voertuig', 'AB-123-CD', 75.00, 'in_gebruik', 'Mercedes Sprinter', true),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
   'Bedrijfsbus 2', 'voertuig', 'EF-456-GH', 75.00, 'beschikbaar', 'Ford Transit', true),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 
   'Minikraan', 'machine', NULL, 150.00, 'in_gebruik', 'CAT 301.7', true),
  ('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 
   'Trilplaat', 'machine', NULL, 45.00, 'beschikbaar', 'Weber CF3', true),
  ('40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 
   'Hoogwerker', 'machine', 'IJ-789-KL', 200.00, 'in_gebruik', 'Niftylift HR12', true),
  ('40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 
   'Aggregaat', 'machine', NULL, 35.00, 'onderhoud', 'SDMO 3000E - APK vervallen', false);

-- Equipment Assignments
INSERT INTO equipment_assignments (task_id, equipment_id, start_date, end_date, notes) VALUES
  -- Project 1: Minikraan voor drainage werk
  ('31000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE + 4, 'Graafwerk drainage'),
  -- Project 3: Hoogwerker voor gevelreiniging
  ('33000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000005', CURRENT_DATE - 1, CURRENT_DATE + 3, 'Gevelreiniging');

-- =============================================================================
-- 7. Time Entries (sample entries)
-- =============================================================================

INSERT INTO time_entries (task_id, employee_id, date, hours, description) VALUES
  -- Project 1: verwijderen oude bestrating
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - 7, 8, 'Opbreken section A'),
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', CURRENT_DATE - 7, 8, 'Opbreken section A'),
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', CURRENT_DATE - 7, 7, 'Assisteren + afvoeren puin'),
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', CURRENT_DATE - 6, 8, 'Opbreken section B'),
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', CURRENT_DATE - 6, 8, 'Opbreken section B'),
  ('31000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', CURRENT_DATE - 6, 8, 'Afvoeren puin'),
  
  -- Project 3: gevelreiniging
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', CURRENT_DATE - 7, 8, 'Noordgevel boven'),
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', CURRENT_DATE - 7, 4, 'Noordgevel onder'),
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', CURRENT_DATE - 6, 8, 'Noordgevel midden'),
  ('33000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000008', CURRENT_DATE - 6, 4, 'Begane grond');

-- =============================================================================
-- Note: User accounts must be created via Supabase Auth
-- After running this seed, create the following users manually:
-- 
-- 1. admin@veha.nl (password: demo123!) - admin role
-- 2. planner@veha.nl (password: demo123!) - vault_medewerker role  
-- 3. monteur@veha.nl (password: demo123!) - medewerker role
-- 4. klant@bedrijf.nl (password: demo123!) - klant_editor role
--
-- Then link them to the workspace:
-- INSERT INTO workspace_members (workspace_id, profile_id, role) VALUES
--   ('00000000-0000-0000-0000-000000000001', '<admin-user-id>', 'admin'),
--   ('00000000-0000-0000-0000-000000000001', '<planner-user-id>', 'vault_medewerker'),
--   ('00000000-0000-0000-0000-000000000001', '<monteur-user-id>', 'medewerker'),
--   ('00000000-0000-0000-0000-000000000001', '<klant-user-id>', 'klant_editor');
-- =============================================================================
