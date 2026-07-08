export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatDateLong(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
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
