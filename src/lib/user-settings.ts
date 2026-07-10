// User Settings Store — localStorage-backed with validation

export interface UserSettings {
  profile: ProfileSettings
  appearance: AppearanceSettings
  focusProductivity: FocusProductivitySettings
  calendarNotifications: CalendarNotificationSettings
  teoPreferences: TeoPreferencesSettings
}

export interface ProfileSettings {
  name: string
  username: string
  email: string
  birthday: string
  language: string
  avatar: string
  avatarFocalPoint: { x: number; y: number }
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  backgroundColor: string
}

export interface FocusProductivitySettings {
  autoFocusMode: boolean
  completionSound: boolean
  confirmBeforeDelete: boolean
  showProductivityScore: boolean
  enableDailyReview: boolean
  carryTasksForward: boolean
  showStreakCelebrations: boolean
  keyboardShortcuts: boolean
}

export interface CalendarNotificationSettings {
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd"
  weekStarts: "monday" | "sunday"
  reminders: {
    dailyReview: boolean
    habits: boolean
    goals: boolean
    projects: boolean
    calendar: boolean
    teo: boolean
  }
  marketing: {
    push: boolean
    email: boolean
    sms: boolean
  }
}

export interface TeoPreferencesSettings {
  enabled: boolean
  coachStyle: "friendly" | "direct" | "motivational" | "analytical"
  responseLength: "brief" | "balanced" | "detailed"
  morningBriefing: boolean
  eveningReview: boolean
  weeklyInsights: boolean
  voiceReplies: boolean
  proactiveSuggestions: boolean
  autoSummaries: boolean
  contextMemory: boolean
  dailyMotivation: boolean
  reflectionReminders: boolean
  coachingIntensity: "gentle" | "moderate" | "intensive"
}

const STORAGE_KEY = "intenteo-user-settings"

export function getDefaultUserSettings(): UserSettings {
  return {
    profile: {
      name: "",
      username: "",
      email: "",
      birthday: "",
      language: "English",
      avatar: "",
      avatarFocalPoint: { x: 0.5, y: 0.5 },
    },
    appearance: {
      theme: "system",
      backgroundColor: "#FAFBFF",
    },
    focusProductivity: {
      autoFocusMode: false,
      completionSound: true,
      confirmBeforeDelete: true,
      showProductivityScore: true,
      enableDailyReview: true,
      carryTasksForward: false,
      showStreakCelebrations: true,
      keyboardShortcuts: true,
    },
    calendarNotifications: {
      dateFormat: "dd/mm/yyyy",
      weekStarts: "monday",
      reminders: {
        dailyReview: true,
        habits: true,
        goals: true,
        projects: true,
        calendar: true,
        teo: true,
      },
      marketing: {
        push: false,
        email: false,
        sms: false,
      },
    },
    teoPreferences: {
      enabled: true,
      coachStyle: "friendly",
      responseLength: "balanced",
      morningBriefing: true,
      eveningReview: true,
      weeklyInsights: true,
      voiceReplies: false,
      proactiveSuggestions: true,
      autoSummaries: true,
      contextMemory: true,
      dailyMotivation: true,
      reflectionReminders: true,
      coachingIntensity: "moderate",
    },
  }
}

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultUserSettings()
    const parsed = JSON.parse(raw)
    const defaults = getDefaultUserSettings()
    return {
      profile: { ...defaults.profile, ...parsed.profile },
      appearance: { ...defaults.appearance, ...parsed.appearance },
      focusProductivity: { ...defaults.focusProductivity, ...parsed.focusProductivity },
      calendarNotifications: {
        ...defaults.calendarNotifications,
        ...parsed.calendarNotifications,
        reminders: { ...defaults.calendarNotifications.reminders, ...parsed.calendarNotifications?.reminders },
        marketing: { ...defaults.calendarNotifications.marketing, ...parsed.calendarNotifications?.marketing },
      },
      teoPreferences: { ...defaults.teoPreferences, ...parsed.teoPreferences },
    }
  } catch {
    return getDefaultUserSettings()
  }
}

export function saveUserSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function updateUserSettings(partial: Partial<UserSettings>): UserSettings {
  const current = loadUserSettings()
  const updated: UserSettings = {
    ...current,
    ...(partial.profile ? { profile: { ...current.profile, ...partial.profile } } : {}),
    ...(partial.appearance ? { appearance: { ...current.appearance, ...partial.appearance } } : {}),
    ...(partial.focusProductivity ? { focusProductivity: { ...current.focusProductivity, ...partial.focusProductivity } } : {}),
    ...(partial.calendarNotifications
      ? {
          calendarNotifications: {
            ...current.calendarNotifications,
            ...partial.calendarNotifications,
            ...(partial.calendarNotifications.reminders
              ? { reminders: { ...current.calendarNotifications.reminders, ...partial.calendarNotifications.reminders } }
              : {}),
            ...(partial.calendarNotifications.marketing
              ? { marketing: { ...current.calendarNotifications.marketing, ...partial.calendarNotifications.marketing } }
              : {}),
          },
        }
      : {}),
    ...(partial.teoPreferences ? { teoPreferences: { ...current.teoPreferences, ...partial.teoPreferences } } : {}),
  }
  saveUserSettings(updated)
  return updated
}

// ─── Validation ───

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: "Username must be at least 3 characters." }
  if (username.length > 20) return { valid: false, error: "Username must be 20 characters or fewer." }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: "Only letters, numbers, and underscores allowed." }
  return { valid: true }
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) return { valid: false, error: "Email is required." }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, error: "Invalid email format." }
  return { valid: true }
}

export function validateBirthday(birthday: string): { valid: boolean; error?: string } {
  if (!birthday) return { valid: true } // Optional
  const parts = birthday.split("/")
  if (parts.length !== 3) return { valid: false, error: "Use dd/mm/yyyy format." }
  const [day, month, year] = parts.map(Number)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return { valid: false, error: "Invalid date." }
  if (month < 1 || month > 12) return { valid: false, error: "Month must be 1–12." }
  if (day < 1 || day > 31) return { valid: false, error: "Day must be 1–31." }
  if (year < 1900 || year > new Date().getFullYear()) return { valid: false, error: "Invalid year." }
  return { valid: true }
}

// ─── Settings diff for dirty tracking ───

export function hasProfileChanges(current: ProfileSettings, saved: ProfileSettings): boolean {
  return (
    current.name !== saved.name ||
    current.username !== saved.username ||
    current.email !== saved.email ||
    current.birthday !== saved.birthday ||
    current.language !== saved.language ||
    current.avatar !== saved.avatar ||
    current.avatarFocalPoint.x !== saved.avatarFocalPoint.x ||
    current.avatarFocalPoint.y !== saved.avatarFocalPoint.y
  )
}

// ─── Delete Account ───

export function deleteAllUserData(): void {
  const keys = [
    STORAGE_KEY,
    "intenteo-security-settings",
    "intenteo-tasks",
    "intenteo-habits",
    "intenteo-goals",
    "intenteo-journal-entries",
    "intenteo-reminders",
    "intenteo-reviews",
    "intenteo-vision",
    "intenteo-notifications-read",
    "intenteo-habits-period",
    "intenteo-habits-view",
    "intenteo-journal-page-style",
    "intenteo-goals-projects",
    "theme",
  ]
  keys.forEach((key) => localStorage.removeItem(key))
}
