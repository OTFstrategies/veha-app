// =============================================================================
// Props
// =============================================================================

interface DependencyArrowProps {
  fromX: number
  fromY: number
  toX: number
  toY: number
}

// =============================================================================
// Component
// =============================================================================

export function DependencyArrow({
  fromX,
  fromY,
  toX,
  toY,
}: DependencyArrowProps) {
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
    // Target is behind or very close - need S-shaped path
    const bendY = goingDown ? fromY + 20 : fromY - 20
    path = `
      M ${fromX} ${fromY}
      L ${fromX + horizontalGap} ${fromY}
      Q ${fromX + horizontalGap + cornerRadius} ${fromY} ${fromX + horizontalGap + cornerRadius} ${fromY + (goingDown ? cornerRadius : -cornerRadius)}
      L ${fromX + horizontalGap + cornerRadius} ${bendY}
      Q ${fromX + horizontalGap + cornerRadius} ${bendY + (goingDown ? cornerRadius : -cornerRadius)} ${fromX + horizontalGap} ${bendY + (goingDown ? cornerRadius * 2 : -cornerRadius * 2)}
      L ${toX - horizontalGap} ${toY + (goingDown ? -cornerRadius * 2 : cornerRadius * 2)}
      Q ${toX - horizontalGap - cornerRadius} ${toY + (goingDown ? -cornerRadius : cornerRadius)} ${toX - horizontalGap - cornerRadius} ${toY}
      L ${toX - 6} ${toY}
    `
  }

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible"
      style={{ zIndex: 5 }}
    >
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-stone-500 dark:text-stone-400"
      />

      {/* Arrowhead */}
      <polygon
        points={`${toX - 6},${toY - 3} ${toX},${toY} ${toX - 6},${toY + 3}`}
        fill="currentColor"
        className="text-stone-500 dark:text-stone-400"
      />
    </svg>
  )
}
