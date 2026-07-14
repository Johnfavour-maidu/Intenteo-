"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus, Search, X, ChevronDown, ChevronRight, Edit3, Trash2,
  GripVertical, Pin, PinOff, Archive, ArchiveRestore,
  Star, Target, BookOpen, CheckSquare,
  Image, Quote, Video,
  ExternalLink, Sparkles, LayoutGrid, List,
  Heart, Shield, Clock, Calendar, Info,
  CheckCircle2, Circle, AlertCircle, Check, AlertTriangle, History, Upload, MapPin,
} from "lucide-react"
import {
  loadPurpose, savePurpose,
  loadPurposeReviews, addPurposeReview, deletePurposeReview,
  loadLifeAreas,
  loadCoreValues, addCoreValue, updateCoreValue, deleteCoreValue, reorderCoreValues,
  loadCommitments, addCommitment, updateCommitment, deleteCommitment,
  loadVisions, addVision, updateVision, deleteVision,
  loadRoadmapMilestones, addRoadmapMilestone, updateRoadmapMilestone, deleteRoadmapMilestone,
  calculateAlignmentScore, calculateValueConnectionStrength, seedDemoDataIfEmpty,
  DEFAULT_LIFE_AREAS, VISION_REVIEW_FREQUENCY_CONFIG, randomReviewQuestion, getNextReviewDate, isReviewDue,
  type Purpose, type PurposeReview, type LifeArea, type CoreValue, type Commitment,
  type Vision, type VisionBoardItem, type RoadmapMilestone, type RoadmapTimeHorizon, type MilestoneStatus,
} from "@/lib/vision-framework"

// ══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ══════════════════════════════════════════════════════════════

function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-[#1E0E6B] text-white text-[10px] font-bold">
      {count}
    </span>
  )
}

