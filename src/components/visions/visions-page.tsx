"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Plus, Search, X, ChevronDown, ChevronRight, Edit3, Trash2,
  GripVertical, Pin, PinOff, Archive, ArchiveRestore,
  Star, Target, BookOpen, CheckSquare, Link2, Unlink,
  Image, Quote, Video, StickyNote, Music,
  ExternalLink, Sparkles, LayoutGrid, List,
  Heart, Shield, Clock, Calendar, Info,
  CheckCircle2, Circle, AlertCircle,
} from "lucide-react"
import {
  loadPurpose, savePurpose,
  loadPurposeReviews, addPurposeReview, deletePurposeReview,
  loadLifeAreas, addLifeArea, updateLifeArea, deleteLifeArea, reorderLifeAreas,
  loadCoreValues, addCoreValue, updateCoreValue, deleteCoreValue, reorderCoreValues,
  loadCommitments, addCommitment, updateCommitment, deleteCommitment,
  loadVisions, addVision, updateVision, deleteVision,
  loadRoadmapMilestones, addRoadmapMilestone, updateRoadmapMilestone, deleteRoadmapMilestone,
  calculateAlignmentScore, calculateValueConnectionStrength, seedDemoDataIfEmpty,
  DEFAULT_LIFE_AREAS,
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

function StarRating({ stars }: { stars: number }) {
  return (
    <span className="text-[11px] text-amber-500">
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  )
}

function RelationshipChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-primary/10 text-primary font-medium">
      {icon} {label}
    </span>
  )
}

