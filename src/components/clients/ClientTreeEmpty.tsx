import { Building2, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

// =============================================================================
// Props
// =============================================================================

interface ClientTreeEmptyProps {
  hasFilters: boolean
  onAddClient?: () => void
}

// =============================================================================
// Component
// =============================================================================

export function ClientTreeEmpty({ hasFilters, onAddClient }: ClientTreeEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        {hasFilters ? (
          <Search className="h-8 w-8 text-zinc-400" />
        ) : (
          <Building2 className="h-8 w-8 text-zinc-400" />
        )}
      </div>

      <h3 className="mb-1 text-lg font-semibold">
        {hasFilters ? 'Geen klanten gevonden' : 'Nog geen klanten'}
      </h3>

      <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
        {hasFilters
          ? 'Probeer andere zoektermen of filters.'
          : 'Voeg je eerste klant toe om te beginnen met projecten.'}
      </p>

      {!hasFilters && (
        <Button onClick={onAddClient}>
          <Plus className="mr-2 h-4 w-4" />
          Nieuwe Klant
        </Button>
      )}
    </div>
  )
}