function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function RelationshipChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
      {icon} {label}
    </span>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, collapsedInfo, count, expanded, onToggle, onAdd, onInfo, rightControls }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  collapsedInfo?: string
  count?: number
  expanded: boolean
  onToggle: () => void
  onAdd?: () => void
  onInfo?: () => void
  rightControls?: React.ReactNode
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
            {onInfo && (
              <button onClick={(e) => { e.stopPropagation(); onInfo() }} className="p-1 rounded-full hover:bg-muted transition-colors">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          {expanded ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : collapsedInfo ? (
            <p className="text-xs text-muted-foreground">{collapsedInfo}</p>
          ) : (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground ml-2 transition-transform duration-150" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground ml-2 transition-transform duration-150" />
        )}
      </button>
      {expanded && (
        <div className="flex items-center gap-2">
          {rightControls}
          {onAdd && (
            <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs">{desc}</p>
      {action}
    </div>
  )
}

function EducationalModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn duration-150">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
        <div className="flex justify-end pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>Got it</Button>
        </div>
      </div>
    </div>
  )
}

function HealthStatusBadge({ status }: { status: Commitment["healthStatus"] }) {
  const config = {
    keeping: { label: "Keeping Consistently", color: "bg-emerald-500/10 text-emerald-600", icon: CheckCircle2 },
    mostly: { label: "Mostly Keeping", color: "bg-blue-500/10 text-blue-600", icon: CheckCircle2 },
    "needs-attention": { label: "Needs Attention", color: "bg-yellow-500/10 text-yellow-600", icon: AlertCircle },
    broken: { label: "Broken", color: "bg-red-500/10 text-red-600", icon: AlertCircle },
  }
  const c = config[status as keyof typeof config] || config["keeping"]
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.color}`}>
      <Icon className="h-2.5 w-2.5" /> {c.label}
    </span>
  )
}

function PurposeReviewModal({ purpose, onSave, onClose }: { purpose: Purpose; onSave: (p: Purpose) => void; onClose: () => void }) {
  const [reviewFrequency, setReviewFrequency] = useState(purpose.reviewFrequency)
  const [reviews, setReviews] = useState<PurposeReview[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showAddReview, setShowAddReview] = useState(false)
  const [reflection, setReflection] = useState("")
  const [question, setQuestion] = useState("")

  const handleSaveFrequency = () => {
    const updated = { ...purpose, reviewFrequency, updatedAt: new Date().toISOString() }
    savePurpose(updated)
    onSave(updated)
  }

  const handleSaveReview = () => {
    if (!reflection.trim()) return
    const review = addPurposeReview({ reflection: reflection.trim(), question, reviewDate: new Date().toISOString() })
    setReviews((r) => [review, ...r])
    const next = { ...purpose, lastReviewedAt: review.reviewDate, updatedAt: new Date().toISOString() }
    savePurpose(next)
    onSave(next)
    setReflection("")
    setShowAddReview(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#EB9E5B]/10 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-[#EB9E5B]" />
            </div>
            <h3 className="font-bold text-lg">Purpose Review</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review Frequency</label>
          <div className="flex items-center gap-2">
            <select value={reviewFrequency} onChange={(e) => setReviewFrequency(e.target.value as Purpose["reviewFrequency"])} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/30">
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Annually</option>
            </select>
            {reviewFrequency !== purpose.reviewFrequency && (
              <Button size="sm" variant="outline" onClick={handleSaveFrequency}>Save</Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Last Review: {purpose.lastReviewedAt ? formatDateDDMMYYYY(purpose.lastReviewedAt) : "—"}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Next Review: {getNextReviewDate(purpose, reviewFrequency)}</span>
        </div>

        <div className="h-px bg-[#1E0E6B]/10" />

        {!showAddReview ? (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setReflection(""); setQuestion(randomReviewQuestion()); setShowAddReview(true) }}>
            <Plus className="h-3.5 w-3.5" /> Add Review
          </Button>
        ) : (
          <div className="p-3 rounded-xl border border-[#1E0E6B]/15 bg-[#1E0E6B]/5 space-y-2">
            {question && <p className="text-xs font-medium text-[#1E0E6B]">{question}</p>}
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={3}
              placeholder="Reflect on your purpose and any shifts since your last review..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/30 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowAddReview(false)}>Cancel</Button>
              <Button size="sm" disabled={!reflection.trim()} onClick={handleSaveReview}>Save Review</Button>
            </div>
          </div>
        )}

        {reviews.length > 0 && (
          <div>
            <button onClick={() => setShowHistory((s) => !s)} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
              <History className="h-3.5 w-3.5" />
              Review History ({reviews.length})
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showHistory ? "rotate-180" : ""}`} />
            </button>
            {showHistory && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {reviews.map((r) => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-[#1E0E6B]">{formatDateDDMMYYYY(r.reviewDate)}</span>
                      <button type="button" onClick={() => { deletePurposeReview(r.id); setReviews((list) => list.filter((x) => x.id !== r.id)) }} className="text-muted-foreground hover:text-[#EB9E5B] transition-colors" aria-label="Delete review">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    {r.question && <p className="text-[11px] italic text-muted-foreground mt-0.5">{r.question}</p>}
                    <p className="text-xs text-foreground mt-1 whitespace-pre-wrap">{r.reflection}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


// ══════════════════════════════════════════════════════════════
// PURPOSE SECTION (Hero)
// ══════════════════════════════════════════════════════════════

function PurposeSection({ purpose, lifeAreas, onSave, onInfo }: { purpose: Purpose; lifeAreas: LifeArea[]; onSave: (p: Purpose) => void; onInfo?: () => void }) {
  const [editing, setEditing] = useState(false)
  const [statement, setStatement] = useState(purpose.statement)
  const [notes, setNotes] = useState(purpose.notes)
  const [lifeAreaIds, setLifeAreaIds] = useState<string[]>(purpose.lifeAreaIds)
  const [lifeAreaSearch, setLifeAreaSearch] = useState("")
  const [showLifeAreaDropdown, setShowLifeAreaDropdown] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => { setStatement(purpose.statement); setNotes(purpose.notes); setLifeAreaIds(purpose.lifeAreaIds) }, [purpose])
  const handleSave = () => {
    onSave({ statement, notes, lifeAreaIds, reviewFrequency: purpose.reviewFrequency, lastReviewedAt: purpose.lastReviewedAt, updatedAt: new Date().toISOString() })
    setEditing(false)
  }

  const toggleLifeArea = (id: string) => {
    setLifeAreaIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const allLifeAreaOptions = useMemo(() => {
    const existingMap = new Map(lifeAreas.map((a) => [a.id, a]))
    const merged: Array<{ id: string; name: string; icon: string }> = []
    const seen = new Set<string>()
    for (const a of lifeAreas) {
      merged.push({ id: a.id, name: a.name, icon: a.icon })
      seen.add(a.name.toLowerCase())
    }
    for (const def of DEFAULT_LIFE_AREAS) {
      if (!seen.has(def.name.toLowerCase())) {
        merged.push({ id: `default-${def.name}`, name: def.name, icon: def.icon })
        seen.add(def.name.toLowerCase())
      }
    }
    return merged
  }, [lifeAreas])

  const filteredLifeAreas = allLifeAreaOptions.filter((a) =>
    a.name.toLowerCase().includes(lifeAreaSearch.toLowerCase())
  )

  const selectedLifeAreas = allLifeAreaOptions.filter((a) => lifeAreaIds.includes(a.id))

  const lifeAreaDropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showLifeAreaDropdown) return
    const handler = (e: MouseEvent) => {
      if (lifeAreaDropdownRef.current && !lifeAreaDropdownRef.current.contains(e.target as Node)) {
        setShowLifeAreaDropdown(false)
      }
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setShowLifeAreaDropdown(false) }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler) }
  }, [showLifeAreaDropdown])

  return (
    <div className="rounded-2xl border-2 border-[#1E0E6B]/15 p-8 bg-white dark:bg-gray-950 shadow-sm">
      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Statement</label>
            <textarea value={statement} onChange={(e) => setStatement(e.target.value)}
              placeholder="Why do you exist? What is your fundamental WHY?"
              className="w-full mt-1.5 px-4 py-3 text-base rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none min-h-[80px]" rows={3} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional thoughts about your purpose..."
              className="w-full mt-1.5 px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Area</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Which areas of life does your purpose touch?</p>
            <div className="relative" ref={lifeAreaDropdownRef}>
              <div
                tabIndex={0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={showLifeAreaDropdown}
                onClick={() => setShowLifeAreaDropdown((st) => !st)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowLifeAreaDropdown((st) => !st) } }}
                className="flex items-center justify-between gap-2 w-full px-3 py-2.5 text-sm rounded-xl border border-[#1E0E6B]/25 bg-white dark:bg-gray-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              >
                <span className={lifeAreaIds.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                  {lifeAreaIds.length > 0 ? `${lifeAreaIds.length} selected` : "Choose one or more life areas"}
                </span>
                <ChevronDown className={`h-4 w-4 text-[#1E0E6B] transition-transform duration-200 ${showLifeAreaDropdown ? "rotate-180" : ""}`} />
              </div>

              {showLifeAreaDropdown && (
                <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-[#1E0E6B]/20 bg-white dark:bg-gray-950 shadow-xl overflow-hidden animate-fadeIn duration-150">
                  <div className="p-2 border-b border-[#1E0E6B]/10">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        autoFocus
                        value={lifeAreaSearch}
                        onChange={(e) => setLifeAreaSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setShowLifeAreaDropdown(false) } }}
                        placeholder="Search life areas..."
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                      />
                    </div>
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {filteredLifeAreas.length === 0 ? (
                      <p className="px-3 py-3 text-xs text-muted-foreground text-center">No areas found</p>
                    ) : (
                      filteredLifeAreas.map((a) => {
                        const selected = lifeAreaIds.includes(a.id)
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleLifeArea(a.id)}
                            className={`flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${selected ? "bg-[#1E0E6B]/10" : "hover:bg-[#1E0E6B]/5"}`}
                          >
                            <span className="flex items-center gap-2">
                               <span>{a.name}</span>
                             </span>
                            {selected && <Check className="h-4 w-4 text-[#1E0E6B]" />}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedLifeAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {selectedLifeAreas.map((a) => (
                   <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-full bg-[#1E0E6B]/10 text-[#1E0E6B] border border-[#1E0E6B]/15">
                     {a.name}
                    <button type="button" onClick={() => toggleLifeArea(a.id)} className="ml-0.5 hover:text-[#EB9E5B] transition-colors" aria-label={`Remove ${a.name}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setStatement(purpose.statement); setNotes(purpose.notes); setLifeAreaIds(purpose.lifeAreaIds) }}>Cancel</Button>
            <Button size="sm" onClick={handleSave}>Save Purpose</Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#1E0E6B]/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#1E0E6B]" />
              </div>
              <span className="text-sm font-bold text-[#1E0E6B] uppercase tracking-wider">Purpose</span>
              {onInfo && (
                <button onClick={onInfo} className="p-1 rounded-full hover:bg-muted transition-colors">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              {purpose.updatedAt && <span className="text-[10px] text-muted-foreground">Updated {formatDateDDMMYYYY(purpose.updatedAt)}</span>}
            </div>
            <div className="flex items-center gap-0.5">
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1 text-xs">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowReviewModal(true)} className="gap-1 text-xs">
                <BookOpen className="h-3 w-3" /> Review
                {isReviewDue(purpose) && (
                  <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-[#EB9E5B]" />
                )}
              </Button>
            </div>
          </div>
          {purpose.statement ? (
            <div className="flex gap-3 items-start my-2">
              <span className="text-4xl text-[#1E0E6B]/15 font-serif leading-none mt-1">&ldquo;</span>
              <p className="text-lg font-medium leading-relaxed text-foreground">{purpose.statement}</p>
              <span className="text-4xl text-[#1E0E6B]/15 font-serif leading-none mt-1">&rdquo;</span>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-lg">Define your purpose — the reason you exist.</p>
          )}
          {purpose.notes && <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{purpose.notes}</p>}
          {selectedLifeAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {selectedLifeAreas.map((a) => <span key={a.id} className="inline-flex items-center px-2 py-0.5 text-[10px] rounded-full border border-[#1E0E6B]/25 text-[#1E0E6B] font-medium">{a.name}</span>)}
            </div>
          )}

        </div>
      )}
      {showReviewModal && <PurposeReviewModal purpose={purpose} onSave={onSave} onClose={() => setShowReviewModal(false)} />}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CORE VALUES SECTION
// ══════════════════════════════════════════════════════════════

function CoreValuesSection({ values, onAdd, onUpdate, onDelete, onReorder, onInfo }: {
  values: CoreValue[]; onAdd: () => void; onUpdate: (id: string, updates: Partial<CoreValue>) => void
  onDelete: (id: string) => void; onReorder: (ids: string[]) => void; onInfo?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const sorted = useMemo(() => {
    const pinned = values.filter((v) => v.pinned)
    const unpinned = values.filter((v) => !v.pinned)
    return [...pinned, ...unpinned]
  }, [values])

  const handleDragStart = (id: string) => setDragId(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) return
    const ids = values.map((v) => v.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    ids.splice(fromIdx, 1)
    ids.splice(toIdx, 0, dragId)
    onReorder(ids)
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Heart} title="Core Values" subtitle="What principles guide how you live" collapsedInfo={`${values.length} Value${values.length !== 1 ? 's' : ''}`} count={values.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} onInfo={onInfo} />
      {expanded && (
        <div className="space-y-3">
          {values.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Your values shape your decisions.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Start by adding the principles that guide your life.</p>
              <Button size="sm" onClick={onAdd} className="mt-4 gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Your First Value</Button>
            </div>
          ) : (
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {sorted.map((value) => (
                <div key={value.id} draggable onDragStart={() => handleDragStart(value.id)} onDragOver={(e) => handleDragOver(e, value.id)} onDragEnd={() => setDragId(null)}
                  className={`flex items-start gap-3 p-4 rounded-2xl border bg-card hover:shadow-md hover:scale-[1.01] transition-all duration-150 group cursor-grab active:cursor-grabbing ${dragId === value.id ? "opacity-50" : ""} ${value.pinned ? "border-primary/30 bg-primary/5" : ""}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {value.pinned && <Pin className="h-3 w-3 text-primary shrink-0" />}
                      <span className="text-sm font-bold truncate">{value.name}</span>
                    </div>
                    {value.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{value.description}</p>}
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => onUpdate(value.id, { pinned: !value.pinned })} className="p-1 rounded hover:bg-muted transition-colors" title={value.pinned ? "Unpin" : "Pin"}>
                      {value.pinned ? <PinOff className="h-3.5 w-3.5 text-primary" /> : <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                    <button onClick={() => setEditingId(editingId === value.id ? null : value.id)} className="p-1 rounded hover:bg-muted transition-colors"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                    <button onClick={() => onDelete(value.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  {editingId === value.id && (
                    <ValueEditModal value={value} onSave={(updates) => { onUpdate(value.id, updates); setEditingId(null) }} onCancel={() => setEditingId(null)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ValueEditModal({ value, onSave, onCancel }: { value: CoreValue; onSave: (updates: Partial<CoreValue>) => void; onCancel: () => void }) {
  const [name, setName] = useState(value.name)
  const [reflection, setReflection] = useState(value.description)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn duration-150">
        <h3 className="font-semibold">Edit Value</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Value name" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reflection</label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="How does this value shape your life or support your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name, description: reflection, purposeConnection: "" })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMMITMENTS SECTION
// ══════════════════════════════════════════════════════════════

function CommitmentsSection({ commitments, values, lifeAreas, visions, onAdd, onUpdate, onDelete, onInfo }: {
  commitments: Commitment[]; values: CoreValue[]; lifeAreas: LifeArea[]; visions: Vision[]
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Commitment>) => void; onDelete: (id: string) => void; onInfo?: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = commitments
    if (filter === "active") items = items.filter((c) => !c.archived)
    if (filter === "archived") items = items.filter((c) => c.archived)
    return items
  }, [commitments, filter])

  const filterControls = commitments.length > 0 ? (
    <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "archived")} className="px-3 py-1.5 text-xs rounded-lg border bg-background h-8">
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="archived">Archived</option>
    </select>
  ) : null

  return (
    <div className="space-y-4">
      <SectionHeader icon={Shield} title="Commitments" subtitle="Lifelong promises that define you" collapsedInfo={`${commitments.filter((c) => !c.archived).length} Commitment${commitments.filter((c) => !c.archived).length !== 1 ? 's' : ''}`} count={commitments.filter((c) => !c.archived).length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} onInfo={onInfo} rightControls={filterControls} />
      {expanded && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            filter === "archived" ? (
              <EmptyState icon={Shield} title="No archived commitments" desc="Commitments you archive will appear here." />
            ) : filter === "active" ? (
              <EmptyState icon={Shield} title="No active commitments" desc="All your commitments are archived." />
            ) : (
              <EmptyState icon={Shield} title="No commitments yet" desc="Make lifelong promises that guide your actions." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Commitment</Button>} />
            )
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((c) => {
                const linkedValues = (c.relatedValueIds || []).map((vid) => values.find((v) => v.id === vid)).filter(Boolean) as CoreValue[]
                const linkedLifeAreas = (c.relatedLifeAreaIds || []).map((lid) => lifeAreas.find((a) => a.id === lid)).filter(Boolean) as LifeArea[]
                const linkedVisions = (c.relatedVisionIds || []).map((vid) => visions.find((v) => v.id === vid)).filter(Boolean) as Vision[]

                return (
                  <div key={c.id} className={`px-4 py-3 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:scale-[1.005] transition-all duration-150 group ${c.archived ? "opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[17px] font-semibold text-foreground leading-snug line-clamp-2 flex-1 min-w-0">{c.title}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {c.pinned && <span title="Focus Commitment"><Pin className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /></span>}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingId(editingId === c.id ? null : c.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <button onClick={() => onUpdate(c.id, { archived: !c.archived })} className="p-1 rounded hover:bg-muted" title={c.archived ? "Unarchive" : "Archive"}>
                            {c.archived ? <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" /> : <Archive className="h-3.5 w-3.5 text-muted-foreground" />}
                          </button>
                          <button onClick={() => onDelete(c.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {/* Values */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Values</p>
                        {linkedValues.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {linkedValues.map((v) => (
                              <span key={v.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E0E6B]/8 text-[#1E0E6B] text-[10px] font-medium">
                                {v.icon} {v.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 italic">No values linked</p>
                        )}
                      </div>

                      {/* Life Areas */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Life Area</p>
                        {linkedLifeAreas.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {linkedLifeAreas.map((a) => (
                              <span key={a.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-muted/60 text-foreground/80 text-[10px] font-medium">
                                {a.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 italic">No life areas linked</p>
                        )}
                      </div>

                      {/* Visions */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Vision</p>
                        {linkedVisions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {linkedVisions.map((v) => (
                              <span key={v.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EB9E5B]/10 text-[#EB9E5B] text-[10px] font-medium" title={v.title}>
                                {v.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/60 italic">No vision linked</p>
                        )}
                      </div>
                    </div>

                    {editingId === c.id && (
                      <CommitmentEditModal commitment={c} values={values} lifeAreas={lifeAreas} visions={visions} onSave={(updates) => { onUpdate(c.id, updates); setEditingId(null) }} onCancel={() => setEditingId(null)} />
                    )}
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

function CommitmentEditModal({ commitment, values, lifeAreas, visions, onSave, onCancel }: {
  commitment: Commitment; values: CoreValue[]; lifeAreas: LifeArea[]; visions: Vision[]
  onSave: (updates: Partial<Commitment>) => void; onCancel: () => void
}) {
  const [title, setTitle] = useState(commitment.title)
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(commitment.relatedValueIds)
  const [relatedLifeAreaIds, setRelatedLifeAreaIds] = useState<string[]>(commitment.relatedLifeAreaIds)
  const [relatedVisionIds, setRelatedVisionIds] = useState<string[]>(commitment.relatedVisionIds)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn duration-150">
        <h3 className="font-semibold">Edit Commitment</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commitment Statement</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will always..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Values</label>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {values.map((v) => (
              <button key={v.id} onClick={() => setRelatedValueIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id])}
                className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Life Areas</label>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {lifeAreas.map((a) => (
              <button key={a.id} onClick={() => setRelatedLifeAreaIds((prev) => prev.includes(a.id) ? prev.filter((i) => i !== a.id) : [...prev, a.id])}
                className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedLifeAreaIds.includes(a.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                {a.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Visions</label>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {visions.filter((v) => !v.archived).map((v) => (
              <button key={v.id} onClick={() => setRelatedVisionIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id])}
                className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedVisionIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                {v.title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ title, relatedValueIds, relatedLifeAreaIds, relatedVisionIds })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LIFE AREAS SECTION
// ══════════════════════════════════════════════════════════════
// VISIONS SECTION
// ══════════════════════════════════════════════════════════════

function VisionsSection({ visions, values, commitments, lifeAreas, goals, allMilestones, onAdd, onUpdate, onDelete, onSelectVision, onInfo }: {
  visions: Vision[]; values: CoreValue[]; commitments: Commitment[]; lifeAreas: LifeArea[]; goals: Array<{ id: string; title: string; visionId?: string }>
  allMilestones: RoadmapMilestone[]
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Vision>) => void; onDelete: (id: string) => void; onSelectVision: (v: Vision) => void; onInfo?: () => void
}) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    let items = visions
    if (filter === "active") items = items.filter((v) => !v.archived)
    if (filter === "archived") items = items.filter((v) => v.archived)
    return items
  }, [visions, filter])

  const visionCount = visions.filter((v) => !v.archived).length

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Star} title="My Visions" subtitle="The future you are creating"
        collapsedInfo={`${visionCount} Vision${visionCount !== 1 ? 's' : ''}`}
        count={visionCount} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} onInfo={onInfo}
        rightControls={expanded && visions.length > 0 ? (
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "archived")} className="px-3 py-2 text-sm rounded-lg border bg-background h-9">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex border rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
        ) : undefined}
      />
      {expanded && (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            filter === "archived" ? (
              <EmptyState icon={Star} title="No archived visions" desc="Visions you archive will appear here." />
            ) : filter === "active" ? (
              <EmptyState icon={Star} title="No active visions" desc="All your visions are archived." />
            ) : (
              <EmptyState icon={Star} title="No visions yet" desc="Create your first vision to start building your future." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Create Vision</Button>} />
            )
          ) : view === "grid" ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((v) => {
                const area = lifeAreas.find((a) => a.id === v.lifeAreaId)
                const linkedGoals = goals.filter((g) => g.visionId === v.id)
                const visionMilestones = allMilestones.filter((m) => m.visionId === v.id && m.status !== "completed")
                const nextMilestone = visionMilestones.sort((a, b) => a.targetYear - b.targetYear)[0]
                return (
                  <div key={v.id} className={`rounded-2xl border-t-2 bg-card hover:shadow-lg hover:scale-[1.01] transition-all duration-150 cursor-pointer group min-h-[180px] flex flex-col ${v.archived ? "opacity-60" : ""}`} style={{ borderTopColor: area?.color || "#6B7280" }}
                    onClick={() => onSelectVision(v)}>
                    {v.coverImage && <div className="h-28 rounded-t-2xl overflow-hidden"><img src={v.coverImage} alt="" className="w-full h-full object-cover" /></div>}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{v.icon}</span>
                          <div>
                            <h3 className="font-semibold text-sm">{v.title}</h3>
                            {area && <Badge variant="secondary" className="text-[9px]" style={{ color: area.color || "#6B7280", backgroundColor: `${area.color || "#6B7280"}15` }}>{area.name}</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button onClick={(e) => { e.stopPropagation(); onSelectVision(v) }} className="p-1 rounded hover:bg-muted" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                          <button onClick={(e) => { e.stopPropagation(); onUpdate(v.id, { archived: !v.archived }) }} className="p-1 rounded hover:bg-muted" title={v.archived ? "Restore" : "Archive"}>
                            {v.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); onDelete(v.id) }} className="p-1 rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(v.relatedValueIds || []).slice(0, 3).map((vid) => { const val = values.find((vv) => vv.id === vid); return val ? <RelationshipChip key={vid} icon={val.icon} label={val.name} /> : null })}
                        {(v.relatedValueIds || []).length > 3 && <span className="text-[9px] text-muted-foreground">+{(v.relatedValueIds || []).length - 3}</span>}
                      </div>
                      {nextMilestone ? (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate"><span className="font-medium text-foreground/80">{nextMilestone.title}</span> (Target: {nextMilestone.targetYear})</span>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground/60 italic">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>No milestones yet</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-auto pt-3 text-[10px] text-muted-foreground border-t border-border/50">
                        <button type="button" onClick={(e) => { e.stopPropagation(); router.push("/goals") }} className="flex items-center gap-1 hover:text-[#1E0E6B] transition-colors">
                          <Target className="h-3 w-3" /> {linkedGoals.length} Goal{linkedGoals.length !== 1 ? "s" : ""}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((v) => {
                const area = lifeAreas.find((a) => a.id === v.lifeAreaId)
                return (
                  <div key={v.id} className={`flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group ${v.archived ? "opacity-60" : ""}`} onClick={() => onSelectVision(v)}>
                    <span className="text-xl">{v.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{v.title}</span>
                        {area && <Badge variant="secondary" className="text-[9px]" style={{ color: area.color || "#6B7280" }}>{area.name}</Badge>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onSelectVision(v) }} className="p-1 rounded hover:bg-muted" title="Edit"><Edit3 className="h-3.5 w-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onUpdate(v.id, { archived: !v.archived }) }} className="p-1 rounded hover:bg-muted" title={v.archived ? "Restore" : "Archive"}>
                        {v.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(v.id) }} className="p-1 rounded hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
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
// VISION EDIT MODAL
// ══════════════════════════════════════════════════════════════

function VisionEditModal({ vision, values, commitments, lifeAreas, goals, onClose, onUpdate, onCreate }: {
  vision: Vision | null; values: CoreValue[]; commitments: Commitment[]; lifeAreas: LifeArea[]; goals: Array<{ id: string; title: string; visionId?: string }>
  onClose: () => void; onUpdate?: (id: string, updates: Partial<Vision>) => void; onCreate?: (v: Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">) => void
}) {
  const purpose = loadPurpose()
  const isCreate = !vision
  const [title, setTitle] = useState(vision?.title || "")
  const [lifeAreaId, setLifeAreaId] = useState(vision?.lifeAreaId || "")
  const [purposeAlignment, setPurposeAlignment] = useState(vision?.purposeAlignment || "")
  const [reviewFrequency, setReviewFrequency] = useState<Vision["reviewFrequency"] | "">(vision?.reviewFrequency || "")
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(vision?.relatedValueIds || [])
  const [relatedCommitmentIds, setRelatedCommitmentIds] = useState<string[]>(vision?.relatedCommitmentIds || [])
  const [coverImage, setCoverImage] = useState(vision?.coverImage || "")
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null)
  const [relatedGoalIds, setRelatedGoalIds] = useState<string[]>(vision?.relatedGoalIds || [])
  const [goalSearch, setGoalSearch] = useState("")
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [frequencyError, setFrequencyError] = useState(false)
  const goalSearchRef = useRef<HTMLDivElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const linkedGoals = goals.filter((g) => g.visionId === vision?.id)
  const filteredGoals = goals.filter((g) => g.title.toLowerCase().includes(goalSearch.toLowerCase()))

  useEffect(() => { if (vision?.id) setMilestones(loadRoadmapMilestones(vision.id)) }, [vision?.id])

  useEffect(() => {
    if (!goalsOpen) return
    const handler = (e: MouseEvent) => { if (goalSearchRef.current && !goalSearchRef.current.contains(e.target as Node)) setGoalsOpen(false) }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setGoalsOpen(false) }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler) }
  }, [goalsOpen])

  const handleSave = () => {
    if (!reviewFrequency) { setFrequencyError(true); return }
    const data = { title: title.trim(), lifeAreaId, purposeAlignment, reviewFrequency: reviewFrequency as Vision["reviewFrequency"], relatedValueIds, relatedCommitmentIds, relatedGoalIds, boardItems: [], coverImage, icon: vision?.icon || "✨", relatedProjectIds: vision?.relatedProjectIds || [], relatedHabitIds: vision?.relatedHabitIds || [], archived: vision?.archived || false }
    if (isCreate) { onCreate?.(data as Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">) }
    else { onUpdate?.(vision!.id, data) }
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setCoverImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "1-year": "1 Year", "2-years": "2 Years", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
  const statusColors: Record<MilestoneStatus, string> = { "not-started": "bg-muted text-muted-foreground", "in-progress": "bg-blue-500/10 text-blue-600", "completed": "bg-emerald-500/10 text-emerald-600", "on-hold": "bg-yellow-500/10 text-yellow-600" }
  const statusLabels: Record<MilestoneStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", "completed": "Completed", "on-hold": "On Hold" }

  const canSave = title.trim() && lifeAreaId && reviewFrequency

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-fadeIn duration-150">
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-lg">{isCreate ? "Create Vision" : "Edit Vision"}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isCreate && purpose.statement && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Purpose</p>
              <p className="text-sm text-muted-foreground italic">&ldquo;{purpose.statement}&rdquo;</p>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What do you want to become?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Area <span className="text-destructive">*</span></label>
                <select value={lifeAreaId} onChange={(e) => setLifeAreaId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
                  <option value="">Select a life area...</option>
                  {lifeAreas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review Frequency <span className="text-destructive">*</span></label>
                <select value={reviewFrequency} onChange={(e) => { setReviewFrequency(e.target.value as Vision["reviewFrequency"] | ""); setFrequencyError(false) }} className={`w-full px-3 py-2 text-sm rounded-lg border bg-background ${frequencyError ? "border-destructive" : ""}`}>
                  <option value="">Choose frequency...</option>
                  {Object.entries(VISION_REVIEW_FREQUENCY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {frequencyError && <p className="text-[11px] text-destructive">Please choose how often you want to review this vision.</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Alignment</label>
              <textarea value={purposeAlignment} onChange={(e) => setPurposeAlignment(e.target.value)} placeholder="How does this vision connect to your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
            </div>
          </div>

          <Separator />

          {/* Cover Image */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cover Image</h3>
              <p className="text-[11px] text-muted-foreground mt-1">JPG, JPEG, PNG or WEBP. Max 10 MB. Recommended: 1200 x 675 px (16:9)</p>
            </div>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden border h-40 group">
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => coverInputRef.current?.click()}>Replace</Button>
                  <Button size="sm" variant="destructive" onClick={() => setCoverImage("")}>Remove</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => coverInputRef.current?.click()} className="w-full h-32 rounded-xl border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground/50" />
                <span className="text-xs text-muted-foreground font-medium">Upload Cover Image</span>
                <span className="text-[10px] text-muted-foreground/70">Click to browse. Portrait, landscape or square accepted.</span>
              </button>
            )}
          </div>

          <Separator />

          {/* Related Values */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Values</h3>
            <div className="flex flex-wrap gap-1">
              {values.map((v) => (
                <button key={v.id} onClick={() => setRelatedValueIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id])}
                  className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                  {v.name}
                </button>
              ))}
            </div>
          </div>

          {/* Related Commitments */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Related Commitments</h3>
            <div className="flex flex-wrap gap-1">
              {commitments.filter((c) => !c.archived).map((c) => (
                <button key={c.id} onClick={() => setRelatedCommitmentIds((prev) => prev.includes(c.id) ? prev.filter((i) => i !== c.id) : [...prev, c.id])}
                  className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedCommitmentIds.includes(c.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                  {c.title}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Goal Connections */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Connections</h3>
            {relatedGoalIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {relatedGoalIds.map((gid) => {
                  const g = goals.find((gg) => gg.id === gid)
                  return g ? (
                    <span key={gid} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
                      {g.title}
                      <button onClick={() => setRelatedGoalIds((prev) => prev.filter((i) => i !== gid))} className="hover:text-primary/70"><X className="h-2.5 w-2.5" /></button>
                    </span>
                  ) : null
                })}
              </div>
            )}
            <div className="relative" ref={goalSearchRef}>
              <button onClick={() => setGoalsOpen(!goalsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border bg-background text-left text-muted-foreground">
                <span>Search goals to connect...</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${goalsOpen ? "rotate-180" : ""}`} />
              </button>
              {goalsOpen && (
                <div className="absolute z-20 mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b">
                    <input value={goalSearch} onChange={(e) => setGoalSearch(e.target.value)} placeholder="Type to search..." className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {filteredGoals.map((g) => (
                      <button key={g.id} onClick={() => setRelatedGoalIds((prev) => prev.includes(g.id) ? prev.filter((i) => i !== g.id) : [...prev, g.id])}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${relatedGoalIds.includes(g.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                        <Target className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{g.title}</span>
                        {relatedGoalIds.includes(g.id) && <Check className="h-3.5 w-3.5 ml-auto shrink-0" />}
                      </button>
                    ))}
                    {filteredGoals.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No goals found.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Milestones — both create and edit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Long-Term Milestones</h3>
              <Button size="sm" variant="outline" onClick={() => setShowMilestoneDialog(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Milestone</Button>
            </div>
            {milestones.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No milestones yet.</p>
            ) : (
              <div className="space-y-3">
                {(["1-year", "2-years", "5-years", "10-years", "20-years", "lifetime"] as RoadmapTimeHorizon[]).map((horizon) => {
                  const items = milestones.filter((m) => m.timeHorizon === horizon)
                  if (items.length === 0) return null
                  return (
                    <div key={horizon} className="space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {horizonLabels[horizon]}</h4>
                      {items.map((m) => (
                        <div key={m.id} className="p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold">{m.title}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
                              </div>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-muted-foreground">Target: {m.targetYear}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => { setEditingMilestone(m); setShowMilestoneDialog(true) }} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3 w-3" /></button>
                              <button onClick={() => {
                                if (isCreate) { setMilestones((prev) => prev.filter((mm) => mm.id !== m.id)) }
                                else { deleteRoadmapMilestone(m.id); setMilestones(loadRoadmapMilestones(vision!.id)) }
                              }} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-6 py-4 flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!canSave}>{isCreate ? "Create Vision" : "Save Vision"}</Button>
        </div>
      </div>

      {showMilestoneDialog && (
        <RoadmapMilestoneDialog milestone={editingMilestone} visionId={vision?.id || "temp-create"} onClose={() => { setShowMilestoneDialog(false); setEditingMilestone(null) }}
          onSave={(m) => {
            if (isCreate) { setMilestones((prev) => [...prev, { ...m, id: `temp-${Date.now()}`, order: prev.length, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as RoadmapMilestone]) }
            else { addRoadmapMilestone({ ...m, visionId: vision!.id }); setMilestones(loadRoadmapMilestones(vision!.id)) }
            setShowMilestoneDialog(false)
          }}
          onUpdate={(id, updates) => {
            if (isCreate) { setMilestones((prev) => prev.map((mm) => mm.id === id ? { ...mm, ...updates } as RoadmapMilestone : mm)) }
            else { updateRoadmapMilestone(id, updates); setMilestones(loadRoadmapMilestones(vision!.id)) }
          }} />
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ROADMAP MILESTONE DIALOG
// ══════════════════════════════════════════════════════════════

function RoadmapMilestoneDialog({ milestone, visionId, onClose, onSave, onUpdate }: {
  milestone: RoadmapMilestone | null; visionId: string; onClose: () => void
  onSave: (m: Omit<RoadmapMilestone, "id" | "order" | "createdAt" | "updatedAt">) => void
  onUpdate: (id: string, updates: Partial<RoadmapMilestone>) => void
}) {
  const [title, setTitle] = useState(milestone?.title || "")
  const [timeHorizon, setTimeHorizon] = useState<RoadmapTimeHorizon>(milestone?.timeHorizon || "2-years")
  const [targetYear, setTargetYear] = useState(milestone?.targetYear || new Date().getFullYear() + 1)
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status || "not-started")

  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "1-year": "1 Year", "2-years": "2 Years", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }

  const progressFromStatus: Record<MilestoneStatus, number> = { "not-started": 0, "in-progress": 50, "completed": 100, "on-hold": 0 }

  const handleSave = () => {
    if (!title.trim()) return
    const progress = progressFromStatus[status]
    const data = { title: title.trim(), timeHorizon, targetYear, targetDate: "", progress, status, visionId, relatedGoalIds: milestone?.relatedGoalIds || [] }
    if (milestone) { onUpdate(milestone.id, data) } else { onSave(data) }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn duration-150">
        <h3 className="font-semibold text-base">{milestone ? "Edit Milestone" : "Add Milestone"}</h3>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title" autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Time Horizon</label>
            <select value={timeHorizon} onChange={(e) => setTimeHorizon(e.target.value as RoadmapTimeHorizon)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
              {Object.entries(horizonLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target Year</label>
            <Input type="number" value={targetYear} onChange={(e) => setTargetYear(parseInt(e.target.value) || new Date().getFullYear())} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as MilestoneStatus)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!title.trim()} onClick={handleSave}>{milestone ? "Save Changes" : "Add Milestone"}</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ROADMAP SECTION
// ══════════════════════════════════════════════════════════════



// ══════════════════════════════════════════════════════════════
// GOALS CONNECTED TO VISION
// ══════════════════════════════════════════════════════════════
// CREATE DIALOGS
// ══════════════════════════════════════════════════════════════

const VALUE_LIBRARY: Array<{ name: string; category: string; description: string }> = [
  { name: "Integrity", category: "Character", description: "Doing the right thing even when no one is watching." },
  { name: "Honesty", category: "Character", description: "Speaking and living the truth in all things." },
  { name: "Courage", category: "Character", description: "Acting with bravery in the face of fear or difficulty." },
  { name: "Humility", category: "Character", description: "Recognising your limits and valuing others above self." },
  { name: "Discipline", category: "Character", description: "Consistent self-control toward what matters most." },
  { name: "Respect", category: "Character", description: "Honouring the worth and dignity of every person." },
  { name: "Authenticity", category: "Character", description: "Being genuine and true to who you really are." },
  { name: "Faith", category: "Faith & Spirituality", description: "Trusting God and living by His guidance daily." },
  { name: "Prayer", category: "Faith & Spirituality", description: "Consistent communion with God in all things." },
  { name: "Stewardship", category: "Faith & Spirituality", description: "Managing God-given resources with wisdom and care." },
  { name: "Worship", category: "Faith & Spirituality", description: "A lifestyle of honour and devotion to God." },
  { name: "Service", category: "Faith & Spirituality", description: "Using your gifts to bless and uplift others." },
  { name: "Gratitude", category: "Faith & Spirituality", description: "Thankfulness for blessings seen and unseen." },
  { name: "Vision", category: "Leadership", description: "Seeing what could be and making it real." },
  { name: "Accountability", category: "Leadership", description: "Owning your actions and their outcomes." },
  { name: "Excellence", category: "Leadership", description: "Pursuing the highest standard in all you do." },
  { name: "Innovation", category: "Leadership", description: "Creative problem-solving and fresh thinking." },
  { name: "Influence", category: "Leadership", description: "Positive impact that inspires others to grow." },
  { name: "Love", category: "Relationships", description: "Selfless care and commitment to others' good." },
  { name: "Trust", category: "Relationships", description: "Building reliability through consistent action." },
  { name: "Compassion", category: "Relationships", description: "Genuine empathy that moves you to help." },
  { name: "Kindness", category: "Relationships", description: "Generous concern for others without expectation." },
  { name: "Loyalty", category: "Relationships", description: "Steadfast devotion through every season." },
  { name: "Forgiveness", category: "Relationships", description: "Releasing offense and choosing reconciliation." },
  { name: "Learning", category: "Growth", description: "A lifelong commitment to becoming more." },
  { name: "Curiosity", category: "Growth", description: "A hungry desire to explore and understand." },
  { name: "Wisdom", category: "Growth", description: "Applying knowledge with discernment and insight." },
  { name: "Resilience", category: "Growth", description: "Bouncing back stronger from every setback." },
  { name: "Focus", category: "Growth", description: "Directing energy toward what matters most." },
  { name: "Peace", category: "Well-being", description: "Inner calm rooted in trust beyond circumstances." },
  { name: "Joy", category: "Well-being", description: "Deep gladness not dependent on circumstances." },
  { name: "Balance", category: "Well-being", description: "Harmony across every area of life." },
  { name: "Health", category: "Well-being", description: "Stewarding your body as a temple." },
  { name: "Rest", category: "Well-being", description: "Sacred pause to renew body and soul." },
  { name: "Hope", category: "Well-being", description: "Confident expectation of a better future." },
  { name: "Generosity", category: "Character", description: "Freely giving time, treasure, and talent." },
  { name: "Perseverance", category: "Character", description: "Pressing on despite obstacles and delay." },
  { name: "Ambition", category: "Growth", description: "A holy drive to build and become more." },
  { name: "Self-Awareness", category: "Growth", description: "Knowing your heart, motives, and patterns." },
]

function CreateValueDialog({ onClose, onSave }: { onClose: () => void; onSave: (v: Omit<CoreValue, "id" | "order" | "createdAt" | "updatedAt">) => void }) {
  const [name, setName] = useState("")
  const [reflection, setReflection] = useState("")
  const [browseOpen, setBrowseOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState("")
  const browseRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!browseOpen) return
    const handler = (e: MouseEvent) => {
      if (browseRef.current && !browseRef.current.contains(e.target as Node)) setBrowseOpen(false)
    }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === "Escape") setBrowseOpen(false) }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", keyHandler)
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", keyHandler) }
  }, [browseOpen])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), icon: "✦", description: reflection, purposeConnection: "", pinned: false })
  }

  const selectFromLibrary = (label: string) => {
    setName(label)
    setBrowseOpen(false)
    setLibrarySearch("")
  }

  const groupedLibrary = useMemo(() => {
    const q = librarySearch.toLowerCase()
    const filtered = VALUE_LIBRARY.filter((v) => v.name.toLowerCase().includes(q))
    const map = new Map<string, string[]>()
    for (const v of filtered) {
      if (!map.has(v.category)) map.set(v.category, [])
      map.get(v.category)!.push(v.name)
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
  }, [librarySearch])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn duration-150">
        <h3 className="font-semibold text-base">Add Core Value</h3>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type your own value&#10;(e.g. Integrity, Faith, Excellence)" autoFocus />
        </div>

        <div className="relative" ref={browseRef}>
          <button
            type="button"
            onClick={() => setBrowseOpen((st) => !st)}
            className="flex items-center justify-between gap-2 w-full px-3 py-2.5 text-sm rounded-xl border border-[#1E0E6B]/25 bg-white dark:bg-gray-950 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          >
            <span className="text-muted-foreground">Browse Core Values</span>
            <ChevronDown className={`h-4 w-4 text-[#1E0E6B] transition-transform duration-200 ${browseOpen ? "rotate-180" : ""}`} />
          </button>

          {browseOpen && (
            <div className="absolute z-30 mt-1.5 w-full rounded-xl border border-[#1E0E6B]/20 bg-white dark:bg-gray-950 shadow-xl overflow-hidden animate-fadeIn duration-150">
              <div className="p-2 border-b border-[#1E0E6B]/10">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/60">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setBrowseOpen(false) } }}
                    placeholder="Search the library..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {groupedLibrary.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-muted-foreground text-center">No matching values</p>
                ) : (
                  groupedLibrary.map((cat) => (
                    <div key={cat.category}>
                      <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{cat.category}</p>
                      {cat.items.map((label) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => selectFromLibrary(label)}
                          className="flex items-center justify-between gap-2 w-full px-3 py-2 text-sm text-left transition-colors hover:bg-[#1E0E6B]/5"
                        >
                          <span>{label}</span>
                          {name.trim().toLowerCase() === label.toLowerCase() && <Check className="h-4 w-4 text-[#1E0E6B]" />}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reflection</label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="How does this value shape your life or support your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>

        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!name.trim()} onClick={handleSave}>Add Value</Button>
        </div>
      </div>
    </div>
  )
}

function CreateCommitmentDialog({ values, lifeAreas, visions, onClose, onSave }: {
  values: CoreValue[]; lifeAreas: LifeArea[]; visions: Vision[]; onClose: () => void
  onSave: (c: Omit<Commitment, "id" | "order" | "createdAt" | "updatedAt">) => void
}) {
  const [title, setTitle] = useState("")
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>([])
  const [relatedLifeAreaIds, setRelatedLifeAreaIds] = useState<string[]>([])
  const [relatedVisionIds, setRelatedVisionIds] = useState<string[]>([])
  const [lifeAreaSearch, setLifeAreaSearch] = useState("")
  const [lifeAreasOpen, setLifeAreasOpen] = useState(false)
  const [visionSearch, setVisionSearch] = useState("")
  const [visionsOpen, setVisionsOpen] = useState(false)

  const filteredLifeAreas = lifeAreas.filter((a) => a.name.toLowerCase().includes(lifeAreaSearch.toLowerCase()))
  const activeVisions = visions.filter((v) => !v.archived)
  const filteredVisions = activeVisions.filter((v) => v.title.toLowerCase().includes(visionSearch.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-fadeIn duration-150">
        <h3 className="font-semibold text-base">Add Commitment</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commitment Statement</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will always..." autoFocus />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Values</label>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {values.map((v) => (
              <button key={v.id} onClick={() => setRelatedValueIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id])}
                className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedValueIds.includes(v.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                {v.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Life Areas</label>
          {relatedLifeAreaIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 mb-1.5">
              {relatedLifeAreaIds.map((lid) => {
                const a = lifeAreas.find((l) => l.id === lid)
                return a ? (
                  <span key={lid} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
                    {a.name}
                    <button onClick={() => setRelatedLifeAreaIds((prev) => prev.filter((i) => i !== lid))} className="hover:text-primary/70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ) : null
              })}
            </div>
          )}
          <div className="relative">
            <button onClick={() => setLifeAreasOpen(!lifeAreasOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border bg-background text-left text-muted-foreground">
              <span>{lifeAreasOpen ? "Close dropdown" : "Search life areas..."}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${lifeAreasOpen ? "rotate-180" : ""}`} />
            </button>
            {lifeAreasOpen && (
              <div className="absolute z-20 mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b">
                  <input value={lifeAreaSearch} onChange={(e) => setLifeAreaSearch(e.target.value)} placeholder="Type to search..." className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredLifeAreas.map((a) => (
                    <button key={a.id} onClick={() => setRelatedLifeAreaIds((prev) => prev.includes(a.id) ? prev.filter((i) => i !== a.id) : [...prev, a.id])}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${relatedLifeAreaIds.includes(a.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      <span>{a.name}</span>
                      {relatedLifeAreaIds.includes(a.id) && <Check className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  ))}
                  {filteredLifeAreas.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No life areas found.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Related Visions</label>
          {relatedVisionIds.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5 mb-1.5">
              {relatedVisionIds.map((vid) => {
                const v = visions.find((vis) => vis.id === vid)
                return v ? (
                  <span key={vid} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
                    {v.title}
                    <button onClick={() => setRelatedVisionIds((prev) => prev.filter((i) => i !== vid))} className="hover:text-primary/70"><X className="h-2.5 w-2.5" /></button>
                  </span>
                ) : null
              })}
            </div>
          )}
          <div className="relative">
            <button onClick={() => setVisionsOpen(!visionsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg border bg-background text-left text-muted-foreground">
              <span>{visionsOpen ? "Close dropdown" : "Search visions..."}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${visionsOpen ? "rotate-180" : ""}`} />
            </button>
            {visionsOpen && (
              <div className="absolute z-20 mt-1 w-full bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b">
                  <input value={visionSearch} onChange={(e) => setVisionSearch(e.target.value)} placeholder="Type to search..." className="w-full px-3 py-1.5 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
                </div>
                <div className="max-h-48 overflow-y-auto p-1">
                  {filteredVisions.map((v) => (
                    <button key={v.id} onClick={() => setRelatedVisionIds((prev) => prev.includes(v.id) ? prev.filter((i) => i !== v.id) : [...prev, v.id])}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-left transition-colors ${relatedVisionIds.includes(v.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                      <span>{v.icon}</span>
                      <span>{v.title}</span>
                      {relatedVisionIds.includes(v.id) && <Check className="h-3.5 w-3.5 ml-auto" />}
                    </button>
                  ))}
                  {filteredVisions.length === 0 && <p className="px-3 py-2 text-xs text-muted-foreground">No visions available. Create a vision first.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), description: "", relatedValueIds, relatedLifeAreaIds, relatedVisionIds, healthStatus: "keeping", pinned: false, archived: false })}>Add Commitment</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export function VisionsPage() {
  const [purpose, setPurpose] = useState<Purpose>(() => { try { return loadPurpose() } catch { return { statement: "", notes: "", lifeAreaIds: [], reviewFrequency: "monthly" as const, lastReviewedAt: "", updatedAt: "" } } })
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [values, setValues] = useState<CoreValue[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [visions, setVisions] = useState<Vision[]>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string; visionId?: string; progress?: number }>>([])
  const [allMilestones, setAllMilestones] = useState<RoadmapMilestone[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [createType, setCreateType] = useState<"value" | "commitment" | "vision" | "life-area" | null>(null)
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null)
  const [infoModal, setInfoModal] = useState<"purpose" | "values" | "commitments" | "life-areas" | "visions" | null>(null)

  useEffect(() => {
    try {
      seedDemoDataIfEmpty()
      setPurpose(loadPurpose())
      setLifeAreas(loadLifeAreas())
      setValues(loadCoreValues())
      setCommitments(loadCommitments())
      const loadedVisions = loadVisions()
      setVisions(loadedVisions)
      try { const raw = localStorage.getItem("intenteo-goals"); if (raw) setGoals(JSON.parse(raw)) } catch {}
      const allMs: RoadmapMilestone[] = []
      loadedVisions.forEach((v) => { loadRoadmapMilestones(v.id).forEach((m) => allMs.push(m)) })
      setAllMilestones(allMs)
    } catch (e) {
      console.error("VisionsPage init error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const handler = () => {
      setPurpose(loadPurpose())
      setLifeAreas(loadLifeAreas())
      setValues(loadCoreValues())
      setCommitments(loadCommitments())
      setVisions(loadVisions())
    }
    window.addEventListener("vision-framework-changed", handler)
    return () => window.removeEventListener("vision-framework-changed", handler)
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
  const handleUpdateVision = useCallback((id: string, updates: Partial<Vision>) => { updateVision(id, updates); setVisions(loadVisions()); setSelectedVision((prev) => prev && prev.id === id ? { ...prev, ...updates } as Vision : prev) }, [])
  const handleDeleteVision = useCallback((id: string) => { deleteVision(id); setVisions(loadVisions()) }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="grid gap-3 md:grid-cols-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life Vision Framework</h1>
          <p className="text-muted-foreground">Your future begins with clarity.</p>
        </div>
      </div>

      {/* 1. Purpose (Hero) */}
      <PurposeSection purpose={purpose} lifeAreas={lifeAreas} onSave={handleSavePurpose} onInfo={() => setInfoModal("purpose")} />

      {/* 2. Core Values */}
      <CoreValuesSection values={values} onAdd={() => setCreateType("value")} onUpdate={handleUpdateValue} onDelete={handleDeleteValue} onReorder={handleReorderValues} onInfo={() => setInfoModal("values")} />

      {/* 3. Commitments */}
      <CommitmentsSection commitments={commitments} values={values} lifeAreas={lifeAreas} visions={visions} onAdd={() => setCreateType("commitment")} onUpdate={handleUpdateCommitment} onDelete={handleDeleteCommitment} onInfo={() => setInfoModal("commitments")} />

      {/* 4. My Visions */}
      <VisionsSection visions={visions} values={values} commitments={commitments} lifeAreas={lifeAreas} goals={goals} allMilestones={allMilestones} onAdd={() => setCreateType("vision")} onUpdate={handleUpdateVision} onDelete={handleDeleteVision} onSelectVision={setSelectedVision} onInfo={() => setInfoModal("visions")} />

      {/* Vision Edit Modal */}
      {selectedVision && (
        <VisionEditModal vision={visions.find((v) => v.id === selectedVision.id) || selectedVision} values={values} commitments={commitments} lifeAreas={lifeAreas} goals={goals}
          onClose={() => setSelectedVision(null)} onUpdate={handleUpdateVision} />
      )}

      {/* Create Dialogs */}
      {createType === "value" && <CreateValueDialog onClose={() => setCreateType(null)} onSave={handleAddValue} />}
      {createType === "commitment" && <CreateCommitmentDialog values={values} lifeAreas={lifeAreas} visions={visions} onClose={() => setCreateType(null)} onSave={handleAddCommitment} />}
      {createType === "vision" && <VisionEditModal vision={null} values={values} commitments={commitments} lifeAreas={lifeAreas} goals={goals} onClose={() => setCreateType(null)} onCreate={handleAddVision} />}

      {/* Educational Modals */}
      {infoModal === "purpose" && (
        <EducationalModal title="Purpose" onClose={() => setInfoModal(null)}>
          <p>Purpose is your reason for living. It answers the question: <strong>&ldquo;Why do I exist?&rdquo;</strong></p>
          <p>Unlike goals, purpose rarely changes. It guides your decisions throughout life.</p>
        </EducationalModal>
      )}
      {infoModal === "values" && (
        <EducationalModal title="Core Values" onClose={() => setInfoModal(null)}>
          <p>Core values are the principles that guide your decisions, shape your behaviour, and remain consistent regardless of circumstances.</p>
          <p>They are not aspirations — they are the beliefs you actually live by. Identifying them helps you align your actions with what matters most.</p>
        </EducationalModal>
      )}
      {infoModal === "commitments" && (
        <EducationalModal title="Commitments" onClose={() => setInfoModal(null)}>
          <p>Commitments are the lifelong promises you make to yourself and others. They define who you are and how you show up in the world.</p>
          <p>Unlike goals, commitments are not about achieving something — they are about being someone. They shape your character and guide your daily actions.</p>
        </EducationalModal>
      )}
      {infoModal === "visions" && (
        <EducationalModal title="My Visions" onClose={() => setInfoModal(null)}>
          <p>A vision is a vivid picture of the future you are intentionally creating. It gives direction to your goals and purpose.</p>
          <p>Each vision is tied to a life area and can contain milestones, goals, and reviews. Think of visions as the chapters of the life story you are writing.</p>
        </EducationalModal>
      )}
    </div>
  )
}
