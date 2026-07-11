// Vision Framework — types and localStorage storage

export interface Purpose {
  statement: string
  notes: string
  updatedAt: string
}

export interface CoreValue {
  id: string
  name: string
  icon: string
  description: string
  importance: "high" | "medium" | "low"
  example: string
  pinned: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Commitment {
  id: string
  title: string
  description: string
  relatedValueIds: string[]
  relatedVisionIds: string[]
  priority: "high" | "medium" | "low"
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Vision {
  id: string
  title: string
  description: string
  category: string
  icon: string
  purposeAlignment: string
  relatedValueIds: string[]
  relatedCommitmentIds: string[]
  relatedGoalIds: string[]
  relatedProjectIds: string[]
  relatedHabitIds: string[]
  boardItems: VisionBoardItem[]
  coverImage: string
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface VisionBoardItem {
  id: string
  type: "image" | "quote" | "bible-verse" | "video" | "link" | "note" | "voice"
  content: string
  title: string
  url: string
  createdAt: string
}

export type RoadmapTimeHorizon = "1-year" | "5-years" | "10-years" | "20-years" | "lifetime"
export type MilestoneStatus = "not-started" | "in-progress" | "completed" | "on-hold"

export interface RoadmapMilestone {
  id: string
  visionId: string
  title: string
  description: string
  timeHorizon: RoadmapTimeHorizon
  targetYear: number
  progress: number
  status: MilestoneStatus
  relatedGoalIds: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export const VISION_CATEGORIES = [
  { name: "Career", icon: "\u{1F4BC}", color: "#3B82F6" },
  { name: "Family", icon: "\u{1F3E0}", color: "#EF4444" },
  { name: "Finance", icon: "\u{1F4B0}", color: "#EAB308" },
  { name: "Health", icon: "\u{1F4AA}", color: "#22C55E" },
  { name: "Impact", icon: "\u{1F30D}", color: "#14B8A6" },
  { name: "Faith", icon: "\u{1F64F}", color: "#8B5CF6" },
  { name: "Ministry", icon: "\u271D\uFE0F", color: "#7C3AED" },
  { name: "Relationships", icon: "\u2764\uFE0F", color: "#EC4899" },
  { name: "Learning", icon: "\u{1F4DA}", color: "#F97316" },
  { name: "Personal Growth", icon: "\u2B50", color: "#1E0E6B" },
  { name: "Adventure", icon: "\u26FA", color: "#0EA5E9" },
  { name: "Custom", icon: "\u2728", color: "#6B7280" },
]

// ─── localStorage keys ───
const PURPOSE_KEY = "intenteo-purpose"
const VALUES_KEY = "intenteo-core-values"
const COMMITMENTS_KEY = "intenteo-commitments"
const VISIONS_KEY = "intenteo-visions-framework"

function generateId(): string {
  return crypto.randomUUID?.() || `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── Purpose ───
export function loadPurpose(): Purpose {
  try {
    const raw = localStorage.getItem(PURPOSE_KEY)
    if (!raw) return { statement: "", notes: "", updatedAt: "" }
    return JSON.parse(raw)
  } catch {
    return { statement: "", notes: "", updatedAt: "" }
  }
}

export function savePurpose(purpose: Purpose): void {
  localStorage.setItem(PURPOSE_KEY, JSON.stringify(purpose))
}

// ─── Core Values ───
export function loadCoreValues(): CoreValue[] {
  try {
    const raw = localStorage.getItem(VALUES_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as CoreValue[]
    return items.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function saveCoreValues(values: CoreValue[]): void {
  localStorage.setItem(VALUES_KEY, JSON.stringify(values))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

export function addCoreValue(value: Omit<CoreValue, "id" | "order" | "createdAt" | "updatedAt">): CoreValue {
  const existing = loadCoreValues()
  const newItem: CoreValue = {
    ...value,
    id: generateId(),
    order: existing.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveCoreValues([...existing, newItem])
  return newItem
}

export function updateCoreValue(id: string, updates: Partial<CoreValue>): void {
  const existing = loadCoreValues()
  const updated = existing.map((v) => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v)
  saveCoreValues(updated)
}

export function deleteCoreValue(id: string): void {
  const existing = loadCoreValues()
  saveCoreValues(existing.filter((v) => v.id !== id))
}

export function reorderCoreValues(orderedIds: string[]): void {
  const existing = loadCoreValues()
  const reordered = orderedIds.map((id, idx) => {
    const item = existing.find((v) => v.id === id)
    return item ? { ...item, order: idx } : null
  }).filter(Boolean) as CoreValue[]
  saveCoreValues(reordered)
}

// ─── Commitments ───
export function loadCommitments(): Commitment[] {
  try {
    const raw = localStorage.getItem(COMMITMENTS_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as Commitment[]
    return items.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function saveCommitments(commitments: Commitment[]): void {
  localStorage.setItem(COMMITMENTS_KEY, JSON.stringify(commitments))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

export function addCommitment(commitment: Omit<Commitment, "id" | "order" | "createdAt" | "updatedAt">): Commitment {
  const existing = loadCommitments()
  const newItem: Commitment = {
    ...commitment,
    id: generateId(),
    order: existing.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveCommitments([...existing, newItem])
  return newItem
}

export function updateCommitment(id: string, updates: Partial<Commitment>): void {
  const existing = loadCommitments()
  const updated = existing.map((c) => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)
  saveCommitments(updated)
}

export function deleteCommitment(id: string): void {
  const existing = loadCommitments()
  saveCommitments(existing.filter((c) => c.id !== id))
}

// ─── Visions ───
export function loadVisions(): Vision[] {
  try {
    const raw = localStorage.getItem(VISIONS_KEY)
    if (!raw) {
      // Migration from old key
      const oldRaw = localStorage.getItem("intenteo-visions")
      if (oldRaw) {
        const oldItems = JSON.parse(oldRaw) as Array<{ id: string; title: string; description: string; category: string; icon: string; archived: boolean; boardItems: Array<{ id: string; type: string; content: string; title?: string; url?: string; createdAt: string }>; createdAt?: string; updatedAt?: string }>
        const migrated: Vision[] = oldItems.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          category: v.category,
          icon: v.icon,
          archived: v.archived,
          boardItems: v.boardItems.map((b) => ({ id: b.id, type: b.type as VisionBoardItem["type"], content: b.content, title: b.title || "", url: b.url || "", createdAt: b.createdAt })) as VisionBoardItem[],
          purposeAlignment: "",
          relatedValueIds: [],
          relatedCommitmentIds: [],
          relatedGoalIds: [],
          relatedProjectIds: [],
          relatedHabitIds: [],
          coverImage: "",
          order: 0,
          createdAt: v.createdAt || new Date().toISOString(),
          updatedAt: v.updatedAt || new Date().toISOString(),
        }))
        localStorage.setItem(VISIONS_KEY, JSON.stringify(migrated))
        return migrated.sort((a, b) => a.order - b.order)
      }
      return []
    }
    const items = JSON.parse(raw) as Vision[]
    return items.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function saveVisions(visions: Vision[]): void {
  localStorage.setItem(VISIONS_KEY, JSON.stringify(visions))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

export function addVision(vision: Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">): Vision {
  const existing = loadVisions()
  const newItem: Vision = {
    ...vision,
    id: generateId(),
    order: existing.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveVisions([...existing, newItem])
  return newItem
}

export function updateVision(id: string, updates: Partial<Vision>): void {
  const existing = loadVisions()
  const updated = existing.map((v) => v.id === id ? { ...v, ...updates, updatedAt: new Date().toISOString() } : v)
  saveVisions(updated)
}

export function deleteVision(id: string): void {
  const existing = loadVisions()
  saveVisions(existing.filter((v) => v.id !== id))
}

// ─── Alignment Score ───
export function calculateAlignmentScore(item: {
  purposeAligned?: boolean
  valueIds?: string[]
  commitmentIds?: string[]
  visionIds?: string[]
}): { score: number; purpose: boolean; values: boolean; commitments: boolean; visions: boolean } {
  const purpose = loadPurpose()
  const values = loadCoreValues()
  const commitments = loadCommitments()

  const hasPurpose = purpose.statement.trim().length > 0
  const purposeAligned = hasPurpose && (item.purposeAligned ?? true)
  const valuesAligned = (item.valueIds?.length ?? 0) > 0
  const commitmentsAligned = (item.commitmentIds?.length ?? 0) > 0
  const visionsAligned = (item.visionIds?.length ?? 0) > 0

  const checks = [purposeAligned, valuesAligned, commitmentsAligned, visionsAligned].filter(Boolean).length
  const score = Math.round((checks / 4) * 100)

  return { score, purpose: purposeAligned, values: valuesAligned, commitments: commitmentsAligned, visions: visionsAligned }
}

// ─── Roadmap Milestones ───
const ROADMAP_KEY = "intenteo-roadmap-milestones"

export function loadRoadmapMilestones(visionId?: string): RoadmapMilestone[] {
  try {
    const raw = localStorage.getItem(ROADMAP_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as RoadmapMilestone[]
    const filtered = visionId ? items.filter((m) => m.visionId === visionId) : items
    return filtered.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

function saveRoadmapMilestones(milestones: RoadmapMilestone[]): void {
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(milestones))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

export function addRoadmapMilestone(milestone: Omit<RoadmapMilestone, "id" | "order" | "createdAt" | "updatedAt">): RoadmapMilestone {
  const all = loadRoadmapMilestones()
  const sameVision = all.filter((m) => m.visionId === milestone.visionId)
  const newItem: RoadmapMilestone = {
    ...milestone,
    id: generateId(),
    order: sameVision.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveRoadmapMilestones([...all, newItem])
  return newItem
}

export function updateRoadmapMilestone(id: string, updates: Partial<RoadmapMilestone>): void {
  const all = loadRoadmapMilestones()
  const updated = all.map((m) => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m)
  saveRoadmapMilestones(updated)
}

export function deleteRoadmapMilestone(id: string): void {
  const all = loadRoadmapMilestones()
  saveRoadmapMilestones(all.filter((m) => m.id !== id))
}

export function reorderRoadmapMilestones(visionId: string, orderedIds: string[]): void {
  const all = loadRoadmapMilestones()
  const others = all.filter((m) => m.visionId !== visionId)
  const reordered = orderedIds.map((id, idx) => {
    const item = all.find((m) => m.id === id)
    return item ? { ...item, order: idx } : null
  }).filter(Boolean) as RoadmapMilestone[]
  saveRoadmapMilestones([...others, ...reordered])
}

// ─── Search across all vision entities ───
export interface VisionSearchResult {
  type: "purpose" | "value" | "commitment" | "vision" | "milestone" | "board-item"
  id: string
  title: string
  subtitle: string
  icon: string
  route?: string
}

export function searchVisionEntities(query: string): VisionSearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: VisionSearchResult[] = []

  // Search Purpose
  const purpose = loadPurpose()
  if (purpose.statement.toLowerCase().includes(q) || purpose.notes.toLowerCase().includes(q)) {
    results.push({ type: "purpose", id: "purpose", title: "Purpose", subtitle: purpose.statement.slice(0, 80), icon: "🎯" })
  }

  // Search Core Values
  const values = loadCoreValues()
  values.forEach((v) => {
    if (v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.example.toLowerCase().includes(q)) {
      results.push({ type: "value", id: v.id, title: v.name, subtitle: v.description.slice(0, 80), icon: v.icon })
    }
  })

  // Search Commitments
  const commitments = loadCommitments()
  commitments.forEach((c) => {
    if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
      results.push({ type: "commitment", id: c.id, title: c.title, subtitle: c.description.slice(0, 80), icon: "🤝" })
    }
  })

  // Search Visions
  const visions = loadVisions()
  visions.forEach((v) => {
    if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.category.toLowerCase().includes(q)) {
      results.push({ type: "vision", id: v.id, title: v.title, subtitle: v.description.slice(0, 80), icon: v.icon })
    }
    // Search board items within each vision
    v.boardItems.forEach((b) => {
      if (b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)) {
        results.push({ type: "board-item", id: b.id, title: b.title || "Board Item", subtitle: b.content.slice(0, 80), icon: "📌" })
      }
    })
  })

  // Search Roadmap Milestones
  const milestones = loadRoadmapMilestones()
  milestones.forEach((m) => {
    if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
      const vision = visions.find((v) => v.id === m.visionId)
      results.push({ type: "milestone", id: m.id, title: m.title, subtitle: `${vision?.icon || "🗺️"} ${vision?.title || "Unknown"} — ${m.timeHorizon}`, icon: "🗺️" })
    }
  })

  return results
}
