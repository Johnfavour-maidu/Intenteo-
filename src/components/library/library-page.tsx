"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Search, BookOpen, Bookmark, Clock, Star, X,
  ChevronDown, ChevronRight, Filter,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  RESOURCE_CATEGORIES, RESOURCE_TYPES,
  ALL_RESOURCES, getResourcesByCategory, searchResources,
  getRecentlyViewedResources, addRecentlyViewedResource,
  getSavedResources, toggleSavedResource, isResourceSaved,
  TRACKER_RESOURCE_MAP,
  type Resource, type ResourceCategory, type ResourceType, type DifficultyLevel,
} from "@/lib/resources"

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: "text-emerald-600 bg-emerald-50",
  intermediate: "text-amber-600 bg-amber-50",
  advanced: "text-red-600 bg-red-50",
}

const TYPE_ICONS: Record<ResourceType, string> = {
  article: "📄", guide: "📘", exercise: "🎯", worksheet: "📝",
  template: "📋", prompt: "💭", book: "📕", video: "🎬",
  podcast: "🎧", checklist: "☑️", framework: "🏗️",
}

export function LibraryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") as ResourceCategory | null

  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(initialCategory)
  const [selectedType, setSelectedType] = useState<ResourceType | null>(null)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | null>(null)
  const [activeTab, setActiveTab] = useState<"browse" | "saved" | "recent">("browse")
  const [expandedResource, setExpandedResource] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    setSavedIds(getSavedResources())
    setRecentIds(getRecentlyViewedResources())
  }, [])

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory)
  }, [initialCategory])

  const filteredResources = useMemo(() => {
    let resources = query.trim() ? searchResources(query) : ALL_RESOURCES
    if (selectedCategory) resources = resources.filter(r => r.category === selectedCategory)
    if (selectedType) resources = resources.filter(r => r.type === selectedType)
    if (selectedDifficulty) resources = resources.filter(r => r.difficulty === selectedDifficulty)
    return resources
  }, [query, selectedCategory, selectedType, selectedDifficulty])

  const savedResources = useMemo(() =>
    ALL_RESOURCES.filter(r => savedIds.includes(r.id)), [savedIds])

  const recentResources = useMemo(() =>
    recentIds.map(id => ALL_RESOURCES.find(r => r.id === id)).filter(Boolean) as Resource[], [recentIds])

  const handleToggleSave = useCallback((id: string) => {
    toggleSavedResource(id)
    setSavedIds(getSavedResources())
  }, [])

  const handleOpenResource = useCallback((id: string) => {
    addRecentlyViewedResource(id)
    setRecentIds(getRecentlyViewedResources())
    setExpandedResource(expandedResource === id ? null : id)
  }, [expandedResource])

  const displayResources = activeTab === "saved" ? savedResources :
    activeTab === "recent" ? recentResources : filteredResources

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost" size="sm"
            onClick={() => router.back()}
            className="gap-1 text-muted-foreground hover:text-foreground w-fit mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-[#1E0E6B]" /> Library & Resources
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Curated knowledge to help you live with purpose and intention
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-muted/50 max-w-xl">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resources by topic, keyword, or category..."
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
            {query && (
              <button onClick={() => setQuery("")}>
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b pb-2">
          {[
            { id: "browse" as const, label: "Browse", icon: <BookOpen className="h-3.5 w-3.5" /> },
            { id: "saved" as const, label: "Saved", icon: <Bookmark className="h-3.5 w-3.5" /> },
            { id: "recent" as const, label: "Recently Viewed", icon: <Clock className="h-3.5 w-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === "saved" && savedIds.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{savedIds.length}</span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
          {/* Sidebar: Categories & Filters */}
          {activeTab === "browse" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Categories</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    All Resources
                  </button>
                  {RESOURCE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                        selectedCategory === cat.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resource Type</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedType(null)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      !selectedType ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"
                    }`}
                  >
                    All Types
                  </button>
                  {RESOURCE_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(selectedType === t.id ? null : t.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-2 ${
                        selectedType === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/60"
                      }`}
                    >
                      <span>{t.icon}</span> {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Difficulty</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["beginner", "intermediate", "advanced"] as DifficultyLevel[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                      className={`px-2.5 py-1 text-xs rounded-full transition-colors capitalize ${
                        selectedDifficulty === d
                          ? "bg-[#1E0E6B] text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resource Grid */}
          <div>
            {activeTab === "browse" && selectedCategory && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {filteredResources.length} {filteredResources.length === 1 ? "resource" : "resources"} in{" "}
                  <span className="font-medium text-foreground">{selectedCategory}</span>
                </p>
              </div>
            )}

            {displayResources.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {activeTab === "saved" ? "No saved resources yet. Browse and bookmark resources to find them here." :
                   activeTab === "recent" ? "No recently viewed resources. Start browsing to build your history." :
                   "No resources match your filters. Try adjusting your search or category."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayResources.map((resource) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <GlassCard className="overflow-hidden">
                      <button
                        onClick={() => handleOpenResource(resource.id)}
                        className="w-full text-left p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{TYPE_ICONS[resource.type]}</span>
                              <h3 className="text-sm font-semibold truncate">{resource.title}</h3>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground">{resource.category}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${DIFFICULTY_COLORS[resource.difficulty]}`}>
                                {resource.difficulty}
                              </span>
                              {resource.readTime && (
                                <span className="text-[10px] text-muted-foreground">{resource.readTime}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleSave(resource.id) }}
                              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                            >
                              <Bookmark className={`h-3.5 w-3.5 ${isResourceSaved(resource.id) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                            </button>
                            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedResource === resource.id ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedResource === resource.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 border-t border-border/50 pt-3">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                {resource.content.split("\n").map((paragraph, i) => {
                                  if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                                    return <h3 key={i} className="text-sm font-bold mt-3 mb-1">{paragraph.replace(/\*\*/g, "")}</h3>
                                  }
                                  if (paragraph.startsWith("- ")) {
                                    return <p key={i} className="text-xs text-muted-foreground ml-3 mb-0.5">{paragraph}</p>
                                  }
                                  if (paragraph.trim() === "") return <br key={i} />
                                  return <p key={i} className="text-xs text-muted-foreground leading-relaxed mb-2">{paragraph.replace(/\*\*(.*?)\*\*/g, "$1")}</p>
                                })}
                              </div>
                              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/50">
                                {resource.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">#{tag}</span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
