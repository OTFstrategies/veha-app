"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts"
import { useWorkspaceStore } from "@/stores/workspace-store"
import {
  useResourceUtilization,
  aggregateUtilization,
  type AggregatedWeeklyUtilization,
} from "@/queries/resource-utilization"
import { addWeeks, startOfWeek } from "date-fns"
import { Loader2 } from "lucide-react"

// =============================================================================
// Props
// =============================================================================

interface ResourceHistogramProps {
  /** Specific employee ID to filter by (optional) */
  employeeId?: string
  /** Number of weeks to show */
  weeksToShow?: number
  /** Height of the chart */
  height?: number
}

// =============================================================================
// Colors
// =============================================================================

const STATUS_COLORS = {
  overbooked: "#ef4444", // red-500 — KEEP: error/overbooked state
  optimal: "#3f3f46", // zinc-700
  underutilized: "#71717a", // zinc-500
}

// =============================================================================
// Component
// =============================================================================

export function ResourceHistogram({
  employeeId,
  weeksToShow = 12,
  height = 300,
}: ResourceHistogramProps) {
  const { currentWorkspaceId } = useWorkspaceStore()

  // Calculate date range
  const startDate = React.useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), [])
  const endDate = React.useMemo(() => addWeeks(startDate, weeksToShow), [startDate, weeksToShow])

  // Fetch utilization data
  const { data: utilizationData, isLoading, error } = useResourceUtilization({
    workspaceId: currentWorkspaceId,
    startDate,
    endDate,
    employeeIds: employeeId ? [employeeId] : undefined,
  })

  // Aggregate data for chart
  const chartData = React.useMemo<AggregatedWeeklyUtilization[]>(() => {
    if (!utilizationData) return []
    return aggregateUtilization(utilizationData)
  }, [utilizationData])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center text-destructive" style={{ height }}>
        Fout bij laden van bezettingsdata
      </div>
    )
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        Geen bezettingsdata beschikbaar
      </div>
    )
  }

  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="weekLabel"
            className="text-xs"
            tick={{ fill: "currentColor" }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: "currentColor" }}
            label={{
              value: "Uren",
              angle: -90,
              position: "insideLeft",
              className: "fill-muted-foreground text-xs",
            }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Capacity reference line */}
          <ReferenceLine
            y={chartData[0]?.totalCapacity || 40}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{
              value: "Capaciteit",
              position: "insideTopRight",
              className: "fill-red-500 text-xs",
            }}
          />

          {/* Hours bar with dynamic colors */}
          <Bar
            dataKey="totalPlannedHours"
            name="Geplande uren"
            radius={[4, 4, 0, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// =============================================================================
// Custom Tooltip
// =============================================================================

interface TooltipPayload {
  payload: AggregatedWeeklyUtilization
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.[0]) return null

  const data = payload[0].payload
  const statusLabels = {
    overbooked: "Overbezet",
    optimal: "Optimaal",
    underutilized: "Onderbezet",
  }

  return (
    <div className="bg-popover border border-border rounded-md p-3 shadow-md">
      <p className="font-medium mb-2">Week van {data.weekLabel}</p>
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-muted-foreground">Gepland:</span>{" "}
          <span className="font-medium">{data.totalPlannedHours}u</span>
        </p>
        <p>
          <span className="text-muted-foreground">Capaciteit:</span>{" "}
          <span className="font-medium">{data.totalCapacity}u</span>
        </p>
        <p>
          <span className="text-muted-foreground">Bezetting:</span>{" "}
          <span
            className="font-medium"
            style={{ color: STATUS_COLORS[data.status] }}
          >
            {data.utilizationPercent}%
          </span>
        </p>
        <p className="text-xs mt-2" style={{ color: STATUS_COLORS[data.status] }}>
          {statusLabels[data.status]}
        </p>
      </div>
    </div>
  )
}
