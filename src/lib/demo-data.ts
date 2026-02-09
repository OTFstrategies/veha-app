// =============================================================================
// Demo Data - Static mock data for the demo environment
// =============================================================================

import type {
  PortalUser,
  PortalProject,
  PortalProjectDetail,
  ProjectClientNote,
} from "@/types/portal";

// =============================================================================
// Helpers - Fixed reference date to prevent hydration mismatch
// =============================================================================

// Fixed anchor: Feb 9, 2026. Using a constant prevents server/client mismatch.
const ANCHOR = new Date("2026-02-09T12:00:00Z");

function daysFromAnchor(days: number): string {
  const date = new Date(ANCHOR);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}


// =============================================================================
// Demo User
// =============================================================================

export const DEMO_USER: PortalUser = {
  id: "demo-user-001",
  email: "m.jansen@csu.nl",
  fullName: "Marieke Jansen",
  role: "klant_editor",
  clientId: "demo-client-001",
  clientName: "CSU",
};

// =============================================================================
// Demo Projects (Dashboard)
// =============================================================================

export const DEMO_PROJECTS: PortalProject[] = [
  {
    id: "demo-project-001",
    name: "Herstraten Parkeerterrein Zuid",
    description:
      "Volledige herstraatwerkzaamheden parkeerterrein inclusief klinkers vervangen, opsluitbanden vernieuwen en straatkolken aansluiten.",
    status: "actief",
    progress: 35,
    startDate: daysFromAnchor(-30),
    endDate: daysFromAnchor(60),
    workType: "straatwerk",
    locationName: "Parkeerterrein Zuid",
    locationAddress: "Zuidplein 1-45",
    locationCity: "Rotterdam",
    projectManager: {
      id: "pm-001",
      name: "Jan de Vries",
      email: "j.devries@veha.nl",
      phone: "06-12345678",
    },
    taskCount: 8,
    completedTaskCount: 3,
  },
  {
    id: "demo-project-002",
    name: "Specialistische reiniging Ziekenhuis Noord",
    description:
      "Dieptereiniging en desinfectie van operatiekamers, cleanrooms en laboratoriumruimtes. Inclusief certificering en rapportage.",
    status: "gepland",
    progress: 0,
    startDate: daysFromAnchor(14),
    endDate: daysFromAnchor(90),
    workType: "reinigen",
    locationName: "Ziekenhuis Noord",
    locationAddress: "Hospitaalweg 15",
    locationCity: "Utrecht",
    projectManager: {
      id: "pm-002",
      name: "Pieter Bakker",
      email: "p.bakker@veha.nl",
      phone: "06-87654321",
    },
    taskCount: 6,
    completedTaskCount: 0,
  },
  {
    id: "demo-project-003",
    name: "Handyman Services Kantoorcomplex",
    description:
      "Periodiek onderhoudspakket: kleine reparaties, schilderwerk, montagewerk en facilitaire ondersteuning voor het kantoorcomplex.",
    status: "actief",
    progress: 80,
    startDate: daysFromAnchor(-45),
    endDate: daysFromAnchor(5),
    workType: "overig",
    locationName: "Kantoorcomplex De Werf",
    locationAddress: "Werfstraat 80-120",
    locationCity: "Amsterdam",
    projectManager: {
      id: "pm-001",
      name: "Jan de Vries",
      email: "j.devries@veha.nl",
      phone: "06-12345678",
    },
    taskCount: 5,
    completedTaskCount: 4,
  },
];

// =============================================================================
// Demo Project Details
// =============================================================================

