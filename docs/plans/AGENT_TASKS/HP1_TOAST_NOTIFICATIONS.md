# HP-1: Toast Notifications Implementatie

## Metadata
- **ID:** HP-1
- **Prioriteit:** Hoog
- **Geschatte tijd:** 2-3 uur
- **Dependencies:** Geen (kan parallel)
- **Agent type:** Frontend
- **Status:** COMPLETED

---

## Doel
Integreer het bestaande toast notification systeem in de hele applicatie zodat gebruikers feedback krijgen bij alle CRUD operaties.

---

## Context

### Huidige Situatie
- Toast component bestaat: `src/components/ui/toast.tsx`
- Volledig geïmplementeerd met:
  - 4 types: success, error, warning, info
  - Auto-dismiss na 5 seconden
  - Dark mode support
  - Lucide icons
- **NIET** geïntegreerd in de applicatie
- Geen enkele form gebruikt momenteel toasts

### Bestaande Code Review

```tsx
// src/components/ui/toast.tsx - Bestaande exports
export const ToastProvider: React.FC<{ children: React.ReactNode }>
export function useToast(): { toast: (options: ToastOptions) => void }

interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}
```

---

## Taken

### Taak 1.1: ToastProvider toevoegen aan Root Layout
- [x] **Bestand:** `src/app/layout.tsx`

**Stappen:**
1. Lees het huidige layout bestand
2. Importeer ToastProvider uit `@/components/ui/toast`
3. Wrap children met ToastProvider BINNEN QueryProvider

**Verwachte wijziging:**
```tsx
import { ToastProvider } from "@/components/ui/toast"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={/* existing classes */}>
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

**Verificatie:**
- App start zonder errors
- ToastProvider context is beschikbaar in child components

---

### Taak 1.2: Toast in ClientFormModal
- [x] **Bestand:** `src/app/(app)/clients/page.tsx` (parent page handles mutations)

**Stappen:**
1. Importeer `useToast` hook
2. Voeg toast calls toe in onSubmit success/error handlers
3. Nederlandse berichten gebruiken

**Code toe te voegen:**
```tsx
import { useToast } from "@/components/ui/toast"

