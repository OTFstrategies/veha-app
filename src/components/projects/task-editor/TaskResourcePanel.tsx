import { Trash2, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Task } from '@/types/projects'

interface TaskResourcePanelProps {
  task: Task
  availableEmployees: Array<{ id: string; name: string; color: string }>
  showAddEmployee: boolean
  onToggleAddEmployee: () => void
  onEmployeeSelect: (employeeId: string) => void
  onRemoveAssignment: (assignmentId: string) => void
}

function getInitials(name: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TaskResourcePanel({
  task,
  availableEmployees,
  showAddEmployee,
  onToggleAddEmployee,
  onEmployeeSelect,
  onRemoveAssignment,
}: TaskResourcePanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Toegewezen</Label>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1 text-xs"
          onClick={onToggleAddEmployee}
          disabled={availableEmployees.length === 0}
        >
          <UserPlus className="h-3 w-3" />
          Toevoegen
        </Button>
      </div>

      {/* Add Employee Dropdown */}
      {showAddEmployee && availableEmployees.length > 0 && (
        <div className="rounded-md border border-border bg-background p-2">
          <Label className="text-xs text-muted-foreground mb-2 block">
            Selecteer medewerker
          </Label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => onEmployeeSelect(e.target.value)}
            defaultValue=""
          >
            <option value="">Kies een medewerker...</option>
            {availableEmployees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {task.assignments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-8 text-center">
          <UserPlus className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nog geen medewerkers toegewezen
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {task.assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center gap-3 rounded-lg border border-border p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-xs font-medium text-white"
                  style={{ backgroundColor: assignment.employeeColor }}
                >
                  {getInitials(assignment.employeeName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">{assignment.employeeName}</div>
                <div className="text-xs text-muted-foreground">
                  {assignment.plannedHours}u gepland / {assignment.actualHours}u gewerkt
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => onRemoveAssignment(assignment.id)}
                aria-label={`Verwijder ${assignment.employeeName}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
