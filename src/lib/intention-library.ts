export type IntentionCategory =
  | "presence"
  | "discipline"
  | "faith"
  | "relationships"
  | "health"
  | "gratitude"
  | "leadership"
  | "learning"

export interface Intention {
  id: string
  text: string
  category: IntentionCategory
  keywords: string[]
  supportsGoal?: string
  supportsVision?: string
  supportsPurpose?: boolean
}

export interface StoredIntention {
  id: string
  text: string
  isCustom: boolean
  selectedAt: string
  favorited?: boolean
}

export interface DailyIntention {
  date: string
  intention: StoredIntention
  isCustom: boolean
}

export const CATEGORY_META: Record<IntentionCategory, { label: string; icon: string; color: string; description: string }> = {
  presence: { label: "Presence", icon: "🧘", color: "#7C3AED", description: "Be here now" },
  discipline: { label: "Discipline", icon: "🔥", color: "#DC2626", description: "Stay consistent" },
  faith: { label: "Faith", icon: "✝️", color: "#2563EB", description: "Trust and obey" },
  relationships: { label: "Relationships", icon: "💛", color: "#EA580C", description: "Love others" },
  health: { label: "Health", icon: "💚", color: "#16A34A", description: "Care for yourself" },
  gratitude: { label: "Gratitude", icon: "🙏", color: "#CA8A04", description: "Appreciate what you have" },
  leadership: { label: "Leadership", icon: "👑", color: "#1E0E6B", description: "Lead by example" },
  learning: { label: "Learning", icon: "📖", color: "#0891B2", description: "Stay curious" },
}

