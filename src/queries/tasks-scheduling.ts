import { useQuery } from '@tanstack/react-query'
import type { Task } from '@/types/projects'
import { calculateCriticalPathDetailed } from '@/lib/scheduling'
import type { CriticalPathResult } from '@/lib/scheduling/critical-path'

// =============================================================================
// Scheduling Queries
// =============================================================================

/**
 * Calculate critical path for a project's tasks
 * Returns schedule info including which tasks are critical and their float values
 */
export function useCriticalPath(tasks: Task[]) {
  return useQuery<CriticalPathResult>({
    queryKey: ['critical-path', tasks.map(t => t.id).join(',')],
    queryFn: () => {
      if (!tasks || tasks.length === 0) {
        return {
          criticalPath: [],
          scheduleInfo: new Map(),
          projectDuration: 0,
        }
      }

      return calculateCriticalPathDetailed(tasks)
    },
    enabled: tasks.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}
