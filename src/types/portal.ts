// =============================================================================
// Portal Types - Client-facing portal data types
// =============================================================================

import type { ProjectStatus, TaskStatus, TaskPriority } from "./database";

/**
 * Project manager contact information
 */
export interface ProjectManager {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

/**
 * Task progress summary for portal view
 */
export interface PortalTaskSummary {
  id: string;
  name: string;
  status: TaskStatus;
  progress: number;
  startDate: string;
  endDate: string;
  isMilestone: boolean;
}

/**
 * Project summary for portal dashboard
 */
export interface PortalProject {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  endDate: string;
  workType: string;
  locationName: string | null;
  locationAddress: string | null;
  locationCity: string | null;
  projectManager: ProjectManager | null;
  taskCount: number;
  completedTaskCount: number;
}

/**
 * Detailed project view for portal
 */
export interface PortalProjectDetail extends PortalProject {
  tasks: PortalTaskSummary[];
  notes: string | null;
  budgetHours: number;
  actualHours: number;
}

/**
 * Portal user information
 */
export interface PortalUser {
  id: string;
  email: string;
  fullName: string | null;
  role: "klant_editor" | "klant_viewer";
  clientId: string | null;
  clientName: string | null;
}
