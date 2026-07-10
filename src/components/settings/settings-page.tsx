"use client"

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Separator } from "@/components/ui/separator"
import { GradientButton } from "@/components/ui/gradient-button"
import { FocalPointPicker } from "./focal-point-picker"
import {
  User, Bell, Shield, Globe, Moon, Sun, Monitor,
  Lock, Key, Download, Trash2, Mail, Check, Camera,
  BookOpen, HelpCircle, LifeBuoy, Send,
  MessageSquare, Video, ExternalLink, AlertTriangle, Lightbulb, Search,
  ChevronDown, Laptop, Smartphone as Phone, Tablet,
  Cloud, RefreshCw, Eye, EyeOff, Fingerprint, Info,
} from "lucide-react"
import { useTheme } from "next-themes"
import { SettingsToastContainer, useSettingsToast } from "./settings-toast"
import { HelpCenter } from "./help-center"
import { ContactUs } from "./contact-us"
import { Community } from "./community"
import { AboutIntenteo } from "./about-intenteo"
import {
  loadSecuritySettings,
  changePassword,
  validatePasswordStrength,
  isBiometricAvailable,
  setBiometricEnabled,
  createPIN,
  changePIN,
  disablePIN,
  initCurrentDevice,
  removeDevice as removeDeviceAction,
  signOutAllDevices,
  connectAccount,
  disconnectAccount,
  toggleBackup,
  performBackup,
  exportData,
  updatePrivacySetting,
  type SecuritySettings,
  type DeviceInfo,
} from "@/lib/security-settings"
import {
  loadUserSettings,
  saveUserSettings,
  updateUserSettings,
  validateUsername,
  validateEmail,
  validateBirthday,
  hasProfileChanges,
  deleteAllUserData,
  type UserSettings,
  type ProfileSettings,
} from "@/lib/user-settings"
import { useUserProfile } from "@/lib/user-profile-context"

type SettingsTab = "profile" | "security" | "help"