function SectionHeader({ icon: Icon, title, subtitle, collapsedInfo, count, expanded, onToggle, onAdd, onInfo }: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  collapsedInfo?: string
  count?: number
  expanded: boolean
  onToggle: () => void
  onAdd?: () => void
  onInfo?: () => void
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
      {expanded && onAdd && (
        <Button size="sm" variant="outline" onClick={onAdd} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
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

// ══════════════════════════════════════════════════════════════
// PURPOSE SECTION (Hero)
// ══════════════════════════════════════════════════════════════

function PurposeSection({ purpose, lifeAreas, onSave }: { purpose: Purpose; lifeAreas: LifeArea[]; onSave: (p: Purpose) => void }) {
  const [editing, setEditing] = useState(false)
  const [statement, setStatement] = useState(purpose.statement)
  const [notes, setNotes] = useState(purpose.notes)
  const [lifeAreaIds, setLifeAreaIds] = useState<string[]>(purpose.lifeAreaIds)

  useEffect(() => { setStatement(purpose.statement); setNotes(purpose.notes); setLifeAreaIds(purpose.lifeAreaIds) }, [purpose])

  const handleSave = () => {
    onSave({ statement, notes, lifeAreaIds, reviewFrequency: purpose.reviewFrequency, updatedAt: new Date().toISOString() })
    setEditing(false)
  }

  const toggleLifeArea = (id: string) => {
    setLifeAreaIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const connectedLifeAreas = lifeAreas.filter((a) => lifeAreaIds.includes(a.id))

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
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Influence</label>
            <p className="text-xs text-muted-foreground mt-0.5 mb-2">Which areas of life does your purpose touch?</p>
            <div className="flex flex-wrap gap-1.5">
              {lifeAreas.map((a) => (
                <button key={a.id} onClick={() => toggleLifeArea(a.id)}
                  className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${lifeAreaIds.includes(a.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                  {a.icon} {a.name}
                </button>
              ))}
            </div>
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
              {purpose.updatedAt && <span className="text-[10px] text-muted-foreground">Updated {new Date(purpose.updatedAt).toLocaleDateString()}</span>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1 text-xs">
              <Edit3 className="h-3 w-3" /> Edit
            </Button>
          </div>
          {purpose.statement ? (
            <div className="flex gap-3 items-start my-2">
              <span className="text-4xl text-[#1E0E6B]/15 font-serif leading-none mt-1">&ldquo;</span>
              <p className="text-lg font-medium leading-relaxed text-foreground">{purpose.statement}</p>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-lg">Define your purpose — the reason you exist.</p>
          )}
          {purpose.notes && <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{purpose.notes}</p>}
          {connectedLifeAreas.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {connectedLifeAreas.map((a) => <RelationshipChip key={a.id} icon={a.icon} label={a.name} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// PURPOSE DASHBOARD
// ══════════════════════════════════════════════════════════════

function PurposeDashboard({ purpose, values, commitments, lifeAreas, visions, goals }: {
  purpose: Purpose; values: CoreValue[]; commitments: Commitment[]; lifeAreas: LifeArea[]; visions: Vision[]; goals: Array<{ id: string }>
}) {
  if (!purpose.statement.trim()) return null
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="rounded-2xl border-2 border-[#1E0E6B] p-4 bg-white dark:bg-gray-950 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-center">
        <p className="text-2xl font-bold text-[#1E0E6B]">{values.length}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Core Values</p>
      </div>
      <div className="rounded-2xl border-2 border-[#1E0E6B] p-4 bg-white dark:bg-gray-950 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-center">
        <p className="text-2xl font-bold text-[#1E0E6B]">{commitments.length}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Commitments</p>
      </div>
      <div className="rounded-2xl border-2 border-[#1E0E6B] p-4 bg-white dark:bg-gray-950 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-center">
        <p className="text-2xl font-bold text-[#1E0E6B]">{lifeAreas.length}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Life Areas</p>
      </div>
      <div className="rounded-2xl border-2 border-[#1E0E6B] p-4 bg-white dark:bg-gray-950 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-center">
        <p className="text-2xl font-bold text-[#1E0E6B]">{visions.length}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Visions</p>
      </div>
      <div className="rounded-2xl border-2 border-[#1E0E6B] p-4 bg-white dark:bg-gray-950 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-center">
        <p className="text-2xl font-bold text-[#1E0E6B]">{goals.length}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Goals</p>
      </div>
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
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

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
      <SectionHeader icon={Heart} title="Core Values" subtitle="What guides your life" collapsedInfo={`${values.length} Value${values.length !== 1 ? 's' : ''}`} count={values.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} />
      {expanded && (
        <div className="space-y-3">
          {values.length === 0 ? (
            <EmptyState icon={Heart} title="No values yet" desc="Define the principles that guide your decisions." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Value</Button>} />
          ) : (
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value) => {
                const strength = calculateValueConnectionStrength(value.id)
                return (
                  <div key={value.id} draggable onDragStart={() => handleDragStart(value.id)} onDragOver={(e) => handleDragOver(e, value.id)} onDragEnd={() => setDragId(null)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border bg-card hover:shadow-md hover:scale-[1.01] transition-all duration-150 group cursor-grab active:cursor-grabbing ${dragId === value.id ? "opacity-50" : ""} ${value.pinned ? "border-primary/30 bg-primary/5" : ""}`}>
                    <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{value.name}</span>
                        {value.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                      </div>
                      {value.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{value.description}</p>}
                      {value.purposeConnection && <p className="text-[10px] text-primary/70 mt-1 italic line-clamp-1">&ldquo;{value.purposeConnection}&rdquo;</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <StarRating stars={strength.stars} />
                        <span className="text-[9px] text-muted-foreground">{strength.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => onUpdate(value.id, { pinned: !value.pinned })} className="p-1 rounded hover:bg-muted" title={value.pinned ? "Unpin" : "Pin"}>
                        {value.pinned ? <PinOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Pin className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => setEditingId(editingId === value.id ? null : value.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button onClick={() => onDelete(value.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    {editingId === value.id && (
                      <ValueEditModal value={value} onSave={(updates) => { onUpdate(value.id, updates); setEditingId(null) }} onCancel={() => setEditingId(null)} />
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

function ValueEditModal({ value, onSave, onCancel }: { value: CoreValue; onSave: (updates: Partial<CoreValue>) => void; onCancel: () => void }) {
  const [name, setName] = useState(value.name)
  const [description, setDescription] = useState(value.description)
  const [purposeConnection, setPurposeConnection] = useState(value.purposeConnection)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold">Edit Value</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Value name" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Connection</label>
          <textarea value={purposeConnection} onChange={(e) => setPurposeConnection(e.target.value)} placeholder="How does this value help you fulfil your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name, description, purposeConnection })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// COMMITMENTS SECTION
// ══════════════════════════════════════════════════════════════

function CommitmentsSection({ commitments, values, lifeAreas, visions, onAdd, onUpdate, onDelete }: {
  commitments: Commitment[]; values: CoreValue[]; lifeAreas: LifeArea[]; visions: Vision[]
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Commitment>) => void; onDelete: (id: string) => void
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

  return (
    <div className="space-y-4">
      <SectionHeader icon={Shield} title="Commitments" subtitle="Lifelong promises that define you" collapsedInfo={`${commitments.filter((c) => !c.archived).length} Commitment${commitments.filter((c) => !c.archived).length !== 1 ? 's' : ''}`} count={commitments.filter((c) => !c.archived).length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} />
      {expanded && (
        <div className="space-y-3">
          {commitments.length > 0 && (
            <div className="flex gap-2">
              <select value={filter} onChange={(e) => setFilter(e.target.value as "all" | "active" | "archived")} className="px-3 py-2 text-sm rounded-lg border bg-background h-9">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={Shield} title="No commitments yet" desc="Make lifelong promises that guide your actions." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Commitment</Button>} />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filtered.map((c) => (
                <div key={c.id} className={`p-4 rounded-2xl border bg-card shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-150 group ${c.archived ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{c.title}</span>
                        {c.archived && <Badge variant="secondary" className="text-[9px]">Archived</Badge>}
                        <HealthStatusBadge status={c.healthStatus} />
                      </div>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{c.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {(c.relatedValueIds || []).map((vid) => { const v = values.find((val) => val.id === vid); return v ? <RelationshipChip key={vid} icon={v.icon} label={v.name} /> : null })}
                        {(c.relatedLifeAreaIds || []).map((lid) => { const a = lifeAreas.find((l) => l.id === lid); return a ? <RelationshipChip key={lid} icon={a.icon} label={a.name} /> : null })}
                        {(c.relatedVisionIds || []).map((vid) => { const v = visions.find((vis) => vis.id === vid); return v ? <Badge key={vid} variant="outline" className="text-[9px]">{v.icon} {v.title}</Badge> : null })}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingId(editingId === c.id ? null : c.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3.5 w-3.5 text-muted-foreground" /></button>
                      <button onClick={() => onUpdate(c.id, { archived: !c.archived })} className="p-1 rounded hover:bg-muted" title={c.archived ? "Unarchive" : "Archive"}>
                        {c.archived ? <ArchiveRestore className="h-3.5 w-3.5 text-muted-foreground" /> : <Archive className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                      <button onClick={() => onDelete(c.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {editingId === c.id && (
                    <CommitmentEditModal commitment={c} values={values} lifeAreas={lifeAreas} visions={visions} onSave={(updates) => { onUpdate(c.id, updates); setEditingId(null) }} onCancel={() => setEditingId(null)} />
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

function CommitmentEditModal({ commitment, values, lifeAreas, visions, onSave, onCancel }: {
  commitment: Commitment; values: CoreValue[]; lifeAreas: LifeArea[]; visions: Vision[]
  onSave: (updates: Partial<Commitment>) => void; onCancel: () => void
}) {
  const [title, setTitle] = useState(commitment.title)
  const [description, setDescription] = useState(commitment.description)
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(commitment.relatedValueIds)
  const [relatedLifeAreaIds, setRelatedLifeAreaIds] = useState<string[]>(commitment.relatedLifeAreaIds)
  const [relatedVisionIds, setRelatedVisionIds] = useState<string[]>(commitment.relatedVisionIds)
  const [healthStatus, setHealthStatus] = useState(commitment.healthStatus)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold">Edit Commitment</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commitment Statement</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="I will always..." />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Why this commitment matters" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Health Status</label>
          <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value as Commitment["healthStatus"])} className="w-full px-3 py-2 text-sm rounded-lg border bg-background mt-1.5">
            <option value="keeping">Keeping Consistently</option>
            <option value="mostly">Mostly Keeping</option>
            <option value="needs-attention">Needs Attention</option>
            <option value="broken">Broken</option>
          </select>
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
                {a.icon} {a.name}
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
          <Button size="sm" onClick={() => onSave({ title, description, relatedValueIds, relatedLifeAreaIds, relatedVisionIds, healthStatus })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// LIFE AREAS SECTION
// ══════════════════════════════════════════════════════════════

function LifeAreasSection({ lifeAreas, visions, onAdd, onUpdate, onDelete, onReorder }: {
  lifeAreas: LifeArea[]; visions: Vision[]
  onAdd: () => void; onUpdate: (id: string, updates: Partial<LifeArea>) => void; onDelete: (id: string) => void; onReorder: (ids: string[]) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const handleDragStart = (id: string) => setDragId(id)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!dragId || dragId === targetId) return
    const ids = lifeAreas.map((a) => a.id)
    const fromIdx = ids.indexOf(dragId)
    const toIdx = ids.indexOf(targetId)
    ids.splice(fromIdx, 1)
    ids.splice(toIdx, 0, dragId)
    onReorder(ids)
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={Target} title="Life Areas" subtitle="The important areas of your life where your purpose comes to life" collapsedInfo={lifeAreas.length === 0 ? "No Life Areas Yet" : `${lifeAreas.length} Area${lifeAreas.length !== 1 ? 's' : ''}`} count={lifeAreas.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} />
      {expanded && (
        <div className="space-y-3">
          {lifeAreas.length === 0 ? (
            <EmptyState icon={Target} title="No life areas yet" desc="Define the important areas of your life." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Add Your First Life Area</Button>} />
          ) : (
            <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
              {lifeAreas.map((area) => {
                const visionCount = visions.filter((v) => v.lifeAreaId === area.id).length
                return (
                  <div key={area.id} draggable onDragStart={() => handleDragStart(area.id)} onDragOver={(e) => handleDragOver(e, area.id)} onDragEnd={() => setDragId(null)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border bg-card hover:shadow-md hover:scale-[1.01] transition-all duration-150 group cursor-grab active:cursor-grabbing ${dragId === area.id ? "opacity-50" : ""} ${area.pinned ? "border-primary/30 bg-primary/5" : ""}`}>
                    <span className="text-xl">{area.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold truncate">{area.name}</span>
                        {area.pinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
                      </div>
                      {visionCount > 0 && <p className="text-[10px] text-muted-foreground">{visionCount} vision{visionCount !== 1 ? "s" : ""}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => setEditingId(editingId === area.id ? null : area.id)} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3 w-3 text-muted-foreground" /></button>
                      <button onClick={() => onDelete(area.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    {editingId === area.id && (
                      <LifeAreaEditModal area={area} onSave={(updates) => { onUpdate(area.id, updates); setEditingId(null) }} onCancel={() => setEditingId(null)} />
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

function LifeAreaEditModal({ area, onSave, onCancel }: { area: LifeArea; onSave: (updates: Partial<LifeArea>) => void; onCancel: () => void }) {
  const [name, setName] = useState(area.name)
  const [color, setColor] = useState(area.color)
  const [description, setDescription] = useState(area.description)

  const LIFE_AREA_COLORS = ["#3B82F6", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444", "#F97316", "#06B6D4", "#6B7280"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold">Edit Life Area</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Life area name" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</label>
          <div className="flex gap-2">
            {LIFE_AREA_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name, color, description })}>Save</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// VISIONS SECTION
// ══════════════════════════════════════════════════════════════

function VisionsSection({ visions, values, commitments, lifeAreas, goals, onAdd, onUpdate, onDelete, onSelectVision }: {
  visions: Vision[]; values: CoreValue[]; commitments: Commitment[]; lifeAreas: LifeArea[]; goals: Array<{ id: string; title: string; visionId?: string }>
  onAdd: () => void; onUpdate: (id: string, updates: Partial<Vision>) => void; onDelete: (id: string) => void; onSelectVision: (v: Vision) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [view, setView] = useState<"grid" | "list">("grid")

  const filtered = useMemo(() => {
    let items = visions
    if (filter === "active") items = items.filter((v) => !v.archived)
    if (filter === "archived") items = items.filter((v) => v.archived)
    return items
  }, [visions, filter])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Star} title="My Visions" subtitle="The future you are creating" collapsedInfo={`${visions.filter((v) => !v.archived).length} Vision${visions.filter((v) => !v.archived).length !== 1 ? 's' : ''}`} count={visions.filter((v) => !v.archived).length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={onAdd} />
      {expanded && (
        <div className="space-y-3">
          {visions.length > 0 && (
            <div className="flex gap-2">
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
          )}
          {filtered.length === 0 ? (
            <EmptyState icon={Star} title="No visions yet" desc="Create your first vision to start building your future." action={<Button size="sm" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Create Vision</Button>} />
          ) : view === "grid" ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((v) => {
                const area = lifeAreas.find((a) => a.id === v.lifeAreaId)
                const linkedGoals = goals.filter((g) => g.visionId === v.id)
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
                            {area && <Badge variant="secondary" className="text-[9px]" style={{ color: area.color || "#6B7280", backgroundColor: `${area.color || "#6B7280"}15` }}>{area.icon} {area.name}</Badge>}
                          </div>
                        </div>
                      </div>
                      {v.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{v.description}</p>}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(v.relatedValueIds || []).slice(0, 3).map((vid) => { const val = values.find((vv) => vv.id === vid); return val ? <RelationshipChip key={vid} icon={val.icon} label={val.name} /> : null })}
                        {(v.relatedValueIds || []).length > 3 && <span className="text-[9px] text-muted-foreground">+{(v.relatedValueIds || []).length - 3}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-auto pt-3 text-[10px] text-muted-foreground border-t border-border/50">
                        <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {linkedGoals.length} Goals</span>
                        <span className="flex items-center gap-1"><Image className="h-3 w-3" /> {(v.boardItems || []).length} Board</span>
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
                      {v.description && <p className="text-xs text-muted-foreground truncate">{v.description}</p>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); onUpdate(v.id, { archived: !v.archived }) }} className="p-1 rounded hover:bg-muted">
                        {v.archived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                      </button>
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
// VISION EDIT MODAL
// ══════════════════════════════════════════════════════════════

function VisionEditModal({ vision, values, commitments, lifeAreas, goals, onClose, onUpdate }: {
  vision: Vision; values: CoreValue[]; commitments: Commitment[]; lifeAreas: LifeArea[]; goals: Array<{ id: string; title: string; visionId?: string }>
  onClose: () => void; onUpdate: (id: string, updates: Partial<Vision>) => void
}) {
  const purpose = loadPurpose()
  const [title, setTitle] = useState(vision.title)
  const [description, setDescription] = useState(vision.description)
  const [lifeAreaId, setLifeAreaId] = useState(vision.lifeAreaId)
  const [purposeAlignment, setPurposeAlignment] = useState(vision.purposeAlignment)
  const [relatedValueIds, setRelatedValueIds] = useState<string[]>(vision.relatedValueIds)
  const [relatedCommitmentIds, setRelatedCommitmentIds] = useState<string[]>(vision.relatedCommitmentIds)
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])
  const [showMilestoneDialog, setShowMilestoneDialog] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<RoadmapMilestone | null>(null)
  const [boardItems, setBoardItems] = useState<VisionBoardItem[]>(vision.boardItems || [])
  const [addBoardType, setAddBoardType] = useState<VisionBoardItem["type"] | null>(null)
  const [newBoardContent, setNewBoardContent] = useState("")
  const [newBoardTitle, setNewBoardTitle] = useState("")
  const [newBoardUrl, setNewBoardUrl] = useState("")

  const linkedGoals = goals.filter((g) => g.visionId === vision.id)
  const selectedArea = lifeAreas.find((a) => a.id === lifeAreaId)

  useEffect(() => { setMilestones(loadRoadmapMilestones(vision.id)) }, [vision.id])

  const handleSave = () => {
    onUpdate(vision.id, { title, description, lifeAreaId, purposeAlignment, relatedValueIds, relatedCommitmentIds, boardItems })
  }

  const handleAddBoardItem = () => {
    if (!addBoardType || !newBoardContent.trim()) return
    const item: VisionBoardItem = { id: `vbi-${Date.now()}`, type: addBoardType, content: newBoardContent.trim(), title: newBoardTitle.trim(), url: newBoardUrl.trim(), createdAt: new Date().toISOString() }
    setBoardItems([...boardItems, item])
    setAddBoardType(null); setNewBoardContent(""); setNewBoardTitle(""); setNewBoardUrl("")
  }

  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "2-years": "2 Years", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
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
          {/* Purpose (read-only) */}
          {purpose.statement && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Purpose</p>
              <p className="text-sm text-muted-foreground italic">&ldquo;{purpose.statement}&rdquo;</p>
            </div>
          )}

          {/* Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</h3>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vision title" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Area (Required)</label>
              <select value={lifeAreaId} onChange={(e) => setLifeAreaId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
                <option value="">Select a life area...</option>
                {lifeAreas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this vision for your future..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Alignment</label>
              <textarea value={purposeAlignment} onChange={(e) => setPurposeAlignment(e.target.value)} placeholder="How does this vision connect to your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
            </div>
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

          {/* Vision Board */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Vision Board</h3>
            <div className="flex flex-wrap gap-2">
              {(["image", "quote", "bible-verse", "video", "link", "note"] as const).map((type) => (
                <button key={type} onClick={() => setAddBoardType(addBoardType === type ? null : type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${addBoardType === type ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                  {typeIcons[type]} {type.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </button>
              ))}
            </div>
            {addBoardType && (
              <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                {addBoardType !== "note" && <Input value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} placeholder="Title (optional)" className="h-9" />}
                {(addBoardType === "link" || addBoardType === "image" || addBoardType === "video") && <Input value={newBoardUrl} onChange={(e) => setNewBoardUrl(e.target.value)} placeholder="URL" className="h-9" />}
                <textarea value={newBoardContent} onChange={(e) => setNewBoardContent(e.target.value)} placeholder="Content..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => { setAddBoardType(null); setNewBoardContent(""); setNewBoardTitle(""); setNewBoardUrl("") }}>Cancel</Button>
                  <Button size="sm" onClick={handleAddBoardItem}>Add</Button>
                </div>
              </div>
            )}
            {boardItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {boardItems.map((item) => (
                  <div key={item.id} className="rounded-xl border bg-card p-3 space-y-1.5 group relative hover:shadow-sm transition-all duration-150">
                    <button onClick={() => setBoardItems(boardItems.filter((i) => i.id !== item.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-opacity">
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">{item.type.replace("-", " ")}</span>
                    {item.title && <p className="text-sm font-medium">{item.title}</p>}
                    {(item.type === "quote" || item.type === "bible-verse") && <p className="text-xs italic text-muted-foreground line-clamp-2">&ldquo;{item.content}&rdquo;</p>}
                    {item.type === "note" && <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Roadmap Milestones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Long-Term Milestones</h3>
              <Button size="sm" variant="outline" onClick={() => setShowMilestoneDialog(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Milestone</Button>
            </div>
            {milestones.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No milestones yet.</p>
            ) : (
              <div className="space-y-3">
                {(["2-years", "5-years", "10-years", "20-years", "lifetime"] as RoadmapTimeHorizon[]).map((horizon) => {
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
                              {m.description && <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>}
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-[10px] text-muted-foreground">Target: {m.targetYear}</span>
                                <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} /></div>
                                  <span className="text-[10px] text-muted-foreground">{m.progress}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => { setEditingMilestone(m); setShowMilestoneDialog(true) }} className="p-1 rounded hover:bg-muted"><Edit3 className="h-3 w-3" /></button>
                              <button onClick={() => { deleteRoadmapMilestone(m.id); setMilestones(loadRoadmapMilestones(vision.id)) }} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
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

          <Separator />

          {/* Goal Connections */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Goal Connections</h3>
            {linkedGoals.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No goals linked yet.</p>
            ) : (
              <div className="space-y-1.5">
                {linkedGoals.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-xl border bg-card">
                    <Target className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{g.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t px-6 py-4 flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave}>Save Vision</Button>
        </div>
      </div>

      {showMilestoneDialog && (
        <RoadmapMilestoneDialog milestone={editingMilestone} visionId={vision.id} onClose={() => { setShowMilestoneDialog(false); setEditingMilestone(null) }}
          onSave={(m) => { addRoadmapMilestone({ ...m, visionId: vision.id }); setMilestones(loadRoadmapMilestones(vision.id)); setShowMilestoneDialog(false) }}
          onUpdate={(id, updates) => { updateRoadmapMilestone(id, updates); setMilestones(loadRoadmapMilestones(vision.id)) }} />
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
  const [description, setDescription] = useState(milestone?.description || "")
  const [timeHorizon, setTimeHorizon] = useState<RoadmapTimeHorizon>(milestone?.timeHorizon || "2-years")
  const [targetYear, setTargetYear] = useState(milestone?.targetYear || new Date().getFullYear() + 1)
  const [progress, setProgress] = useState(milestone?.progress || 0)
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status || "not-started")
  const [notes, setNotes] = useState(milestone?.notes || "")

  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "2-years": "2 Years", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }

  const handleSave = () => {
    if (!title.trim()) return
    const data = { title: title.trim(), description, timeHorizon, targetYear, targetDate: "", progress, status, notes, visionId, relatedGoalIds: milestone?.relatedGoalIds || [] }
    if (milestone) { onUpdate(milestone.id, data) } else { onSave(data) }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">{milestone ? "Edit Milestone" : "Add Milestone"}</h3>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title" autoFocus />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as MilestoneStatus)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress ({progress}%)</label>
            <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className="w-full h-2 rounded-full appearance-none bg-muted cursor-pointer accent-primary mt-2" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
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

function RoadmapSection({ visions, lifeAreas }: { visions: Vision[]; lifeAreas: LifeArea[] }) {
  const [expanded, setExpanded] = useState(false)
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([])

  useEffect(() => { setMilestones(loadRoadmapMilestones()) }, [])

  const horizonLabels: Record<RoadmapTimeHorizon, string> = { "2-years": "2 Years", "5-years": "5 Years", "10-years": "10 Years", "20-years": "20 Years", "lifetime": "Lifetime" }
  const statusColors: Record<MilestoneStatus, string> = { "not-started": "bg-muted text-muted-foreground", "in-progress": "bg-blue-500/10 text-blue-600", "completed": "bg-emerald-500/10 text-emerald-600", "on-hold": "bg-yellow-500/10 text-yellow-600" }
  const statusLabels: Record<MilestoneStatus, string> = { "not-started": "Not Started", "in-progress": "In Progress", "completed": "Completed", "on-hold": "On Hold" }

  const groupedByVision = useMemo(() => {
    return visions.filter((v) => !v.archived).map((v) => {
      const visionMilestones = milestones.filter((m) => m.visionId === v.id)
      const byHorizon: Record<RoadmapTimeHorizon, RoadmapMilestone[]> = { "2-years": [], "5-years": [], "10-years": [], "20-years": [], "lifetime": [] }
      visionMilestones.forEach((m) => { byHorizon[m.timeHorizon].push(m) })
      return { vision: v, byHorizon, total: visionMilestones.length }
    }).filter((g) => g.total > 0)
  }, [visions, milestones])

  const count = milestones.length

  return (
    <div className="space-y-4">
      <SectionHeader icon={Clock} title="Long-Term Milestones" subtitle="Major achievements across your life's timeline" collapsedInfo={`${count} Milestone${count !== 1 ? 's' : ''}`} count={milestones.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
      {expanded && (
        <div className="space-y-6">
          {groupedByVision.length === 0 ? (
            <EmptyState icon={Clock} title="No milestones yet" desc="Add milestones from your vision details to build your roadmap." />
          ) : (
            groupedByVision.map(({ vision, byHorizon, total }) => {
              const area = lifeAreas.find((a) => a.id === vision.lifeAreaId)
              return (
                <div key={vision.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{vision.icon}</span>
                    <h3 className="text-sm font-bold">{vision.title}</h3>
                    {area && <Badge variant="secondary" className="text-[9px]">{area.icon} {area.name}</Badge>}
                    <Badge variant="secondary" className="text-[9px]">{total} milestones</Badge>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-primary/20 rounded-full" />
                    {(["2-years", "5-years", "10-years", "20-years", "lifetime"] as RoadmapTimeHorizon[]).map((horizon) => {
                      const items = byHorizon[horizon]
                      if (items.length === 0) return null
                      return (
                        <div key={horizon} className="relative space-y-2 mb-4 last:mb-0">
                          <div className="flex items-center gap-2 mb-2 relative">
                            <div className="absolute -left-6 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{horizonLabels[horizon]}</h4>
                          </div>
                          <div className="space-y-2">
                            {items.map((m) => (
                              <div key={m.id} className="relative pl-2">
                                <div className="absolute -left-[15px] top-3 w-2 h-2 rounded-full bg-primary/40 border border-primary z-10" />
                                <div className="p-3 rounded-2xl border bg-card hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold">{m.title}</span>
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[m.status]}`}>{statusLabels[m.status]}</span>
                                  </div>
                                  {m.description && <p className="text-xs text-muted-foreground line-clamp-2">{m.description}</p>}
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] text-muted-foreground">Target: {m.targetYear}</span>
                                    <div className="flex items-center gap-1.5 flex-1 max-w-[200px]">
                                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${m.progress}%` }} /></div>
                                      <span className="text-[10px] text-muted-foreground">{m.progress}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// GOALS CONNECTED TO VISION
// ══════════════════════════════════════════════════════════════

function GoalsByVisionSection({ visions, goals, lifeAreas }: { visions: Vision[]; goals: Array<{ id: string; title: string; visionId?: string; progress?: number }>; lifeAreas: LifeArea[] }) {
  const [expanded, setExpanded] = useState(false)
  const grouped = useMemo(() => visions.filter((v) => !v.archived).map((v) => ({ vision: v, goals: goals.filter((g) => g.visionId === v.id) })).filter((g) => g.goals.length > 0), [visions, goals])
  const unlinkedGoals = useMemo(() => goals.filter((g) => !g.visionId), [goals])

  return (
    <div className="space-y-4">
      <SectionHeader icon={Target} title="Goals Connected to Vision" subtitle="Every goal should support a vision" collapsedInfo={`${goals.length} Connected Goal${goals.length !== 1 ? 's' : ''}`} count={goals.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} />
      {expanded && (
        <div className="space-y-6">
          {grouped.length === 0 && unlinkedGoals.length === 0 ? (
            <EmptyState icon={Target} title="No goals yet" desc="Create goals and link them to your visions." />
          ) : (
            <>
              {grouped.map(({ vision, goals: vGoals }) => {
                const area = lifeAreas.find((a) => a.id === vision.lifeAreaId)
                return (
                  <div key={vision.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{vision.icon}</span>
                      <h3 className="text-sm font-bold">{vision.title}</h3>
                      {area && <Badge variant="secondary" className="text-[9px]">{area.icon} {area.name}</Badge>}
                      <CountBadge count={vGoals.length} />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {vGoals.map((g) => (
                        <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                          <Target className="h-4 w-4 text-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{g.title}</p>
                            {g.progress !== undefined && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${g.progress}%` }} /></div>
                                <span className="text-[10px] text-muted-foreground">{g.progress}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {unlinkedGoals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold text-muted-foreground">Unlinked Goals</h3>
                    <CountBadge count={unlinkedGoals.length} />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {unlinkedGoals.map((g) => (
                      <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 border-dashed">
                        <Unlink className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground truncate">{g.title}</p>
                      </div>
                    ))}
                  </div>
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
// PURPOSE REVIEWS SECTION
// ══════════════════════════════════════════════════════════════

function PurposeReviewsSection() {
  const [expanded, setExpanded] = useState(false)
  const [reviews, setReviews] = useState<PurposeReview[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [reflection, setReflection] = useState("")
  const [question, setQuestion] = useState("")

  useEffect(() => { setReviews(loadPurposeReviews()) }, [])

  const handleAdd = () => {
    if (!reflection.trim()) return
    addPurposeReview({ reflection: reflection.trim(), question: question.trim(), reviewDate: new Date().toISOString() })
    setReviews(loadPurposeReviews())
    setReflection(""); setQuestion(""); setShowAdd(false)
  }

  const handleDelete = (id: string) => {
    deletePurposeReview(id)
    setReviews(loadPurposeReviews())
  }

  const defaultQuestions = [
    "Have your recent decisions reflected your purpose?",
    "What distracted you from your purpose?",
    "What are you proud of?",
    "What needs to change?",
  ]

  return (
    <div className="space-y-4">
      <SectionHeader icon={BookOpen} title="Purpose Reviews" subtitle="Reflect on how well you're living your purpose" collapsedInfo={`${reviews.length} Review${reviews.length !== 1 ? 's' : ''}`} count={reviews.length} expanded={expanded} onToggle={() => setExpanded(!expanded)} onAdd={() => setShowAdd(true)} />
      {expanded && (
        <div className="space-y-3">
          {showAdd && (
            <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</label>
                <div className="flex flex-wrap gap-1.5">
                  {defaultQuestions.map((q) => (
                    <button key={q} onClick={() => setQuestion(q)} className={`px-2 py-1 text-[10px] rounded-full border transition-colors ${question === q ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                      {q}
                    </button>
                  ))}
                </div>
                <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Or type your own question..." className="h-9 mt-1" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reflection</label>
                <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Write your reflection..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={4} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setReflection(""); setQuestion("") }}>Cancel</Button>
                <Button size="sm" disabled={!reflection.trim()} onClick={handleAdd}>Save Review</Button>
              </div>
            </div>
          )}
          {reviews.length === 0 ? (
            <EmptyState icon={BookOpen} title="No reviews yet" desc="Start reflecting on how well you're living your purpose." />
          ) : (
            <div className="space-y-2">
              {reviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border bg-card hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {r.question && <p className="text-xs font-semibold text-primary mb-1">{r.question}</p>}
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.reflection}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(r.reviewDate).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
  const [purposeConnection, setPurposeConnection] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Add Core Value</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Integrity, Faith, Excellence" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this value mean to you?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose Connection</label>
          <textarea value={purposeConnection} onChange={(e) => setPurposeConnection(e.target.value)} placeholder="How does this value help you fulfil your purpose?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), icon: "✦", description, purposeConnection, pinned: false })}>Add Value</Button>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
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
          <div className="flex flex-wrap gap-1 mt-1.5">
            {lifeAreas.map((a) => (
              <button key={a.id} onClick={() => setRelatedLifeAreaIds((prev) => prev.includes(a.id) ? prev.filter((i) => i !== a.id) : [...prev, a.id])}
                className={`px-2 py-1 text-[11px] rounded-full border transition-colors ${relatedLifeAreaIds.includes(a.id) ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted"}`}>
                {a.icon} {a.name}
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
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!title.trim()} onClick={() => onSave({ title: title.trim(), description: "", relatedValueIds, relatedLifeAreaIds, relatedVisionIds, healthStatus: "keeping", archived: false })}>Add Commitment</Button>
        </div>
      </div>
    </div>
  )
}

function CreateVisionDialog({ lifeAreas, onClose, onSave }: {
  lifeAreas: LifeArea[]; onClose: () => void; onSave: (v: Omit<Vision, "id" | "order" | "createdAt" | "updatedAt">) => void
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [lifeAreaId, setLifeAreaId] = useState("")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Create Vision</h3>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vision Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Vision title" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Life Area (Required)</label>
          <select value={lifeAreaId} onChange={(e) => setLifeAreaId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background">
            <option value="">Select a life area...</option>
            {lifeAreas.map((a) => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this vision for your future..." className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={3} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!title.trim() || !lifeAreaId} onClick={() => onSave({ title: title.trim(), description, lifeAreaId, icon: "✨", purposeAlignment: "", reviewFrequency: "monthly", relatedValueIds: [], relatedCommitmentIds: [], relatedGoalIds: [], relatedProjectIds: [], relatedHabitIds: [], boardItems: [], coverImage: "", archived: false })}>Create Vision</Button>
        </div>
      </div>
    </div>
  )
}

function CreateLifeAreaDialog({ onClose, onSave }: { onClose: () => void; onSave: (a: Omit<LifeArea, "id" | "order" | "createdAt" | "updatedAt">) => void }) {
  const [name, setName] = useState("")
  const [icon, setIcon] = useState("✦")
  const [color, setColor] = useState("#6B7280")
  const [description, setDescription] = useState("")

  const LIFE_AREA_COLORS = ["#3B82F6", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981", "#EF4444", "#F97316", "#06B6D4", "#6B7280"]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-semibold text-base">Add Life Area</h3>
        <div className="grid grid-cols-4 gap-2">
          <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Emoji" className="col-span-1 text-center text-lg" />
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Life area name" className="col-span-3" autoFocus />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Color</label>
          <div className="flex gap-2">
            {LIFE_AREA_COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this area encompass?" className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>Cancel</Button>
          <Button size="sm" disabled={!name.trim()} onClick={() => onSave({ name: name.trim(), icon, color, description, pinned: false, archived: false })}>Add Life Area</Button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export function VisionsPage() {
  const [purpose, setPurpose] = useState<Purpose>(() => { try { return loadPurpose() } catch { return { statement: "", notes: "", lifeAreaIds: [], reviewFrequency: "monthly" as const, updatedAt: "" } } })
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([])
  const [values, setValues] = useState<CoreValue[]>([])
  const [commitments, setCommitments] = useState<Commitment[]>([])
  const [visions, setVisions] = useState<Vision[]>([])
  const [goals, setGoals] = useState<Array<{ id: string; title: string; visionId?: string; progress?: number }>>([])

  const [isLoading, setIsLoading] = useState(true)
  const [createType, setCreateType] = useState<"value" | "commitment" | "vision" | "life-area" | null>(null)
  const [selectedVision, setSelectedVision] = useState<Vision | null>(null)
  const [infoModal, setInfoModal] = useState<"purpose" | "values" | "commitments" | "life-areas" | "visions" | "roadmap" | null>(null)

  useEffect(() => {
    try {
      seedDemoDataIfEmpty()
      setPurpose(loadPurpose())
      setLifeAreas(loadLifeAreas())
      setValues(loadCoreValues())
      setCommitments(loadCommitments())
      setVisions(loadVisions())
      try { const raw = localStorage.getItem("intenteo-goals"); if (raw) setGoals(JSON.parse(raw)) } catch {}
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
  const handleAddLifeArea = useCallback((a: Omit<LifeArea, "id" | "order" | "createdAt" | "updatedAt">) => { addLifeArea(a); setLifeAreas(loadLifeAreas()); setCreateType(null) }, [])
  const handleUpdateLifeArea = useCallback((id: string, updates: Partial<LifeArea>) => { updateLifeArea(id, updates); setLifeAreas(loadLifeAreas()) }, [])
  const handleDeleteLifeArea = useCallback((id: string) => { deleteLifeArea(id); setLifeAreas(loadLifeAreas()) }, [])
  const handleReorderLifeAreas = useCallback((ids: string[]) => { reorderLifeAreas(ids); setLifeAreas(loadLifeAreas()) }, [])
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
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Life Vision Framework</h1>
          <p className="text-muted-foreground">Your future begins with clarity.</p>
        </div>
      </div>

      {/* Life Framework Hierarchy */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground/60 py-2">
        <span>Purpose</span>
        <span>→</span>
        <span>Values</span>
        <span>→</span>
        <span>Commitments</span>
        <span>→</span>
        <span>Visions</span>
        <span>→</span>
        <span>Goals</span>
        <span>→</span>
        <span>Habits</span>
      </div>

      {/* Purpose Dashboard */}
      <PurposeDashboard purpose={purpose} values={values} commitments={commitments} lifeAreas={lifeAreas} visions={visions} goals={goals} />

      {/* 1. Purpose (Hero) */}
      <PurposeSection purpose={purpose} lifeAreas={lifeAreas} onSave={handleSavePurpose} />

      {/* 2. Core Values */}
      <CoreValuesSection values={values} onAdd={() => setCreateType("value")} onUpdate={handleUpdateValue} onDelete={handleDeleteValue} onReorder={handleReorderValues} />

      {/* 3. Commitments */}
      <CommitmentsSection commitments={commitments} values={values} lifeAreas={lifeAreas} visions={visions} onAdd={() => setCreateType("commitment")} onUpdate={handleUpdateCommitment} onDelete={handleDeleteCommitment} />

      {/* 4. Life Areas */}
      <LifeAreasSection lifeAreas={lifeAreas} visions={visions} onAdd={() => setCreateType("life-area")} onUpdate={handleUpdateLifeArea} onDelete={handleDeleteLifeArea} onReorder={handleReorderLifeAreas} />

      {/* 5. My Visions */}
      <VisionsSection visions={visions} values={values} commitments={commitments} lifeAreas={lifeAreas} goals={goals} onAdd={() => setCreateType("vision")} onUpdate={handleUpdateVision} onDelete={handleDeleteVision} onSelectVision={setSelectedVision} />

      {/* 6. Goals Connected to Vision */}
      <GoalsByVisionSection visions={visions} goals={goals} lifeAreas={lifeAreas} />

      {/* 7. Long-Term Milestones */}
      <RoadmapSection visions={visions} lifeAreas={lifeAreas} />

      {/* 8. Purpose Reviews */}
      <PurposeReviewsSection />

      {/* Vision Edit Modal */}
      {selectedVision && (
        <VisionEditModal vision={visions.find((v) => v.id === selectedVision.id) || selectedVision} values={values} commitments={commitments} lifeAreas={lifeAreas} goals={goals}
          onClose={() => setSelectedVision(null)} onUpdate={handleUpdateVision} />
      )}

      {/* Create Dialogs */}
      {createType === "value" && <CreateValueDialog onClose={() => setCreateType(null)} onSave={handleAddValue} />}
      {createType === "commitment" && <CreateCommitmentDialog values={values} lifeAreas={lifeAreas} visions={visions} onClose={() => setCreateType(null)} onSave={handleAddCommitment} />}
      {createType === "vision" && <CreateVisionDialog lifeAreas={lifeAreas} onClose={() => setCreateType(null)} onSave={handleAddVision} />}
      {createType === "life-area" && <CreateLifeAreaDialog onClose={() => setCreateType(null)} onSave={handleAddLifeArea} />}

      {/* Educational Modals */}
      {infoModal === "purpose" && (
        <EducationalModal title="Purpose" onClose={() => setInfoModal(null)}>
          <p>Purpose is your reason for living. It answers the question: <strong>&ldquo;Why do I exist?&rdquo;</strong></p>
          <p>Unlike goals, purpose rarely changes. It guides your decisions throughout life.</p>
        </EducationalModal>
      )}
      {infoModal === "life-areas" && (
        <EducationalModal title="Life Areas" onClose={() => setInfoModal(null)}>
          <p>Life Areas are the important domains of your life where your purpose comes to life.</p>
          <p>Every vision should belong to a Life Area.</p>
        </EducationalModal>
      )}
    </div>
  )
}
