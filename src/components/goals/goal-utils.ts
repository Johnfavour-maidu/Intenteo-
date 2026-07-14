"use client"

import { formatDateDDMMYYYY } from "@/lib/date-utils"

export type GoalHealthState = "excellent" | "on_track" | "needs_attention" | "at_risk"
export type GoalLifecycleStage = "planning" | "active" | "building" | "on_track" | "near_completion" | "completed" | "archived"
export type GoalTrendDirection = "up" | "down" | "stable"

export type ProgressStrategy = "balanced" | "milestone-focused" | "habit-focused" | "milestones-only" | "habits-only" | "custom"

export const PROGRESS_STRATEGIES: { value: ProgressStrategy; label: string; milestoneWeight: number; habitWeight: number }[] = [
  { value: "balanced", label: "Balanced", milestoneWeight: 50, habitWeight: 50 },
  { value: "milestone-focused", label: "Milestone Focused", milestoneWeight: 70, habitWeight: 30 },
  { value: "habit-focused", label: "Habit Focused", milestoneWeight: 30, habitWeight: 70 },
  { value: "milestones-only", label: "Milestones Only", milestoneWeight: 100, habitWeight: 0 },
  { value: "habits-only", label: "Habits Only", milestoneWeight: 0, habitWeight: 100 },
  { value: "custom", label: "Custom", milestoneWeight: 50, habitWeight: 50 },
]

interface GoalMilestone { id: string; title: string; completed: boolean; weight?: number }
interface GoalProjectTask { id: string; title: string; completed: boolean; subtasks: { id: string; title: string; completed: boolean }[] }
interface GoalLinkedHabitWeight { habitId: string; habitName: string; weight: number }

export interface GoalData {
  id: string; title: string; description: string; category: string; customCategory?: string
  priority: "none" | "low" | "medium" | "high"; progress: number; deadline: string; startDate: string
  type: string; whyItMatters: string
  milestones: GoalMilestone[]; linkedHabits: string[]; linkedHabitWeights?: GoalLinkedHabitWeight[]
  notes: string; color: string; colorHex: string
  icon: string; trackingMethod: string
  weighting?: { milestones: number; habits: number }
  progressStrategy?: ProgressStrategy
  milestoneWeight?: number
  habitWeight?: number
  timeline?: string; status?: string; timeHorizon?: string; visionId?: string
  habitCompletionRate?: number; lastActivity?: string
  linkedValueIds?: string[]; heroImage?: string
  createdAt: string; updatedAt: string
}

export interface GoalProject {
  id: string; name: string; status: string; progress: number; priority: string
  tasks: GoalProjectTask[]; colorHex: string; icon: string; goalId: string
}

export interface GoalHabit {
  id: string; name: string; color: string; colorHex: string; icon: string
  completions: Record<string, { completed: boolean; time?: string; notes?: string }>
  streak: number; habitScore: number; createdAt?: string
}

