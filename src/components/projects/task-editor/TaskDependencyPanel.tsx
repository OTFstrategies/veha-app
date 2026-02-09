import { ArrowRight, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { Task, DependencyType } from '@/types/projects'
import type { DependencyPreview } from '@/queries/tasks'

const DEPENDENCY_TYPES: Array<{ value: DependencyType; label: string }> = [
  { value: 'FS', label: 'Finish-to-Start' },
  { value: 'SS', label: 'Start-to-Start' },
  { value: 'FF', label: 'Finish-to-Finish' },
  { value: 'SF', label: 'Start-to-Finish' },
]

function getDependencyLabel(type: DependencyType): string {
  const found = DEPENDENCY_TYPES.find((t) => t.value === type)
  return found?.label ?? type
}

interface PendingDependency {
  predecessorId: string
  type: DependencyType
  lag: number
}

interface TaskDependencyPanelProps {
  task: Task
  availablePredecessors: Task[]
  pendingDependency: PendingDependency | null
  onPendingDependencyChange: (dep: PendingDependency | null) => void
  inlinePreview: DependencyPreview[]
  inlinePreviewError: string | null
  isPreviewLoading: boolean
  isRemoveLoading: boolean
  onPreviewDependency: () => void
  onRemoveDependency: (dependencyId: string) => void
}

export function TaskDependencyPanel({
  task,
  availablePredecessors,
  pendingDependency,
  onPendingDependencyChange,
  inlinePreview,
  inlinePreviewError,
  isPreviewLoading,
  isRemoveLoading,
  onPreviewDependency,
  onRemoveDependency,
}: TaskDependencyPanelProps) {
  return (
    <div className="space-y-4">
      {/* Existing Dependencies */}
      <div>
        <Label className="text-xs text-muted-foreground">Huidige dependencies</Label>
        {task.dependencies.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-border py-6 text-center">
            <Link2 className="mx-auto h-6 w-6 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">Geen dependencies</p>
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {task.dependencies.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800"
              >
                <div>
                  <span className="font-medium">{dep.predecessorName}</span>
                  <span className="ml-2 text-zinc-500 dark:text-zinc-400">
                    ({getDependencyLabel(dep.type)})
                    {dep.lag !== 0 && ` +${dep.lag}d`}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveDependency(dep.id)}
                  className="h-7 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                  disabled={isRemoveLoading}
                >
                  Verwijderen
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Add New Dependency */}
      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground">Nieuwe dependency toevoegen</Label>

        <div className="grid grid-cols-3 gap-3">
          {/* Predecessor select */}
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
              Voorganger
            </label>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={pendingDependency?.predecessorId ?? ''}
              onChange={(e) =>
                onPendingDependencyChange({
                  predecessorId: e.target.value,
                  type: pendingDependency?.type ?? 'FS',
                  lag: pendingDependency?.lag ?? 0,
                })
              }
            >
              <option value="">Selecteer taak...</option>
              {availablePredecessors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type select */}
          <div>
            <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
              Type
            </label>
            <select
              className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              value={pendingDependency?.type ?? 'FS'}
              onChange={(e) =>
                onPendingDependencyChange({
                  predecessorId: pendingDependency?.predecessorId ?? '',
                  type: e.target.value as DependencyType,
                  lag: pendingDependency?.lag ?? 0,
                })
              }
            >
              {DEPENDENCY_TYPES.map((dt) => (
                <option key={dt.value} value={dt.value}>
                  {dt.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lag days */}
        <div>
          <label className="mb-1 block text-xs text-zinc-500 dark:text-zinc-400">
            Lag (dagen)
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-24 font-mono"
              value={pendingDependency?.lag ?? 0}
              onChange={(e) =>
                onPendingDependencyChange({
                  predecessorId: pendingDependency?.predecessorId ?? '',
                  type: pendingDependency?.type ?? 'FS',
                  lag: parseInt(e.target.value) || 0,
                })
              }
            />
            <span className="text-xs text-zinc-500">
              Positief = vertraging, negatief = overlap
            </span>
          </div>
        </div>

        {/* Inline Cascade Preview */}
        {inlinePreviewError && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {inlinePreviewError}
          </div>
        )}

        {pendingDependency?.predecessorId && inlinePreview.length > 0 && (
          <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Deze wijziging zal {inlinePreview.length}{' '}
              {inlinePreview.length === 1 ? 'taak' : 'taken'} verplaatsen:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
              {inlinePreview.slice(0, 3).map((t) => (
                <li key={t.taskId} className="flex items-center gap-1">
                  <span className="text-amber-500">&#8226;</span>
                  <span className="font-medium">{t.taskName}:</span>
                  <span className="line-through opacity-60">
                    {new Date(t.oldStartDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </span>
                  <ArrowRight className="h-3 w-3" />
                  <span>
                    {new Date(t.newStartDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} - {new Date(t.newEndDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </span>
                </li>
              ))}
              {inlinePreview.length > 3 && (
                <li className="text-amber-600 dark:text-amber-400">
                  ... en {inlinePreview.length - 3} meer
                </li>
              )}
            </ul>
          </div>
        )}

        {pendingDependency?.predecessorId && inlinePreview.length === 0 && !inlinePreviewError && !isPreviewLoading && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-300">
            Geen taken worden beinvloed door deze dependency.
          </div>
        )}

        {/* Add button */}
        <Button
          onClick={onPreviewDependency}
          disabled={!pendingDependency?.predecessorId || isPreviewLoading}
          className="w-full"
        >
          {isPreviewLoading ? 'Berekenen...' : 'Dependency Toevoegen'}
        </Button>
      </div>
    </div>
  )
}
