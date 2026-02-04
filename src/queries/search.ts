import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export interface SearchResult {
  type: "project" | "task" | "client" | "employee"
  id: string
  title: string
  subtitle: string
  href: string
}

export function useGlobalSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["global-search", query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return []

      const supabase = createClient()
      const results: SearchResult[] = []

      // Search projects
      const { data: projects } = await supabase
        .from("projects")
        .select("id, name, client:clients(name)")
        .ilike("name", `%${query}%`)
        .limit(5)

      projects?.forEach((p) => {
        // Supabase returns single relations as objects, arrays for many
        const clientData = p.client as unknown as { name: string } | null
        results.push({
          type: "project",
          id: p.id,
          title: p.name,
          subtitle: clientData?.name || "Geen klant",
          href: `/projects/${p.id}`,
        })
      })

      // Search tasks
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, name, project:projects(id, name)")
        .ilike("name", `%${query}%`)
        .limit(5)

      tasks?.forEach((t) => {
        const project = t.project as unknown as { id: string; name: string } | null
        results.push({
          type: "task",
          id: t.id,
          title: t.name,
          subtitle: project?.name || "Geen project",
          href: project ? `/projects/${project.id}/gantt?task=${t.id}` : "#",
        })
      })

      // Search clients
      const { data: clients } = await supabase
        .from("clients")
        .select("id, name, email")
        .ilike("name", `%${query}%`)
        .limit(5)

      clients?.forEach((c) => {
        results.push({
          type: "client",
          id: c.id,
          title: c.name,
          subtitle: c.email || "Geen email",
          href: `/clients/${c.id}`,
        })
      })

      // Search employees
      const { data: employees } = await supabase
        .from("employees")
        .select("id, name, email")
        .ilike("name", `%${query}%`)
        .limit(5)

      employees?.forEach((e) => {
        results.push({
          type: "employee",
          id: e.id,
          title: e.name,
          subtitle: e.email || "Geen email",
          href: `/resources/employees/${e.id}`,
        })
      })

      return results
    },
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 30, // 30 seconds
  })
}
