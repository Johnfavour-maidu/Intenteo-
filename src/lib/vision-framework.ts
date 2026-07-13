// Vision Framework — types and localStorage storage
// Life Operating System Architecture

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

export interface Purpose {
  statement: string
  notes: string
  lifeAreaIds: string[]
  reviewFrequency: "weekly" | "monthly" | "quarterly"
  lastReviewedAt?: string
  updatedAt: string
}

export interface PurposeReview {
  id: string
  reflection: string
  question: string
  reviewDate: string
  createdAt: string
}

export interface LifeArea {
  id: string
  name: string
  icon: string
  color: string
  description: string
  pinned: boolean
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface CoreValue {
  id: string
  name: string
  icon: string
  description: string
  purposeConnection: string
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
  relatedLifeAreaIds: string[]
  relatedVisionIds: string[]
  healthStatus: "keeping" | "mostly" | "needs-attention" | "broken"
  pinned: boolean
  archived: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Vision {
  id: string
  title: string
  description: string
  lifeAreaId: string
  icon: string
  purposeAlignment: string
  reviewFrequency: "weekly" | "monthly" | "quarterly"
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

export type RoadmapTimeHorizon = "2-years" | "5-years" | "10-years" | "20-years" | "lifetime"
export type MilestoneStatus = "not-started" | "in-progress" | "completed" | "on-hold"

export interface RoadmapMilestone {
  id: string
  visionId: string
  title: string
  description: string
  timeHorizon: RoadmapTimeHorizon
  targetYear: number
  targetDate: string
  progress: number
  status: MilestoneStatus
  notes: string
  relatedGoalIds: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export const DEFAULT_LIFE_AREAS: Array<{ name: string; icon: string; color: string; description: string }> = [
  { name: "Career", icon: "💼", color: "#3B82F6", description: "Your professional life and career aspirations." },
  { name: "Relationships", icon: "❤️", color: "#EC4899", description: "Friendships, community, and social connections." },
  { name: "Family", icon: "👨‍👩‍👧", color: "#F59E0B", description: "Your family and home life." },
  { name: "Faith", icon: "🙏", color: "#8B5CF6", description: "Spiritual growth and relationship with God." },
  { name: "Finance", icon: "💰", color: "#10B981", description: "Financial health, wealth building, and stewardship." },
  { name: "Health", icon: "💪", color: "#EF4444", description: "Physical, mental, and emotional wellbeing." },
  { name: "Personal Growth", icon: "🧠", color: "#F97316", description: "Learning, development, and self-improvement." },
  { name: "Impact", icon: "🌍", color: "#06B6D4", description: "Service, mentorship, and making a difference." },
  { name: "Education", icon: "📚", color: "#6366F1", description: "Academic pursuits, skills, and knowledge." },
  { name: "Creativity", icon: "🎨", color: "#D946EF", description: "Artistic expression, innovation, and imagination." },
  { name: "Mental Health", icon: "🧘", color: "#14B8A6", description: "Mindfulness, therapy, and emotional resilience." },
  { name: "Fitness", icon: "🏃", color: "#F43F5E", description: "Exercise, training, and physical performance." },
  { name: "Nutrition", icon: "🥗", color: "#22C55E", description: "Healthy eating, diet, and meal planning." },
  { name: "Spirituality", icon: "🕊️", color: "#A855F7", description: "Meditation, prayer, and inner peace." },
  { name: "Community", icon: "🏘️", color: "#0EA5E9", description: "Local involvement, volunteering, and belonging." },
  { name: "Hobbies", icon: "🎯", color: "#EAB308", description: "Leisure activities, passions, and fun." },
  { name: "Travel", icon: "✈️", color: "#2DD4BF", description: "Exploration, adventure, and cultural experiences." },
  { name: "Home", icon: "🏠", color: "#D97706", description: "Home environment, living space, and comfort." },
  { name: "Romance", icon: "💑", color: "#E11D48", description: "Intimate relationships and partnership." },
  { name: "Parenting", icon: "👶", color: "#FB923C", description: "Raising children and family development." },
  { name: "Leadership", icon: "👑", color: "#7C3AED", description: "Guiding others, influence, and authority." },
  { name: "Emotional Intelligence", icon: "🫀", color: "#F472B6", description: "Self-awareness, empathy, and regulation." },
  { name: "Time Management", icon: "⏰", color: "#64748B", description: "Productivity, scheduling, and efficiency." },
  { name: "Social Skills", icon: "🤝", color: "#38BDF8", description: "Communication, networking, and interpersonal skills." },
  { name: "Rest & Recovery", icon: "😴", color: "#818CF8", description: "Sleep, relaxation, and recharging." },
  { name: "Environment", icon: "🌿", color: "#4ADE80", description: "Sustainability, nature, and surroundings." },
  { name: "Legacy", icon: "🏛️", color: "#94A3B8", description: "Long-term impact and what you leave behind." },
  { name: "Adventure", icon: "🏔️", color: "#F59E0B", description: "New experiences, risks, and excitement." },
  { name: "Discipline", icon: "⚡", color: "#FBBF24", description: "Consistency, habits, and self-control." },
  { name: "Joy", icon: "😊", color: "#34D399", description: "Happiness, playfulness, and positive energy." },
]

// ══════════════════════════════════════════════════════════════
// localStorage KEYS
// ══════════════════════════════════════════════════════════════

const PURPOSE_KEY = "intenteo-purpose"
const PURPOSE_REVIEWS_KEY = "intenteo-purpose-reviews"
const LIFE_AREAS_KEY = "intenteo-life-areas"
const VALUES_KEY = "intenteo-core-values"
const COMMITMENTS_KEY = "intenteo-commitments"
const VISIONS_KEY = "intenteo-visions-framework"
const ROADMAP_KEY = "intenteo-roadmap-milestones"

function generateId(): string {
  return crypto.randomUUID?.() || `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ══════════════════════════════════════════════════════════════
// PURPOSE
// ══════════════════════════════════════════════════════════════

export function loadPurpose(): Purpose {
  try {
    const raw = localStorage.getItem(PURPOSE_KEY)
    if (!raw) return { statement: "", notes: "", lifeAreaIds: [], reviewFrequency: "monthly", updatedAt: "" }
    const parsed = JSON.parse(raw)
    if (!parsed.reviewFrequency) parsed.reviewFrequency = "monthly"
    if (!parsed.lifeAreaIds) parsed.lifeAreaIds = []
    return parsed
  } catch {
    return { statement: "", notes: "", lifeAreaIds: [], reviewFrequency: "monthly", updatedAt: "" }
  }
}

export function savePurpose(purpose: Purpose): void {
  localStorage.setItem(PURPOSE_KEY, JSON.stringify(purpose))
}

// ══════════════════════════════════════════════════════════════
// PURPOSE REVIEWS
// ══════════════════════════════════════════════════════════════

export function loadPurposeReviews(): PurposeReview[] {
  try {
    const raw = localStorage.getItem(PURPOSE_REVIEWS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PurposeReview[]
  } catch {
    return []
  }
}

export function addPurposeReview(review: Omit<PurposeReview, "id" | "createdAt">): PurposeReview {
  const existing = loadPurposeReviews()
  const newReview: PurposeReview = {
    ...review,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(PURPOSE_REVIEWS_KEY, JSON.stringify([newReview, ...existing]))
  return newReview
}

export function deletePurposeReview(id: string): void {
  const existing = loadPurposeReviews()
  localStorage.setItem(PURPOSE_REVIEWS_KEY, JSON.stringify(existing.filter((r) => r.id !== id)))
}

// ══════════════════════════════════════════════════════════════
// LIFE AREAS
// ══════════════════════════════════════════════════════════════

export function loadLifeAreas(): LifeArea[] {
  try {
    const raw = localStorage.getItem(LIFE_AREAS_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as LifeArea[]
    return items.sort((a, b) => a.order - b.order)
  } catch {
    return []
  }
}

export function saveLifeAreas(areas: LifeArea[]): void {
  localStorage.setItem(LIFE_AREAS_KEY, JSON.stringify(areas))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

export function addLifeArea(area: Omit<LifeArea, "id" | "order" | "createdAt" | "updatedAt">): LifeArea {
  const existing = loadLifeAreas()
  const newItem: LifeArea = {
    ...area,
    id: generateId(),
    order: existing.length,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  saveLifeAreas([...existing, newItem])
  return newItem
}

export function updateLifeArea(id: string, updates: Partial<LifeArea>): void {
  const existing = loadLifeAreas()
  const updated = existing.map((a) => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)
  saveLifeAreas(updated)
}

export function deleteLifeArea(id: string): void {
  const existing = loadLifeAreas()
  saveLifeAreas(existing.filter((a) => a.id !== id))
}

export function reorderLifeAreas(orderedIds: string[]): void {
  const existing = loadLifeAreas()
  const reordered = orderedIds.map((id, idx) => {
    const item = existing.find((a) => a.id === id)
    return item ? { ...item, order: idx } : null
  }).filter(Boolean) as LifeArea[]
  saveLifeAreas(reordered)
}

// ══════════════════════════════════════════════════════════════
// CORE VALUES
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// COMMITMENTS
// ══════════════════════════════════════════════════════════════

export function loadCommitments(): Commitment[] {
  try {
    const raw = localStorage.getItem(COMMITMENTS_KEY)
    if (!raw) return []
    const items = JSON.parse(raw) as Commitment[]
    return items.map((c) => ({
      ...c,
      relatedValueIds: c.relatedValueIds || [],
      relatedLifeAreaIds: c.relatedLifeAreaIds || [],
      relatedVisionIds: c.relatedVisionIds || [],
      healthStatus: c.healthStatus || "keeping" as const,
    })).sort((a, b) => a.order - b.order)
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

// ══════════════════════════════════════════════════════════════
// VISIONS
// ══════════════════════════════════════════════════════════════

export function loadVisions(): Vision[] {
  try {
    const raw = localStorage.getItem(VISIONS_KEY)
    if (!raw) {
      const oldRaw = localStorage.getItem("intenteo-visions")
      if (oldRaw) {
        const oldItems = JSON.parse(oldRaw) as Array<{ id: string; title: string; description: string; category: string; icon: string; archived: boolean; boardItems: Array<{ id: string; type: string; content: string; title?: string; url?: string; createdAt: string }>; createdAt?: string; updatedAt?: string }>
        const migrated: Vision[] = oldItems.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          lifeAreaId: "",
          category: v.category,
          icon: v.icon,
          archived: v.archived,
          boardItems: v.boardItems.map((b) => ({ id: b.id, type: b.type as VisionBoardItem["type"], content: b.content, title: b.title || "", url: b.url || "", createdAt: b.createdAt })) as VisionBoardItem[],
          purposeAlignment: "",
          reviewFrequency: "monthly" as const,
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
    const migrated = items.map((v) => ({
      ...v,
      lifeAreaId: v.lifeAreaId || "",
      reviewFrequency: v.reviewFrequency || "monthly" as const,
      relatedValueIds: v.relatedValueIds || [],
      relatedCommitmentIds: v.relatedCommitmentIds || [],
      relatedGoalIds: v.relatedGoalIds || [],
      relatedProjectIds: v.relatedProjectIds || [],
      relatedHabitIds: v.relatedHabitIds || [],
      boardItems: v.boardItems || [],
    }))
    return migrated.sort((a, b) => a.order - b.order)
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

// ══════════════════════════════════════════════════════════════
// ALIGNMENT SCORE
// ══════════════════════════════════════════════════════════════

export function calculateAlignmentScore(item: {
  purposeAligned?: boolean
  valueIds?: string[]
  commitmentIds?: string[]
  visionIds?: string[]
}): { score: number; purpose: boolean; values: boolean; commitments: boolean; visions: boolean } {
  const purpose = loadPurpose()
  const hasPurpose = purpose.statement.trim().length > 0
  const purposeAligned = hasPurpose && (item.purposeAligned ?? true)
  const valuesAligned = (item.valueIds?.length ?? 0) > 0
  const commitmentsAligned = (item.commitmentIds?.length ?? 0) > 0
  const visionsAligned = (item.visionIds?.length ?? 0) > 0

  const checks = [purposeAligned, valuesAligned, commitmentsAligned, visionsAligned].filter(Boolean).length
  const score = Math.round((checks / 4) * 100)

  return { score, purpose: purposeAligned, values: valuesAligned, commitments: commitmentsAligned, visions: visionsAligned }
}

// ══════════════════════════════════════════════════════════════
// CONNECTION STRENGTH CALCULATOR
// ══════════════════════════════════════════════════════════════

export function calculateValueConnectionStrength(valueId: string): {
  commitments: number
  visions: number
  goals: number
  stars: number
  label: string
} {
  const commitments = loadCommitments().filter((c) => c.relatedValueIds.includes(valueId))
  const visions = loadVisions().filter((v) => v.relatedValueIds.includes(valueId))
  const goals = (() => {
    try {
      const raw = localStorage.getItem("intenteo-goals")
      if (!raw) return []
      return JSON.parse(raw).filter((g: { linkedValues?: string[] }) => g.linkedValues?.includes(valueId))
    } catch { return [] }
  })()

  const total = commitments.length + visions.length + goals.length
  const stars = total >= 10 ? 5 : total >= 7 ? 4 : total >= 4 ? 3 : total >= 2 ? 2 : 1
  const label = stars >= 4 ? "Core Value" : stars >= 2 ? "Supporting Value" : "Foundational Value"

  return { commitments: commitments.length, visions: visions.length, goals: goals.length, stars, label }
}

// ══════════════════════════════════════════════════════════════
// ROADMAP MILESTONES
// ══════════════════════════════════════════════════════════════

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

// ══════════════════════════════════════════════════════════════
// DEMO DATA SEEDING
// ══════════════════════════════════════════════════════════════

export function seedDemoDataIfEmpty(): void {
  const hasPurpose = loadPurpose().statement.trim().length > 0
  const hasValues = loadCoreValues().length > 0
  const hasVisions = loadVisions().length > 0
  if (hasPurpose || hasValues || hasVisions) return

  const now = new Date().toISOString()

  // Life Areas
  const lifeAreas: LifeArea[] = DEFAULT_LIFE_AREAS.map((a, i) => ({
    ...a,
    id: `la-${i + 1}`,
    pinned: i < 4,
    archived: false,
    order: i,
    createdAt: now,
    updatedAt: now,
  }))
  saveLifeAreas(lifeAreas)

  // Purpose
  savePurpose({
    statement: "To show the way to the younger generation through intentional living, technology, and faith.",
    notes: "Everything I do should point young people toward purposeful, God-honouring lives.",
    lifeAreaIds: ["la-1", "la-4", "la-3", "la-8"],
    reviewFrequency: "monthly",
    updatedAt: now,
  })

  // Core Values
  const values: CoreValue[] = [
    { id: "cv-1", name: "Integrity", icon: "🛡️", description: "Doing the right thing even when no one is watching.", purposeConnection: "Young people should see integrity through my life.", pinned: true, order: 0, createdAt: now, updatedAt: now },
    { id: "cv-2", name: "Excellence", icon: "⭐", description: "Always pursue quality in everything.", purposeConnection: "Excellence honours God and inspires others to raise their standards.", pinned: true, order: 1, createdAt: now, updatedAt: now },
    { id: "cv-3", name: "Compassion", icon: "❤️", description: "Genuine care for others' wellbeing.", purposeConnection: "Compassion opens doors for mentorship and meaningful connection.", pinned: true, order: 2, createdAt: now, updatedAt: now },
    { id: "cv-4", name: "Faith", icon: "🙏", description: "Putting God first in every decision.", purposeConnection: "Faith is the foundation of everything I teach and live.", pinned: true, order: 3, createdAt: now, updatedAt: now },
    { id: "cv-5", name: "Growth", icon: "🌱", description: "Commit to continuous learning and self-improvement.", purposeConnection: "Personal growth ensures I remain relevant and effective.", pinned: false, order: 4, createdAt: now, updatedAt: now },
    { id: "cv-6", name: "Service", icon: "🤝", description: "Use my gifts to help others.", purposeConnection: "Service multiplies impact and creates lasting legacy.", pinned: false, order: 5, createdAt: now, updatedAt: now },
  ]
  saveCoreValues(values)

  // Commitments
  const commitments: Commitment[] = [
    { id: "cm-1", title: "I will mentor one young person every month.", description: "Invest time and wisdom into the next generation.", relatedValueIds: ["cv-1", "cv-3"], relatedLifeAreaIds: ["la-8", "la-1"], relatedVisionIds: ["vs-1"], healthStatus: "keeping", pinned: false, archived: false, order: 0, createdAt: now, updatedAt: now },
    { id: "cm-2", title: "I will live with honesty in every decision.", description: "Truthfulness is non-negotiable.", relatedValueIds: ["cv-1"], relatedLifeAreaIds: ["la-4"], relatedVisionIds: [], healthStatus: "keeping", pinned: false, archived: false, order: 1, createdAt: now, updatedAt: now },
    { id: "cm-3", title: "I will continue learning throughout life.", description: "Read, study, and grow every day.", relatedValueIds: ["cv-5"], relatedLifeAreaIds: ["la-7"], relatedVisionIds: ["vs-1"], healthStatus: "mostly", pinned: false, archived: false, order: 2, createdAt: now, updatedAt: now },
    { id: "cm-4", title: "I will prioritise family time daily.", description: "Family comes before work.", relatedValueIds: ["cv-4"], relatedLifeAreaIds: ["la-3"], relatedVisionIds: ["vs-2"], healthStatus: "keeping", pinned: false, archived: false, order: 3, createdAt: now, updatedAt: now },
    { id: "cm-5", title: "I will exercise every week.", description: "Maintain physical health through consistent exercise.", relatedValueIds: ["cv-2"], relatedLifeAreaIds: ["la-6"], relatedVisionIds: ["vs-3"], healthStatus: "needs-attention", pinned: false, archived: false, order: 4, createdAt: now, updatedAt: now },
  ]
  saveCommitments(commitments)

  // Visions
  const visions: Vision[] = [
    {
      id: "vs-1", title: "Become an internationally recognised speaker and author", description: "Speak at conferences worldwide and publish books that transform lives.",
      lifeAreaId: "la-1", icon: "🎤",
      purposeAlignment: "This vision directly serves my purpose of guiding the younger generation.",
      reviewFrequency: "monthly",
      relatedValueIds: ["cv-1", "cv-2", "cv-3"], relatedCommitmentIds: ["cm-1", "cm-3"], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-1", type: "quote", content: "The best way to find yourself is to lose yourself in the service of others.", title: "Mahatma Gandhi", url: "", createdAt: now },
        { id: "bi-2", type: "bible-verse", content: "Let your light shine before others, that they may see your good deeds and glorify your Father in heaven.", title: "Matthew 5:16", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 0, createdAt: now, updatedAt: now,
    },
    {
      id: "vs-2", title: "Build a peaceful and joyful family rooted in faith", description: "Create a home filled with love, laughter, prayer, and mutual respect.",
      lifeAreaId: "la-3", icon: "🏠",
      purposeAlignment: "Family is the foundation of lasting impact and legacy.",
      reviewFrequency: "monthly",
      relatedValueIds: ["cv-4"], relatedCommitmentIds: ["cm-4"], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [
        { id: "bi-3", type: "bible-verse", content: "As for me and my household, we will serve the Lord.", title: "Joshua 24:15", url: "", createdAt: now },
      ],
      coverImage: "", archived: false, order: 1, createdAt: now, updatedAt: now,
    },
    {
      id: "vs-3", title: "Maintain excellent physical and mental health", description: "Run marathons, eat well, and maintain peak energy.",
      lifeAreaId: "la-6", icon: "💪",
      purposeAlignment: "Health is the foundation for fulfilling my purpose.",
      reviewFrequency: "monthly",
      relatedValueIds: ["cv-2"], relatedCommitmentIds: ["cm-5"], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [],
      coverImage: "", archived: false, order: 2, createdAt: now, updatedAt: now,
    },
    {
      id: "vs-4", title: "Achieve financial freedom and build generational wealth", description: "Invest wisely, save consistently, and give generously.",
      lifeAreaId: "la-5", icon: "💰",
      purposeAlignment: "Financial freedom enables me to fund my purpose and bless others.",
      reviewFrequency: "quarterly",
      relatedValueIds: [], relatedCommitmentIds: [], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [],
      coverImage: "", archived: false, order: 3, createdAt: now, updatedAt: now,
    },
    {
      id: "vs-5", title: "Mentor thousands through technology and education", description: "Build platforms that make intentional living accessible to everyone.",
      lifeAreaId: "la-8", icon: "🌍",
      purposeAlignment: "Impact multiplies purpose — helping others live intentionally creates a ripple effect.",
      reviewFrequency: "quarterly",
      relatedValueIds: ["cv-3", "cv-6"], relatedCommitmentIds: ["cm-1"], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [],
      boardItems: [],
      coverImage: "", archived: false, order: 4, createdAt: now, updatedAt: now,
    },
  ]
  saveVisions(visions)

  // Roadmap Milestones
  const milestones: RoadmapMilestone[] = [
    { id: "rm-1", visionId: "vs-1", title: "Speak at 20 conferences", description: "Complete 20 speaking engagements.", timeHorizon: "2-years", targetYear: 2028, targetDate: "", progress: 15, status: "in-progress", notes: "", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-2", visionId: "vs-1", title: "Publish first book", description: "Write and publish my first bestselling book.", timeHorizon: "5-years", targetYear: 2031, targetDate: "", progress: 5, status: "not-started", notes: "", relatedGoalIds: [], order: 1, createdAt: now, updatedAt: now },
    { id: "rm-3", visionId: "vs-1", title: "Publish five books", description: "Have five published books in circulation.", timeHorizon: "10-years", targetYear: 2036, targetDate: "", progress: 0, status: "not-started", notes: "", relatedGoalIds: [], order: 2, createdAt: now, updatedAt: now },
    { id: "rm-4", visionId: "vs-2", title: "Weekly family devotion night", description: "Establish a consistent family devotion routine.", timeHorizon: "2-years", targetYear: 2028, targetDate: "", progress: 60, status: "in-progress", notes: "", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-5", visionId: "vs-3", title: "Run a full marathon", description: "Complete a 42km marathon.", timeHorizon: "2-years", targetYear: 2028, targetDate: "", progress: 25, status: "in-progress", notes: "", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-6", visionId: "vs-4", title: "Build 6-month emergency fund", description: "Save 6 months of living expenses.", timeHorizon: "2-years", targetYear: 2028, targetDate: "", progress: 40, status: "in-progress", notes: "", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
    { id: "rm-7", visionId: "vs-5", title: "Reach 10,000 users on Intenteo", description: "Scale the platform to 10k active users.", timeHorizon: "5-years", targetYear: 2031, targetDate: "", progress: 10, status: "not-started", notes: "", relatedGoalIds: [], order: 0, createdAt: now, updatedAt: now },
  ]
  localStorage.setItem(ROADMAP_KEY, JSON.stringify(milestones))
  window.dispatchEvent(new Event("vision-framework-changed"))
}

// ══════════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════════

export interface VisionSearchResult {
  type: "purpose" | "value" | "commitment" | "vision" | "milestone" | "board-item" | "life-area"
  id: string
  title: string
  subtitle: string
  icon: string
}

export function searchVisionEntities(query: string): VisionSearchResult[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  const results: VisionSearchResult[] = []

  const purpose = loadPurpose()
  if (purpose.statement.toLowerCase().includes(q) || purpose.notes.toLowerCase().includes(q)) {
    results.push({ type: "purpose", id: "purpose", title: "Purpose", subtitle: purpose.statement.slice(0, 80), icon: "🎯" })
  }

  loadLifeAreas().forEach((a) => {
    if (a.name.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)) {
      results.push({ type: "life-area", id: a.id, title: a.name, subtitle: a.description.slice(0, 80), icon: a.icon })
    }
  })

  loadCoreValues().forEach((v) => {
    if (v.name.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) {
      results.push({ type: "value", id: v.id, title: v.name, subtitle: v.description.slice(0, 80), icon: v.icon })
    }
  })

  loadCommitments().forEach((c) => {
    if (c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
      results.push({ type: "commitment", id: c.id, title: c.title, subtitle: c.description.slice(0, 80), icon: "🤝" })
    }
  })

  const visions = loadVisions()
  visions.forEach((v) => {
    if (v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) {
      results.push({ type: "vision", id: v.id, title: v.title, subtitle: v.description.slice(0, 80), icon: v.icon })
    }
    v.boardItems.forEach((b) => {
      if (b.title.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)) {
        results.push({ type: "board-item", id: b.id, title: b.title || "Board Item", subtitle: b.content.slice(0, 80), icon: "📌" })
      }
    })
  })

  loadRoadmapMilestones().forEach((m) => {
    if (m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)) {
      const vision = visions.find((v) => v.id === m.visionId)
      results.push({ type: "milestone", id: m.id, title: m.title, subtitle: `${vision?.icon || "🗺️"} ${vision?.title || "Unknown"} — ${m.timeHorizon}`, icon: "🗺️" })
    }
  })

  return results
}
