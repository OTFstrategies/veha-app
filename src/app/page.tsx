import { redirect } from "next/navigation"

/**
 * Root page - redirects to dashboard
 * Authentication is handled by middleware
 */
export default function Home() {
  redirect("/dashboard")
}
