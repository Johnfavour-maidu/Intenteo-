"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles } from "lucide-react"

export interface Toast {
  id: string
  message: string
  subtext?: string
}

const teoMessages = [
  { message: "Way to go!", subtext: "You\u2019re crushing your goals today." },
  { message: "Fantastic progress!", subtext: "One more step toward your Future Self." },
  { message: "Amazing work.", subtext: "Consistency beats perfection." },
  { message: "Well done!", subtext: "You\u2019re living with intentionality." },
  { message: "Great job!", subtext: "Keep building the life you envisioned." },
  { message: "Beautiful work.", subtext: "Your Future Self is proud." },
  { message: "That\u2019s the spirit.", subtext: "Intentional action compounds." },
  { message: "On fire today.", subtext: "Momentum is everything." },
]

let toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message?: string, subtext?: string) => {
    const msg = message || teoMessages[Math.floor(Math.random() * teoMessages.length)].message
    const sub = subtext || teoMessages[Math.floor(Math.random() * teoMessages.length)].subtext
    const id = `toast-${++toastCounter}`
    setToasts((prev) => [...prev, { id, message: msg, subtext: sub }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="pointer-events-auto w-80 rounded-2xl border border-white/20 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl shadow-xl p-4"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.message}</p>
          {toast.subtext && (
            <p className="text-xs text-muted-foreground mt-0.5">{toast.subtext}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
