import Papa from "papaparse"
import { saveAs } from "file-saver"

export interface CsvColumn<T> {
  key: keyof T
  header: string
}

export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: CsvColumn<T>[]
) {
  if (data.length === 0) {
    console.warn("No data to export")
    return
  }

  const headers = columns
    ? columns.map((c) => c.header)
    : Object.keys(data[0] || {})

  const rows = data.map((item) => {
    if (columns) {
      return columns.map((c) => formatCsvValue(item[c.key]))
    }
    return Object.values(item).map((v) => formatCsvValue(v))
  })

  const csv = Papa.unparse({
    fields: headers,
    data: rows,
  })

  // Add BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF"
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" })
  saveAs(blob, `${filename}.csv`)
}

function formatCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }
  if (value instanceof Date) {
    return value.toISOString().split("T")[0]
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}