function Section({ id, title, children, isOpen, onToggle, isHighlighted = false }: {
  id: string; title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; isHighlighted?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div ref={ref} id={id} className={`rounded-xl border transition-all duration-300 ${isHighlighted ? "border-primary shadow-md ring-2 ring-primary/20" : "border-border"}`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-xl">
        <h3 className="font-semibold text-sm">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  )
}

function ToggleRow({ label, desc, checked, onCheckedChange, id }: {
  label: string; desc?: string; checked: boolean; onCheckedChange: (v: boolean) => void; id?: string
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="font-medium text-sm">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function FieldRow({ label, value, onChange, placeholder, error, type = "text", disabled = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string; type?: string; disabled?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${error ? "border-red-500" : ""}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function SelectRow({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as SettingsTab | null
  const [activeTab, setActiveTab] = useState<SettingsTab>(tabParam || "profile")
  const [openSection, setOpenSection] = useState<string | null>("personal-info")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refresh: refreshProfile } = useUserProfile()

  const { toasts, addToast, removeToast } = useSettingsToast()

  // ─── User Settings (Profile + Appearance + Focus + Calendar + Teo) ───
  const [userSettings, setUserSettings] = useState<UserSettings>(() => loadUserSettings())
  const [savedUserSettings, setSavedUserSettings] = useState<UserSettings>(() => loadUserSettings())
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [profileSaving, setProfileSaving] = useState(false)

  // Profile form state
  const [profileName, setProfileName] = useState("")
  const [profileUsername, setProfileUsername] = useState("")
  const [profileEmail, setProfileEmail] = useState("")
  const [profileBirthday, setProfileBirthday] = useState("")
  const [profileLanguage, setProfileLanguage] = useState("English")
  const [profileAvatar, setProfileAvatar] = useState("")
  const [profileFocalPoint, setProfileFocalPoint] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 })
  const [focalPointOpen, setFocalPointOpen] = useState(false)
  const [pendingAvatarSrc, setPendingAvatarSrc] = useState("")

  // Profile validation
  const [nameError, setNameError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [birthdayError, setBirthdayError] = useState("")

  // Email change confirmation
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  // Appearance
  const [backgroundColor, setBackgroundColor] = useState("#FAFBFF")
  const [glassMode, setGlassMode] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  // Focus & Productivity
  const [autoFocusMode, setAutoFocusMode] = useState(false)
  const [completionSound, setCompletionSound] = useState(true)
  const [confirmBeforeDelete, setConfirmBeforeDelete] = useState(true)
  const [showProductivityScore, setShowProductivityScore] = useState(true)
  const [enableDailyReview, setEnableDailyReview] = useState(true)
  const [carryTasksForward, setCarryTasksForward] = useState(false)
  const [showStreakCelebrations, setShowStreakCelebrations] = useState(true)
  const [keyboardShortcuts, setKeyboardShortcuts] = useState(true)

  // Calendar & Notifications
  const [dateFormat, setDateFormat] = useState("dd/mm/yyyy")
  const [weekStarts, setWeekStarts] = useState("monday")
  const [reminderDailyReview, setReminderDailyReview] = useState(true)
  const [reminderHabits, setReminderHabits] = useState(true)
  const [reminderGoals, setReminderGoals] = useState(true)
  const [reminderProjects, setReminderProjects] = useState(true)
  const [reminderCalendar, setReminderCalendar] = useState(true)
  const [reminderTeo, setReminderTeo] = useState(true)
  const [marketingPush, setMarketingPush] = useState(false)
  const [marketingEmail, setMarketingEmail] = useState(false)
  const [marketingSms, setMarketingSms] = useState(false)

  // Teo Preferences
  const [teoEnabled, setTeoEnabled] = useState(true)
  const [teoCoachStyle, setTeoCoachStyle] = useState("friendly")
  const [teoResponseLength, setTeoResponseLength] = useState("balanced")
  const [teoMorningBriefing, setTeoMorningBriefing] = useState(true)
  const [teoEveningReview, setTeoEveningReview] = useState(true)
  const [teoWeeklyInsights, setTeoWeeklyInsights] = useState(true)
  const [teoVoiceReplies, setTeoVoiceReplies] = useState(false)
  const [teoProactiveSuggestions, setTeoProactiveSuggestions] = useState(true)
  const [teoAutoSummaries, setTeoAutoSummaries] = useState(true)
  const [teoContextMemory, setTeoContextMemory] = useState(true)
  const [teoDailyMotivation, setTeoDailyMotivation] = useState(true)
  const [teoReflectionReminders, setTeoReflectionReminders] = useState(true)
  const [teoCoachingIntensity, setTeoCoachingIntensity] = useState("moderate")

  // Security settings (existing)
  const [secSettings, setSecSettings] = useState<SecuritySettings>(() => loadSecuritySettings())
  const [devices, setDevices] = useState<DeviceInfo[]>([])
  const [signOutConfirm, setSignOutConfirm] = useState(false)

  // Password form
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState("")

  // Biometric
  const [bioAvailable, setBioAvailable] = useState<{ available: boolean; reason?: string }>({ available: false })
  const [bioLoading, setBioLoading] = useState(false)

  // PIN
  const [pinMode, setPinMode] = useState<"off" | "create" | "change" | "disable">("off")
  const [pinNew, setPinNew] = useState("")
  const [pinConfirm, setPinConfirm] = useState("")
  const [pinCurrent, setPinCurrent] = useState("")
  const [pinError, setPinError] = useState("")
  const [pinLoading, setPinLoading] = useState(false)

  // Delete Account
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2 | 3>(0)
  const [deletePassword, setDeletePassword] = useState("")

  // Stats modal
  const [statsOpen, setStatsOpen] = useState(false)

  // ─── Load settings on mount ───
  useEffect(() => {
    const s = loadUserSettings()
    setUserSettings(s)
    setSavedUserSettings(s)

    // Populate profile form
    setProfileName(s.profile.name)
    setProfileUsername(s.profile.username)
    setProfileEmail(s.profile.email)
    setProfileBirthday(s.profile.birthday)
    setProfileLanguage(s.profile.language)
    setProfileAvatar(s.profile.avatar)
    setProfileFocalPoint(s.profile.avatarFocalPoint || { x: 0.5, y: 0.5 })

    // Populate appearance
    setBackgroundColor(s.appearance.backgroundColor)
    setGlassMode(s.appearance.glassMode)
    setAnimations(s.appearance.animations)
    setCompactMode(s.appearance.compactMode)
    setReducedMotion(s.appearance.reducedMotion)
    setHighContrast(s.appearance.highContrast)

    // Populate focus
    setAutoFocusMode(s.focusProductivity.autoFocusMode)
    setCompletionSound(s.focusProductivity.completionSound)
    setConfirmBeforeDelete(s.focusProductivity.confirmBeforeDelete)
    setShowProductivityScore(s.focusProductivity.showProductivityScore)
    setEnableDailyReview(s.focusProductivity.enableDailyReview)
    setCarryTasksForward(s.focusProductivity.carryTasksForward)
    setShowStreakCelebrations(s.focusProductivity.showStreakCelebrations)
    setKeyboardShortcuts(s.focusProductivity.keyboardShortcuts)

    // Populate calendar
    setDateFormat(s.calendarNotifications.dateFormat)
    setWeekStarts(s.calendarNotifications.weekStarts)
    setReminderDailyReview(s.calendarNotifications.reminders.dailyReview)
    setReminderHabits(s.calendarNotifications.reminders.habits)
    setReminderGoals(s.calendarNotifications.reminders.goals)
    setReminderProjects(s.calendarNotifications.reminders.projects)
    setReminderCalendar(s.calendarNotifications.reminders.calendar)
    setReminderTeo(s.calendarNotifications.reminders.teo)
    setMarketingPush(s.calendarNotifications.marketing.push)
    setMarketingEmail(s.calendarNotifications.marketing.email)
    setMarketingSms(s.calendarNotifications.marketing.sms)

    // Populate Teo
    setTeoEnabled(s.teoPreferences.enabled)
    setTeoCoachStyle(s.teoPreferences.coachStyle)
    setTeoResponseLength(s.teoPreferences.responseLength)
    setTeoMorningBriefing(s.teoPreferences.morningBriefing)
    setTeoEveningReview(s.teoPreferences.eveningReview)
    setTeoWeeklyInsights(s.teoPreferences.weeklyInsights)
    setTeoVoiceReplies(s.teoPreferences.voiceReplies)
    setTeoProactiveSuggestions(s.teoPreferences.proactiveSuggestions)
    setTeoAutoSummaries(s.teoPreferences.autoSummaries)
    setTeoContextMemory(s.teoPreferences.contextMemory)
    setTeoDailyMotivation(s.teoPreferences.dailyMotivation)
    setTeoReflectionReminders(s.teoPreferences.reflectionReminders)
    setTeoCoachingIntensity(s.teoPreferences.coachingIntensity)

    setSettingsLoading(false)
  }, [])

  // ─── Tab handling ───
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam)
      if (tabParam === "security") setOpenSection("auth")
    }
  }, [tabParam])

  // ─── Security tab init ───
  useEffect(() => {
    if (activeTab === "security") {
      const s = loadSecuritySettings()
      setSecSettings(s)
      setDevices(s.devices)
      isBiometricAvailable().then(setBioAvailable)
      initCurrentDevice()
    }
  }, [activeTab])

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id)
  }

  // ─── Dirty tracking ───
  const isDirty = useMemo(() => {
    const profileDirty = hasProfileChanges(
      { name: profileName, username: profileUsername, email: profileEmail, birthday: profileBirthday, language: profileLanguage, avatar: profileAvatar, avatarFocalPoint: profileFocalPoint },
      savedUserSettings.profile
    )
    const appearanceDirty =
      backgroundColor !== savedUserSettings.appearance.backgroundColor ||
      glassMode !== savedUserSettings.appearance.glassMode ||
      animations !== savedUserSettings.appearance.animations ||
      compactMode !== savedUserSettings.appearance.compactMode ||
      reducedMotion !== savedUserSettings.appearance.reducedMotion ||
      highContrast !== savedUserSettings.appearance.highContrast
    const focusDirty =
      autoFocusMode !== savedUserSettings.focusProductivity.autoFocusMode ||
      completionSound !== savedUserSettings.focusProductivity.completionSound ||
      confirmBeforeDelete !== savedUserSettings.focusProductivity.confirmBeforeDelete ||
      showProductivityScore !== savedUserSettings.focusProductivity.showProductivityScore ||
      enableDailyReview !== savedUserSettings.focusProductivity.enableDailyReview ||
      carryTasksForward !== savedUserSettings.focusProductivity.carryTasksForward ||
      showStreakCelebrations !== savedUserSettings.focusProductivity.showStreakCelebrations ||
      keyboardShortcuts !== savedUserSettings.focusProductivity.keyboardShortcuts
    const calendarDirty =
      dateFormat !== savedUserSettings.calendarNotifications.dateFormat ||
      weekStarts !== savedUserSettings.calendarNotifications.weekStarts ||
      reminderDailyReview !== savedUserSettings.calendarNotifications.reminders.dailyReview ||
      reminderHabits !== savedUserSettings.calendarNotifications.reminders.habits ||
      reminderGoals !== savedUserSettings.calendarNotifications.reminders.goals ||
      reminderProjects !== savedUserSettings.calendarNotifications.reminders.projects ||
      reminderCalendar !== savedUserSettings.calendarNotifications.reminders.calendar ||
      reminderTeo !== savedUserSettings.calendarNotifications.reminders.teo ||
      marketingPush !== savedUserSettings.calendarNotifications.marketing.push ||
      marketingEmail !== savedUserSettings.calendarNotifications.marketing.email ||
      marketingSms !== savedUserSettings.calendarNotifications.marketing.sms
    const teoDirty =
      teoEnabled !== savedUserSettings.teoPreferences.enabled ||
      teoCoachStyle !== savedUserSettings.teoPreferences.coachStyle ||
      teoResponseLength !== savedUserSettings.teoPreferences.responseLength ||
      teoMorningBriefing !== savedUserSettings.teoPreferences.morningBriefing ||
      teoEveningReview !== savedUserSettings.teoPreferences.eveningReview ||
      teoWeeklyInsights !== savedUserSettings.teoPreferences.weeklyInsights ||
      teoVoiceReplies !== savedUserSettings.teoPreferences.voiceReplies ||
      teoProactiveSuggestions !== savedUserSettings.teoPreferences.proactiveSuggestions ||
      teoAutoSummaries !== savedUserSettings.teoPreferences.autoSummaries ||
      teoContextMemory !== savedUserSettings.teoPreferences.contextMemory ||
      teoDailyMotivation !== savedUserSettings.teoPreferences.dailyMotivation ||
      teoReflectionReminders !== savedUserSettings.teoPreferences.reflectionReminders ||
      teoCoachingIntensity !== savedUserSettings.teoPreferences.coachingIntensity
    return profileDirty || appearanceDirty || focusDirty || calendarDirty || teoDirty
  }, [
    profileName, profileUsername, profileEmail, profileBirthday, profileLanguage, profileAvatar, profileFocalPoint,
    backgroundColor, glassMode, animations, compactMode, reducedMotion, highContrast,
    autoFocusMode, completionSound, confirmBeforeDelete, showProductivityScore,
    enableDailyReview, carryTasksForward, showStreakCelebrations, keyboardShortcuts,
    dateFormat, weekStarts, reminderDailyReview, reminderHabits, reminderGoals,
    reminderProjects, reminderCalendar, reminderTeo, marketingPush, marketingEmail, marketingSms,
    teoEnabled, teoCoachStyle, teoResponseLength, teoMorningBriefing, teoEveningReview, teoWeeklyInsights,
    teoVoiceReplies, teoProactiveSuggestions, teoAutoSummaries, teoContextMemory,
    teoDailyMotivation, teoReflectionReminders, teoCoachingIntensity,
    savedUserSettings,
  ])

  // ─── Unsaved changes protection ───
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // ─── Validation on blur ───
  const validateProfileFields = useCallback(() => {
    const nameV = profileName.trim() ? "" : "Name is required."
    const usernameV = validateUsername(profileUsername).error || ""
    const emailV = validateEmail(profileEmail).error || ""
    const birthdayV = validateBirthday(profileBirthday).error || ""
    setNameError(nameV)
    setUsernameError(usernameV)
    setEmailError(emailV)
    setBirthdayError(birthdayV)
    return !nameV && !usernameV && !emailV && !birthdayV
  }, [profileName, profileUsername, profileEmail, profileBirthday])

  // ─── Save profile ───
  const handleSaveProfile = useCallback(async () => {
    if (!validateProfileFields()) {
      addToast("Please fix the errors before saving.", "error")
      return
    }
    setProfileSaving(true)
    try {
      // Simulate save delay for UX
      await new Promise((r) => setTimeout(r, 400))

      const updated = updateUserSettings({
        profile: {
          name: profileName.trim(),
          username: profileUsername.trim(),
          email: profileEmail.trim(),
          birthday: profileBirthday.trim(),
          language: profileLanguage,
          avatar: profileAvatar,
          avatarFocalPoint: profileFocalPoint,
        },
      })
      setSavedUserSettings(updated)
      setUserSettings(updated)
      refreshProfile()
      addToast("Profile updated successfully.")
    } catch {
      addToast("Unable to save changes. Please try again.", "error")
    } finally {
      setProfileSaving(false)
    }
  }, [profileName, profileUsername, profileEmail, profileBirthday, profileLanguage, profileAvatar, profileFocalPoint, validateProfileFields, addToast, refreshProfile])

  // ─── Save all non-profile settings (optimistic) ───
  const saveNonProfileSettings = useCallback(() => {
    const updated = updateUserSettings({
      appearance: { theme: (theme || "system") as "light" | "dark" | "system", backgroundColor, glassMode, animations, compactMode, reducedMotion, highContrast },
      focusProductivity: { autoFocusMode, completionSound, confirmBeforeDelete, showProductivityScore, enableDailyReview, carryTasksForward, showStreakCelebrations, keyboardShortcuts },
      calendarNotifications: { dateFormat: dateFormat as "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd", weekStarts: weekStarts as "monday" | "sunday", reminders: { dailyReview: reminderDailyReview, habits: reminderHabits, goals: reminderGoals, projects: reminderProjects, calendar: reminderCalendar, teo: reminderTeo }, marketing: { push: marketingPush, email: marketingEmail, sms: marketingSms } },
      teoPreferences: { enabled: teoEnabled, coachStyle: teoCoachStyle as "friendly" | "direct" | "motivational" | "analytical", responseLength: teoResponseLength as "brief" | "balanced" | "detailed", morningBriefing: teoMorningBriefing, eveningReview: teoEveningReview, weeklyInsights: teoWeeklyInsights, voiceReplies: teoVoiceReplies, proactiveSuggestions: teoProactiveSuggestions, autoSummaries: teoAutoSummaries, contextMemory: teoContextMemory, dailyMotivation: teoDailyMotivation, reflectionReminders: teoReflectionReminders, coachingIntensity: teoCoachingIntensity as "gentle" | "moderate" | "intensive" },
    })
    setSavedUserSettings(updated)
    setUserSettings(updated)
  }, [
    theme, backgroundColor, glassMode, animations, compactMode, reducedMotion, highContrast,
    autoFocusMode, completionSound, confirmBeforeDelete, showProductivityScore,
    enableDailyReview, carryTasksForward, showStreakCelebrations, keyboardShortcuts,
    dateFormat, weekStarts, reminderDailyReview, reminderHabits, reminderGoals,
    reminderProjects, reminderCalendar, reminderTeo, marketingPush, marketingEmail, marketingSms,
    teoEnabled, teoCoachStyle, teoResponseLength, teoMorningBriefing, teoEveningReview, teoWeeklyInsights,
    teoVoiceReplies, teoProactiveSuggestions, teoAutoSummaries, teoContextMemory,
    teoDailyMotivation, teoReflectionReminders, teoCoachingIntensity,
  ])

  // ─── Appearance: save immediately on change ───
  const handleThemeChange = useCallback((t: string) => {
    setTheme(t)
    setTimeout(() => saveNonProfileSettings(), 0)
  }, [setTheme, saveNonProfileSettings])

  const handleBackgroundColorChange = useCallback((c: string) => {
    setBackgroundColor(c)
    setTimeout(() => saveNonProfileSettings(), 0)
  }, [saveNonProfileSettings])

  // ─── Focus/Productivity: save immediately on toggle ───
  const handleFocusToggle = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value)
    setTimeout(() => saveNonProfileSettings(), 0)
  }, [saveNonProfileSettings])

  // ─── Calendar: save immediately on change ───
  const handleCalendarChange = useCallback((setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value)
    setTimeout(() => saveNonProfileSettings(), 0)
  }, [saveNonProfileSettings])

  // ─── Teo: save immediately on toggle ───
  const handleTeoToggle = useCallback((setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value)
    setTimeout(() => saveNonProfileSettings(), 0)
  }, [saveNonProfileSettings])

  // ─── Avatar handling ───
  const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      addToast("Please upload a JPG, PNG, or WEBP image.", "error")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result as string
      setPendingAvatarSrc(result)
      setFocalPointOpen(true)
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
    e.target.value = ""
  }, [addToast])

  const handleFocalPointSave = useCallback((focalPoint: { x: number; y: number }) => {
    setProfileAvatar(pendingAvatarSrc)
    setProfileFocalPoint(focalPoint)
    setFocalPointOpen(false)
    setPendingAvatarSrc("")
    addToast("Profile photo updated.")
  }, [pendingAvatarSrc, addToast])

  const handleFocalPointRemove = useCallback(() => {
    setProfileAvatar("")
    setProfileFocalPoint({ x: 0.5, y: 0.5 })
    setFocalPointOpen(false)
    setPendingAvatarSrc("")
    addToast("Profile photo removed.")
  }, [addToast])

  // ─── Email change confirmation ───
  const handleEmailChange = useCallback((newEmail: string) => {
    setProfileEmail(newEmail)
    const v = validateEmail(newEmail)
    setEmailError(v.error || "")
    if (newEmail && v.valid && newEmail !== savedUserSettings.profile.email) {
      setPendingEmail(newEmail)
      setEmailConfirmOpen(true)
    }
  }, [savedUserSettings.profile.email])

  const confirmEmailChange = useCallback(() => {
    setProfileEmail(pendingEmail)
    setEmailConfirmOpen(false)
    setPendingEmail("")
    addToast("Email updated. Please verify your new email address.")
  }, [pendingEmail, addToast])

  const cancelEmailChange = useCallback(() => {
    setProfileEmail(savedUserSettings.profile.email)
    setEmailConfirmOpen(false)
    setPendingEmail("")
  }, [savedUserSettings.profile.email])

  // ─── Delete Account ───
  const handleDeleteAccount = useCallback(() => {
    deleteAllUserData()
    setDeleteStep(0)
    setDeletePassword("")
    addToast("Account deleted. Redirecting...")
    setTimeout(() => { window.location.href = "/" }, 1500)
  }, [addToast])

  // ─── Password change ───
  const handlePasswordChange = useCallback(() => {
    setPwLoading(true)
    setPwError("")
    setTimeout(() => {
      const result = changePassword(pwCurrent, pwNew)
      if (result.success) {
        addToast("Password changed successfully.")
        setPwCurrent("")
        setPwNew("")
        setPwConfirm("")
      } else {
        setPwError(result.error || "Failed to change password.")
        addToast(result.error || "Unable to change password.", "error")
      }
      setPwLoading(false)
    }, 300)
  }, [pwCurrent, pwNew, addToast])

  // ─── PIN ───
  const handleCreatePIN = useCallback(() => {
    setPinLoading(true)
    setPinError("")
    setTimeout(() => {
      const result = createPIN(pinNew, pinConfirm)
      if (result.success) {
        addToast("PIN created successfully.")
        setPinMode("off")
        setPinNew("")
        setPinConfirm("")
      } else {
        setPinError(result.error || "Failed to create PIN.")
      }
      setPinLoading(false)
    }, 300)
  }, [pinNew, pinConfirm, addToast])

  const handleChangePIN = useCallback(() => {
    setPinLoading(true)
    setPinError("")
    setTimeout(() => {
      const result = changePIN(pinCurrent, pinNew, pinConfirm)
      if (result.success) {
        addToast("PIN changed successfully.")
        setPinMode("off")
        setPinNew("")
        setPinConfirm("")
        setPinCurrent("")
      } else {
        setPinError(result.error || "Failed to change PIN.")
      }
      setPinLoading(false)
    }, 300)
  }, [pinCurrent, pinNew, pinConfirm, addToast])

  const handleDisablePIN = useCallback(() => {
    setPinLoading(true)
    setPinError("")
    setTimeout(() => {
      const result = disablePIN(pinCurrent)
      if (result.success) {
        addToast("PIN disabled.")
        setPinMode("off")
        setPinCurrent("")
      } else {
        setPinError(result.error || "Failed to disable PIN.")
      }
      setPinLoading(false)
    }, 300)
  }, [pinCurrent, addToast])

  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-8 w-full bg-muted animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Customize your Intenteo experience</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as SettingsTab); if (v === "security") setOpenSection("auth") }} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Profile & Personalization</TabsTrigger>
          <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Privacy & Security</TabsTrigger>
          <TabsTrigger value="help"><LifeBuoy className="mr-2 h-4 w-4" />Help & Support</TabsTrigger>
        </TabsList>

        {/* ═══════════ TAB 1: PROFILE & PERSONALIZATION ═══════════ */}
        <TabsContent value="profile" className="mt-6 space-y-4">

          {/* Section 1: Personal Information */}
          <Section id="personal-info" title="Personal Information" isOpen={openSection === "personal-info"} onToggle={() => toggleSection("personal-info")}>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                {profileAvatar ? (
                  <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-border">
                    <img
                      src={profileAvatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      style={{ objectPosition: `${profileFocalPoint.x * 100}% ${profileFocalPoint.y * 100}%` }}
                    />
                  </div>
                ) : (
                  <UserAvatar size="lg" fallback={profileName ? profileName.charAt(0).toUpperCase() : "U"} />
                )}
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Camera className="h-3.5 w-3.5" /></button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="font-semibold">Profile Picture</p>
                <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP — click to choose focal point</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldRow label="Name" value={profileName} onChange={setProfileName} placeholder="Your name" error={nameError} />
              <FieldRow label="Username" value={profileUsername} onChange={setProfileUsername} placeholder="username" error={usernameError} />
              <FieldRow label="Email" value={profileEmail} onChange={handleEmailChange} placeholder="you@example.com" error={emailError} type="email" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Language</label>
                <select value={profileLanguage} onChange={(e) => setProfileLanguage(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>English</option>
                  <option>French</option>
                  <option>Spanish</option>
                </select>
              </div>
              <FieldRow label="Birthday" value={profileBirthday} onChange={setProfileBirthday} placeholder="dd/mm/yyyy" error={birthdayError} />
            </div>
            <div className="flex justify-end pt-2">
              <GradientButton size="sm" disabled={!isDirty} loading={profileSaving} loadingText="Saving..." onClick={handleSaveProfile}>
                Save Changes
              </GradientButton>
            </div>
          </Section>

          {/* Section 2: Appearance */}
          <Section id="appearance" title="Appearance" isOpen={openSection === "appearance"} onToggle={() => toggleSection("appearance")}>
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "light", icon: <Sun className="h-5 w-5" />, label: "Light" },
                  { value: "dark", icon: <Moon className="h-5 w-5" />, label: "Dark" },
                  { value: "system", icon: <Monitor className="h-5 w-5" />, label: "System" },
                ].map((t) => (
                  <Button key={t.value} variant={theme === t.value ? "default" : "outline"} className="h-auto py-3 flex flex-col items-center gap-1.5" onClick={() => handleThemeChange(t.value)}>
                    {t.icon}<span className="text-xs">{t.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Background Colour</label>
              <p className="text-xs text-muted-foreground mb-3">Choose a background colour for pages across the app</p>
              <div className="grid grid-cols-6 gap-2">
                {[
                  { value: "#FAFBFF", label: "Default", border: true },
                  { value: "#FFFFFF", label: "White", border: true },
                  { value: "#F3F0FF", label: "Lavender" },
                  { value: "#EFF6FF", label: "Sky" },
                  { value: "#F0FDFA", label: "Mint" },
                  { value: "#FFF7ED", label: "Peach" },
                  { value: "#FDF2F8", label: "Rose" },
                  { value: "#FFFBEB", label: "Cream" },
                  { value: "#F5F3FF", label: "Violet" },
                  { value: "#ECFDF5", label: "Emerald" },
                  { value: "#FEF2F2", label: "Blush" },
                  { value: "#F8FAFC", label: "Slate" },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleBackgroundColorChange(c.value)}
                    className={`group relative h-10 w-full rounded-lg border-2 transition-all hover:scale-105 ${backgroundColor === c.value ? "border-[#1E0E6B] ring-2 ring-[#1E0E6B]/20 scale-105" : "border-border hover:border-[#1E0E6B]/40"}`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {backgroundColor === c.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 rounded-full bg-[#1E0E6B] flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <ToggleRow id="glass-mode" label="Glass Mode" desc="Enable glassmorphism effects" checked={glassMode} onCheckedChange={(v) => handleFocusToggle(setGlassMode, v)} />
            <ToggleRow id="animations" label="Animations" desc="Enable smooth transitions" checked={animations} onCheckedChange={(v) => handleFocusToggle(setAnimations, v)} />
            <ToggleRow id="compact-mode" label="Compact Mode" desc="Reduce spacing for more content" checked={compactMode} onCheckedChange={(v) => handleFocusToggle(setCompactMode, v)} />
            <ToggleRow id="reduced-motion" label="Reduced Motion" desc="Minimize animations" checked={reducedMotion} onCheckedChange={(v) => handleFocusToggle(setReducedMotion, v)} />
            <ToggleRow id="high-contrast" label="High Contrast" desc="Increase contrast for accessibility" checked={highContrast} onCheckedChange={(v) => handleFocusToggle(setHighContrast, v)} />
          </Section>

          {/* Section 3: Focus & Productivity */}
          <Section id="focus-productivity" title="Focus & Productivity" isOpen={openSection === "focus-productivity"} onToggle={() => toggleSection("focus-productivity")}>
            <ToggleRow id="auto-focus" label="Automatically Enter Focus Mode" desc="Activate Focus Mode when a scheduled session begins" checked={autoFocusMode} onCheckedChange={(v) => handleFocusToggle(setAutoFocusMode, v)} />
            <ToggleRow id="completion-sound" label="Play Completion Sound" desc="Play a subtle sound when a task or habit is completed" checked={completionSound} onCheckedChange={(v) => handleFocusToggle(setCompletionSound, v)} />
            <ToggleRow id="confirm-delete" label="Confirm Before Deleting" desc="Ask before permanently deleting items" checked={confirmBeforeDelete} onCheckedChange={(v) => handleFocusToggle(setConfirmBeforeDelete, v)} />
            <ToggleRow id="carry-tasks" label="Carry Unfinished Tasks Forward" desc="Automatically move incomplete tasks to the next day" checked={carryTasksForward} onCheckedChange={(v) => handleFocusToggle(setCarryTasksForward, v)} />
            <ToggleRow id="daily-review" label="Enable Daily Review" desc="Show the end-of-day Review Today experience" checked={enableDailyReview} onCheckedChange={(v) => handleFocusToggle(setEnableDailyReview, v)} />
            <ToggleRow id="productivity-score" label="Show Productivity Score" desc="Display your daily score throughout the app" checked={showProductivityScore} onCheckedChange={(v) => handleFocusToggle(setShowProductivityScore, v)} />
            <ToggleRow id="streak-celebrations" label="Show Streak Celebrations" desc="Celebrate streak milestones and achievements" checked={showStreakCelebrations} onCheckedChange={(v) => handleFocusToggle(setShowStreakCelebrations, v)} />
            <ToggleRow id="keyboard-shortcuts" label="Keyboard Shortcuts" desc="Enable Ctrl+K, Ctrl+/, Ctrl+N shortcuts" checked={keyboardShortcuts} onCheckedChange={(v) => handleFocusToggle(setKeyboardShortcuts, v)} />
          </Section>

          {/* Section 4: Calendar & Notifications */}
          <Section id="calendar-notif" title="Calendar & Notifications" isOpen={openSection === "calendar-notif"} onToggle={() => toggleSection("calendar-notif")}>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Calendar</p>
              <div className="grid gap-4 md:grid-cols-2">
                <SelectRow label="Default Date Format" value={dateFormat} onChange={(v) => handleCalendarChange(setDateFormat, v)} options={[{ value: "dd/mm/yyyy", label: "dd/mm/yyyy" }, { value: "mm/dd/yyyy", label: "mm/dd/yyyy" }, { value: "yyyy-mm-dd", label: "yyyy-mm-dd" }]} />
                <SelectRow label="Week Starts" value={weekStarts} onChange={(v) => handleCalendarChange(setWeekStarts, v)} options={[{ value: "monday", label: "Monday" }, { value: "sunday", label: "Sunday" }]} />
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Reminders</p>
              <ToggleRow id="rem-daily-review" label="Daily Review" desc="Morning and evening prompts" checked={reminderDailyReview} onCheckedChange={(v) => handleFocusToggle(setReminderDailyReview, v)} />
              <ToggleRow id="rem-habits" label="Habits" desc="Habit completion reminders" checked={reminderHabits} onCheckedChange={(v) => handleFocusToggle(setReminderHabits, v)} />
              <ToggleRow id="rem-goals" label="Goals" desc="Goal progress updates" checked={reminderGoals} onCheckedChange={(v) => handleFocusToggle(setReminderGoals, v)} />
              <ToggleRow id="rem-projects" label="Projects" desc="Project deadline alerts" checked={reminderProjects} onCheckedChange={(v) => handleFocusToggle(setReminderProjects, v)} />
              <ToggleRow id="rem-calendar" label="Calendar" desc="Upcoming events and reminders" checked={reminderCalendar} onCheckedChange={(v) => handleFocusToggle(setReminderCalendar, v)} />
              <ToggleRow id="rem-teo" label="Téo" desc="AI coach notifications" checked={reminderTeo} onCheckedChange={(v) => handleFocusToggle(setReminderTeo, v)} />
            </div>
            <Separator />
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Marketing</p>
              <ToggleRow id="mkt-push" label="Push" desc="Product updates and tips" checked={marketingPush} onCheckedChange={(v) => handleFocusToggle(setMarketingPush, v)} />
              <ToggleRow id="mkt-email" label="Email" desc="Newsletter and announcements" checked={marketingEmail} onCheckedChange={(v) => handleFocusToggle(setMarketingEmail, v)} />
              <ToggleRow id="mkt-sms" label="SMS" desc="Critical alerts only" checked={marketingSms} onCheckedChange={(v) => handleFocusToggle(setMarketingSms, v)} />
            </div>
          </Section>

          {/* Section 5: Téo Preferences */}
          <Section id="teo-prefs" title="Téo Preferences" isOpen={openSection === "teo-prefs"} onToggle={() => toggleSection("teo-prefs")}>
            <ToggleRow id="teo-enabled" label="Enable Téo" desc="Receive personalized guidance from Téo" checked={teoEnabled} onCheckedChange={(v) => handleTeoToggle(setTeoEnabled, v)} />
            <SelectRow label="Coach Style" value={teoCoachStyle} onChange={(v) => handleCalendarChange(setTeoCoachStyle, v)} options={[{ value: "friendly", label: "Friendly" }, { value: "direct", label: "Direct" }, { value: "motivational", label: "Motivational" }, { value: "analytical", label: "Analytical" }]} />
            <SelectRow label="Response Length" value={teoResponseLength} onChange={(v) => handleCalendarChange(setTeoResponseLength, v)} options={[{ value: "brief", label: "Brief" }, { value: "balanced", label: "Balanced" }, { value: "detailed", label: "Detailed" }]} />
            <SelectRow label="Coaching Intensity" value={teoCoachingIntensity} onChange={(v) => handleCalendarChange(setTeoCoachingIntensity, v)} options={[{ value: "gentle", label: "Gentle" }, { value: "moderate", label: "Moderate" }, { value: "intensive", label: "Intensive" }]} />
            <ToggleRow id="teo-morning" label="Morning Briefing" desc="Daily morning insights from Téo" checked={teoMorningBriefing} onCheckedChange={(v) => handleTeoToggle(setTeoMorningBriefing, v)} />
            <ToggleRow id="teo-evening" label="Evening Review" desc="End-of-day reflection prompts" checked={teoEveningReview} onCheckedChange={(v) => handleTeoToggle(setTeoEveningReview, v)} />
            <ToggleRow id="teo-weekly" label="Weekly Insights" desc="Weekly progress summaries" checked={teoWeeklyInsights} onCheckedChange={(v) => handleTeoToggle(setTeoWeeklyInsights, v)} />
            <ToggleRow id="teo-motivation" label="Daily Motivation" desc="Receive daily motivational messages" checked={teoDailyMotivation} onCheckedChange={(v) => handleTeoToggle(setTeoDailyMotivation, v)} />
            <ToggleRow id="teo-reflection" label="Reflection Reminders" desc="Prompts for self-reflection" checked={teoReflectionReminders} onCheckedChange={(v) => handleTeoToggle(setTeoReflectionReminders, v)} />
            <ToggleRow id="teo-voice" label="Voice Replies" desc="Téo can respond with voice" checked={teoVoiceReplies} onCheckedChange={(v) => handleTeoToggle(setTeoVoiceReplies, v)} />
            <ToggleRow id="teo-proactive" label="Proactive Suggestions" desc="Téo suggests actions proactively" checked={teoProactiveSuggestions} onCheckedChange={(v) => handleTeoToggle(setTeoProactiveSuggestions, v)} />
            <ToggleRow id="teo-summaries" label="Auto Summaries" desc="Automatic daily and weekly summaries" checked={teoAutoSummaries} onCheckedChange={(v) => handleTeoToggle(setTeoAutoSummaries, v)} />
            <ToggleRow id="teo-memory" label="Context Memory" desc="Téo remembers your preferences" checked={teoContextMemory} onCheckedChange={(v) => handleTeoToggle(setTeoContextMemory, v)} />
          </Section>

          {/* Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" size="sm" className="text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteStep(1)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />Delete Account
            </Button>
          </div>
        </TabsContent>

        {/* ═══════════ TAB 2: PRIVACY & SECURITY ═══════════ */}
        <TabsContent value="security" className="mt-6 space-y-4">

          {/* 1. Authentication */}
          <Section id="auth" title="Authentication" isOpen={openSection === "auth"} onToggle={() => toggleSection("auth")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</p>
                <div className="space-y-2 max-w-md">
                  <input type="password" placeholder="Current password" value={pwCurrent} onChange={(e) => setPwCurrent(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="password" placeholder="New password" value={pwNew} onChange={(e) => setPwNew(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="password" placeholder="Confirm password" value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                  {pwNew && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(validatePasswordStrength(pwNew).score / 6) * 100}%`, backgroundColor: validatePasswordStrength(pwNew).color }} />
                      </div>
                      <span className="text-[10px]" style={{ color: validatePasswordStrength(pwNew).color }}>{validatePasswordStrength(pwNew).label}</span>
                    </div>
                  )}
                  {pwError && <p className="text-xs text-red-500">{pwError}</p>}
                </div>
                <Button size="sm" disabled={pwLoading || !pwCurrent || !pwNew || !pwConfirm} onClick={handlePasswordChange}>
                  <Key className="mr-1 h-3.5 w-3.5" />{pwLoading ? "Changing..." : "Change Password"}
                </Button>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Biometric Authentication</p>
                <ToggleRow id="biometric" label="Enable biometric login" desc={bioAvailable.reason || "Use Face ID, Touch ID, or Windows Hello to unlock"} checked={secSettings.biometricEnabled} onCheckedChange={(v) => {
                  setBiometricEnabled(v)
                  setSecSettings((prev) => ({ ...prev, biometricEnabled: v }))
                  addToast(v ? "Biometric login enabled." : "Biometric login disabled.")
                }} />
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PIN Lock</p>
                <ToggleRow id="pin-enabled" label="Enable App PIN" desc="Require a 4–6 digit PIN to open the app" checked={secSettings.pinEnabled} onCheckedChange={(v) => setPinMode(v ? "create" : "disable")} />
                {pinMode === "create" && (
                  <div className="space-y-2 max-w-md">
                    <input type="password" placeholder="New PIN (4–6 digits)" value={pinNew} onChange={(e) => setPinNew(e.target.value)} maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="password" placeholder="Confirm PIN" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    {pinError && <p className="text-xs text-red-500">{pinError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setPinMode("off"); setPinNew(""); setPinConfirm(""); setPinError("") }}>Cancel</Button>
                      <Button size="sm" disabled={pinLoading || !pinNew || !pinConfirm} onClick={handleCreatePIN}>{pinLoading ? "Creating..." : "Create PIN"}</Button>
                    </div>
                  </div>
                )}
                {pinMode === "change" && (
                  <div className="space-y-2 max-w-md">
                    <input type="password" placeholder="Current PIN" value={pinCurrent} onChange={(e) => setPinCurrent(e.target.value)} maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="password" placeholder="New PIN (4–6 digits)" value={pinNew} onChange={(e) => setPinNew(e.target.value)} maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    <input type="password" placeholder="Confirm PIN" value={pinConfirm} onChange={(e) => setPinConfirm(e.target.value)} maxLength={6} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    {pinError && <p className="text-xs text-red-500">{pinError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setPinMode("off"); setPinNew(""); setPinConfirm(""); setPinCurrent(""); setPinError("") }}>Cancel</Button>
                      <Button size="sm" disabled={pinLoading || !pinCurrent || !pinNew || !pinConfirm} onClick={handleChangePIN}>{pinLoading ? "Changing..." : "Change PIN"}</Button>
                    </div>
                  </div>
                )}
                {pinMode === "disable" && (
                  <div className="space-y-2 max-w-md">
                    <input type="password" placeholder="Current password" value={pinCurrent} onChange={(e) => setPinCurrent(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
                    {pinError && <p className="text-xs text-red-500">{pinError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setPinMode("off"); setPinCurrent(""); setPinError("") }}>Cancel</Button>
                      <Button size="sm" variant="outline" className="text-red-500" disabled={pinLoading} onClick={handleDisablePIN}>{pinLoading ? "Disabling..." : "Disable PIN"}</Button>
                    </div>
                  </div>
                )}
                {pinMode === "off" && secSettings.pinEnabled && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPinMode("change")}><Lock className="mr-1 h-3.5 w-3.5" />Change PIN</Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => setPinMode("disable")}><Lock className="mr-1 h-3.5 w-3.5" />Disable PIN</Button>
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* 2. Devices & Sessions */}
          <Section id="devices" title="Devices & Sessions" isOpen={openSection === "devices"} onToggle={() => toggleSection("devices")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Device</p>
                {devices.filter((d) => d.isCurrent).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Laptop className="h-4 w-4" /></div>
                      <div>
                        <p className="text-sm font-medium">{d.browser}</p>
                        <p className="text-xs text-muted-foreground">{d.os}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px]">Current</Badge>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Other Devices</p>
                {devices.filter((d) => !d.isCurrent).map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                        {d.os.includes("Android") || d.os.includes("iOS") ? <Phone className="h-4 w-4" /> : <Tablet className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.browser}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 text-xs" onClick={() => {
                      removeDeviceAction(d.id)
                      setDevices((prev) => prev.filter((dev) => dev.id !== d.id))
                      addToast("Device signed out.")
                    }}>Sign Out</Button>
                  </div>
                ))}
                {devices.filter((d) => !d.isCurrent).length === 0 && (
                  <p className="text-xs text-muted-foreground">No other devices.</p>
                )}
              </div>
              {devices.filter((d) => !d.isCurrent).length > 0 && (
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => {
                  signOutAllDevices()
                  setDevices((prev) => prev.filter((d) => d.isCurrent))
                  addToast("Signed out from all other devices.")
                }}><AlertTriangle className="mr-1 h-3.5 w-3.5" />Sign Out Everywhere</Button>
              )}
            </div>
          </Section>

          {/* 3. Data & Accounts */}
          <Section id="data" title="Data & Accounts" isOpen={openSection === "data"} onToggle={() => toggleSection("data")}>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Connected Accounts</p>
                {secSettings.connectedAccounts.map((a) => (
                  <div key={a.provider} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center"><Globe className="h-4 w-4" /></div>
                      <p className="text-sm font-medium">{a.provider}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {a.connected && <Badge variant="outline" className="text-emerald-500 border-emerald-500/30"><Check className="mr-1 h-3 w-3" />Connected</Badge>}
                      <Button variant={a.connected ? "outline" : "default"} size="sm" onClick={() => {
                        if (a.connected) {
                          disconnectAccount(a.provider)
                          setSecSettings((prev) => ({
                            ...prev,
                            connectedAccounts: prev.connectedAccounts.map((acc) => acc.provider === a.provider ? { ...acc, connected: false } : acc),
                          }))
                          addToast(`${a.provider} disconnected.`)
                        } else {
                          connectAccount(a.provider)
                          setSecSettings((prev) => ({
                            ...prev,
                            connectedAccounts: prev.connectedAccounts.map((acc) => acc.provider === a.provider ? { ...acc, connected: true, connectedAt: new Date().toISOString() } : acc),
                          }))
                          addToast(`${a.provider} connected.`)
                        }
                      }}>{a.connected ? "Disconnect" : "Connect"}</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Backup</p>
                <ToggleRow id="cloud-backup" label="Cloud Backup" desc="Automatically back up my data" checked={secSettings.backupEnabled} onCheckedChange={(v) => {
                  toggleBackup(v)
                  setSecSettings((prev) => ({ ...prev, backupEnabled: v }))
                  addToast(v ? "Cloud backup enabled." : "Cloud backup disabled.")
                }} />
                {secSettings.lastBackup && <p className="text-xs text-muted-foreground">Last backup: {new Date(secSettings.lastBackup).toLocaleString()}</p>}
                <Button size="sm" variant="outline" onClick={() => {
                  const result = performBackup()
                  setSecSettings((prev) => ({ ...prev, lastBackup: new Date().toISOString(), backupSize: result.size }))
                  addToast(`Backup complete (${result.size}).`)
                }}><Cloud className="mr-1 h-3.5 w-3.5" />Backup Now</Button>
              </div>
              <Separator />
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Export Data</p>
                <Button size="sm" variant="outline" onClick={() => { exportData("json"); addToast("Data exported as JSON.") }}><Download className="mr-1 h-3.5 w-3.5" />Download as JSON</Button>
                <Button size="sm" variant="outline" onClick={() => { exportData("csv"); addToast("Data exported as CSV.") }}><Download className="mr-1 h-3.5 w-3.5" />Download as CSV</Button>
                <p className="text-xs text-muted-foreground">Export journals, goals, habits, reminders and account information.</p>
              </div>
            </div>
          </Section>

          {/* 4. Privacy */}
          <Section id="privacy" title="Privacy" isOpen={openSection === "privacy"} onToggle={() => toggleSection("privacy")}>
            <ToggleRow id="analytics" label="Allow anonymous analytics" desc="Help improve Intenteo with usage data" checked={secSettings.analyticsEnabled} onCheckedChange={(v) => {
              updatePrivacySetting("analyticsEnabled", v)
              setSecSettings((prev) => ({ ...prev, analyticsEnabled: v }))
              addToast("Privacy setting updated.")
            }} />
            <ToggleRow id="personalization" label="Allow personalized recommendations" desc="Let Téo tailor suggestions to your patterns" checked={secSettings.personalizationEnabled} onCheckedChange={(v) => {
              updatePrivacySetting("personalizationEnabled", v)
              setSecSettings((prev) => ({ ...prev, personalizationEnabled: v }))
              addToast("Privacy setting updated.")
            }} />
            <ToggleRow id="ai-memory" label="Allow Téo to use activity history" desc="Téo references past actions for smarter guidance" checked={secSettings.aiMemoryEnabled} onCheckedChange={(v) => {
              updatePrivacySetting("aiMemoryEnabled", v)
              setSecSettings((prev) => ({ ...prev, aiMemoryEnabled: v }))
              addToast("Privacy setting updated.")
            }} />
            <ToggleRow id="usage-history" label="Show profile to accountability partners" desc="Let partners see your progress" checked={secSettings.usageHistoryEnabled} onCheckedChange={(v) => {
              updatePrivacySetting("usageHistoryEnabled", v)
              setSecSettings((prev) => ({ ...prev, usageHistoryEnabled: v }))
              addToast("Privacy setting updated.")
            }} />
          </Section>

        </TabsContent>

        {/* ═══════════ TAB 3: HELP & SUPPORT ═══════════ */}
        <TabsContent value="help" className="mt-6 space-y-4">

          <Section id="help-center" title="Help Center" isOpen={openSection === "help-center"} onToggle={() => toggleSection("help-center")}>
            <HelpCenter />
          </Section>

          <Section id="contact" title="Contact Us" isOpen={openSection === "contact"} onToggle={() => toggleSection("contact")}>
            <ContactUs />
          </Section>

          <Section id="community" title="Community" isOpen={openSection === "community"} onToggle={() => toggleSection("community")}>
            <Community />
          </Section>

          <Section id="about" title="About Intenteo" isOpen={openSection === "about"} onToggle={() => toggleSection("about")}>
            <AboutIntenteo />
          </Section>
        </TabsContent>
      </Tabs>

      {/* ═══════════ MODALS ═══════════ */}

      {/* Email Change Confirmation */}
      {emailConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelEmailChange} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Confirm Email Change</h3>
            <p className="text-sm text-muted-foreground">You are changing your email from <strong>{savedUserSettings.profile.email}</strong> to <strong>{pendingEmail}</strong>.</p>
            <p className="text-sm text-muted-foreground">A verification link will be sent to your new email.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={cancelEmailChange}>Cancel</Button>
              <Button size="sm" className="flex-1" onClick={confirmEmailChange}>Confirm Change</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 1 */}
      {deleteStep === 1 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Delete Account?</h3>
            <p className="text-sm text-muted-foreground">This action is permanent.</p>
            <p className="text-sm text-muted-foreground">Deleting your Intenteo account will permanently remove your goals, tasks, habits, journals, reminders, settings, and all associated data.</p>
            <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Cancel</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={() => setDeleteStep(2)}>Delete Account</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 2: Password */}
      {deleteStep === 2 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Confirm your password</h3>
            <p className="text-sm text-muted-foreground">Enter your password to continue.</p>
            <input type="password" placeholder="Password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Cancel</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" disabled={!deletePassword} onClick={() => setDeleteStep(3)}>Continue</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account — Step 3: Final */}
      {deleteStep === 3 && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setDeleteStep(0); setDeletePassword("") }} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-semibold text-base">Are you absolutely sure?</h3>
            <p className="text-sm text-muted-foreground">This permanently deletes your Intenteo account and all data.</p>
            <p className="text-sm text-muted-foreground">This cannot be reversed.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { setDeleteStep(0); setDeletePassword("") }}>Keep My Account</Button>
              <Button variant="outline" size="sm" className="flex-1 text-red-500 border-red-500/30 hover:bg-red-500/10" onClick={handleDeleteAccount}>Permanently Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Focal Point Picker */}
      {focalPointOpen && pendingAvatarSrc && (
        <FocalPointPicker
          src={pendingAvatarSrc}
          focalPoint={profileFocalPoint}
          onFocalPointChange={setProfileFocalPoint}
          onRemove={handleFocalPointRemove}
          onClose={() => { setFocalPointOpen(false); setPendingAvatarSrc("") }}
          onSave={handleFocalPointSave}
        />
      )}
    </div>
  )
}