export const INTENTION_LIBRARY: Intention[] = [
  // ── Presence (13) ──
  { id: "p1", text: "Today I will stay present.", category: "presence", keywords: ["present", "mindful", "now", "awareness"] },
  { id: "p2", text: "Today I will slow down.", category: "presence", keywords: ["slow", "pace", "calm", "patience"] },
  { id: "p3", text: "Today I will listen deeply.", category: "presence", keywords: ["listen", "hearing", "attention", "understand"] },
  { id: "p4", text: "Today I will notice the little things.", category: "presence", keywords: ["notice", "small", "appreciate", "observe"] },
  { id: "p5", text: "Today I will be fully here.", category: "presence", keywords: ["here", "focus", "present", "engaged"] },
  { id: "p6", text: "Today I will embrace this moment.", category: "presence", keywords: ["embrace", "moment", "accept", "now"] },
  { id: "p7", text: "Today I will breathe before reacting.", category: "presence", keywords: ["breathe", "react", "pause", "calm"] },
  { id: "p8", text: "Today I will let go of yesterday.", category: "presence", keywords: ["let go", "past", "forward", "fresh"] },
  { id: "p9", text: "Today I will not rush.", category: "presence", keywords: ["rush", "slow", "patience", "calm"] },
  { id: "p10", text: "Today I will sit with silence.", category: "presence", keywords: ["silence", "quiet", "peace", "stillness"] },
  { id: "p11", text: "Today I will enjoy the journey.", category: "presence", keywords: ["journey", "process", "enjoy", "present"] },
  { id: "p12", text: "Today I will give my full attention.", category: "presence", keywords: ["attention", "focus", "present", "engaged"] },
  { id: "p13", text: "Today I will find peace in the present.", category: "presence", keywords: ["peace", "present", "calm", "accept"] },

  // ── Discipline (13) ──
  { id: "d1", text: "Today I will finish what I start.", category: "discipline", keywords: ["finish", "complete", "commitment", "follow through"] },
  { id: "d2", text: "Today I will avoid procrastination.", category: "discipline", keywords: ["procrastination", "delay", "start", "action"] },
  { id: "d3", text: "Today I will protect my attention.", category: "discipline", keywords: ["attention", "focus", "protect", "distraction"] },
  { id: "d4", text: "Today I will stay consistent.", category: "discipline", keywords: ["consistent", "routine", "habit", "daily"] },
  { id: "d5", text: "Today I will do the hard thing first.", category: "discipline", keywords: ["hard", "priority", "important", "courage"] },
  { id: "d6", text: "Today I will honor my schedule.", category: "discipline", keywords: ["schedule", "plan", "time", "discipline"] },
  { id: "d7", text: "Today I will resist what is easy.", category: "discipline", keywords: ["resist", "easy", "challenge", "growth"] },
  { id: "d8", text: "Today I will be intentional with my time.", category: "discipline", keywords: ["intentional", "time", "purpose", "focus"] },
  { id: "d9", text: "Today I will show up even when I don't feel like it.", category: "discipline", keywords: ["show up", "motivation", "commitment", "discipline"] },
  { id: "d10", text: "Today I will keep my promises to myself.", category: "discipline", keywords: ["promises", "commitment", "integrity", "self"] },
  { id: "d11", text: "Today I will say no to distractions.", category: "discipline", keywords: ["no", "distractions", "focus", "boundary"] },
  { id: "d12", text: "Today I will follow through on my plans.", category: "discipline", keywords: ["follow through", "plans", "action", "commitment"] },
  { id: "d13", text: "Today I will choose progress over perfection.", category: "discipline", keywords: ["progress", "perfection", "growth", "action"] },

  // ── Faith (13) ──
  { id: "f1", text: "Today I will trust God.", category: "faith", keywords: ["trust", "god", "faith", "believe"] },
  { id: "f2", text: "Today I will pray before reacting.", category: "faith", keywords: ["pray", "prayer", "patience", "wisdom"] },
  { id: "f3", text: "Today I will choose obedience.", category: "faith", keywords: ["obedience", "obey", "trust", "submit"] },
  { id: "f4", text: "Today I will serve with love.", category: "faith", keywords: ["serve", "love", "service", "others"] },
  { id: "f5", text: "Today I will seek God's guidance.", category: "faith", keywords: ["guidance", "direction", "god", "wisdom"] },
  { id: "f6", text: "Today I will rest in God's plan.", category: "faith", keywords: ["rest", "plan", "trust", "peace"] },
  { id: "f7", text: "Today I will worship through my work.", category: "faith", keywords: ["worship", "work", "glory", "purpose"] },
  { id: "f8", text: "Today I will walk by faith, not fear.", category: "faith", keywords: ["faith", "fear", "courage", "trust"] },
  { id: "f9", text: "Today I will extend grace to others.", category: "faith", keywords: ["grace", "forgiveness", "mercy", "love"] },
  { id: "f10", text: "Today I will read God's Word.", category: "faith", keywords: ["read", "bible", "word", "scripture"] },
  { id: "f11", text: "Today I will be still and know.", category: "faith", keywords: ["still", "know", "god", "peace"] },
  { id: "f12", text: "Today I will trust the process.", category: "faith", keywords: ["trust", "process", "patience", "growth"] },
  { id: "f13", text: "Today I will surrender my worries.", category: "faith", keywords: ["surrender", "worry", "trust", "peace"] },

  // ── Relationships (13) ──
  { id: "r1", text: "Today I will forgive quickly.", category: "relationships", keywords: ["forgive", "let go", "grace", "peace"] },
  { id: "r2", text: "Today I will encourage someone.", category: "relationships", keywords: ["encourage", "support", "kindness", "lift"] },
  { id: "r3", text: "Today I will be fully present with my family.", category: "relationships", keywords: ["family", "present", "attention", "love"] },
  { id: "r4", text: "Today I will choose kindness.", category: "relationships", keywords: ["kindness", "gentle", "compassion", "love"] },
  { id: "r5", text: "Today I will listen more than I speak.", category: "relationships", keywords: ["listen", "speak", "understand", "patience"] },
  { id: "r6", text: "Today I will assume the best in others.", category: "relationships", keywords: ["assume", "best", "trust", "grace"] },
  { id: "r7", text: "Today I will say what I appreciate about someone.", category: "relationships", keywords: ["appreciate", "affirm", "encourage", "love"] },
  { id: "r8", text: "Today I will be patient with people.", category: "relationships", keywords: ["patient", "patience", "kindness", "understanding"] },
  { id: "r9", text: "Today I will reach out to someone I miss.", category: "relationships", keywords: ["reach out", "connect", "friendship", "care"] },
  { id: "r10", text: "Today I will not hold grudges.", category: "relationships", keywords: ["grudge", "forgive", "let go", "peace"] },
  { id: "r11", text: "Today I will make time for the people who matter.", category: "relationships", keywords: ["time", "people", "priority", "love"] },
  { id: "r12", text: "Today I will speak life into others.", category: "relationships", keywords: ["speak", "life", "encourage", "words"] },
  { id: "r13", text: "Today I will be the friend I want to have.", category: "relationships", keywords: ["friend", "give", "reciprocity", "character"] },

  // ── Health (13) ──
  { id: "h1", text: "Today I will nourish my body.", category: "health", keywords: ["nourish", "food", "eat", "nutrition"] },
  { id: "h2", text: "Today I will move with purpose.", category: "health", keywords: ["move", "exercise", "physical", "energy"] },
  { id: "h3", text: "Today I will rest intentionally.", category: "health", keywords: ["rest", "sleep", "recovery", "balance"] },
  { id: "h4", text: "Today I will drink more water.", category: "health", keywords: ["water", "hydration", "health", "body"] },
  { id: "h5", text: "Today I will protect my sleep.", category: "health", keywords: ["sleep", "rest", "recovery", "energy"] },
  { id: "h6", text: "Today I will take breaks when I need them.", category: "health", keywords: ["breaks", "rest", "balance", "energy"] },
  { id: "h7", text: "Today I will stretch my body.", category: "health", keywords: ["stretch", "flexibility", "movement", "body"] },
  { id: "h8", text: "Today I will eat with gratitude.", category: "health", keywords: ["eat", "gratitude", "food", "appreciate"] },
  { id: "h9", text: "Today I will prioritize my wellbeing.", category: "health", keywords: ["wellbeing", "health", "priority", "self-care"] },
  { id: "h10", text: "Today I will step outside for fresh air.", category: "health", keywords: ["outside", "fresh air", "nature", "energy"] },
  { id: "h11", text: "Today I will listen to my body.", category: "health", keywords: ["listen", "body", "intuition", "awareness"] },
  { id: "h12", text: "Today I will choose whole foods.", category: "health", keywords: ["food", "whole", "nutrition", "health"] },
  { id: "h13", text: "Today I will honor my limits.", category: "health", keywords: ["limits", "boundaries", "rest", "self-care"] },

  // ── Gratitude (13) ──
  { id: "g1", text: "Today I will appreciate what I have.", category: "gratitude", keywords: ["appreciate", "gratitude", "thankful", "content"] },
  { id: "g2", text: "Today I will celebrate small wins.", category: "gratitude", keywords: ["celebrate", "wins", "progress", "joy"] },
  { id: "g3", text: "Today I will choose contentment.", category: "gratitude", keywords: ["contentment", "enough", "peace", "gratitude"] },
  { id: "g4", text: "Today I will thank someone.", category: "gratitude", keywords: ["thank", "appreciate", "gratitude", "kindness"] },
  { id: "g5", text: "Today I will count my blessings.", category: "gratitude", keywords: ["blessings", "count", "gratitude", "thankful"] },
  { id: "g6", text: "Today I will focus on what is good.", category: "gratitude", keywords: ["good", "positive", "focus", "hope"] },
  { id: "g7", text: "Today I will not take things for granted.", category: "gratitude", keywords: ["granted", "appreciate", "value", "gratitude"] },
  { id: "g8", text: "Today I will find joy in ordinary moments.", category: "gratitude", keywords: ["joy", "ordinary", "moments", "present"] },
  { id: "g9", text: "Today I will write down three things I'm grateful for.", category: "gratitude", keywords: ["write", "grateful", "journal", "reflect"] },
  { id: "g10", text: "Today I will notice beauty around me.", category: "gratitude", keywords: ["beauty", "notice", "observe", "appreciate"] },
  { id: "g11", text: "Today I will be grateful for this day.", category: "gratitude", keywords: ["grateful", "day", "opportunity", "present"] },
  { id: "g12", text: "Today I will appreciate the people in my life.", category: "gratitude", keywords: ["people", "appreciate", "relationship", "love"] },
  { id: "g13", text: "Today I will celebrate how far I've come.", category: "gratitude", keywords: ["celebrate", "progress", "journey", "growth"] },

  // ── Leadership (13) ──
  { id: "l1", text: "Today I will lead by example.", category: "leadership", keywords: ["lead", "example", "integrity", "character"] },
  { id: "l2", text: "Today I will keep my word.", category: "leadership", keywords: ["word", "promise", "integrity", "trust"] },
  { id: "l3", text: "Today I will act with integrity.", category: "leadership", keywords: ["integrity", "honest", "character", "principle"] },
  { id: "l4", text: "Today I will serve first.", category: "leadership", keywords: ["serve", "humility", "others", "service"] },
  { id: "l5", text: "Today I will take responsibility.", category: "leadership", keywords: ["responsibility", "ownership", "accountable", "blame"] },
  { id: "l6", text: "Today I will make decisions with conviction.", category: "leadership", keywords: ["decisions", "conviction", "courage", "confident"] },
  { id: "l7", text: "Today I will empower someone else.", category: "leadership", keywords: ["empower", "support", "develop", "grow"] },
  { id: "l8", text: "Today I will be courageous.", category: "leadership", keywords: ["courage", "brave", "bold", "fear"] },
  { id: "l9", text: "Today I will lead with humility.", category: "leadership", keywords: ["humility", "humble", "serve", "lead"] },
  { id: "l10", text: "Today I will do what is right, not what is easy.", category: "leadership", keywords: ["right", "easy", "moral", "courage"] },
  { id: "l11", text: "Today I will invest in others.", category: "leadership", keywords: ["invest", "others", "develop", "grow"] },
  { id: "l12", text: "Today I will own my mistakes.", category: "leadership", keywords: ["mistakes", "own", "accountable", "growth"] },
  { id: "l13", text: "Today I will set the tone.", category: "leadership", keywords: ["tone", "culture", "lead", "example"] },

  // ── Learning (13) ──
  { id: "n1", text: "Today I will stay curious.", category: "learning", keywords: ["curious", "question", "explore", "discover"] },
  { id: "n2", text: "Today I will learn something new.", category: "learning", keywords: ["learn", "new", "grow", "discover"] },
  { id: "n3", text: "Today I will read today.", category: "learning", keywords: ["read", "book", "knowledge", "growth"] },
  { id: "n4", text: "Today I will ask better questions.", category: "learning", keywords: ["questions", "curious", "understand", "listen"] },
  { id: "n5", text: "Today I will seek to understand before being understood.", category: "learning", keywords: ["understand", "listen", "empathy", "patience"] },
  { id: "n6", text: "Today I will be teachable.", category: "learning", keywords: ["teachable", "humble", "open", "growth"] },
  { id: "n7", text: "Today I will reflect on what I learned yesterday.", category: "learning", keywords: ["reflect", "learn", "yesterday", "growth"] },
  { id: "n8", text: "Today I will challenge my assumptions.", category: "learning", keywords: ["challenge", "assumptions", "think", "growth"] },
  { id: "n9", text: "Today I will apply what I know.", category: "learning", keywords: ["apply", "practice", "knowledge", "action"] },
  { id: "n10", text: "Today I will learn from my mistakes.", category: "learning", keywords: ["mistakes", "learn", "growth", "humility"] },
  { id: "n11", text: "Today I will explore a new perspective.", category: "learning", keywords: ["perspective", "explore", "open", "growth"] },
  { id: "n12", text: "Today I will share what I know.", category: "learning", keywords: ["share", "teach", "give", "knowledge"] },
  { id: "n13", text: "Today I will grow a little more.", category: "learning", keywords: ["grow", "growth", "improve", "progress"] },
]

