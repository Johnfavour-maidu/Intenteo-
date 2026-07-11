"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus, X, ChevronDown, ChevronRight, Edit3, Trash2,
  GripVertical, Pin, PinOff, Archive, ArchiveRestore,
  Star, Target, BookOpen, Image, Quote, Video,
  StickyNote, Music, ExternalLink, Sparkles, LayoutGrid, List,
  Heart, Shield, Clock, Calendar, Info,
  CheckCircle2,
} from "lucide-react"
import {
  loadPurpose, savePurpose,
  loadCoreValues, addCoreValue, updateCoreValue, deleteCoreValue, reorderCoreValues,
  loadCommitments, addCommitment, updateCommitment, deleteCommitment,
  loadVisions, addVision, updateVision, deleteVision,
  loadRoadmapMilestones, addRoadmapMilestone, updateRoadmapMilestone, deleteRoadmapMilestone,
  seedDemoDataIfEmpty,
  VISION_CATEGORIES,
  type Purpose, type CoreValue, type Commitment, type Vision, type VisionBoardItem,
  type RoadmapMilestone, type RoadmapTimeHorizon, type MilestoneStatus,
} from "@/lib/vision-framework"

const REVIEW_KEY = "intenteo-vision-reviews"
const FREQ_KEY = "intenteo-review-frequency"
const PROMPTS = [
  "Does your purpose still reflect who you are becoming?",
  "Are your daily actions supporting your long-term vision?",
  "Have your values changed over the last few months?",
  "What part of your vision needs more attention?",
  "Are your commitments aligned with your current season of life?",
  "What would you tell your younger self about purpose?",
  "Which value have you practised most this month?",
  "Is your vision board still inspiring you?",
]

interface VisionReview { id: string; date: string; reflection: string; prompt: string }

function loadReviews(): VisionReview[] {
  try { const r = localStorage.getItem(REVIEW_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
}
function saveReviews(reviews: VisionReview[]) { localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews)) }
function getNextReview(frequency: string, last?: string): Date {
  const base = last ? new Date(last) : new Date()
  const n = new Date(base)
  switch (frequency) {
    case "weekly": n.setDate(n.getDate() + 7); break
    case "monthly": n.setMonth(n.getMonth() + 1); break
    case "quarterly": n.setMonth(n.getMonth() + 3); break
    case "6-months": n.setMonth(n.getMonth() + 6); break
    case "yearly": n.setFullYear(n.getFullYear() + 1); break
    default: n.setMonth(n.getMonth() + 1)
  }
  return n
}
function daysBetween(a: Date, b: Date) { return Math.ceil((b.getTime() - a.getTime()) / 86400000) }
function fmtDate(d: Date) { return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) }
function fmtShort(d: Date) { return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) }

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-[#1E0E6B] text-white text-[10px] font-bold">{count}</span>
}

function InfoTooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open) }} className="p-1 rounded-full hover:bg-muted transition-colors">
        <Info className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            {children}
            <div className="flex justify-end pt-2"><Button size="sm" variant="outline" onClick={() => setOpen(false)}>Got it</Button></div>
          </div>
        </div>
      )}
    </span>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, count, expanded, onToggle, onAdd, info }: {
  icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string; count?: number
  expanded: boolean; onToggle: () => void; onAdd?: () => void; info?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={onToggle} className="flex items-center gap-3 group">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{title}</h2>
            {count !== undefined && <CountBadge count={count} />}
            {info && <InfoTooltip>{info}</InfoTooltip>}
          </div>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 transition-transform duration-150" /> : <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 transition-transform duration-150" />}
      </button>
      {onAdd && <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</Button>}
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ComponentType<{ className?: string }>; title: string; desc: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4"><Icon className="h-8 w-8 text-muted-foreground/50" /></div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">{desc}</p>
      {action}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// INFO POPUPS
// ══════════════════════════════════════════════════════════════

const InfoPurpose = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Purpose</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">Purpose is your reason for living. It answers: <strong>&ldquo;Why do I exist?&rdquo;</strong> Unlike goals, purpose rarely changes.</p>
    <div className="p-3 rounded-lg bg-muted/50 italic text-sm">&ldquo;To help people live intentionally through technology, education and faith.&rdquo;</div>
  </div>
)
const InfoCoreValues = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Core Values</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">Core values are the principles that guide your decisions, behaviour, and priorities.</p>
    <div className="flex flex-wrap gap-1.5">{["Integrity", "Compassion", "Excellence", "Faith", "Courage"].map((v) => <span key={v} className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">{v}</span>)}</div>
  </div>
)
const InfoCommitments = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Commitments</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">Commitments are lifelong promises you choose to live by. They transform values into consistent actions.</p>
    <div className="p-3 rounded-lg bg-muted/50 italic text-sm">&ldquo;I commit to serving people with excellence and integrity.&rdquo;</div>
  </div>
)
const InfoVision = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Vision</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">A vision describes the future you want to create. Visions inspire direction rather than completion.</p>
    <div className="p-3 rounded-lg bg-muted/50 italic text-sm">&ldquo;Build a global platform that transforms intentional living.&rdquo;</div>
  </div>
)
const InfoVisionBoard = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Vision Board</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">A vision board collects images, quotes, verses, and notes that represent your aspirations.</p>
  </div>
)
const InfoLongTerm = (
  <div className="space-y-3">
    <h3 className="font-bold text-lg flex items-center gap-2">Long-Term Plans</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">Long-term plans organize your future into meaningful time horizons, breaking your vision into milestones.</p>
    <div className="space-y-1.5">{["This Year: Immediate priorities", "5 Years: Medium-term growth", "10 Years: Significant transformation", "20 Years: Major milestones", "Lifetime: Ultimate legacy"].map((t) => <p key={t} className="text-sm">{t}</p>)}</div>
  </div>
)

