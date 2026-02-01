import * as React from 'react'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Star,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Client, ClientContact, ClientLocation, ClientProject } from '@/types/clients'

// =============================================================================
// Constants
// =============================================================================

const INDENT_PX = 24

const GROUP_CONFIG = {
  contacts: {
    icon: Users,
    label: 'Contactpersonen',
    emptyText: '(geen contactpersonen)',
  },
  locations: {
    icon: MapPin,
    label: 'Locaties',
    emptyText: '(geen locaties)',
  },
  projects: {
    icon: FolderKanban,
    label: 'Projecten',
    emptyText: '(geen projecten)',
  },
} as const

const STATUS_COLORS: Record<string, string> = {
  gepland: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  actief: 'border-lime-200 bg-lime-100 text-lime-700 dark:border-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
  'on-hold': 'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  afgerond: 'border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400',
  geannuleerd: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.gepland
}

// =============================================================================
// Props
// =============================================================================

interface ClientTreeNodeProps {
  client: Client
  isExpanded: boolean
  expandedGroups: Set<string>
  onToggle: () => void
  onToggleGroup: (groupType: 'contacts' | 'locations' | 'projects') => void
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
  onProjectClick?: (projectId: string) => void
  onAddContact: () => void
  onAddLocation: () => void
  onAddProject: () => void
}

// =============================================================================
// Component
// =============================================================================

export function ClientTreeNode({
  client,
  isExpanded,
  expandedGroups,
  onToggle,
  onToggleGroup,
  onSelect,
  onEdit,
  onDelete,
  onProjectClick,
  onAddContact,
  onAddLocation,
  onAddProject,
}: ClientTreeNodeProps) {
  const isGroupExpanded = (groupType: string) =>
    expandedGroups.has(`${client.id}:${groupType}`)

  return (
    <div className="select-none">
      {/* Level 0: Client Row */}
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-2 px-4 py-2',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        )}
        onClick={onSelect}
      >
        {/* Expand/Collapse Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="shrink-0 rounded p-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Inklappen' : 'Uitklappen'}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />
          )}
        </button>

        {/* Client Icon */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            client.is_active
              ? 'bg-lime-100 dark:bg-lime-900/30'
              : 'bg-zinc-100 dark:bg-zinc-800'
          )}
        >
          <Building2
            className={cn(
              'h-4 w-4',
              client.is_active ? 'text-lime-600 dark:text-lime-400' : 'text-zinc-400'
            )}
          />
        </div>

        {/* Client Name & City */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{client.name}</span>
            {client.city && (
              <span className="text-sm text-muted-foreground">{client.city}</span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className={cn(
            'shrink-0',
            client.is_active
              ? 'border-lime-200 bg-lime-50 text-lime-700 dark:border-lime-800 dark:bg-lime-900/20 dark:text-lime-400'
              : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
          )}
        >
          <span
            className={cn(
              'mr-1.5 h-1.5 w-1.5 rounded-full',
              client.is_active ? 'bg-lime-500' : 'bg-zinc-400'
            )}
          />
          {client.is_active ? 'Actief' : 'Inactief'}
        </Badge>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
              aria-label="Klant acties"
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>Bewerken</DropdownMenuItem>
            <DropdownMenuItem onClick={onAddProject}>Nieuw Project</DropdownMenuItem>
            <DropdownMenuItem onClick={onAddContact}>Contactpersoon toevoegen</DropdownMenuItem>
            <DropdownMenuItem onClick={onAddLocation}>Locatie toevoegen</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400" onClick={onDelete}>
              Verwijderen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Children (when expanded) */}
      {isExpanded && (
        <div>
          {/* Contacts Group */}
          <TreeGroup
            type="contacts"
                        count={client.contacts.length}
            isExpanded={isGroupExpanded('contacts')}
            onToggle={() => onToggleGroup('contacts')}
            onAdd={onAddContact}
          >
            {client.contacts.length === 0 ? (
              <TreeEmptyItem text={GROUP_CONFIG.contacts.emptyText} />
            ) : (
              client.contacts.map((contact) => (
                <ContactItem key={contact.id} contact={contact} />
              ))
            )}
          </TreeGroup>

          {/* Locations Group */}
          <TreeGroup
            type="locations"
                        count={client.locations.length}
            isExpanded={isGroupExpanded('locations')}
            onToggle={() => onToggleGroup('locations')}
            onAdd={onAddLocation}
          >
            {client.locations.length === 0 ? (
              <TreeEmptyItem text={GROUP_CONFIG.locations.emptyText} />
            ) : (
              client.locations.map((location) => (
                <LocationItem key={location.id} location={location} />
              ))
            )}
          </TreeGroup>

          {/* Projects Group */}
          <TreeGroup
            type="projects"
                        count={client.projects.length}
            isExpanded={isGroupExpanded('projects')}
            onToggle={() => onToggleGroup('projects')}
            onAdd={onAddProject}
          >
            {client.projects.length === 0 ? (
              <TreeEmptyItem text={GROUP_CONFIG.projects.emptyText} />
            ) : (
              client.projects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  onClick={() => onProjectClick?.(project.id)}
                />
              ))
            )}
          </TreeGroup>
        </div>
      )}
    </div>
  )
}