export const GOAL_HEALTH_CONFIG: Record<GoalHealthState, { label: string; color: string; bg: string; icon: string }> = {
  excellent: { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🟢" },
  on_track: { label: "On Track", color: "text-blue-600", bg: "bg-blue-50", icon: "🔵" },
  needs_attention: { label: "Needs Attention", color: "text-amber-600", bg: "bg-amber-50", icon: "🟡" },
  at_risk: { label: "At Risk", color: "text-red-600", bg: "bg-red-50", icon: "🔴" },
}

export const GOAL_LIFECYCLE_CONFIG: Record<GoalLifecycleStage, { label: string; color: string; bg: string }> = {
  planning: { label: "Planning", color: "text-gray-500", bg: "bg-gray-100" },
  active: { label: "Active", color: "text-blue-600", bg: "bg-blue-50" },
  building: { label: "Building", color: "text-emerald-600", bg: "bg-emerald-50" },
  on_track: { label: "On Track", color: "text-teal-600", bg: "bg-teal-50" },
  near_completion: { label: "Near Completion", color: "text-[#1E0E6B]", bg: "bg-purple-50" },
  completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50" },
  archived: { label: "Archived", color: "text-gray-400", bg: "bg-gray-50" },
}

export const GOAL_TREND_CONFIG: Record<GoalTrendDirection, { label: string; icon: string; color: string }> = {
  up: { label: "Improving", icon: "↑", color: "text-emerald-500" },
  down: { label: "Declining", icon: "↓", color: "text-red-500" },
  stable: { label: "Stable", icon: "→", color: "text-muted-foreground" },
}

function getDaysRemaining(dl: string): number {
  return Math.max(0, Math.ceil((new Date(dl).getTime() - Date.now()) / 86400000))
}

function getTotalDays(sd: string, dl: string): number {
  return Math.max(1, Math.ceil((new Date(dl).getTime() - new Date(sd).getTime()) / 86400000))
}

function calcProjectProgress(p: GoalProject): number {
  if (p.tasks.length === 0) return p.progress
  return Math.round((p.tasks.filter(t => t.completed).length / p.tasks.length) * 100)
}

export function calcGoalHealth(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): GoalHealthState {
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const deadlineScore = calcDeadlineScore(goal.deadline, goal.startDate)
  const habitScore = calcLinkedHabitScore(goal, habits)
  const projectScore = calcProjectScore(goal, projects)
  const milestoneScore = calcMilestoneScore(goal)
  const consistency = calcGoalConsistency(goal)
  const total = progress * 0.4 + deadlineScore * 0.15 + habitScore * 0.15 + projectScore * 0.1 + milestoneScore * 0.1 + consistency * 0.1
  if (total >= 80) return "excellent"
  if (total >= 60) return "on_track"
  if (total >= 35) return "needs_attention"
  return "at_risk"
}

export function calcLifecycleStage(g: GoalData): GoalLifecycleStage {
  if (g.status === "archived") return "archived"
  if (g.status === "completed") return "completed"
  const progress = calcGoalProgressForHealth(g, [], [])
  const milestones = g.milestones
  const completedMilestones = milestones.filter(m => m.completed).length
  const totalMilestones = milestones.length || 1
  if (progress === 0 && completedMilestones === 0) return "planning"
  if (progress < 25) return "active"
  if (progress < 50) return "building"
  if (progress < 75) return "on_track"
  if (progress < 100) return "near_completion"
  return "completed"
}

export function calcTrend(
  goal: GoalData,
  projects: GoalProject[],
): GoalTrendDirection {
  const now = Date.now()
  const created = new Date(goal.startDate || goal.createdAt).getTime()
  const elapsed = Math.max(1, now - created)
  const totalSpan = new Date(goal.deadline).getTime() - created
  const expectedPace = totalSpan > 0 ? elapsed / totalSpan : 0.5
  const progress = totalSpan > 0 ? calcGoalProgressForHealth(goal, projects, []) / 100 : 0
  if (progress >= expectedPace * 1.15) return "up"
  if (progress <= expectedPace * 0.85) return "down"
  return "stable"
}

export function generateSmartNextAction(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): string {
  const daysRemaining = getDaysRemaining(goal.deadline)
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const overdue = new Date(goal.deadline) < new Date()

  if (goal.status === "completed") return "✓ This goal is complete. Review your progress and celebrate!"
  if (goal.status === "archived") return "This goal is archived. Reactivate if needed."

  if (overdue && progress < 100) {
    return "⚠ Overdue — assess if deadline needs adjustment or reprioritize"
  }

  if (daysRemaining <= 7 && progress < 90) {
    return `🔥 Only ${daysRemaining} day${daysRemaining > 1 ? "s" : ""} left — focus on completing remaining milestones`
  }

  if (daysRemaining <= 30 && progress < 50) {
    return `⏰ ${daysRemaining} days remaining — accelerate progress on key milestones`
  }

  if (progress === 0) {
    const firstMilestone = goal.milestones[0]
    if (firstMilestone) return `🎯 Start with: "${firstMilestone.title}"`
    const firstProject = projects.find(p => p.goalId === goal.id)
    if (firstProject) return `🎯 Kick off project: ${firstProject.name}`
    return "✨ Break this goal into smaller milestones to get started"
  }

  if (progress < 25) {
    const incompleteMilestones = goal.milestones.filter(m => !m.completed)
    if (incompleteMilestones.length > 0) {
      return `🎯 Next milestone: "${incompleteMilestones[0].title}"`
    }
    return "📋 Define your next milestone to move forward"
  }

  if (progress >= 75 && progress < 100) {
    const remainingMilestones = goal.milestones.filter(m => !m.completed)
    if (remainingMilestones.length > 0) {
      return `🏁 ${remainingMilestones.length} milestone${remainingMilestones.length > 1 ? "s" : ""} remaining — push to the finish line`
    }
    return "🏁 Close to completion — finalize remaining tasks"
  }

  const goalProjects = projects.filter(p => p.goalId === goal.id)
  const incompleteProjects = goalProjects.filter(p => p.status !== "completed")
  if (incompleteProjects.length > 0) {
    return `📋 Work on project: ${incompleteProjects[0].name} (${calcProjectProgress(incompleteProjects[0])}% done)`
  }

  return `📈 Stay consistent — review ${goal.title} weekly`
}

export function generateCoaching(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): string[] {
  const tips: string[] = []
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const daysRemaining = getDaysRemaining(goal.deadline)
  const overdue = new Date(goal.deadline) < new Date()
  const health = calcGoalHealth(goal, projects, habits)
  const goalProjects = projects.filter(p => p.goalId === goal.id)
  const incompleteMilestones = goal.milestones.filter(m => !m.completed)
  const completedMilestones = goal.milestones.filter(m => m.completed)

  if (health === "excellent") {
    tips.push("You're on fire! Keep the momentum going.")
    tips.push("Consider setting stretch goals within this area.")
  }

  if (health === "on_track" || health === "needs_attention") {
    if (progress < 50) {
      tips.push("Break down large goals into weekly sprints for faster progress.")
    }
    if (goalProjects.length > 0 && goalProjects.some(p => p.status === "active" && calcProjectProgress(p) < 50)) {
      tips.push("Focus on completing one project at a time rather than multitasking.")
    }
    if (goal.linkedHabits.length > 0) {
      tips.push("Completing linked habits consistently boosts your goal progress.")
    }
  }

  if (health === "at_risk") {
    tips.push("Reassess this goal — is the scope realistic given your timeline?")
    tips.push("Reduce scope or extend deadline rather than abandoning the goal.")
    if (goal.milestones.length === 0) {
      tips.push("Add milestones to create clear progress checkpoints.")
    }
  }

  if (overdue && progress < 100) {
    tips.push("Overdue goals drain motivation. Either recommit or redefine.")
  }

  if (goal.milestones.length > 0 && incompleteMilestones.length > 0) {
    tips.push(`Complete "${incompleteMilestones[0].title}" to build momentum.`)
  }

  if (completedMilestones.length > 0 && completedMilestones.length % 2 === 0) {
    tips.push("Great milestone progress! Reward yourself for staying on track.")
  }

  if (daysRemaining > 180) {
    tips.push("Long timeline — set quarterly check-ins to stay accountable.")
  }

  if (tips.length === 0) {
    tips.push("Stay steady — consistent effort compounds over time.")
  }
  return tips.slice(0, 4)
}

export function getGoalScoreBreakdown(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): { label: string; points: number; max: number; raw: string; color: string }[] {
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const deadlineScore = calcDeadlineScore(goal.deadline, goal.startDate)
  const habitScore = calcLinkedHabitScore(goal, habits)
  const projectScore = calcProjectScore(goal, projects)
  const milestoneScore = calcMilestoneScore(goal)
  const consistency = calcGoalConsistency(goal)

  const progressPoints = Math.round(progress * 0.4)
  const deadlinePoints = Math.round(deadlineScore * 0.15)
  const habitPoints = Math.round(habitScore * 0.15)
  const projectPoints = Math.round(projectScore * 0.1)
  const milestonePoints = Math.round(milestoneScore * 0.1)
  const consistencyPoints = Math.round(consistency * 0.1)

  return [
    { label: "Progress", points: progressPoints, max: 40, raw: `${progressPoints} / 40`, color: "bg-emerald-500" },
    { label: "Deadline", points: deadlinePoints, max: 15, raw: `${deadlinePoints} / 15`, color: "bg-blue-500" },
    { label: "Linked Habits", points: habitPoints, max: 15, raw: `${habitPoints} / 15`, color: "bg-orange-500" },
    { label: "Projects", points: projectPoints, max: 10, raw: `${projectPoints} / 10`, color: "bg-[#1E0E6B]" },
    { label: "Milestones", points: milestonePoints, max: 10, raw: `${milestonePoints} / 10`, color: "bg-teal-500" },
    { label: "Consistency", points: consistencyPoints, max: 10, raw: `${consistencyPoints} / 10`, color: "bg-pink-500" },
  ]
}

export function buildGoalJourney(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): { icon: string; text: string }[] {
  const items: { icon: string; text: string }[] = []
  const created = goal.createdAt ? new Date(goal.createdAt) : null
  if (created) {
    items.push({ icon: "🎯", text: `Goal set ${formatDateDDMMYYYY(goal.createdAt!.split("T")[0])}` })
  }
  const completedMilestones = goal.milestones.filter(m => m.completed)
  if (completedMilestones.length > 0) {
    items.push({ icon: "🏁", text: `${completedMilestones.length} milestone${completedMilestones.length > 1 ? "s" : ""} completed` })
  }
  const goalProjects = projects.filter(p => p.goalId === goal.id)
  const completedProjects = goalProjects.filter(p => p.status === "completed")
  if (completedProjects.length > 0) {
    items.push({ icon: "📦", text: `${completedProjects.length} project${completedProjects.length > 1 ? "s" : ""} completed` })
  }
  if (goal.linkedHabits.length > 0) {
    const linkedHabits = habits.filter(h => goal.linkedHabits.includes(h.name))
    const avgHabitScore = linkedHabits.length > 0
      ? Math.round(linkedHabits.reduce((s, h) => s + (h.habitScore || 0), 0) / linkedHabits.length)
      : 0
    if (avgHabitScore > 0) {
      items.push({ icon: "🔄", text: `${linkedHabits.length} habit${linkedHabits.length > 1 ? "s" : ""} supporting (avg ${avgHabitScore}%)` })
    }
  }
  if (calcGoalProgressForHealth(goal, projects, habits) >= 100) {
    items.push({ icon: "🎉", text: "Goal completed!" })
  } else if (calcGoalProgressForHealth(goal, projects, habits) >= 50) {
    items.push({ icon: "📈", text: "More than halfway there — keep pushing" })
  }
  if (goal.lastActivity) {
    const lastActive = new Date(goal.lastActivity)
    items.push({ icon: "⚡", text: `Last activity ${formatDateDDMMYYYY(goal.lastActivity!.split("T")[0])}` })
  }
  return items
}

export function detectCelebration(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): { show: boolean; milestone: string; progress: number } | null {
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const milestones = [25, 50, 75, 100]
  for (const m of milestones) {
    if (progress >= m && progress < m + 5) {
      return { show: true, milestone: `${m}%`, progress: m }
    }
  }
  return null
}

export function getGoalHealthScore(
  goal: GoalData,
  projects: GoalProject[],
  habits: GoalHabit[],
): number {
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const deadlineScore = calcDeadlineScore(goal.deadline, goal.startDate)
  const habitScore = calcLinkedHabitScore(goal, habits)
  const projectScore = calcProjectScore(goal, projects)
  const milestoneScore = calcMilestoneScore(goal)
  const consistency = calcGoalConsistency(goal)
  return Math.round(
    progress * 0.4 + deadlineScore * 0.15 + habitScore * 0.15 + projectScore * 0.1 + milestoneScore * 0.1 + consistency * 0.1
  )
}

function calcGoalProgressForHealth(g: GoalData, projects: GoalProject[], habits: GoalHabit[]): number {
  const { milestoneWeight, habitWeight } = resolveGoalWeights(g)
  const totalWeight = milestoneWeight + habitWeight
  if (totalWeight === 0) return 0
  const milestoneScore = calcMilestoneScore(g)
  const habitScore = calcHabitScoreForGoalData(g, habits)
  return Math.round(
    (milestoneScore * milestoneWeight + habitScore * habitWeight) / totalWeight
  )
}

function calcHabitScoreForGoalFn(habit: GoalHabit): number {
  const today = new Date().toISOString().split("T")[0]
  const completions = habit.completions || {}
  const completedDays = Object.keys(completions).filter(k => completions[k]?.completed).length
  const created = new Date(habit.createdAt || Date.now())
  const now = new Date()
  const totalDays = Math.max(1, Math.ceil((now.getTime() - created.getTime()) / 86400000))
  return Math.min(100, Math.round((completedDays / totalDays) * 100))
}

function calcDeadlineScore(deadline: string, startDate: string): number {
  const total = getTotalDays(startDate || deadline, deadline)
  const remaining = getDaysRemaining(deadline)
  const elapsed = total - remaining
  if (elapsed <= 0) return 100
  const ratio = Math.min(1, remaining / Math.max(1, total))
  return Math.round(ratio * 100)
}

function calcLinkedHabitScore(g: GoalData, habits: GoalHabit[]): number {
  if (g.linkedHabits.length === 0) return 50
  const linked = habits.filter(h => g.linkedHabits.includes(h.name))
  if (linked.length === 0) return 30
  const avg = linked.reduce((s, h) => s + (h.habitScore || 0), 0) / linked.length
  return Math.round(avg)
}

function calcProjectScore(g: GoalData, projects: GoalProject[]): number {
  const goalProjects = projects.filter(p => p.goalId === g.id)
  if (goalProjects.length === 0) return 0
  return Math.round(goalProjects.reduce((s, p) => s + calcProjectProgress(p), 0) / goalProjects.length)
}

export function calcMilestoneScore(g: GoalData): number {
  const ms = g.milestones || []
  if (ms.length === 0) return 0
  const totalWeight = ms.reduce((s, m) => s + (m.weight ?? 0), 0)
  if (totalWeight === 0) {
    const completed = ms.filter(m => m.completed).length
    return Math.round((completed / ms.length) * 100)
  }
  const completedWeight = ms.filter(m => m.completed).reduce((s, m) => s + (m.weight ?? 0), 0)
  return Math.round((completedWeight / totalWeight) * 100)
}

export function calcHabitScoreForGoalData(g: GoalData, habits: GoalHabit[]): number {
  if (g.linkedHabitWeights && g.linkedHabitWeights.length > 0) {
    const totalHabitWeight = g.linkedHabitWeights.reduce((s, h) => s + h.weight, 0)
    if (totalHabitWeight > 0) {
      return g.linkedHabitWeights.reduce((sum, lh) => {
        const habit = habits.find(h => h.id === lh.habitId || h.name === lh.habitName)
        const score = habit ? calcHabitScoreForGoalFn(habit) : 0
        return sum + (score * lh.weight / totalHabitWeight)
      }, 0)
    }
  } else if (g.linkedHabits.length > 0) {
    const linked = habits.filter(h => g.linkedHabits.includes(h.name))
    if (linked.length > 0) {
      return linked.reduce((sum, h) => sum + calcHabitScoreForGoalFn(h), 0) / linked.length
    }
  }
  return 0
}

export function resolveGoalWeights(g: GoalData): { milestoneWeight: number; habitWeight: number } {
  if (g.progressStrategy && g.progressStrategy !== "custom") {
    const cfg = PROGRESS_STRATEGIES.find(s => s.value === g.progressStrategy)
    if (cfg) return { milestoneWeight: cfg.milestoneWeight, habitWeight: cfg.habitWeight }
  }
  if (g.progressStrategy === "custom" && g.milestoneWeight != null && g.habitWeight != null) {
    return { milestoneWeight: g.milestoneWeight, habitWeight: g.habitWeight }
  }
  if (g.weighting && (g.weighting.milestones > 0 || g.weighting.habits > 0)) {
    return { milestoneWeight: g.weighting.milestones, habitWeight: g.weighting.habits }
  }
  const hasM = (g.milestones?.length || 0) > 0
  const hasH = (g.linkedHabitWeights?.length || 0) > 0 || (g.linkedHabits?.length || 0) > 0
  if (hasM && !hasH) return { milestoneWeight: 100, habitWeight: 0 }
  if (!hasM && hasH) return { milestoneWeight: 0, habitWeight: 100 }
  return { milestoneWeight: 50, habitWeight: 50 }
}

export function calcGoalProgress(g: GoalData, projects: GoalProject[], habits: GoalHabit[]): number {
  return calcGoalProgressForHealth(g, projects, habits)
}

function calcGoalConsistency(g: GoalData): number {
  if (!g.lastActivity || !g.createdAt) return 0
  const created = new Date(g.createdAt).getTime()
  const now = Date.now()
  const elapsed = Math.max(1, now - created)
  const lastActive = new Date(g.lastActivity).getTime()
  const daysSinceActive = Math.max(0, now - lastActive) / 86400000
  const recency = Math.max(0, 1 - daysSinceActive / 30)
  return Math.round(recency * 100)
}

export interface ValueAlignment {
  score: number
  label: string
  color: string
  linkedCount: number
  totalValues: number
}

export function calcValueAlignment(goal: GoalData, totalCoreValues: number): ValueAlignment {
  const linkedCount = (goal as any).linkedValueIds?.length || 0
  if (totalCoreValues === 0 || linkedCount === 0) {
    return { score: 0, label: "No Values Linked", color: "text-muted-foreground", linkedCount, totalValues: totalCoreValues }
  }
  const score = Math.round((linkedCount / Math.max(1, totalCoreValues)) * 100)
  if (score >= 50) return { score, label: "Strongly Aligned", color: "text-emerald-600", linkedCount, totalValues: totalCoreValues }
  if (score >= 25) return { score, label: "Well Aligned", color: "text-blue-600", linkedCount, totalValues: totalCoreValues }
  if (score >= 10) return { score, label: "Partially Aligned", color: "text-amber-600", linkedCount, totalValues: totalCoreValues }
  return { score, label: "Weakly Aligned", color: "text-red-600", linkedCount, totalValues: totalCoreValues }
}

/* ─── Phase 5: Visualization & Motivation Engine ─── */

export interface GoalForecast {
  predictedDate: string | null
  daysAhead: number
  onTrack: boolean
  pace: "ahead" | "on-pace" | "behind" | "stalled"
  paceLabel: string
}

export function calcGoalForecast(goal: GoalData, projects: GoalProject[], habits: GoalHabit[]): GoalForecast {
  const now = Date.now()
  const created = new Date(goal.startDate || goal.createdAt).getTime()
  const deadline = new Date(goal.deadline).getTime()
  const elapsed = Math.max(1, now - created)
  const progress = calcGoalProgressForHealth(goal, projects, habits) / 100

  if (progress <= 0 || progress >= 1) {
    return {
      predictedDate: progress >= 1 ? goal.deadline : null,
      daysAhead: 0,
      onTrack: progress >= 1,
      pace: progress >= 1 ? "ahead" : "stalled",
      paceLabel: progress >= 1 ? "Completed" : "Not started",
    }
  }

  const totalSpan = deadline - created
  const expectedPace = elapsed / totalSpan
  const actualPace = progress
  const paceRatio = actualPace / Math.max(0.001, expectedPace)

  let pace: GoalForecast["pace"]
  let paceLabel: string
  if (paceRatio >= 1.15) { pace = "ahead"; paceLabel = "Ahead of schedule" }
  else if (paceRatio >= 0.85) { pace = "on-pace"; paceLabel = "On pace" }
  else if (paceRatio >= 0.3) { pace = "behind"; paceLabel = "Behind schedule" }
  else { pace = "stalled"; paceLabel = "Needs attention" }

  const msPerUnit = elapsed / progress
  const remainingMs = msPerUnit * (1 - progress)
  const predictedMs = now + remainingMs
  const predictedDate = new Date(predictedMs).toISOString().split("T")[0]
  const daysAhead = Math.round((deadline - predictedMs) / 86400000)

  return { predictedDate, daysAhead, onTrack: predictedMs <= deadline, pace, paceLabel }
}

export interface GoalProbability {
  score: number
  label: string
  color: string
  factors: { label: string; impact: "positive" | "negative" | "neutral" }[]
}

export function calcCompletionProbability(goal: GoalData, projects: GoalProject[], habits: GoalHabit[]): GoalProbability {
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const daysRemaining = getDaysRemaining(goal.deadline)
  const totalDays = getTotalDays(goal.startDate, goal.deadline)
  const daysElapsed = totalDays - daysRemaining
  const timeUsedPct = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0
  const health = calcGoalHealth(goal, projects, habits)
  const trend = calcTrend(goal, projects)

  let score = 50
  const factors: GoalProbability["factors"] = []

  if (progress >= 75) { score += 20; factors.push({ label: "Strong progress", impact: "positive" }) }
  else if (progress >= 50) { score += 10; factors.push({ label: "Good progress", impact: "positive" }) }
  else if (progress < 20) { score -= 15; factors.push({ label: "Low progress", impact: "negative" }) }

  if (trend === "up") { score += 15; factors.push({ label: "Momentum building", impact: "positive" }) }
  else if (trend === "down") { score -= 15; factors.push({ label: "Momentum fading", impact: "negative" }) }

  if (daysRemaining <= 0 && progress < 100) { score -= 30; factors.push({ label: "Overdue", impact: "negative" }) }
  else if (daysRemaining <= 14 && progress < 50) { score -= 10; factors.push({ label: "Deadline crunch", impact: "negative" }) }
  else if (daysRemaining > 60) { score += 5; factors.push({ label: "Ample time", impact: "positive" }) }

  if (health === "excellent") { score += 10; factors.push({ label: "Excellent health", impact: "positive" }) }
  else if (health === "at_risk") { score -= 10; factors.push({ label: "At risk", impact: "negative" }) }

  if (goal.milestones.length > 0) {
    const completedMilestones = goal.milestones.filter(m => m.completed).length
    const milestonePct = (completedMilestones / goal.milestones.length) * 100
    if (milestonePct > timeUsedPct + 10) { score += 5; factors.push({ label: "Ahead on milestones", impact: "positive" }) }
    else if (milestonePct < timeUsedPct - 20) { score -= 5; factors.push({ label: "Behind on milestones", impact: "negative" }) }
  }

  if (goal.linkedHabits.length > 0) {
    const linked = habits.filter(h => goal.linkedHabits.includes(h.name))
    if (linked.length > 0) {
      const avgScore = linked.reduce((s, h) => s + (h.habitScore || 0), 0) / linked.length
      if (avgScore >= 80) { score += 5; factors.push({ label: "Strong habit support", impact: "positive" }) }
      else if (avgScore < 40) { score -= 5; factors.push({ label: "Weak habit support", impact: "negative" }) }
    }
  }

  score = Math.max(0, Math.min(100, score))

  let label: string, color: string
  if (score >= 80) { label = "Very Likely"; color = "text-emerald-600" }
  else if (score >= 60) { label = "Likely"; color = "text-blue-600" }
  else if (score >= 40) { label = "Uncertain"; color = "text-amber-600" }
  else { label = "At Risk"; color = "text-red-600" }

  return { score, label, color, factors: factors.slice(0, 5) }
}

export interface GoalMomentum {
  direction: "building" | "steady" | "fading" | "stalled"
  label: string
  icon: string
  color: string
  description: string
}

export function calcGoalMomentum(goal: GoalData, projects: GoalProject[], habits: GoalHabit[]): GoalMomentum {
  const trend = calcTrend(goal, projects)
  const health = calcGoalHealth(goal, projects, habits)
  const daysSinceActivity = goal.lastActivity
    ? Math.floor((Date.now() - new Date(goal.lastActivity).getTime()) / 86400000)
    : 999
  const consistency = calcGoalConsistency(goal)

  if (trend === "up" && consistency >= 70) {
    return { direction: "building", label: "Building", icon: "🔥", color: "text-orange-500", description: "Strong momentum — keep the fire burning!" }
  }
  if (trend === "up" || (trend === "stable" && consistency >= 50)) {
    return { direction: "steady", label: "Steady", icon: "➡️", color: "text-blue-500", description: "Steady progress — consistency is key." }
  }
  if (trend === "down" || daysSinceActivity > 14) {
    return { direction: "fading", label: "Fading", icon: "📉", color: "text-amber-500", description: "Momentum is dropping — take action today." }
  }
  return { direction: "stalled", label: "Stalled", icon: "⏸️", color: "text-red-500", description: "No recent activity — reignite your progress." }
}

const MOTIVATIONAL_QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", author: "Zig Ziglar" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "What we think, we become.", author: "Buddha" },
  { text: "Faith is taking the first step even when you don't see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
]

export function getMotivationalQuote(goal: GoalData): { text: string; author: string } {
  const hash = goal.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return MOTIVATIONAL_QUOTES[hash % MOTIVATIONAL_QUOTES.length]
}

export function getMotivationalNudge(goal: GoalData, projects: GoalProject[], habits: GoalHabit[]): string {
  const health = calcGoalHealth(goal, projects, habits)
  const trend = calcTrend(goal, projects)
  const daysRemaining = getDaysRemaining(goal.deadline)
  const progress = calcGoalProgressForHealth(goal, projects, habits)
  const momentum = calcGoalMomentum(goal, projects, habits)

  if (progress >= 100) return "You did it! Take a moment to celebrate this achievement."
  if (momentum.direction === "building") return "You're on fire! Ride this wave of momentum."
  if (momentum.direction === "fading") return "Small steps count. Even 15 minutes today keeps you moving."
  if (momentum.direction === "stalled") return "Restarting is not failing. Begin again today."
  if (daysRemaining <= 7 && progress < 80) return "Final stretch! Give it everything you've got."
  if (health === "at_risk") return "Reassess and adjust — every setback is a setup for a comeback."
  if (trend === "down") return "Tough times don't last. Tough people do. Keep going."
  return "Consistency over intensity. Show up for your goals daily."
}
