"use client"

import * as React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useGlobalSearch, SearchResult } from "@/queries/search"
import { Search, Briefcase, CheckSquare, Users, User } from "lucide-react"
import { useRouter } from "next/navigation"

const typeIcons = {
  project: Briefcase,
  task: CheckSquare,
  client: Users,
  employee: User,
}

const typeLabels = {
  project: "Project",
  task: "Taak",
  client: "Klant",
  employee: "Medewerker",
}

interface QuickSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickSearchDialog({ open, onOpenChange }: QuickSearchDialogProps) {
  const [query, setQuery] = React.useState("")
  const router = useRouter()
  const { data: results, isLoading } = useGlobalSearch(query, open)

  // Reset query when dialog closes
  React.useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoeken... (Ctrl+K)"
            className="border-0 focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {isLoading && (
            <p className="p-4 text-sm text-muted-foreground">Zoeken...</p>
          )}
          {!isLoading && results?.length === 0 && query.length >= 2 && (
            <p className="p-4 text-sm text-muted-foreground">
              Geen resultaten gevonden
            </p>
          )}
          {!isLoading && query.length < 2 && query.length > 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Typ minimaal 2 tekens om te zoeken
            </p>
          )}
          {results?.map((result) => {
            const Icon = typeIcons[result.type]
            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleSelect(result)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {typeLabels[result.type]}
                </span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
