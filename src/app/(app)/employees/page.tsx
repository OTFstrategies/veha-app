import { redirect } from "next/navigation"

export default function EmployeesPage() {
  redirect("/resources?tab=medewerkers")
}