// ══════════════════════════════════════════════════════════════
// VISION REVIEW CARD
// ══════════════════════════════════════════════════════════════

function VisionReviewCard({ purpose, onRefresh }: { purpose: Purpose; onRefresh: () => void }) {
  const [frequency, setFrequency] = useState<string>(() => {
    try { return localStorage.getItem(FREQ_KEY) || "monthly" } catch { return "monthly" }
  })
  const [reviews, setReviews] = useState<VisionReview[]>(() => loadReviews())
  const [showHistory, setShowHistory] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [reflection, setReflection] = useState("")
  const [promptIdx, setPromptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length))

  const lastReviewed = reviews.length > 0 ? reviews[reviews.length - 1].date : null
  const nextReview = getNextReview(frequency, lastReviewed || undefined)
  const daysRemaining = daysBetween(new Date(), nextReview)

  const handleSaveFrequency = (val: string) => {
    setFrequency(val)
    localStorage.setItem(FREQ_KEY, val)
  }

  const handleCompleteReview = () => {
    const review: VisionReview = { id: `vr-${Date.now()}`, date: new Date().toISOString(), reflection, prompt: PROMPTS[promptIdx] }
    const updated = [...reviews, review]
    setReviews(updated); saveReviews(updated)
    setReviewing(false); setReflection(""); setPromptIdx((p) => (p + 1) % PROMPTS.length)
    onRefresh()
  }

  return (
    <div className="rounded-2xl border bg-card p-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Calendar className="h-4 w-4 text-primary" /></div>
          <h3 className="text-sm font-bold">Vision Review</h3>
        </div>
        <select value={frequency} onChange={(e) => handleSaveFrequency(e.target.value)} className="px-3 py-1.5 text-xs rounded-lg border bg-background h-8">
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="6-months">Every 6 Months</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-0.5">Next Review</p>
          <p className="font-semibold">{fmtDate(nextReview)}</p>
          <p className="text-[10px] text-muted-foreground">{daysRemaining > 0 ? `${daysRemaining} days remaining` : "Review due now"}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-0.5">Last Reviewed</p>
          <p className="font-semibold">{lastReviewed ? fmtDate(new Date(lastReviewed)) : "Never"}</p>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-muted/30 border border-border/50">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">Reflection Prompt</p>
        <p className="text-sm italic text-foreground/80">{PROMPTS[promptIdx]}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setReviewing(true)} className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Review Now</Button>
        <Button size="sm" variant="outline" onClick={() => setShowHistory(!showHistory)} className="gap-1.5"><Clock className="h-3.5 w-3.5" /> Review History</Button>
      </div>
      {reviewing && (
        <div className="space-y-3 p-4 rounded-xl border bg-muted/20 animate-in fade-in duration-200">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Reflection</p>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Share your thoughts on this prompt..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={4} />
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setReviewing(false); setReflection("") }}>Cancel</Button>
            <Button size="sm" onClick={handleCompleteReview}>Complete Review</Button>
          </div>
        </div>
      )}
      {showHistory && reviews.length > 0 && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Review History</p>
          {reviews.slice().reverse().map((r) => (
            <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{fmtShort(new Date(r.date))}</p>
                {r.reflection && <p className="text-xs text-muted-foreground truncate">{r.reflection}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PURPOSE SECTION (Hero card)
// ══════════════════════════════════════════════════════════════

function PurposeSection({ purpose, onSave }: { purpose: Purpose; onSave: (p: Purpose) => void }) {
  const [editing, setEditing] = useState(false)
  const [statement, setStatement] = useState(purpose.statement)
  const [notes, setNotes] = useState(purpose.notes)
  useEffect(() => { setStatement(purpose.statement); setNotes(purpose.notes) }, [purpose])
  const handleSave = () => { onSave({ statement, notes, updatedAt: new Date().toISOString() }); setEditing(false) }

  const createdDate = purpose.updatedAt ? fmtShort(new Date(purpose.updatedAt)) : "Not set"
  const reviewFrequency = localStorage.getItem(FREQ_KEY) || "monthly"
  const reviews = loadReviews()
  const lastReviewed = reviews.length > 0 ? fmtShort(new Date(reviews[reviews.length - 1].date)) : "Never"
  const nextReview = getNextReview(reviewFrequency, reviews.length > 0 ? reviews[reviews.length - 1].date : undefined)
  const daysRemaining = daysBetween(new Date(), nextReview)

  return (
    <div className="rounded-2xl border border-primary/10 p-10 bg-gradient-to-br from-white via-[#1E0E6B]/[0.03] to-[#EB9E5B]/[0.04] shadow-sm relative overflow-hidden">
      <span className="absolute top-6 left-6 text-[120px] leading-none font-serif text-[#1E0E6B]/[0.04] select-none pointer-events-none">&ldquo;</span>
      <span className="absolute bottom-6 right-6 text-[120px] leading-none font-serif text-[#1E0E6B]/[0.04] select-none pointer-events-none">&rdquo;</span>
      {editing ? (
        <div className="relative z-10 space-y-5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Statement</label>
            <textarea value={statement} onChange={(e) => setStatement(e.target.value)} placeholder="Why do you exist?" className="w-full mt-2 px-4 py-3 text-lg rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[100px]" rows={3} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional thoughts..." className="w-full mt-2 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setStatement(purpose.statement); setNotes(purpose.notes) }}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Purpose</Button>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">&#x1F9ED;</span>
              <span className="text-sm font-bold text-[#1E0E6B] uppercase tracking-wider">Purpose</span>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1 text-xs"><Edit3 className="h-3 w-3" /> Edit</Button>
          </div>
          {purpose.statement ? (
            <p className="text-3xl font-bold leading-relaxed text-foreground mb-6">{purpose.statement}</p>
          ) : (
            <p className="text-muted-foreground italic text-xl mb-6">Define your purpose — the reason you exist.</p>
          )}
          {purpose.notes && <p className="text-sm text-muted-foreground mb-6 whitespace-pre-wrap">{purpose.notes}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border/50">
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Created</p><p className="text-sm font-medium">{createdDate}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Last Reviewed</p><p className="text-sm font-medium">{lastReviewed}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Review Frequency</p><p className="text-sm font-medium capitalize">{reviewFrequency.replace("-", " ")}</p></div>
            <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Next Review</p><p className="text-sm font-medium">{fmtShort(nextReview)}</p></div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Purpose Reminder</p>
            <p className="text-sm text-muted-foreground">Your next review is in <span className="font-semibold text-foreground">{daysRemaining > 0 ? daysRemaining : 0} days</span>. Stay intentional.</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CORE VALUES SECTION
// ══════════════════════════════════════════════════════════════

function CoreValuesSection({ values, onAdd, onUpdate, onDelete, onReorder }: {
  values: CoreValue[]; onAdd: () => void; onUpdate: (id: string, updates: Partial<CoreValue>) => void
  onDelete: (id: string) => void; onReorder: (ids: string[]) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const handleDragStart = (id: string) => setDragId(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); if (!dragId || dragId === targetId) return
    const ids = values.map((v) => v.id); const fi = ids.indexOf(dragId); const ti = ids.indexOf(targetId)
    ids.splice(fi, 1); ids.splice(ti, 0, dragId); onReorder(ids)
  }
  const handleDragEnd = () => setDragId(null)

  return (
    <div className="space-y-4">
      <SectionHeader icon={Heart} title="Core Values" subtitle="What guides your life" count={values.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} info={InfoCoreValues} />
      {expanded && (
        <div className="space-y-3">
          {values.length === 0 ? (
            <EmptyState icon={Heart} title="No values yet" desc="Define the principles that guide your decisions." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Value</Button>} />
          ) : (
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <div key={value.id} draggable onDragStart={() => handleDragStart(value.id)} onDragOver={(e) => handleDragOver(e, value.id)} onDragEnd={handleDragEnd}
                  className={`flex items-center gap-3 p-4 rounded-2xl border bg-card hover:shadow-md hover:scale-[1.01] transition-all duration-150 group cursor-grab active:cursor-grabbing ${dragId === value.id ? "opacity-50" : ""} ${value.pinned ? "border-primary/30 bg-primary/5" : ""}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2"><span className="text-sm font-semibold truncate">{value.name}</span>{value.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}</div>
                    {value.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{value.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => onUpdate(value.id, { pinned: !value.pinned })} className="p-1 rounded hover:bg-muted">{value.pinned ? <PinOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Pin className="h-3.5 w-3.5 text-muted-foreground" />}</button>
                    <button onClick={() => setEditingId(editingId === value.id ? null : value.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => onDelete(value.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {editingId === value.id && <ValueEditInline value={value} onSave={(u) => { onUpdate(value.id, u); setEditingId(null) }} onCancel={() => setEditingId(null)} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ValueEditInline({ value, onSave, onCancel }: { value: CoreValue; onSave: (u: Partial<CoreValue>) => void; onCancel: () => void }) {
  const [name, setName] = useState(value.name)
  const [description, setDescription] = useState(value.description)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold">Edit Value</h3>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Value name" autoFocus /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} /></div>
        <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button><Button size="sm" onClick={() => onSave({ name, description })}>Save</Button></div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMMITMENTS SECTION
// ══════════════════════════════════════════════════════════════

function CommitmentsSection({ commitments, values, visions, onAdd, onUpdate, onDelete }: {
  commitments: Commitment[]; values: CoreValue[]; visions: Vision[]
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Commitment>) => void; onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const filtered = useMemo(() => {
    let items = commitments
    if (filter === "active") items = items.filter((c) => !c.archived)
    if (filter === "archived") items = items.filter((c) => c.archived)
    return items
  }, [commitments, filter])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Shield} title="Commitments" subtitle="Lifelong promises that define you" count={commitments.filter((c) => !c.archived).length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} info={InfoCommitments} />
      {expanded && (
        <div className="space-y-3">
          {commitments.length > 0 && (
            <div className="flex gap-2"><select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "archived")} className="px-3 py-2 text-sm rounded-lg border bg-background h-9"><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select></div>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={Shield} title="No commitments yet" desc="Make lifelong promises that guide your actions." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Commitment</Button>} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((c) => (
                <div key={c.id} className={`p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 group ${c.archived ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-sm font-semibold">{c.title}</span>{c.archived && <Badge variant="secondary" className="text-[9px]">Archived</Badge>}</div>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.relatedValueIds.map((vid) => { const v = values.find((val) => val.id === vid); return v ? <Badge key={vid} variant="secondary" className="text-[9px]">{v.name}</Badge> : null })}
                        {c.relatedVisionIds.map((vid) => { const v = visions.find((vis) => vis.id === vid); return v ? <Badge key={vid} variant="outline" className="text-[9px]">{v.title}</Badge> : null })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingId(editingId === c.id ? null : c.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button onClick={() => onUpdate(c.id, { archived: !c.archived })} className="p-1 rounded hover:bg-muted">{c.archived ? <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" /> : <Archive className="h-3.5 w-3.5 text-muted-foreground" />}</button>
                      <button onClick={() => onDelete(c.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {editingId === c.id && <CommitmentEditInline commitment={c} values={values} visions={visions} onSave={(u) => { onUpdate(c.id, u); setEditingId(null) }} onCancel={() => setEditingId(null)} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CommitmentEditInline({ commitment, values, visions, onSave, onCancel }: {
  commitment: Commitment; values: CoreValue[]; visions: Vision[]
  onSave: (u: Partial<Commitment>) => void; onCancel: () => void
}) {
  const [title, setTitle] = useState(commitment.title)
  const [description, setDescription] = useState(commitment.description)
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(commitment.relatedValueIds)
  const [relatedVisionIds, setRelatedVisionIds] = useState<string[]>(commitment.relatedVisionIds)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold">Edit Commitment</h3>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commitment Statement</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will always..." /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this commitment matters" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} /></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Values</label><div className="flex flex-wrap gap-1 mt-1.5">{values.map((v) => <button key={v.id} onClick={() => setRelatedValueIds((p) => p.includes(v.id) ? p.filter((i) => i !== v.id) : [...p, v.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{v.name}</button>)}</div></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Visions</label><div className="flex flex-wrap gap-1 mt-1.5">{visions.map((v) => <button key={v.id} onClick={() => setRelatedVisionIds((p) => p.includes(v.id) ? p.filter((i) => i !== v.id) : [...p, v.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedVisionIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{v.title}</button>)}</div></div>
        <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button><Button size="sm" onClick={() => onSave({ title, description, relatedValueIds, relatedVisionIds })}>Save</Button></div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// VISIONS SECTION
// ══════════════════════════════════════════════════════════════

function VisionsSection({ visions, values, commitments, goals, onAdd, onUpdate, onDelete, onSelectVision }: {
  visions: Vision[]; values: CoreValue[]; commitments: Commitment[]; goals: Array<{ id: string; title: string; visionId?: string }>
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Vision>) => void; onDelete: (id: string) => void; onSelectVision: (v: Vision) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const filtered = useMemo(() => { let items = visions; if (filter === "active") items = items.filter((v) => !v.archived); if (filter === "archived") items = items.filter((v) => v.archived); return items }, [visions, filter])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Star} title="My Visions" subtitle="The future you are creating" count={visions.filter((v) => !v.archived).length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} info={InfoVision} />
      {expanded && (
        <div className="space-y-3">
          {visions.length > 0 && (
            <div className="flex gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "archived")} className="px-3 py-2 text-sm rounded-lg border bg-background h-9"><option value="all">All</option><option value="active">Active</option><option value="archived">Archived</option></select>
              <div className="flex border rounded-lg overflow-hidden">
                <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}><LayoutGrid className="h-4 w-4" /></button>
                <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={Star} title="No visions yet" desc="Create your first vision to start building your future." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Create Vision</Button>} />
          ) : view === "grid" ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((v) => {
                const cat = VISION_CATEGORIES.find((c) => c.name === v.category) || VISION_CATEGORIES[VISION_CATEGORIES.length - 1]
                const linkedGoals = goals.filter((g) => g.visionId === v.id)
                return (
                  <div key={v.id} className={`rounded-2xl border-t-2 bg-card hover:shadow-lg hover:scale-[1.01] transition-all duration-150 cursor-pointer group min-h-[200px] flex flex-col ${v.archived ? "opacity-60" : ""}`} style={{ borderTopColor: cat.color }} onClick={() => onSelectVision(v)}>
                    {v.coverImage && <div className="h-32 rounded-t-2xl overflow-hidden"><img src={v.coverImage} alt="" className="w-full h-full object-cover" /></div>}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2"><span className="text-2xl">{v.icon || cat.icon}</span><div><h3 className="font-semibold text-sm">{v.title}</h3><Badge variant="secondary" className="text-[9px]" style={{ color: cat.color, backgroundColor: `${cat.color}15` }}>{v.category}</Badge></div></div>
                      </div>
                      {v.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</p>}
                      <div className="flex items-center gap-3 mt-auto pt-3 text-[10px] text-muted-foreground border-t border-border/50">
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {linkedGoals.length} Goals</span>
                        <span className="flex items-center gap-1"><Image className="h-3 w-3" /> {v.boardItems.length} Board</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {v.relatedValueIds.length} Values</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((v) => {
                const cat = VISION_CATEGORIES.find((c) => c.name === v.category) || VISION_CATEGORIES[VISION_CATEGORIES.length - 1]
                return (
                  <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group ${v.archived ? "opacity-60" : ""}`} onClick={() => onSelectVision(v)}>
                    <span className="text-xl">{v.icon || cat.icon}</span>
                    <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-semibold truncate">{v.title}</span><Badge variant="secondary" className="text-[9px]" style={{ color: cat.color }}>{v.category}</Badge></div>{v.description && <p className="text-xs text-muted-foreground truncate">{v.description}</p>}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onUpdate(v.id, { archived: !v.archived }) }} className="p-1 rounded hover:bg-muted">{v.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}</button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(v.id) }} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// VISION EDIT MODAL (centered, single-page, no tabs)
// ══════════════════════════════════════════════════════════════

function VisionEditModal({ vision, values, commitments, goals, onClose, onUpdate }: {
  vision: Vision; values: CoreValue[]; commitments: Commitment[]; goals: Array<{ id: string; title: string; visionId?: string }>
  onClose: () => void; onUpdate: (id: string, updates: Partial<Vision>) => void
}) {
  const [title, setTitle] = useState(vision.title)
  const [description, setDescription] = useState(vision.description)
  const [category, setCategory] = useState(vision.category)
  const [purposeAlignment, setPurposeAlignment] = useState(vision.purposeAlignment)
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(vision.relatedValueIds)
  const [relatedCommitmentIds, setRelatedCommitmentIds] = useState<string[]>(vision.relatedCommitmentIds)
  const [boardItems, setBoardItems] = useState<VisionBoardItem[]>(vision.boardItems)
  const [addBoardType, setAddBoardType] = useState<VisionBoardItem["type"] | null>(null)
  const [newBoardContent, setNewBoardContent] = useState("")
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [newBoardUrl, setNewBoardUrl] = useState("")
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null)
  const linkedGoals = goals.filter((g) => g.visionId === vision.id)
  useEffect(() => { setMilestones(loadRoadmapMilestones(vision.id)) }, [vision.id])
  const handleSave = () => { onUpdate(vision.id, { title, description, category, purposeAlignment, relatedValueIds, relatedCommitmentIds, boardItems }) }
  const handleAddBoardItem = () => {
    if (!addBoardType || !newBoardContent.trim()) return
    setBoardItems([...boardItems, { id: `vbi-${Date.now()}`, type: addBoardType, content: newBoardContent.trim(), title: newBoardTitle.trim(), url: newBoardUrl.trim(), createdAt: new Date().toISOString() }])
    setAddBoardType(null); setNewBoardContent(""); setNewBoardTitle(""); setNewBoardUrl("")
  }
  const handleRemoveBoardItem = (id: string) => { setBoardItems(boardItems.filter((i) => i.id !== id)) }
  const handleAddMilestone = (m: Omit<RoadmapMilestone, "id" | "order" | "createdAt" | "updatedAt">) => { addRoadmapMilestone({ ...m, visionId: vision.id }); setMilestones(loadRoadmapMilestones(vision.id)); setShowMilestoneDialog(false) }
  const handleUpdateMilestone = (id: string, updates: Partial<RoadmapMilestone>) => { updateRoadmapMilestone(id, updates); setMilestones(loadRoadmapMilestones(vision.id)) }
  const handleDeleteMilestone = (id: string) => { deleteRoadmapMilestone(id); setMilestones(loadRoadmapMilestones(vision.id)) }
  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "1-year": "1 Year", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
  const statusColors: Record<MilestoneStatus, string> = { "not-started": "bg-muted text-muted-foreground", "in-progress": "bg-blue-500/10 text-blue-600", "completed": "bg-emerald-500/10 text-emerald-600", "on-hold": "bg-yellow-500/10 text-yellow-600" }
  const statusLabels: Record<MilestoneStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", "completed": "Completed", "on-hold": "On Hold" }
  const typeIcons: Record<string, React.ReactNode> = { image: <Image className="h-4 w-4" />, quote: <Quote className="h-4 w-4" />, "bible-verse": <BookOpen className="h-4 w-4" />, video: <Video className="h-4 w-4" />, link: <ExternalLink className="h-4 w-4" />, note: <StickyNote className="h-4 w-4" />, voice: <Music className="h-4 w-4" /> }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg">Edit Vision</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</h3>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vision title" /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">{VISION_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}</select></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this vision for your future..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} /></div>
            <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Alignment</label><textarea value={purposeAlignment} onChange={(e) => setPurposeAlignment(e.target.value)} placeholder="How does this vision connect to your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} /></div>
          </div>
          <Separator />
          <div className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Values</h3><div className="flex flex-wrap gap-1">{values.map((v) => <button key={v.id} onClick={() => setRelatedValueIds((p) => p.includes(v.id) ? p.filter((i) => i !== v.id) : [...p, v.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{v.name}</button>)}{values.length === 0 && <p className="text-xs text-muted-foreground italic">No values defined yet.</p>}</div></div>
          <div className="space-y-3"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Commitments</h3><div className="flex flex-wrap gap-1">{commitments.filter((c) => !c.archived).map((c) => <button key={c.id} onClick={() => setRelatedCommitmentIds((p) => p.includes(c.id) ? p.filter((i) => i !== c.id) : [...p, c.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedCommitmentIds.includes(c.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{c.title}</button>)}</div></div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vision Board</h3><InfoTooltip>{InfoVisionBoard}</InfoTooltip></div>
            <div className="flex flex-wrap gap-2">{(["image", "quote", "bible-verse", "video", "link", "note"] as const).map((type) => <button key={type} onClick={() => setAddBoardType(addBoardType === type ? null : type)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${addBoardType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{typeIcons[type]} {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</button>)}</div>
            {addBoardType && (
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                {addBoardType !== "note" && <Input value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} placeholder="Title (optional)" className="h-9" />}
                {(addBoardType === "link" || addBoardType === "image" || addBoardType === "video") && <Input value={newBoardUrl} onChange={(e) => setNewBoardUrl(e.target.value)} placeholder="URL" className="h-9" />}
                <textarea value={newBoardContent} onChange={(e) => setNewBoardContent(e.target.value)} placeholder={addBoardType === "quote" ? "The quote..." : addBoardType === "bible-verse" ? "Scripture reference..." : addBoardType === "note" ? "Your note..." : "Description..."} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} />
                <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={() => { setAddBoardType(null); setNewBoardContent(""); setNewBoardTitle(""); setNewBoardUrl("") }}>Cancel</Button><Button size="sm" onClick={handleAddBoardItem}>Add</Button></div>
              </div>
            )}
            {boardItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {boardItems.map((item) => {
                  const typeBg: Record<string, string> = { image: "bg-blue-500/10 text-blue-600", quote: "bg-purple-500/10 text-purple-600", "bible-verse": "bg-amber-500/10 text-amber-600", video: "bg-red-500/10 text-red-600", link: "bg-emerald-500/10 text-emerald-600", note: "bg-gray-500/10 text-gray-600", voice: "bg-pink-500/10 text-pink-600" }
                  return (
                    <div key={item.id} className="rounded-xl border bg-card p-3 space-y-1.5 group relative hover:shadow-sm transition-all duration-150">
                      <button onClick={() => handleRemoveBoardItem(item.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity"><Trash2 className="h-3 w-3" /></button>
                      <div className="flex items-center gap-1.5"><span className={`inline-flex items-center justify-center h-5 w-5 rounded-md ${typeBg[item.type] || "bg-muted text-muted-foreground"}`}>{typeIcons[item.type]}</span><span className="text-[10px] text-muted-foreground uppercase font-semibold">{item.type.replace("-", " ")}</span></div>
                      {item.title && <p className="text-sm font-medium">{item.title}</p>}
                      {(item.type === "quote" || item.type === "bible-verse") && <p className="text-xs italic text-muted-foreground line-clamp-2">&ldquo;{item.content}&rdquo;</p>}
                      {item.type === "note" && <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Roadmap</h3><Button size="sm" variant="outline" onClick={() => setShowMilestoneDialog(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Milestone</Button></div>
            {milestones.length === 0 ? <p className="text-xs text-muted-foreground italic">No milestones yet.</p> : (
              <div className="space-y-3">{(["1-year", "5-years", "10-years", "20-years", "lifetime"] as RoadmapTimeHorizon[]).map((horizon) => {
                const hm = milestones.filter((m) => m.timeHorizon === horizon)
                if (hm.length === 0) return null
                return (
                  <div key={horizon} className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {horizonLabels[horizon]}</h4>
                    {hm.map((m) => (
                      <div key={m.id} className="p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1"><span className="text-sm font-semibold">{m.title}</span><span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span></div>
                            {m.description && <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>}
                            <div className="flex items-center gap-3 mt-2"><span className="text-[10px] text-muted-foreground">Target: {m.targetYear}</span><div className="flex items-center gap-1.5 flex-1 max-w-[200px]"><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} /></div><span className="text-[10px] text-muted-foreground">{m.progress}%</span></div></div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => { setEditingMilestone(m); setShowMilestoneDialog(true) }} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3 w-3" /></button>
                            <button onClick={() => handleDeleteMilestone(m.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}</div>
            )}
          </div>
          <Separator />
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Connections</h3>
            {linkedGoals.length === 0 ? <p className="text-xs text-muted-foreground italic">No goals linked yet.</p> : <div className="space-y-1.5">{linkedGoals.map((g) => <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl border bg-card"><Target className="h-3.5 w-3.5 text-primary shrink-0" /><span className="text-sm font-medium">{g.title}</span></div>)}</div>}
          </div>
        </div>
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-6 py-4 flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Vision</Button>
        </div>
      </div>
      {showMilestoneDialog && <RoadmapMilestoneDialog milestone={editingMilestone} visionId={vision.id} onClose={() => { setShowMilestoneDialog(false); setEditingMilestone(null) }} onSave={handleAddMilestone} onUpdate={handleUpdateMilestone} />}
    </div>
  )
}

function RoadmapMilestoneDialog({ milestone, visionId, onClose, onSave, onUpdate }: {
  milestone: RoadmapMilestone | null; visionId: string; onClose: () => void
  onSave: (m: Omit<RoadmapMilestone, "id" | "order" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<RoadmapMilestone>) => void
}) {
  const [title, setTitle] = useState(milestone?.title || "")
  const [description, setDescription] = useState(milestone?.description || "")
  const [timeHorizon, setTimeHorizon] = useState<RoadmapTimeHorizon>(milestone?.timeHorizon || "1-year")
  const [targetYear, setTargetYear] = useState(milestone?.targetYear || new Date().getFullYear() + 1)
  const [progress, setProgress] = useState(milestone?.progress || 0)
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status || "not-started")
  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "1-year": "1 Year", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
  const handleSave = () => {
    if (!title.trim()) return
    const data = { title: title.trim(), description, timeHorizon, targetYear, progress, status, visionId, relatedGoalIds: milestone?.relatedGoalIds || [] }
    milestone ? onUpdate(milestone.id, data) : onSave(data); onClose()
  }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">{milestone ? "Edit Milestone" : "Add Roadmap Milestone"}</h3>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title" autoFocus />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Horizon</label><select value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value as RoadmapTimeHorizon)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">{Object.entries(horizonLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Year</label><Input type="number" value={targetYear} onChange={(e) => setTargetYear(parseInt(e.target.value) || new Date().getFullYear())} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label><select value={status} onChange={(e) => setStatus(e.target.value as MilestoneStatus)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background"><option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="on-hold">On Hold</option></select></div>
          <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress ({progress}%)</label><input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary mt-2" /></div>
        </div>
        <div className="flex gap-2 justify-end pt-2"><Button size="sm" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" disabled={!title.trim()} onClick={handleSave}>{milestone ? "Save Changes" : "Add Milestone"}</Button></div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LONG-TERM PLANNING SECTION
// ══════════════════════════════════════════════════════════════

function LongTermPlanningSection({ visions }: { visions: Vision[] }) {
  const [expanded, setExpanded] = useState(true)
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])
  useEffect(() => { setMilestones(loadRoadmapMilestones()) }, [])
  const horizonLabels: Record<string, string> = { "1-year": "This Year", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
  const horizonIcons: Record<string, string> = { "1-year": "\u{1F3AF}", "5-years": "\u{1F4C8}", "10-years": "\u{1F5FA}", "20-years": "\u{1F30D}", "lifetime": "\u{2B50}" }
  const statusColors: Record<MilestoneStatus, string> = { "not-started": "bg-muted text-muted-foreground", "in-progress": "bg-blue-500/10 text-blue-600", "completed": "bg-emerald-500/10 text-emerald-600", "on-hold": "bg-yellow-500/10 text-yellow-600" }
  const statusLabels: Record<MilestoneStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", "completed": "Completed", "on-hold": "On Hold" }

  const byHorizon = useMemo(() => {
    const result: Record<string, RoadmapMilestone[]> = { "1-year": [], "5-years": [], "10-years": [], "20-years": [], "lifetime": [] }
    milestones.forEach((m) => { if (result[m.timeHorizon]) result[m.timeHorizon].push(m) })
    return result
  }, [milestones])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Clock} title="Long-Term Planning" subtitle="Your milestones across time horizons" count={milestones.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} info={InfoLongTerm} />
      {expanded && (
        <div className="space-y-6">
          {milestones.length === 0 ? (
            <EmptyState icon={Clock} title="No long-term plans" desc="Add milestones from your vision details to build your roadmap." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(["1-year", "5-years", "10-years", "20-years", "lifetime"] as string[]).map((horizon) => {
                const items = byHorizon[horizon] || []
                if (items.length === 0) return null
                return (
                  <div key={horizon} className="rounded-2xl border bg-card p-5 space-y-3 hover:shadow-md transition-all duration-150">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{horizonIcons[horizon]}</span>
                      <h3 className="font-bold text-sm">{horizonLabels[horizon]}</h3>
                      <CountBadge count={items.length} />
                    </div>
                    <div className="space-y-2">
                      {items.map((m) => {
                        const vision = visions.find((v) => v.id === m.visionId)
                        return (
                          <div key={m.id} className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{m.title}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
                            </div>
                            {vision && <p className="text-[10px] text-muted-foreground">{vision.icon} {vision.title}</p>}
                            <div className="flex items-center gap-2 mt-2"><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} /></div><span className="text-[10px] text-muted-foreground">{m.progress}%</span></div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// GOALS CONNECTED TO VISION
// ══════════════════════════════════════════════════════════════

function GoalsByVisionSection({ visions, goals }: { visions: Vision[]; goals: Array<{ id: string; title: string; visionId?: string; progress?: number }> }) {
  const [expanded, setExpanded] = useState(true)
  const activeVisions = useMemo(() => visions.filter((v) => !v.archived), [visions])
  const grouped = useMemo(() => activeVisions.map((v) => ({ vision: v, goals: goals.filter((g) => g.visionId === v.id) })).filter((g) => g.goals.length > 0), [activeVisions, goals])
  const unlinkedGoals = useMemo(() => goals.filter((g) => !g.visionId), [goals])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Target} title="Goals Connected to Vision" subtitle="Every goal should support a vision" count={goals.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
      {expanded && (
        <div className="space-y-6">
          {grouped.length === 0 && unlinkedGoals.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" desc="Create goals and link them to your visions." />
          ) : (
            <>
              {grouped.map(({ vision, goals: vGoals }) => {
                const cat = VISION_CATEGORIES.find((c) => c.name === vision.category) || VISION_CATEGORIES[VISION_CATEGORIES.length - 1]
                return (
                  <div key={vision.id} className="space-y-2">
                    <div className="flex items-center gap-2"><span className="text-lg">{vision.icon || cat.icon}</span><h3 className="text-sm font-bold">{vision.title}</h3><Badge variant="secondary" className="text-[9px]" style={{ color: cat.color }}>{vGoals.length} goals</Badge></div>
                    <div className="grid gap-2 md:grid-cols-2">{vGoals.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                        <Target className="h-4 w-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{g.title}</p>{g.progress !== undefined && <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${g.progress}%` }} /></div><span className="text-[10px] text-muted-foreground">{g.progress}%</span></div>}</div>
                      </div>
                    ))}</div>
                  </div>
                )
              })}
              {unlinkedGoals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-muted-foreground">Unlinked Goals</h3><CountBadge count={unlinkedGoals.length} /></div>
                  <div className="grid gap-2 md:grid-cols-2">{unlinkedGoals.map((g) => <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 border-dashed"><p className="text-sm text-muted-foreground truncate">{g.title}</p></div>)}</div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CREATE DIALOGS
// ══════════════════════════════════════════════════════════════

function CreateValueDialog({ onClose, onSave }: { onClose: () => void; onSave: (v: Omit<CoreValue, "id" | "order" | "createdAt" | "updatedAt">) => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Add Core Value</h3>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Integrity, Faith, Excellence" autoFocus /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this value mean to you?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} /></div>
        <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), icon: "\u2726", description, importance: "medium", example: "", pinned: false })}>Add Value</Button></div>
      </div>
    </div>
  )
}

function CreateCommitmentDialog({ values, visions, onClose, onSave }: {
  values: CoreValue[]; visions: Vision[]; onClose: () => void; onSave: (c: Omit<Commitment, "id" | "order" | "createdAt" | "updatedAt">) => void
}) {
  const [title, setTitle] = useState("")
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>([])
  const [relatedVisionIds, setRelatedVisionIds] = useState<string[]>([])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Add Commitment</h3>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commitment Statement</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will always..." autoFocus /></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Values</label><div className="flex flex-wrap gap-1 mt-1.5">{values.map((v) => <button key={v.id} onClick={() => setRelatedValueIds((p) => p.includes(v.id) ? p.filter((i) => i !== v.id) : [...p, v.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{v.name}</button>)}</div></div>
        <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Visions</label><div className="flex flex-wrap gap-1 mt-1.5">{visions.filter((v) => !v.archived).map((v) => <button key={v.id} onClick={() => setRelatedVisionIds((p) => p.includes(v.id) ? p.filter((i) => i !== v.id) : [...p, v.id])} className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedVisionIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>{v.title}</button>)}</div></div>
        <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), description: "", relatedValueIds, relatedVisionIds, priority: "medium", archived: false })}>Add Commitment</Button></div>
      </div>
    </div>
  )
}

function CreateVisionDialog({ onClose, onSave }: { onClose: () => void; onSave: (v: Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">) => void }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("Career")
  const cat = VISION_CATEGORIES.find((c) => c.name === category) || VISION_CATEGORIES[0]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Create Vision</h3>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Title</label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vision title" autoFocus /></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">{VISION_CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.icon} {c.name}</option>)}</select></div>
        <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this vision for your future..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} /></div>
        <div className="flex gap-2 justify-end"><Button size="sm" variant="outline" onClick={onClose}>Cancel</Button><Button size="sm" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), description, category, icon: cat.icon, purposeAlignment: "", relatedValueIds: [], relatedCommitmentIds: [], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [], boardItems: [], coverImage: "", archived: false })}>Create Vision</Button></div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export function VisionsPage() {
  const [purpose, setPurpose] = useState<Purpose>(() => loadPurpose())
  const [values, setValues] = useState<CoreValue[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [visions, setVisions] = useState<Vision[]>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string; visionId?: string; progress?: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createType, setCreateType] = useState<"value" | "commitment" | "vision" | null>(null)
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    seedDemoDataIfEmpty()
    setValues(loadCoreValues()); setCommitments(loadCommitments()); setVisions(loadVisions())
    try { const raw = localStorage.getItem("intenteo-goals"); if (raw) setGoals(JSON.parse(raw)) } catch {}
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const handler = () => { setValues(loadCoreValues()); setCommitments(loadCommitments()); setVisions(loadVisions()) }
    window.addEventListener("vision-framework-changed", handler)
    return () => window.removeEventListener("vision-framework-changed", handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowSearch(true) }; if (e.key === "Escape") setShowSearch(false) }
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler)
  }, [])

  const handleSavePurpose = useCallback((p: Purpose) => { savePurpose(p); setPurpose(p) }, [])
  const handleAddValue = useCallback((v: Omit<CoreValue, "id" | "order" | "createdAt" | "updatedAt">) => { addCoreValue(v); setValues(loadCoreValues()); setCreateType(null) }, [])
  const handleUpdateValue = useCallback((id: string, updates: Partial<CoreValue>) => { updateCoreValue(id, updates); setValues(loadCoreValues()) }, [])
  const handleDeleteValue = useCallback((id: string) => { deleteCoreValue(id); setValues(loadCoreValues()) }, [])
  const handleReorderValues = useCallback((ids: string[]) => { reorderCoreValues(ids); setValues(loadCoreValues()) }, [])
  const handleAddCommitment = useCallback((c: Omit<Commitment, "id" | "order" | "createdAt" | "updatedAt">) => { addCommitment(c); setCommitments(loadCommitments()); setCreateType(null) }, [])
  const handleUpdateCommitment = useCallback((id: string, updates: Partial<Commitment>) => { updateCommitment(id, updates); setCommitments(loadCommitments()) }, [])
  const handleDeleteCommitment = useCallback((id: string) => { deleteCommitment(id); setCommitments(loadCommitments()) }, [])
  const handleAddVision = useCallback((v: Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">) => { addVision(v); setVisions(loadVisions()); setCreateType(null) }, [])
  const handleUpdateVision = useCallback((id: string, updates: Partial<Vision>) => { updateVision(id, updates); setVisions(loadVisions()); setSelectedVision((p) => p && p.id === id ? { ...p, ...updates } as Vision : p) }, [])
  const handleDeleteVision = useCallback((id: string) => {
    deleteVision(id); setVisions(loadVisions())
    try { const raw = localStorage.getItem("intenteo-goals"); if (raw) { const g = JSON.parse(raw); const updated = g.map((item: { id: string; visionId?: string }) => item.visionId === id ? { ...item, visionId: undefined } : item); localStorage.setItem("intenteo-goals", JSON.stringify(updated)); setGoals(updated) } } catch {}
  }, [])

  const handleRefresh = useCallback(() => { setPurpose(loadPurpose()); setValues(loadCoreValues()); setCommitments(loadCommitments()); setVisions(loadVisions()) }, [])

  if (isLoading) {
    return (
      <div className="space-y-6"><div className="h-10 w-48 bg-muted animate-pulse rounded-lg" /><div className="h-32 bg-muted animate-pulse rounded-xl" /><div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}</div></div>
    )
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life Vision Framework</h1>
          <p className="text-muted-foreground">Your future begins with clarity.</p>
        </div>
      </div>

      {/* Vision Review Card */}
      <VisionReviewCard purpose={purpose} onRefresh={handleRefresh} />

      {/* 1. Purpose */}
      <PurposeSection purpose={purpose} onSave={handleSavePurpose} />

      {/* 2. Core Values */}
      <CoreValuesSection values={values} onAdd={() => setCreateType("value")} onUpdate={handleUpdateValue} onDelete={handleDeleteValue} onReorder={handleReorderValues} />

      <Separator />

      {/* 3. Commitments */}
      <CommitmentsSection commitments={commitments} values={values} visions={visions} onAdd={() => setCreateType("commitment")} onUpdate={handleUpdateCommitment} onDelete={handleDeleteCommitment} />

      <Separator />

      {/* 4. My Visions */}
      <VisionsSection visions={visions} values={values} commitments={commitments} goals={goals} onAdd={() => setCreateType("vision")} onUpdate={handleUpdateVision} onDelete={handleDeleteVision} onSelectVision={setSelectedVision} />

      <Separator />

      {/* 5. Goals Connected to Vision */}
      <GoalsByVisionSection visions={visions} goals={goals} />

      <Separator />

      {/* 6. Long-Term Planning */}
      <LongTermPlanningSection visions={visions} />

      {/* Vision Edit Modal */}
      {selectedVision && (
        <VisionEditModal vision={visions.find((v) => v.id === selectedVision.id) || selectedVision} values={values} commitments={commitments} goals={goals} onClose={() => setSelectedVision(null)} onUpdate={handleUpdateVision} />
      )}

      {/* Create Dialogs */}
      {createType === "value" && <CreateValueDialog onClose={() => setCreateType(null)} onSave={handleAddValue} />}
      {createType === "commitment" && <CreateCommitmentDialog values={values} visions={visions} onClose={() => setCreateType(null)} onSave={handleAddCommitment} />}
      {createType === "vision" && <CreateVisionDialog onClose={() => setCreateType(null)} onSave={handleAddVision} />}

      {/* Global Search */}
      {showSearch && <GlobalSearch onClose={() => setShowSearch(false)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// ══════════════════════════════════════════════════════════════

function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg mx-4 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 px-4 border-b">
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search visions, values, commitments..." className="border-0 focus-visible:ring-0" autoFocus />
          <button onClick={onClose} className="p-1 rounded hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-4">
          <p className="text-xs text-muted-foreground text-center py-8">Type at least 2 characters to search...</p>
        </div>
      </div>
    </div>
  )
}