export const DEMO_PROJECT_DETAILS: Record<string, PortalProjectDetail> = {
  "demo-project-001": {
    ...DEMO_PROJECTS[0],
    tasks: [
      {
        id: "task-001",
        name: "Voorbereidend werk & markering",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-30),
        endDate: daysFromAnchor(-22),
        isMilestone: false,
      },
      {
        id: "task-002",
        name: "Opbreken bestaande bestrating",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-21),
        endDate: daysFromAnchor(-12),
        isMilestone: false,
      },
      {
        id: "task-003",
        name: "Fundering en zandbed aanleggen",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-11),
        endDate: daysFromAnchor(-5),
        isMilestone: false,
      },
      {
        id: "task-004",
        name: "Opsluitbanden plaatsen",
        status: "in_progress",
        progress: 60,
        startDate: daysFromAnchor(-4),
        endDate: daysFromAnchor(5),
        isMilestone: false,
      },
      {
        id: "task-005",
        name: "Klinkers leggen sectie A",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(6),
        endDate: daysFromAnchor(20),
        isMilestone: false,
      },
      {
        id: "task-006",
        name: "Klinkers leggen sectie B",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(21),
        endDate: daysFromAnchor(40),
        isMilestone: false,
      },
      {
        id: "task-007",
        name: "Straatkolken aansluiten",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(41),
        endDate: daysFromAnchor(50),
        isMilestone: false,
      },
      {
        id: "task-008",
        name: "Oplevering",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(55),
        endDate: daysFromAnchor(60),
        isMilestone: true,
      },
    ],
    notes: "Weekelijks voortgangsoverleg op dinsdag om 10:00. Bereikbaarheid voor bezoekers blijft gegarandeerd via tijdelijke looppaden.",
    budgetHours: 640,
    actualHours: 224,
  },
  "demo-project-002": {
    ...DEMO_PROJECTS[1],
    tasks: [
      {
        id: "task-009",
        name: "Risico-inventarisatie & werkplan",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(14),
        endDate: daysFromAnchor(21),
        isMilestone: false,
      },
      {
        id: "task-010",
        name: "Dieptereiniging operatiekamers",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(22),
        endDate: daysFromAnchor(35),
        isMilestone: false,
      },
      {
        id: "task-011",
        name: "Reiniging cleanrooms (ISO 7)",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(36),
        endDate: daysFromAnchor(55),
        isMilestone: false,
      },
      {
        id: "task-012",
        name: "Desinfectie laboratoriumruimtes",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(56),
        endDate: daysFromAnchor(72),
        isMilestone: false,
      },
      {
        id: "task-013",
        name: "Kwaliteitsmetingen & certificering",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(73),
        endDate: daysFromAnchor(82),
        isMilestone: false,
      },
      {
        id: "task-014",
        name: "Eindinspectie & rapportage",
        status: "todo",
        progress: 0,
        startDate: daysFromAnchor(85),
        endDate: daysFromAnchor(90),
        isMilestone: true,
      },
    ],
    notes: "Werkzaamheden buiten operationele uren (19:00-06:00). Alle medewerkers moeten BHV-gecertificeerd zijn. Gebruik alleen goedgekeurde reinigingsmiddelen.",
    budgetHours: 480,
    actualHours: 0,
  },
  "demo-project-003": {
    ...DEMO_PROJECTS[2],
    tasks: [
      {
        id: "task-015",
        name: "Inventarisatie meldingen & planning",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-45),
        endDate: daysFromAnchor(-40),
        isMilestone: false,
      },
      {
        id: "task-016",
        name: "Schilderwerk & wandreparaties",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-39),
        endDate: daysFromAnchor(-25),
        isMilestone: false,
      },
      {
        id: "task-017",
        name: "Montagewerk & meubilair",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-24),
        endDate: daysFromAnchor(-10),
        isMilestone: false,
      },
      {
        id: "task-018",
        name: "Sanitair & elektra reparaties",
        status: "done",
        progress: 100,
        startDate: daysFromAnchor(-9),
        endDate: daysFromAnchor(-2),
        isMilestone: false,
      },
      {
        id: "task-019",
        name: "Eindinspectie & oplevering",
        status: "in_progress",
        progress: 50,
        startDate: daysFromAnchor(-1),
        endDate: daysFromAnchor(5),
        isMilestone: true,
      },
    ],
    notes: "Werkzaamheden worden uitgevoerd tijdens kantooruren in overleg met facilitair management. Storingen melden via het ticketsysteem.",
    budgetHours: 320,
    actualHours: 256,
  },
};

// =============================================================================
// Demo Notes (per project)
// =============================================================================

export const DEMO_NOTES: Record<string, ProjectClientNote[]> = {
  "demo-project-001": [
    {
      id: "note-001",
      projectId: "demo-project-001",
      profileId: "demo-user-001",
      content:
        "De huurders bij ingang Zuid hebben gevraagd of het werk in hun zone eerder kan starten. Kunnen we dit bespreken in het volgende overleg?",
      createdAt: "2026-02-06T14:30:00.000Z",
      updatedAt: "2026-02-06T14:30:00.000Z",
      authorName: "Marieke Jansen",
      authorEmail: "m.jansen@csu.nl",
    },
    {
      id: "note-002",
      projectId: "demo-project-001",
      profileId: "pm-001",
      content:
        "We hebben de planning aangepast. Sectie A start nu een week eerder dan gepland. De huurders zijn geïnformeerd.",
      createdAt: "2026-02-07T09:15:00.000Z",
      updatedAt: "2026-02-07T09:15:00.000Z",
      authorName: "Jan de Vries",
      authorEmail: "j.devries@veha.nl",
    },
  ],
  "demo-project-002": [],
  "demo-project-003": [
    {
      id: "note-003",
      projectId: "demo-project-003",
      profileId: "demo-user-001",
      content:
        "Ziet er goed uit tot nu toe! Het facilitair team is tevreden over de snelheid waarmee meldingen worden opgepakt.",
      createdAt: "2026-02-04T11:45:00.000Z",
      updatedAt: "2026-02-04T11:45:00.000Z",
      authorName: "Marieke Jansen",
      authorEmail: "m.jansen@csu.nl",
    },
  ],
};
