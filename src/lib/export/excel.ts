import ExcelJS from "exceljs"
import { saveAs } from "file-saver"

export interface ExcelColumn<T> {
  key: keyof T
  header: string
  width?: number
}

export async function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns: ExcelColumn<T>[],
  sheetName: string = "Data"
) {
  if (data.length === 0) {
    console.warn("No data to export")
    return
  }

  const workbook = new ExcelJS.Workbook()
  workbook.creator = "VEHA Dashboard"
  workbook.created = new Date()

  const worksheet = workbook.addWorksheet(sheetName)

  // Add headers
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: String(col.key),
    width: col.width || 20,
  }))

  // Style header row
  const headerRow = worksheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  }
  headerRow.border = {
    bottom: { style: "thin", color: { argb: "FF999999" } },
  }

  // Add data rows
  data.forEach((item) => {
    const row: Record<string, unknown> = {}
    columns.forEach((col) => {
      row[String(col.key)] = formatExcelValue(item[col.key])
    })
    worksheet.addRow(row)
  })

  // Auto-filter
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  }

  // Freeze header row
  worksheet.views = [{ state: "frozen", ySplit: 1 }]

  // Generate and save
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  saveAs(blob, `${filename}.xlsx`)
}

function formatExcelValue(value: unknown): string | number | Date | null {
  if (value === null || value === undefined) {
    return null
  }
  if (value instanceof Date) {
    return value
  }
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "boolean") {
    return value ? "Ja" : "Nee"
  }
  if (typeof value === "object") {
    return JSON.stringify(value)
  }
  return String(value)
}
