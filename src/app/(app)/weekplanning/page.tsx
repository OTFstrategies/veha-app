import { redirect } from "next/navigation"

/**
 * Weekplanning page - redirects to resources with weekplanning tab
 * The weekplanning functionality is consolidated in the resources page
 */
export default function WeekplanningPage() {
  redirect("/resources?tab=weekplanning")
}