// ── localStorage keys ──
const STORAGE_KEY_FAVORITES = "intenteo-intention-favorites"
const STORAGE_KEY_RECENT = "intenteo-intention-recent"
const STORAGE_KEY_TODAY = "intenteo-intention-today"
const STORAGE_KEY_DISMISSED = "intenteo-intention-dismissed"

// ── CRUD Helpers ──
export function loadFavorites(): string[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FAVORITES) || "[]") } catch { return [] }
}
export function saveFavorites(ids: string[]) {
  localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(ids))
}
export function toggleFavorite(id: string): string[] {
  const favs = loadFavorites()
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
  saveFavorites(next)
  return next
}

export function loadRecentlyUsed(): StoredIntention[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || "[]") } catch { return [] }
}
export function addRecentlyUsed(text: string, isCustom: boolean) {
  const recent = loadRecentlyUsed().filter(r => r.text !== text)
  recent.unshift({ id: `rec-${Date.now()}`, text, isCustom, selectedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent.slice(0, 30)))
}

export function loadTodayIntention(): DailyIntention | null {
  if (typeof window === "undefined") return null
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY_TODAY) || "null")
    if (data && data.date === new Date().toISOString().split("T")[0]) return data
    return null
  } catch { return null }
}
export function saveTodayIntention(intention: string, isCustom: boolean) {
  const data: DailyIntention = {
    date: new Date().toISOString().split("T")[0],
    intention: { id: `today-${Date.now()}`, text: intention, isCustom, selectedAt: new Date().toISOString() },
    isCustom,
  }
  localStorage.setItem(STORAGE_KEY_TODAY, JSON.stringify(data))
}

