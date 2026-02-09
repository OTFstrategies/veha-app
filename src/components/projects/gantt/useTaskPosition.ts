import * as React from 'react'
import type { TimelineConfig } from '../types'
import type { Task } from '@/types/projects'

export function useTaskPosition(timelineConfig: TimelineConfig) {
  const getPosition = React.useCallback(
    (startDateStr: string, durationOrEndDate: number | string) => {
      const startDate = new Date(startDateStr)
      const dayOffset = Math.floor(
        (startDate.getTime() - timelineConfig.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const left = dayOffset * timelineConfig.columnWidth

      let width: number
      if (typeof durationOrEndDate === 'number') {
        width = durationOrEndDate * timelineConfig.columnWidth
      } else {
        const endDate = new Date(durationOrEndDate)
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        width = duration * timelineConfig.columnWidth
      }

      return { left, width }
    },
    [timelineConfig.startDate, timelineConfig.columnWidth]
  )

  const getTaskBarPosition = React.useCallback(
    (task: Task) => getPosition(task.startDate, task.duration),
    [getPosition]
  )

  const getBaselinePosition = React.useCallback(
    (task: Task) => {
      if (!task.isBaselineSet || !task.baselineStartDate || !task.baselineDuration) return null
      return getPosition(task.baselineStartDate, task.baselineDuration)
    },
    [getPosition]
  )

  const getPreviewPosition = React.useCallback(
    (startDateStr: string, endDateStr: string) => getPosition(startDateStr, endDateStr),
    [getPosition]
  )

  return { getTaskBarPosition, getBaselinePosition, getPreviewPosition }
}
