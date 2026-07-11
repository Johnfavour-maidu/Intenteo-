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

// ─── Demo Data Seeding ───
export function seedDemoDataIfEmpty(): void {
  const hasPurpose = loadPurpose().statement.trim().length > 0
  const hasValues = loadCoreValues().length > 0
  const hasVisions = loadVisions().length > 0
  if (hasPurpose || hasValues || hasVisions) return

  const now = new Date().toISOString()
  const ids = { v1: "demo-val-1", v2: "demo-val-2", v3: "demo-val-3", v4: "demo-val-4", v5: "demo-val-5", v6: "demo-val-6", v7: "demo-val-7", v8: "demo-val-8", v9: "demo-val-9", v10: "demo-val-10" }
  const cIds = { c1: "demo-com-1", c2: "demo-com-2", c3: "demo-com-3", c4: "demo-com-4", c5: "demo-com-5", c6: "demo-com-6", c7: "demo-com-7", c8: "demo-com-8" }
  const visIds = { career: "demo-vis-career", family: "demo-vis-family", finance: "demo-vis-finance", health: "demo-vis-health", faith: "demo-vis-faith", impact: "demo-vis-impact", learning: "demo-vis-learning", adventure: "demo-vis-adventure" }

  savePurpose({ statement: "To help people live intentionally through technology, education and faith while honouring God and creating lasting impact.", notes: "", updatedAt: now })

  const values: CoreValue[] = [
    { id: ids.v1, name: "Faith", icon: "\u{1F64F}", description: "Putting God first in every decision.", importance: "high", example: "Start every project with prayer.", pinned: true, order: 0, createdAt: now, updatedAt: now },
    { id: ids.v2, name: "Integrity", icon: "\u{1F9D1}\u200D\u{1F4BC}", description: "Doing the right thing even when no one is watching.", importance: "high", example: "Be honest in every interaction.", pinned: true, order: 1, createdAt: now, updatedAt: now },
    { id: ids.v3, name: "Growth", icon: "\u{1F331}", description: "Commit to continuous learning and self-improvement.", importance: "high", example: "Read every day. Learn new skills.", pinned: false, order: 2, createdAt: now, updatedAt: now },
    { id: ids.v4, name: "Family", icon: "\u{1F3E0}", description: "Build a loving and God-centred home.", importance: "high", example: "Prioritise family time daily.", pinned: true, order: 3, createdAt: now, updatedAt: now },
    { id: ids.v5, name: "Innovation", icon: "\u{1F4A1}", description: "Create technology that improves lives.", importance: "medium", example: "Build products that solve real problems.", pinned: false, order: 4, createdAt: now, updatedAt: now },
    { id: ids.v6, name: "Health", icon: "\u{1F4AA}", description: "Take care of mind, body and spirit.", importance: "high", example: "Exercise regularly and rest well.", pinned: false, order: 5, createdAt: now, updatedAt: now },
    { id: ids.v7, name: "Excellence", icon: "\u2B50", description: "Always pursue quality.", importance: "medium", example: "Do your best in everything.", pinned: false, order: 6, createdAt: now, updatedAt: now },
    { id: ids.v8, name: "Service", icon: "\u{1F91D}", description: "Use my gifts to help others.", importance: "medium", example: "Mentor and volunteer regularly.", pinned: false, order: 7, createdAt: now, updatedAt: now },
    { id: ids.v9, name: "Learning", icon: "\u{1F4DA}", description: "Never stop growing.", importance: "medium", example: "Read a book every month.", pinned: false, order: 8, createdAt: now, updatedAt: now },
    { id: ids.v10, name: "Generosity", icon: "\u{1F4B8}", description: "Give freely and live abundantly.", importance: "medium", example: "Tithe and support those in need.", pinned: false, order: 9, createdAt: now, updatedAt: now },
  ]
  saveCoreValues(values)

  const commitments: Commitment[] = [
    { id: cIds.c1, title: "I will always put God first.", description: "Every decision starts with prayer and alignment to God's will.", relatedValueIds: [ids.v1], relatedVisionIds: [visIds.faith], priority: "high", archived: false, order: 0, createdAt: now, updatedAt: now },
    { id: cIds.c2, title: "I will never stop learning.", description: "Commit to daily growth through reading, courses, and reflection.", relatedValueIds: [ids.v3, ids.v9], relatedVisionIds: [visIds.learning], priority: "high", archived: false, order: 1, createdAt: now, updatedAt: now },
    { id: cIds.c3, title: "I will protect time with my family.", description: "Family comes before work. Guard evenings and weekends.", relatedValueIds: [ids.v4], relatedVisionIds: [visIds.family], priority: "high", archived: false, order: 2, createdAt: now, updatedAt: now },
    { id: cIds.c4, title: "I will manage money wisely.", description: "Budget, save, invest, and give generously.", relatedValueIds: [ids.v10], relatedVisionIds: [visIds.finance], priority: "medium", archived: false, order: 3, createdAt: now, updatedAt: now },
    { id: cIds.c5, title: "I will exercise every week.", description: "Maintain physical health through consistent exercise.", relatedValueIds: [ids.v6], relatedVisionIds: [visIds.health], priority: "medium", archived: false, order: 4, createdAt: now, updatedAt: now },
    { id: cIds.c6, title: "I will create products that improve lives.", description: "Build technology with purpose and positive impact.", relatedValueIds: [ids.v5, ids.v7], relatedVisionIds: [visIds.career], priority: "medium", archived: false, order: 5, createdAt: now, updatedAt: now },
    { id: cIds.c7, title: "I will live intentionally.", description: "Be present, deliberate, and purposeful in all actions.", relatedValueIds: [ids.v2], relatedVisionIds: [visIds.impact], priority: "high", archived: false, order: 6, createdAt: now, updatedAt: now },
    { id: cIds.c8, title: "I will remain honest in every circumstance.", description: "Truthfulness is non-negotiable, regardless of consequences.", relatedValueIds: [ids.v2, ids.v1], relatedVisionIds: [], priority: "high", archived: false, order: 7, createdAt: now, updatedAt: now },
  ]
  saveCommitments(commitments)

  const visions: Vision[] = [
    {
      id: visIds.career, title: "Career", description: "Build a technology company improving intentional living worldwide.", category: "Career", icon: "\u{1F4BC}",
      purposeAlignment: "This vision directly serves my purpose of helping people live intentionally through technology.",
      relatedValueIds: [ids.v5, ids.v7, ids.v2], relatedCommitmentIds: [cIds.c6], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-c1", type: "image", content: "Modern office space for focused work", title: "Office inspiration", url: "", createdAt: now },
        { id: "bi-c2", type: "video", content: "Simon Sinek - Start With Why", title: "TED Talk", url: "", createdAt: now },
        { id: "bi-c3", type: "note", content: "Build technology that makes intentional living accessible to everyone.", title: "Mission Statement", url: "", createdAt: now },
        { id: "bi-c4", type: "quote", content: "The people who are crazy enough to think they can change the world are the ones who do.", title: "Steve Jobs", url: "", createdAt: now },
        { id: "bi-c5", type: "bible-verse", content: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", title: "Jeremiah 29:11", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 0, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.family, title: "Family", description: "Build a peaceful and joyful family rooted in faith.", category: "Family", icon: "\u{1F3E0}",
      purposeAlignment: "Family is the foundation of lasting impact and legacy.",
      relatedValueIds: [ids.v4, ids.v1], relatedCommitmentIds: [cIds.c3], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-f1", type: "bible-verse", content: "As for me and my household, we will serve the Lord.", title: "Joshua 24:15", url: "", createdAt: now },
        { id: "bi-f2", type: "note", content: "Create a home filled with love, laughter, prayer, and mutual respect.", title: "Family Values", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 1, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.finance, title: "Finance", description: "Achieve financial freedom and build generational wealth.", category: "Finance", icon: "\u{1F4B0}",
      purposeAlignment: "Financial freedom enables me to fund my purpose and bless others.",
      relatedValueIds: [ids.v10], relatedCommitmentIds: [cIds.c4], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-fi1", type: "link", content: "Read about index fund investing strategies", title: "Investment Article", url: "", createdAt: now },
        { id: "bi-fi2", type: "note", content: "50/30/20 rule: Needs/Wants/Savings. Automate savings on payday.", title: "Saving Strategy", url: "", createdAt: now },
        { id: "bi-fi3", type: "quote", content: "Wealth is not about having a lot of money; it's about having a lot of options.", title: "Wealth Quote", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 2, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.health, title: "Health", description: "Maintain excellent physical, mental and spiritual health.", category: "Health", icon: "\u{1F4AA}",
      purposeAlignment: "Health is the foundation for fulfilling my purpose.",
      relatedValueIds: [ids.v6], relatedCommitmentIds: [cIds.c5], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-h1", type: "image", content: "Morning workout routine", title: "Fitness Inspiration", url: "", createdAt: now },
        { id: "bi-h2", type: "link", content: "Mediterranean diet guide for energy and focus", title: "Nutrition Article", url: "", createdAt: now },
        { id: "bi-h3", type: "note", content: "Run 3x/week, strength train 2x/week, rest on Sundays.", title: "Workout Routine", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 3, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.faith, title: "Faith", description: "Grow daily in my relationship with God.", category: "Faith", icon: "\u{1F64F}",
      purposeAlignment: "Faith is the anchor of my purpose and the source of my strength.",
      relatedValueIds: [ids.v1], relatedCommitmentIds: [cIds.c1], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-fa1", type: "bible-verse", content: "Trust in the Lord with all your heart and lean not on your own understanding.", title: "Proverbs 3:5", url: "", createdAt: now },
        { id: "bi-fa2", type: "bible-verse", content: "I can do all things through Christ who strengthens me.", title: "Philippians 4:13", url: "", createdAt: now },
        { id: "bi-fa3", type: "note", content: "Daily devotion: Read scripture, pray, journal reflections.", title: "Prayer Reminders", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 4, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.impact, title: "Impact", description: "Mentor thousands of people through technology and education.", category: "Impact", icon: "\u{1F30D}",
      purposeAlignment: "Impact multiplies purpose — helping others live intentionally creates a ripple effect.",
      relatedValueIds: [ids.v8, ids.v5], relatedCommitmentIds: [cIds.c7], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-i1", type: "quote", content: "The best way to find yourself is to lose yourself in the service of others.", title: "Mahatma Gandhi", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 5, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.learning, title: "Learning", description: "Become a lifelong learner.", category: "Learning", icon: "\u{1F4DA}",
      purposeAlignment: "Continuous learning keeps me relevant and effective.",
      relatedValueIds: [ids.v3, ids.v9], relatedCommitmentIds: [cIds.c2], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-l1", type: "quote", content: "Live as if you were to die tomorrow. Learn as if you were to live forever.", title: "Mahatma Gandhi", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 6, createdAt: now, updatedAt: now,
    },
    {
      id: visIds.adventure, title: "Adventure", description: "Travel the world and experience different cultures.", category: "Adventure", icon: "\u26FA",
      purposeAlignment: "Adventure broadens perspective and deepens gratitude.",
      relatedValueIds: [], relatedCommitmentIds: [], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-a1", type: "note", content: "Visit 10 countries before 2030. Learn a new language.", title: "Travel Goals", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 7, createdAt: now, updatedAt: now,
    },
  ]
  saveVisions(visions)

  const milestones: RoadmapMilestone[] = [
    { id: "rm-c1", visionId: visIds.career, title: "Launch Intenteo publicly", description: "Ship the MVP and get first 1,000 users.", timeHorizon: "1-year", targetYear: 2027, progress: 35, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-c2", visionId: visIds.career, title: "Become Africa's leading intentional living platform", description: "Scale to 100,000 active users across Africa.", timeHorizon: "5-years", targetYear: 2031, progress: 10, status: "not-started", relatedGoalIds: [], order: 1, createdAt: now, updatedAt: now },
    { id: "rm-c3", visionId: visIds.career, title: "Expand globally", description: "Launch in 10+ countries with localised content.", timeHorizon: "10-years", targetYear: 2036, progress: 0, status: "not-started", relatedGoalIds: [], order: 2, createdAt: now, updatedAt: now },
    { id: "rm-c4", visionId: visIds.career, title: "Influence millions of lives", description: "Become a household name for intentional living.", timeHorizon: "20-years", targetYear: 2046, progress: 0, status: "not-started", relatedGoalIds: [], order: 3, createdAt: now, updatedAt: now },
    { id: "rm-c5", visionId: visIds.career, title: "Leave a legacy", description: "Impact millions through technology, books and education.", timeHorizon: "lifetime", targetYear: 2070, progress: 0, status: "not-started", relatedGoalIds: [], order: 4, createdAt: now, updatedAt: now },
    { id: "rm-f1", visionId: visIds.finance, title: "Build emergency fund", description: "Save 6 months of expenses.", timeHorizon: "1-year", targetYear: 2027, progress: 40, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-f2", visionId: visIds.finance, title: "Save \u20A610 million", description: "Build substantial savings through disciplined budgeting.", timeHorizon: "5-years", targetYear: 2031, progress: 15, status: "in-progress", relatedGoalIds: [], order: 1, createdAt: now, updatedAt: now },
    { id: "rm-f3", visionId: visIds.finance, title: "Achieve financial independence", description: "Passive income covers all expenses.", timeHorizon: "10-years", targetYear: 2036, progress: 5, status: "not-started", relatedGoalIds: [], order: 2, createdAt: now, updatedAt: now },
    { id: "rm-h1", visionId: visIds.health, title: "Run a half marathon", description: "Complete a 21km race.", timeHorizon: "1-year", targetYear: 2027, progress: 30, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-h2", visionId: visIds.health, title: "Reach ideal weight", description: "Lose 8kg and maintain healthy BMI.", timeHorizon: "1-year", targetYear: 2027, progress: 25, status: "in-progress", relatedGoalIds: [], order: 1, createdAt: now, updatedAt: now },
    { id: "rm-fa1", visionId: visIds.faith, title: "Daily devotion habit", description: "Read Bible and pray every morning consistently.", timeHorizon: "1-year", targetYear: 2027, progress: 55, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-fa2", visionId: visIds.faith, title: "Complete Bible reading", description: "Read through the entire Bible in one year.", timeHorizon: "1-year", targetYear: 2027, progress: 45, status: "in-progress", relatedGoalIds: [], order: 1, createdAt: now, updatedAt: now },
    { id: "rm-fam1", visionId: visIds.family, title: "Weekly family evening", description: "Dedicate every Friday to family activities.", timeHorizon: "1-year", targetYear: 2027, progress: 60, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-i1", visionId: visIds.impact, title: "Mentor 100 people", description: "Guide 100 individuals through intentional living.", timeHorizon: "5-years", targetYear: 2031, progress: 12, status: "in-progress", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
  ]
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(milestones))
  window.dispatchEvent(new Event("vision-framework-changed"))
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