export function ClientFormModal({ /* props */ }) {
  const { toast } = useToast()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      if (client) {
        // Update bestaande client
        const { error } = await supabase
          .from('clients')
          .update({ /* data */ })
          .eq('id', client.id)

        if (error) throw error
        toast({ type: 'success', message: 'Klant succesvol bijgewerkt' })
      } else {
        // Nieuwe client
        const { error } = await supabase
          .from('clients')
          .insert({ /* data */ })

        if (error) throw error
        toast({ type: 'success', message: 'Klant succesvol aangemaakt' })
      }
      onClose()
    } catch (error) {
      console.error('Error saving client:', error)
      toast({ type: 'error', message: 'Fout bij opslaan van klant' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bij delete (indien aanwezig)
  async function handleDelete() {
    try {
      await supabase.from('clients').delete().eq('id', client.id)
      toast({ type: 'success', message: 'Klant verwijderd' })
      onClose()
    } catch (error) {
      toast({ type: 'error', message: 'Fout bij verwijderen van klant' })
    }
  }
}
```

---

### Taak 1.3: Toast in ContactFormModal
- [x] **Bestand:** `src/app/(app)/clients/page.tsx` (parent page handles mutations)

**Berichten:**
- Success create: "Contactpersoon succesvol aangemaakt"
- Success update: "Contactpersoon succesvol bijgewerkt"
- Success delete: "Contactpersoon verwijderd"
- Error: "Fout bij opslaan van contactpersoon"

---

### Taak 1.4: Toast in LocationFormModal
- [x] **Bestand:** `src/app/(app)/clients/page.tsx` (parent page handles mutations)

**Berichten:**
- Success create: "Locatie succesvol aangemaakt"
- Success update: "Locatie succesvol bijgewerkt"
- Success delete: "Locatie verwijderd"
- Error: "Fout bij opslaan van locatie"

---

### Taak 1.5: Toast in EmployeeFormModal
- [x] **Bestand:** `src/app/(app)/employees/page.tsx` (parent page handles mutations)

**Berichten:**
- Success create: "Medewerker succesvol aangemaakt"
- Success update: "Medewerker succesvol bijgewerkt"
- Error: "Fout bij opslaan van medewerker"

---

### Taak 1.6: Toast in AvailabilityFormModal
- [x] **Bestand:** `src/app/(app)/employees/[id]/page.tsx` (parent page handles mutations)

**Berichten:**
- Success: "Beschikbaarheid opgeslagen"
- Error: "Fout bij opslaan van beschikbaarheid"

---

### Taak 1.7: Toast in EmployeeDetail (activate/deactivate)
- [x] **Bestand:** `src/app/(app)/employees/[id]/page.tsx`

**Zoek naar:** `handleToggleActive` of soortgelijke functie

**Berichten:**
- Activate: "Medewerker geactiveerd"
- Deactivate: "Medewerker gedeactiveerd"
- Error: "Fout bij wijzigen status"

---

### Taak 1.8: Toast in TaskEditor
- [x] **Bestand:** `src/app/(app)/projects/[id]/page.tsx` (parent page handles mutations)

**Berichten:**
- Success save: "Taak opgeslagen"
- Success delete: "Taak verwijderd"
- Error: "Fout bij opslaan van taak"

---

### Taak 1.9: Toast in Auth flows
- [x] **Bestanden:**
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`

**Berichten Login:**
- Error invalid credentials: "Ongeldige inloggegevens"
- Error generic: "Fout bij inloggen"

**Berichten Signup:**
- Success: "Account aangemaakt! Controleer je email."
- Error email exists: "Dit emailadres is al in gebruik"
- Error generic: "Fout bij registreren"

**Berichten Forgot Password:**
- Success: "Wachtwoord reset link verzonden"
- Error: "Fout bij verzenden reset link"

---

## Verificatie Checklist

Test elk scenario handmatig:

### Client CRUD
- [ ] Nieuwe klant aanmaken → groene toast "Klant succesvol aangemaakt"
- [ ] Klant bewerken → groene toast "Klant succesvol bijgewerkt"
- [ ] Klant verwijderen → groene toast "Klant verwijderd"
- [ ] Fout simuleren (bijv. netwerk uit) → rode toast met error

### Contact CRUD
- [ ] Nieuw contact aanmaken → groene toast
- [ ] Contact bewerken → groene toast
- [ ] Contact verwijderen → groene toast

### Location CRUD
- [ ] Nieuwe locatie aanmaken → groene toast
- [ ] Locatie bewerken → groene toast
- [ ] Locatie verwijderen → groene toast

### Employee CRUD
- [ ] Nieuwe medewerker aanmaken → groene toast
- [ ] Medewerker bewerken → groene toast
- [ ] Medewerker activeren/deactiveren → groene toast

### Task Management
- [ ] Taak opslaan → groene toast
- [ ] Taak verwijderen → groene toast

### Auth
- [ ] Login error → rode toast
- [ ] Signup success → groene toast
- [ ] Forgot password success → groene toast

### UI/UX
- [ ] Toast verschijnt rechtsonder
- [ ] Toast verdwijnt na 5 seconden
- [ ] Toast heeft X knop om te sluiten
- [ ] Dark mode: toast styling is correct
- [ ] Meerdere toasts stacken correct

---

## Niet Doen
- Geen wijzigingen aan toast.tsx component zelf (werkt al)
- Geen nieuwe toast types toevoegen
- Geen wijzigingen aan styling

---

## Definition of Done
1. ToastProvider is geïntegreerd in root layout
2. Alle 9 form modals/pages hebben toast feedback
3. Alle CRUD operaties tonen success/error toasts
4. Nederlandse berichten overal
5. Verificatie checklist volledig afgevinkt