export function loadDismissed(): string[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY_DISMISSED) || "[]") } catch { return [] }
}
export function saveDismissed(dates: string[]) {
  localStorage.setItem(STORAGE_KEY_DISMISSED, JSON.stringify(dates))
}

// ── Smart Recommendations ──
function getGoalKeywords(): string[] {
  const keywords: string[] = []
  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    for (const g of goals) {
      const t = (g.title || "").toLowerCase()
      const d = (g.description || "").toLowerCase()
      if (t.includes("family") || d.includes("family")) keywords.push("family")
      if (t.includes("faith") || t.includes("god") || t.includes("church")) keywords.push("faith")
      if (t.includes("work") || t.includes("business") || t.includes("mvp") || t.includes("project")) keywords.push("work")
      if (t.includes("health") || t.includes("exercise") || t.includes("fit")) keywords.push("health")
      if (t.includes("learn") || t.includes("read") || t.includes("course")) keywords.push("learning")
      if (t.includes("lead") || t.includes("team")) keywords.push("leadership")
      if (t.includes("focus") || t.includes("deep") || t.includes("productiv")) keywords.push("focus")
    }
  } catch {}
  return keywords
}

function getHabitKeywords(): string[] {
  const keywords: string[] = []
  try {
    const habits = JSON.parse(localStorage.getItem("intenteo-habits") || "[]")
    const today = new Date().toISOString().split("T")[0]
    for (const h of habits) {
      if (h.archived || h.paused) continue
      const cat = (h.category || "").toLowerCase()
      const name = (h.name || "").toLowerCase()
      if (cat.includes("faith") || name.includes("pray") || name.includes("bible") || name.includes("devotion")) keywords.push("faith")
      if (cat.includes("exercise") || cat.includes("fitness") || name.includes("run") || name.includes("workout")) keywords.push("health")
      if (cat.includes("reading") || name.includes("read")) keywords.push("learning")
      if (cat.includes("meditation") || name.includes("meditat") || name.includes("journal")) keywords.push("presence")
      if (cat.includes("family") || name.includes("family")) keywords.push("family")
      if (h.schedule?.time) {
        const hour = parseInt(h.schedule.time.split(":")[0])
        if (hour < 9) keywords.push("morning-routine")
      }
    }
  } catch {}
  return keywords
}

