"use client"

import React, { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, AlertTriangle } from "lucide-react"

export interface SettingsToast {
  id: string
  message: string
  type: "success" | "error"
}

let toastCounter = 0

export function useSettingsToast() {
  const [toasts, setToasts] = useState<SettingsToast[]>([])

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = `settings-toast-${++toastCounter}`
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export function SettingsToastContainer({ toasts, onRemove }: { toasts: SettingsToast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <SettingsToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function SettingsToastItem({ toast, onRemove }: { toast: SettingsToast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500)
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
        <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${toast.type === "success" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
          {toast.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
        <p className="flex-1 text-sm font-medium">{toast.message}</p>
        <button onClick={() => onRemove(toast.id)} className="shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}
