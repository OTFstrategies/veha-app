'use client'

import { cn } from '@/lib/utils'
import type { DependencyType } from '@/types/projects'

// =============================================================================
// Props
// =============================================================================

interface DependencyArrowProps {
  /** Starting X coordinate (from predecessor task) */
  fromX: number
  /** Starting Y coordinate (from predecessor task) */
  fromY: number
  /** Ending X coordinate (to successor task) */
  toX: number
  /** Ending Y coordinate (to successor task) */
  toY: number
  /** Dependency type (FS, SS, FF, SF) */
  type?: DependencyType
  /** Whether the arrow is currently highlighted (hovered) */
  isHighlighted?: boolean
  /** Called when mouse enters the arrow */
  onMouseEnter?: () => void
  /** Called when mouse leaves the arrow */
  onMouseLeave?: () => void
}

// =============================================================================
// Component
// =============================================================================

export function DependencyArrow({
  fromX,
  fromY,
  toX,
  toY,
  type: _type,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave,
}: DependencyArrowProps) {
  // Note: type is available for future color-coding per dependency type
  void _type

  // Calculate path for the dependency line
  // We use a path that goes: right from source, down/up, then right to target
  const horizontalGap = 8 // Gap before arrow starts
  const cornerRadius = 4

  // Determine if we're going up or down
  const goingDown = toY > fromY
  const midX = fromX + horizontalGap + (toX - fromX - horizontalGap) / 2

  // Build the path
  let path = ''

  if (toX > fromX + horizontalGap * 2) {
    // Normal case: target is to the right
    if (Math.abs(toY - fromY) < 2) {
      // Same row - straight line
      path = `M ${fromX} ${fromY} L ${toX - 6} ${toY}`
    } else {
      // Different rows - L-shaped path
      path = `
        M ${fromX} ${fromY}
        L ${midX - cornerRadius} ${fromY}
        Q ${midX} ${fromY} ${midX} ${fromY + (goingDown ? cornerRadius : -cornerRadius)}
        L ${midX} ${toY + (goingDown ? -cornerRadius : cornerRadius)}
        Q ${midX} ${toY} ${midX + cornerRadius} ${toY}
        L ${toX - 6} ${toY}
      `
    }
  } else {
    // Target is to the left or very close - need S-shaped path to go around
    const verticalMid = (fromY + toY) / 2

    path = `
      M ${fromX} ${fromY}
      L ${fromX + horizontalGap} ${fromY}
      Q ${fromX + horizontalGap + cornerRadius} ${fromY} ${fromX + horizontalGap + cornerRadius} ${fromY + (goingDown ? cornerRadius : -cornerRadius)}
      L ${fromX + horizontalGap + cornerRadius} ${verticalMid - (goingDown ? cornerRadius : -cornerRadius)}
      Q ${fromX + horizontalGap + cornerRadius} ${verticalMid} ${fromX + horizontalGap} ${verticalMid}
      L ${toX - horizontalGap} ${verticalMid}
      Q ${toX - horizontalGap - cornerRadius} ${verticalMid} ${toX - horizontalGap - cornerRadius} ${verticalMid + (goingDown ? cornerRadius : -cornerRadius)}
      L ${toX - horizontalGap - cornerRadius} ${toY + (goingDown ? -cornerRadius : cornerRadius)}
      Q ${toX - horizontalGap - cornerRadius} ${toY} ${toX - horizontalGap} ${toY}
      L ${toX - 6} ${toY}
    `
  }

  const strokeClass = isHighlighted
    ? 'stroke-zinc-600 dark:stroke-zinc-300'
    : 'stroke-zinc-400 dark:stroke-zinc-500'

  const fillClass = isHighlighted
    ? 'fill-zinc-600 dark:fill-zinc-300'
    : 'fill-zinc-400 dark:fill-zinc-500'

  // Arrow head pointing right
  const arrowHeadPoints = `${toX - 6},${toY - 3} ${toX},${toY} ${toX - 6},${toY + 3}`

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible"
      style={{ zIndex: isHighlighted ? 10 : 1 }}
      role="img"
      aria-label="Taak afhankelijkheid"
    >
      <g
        className={cn('transition-colors duration-150')}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Path line */}
        <path
          d={path}
          className={cn(strokeClass, 'fill-none', isHighlighted ? 'stroke-[2]' : 'stroke-[1.5]')}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrow head */}
        <polygon points={arrowHeadPoints} className={fillClass} />

        {/* Invisible wider hit area for easier hover interaction */}
        <path
          d={path}
          className="pointer-events-auto cursor-pointer fill-none stroke-transparent stroke-[12]"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      </g>
    </svg>
  )
}

// =============================================================================
// Dependency Type Label (for legend/tooltip use)
// =============================================================================

interface DependencyTypeLabelProps {
  type: DependencyType
}

/**
 * Human-readable label for dependency types.
 * Can be used in tooltips or legends.
 */
export function DependencyTypeLabel({ type }: DependencyTypeLabelProps) {
  const labels: Record<DependencyType, string> = {
    FS: 'Einde naar Start',
    SS: 'Start naar Start',
    FF: 'Einde naar Einde',
    SF: 'Start naar Einde',
  }

  return <span className="text-xs text-zinc-500 dark:text-zinc-400">{labels[type]}</span>
}
