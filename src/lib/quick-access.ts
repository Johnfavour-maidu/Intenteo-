// Quick Access — unified pin system for sidebar shortcuts

export type QuickAccessItemType = "journal" | "tracker" | "goal" | "vision"

export interface QuickAccessItem {
  id: string
  type: QuickAccessItemType
  title: string
  icon: string
  route: string
  order: number
  createdAt: string
  pinnedAt: string
}

const STORAGE_KEY = "intenteo-quick-access"
const EXPANDED_KEY = "intenteo-quick-access-expanded"

function generateId(): string {
  return crypto.randomUUID?.() || `qa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getQuickAccessItems(): QuickAccessItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as QuickAccessItem[]
    return items.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

function saveQuickAccessItems(items: QuickAccessItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event("quick-access-changed"))
}

export function pinToQuickAccess(item: Omit<QuickAccessItem, "id" | "order" | "pinnedAt">): QuickAccessItem {
  const existing = getQuickAccessItems()
  // Prevent duplicates
  const already = existing.find((i) => i.type === item.type && i.id === item.id)
  if (already) return already

  const newItem: QuickAccessItem = {
    ...item,
    id: generateId(),
    order: existing.length,
    pinnedAt: new Date().toISOString(),
  }
  saveQuickAccessItems([...existing, newItem])
  return newItem
}

export function unpinFromQuickAccess(type: QuickAccessItemType, itemId: string): void {
  const existing = getQuickAccessItems()
  const filtered = existing.filter((i) => !(i.type === type && i.id === itemId))
  // Re-index order
  const reindexed = filtered.map((item, idx) => ({ ...item, order: idx }))
  saveQuickAccessItems(reindexed)
}

export function isInQuickAccess(type: QuickAccessItemType, itemId: string): boolean {
  return getQuickAccessItems().some((i) => i.type === type && i.id === itemId)
}

export function isQuickAccessExpanded(): boolean {
  try {
    const raw = localStorage.getItem(EXPANDED_KEY)
    if (raw === null) return true // default expanded
    return JSON.parse(raw)
  } catch {
    return true
  }
}

export function setQuickAccessExpanded(expanded: boolean): void {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded))
}
