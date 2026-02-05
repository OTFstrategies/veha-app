import * as React from "react"
import { useToast } from "@/components/ui/toast"
import { exportToCSV, exportToExcel, type ExcelColumn } from "@/lib/export"
import type { Task } from "@/types/projects"
import { format } from "date-fns"
import { nl } from "date-fns/locale"

interface ExportTask {
  [key: string]: string | number
  wbs: string
  name: string
  startDate: string
  endDate: string
  duration: number
  progress: number
  status: string
}

interface UseProjectExportProps {
  projectName: string
  tasks: Task[]
}

export function useProjectExport({ projectName, tasks }: UseProjectExportProps) {
  const { addToast } = useToast()
  const [isExporting, setIsExporting] = React.useState(false)

  const taskColumns: ExcelColumn<ExportTask>[] = [
    { key: "wbs", header: "WBS", width: 10 },
    { key: "name", header: "Taaknaam", width: 30 },
    { key: "startDate", header: "Startdatum", width: 15 },
    { key: "endDate", header: "Einddatum", width: 15 },
    { key: "duration", header: "Duur (dagen)", width: 12 },
    { key: "progress", header: "Voortgang (%)", width: 12 },
    { key: "status", header: "Status", width: 15 },
  ]

  const statusLabels: Record<string, string> = {
    not_started: "Niet gestart",
    in_progress: "Bezig",
    completed: "Afgerond",
    on_hold: "On-hold",
  }

  const formatTasksForExport = (): ExportTask[] => {
    return tasks.map((task) => ({
      wbs: task.wbs || "",
      name: task.name,
      startDate: format(new Date(task.startDate), "dd-MM-yyyy", { locale: nl }),
      endDate: format(new Date(task.endDate), "dd-MM-yyyy", { locale: nl }),
      duration: task.duration,
      progress: task.progress || 0,
      status: statusLabels[task.status] || task.status,
    }))
  }

  const sanitizeFilename = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9-_\s]/g, "").replace(/\s+/g, "_")
  }

  const exportCSV = () => {
    try {
      setIsExporting(true)
      const data = formatTasksForExport()
      const filename = `${sanitizeFilename(projectName)}_taken_${format(new Date(), "yyyy-MM-dd")}`
      exportToCSV(data, filename, taskColumns)
      addToast({ type: "success", title: "CSV geëxporteerd" })
    } catch (error) {
      console.error("CSV export failed:", error)
      addToast({ type: "error", title: "Export mislukt" })
    } finally {
      setIsExporting(false)
    }
  }

  const exportExcel = async () => {
    try {
      setIsExporting(true)
      const data = formatTasksForExport()
      const filename = `${sanitizeFilename(projectName)}_taken_${format(new Date(), "yyyy-MM-dd")}`
      await exportToExcel(data, filename, taskColumns, "Taken")
      addToast({ type: "success", title: "Excel geëxporteerd" })
    } catch (error) {
      console.error("Excel export failed:", error)
      addToast({ type: "error", title: "Export mislukt" })
    } finally {
      setIsExporting(false)
    }
  }

  return { exportCSV, exportExcel, isExporting }
}
