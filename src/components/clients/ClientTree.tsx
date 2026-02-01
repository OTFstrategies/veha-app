import * as React from 'react'
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ClientTreeNode } from './ClientTreeNode'
import { ClientTreeEmpty } from './ClientTreeEmpty'
import type { Client } from '@/types/clients'

// =============================================================================
// Props
// =============================================================================

export interface ClientTreeProps {
  clients: Client[]
  onClientSelect?: (clientId: string) => void
  onProjectClick?: (projectId: string) => void
  onAddClient?: () => void
  onEditClient?: (clientId: string) => void
  onDeleteClient?: (clientId: string) => void
  onAddContact?: (clientId: string) => void
  onAddLocation?: (clientId: string) => void
  onAddProject?: (clientId: string) => void
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function ClientTree({
  clients,
  onClientSelect,
  onProjectClick,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onAddContact,
  onAddLocation,
  onAddProject,
  className,
}: ClientTreeProps) {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [expandedClients, setExpandedClients] = React.useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = React.useState<Set<string>>(new Set())

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  const filteredClients = React.useMemo(() => {
    return clients.filter((client) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contacts.some((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && client.is_active) ||
        (statusFilter === 'inactive' && !client.is_active)

      return matchesSearch && matchesStatus
    })
  }, [clients, searchQuery, statusFilter])

  // ---------------------------------------------------------------------------
  // Expand/Collapse Handlers
  // ---------------------------------------------------------------------------

  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  const toggleGroup = (clientId: string, groupType: string) => {
    const key = `${clientId}:${groupType}`
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const expandAll = () => {
    const allClientIds = new Set(filteredClients.map((c) => c.id))
    const allGroupKeys = new Set<string>()
    filteredClients.forEach((client) => {
      allGroupKeys.add(`${client.id}:contacts`)
      allGroupKeys.add(`${client.id}:locations`)
      allGroupKeys.add(`${client.id}:projects`)
    })
    setExpandedClients(allClientIds)
    setExpandedGroups(allGroupKeys)
  }

  const collapseAll = () => {
    setExpandedClients(new Set())
    setExpandedGroups(new Set())
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn('flex h-full flex-col bg-background', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Klanten</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Beheer je klanten en hun projecten
            </p>
          </div>
          <Button onClick={onAddClient}>
            <Plus className="mr-2 h-4 w-4" />
            Nieuwe Klant
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Zoeken op naam, stad, contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              aria-label="Zoeken in klanten"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-between" aria-label="Filter op status">
                {statusFilter === 'all' && 'Alle'}
                {statusFilter === 'active' && 'Actief'}
                {statusFilter === 'inactive' && 'Inactief'}
                <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Alle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Actief
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactief
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-9 w-9"
                onClick={expandedClients.size > 0 ? collapseAll : expandAll}
                aria-label={expandedClients.size > 0 ? 'Alles inklappen' : 'Alles uitklappen'}
              >
                {expandedClients.size > 0 ? (
                  <ChevronsDownUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {expandedClients.size > 0 ? 'Alles inklappen' : 'Alles uitklappen'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Tree Container */}
      <div className="flex-1 overflow-auto">
        {filteredClients.length === 0 ? (
          <ClientTreeEmpty
            hasFilters={searchQuery !== '' || statusFilter !== 'all'}
            onAddClient={onAddClient}
          />
        ) : (
          <div className="py-2">
            {filteredClients.map((client) => (
              <ClientTreeNode
                key={client.id}
                client={client}
                isExpanded={expandedClients.has(client.id)}
                expandedGroups={expandedGroups}
                onToggle={() => toggleClient(client.id)}
                onToggleGroup={(groupType) => toggleGroup(client.id, groupType)}
                onSelect={() => onClientSelect?.(client.id)}
                onEdit={() => onEditClient?.(client.id)}
                onDelete={() => onDeleteClient?.(client.id)}
                onProjectClick={onProjectClick}
                onAddContact={() => onAddContact?.(client.id)}
                onAddLocation={() => onAddLocation?.(client.id)}
                onAddProject={() => onAddProject?.(client.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
