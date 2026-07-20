"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ModuleKey } from "@/lib/resources"
import { MODULE_RESOURCES, getResourcesByTracker } from "@/lib/resources"

interface ResourcesModalProps {
  open: boolean
  onClose: () => void
  moduleKey?: ModuleKey
  trackerId?: string
  title?: string
}

const TYPE_ICONS: Record<string, string> = {
  guide: "📘",
  article: "📄",
  exercise: "🎯",
  template: "📋",
  prompt: "💭",
  framework: "🏗️",
  checklist: "☑️",
}

export function ResourcesModal({ open, onClose, moduleKey, trackerId, title }: ResourcesModalProps) {
  const data = moduleKey ? MODULE_RESOURCES[moduleKey] : null
  const trackerResources = trackerId ? getResourcesByTracker(trackerId) : []
  const resources = data?.resources || trackerResources
  const modalTitle = title || data?.title || "Resources"

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[85vh] bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-[#1E0E6B]/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E0E6B]/10">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-[#1E0E6B]/10 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-[#1E0E6B]" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">{modalTitle}</h2>
                  <p className="text-[11px] text-muted-foreground">{resources.length} resources</p>
                </div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Resources List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {resources.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No resources available yet.</p>
              ) : (
                resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group p-4 rounded-xl border border-[#1E0E6B]/8 hover:border-[#1E0E6B]/20 bg-white/50 dark:bg-white/[0.02] hover:bg-[#1E0E6B]/[0.02] transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5 shrink-0">{TYPE_ICONS[resource.type] || "📄"}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-[#1E0E6B] transition-colors leading-snug">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E0E6B]/8 text-[#1E0E6B] font-medium capitalize">
                            {resource.type}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                            {resource.difficulty}
                          </span>
                          {resource.readTime && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {resource.readTime}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#1E0E6B] transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-[#1E0E6B]/10 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
