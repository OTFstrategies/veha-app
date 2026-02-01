import { redirect } from "next/navigation"

/**
 * Employees page - redirects to resources with employees tab
 * The employees functionality is consolidated in the resources page
 */
export default function EmployeesPage() {
  redirect("/resources?tab=medewerkers")
}
