"use client"

import { formatDateDDMMYYYY } from "@/lib/date-utils"

export type GoalHealthState = "excellent" | "on_track" | "needs_attention" | "at_risk"
export type GoalLifecycleStage = "planning" | "active" | "building" | "on_track" | "near_completion" | "completed" | "archived"
export type GoalTrendDirection = "up" | "down" | "stable"

interface GoalMilestone { id: string; title: string; completed: boolean }
interface GoalProjectTask { id: string; title: string; completed: boolean; subtasks: { id: string; title: string; completed: boolean }[] }
interface GoalLinkedHabitWeight { habitId: string; habitName: string; weight: number }

export interface GoalData {
  id: string; title: string; description: string; category: string; customCategory?: string
  priority: "none" | "low" | "medium" | "high"; progress: number; deadline: string; startDate: string
  type: string; whyItMatters: string
  milestones: GoalMilestone[]; linkedHabits: string[]; linkedHabitWeights?: GoalLinkedHabitWeight[]
  notes: string; color: string; colorHex: string
  icon: string; trackingMethod: string
  weighting: { projects: number; habits: number; milestones: number; manual: number }
  timeline?: string; status?: string; habitCompletionRate?: number; lastActivity?: string
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
  near_completion: { label: "Near Completion", color: "text-purple-600", bg: "bg-purple-50" },
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
  const progress = g.progress
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
    { label: "Projects", points: projectPoints, max: 10, raw: `${projectPoints} / 10`, color: "bg-purple-500" },
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
  if (goal.progress >= 100) {
    items.push({ icon: "🎉", text: "Goal completed!" })
  } else if (goal.progress >= 50) {
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
  const w = g.weighting
  const totalWeight = w.projects + w.habits + w.milestones + w.manual
  if (totalWeight === 0) return g.progress
  const goalProjects = projects.filter(p => p.goalId === g.id)
  const projectScore = goalProjects.length > 0
    ? goalProjects.reduce((sum, p) => sum + calcProjectProgress(p), 0) / goalProjects.length
    : 0
  const milestoneScore = g.milestones.length > 0
    ? (g.milestones.filter(m => m.completed).length / g.milestones.length) * 100
    : 0
  let habitScore = 0
  if (g.linkedHabitWeights && g.linkedHabitWeights.length > 0) {
    const totalHabitWeight = g.linkedHabitWeights.reduce((s, h) => s + h.weight, 0)
    if (totalHabitWeight > 0) {
      habitScore = g.linkedHabitWeights.reduce((sum, lh) => {
        const habit = habits.find(h => h.id === lh.habitId || h.name === lh.habitName)
        const score = habit ? calcHabitScoreForGoalFn(habit) : 0
        return sum + (score * lh.weight / totalHabitWeight)
      }, 0)
    }
  } else if (g.linkedHabits.length > 0) {
    const linked = habits.filter(h => g.linkedHabits.includes(h.name))
    if (linked.length > 0) {
      habitScore = linked.reduce((sum, h) => sum + calcHabitScoreForGoalFn(h), 0) / linked.length
    }
  }
  const manualScore = g.progress
  return Math.round(
    (projectScore * w.projects + habitScore * w.habits + milestoneScore * w.milestones + manualScore * w.manual) / totalWeight
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

function calcMilestoneScore(g: GoalData): number {
  if (g.milestones.length === 0) return 0
  return Math.round((g.milestones.filter(m => m.completed).length / g.milestones.length) * 100)
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
