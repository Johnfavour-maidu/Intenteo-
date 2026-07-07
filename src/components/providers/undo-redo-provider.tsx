"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

interface UndoRedoState {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  pushState: (key: string, state: unknown) => void
  registerUndoable: (key: string, undoFn: () => void, redoFn: () => void) => void
}

const UndoRedoContext = createContext<UndoRedoState>({
  canUndo: false,
  canRedo: false,
  undo: () => {},
  redo: () => {},
  pushState: () => {},
  registerUndoable: () => {},
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

  return (
    <UndoRedoContext.Provider value={{ canUndo, canRedo, undo, redo, pushState, registerUndoable }}>
      {children}
    </UndoRedoContext.Provider>
  )
}
