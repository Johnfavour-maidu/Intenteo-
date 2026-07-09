"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Undo2, X } from "lucide-react"

interface SnackbarEntry {
  id: number
  message: string
  onUndo: () => void
}

interface UndoRedoState {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  pushState: (key: string, state: unknown) => void
  registerUndoable: (key: string, undoFn: () => void, redoFn: () => void) => void
  showUndoSnackbar: (message: string, onUndo: () => void) => void
}

const UndoRedoContext = createContext<UndoRedoState>({
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  pushState: () => {},
  registerUndoable: () => {},
  showUndoSnackbar: () => {},
})

export function useUndoRedo() {
  return useContext(UndoRedoContext)
}

interface HistoryEntry {
  undoFn: () => void
  redoFn: () => void
}

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [pointer, setPointer] = useState(-1)
  const pendingRef = useRef<{ key: string; undoFn: () => void; redoFn: () => void } | null>(null)
  const [snackbars, setSnackbars] = useState<SnackbarEntry[]>([])
  const snackbarIdRef = useRef(0)

  const canUndo = pointer >= 0
  const canRedo = pointer < history.length - 1

  const pushState = useCallback((_key: string, _state: unknown) => {
    // Legacy interface — no-op now that we use registerUndoable
  }, [])

  const registerUndoable = useCallback((key: string, undoFn: () => void, redoFn: () => void) => {
    pendingRef.current = { key, undoFn, redoFn }
    setHistory(prev => {
      const trimmed = prev.slice(0, pointer + 1)
      return [...trimmed, { undoFn, redoFn }]
    })
    setPointer(prev => prev + 1)
  }, [pointer])

  const undo = useCallback(() => {
    setPointer(prev => {
      if (prev < 0) return prev
      const entry = history[prev]
      if (entry) entry.undoFn()
      return prev - 1
    })
  }, [history])

  const redo = useCallback(() => {
    setPointer(prev => {
      if (prev >= history.length - 1) return prev
      const next = prev + 1
      const entry = history[next]
      if (entry) entry.redoFn()
      return next
    })
  }, [history])

  const showUndoSnackbar = useCallback((message: string, onUndo: () => void) => {
    const id = ++snackbarIdRef.current
    setSnackbars(prev => [...prev, { id, message, onUndo }])
    setTimeout(() => {
      setSnackbars(prev => prev.filter(s => s.id !== id))
    }, 5000)
  }, [])

  const dismissSnackbar = useCallback((id: number) => {
    setSnackbars(prev => prev.filter(s => s.id !== id))
  }, [])

  const handleUndoFromSnackbar = useCallback((id: number) => {
    const entry = snackbars.find(s => s.id === id)
    if (entry) {
      entry.onUndo()
      dismissSnackbar(id)
    }
  }, [snackbars, dismissSnackbar])

  // Global keyboard shortcuts: Ctrl+Z / Cmd+Z for undo, Ctrl+Shift+Z / Cmd+Shift+Z for redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey
      if (!isMod) return
      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [undo, redo])

  return (
    <UndoRedoContext.Provider value={{ canUndo, canRedo, undo, redo, pushState, registerUndoable, showUndoSnackbar }}>
      {children}

      {/* Undo Snackbar Stack */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {snackbars.map((snack) => (
            <motion.div
              key={snack.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#1E0E6B] text-white text-sm font-medium shadow-2xl min-w-[280px]"
            >
              <span className="flex-1">{snack.message}</span>
              <button
                onClick={() => handleUndoFromSnackbar(snack.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-xs font-semibold"
              >
                <Undo2 className="h-3 w-3" />
                Undo
              </button>
              <button
                onClick={() => dismissSnackbar(snack.id)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </UndoRedoContext.Provider>
  )
}
