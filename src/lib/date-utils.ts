export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function parseDDMMYYYY(value: string): string | null {
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) return null
  const day = m[1].padStart(2, "0")
  const month = m[2].padStart(2, "0")
  const year = m[3]
  const iso = `${year}-${month}-${day}`
  const d = new Date(iso + "T00:00:00")
  if (isNaN(d.getTime())) return null
  return iso
}

export function formatDateLong(dateStr: string): string {
  return formatDateDDMMYYYY(dateStr)
}

export function formatDateShort(dateStr: string): string {
  return formatDateDDMMYYYY(dateStr)
}

export function formatTimeDisplay(hour: number, minute: number): string {
  const period = hour >= 12 ? "PM" : "AM"
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`
}

export function getTimeRangeLabel(type: string): string {
  const labels: Record<string, string> = {
    anytime: "Anytime",
    morning: "Morning",
    afternoon: "Afternoon",
    evening: "Evening",
    night: "Night",
    custom: "Custom Time",
  }
  return labels[type] || "Anytime"
}