function getVisionKeywords(): string[] {
  const keywords: string[] = []
  try {
    const visions = JSON.parse(localStorage.getItem("intenteo-visions-framework") || "[]")
    for (const v of visions) {
      if (v.archived) continue
      const t = (v.title || "").toLowerCase()
      const d = (v.description || "").toLowerCase()
      if (t.includes("family") || d.includes("family")) keywords.push("family")
      if (t.includes("faith") || d.includes("faith") || d.includes("god")) keywords.push("faith")
      if (t.includes("lead") || d.includes("lead")) keywords.push("leadership")
      if (t.includes("health") || d.includes("health")) keywords.push("health")
      if (t.includes("learn") || d.includes("learn") || d.includes("grow")) keywords.push("learning")
      if (t.includes("technology") || t.includes("app") || t.includes("mvp")) keywords.push("work")
    }
  } catch {}
  return keywords
}

function getPurposeKeywords(): string[] {
  const keywords: string[] = []
  try {
    const purpose = JSON.parse(localStorage.getItem("intenteo-purpose") || "null")
    if (purpose?.statement) {
      const s = purpose.statement.toLowerCase()
      if (s.includes("family")) keywords.push("family")
      if (s.includes("faith") || s.includes("god")) keywords.push("faith")
      if (s.includes("lead")) keywords.push("leadership")
      if (s.includes("teach") || s.includes("learn")) keywords.push("learning")
      if (s.includes("health")) keywords.push("health")
    }
  } catch {}
  return keywords
}