// =============================================================================
// Tree Group (Level 1)
// =============================================================================

interface TreeGroupProps {
  type: 'contacts' | 'locations' | 'projects'
  count: number
  isExpanded: boolean
  onToggle: () => void
  onAdd: () => void
  children: React.ReactNode
}

function TreeGroup({ type, count, isExpanded, onToggle, onAdd, children }: TreeGroupProps) {
  const config = GROUP_CONFIG[type]
  const Icon = config.icon

  return (
    <div>
      {/* Group Header */}
      <div
        className={cn(
          'group flex cursor-pointer items-center gap-2 px-4 py-1.5',
          'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
        )}
        style={{ paddingLeft: INDENT_PX + 16 }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <span className="shrink-0 p-0.5" aria-hidden="true">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </span>

        <Icon className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden="true" />

        <span className="text-sm text-zinc-600 dark:text-zinc-400">{config.label}</span>

        <span className="text-xs text-zinc-400 dark:text-zinc-500">({count})</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAdd()
          }}
          className={cn(
            'ml-auto rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700',
            'opacity-0 group-hover:opacity-100'
          )}
          aria-label={`${config.label} toevoegen`}
        >
          <Plus className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
        </button>
      </div>

      {/* Group Items */}
      {isExpanded && <div>{children}</div>}
    </div>
  )
}

// =============================================================================
// Item Components (Level 2)
// =============================================================================

function ContactItem({ contact }: { contact: ClientContact }) {
  return (
    <div
      className="group flex items-center gap-3 px-4 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      style={{ paddingLeft: INDENT_PX * 2 + 16 }}
    >
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {contact.name}
      </span>
      {contact.role && <span className="text-xs text-zinc-500">{contact.role}</span>}
      {contact.phone && (
        <span className="flex items-center gap-1 text-xs text-zinc-400">
          <Phone className="h-3 w-3" />
          {contact.phone}
        </span>
      )}
      {contact.email && (
        <span className="flex items-center gap-1 text-xs text-zinc-400">
          <Mail className="h-3 w-3" />
          {contact.email}
        </span>
      )}
      {contact.is_primary && (
        <Tooltip>
          <TooltipTrigger>
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>Primair contactpersoon</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function LocationItem({ location }: { location: ClientLocation }) {
  const fullAddress = [location.address, location.city].filter(Boolean).join(', ')

  return (
    <div
      className="group flex items-center gap-3 px-4 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      style={{ paddingLeft: INDENT_PX * 2 + 16 }}
    >
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {location.name}
      </span>
      {fullAddress && <span className="text-xs text-zinc-500">{fullAddress}</span>}
      {location.is_primary && (
        <Tooltip>
          <TooltipTrigger>
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          </TooltipTrigger>
          <TooltipContent>Primaire locatie</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function ProjectItem({ project, onClick }: { project: ClientProject; onClick: () => void }) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center gap-3 px-4 py-1.5',
        'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
      )}
      style={{ paddingLeft: INDENT_PX * 2 + 16 }}
      onClick={onClick}
    >
      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {project.name}
      </span>

      <Badge variant="outline" className={cn('text-xs', getStatusColor(project.status))}>
        {project.status}
      </Badge>

      {/* Progress Bar */}
      <div className="ml-auto flex items-center gap-2">
        <div
          className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
          role="progressbar"
          aria-valuenow={project.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Voortgang: ${project.progress}%`}
        >
          <div
            className={cn(
              'h-full rounded-full',
              project.progress === 100
                ? 'bg-lime-500'
                : project.progress > 0
                ? 'bg-lime-400'
                : 'bg-zinc-300 dark:bg-zinc-600'
            )}
            style={{ width: `${project.progress}%` }}
          />
        </div>
        <span className="w-8 text-right text-xs text-zinc-500" aria-hidden="true">{project.progress}%</span>
      </div>

      <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100" />
    </div>
  )
}

function TreeEmptyItem({ text }: { text: string }) {
  return (
    <div
      className="px-4 py-1.5 text-xs italic text-zinc-400 dark:text-zinc-500"
      style={{ paddingLeft: INDENT_PX * 2 + 16 }}
    >
      {text}
    </div>
  )
}
