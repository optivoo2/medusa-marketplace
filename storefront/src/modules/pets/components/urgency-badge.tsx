"use client"

import { Text } from "@medusajs/ui"
import { calculateUrgency, getUrgencyStyles } from "@lib/urgency-calculator"

type UrgencyBadgeProps = {
  highlightUntil?: string
  className?: string
}

export default function UrgencyBadge({ highlightUntil, className = "" }: UrgencyBadgeProps) {
  const urgency = calculateUrgency(highlightUntil || "")
  const styles = getUrgencyStyles(urgency.color)

  if (urgency.status === 'expirado') {
    return null
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${styles.bg} ${styles.border} ${className}`}>
      <Text className={`text-xs font-medium ${styles.text}`}>
        {urgency.badgeText}
        {urgency.daysLeft > 0 && ` (${urgency.daysLeft}d)`}
      </Text>
    </div>
  )
}
