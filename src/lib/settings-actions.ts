"use client"

import { loadUserSettings } from "./user-settings"
import { playPreviewSound, getSelectedSound } from "./reminder-sounds"

/* ─── Completion Sound ─── */

export function playCompletionSoundIfEnabled(): void {
  try {
    const settings = loadUserSettings()
    if (!settings.focusProductivity.completionSound) return
    if (typeof window === "undefined") return
    const soundId = getSelectedSound()
    playPreviewSound(soundId)
  } catch {}
}

/* ─── Carry Tasks Forward ─── */

export function carryUnfinishedTasksForward(): void {
  try {
    const settings = loadUserSettings()
    if (!settings.focusProductivity.carryTasksForward) return
    if (typeof window === "undefined") return

    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    const raw = localStorage.getItem("intenteo-tasks")
    if (!raw) return
    const tasks = JSON.parse(raw) as any[]

    const carriedKey = `intenteo-carried-${today}`
    if (localStorage.getItem(carriedKey)) return

    const incompleteYesterday = tasks.filter((t: any) => {
      if (t.completed) return false
      if (t.recurrence === "daily") {
        const dc = t.dailyCompletions || {}
        return dc[yesterday] === false || (!dc[yesterday] && t.date === yesterday)
      }
      return t.date === yesterday
    })

    if (incompleteYesterday.length === 0) return

    const newTasks = incompleteYesterday.map((t: any) => ({
      ...t,
      id: `carry-${Date.now()}-${t.id}`,
      date: today,
      completed: false,
      dailyCompletions: undefined,
      createdAt: new Date().toISOString(),
    }))

    localStorage.setItem("intenteo-tasks", JSON.stringify([...tasks, ...newTasks]))
    localStorage.setItem(carriedKey, "true")
  } catch {}
}

/* ─── Keyboard Shortcuts ─── */

let shortcutHandlers: (() => void)[] = []

export function registerKeyboardShortcuts(router: { push: (path: string) => void }): () => void {
  const settings = loadUserSettings()
  if (!settings.focusProductivity.keyboardShortcuts) return () => {}

  const handler = (e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable
    if (isInput) return

    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault()
          router.push("/tasks")
          break
        case "j":
          e.preventDefault()
          router.push("/journal")
          break
        case "h":
          e.preventDefault()
          router.push("/habits")
          break
        case "g":
          e.preventDefault()
          router.push("/goals")
          break
        case "t":
          e.preventDefault()
          router.push("/")
          break
        case "/":
          e.preventDefault()
          document.dispatchEvent(new CustomEvent("intenteo:open-search"))
          break
      }
    }

    if (e.key === "Escape") {
      document.dispatchEvent(new CustomEvent("intenteo:close-modal"))
    }
  }

  document.addEventListener("keydown", handler)
  shortcutHandlers.push(() => document.removeEventListener("keydown", handler))

  return () => {
    document.removeEventListener("keydown", handler)
    shortcutHandlers = shortcutHandlers.filter(h => h !== (() => document.removeEventListener("keydown", handler)))
  }
}

/* ─── Daily Review Check ─── */

export function shouldShowDailyReview(): boolean {
  try {
    const settings = loadUserSettings()
    if (!settings.focusProductivity.enableDailyReview) return false
    if (typeof window === "undefined") return false

    const today = new Date().toISOString().split("T")[0]
    const reviewedKey = `intenteo-daily-reviewed-${today}`
    if (localStorage.getItem(reviewedKey)) return false

    const hour = new Date().getHours()
    return hour >= 18 || (hour < 6)
  } catch {
    return false
  }
}

export function markDailyReviewDone(): void {
  const today = new Date().toISOString().split("T")[0]
  localStorage.setItem(`intenteo-daily-reviewed-${today}`, "true")
}

/* ─── Streak Celebration Check ─── */

export function shouldShowStreakCelebrations(): boolean {
  try {
    const settings = loadUserSettings()
    return settings.focusProductivity.showStreakCelebrations
  } catch {
    return true
  }
}

/* ─── Intent Score Visibility ─── */

export function isIntentScoreVisible(): boolean {
  try {
    const settings = loadUserSettings()
    return settings.focusProductivity.showProductivityScore
  } catch {
    return true
  }
}

/* ─── Settings Getter (re-usable) ─── */

export function getFocusSettings() {
  try {
    return loadUserSettings().focusProductivity
  } catch {
    return {
      autoFocusMode: false,
      completionSound: true,
      confirmBeforeDelete: true,
      showProductivityScore: true,
      enableDailyReview: true,
      carryTasksForward: false,
      showStreakCelebrations: true,
      keyboardShortcuts: true,
    }
  }
}
