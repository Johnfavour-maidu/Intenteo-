"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Search,
  Heart,
  Clock,
  Sparkles,
  Shuffle,
  ChevronDown,
  ChevronRight,
  PenLine,
  BookOpen,
  Target,
  Eye,
  Zap,
  Check,
} from "lucide-react"
import {
  INTENTION_LIBRARY,
  CATEGORY_META,
  type Intention,
  type IntentionCategory,
  getRecommendedIntentions,
  searchIntentions,
  toggleFavorite,
  loadFavorites,
  loadRecentlyUsed,
  addRecentlyUsed,
  saveTodayIntention,
  loadTodayIntention,
  shuffleArray,
  findLinkedGoals,
  findLinkedVisions,
  findLinkedPurpose,
  getDateLabel,
} from "@/lib/intention-library"

type TabKey = "library" | "write" | "favorites" | "recent"

interface IntentionLibraryProps {
  onSelect?: (intention: string, isCustom: boolean) => void
  compact?: boolean
}

export function IntentionLibrary({ onSelect, compact }: IntentionLibraryProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("library")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategory, setExpandedCategory] = useState<IntentionCategory | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyUsed, setRecentlyUsed] = useState(loadRecentlyUsed())
  const [customText, setCustomText] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<Intention[]>([])
  const [showFrameworkLinks, setShowFrameworkLinks] = useState<string | null>(null)
  const [shuffledRecs, setShuffledRecs] = useState<Intention[]>([])

  useEffect(() => {
    setFavorites(loadFavorites())
    setRecentlyUsed(loadRecentlyUsed())
    setRecommendations(getRecommendedIntentions())
    setShuffledRecs(shuffleArray(getRecommendedIntentions()).slice(0, 3))
  }, [])

  const handleToggleFavorite = useCallback((id: string) => {
    setFavorites(toggleFavorite(id))
  }, [])

  const handleSelect = useCallback((text: string, isCustom: boolean) => {
    saveTodayIntention(text, isCustom)
    addRecentlyUsed(text, isCustom)
    setSelectedId(text)
    onSelect?.(text, isCustom)
  }, [onSelect])

  const handleShuffle = useCallback(() => {
    setShuffledRecs(shuffleArray(recommendations).slice(0, 3))
  }, [recommendations])

  const handleCustomSubmit = useCallback(() => {
    const text = customText.trim()
    if (!text) return
    handleSelect(text, true)
    setCustomText("")
  }, [customText, handleSelect])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchIntentions(searchQuery)
  }, [searchQuery])

  const tabs = [
    { key: "library" as TabKey, label: "Library", icon: BookOpen },
    { key: "write" as TabKey, label: "Write Your Own", icon: PenLine },
    { key: "favorites" as TabKey, label: "Favorites", icon: Heart },
    { key: "recent" as TabKey, label: "Recently Used", icon: Clock },
  ]

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-white/60 dark:bg-gray-900/60 rounded-xl border border-[#1E0E6B]/10">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center",
                activeTab === tab.key
                  ? "bg-[#1E0E6B] text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-[#1E0E6B]/5"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Library Tab */}
      {activeTab === "library" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search intentions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10"
            />
          </div>

          {/* Search Results */}
          {searchQuery.trim() && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for &ldquo;{searchQuery}&rdquo;
              </p>
              {searchResults.map(intention => (
                <IntentionCard
                  key={intention.id}
                  intention={intention}
                  isSelected={selectedId === intention.text}
                  isFavorite={favorites.includes(intention.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={handleSelect}
                  onShowFramework={setShowFrameworkLinks}
                  showFrameworkLinks={showFrameworkLinks}
                />
              ))}
            </div>
          )}

          {/* No Search — Show sections */}
          {!searchQuery.trim() && (
            <>
              {/* Recommended For You */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#EB9E5B]" />
                    <span className="text-sm font-semibold text-[#1E0E6B]">Recommended For You</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShuffle}
                    className="h-7 px-2 text-xs"
                  >
                    <Shuffle className="h-3.5 w-3.5 mr-1" />
                    Shuffle
                  </Button>
                </div>

                {/* Today's Suggestion (shuffle card) */}
                {shuffledRecs.length > 0 && (
                  <Card className="bg-gradient-to-br from-[#1E0E6B]/5 to-[#EB9E5B]/5 border-[#1E0E6B]/10">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-wider text-[#1E0E6B]/60 font-semibold mb-2">Today&apos;s Suggestion</p>
                      <p className="text-lg font-medium text-[#1E0E6B] mb-3">&ldquo;{shuffledRecs[0].text}&rdquo;</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSelect(shuffledRecs[0].text, false)}
                          className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
                        >
                          Choose
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleShuffle}
                          className="border-[#1E0E6B]/20"
                        >
                          <Shuffle className="h-3.5 w-3.5 mr-1" />
                          Shuffle Again
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Recommended list */}
                <div className="space-y-2">
                  {shuffledRecs.map(intention => (
                    <IntentionCard
                      key={intention.id}
                      intention={intention}
                      isSelected={selectedId === intention.text}
                      isFavorite={favorites.includes(intention.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelect={handleSelect}
                      onShowFramework={setShowFrameworkLinks}
                      showFrameworkLinks={showFrameworkLinks}
                    />
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                {(Object.keys(CATEGORY_META) as IntentionCategory[]).map(cat => {
                  const meta = CATEGORY_META[cat]
                  const catIntentions = INTENTION_LIBRARY.filter(i => i.category === cat)
                  const isExpanded = expandedCategory === cat

                  return (
                    <div key={cat}>
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-[#1E0E6B]/10 hover:bg-white/80 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{meta.icon}</span>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-[#1E0E6B]">{meta.label}</p>
                            <p className="text-[11px] text-muted-foreground">{meta.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">{catIntentions.length}</Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 pt-2 pl-4">
                              {catIntentions.map(intention => (
                                <IntentionCard
                                  key={intention.id}
                                  intention={intention}
                                  isSelected={selectedId === intention.text}
                                  isFavorite={favorites.includes(intention.id)}
                                  onToggleFavorite={handleToggleFavorite}
                                  onSelect={handleSelect}
                                  onShowFramework={setShowFrameworkLinks}
                                  showFrameworkLinks={showFrameworkLinks}
                                  compact
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Write Your Own Tab */}
      {activeTab === "write" && (
        <div className="space-y-4">
          <Card className="bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-[#1E0E6B]/60 font-semibold mb-3">Write Your Own</p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#1E0E6B] font-medium mb-2">Today I will...</p>
                  <Textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Start typing..."
                    className="min-h-[100px] bg-transparent border-[#1E0E6B]/15 focus:border-[#1E0E6B] text-[#1E0E6B]"
                  />
                </div>
                <Button
                  onClick={handleCustomSubmit}
                  disabled={!customText.trim()}
                  className="bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
                >
                  Set This Intention
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="space-y-3">
          {favorites.length === 0 ? (
            <Card className="bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10">
              <CardContent className="p-8 text-center">
                <Heart className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No favorites yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Tap the heart on any intention to save it here.</p>
              </CardContent>
            </Card>
          ) : (
            favorites.map(id => {
              const intention = INTENTION_LIBRARY.find(i => i.id === id)
              if (!intention) return null
              return (
                <IntentionCard
                  key={id}
                  intention={intention}
                  isSelected={selectedId === intention.text}
                  isFavorite={true}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={handleSelect}
                  onShowFramework={setShowFrameworkLinks}
                  showFrameworkLinks={showFrameworkLinks}
                />
              )
            })
          )}
        </div>
      )}

      {/* Recently Used Tab */}
      {activeTab === "recent" && (
        <div className="space-y-3">
          {recentlyUsed.length === 0 ? (
            <Card className="bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10">
              <CardContent className="p-8 text-center">
                <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No recent intentions.</p>
                <p className="text-xs text-muted-foreground mt-1">Your previously chosen intentions will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentlyUsed.slice(0, 15).map((item) => (
                <Card
                  key={item.id}
                  className={cn(
                    "bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10 cursor-pointer hover:bg-white/80 transition-all",
                    selectedId === item.text && "ring-2 ring-[#EB9E5B]"
                  )}
                  onClick={() => handleSelect(item.text, item.isCustom)}
                >
                  <CardContent className="p-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#1E0E6B]/60 font-semibold mb-1">
                      {getDateLabel(item.selectedAt)}
                    </p>
                    <p className="text-sm text-[#1E0E6B] font-medium">&ldquo;{item.text}&rdquo;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Intention Card Sub-Component ──
interface IntentionCardProps {
  intention: Intention
  isSelected: boolean
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onSelect: (text: string, isCustom: boolean) => void
  onShowFramework: (id: string | null) => void
  showFrameworkLinks: string | null
  compact?: boolean
}

function IntentionCard({
  intention,
  isSelected,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onShowFramework,
  showFrameworkLinks,
  compact,
}: IntentionCardProps) {
  const [linkedGoals, setLinkedGoals] = useState<{ id: string; title: string }[]>([])
  const [linkedVisions, setLinkedVisions] = useState<{ id: string; title: string }[]>([])
  const [linkedPurpose, setLinkedPurpose] = useState<string | null>(null)

  const isFrameworkOpen = showFrameworkLinks === intention.id

  const handleToggleFramework = useCallback(() => {
    if (isFrameworkOpen) {
      onShowFramework(null)
    } else {
      setLinkedGoals(findLinkedGoals(intention))
      setLinkedVisions(findLinkedVisions(intention))
      setLinkedPurpose(findLinkedPurpose(intention))
      onShowFramework(intention.id)
    }
  }, [intention, isFrameworkOpen, onShowFramework])

  const hasFrameworkLinks = linkedGoals.length > 0 || linkedVisions.length > 0 || linkedPurpose

  return (
    <Card
      className={cn(
        "bg-white/60 dark:bg-gray-900/60 border-[#1E0E6B]/10 transition-all",
        isSelected && "ring-2 ring-[#EB9E5B] border-[#EB9E5B]/30",
        "hover:bg-white/80"
      )}
    >
      <CardContent className={cn("flex items-start gap-3", compact ? "p-3" : "p-4")}>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[#1E0E6B] font-medium", compact ? "text-sm" : "text-[15px]")}>
            &ldquo;{intention.text}&rdquo;
          </p>

          {/* Framework connection toggle */}
          <button
            onClick={handleToggleFramework}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-[#1E0E6B]/50 hover:text-[#1E0E6B]/70 transition-colors"
          >
            <Target className="h-3 w-3" />
            <span>Supports your framework</span>
            {isFrameworkOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {/* Framework Links */}
          <AnimatePresence>
            {isFrameworkOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-[#1E0E6B]/10">
                  {linkedGoals.length > 0 && linkedGoals.map(g => (
                    <div key={g.id} className="flex items-center gap-1.5 text-[11px]">
                      <Target className="h-3 w-3 text-[#1E0E6B]" />
                      <span className="text-muted-foreground">Goal:</span>
                      <span className="text-[#1E0E6B] font-medium">{g.title}</span>
                    </div>
                  ))}
                  {linkedVisions.length > 0 && linkedVisions.map(v => (
                    <div key={v.id} className="flex items-center gap-1.5 text-[11px]">
                      <Eye className="h-3 w-3 text-[#EB9E5B]" />
                      <span className="text-muted-foreground">Vision:</span>
                      <span className="text-[#1E0E6B] font-medium">{v.title}</span>
                    </div>
                  ))}
                  {linkedPurpose && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Zap className="h-3 w-3 text-purple-500" />
                      <span className="text-muted-foreground">Purpose:</span>
                      <span className="text-[#1E0E6B] font-medium truncate">{linkedPurpose}</span>
                    </div>
                  )}
                  {!hasFrameworkLinks && (
                    <p className="text-[11px] text-muted-foreground italic">
                      No direct framework matches. Set goals and visions to see connections.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleFavorite(intention.id)}
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              isFavorite
                ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                : "text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>

          <Button
            size="sm"
            onClick={() => onSelect(intention.text, false)}
            className={cn(
              "h-7 px-3 text-xs",
              isSelected
                ? "bg-[#EB9E5B] hover:bg-[#EB9E5B]/90 text-white"
                : "bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
            )}
          >
            {isSelected ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1" />
                Chosen
              </>
            ) : (
              "Choose"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
