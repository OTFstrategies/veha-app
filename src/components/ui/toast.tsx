"use client"

import * as React from "react"
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Meldingen"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }

  const colors = {
    success: "border-state-success-text/20 bg-state-success-bg text-state-success-text",
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-200",
    warning: "border-state-warning-text/20 bg-state-warning-bg text-state-warning-text",
    info: "border-state-info-text/20 bg-state-info-bg text-state-info-text",
  }

  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        "flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-5",
        colors[toast.type]
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description && (
          <p className="text-sm opacity-80">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Melding sluiten"
        className="shrink-0 opacity-60 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
