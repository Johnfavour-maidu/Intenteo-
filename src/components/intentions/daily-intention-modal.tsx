"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Target, PenLine, X } from "lucide-react"
import { IntentionLibrary } from "./intention-library"
import { loadTodayIntention, saveTodayIntention, loadDismissed, saveDismissed } from "@/lib/intention-library"

interface DailyIntentionModalProps {
  onSelect?: (intention: string) => void
}

export function DailyIntentionModal({ onSelect }: DailyIntentionModalProps) {
  const [showModal, setShowModal] = useState(false)
  const [showLibrary, setShowLibrary] = useState(false)
  const [todayIntention, setTodayIntention] = useState<string | null>(null)

  useEffect(() => {
    const existing = loadTodayIntention()
    if (existing) {
      setTodayIntention(existing.intention.text)
      return
    }

    const dismissed = loadDismissed()
    const today = new Date().toISOString().split("T")[0]
    if (dismissed.includes(today)) return

    const timer = setTimeout(() => setShowModal(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleSelect = (intention: string) => {
    setTodayIntention(intention)
    setShowModal(false)
    setShowLibrary(false)
    onSelect?.(intention)
  }

  const handleDismiss = () => {
    const today = new Date().toISOString().split("T")[0]
    saveDismissed([...loadDismissed(), today])
    setShowModal(false)
  }

  const handleWriteOwn = () => {
    setShowLibrary(true)
  }

  // If already set today, show nothing
  if (todayIntention) return null

  // Dismissed
  const dismissed = loadDismissed()
  const today = new Date().toISOString().split("T")[0]
  if (dismissed.includes(today)) return null

  if (!showModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleDismiss()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg mx-4"
        >
          {!showLibrary ? (
            /* Morning Prompt */
            <Card className="bg-white dark:bg-gray-900 shadow-2xl border-[#1E0E6B]/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-[#1E0E6B]/10">
                      <Target className="h-5 w-5 text-[#1E0E6B]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1E0E6B]">Today&apos;s Intention</h3>
                  </div>
                  <button onClick={handleDismiss} className="p-1 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  Choose how you want to show up today.
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => setShowLibrary(true)}
                    className="w-full bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white h-11"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Choose Intention
                  </Button>
                  <Button
                    onClick={handleWriteOwn}
                    variant="outline"
                    className="w-full border-[#1E0E6B]/20 h-11"
                  >
                    <PenLine className="h-4 w-4 mr-2" />
                    Write My Own
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    className="w-full text-muted-foreground"
                  >
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Full Library */
            <Card className="bg-white dark:bg-gray-900 shadow-2xl border-[#1E0E6B]/10 max-h-[80vh] overflow-hidden">
              <CardContent className="p-0">
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 pb-3 border-b border-[#1E0E6B]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-[#1E0E6B]" />
                      <h3 className="text-lg font-semibold text-[#1E0E6B]">Set Today&apos;s Intention</h3>
                    </div>
                    <button
                      onClick={() => { setShowLibrary(false); handleDismiss() }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-4">
                  <IntentionLibrary onSelect={handleSelect} />
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
