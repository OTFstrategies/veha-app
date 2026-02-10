import * as React from 'react'
import { getInitials } from '@/lib/format'
import {
  ChevronDown,
  Grid3X3,
  LayoutList,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Employee, SelectOption } from '@/types/employees'

// =============================================================================
// Props
// =============================================================================

export interface EmployeeListProps {
  employees: Employee[]
  roles?: SelectOption[]
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onCreate?: () => void
}

// =============================================================================
// Component
// =============================================================================

export function EmployeeList({
  employees,
  roles = [],
  onView,
  onEdit,
  onDelete,
  onCreate,
}: EmployeeListProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [roleFilter, setRoleFilter] = React.useState<string>('all')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'inactive'>('all')
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid')

  // Filter employees
  const filteredEmployees = React.useMemo(() => {
    return employees.filter((emp) => {
      // Status filter
      if (statusFilter === 'active' && !emp.isActive) return false
      if (statusFilter === 'inactive' && emp.isActive) return false

      // Role filter
      if (roleFilter !== 'all' && emp.role !== roleFilter) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return emp.name.toLowerCase().includes(query)
      }
      return true
    })
  }, [employees, searchQuery, roleFilter, statusFilter])

  // Helper functions

  const getRoleLabel = (role: string) => {
    const found = roles.find((r) => r.value === role)
    return found?.label || role
  }

  const getSkillLabel = (skill: string) => {
    return skill.charAt(0).toUpperCase() + skill.slice(1)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Medewerkers</h1>
            <p className="mt-1 text-sm text-muted-foreground">Beheer je team</p>
          </div>
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nieuwe Medewerker
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Zoek op naam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Role Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {roleFilter === 'all' ? 'Alle rollen' : getRoleLabel(roleFilter)}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRoleFilter('all')}>
                Alle rollen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role.value}
                  onClick={() => setRoleFilter(role.value)}
                >
                  {role.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                {statusFilter === 'all' && 'Alle'}
                {statusFilter === 'active' && 'Actief'}
                {statusFilter === 'inactive' && 'Inactief'}
                <ChevronDown className="h-4 w-4" />
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

          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-border">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid weergave"
              aria-pressed={viewMode === 'grid'}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-l-lg transition-colors',
                viewMode === 'grid'
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Lijst weergave"
              aria-pressed={viewMode === 'list'}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-r-lg transition-colors',
                viewMode === 'list'
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
              )}
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filteredEmployees.length === 0 ? (
          // Empty State
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Users className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Geen medewerkers gevonden</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Probeer je filters aan te passen'
                : 'Voeg je eerste medewerker toe'}
            </p>
            {!searchQuery && roleFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={onCreate} className="mt-4 gap-2">
                <Plus className="h-4 w-4" />
                Nieuwe Medewerker
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEmployees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => onView?.(employee.id)}
                className={cn(
                  'group relative overflow-hidden rounded-xl border bg-card p-5 text-left transition-all',
                  'hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-600',
                  !employee.isActive && 'opacity-60'
                )}
              >
                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Acties voor ${employee.name}`}
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(employee.id)}>
                      Bekijken
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(employee.id)}>
                      Bewerken
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400"
                      onClick={() => onDelete?.(employee.id)}
                    >
                      Verwijderen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Avatar */}
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-lg font-medium">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{employee.name}</h3>
                    {!employee.isActive && (
                      <Badge variant="outline" className="text-xs">
                        Inactief
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">
                    {getRoleLabel(employee.role)}
                  </p>
                </div>

                {/* Skills */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {employee.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {getSkillLabel(skill)}
                    </Badge>
                  ))}
                  {employee.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{employee.skills.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Contact */}
                <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                  {employee.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {employee.phone}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          // List View
          <table className="w-full" role="table">
            <thead className="sticky top-0 z-10 border-b border-border bg-zinc-50 dark:bg-zinc-900">
              <tr role="row">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Medewerker
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Vaardigheden
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Capaciteit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="group cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => onView?.(employee.id)}
                >
                  {/* Employee */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-sm font-medium">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm capitalize text-muted-foreground">
                          {getRoleLabel(employee.role)}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {employee.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {getSkillLabel(skill)}
                        </Badge>
                      ))}
                      {employee.skills.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{employee.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                      {employee.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {employee.phone}
                        </span>
                      )}
                      {employee.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Capacity */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm">
                      {employee.weeklyCapacity}u/week
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        employee.isActive
                          ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                      )}
                    >
                      {employee.isActive ? 'Actief' : 'Inactief'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Acties voor ${employee.name}`}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(employee.id)}>
                          Bekijken
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(employee.id)}>
                          Bewerken
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 dark:text-red-400"
                          onClick={() => onDelete?.(employee.id)}
                        >
                          Verwijderen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