const KEYWORD_TO_INTENTIONS: Record<string, string[]> = {
  focus: ["d3", "d8", "d11", "p1", "d1"],
  "deep work": ["d3", "d1", "d8", "d5"],
  family: ["r3", "r11", "r12", "h11"],
  faith: ["f1", "f2", "f5", "f6", "f8", "f10"],
  health: ["h1", "h2", "h5", "h9"],
  learning: ["n1", "n2", "n3", "n4"],
  leadership: ["l1", "l2", "l4", "l5"],
  work: ["d1", "d3", "l1", "d8"],
  presence: ["p1", "p3", "p5", "p7"],
  "morning-routine": ["d4", "d9", "p2", "g11"],
  "difficult task": ["d1", "d5", "d9", "l8"],
  meetings: ["p3", "r5", "r6", "l4"],
  stress: ["p7", "p2", "h3", "h6"],
}

export function getRecommendedIntentions(): Intention[] {
  const allKeywords = [
    ...getGoalKeywords(),
    ...getHabitKeywords(),
    ...getVisionKeywords(),
    ...getPurgeKeywords(),
  ]

  const scored = new Map<string, number>()
  for (const kw of allKeywords) {
    const matchingIds = KEYWORD_TO_INTENTIONS[kw] || []
    for (const id of matchingIds) {
      scored.set(id, (scored.get(id) || 0) + 1)
    }
  }

  // If no context, return defaults
  if (scored.size === 0) {
    return INTENTION_LIBRARY.filter(i => ["d1", "p1", "f1", "l1", "r1", "h1", "g1", "n1"].includes(i.id))
  }

  return Array.from(scored.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id]) => INTENTION_LIBRARY.find(i => i.id === id)!)
    .filter(Boolean)
}

// Fix the typo - should be getPurposeKeywords not getPurgeKeywords
function getPurgeKeywords(): string[] { return getPurposeKeywords() }

// ── Shuffle helper ──
export function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ── Search ──
export function searchIntentions(query: string): Intention[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return INTENTION_LIBRARY.filter(i =>
    i.text.toLowerCase().includes(q) ||
    i.keywords.some(k => k.includes(q)) ||
    CATEGORY_META[i.category].label.toLowerCase().includes(q)
  )
}

// ── Link intentions to life framework ──
export function findLinkedGoals(intention: Intention): { id: string; title: string }[] {
  const links: { id: string; title: string }[] = []
  try {
    const goals = JSON.parse(localStorage.getItem("intenteo-goals") || "[]")
    const words = intention.text.toLowerCase().split(" ").filter(w => w.length > 3)
    for (const g of goals) {
      const t = (g.title || "").toLowerCase()
      if (words.some(w => t.includes(w))) links.push({ id: g.id, title: g.title })
    }
  } catch {}
  return links.slice(0, 2)
}

export function findLinkedVisions(intention: Intention): { id: string; title: string }[] {
  const links: { id: string; title: string }[] = []
  try {
    const visions = JSON.parse(localStorage.getItem("intenteo-visions-framework") || "[]")
    const words = intention.text.toLowerCase().split(" ").filter(w => w.length > 3)
    for (const v of visions) {
      if (v.archived) continue
      const t = (v.title || "").toLowerCase()
      if (words.some(w => t.includes(w))) links.push({ id: v.id, title: v.title })
    }
  } catch {}
  return links.slice(0, 2)
}

export function findLinkedPurpose(intention: Intention): string | null {
  try {
    const purpose = JSON.parse(localStorage.getItem("intenteo-purpose") || "null")
    if (!purpose?.statement) return null
    const s = purpose.statement.toLowerCase()
    const words = intention.text.toLowerCase().split(" ").filter(w => w.length > 3)
    if (words.some(w => s.includes(w))) return purpose.statement
  } catch {}
  return null
}

// ── Get date label for recently used ──
export function getDateLabel(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })
}

export function getDayOfWeek(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", { weekday: "long" })
}
