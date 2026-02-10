import * as React from 'react'
import { getInitials } from '@/lib/format'
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Edit2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Employee } from '@/types/employees'

// =============================================================================
// Props
// =============================================================================

export interface EmployeeDetailProps {
  employee: Employee
  onBack?: () => void
  onEdit?: () => void
  onDeactivate?: () => void
  onAddAvailability?: () => void
  onEditAvailability?: (availabilityId: string) => void
  onDeleteAvailability?: (availabilityId: string) => void
  onTaskClick?: (taskId: string, projectId: string) => void
}

// =============================================================================
// Component
// =============================================================================

export function EmployeeDetail({
  employee,
  onBack,
  onEdit,
  onDeactivate,
  onAddAvailability,
  onEditAvailability,
  onDeleteAvailability,
  onTaskClick,
}: EmployeeDetailProps) {
  const [activeTab, setActiveTab] = React.useState('planning')


  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      uitvoerder: 'Uitvoerder',
      voorman: 'Voorman',
      specialist: 'Specialist',
      projectleider: 'Projectleider',
    }
    return labels[role] || role
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ziek: 'Ziek',
      vakantie: 'Vakantie',
      vrij: 'Vrij',
      training: 'Training',
    }
    return labels[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ziek: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
      vakantie: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      vrij: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      training: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
    }
    return colors[status] || 'bg-zinc-100 text-zinc-700'
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-5">
        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <button
            onClick={onBack}
            aria-label="Terug naar medewerkers"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Medewerkers
          </button>
          <span>/</span>
          <span className="text-foreground">{employee.name}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 text-xl font-medium">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{employee.name}</h1>
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
              </div>
              <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                {getRoleLabel(employee.role)} • {employee.weeklyCapacity}u/week
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit2 className="mr-2 h-4 w-4" />
              Bewerken
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Meer acties">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onDeactivate}>
                  {employee.isActive ? 'Deactiveren' : 'Activeren'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Info Card */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Telefoon</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.phone || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {employee.email || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Uurtarief</p>
                  <p className="text-sm text-muted-foreground">
                    €{employee.hourlyRate}/uur
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Vaardigheden</p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {employee.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs capitalize">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="planning">Planning</TabsTrigger>
              <TabsTrigger value="beschikbaarheid">Beschikbaarheid</TabsTrigger>
            </TabsList>

            {/* Planning Tab */}
            <TabsContent value="planning" className="mt-4">
              <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <h2 className="font-semibold">Toegewezen Taken</h2>
                </div>

                {employee.assignments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Geen taken toegewezen
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {employee.assignments.map((assignment) => (
                      <button
                        key={assignment.id}
                        onClick={() =>
                          onTaskClick?.(assignment.taskId, assignment.projectId)
                        }
                        className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{assignment.taskName}</div>
                          <div className="mt-0.5 text-sm text-muted-foreground">
                            {assignment.projectName}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-muted-foreground">
                            {formatDate(assignment.startDate)} -{' '}
                            {formatDate(assignment.endDate)}
                          </div>
                          <div className="mt-0.5">
                            <span className="font-mono">
                              {assignment.actualHours}/{assignment.plannedHours}u
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Beschikbaarheid Tab */}
            <TabsContent value="beschikbaarheid" className="mt-4">
              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <h2 className="font-semibold">Afwezigheid</h2>
                  <Button variant="outline" size="sm" onClick={onAddAvailability}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Toevoegen
                  </Button>
                </div>

                {employee.availability.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Geen afwezigheid geregistreerd
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {employee.availability.map((avail) => (
                      <div
                        key={avail.id}
                        className="flex items-center gap-4 px-6 py-4"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatDate(avail.date)}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn('text-xs', getStatusColor(avail.status))}
                            >
                              {getStatusLabel(avail.status)}
                            </Badge>
                          </div>
                          {avail.notes && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {avail.notes}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Afwezigheid acties">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => onEditAvailability?.(avail.id)}
                            >
                              Bewerken
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={() => onDeleteAvailability?.(avail.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Verwijderen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
