"use client"

export interface ReminderSound {
  id: string
  name: string
  description: string
  category: "chime" | "nature" | "digital" | "instrument"
  frequency?: string
}

export const REMINDER_SOUNDS: ReminderSound[] = [
  { id: "default", name: "Default Intenteo", description: "The classic Intenteo notification sound", category: "digital" },
  { id: "soft-chime", name: "Soft Chime", description: "A gentle, warm chime that is pleasant without being disruptive", category: "chime" },
  { id: "gentle-bell", name: "Gentle Bell", description: "A soft bell tone perfect for mindfulness reminders", category: "chime" },
  { id: "morning-birds", name: "Morning Birds", description: "Peaceful birdsong to start your day with calm energy", category: "nature" },
  { id: "wind-chimes", name: "Wind Chimes", description: "Delicate wind chimes that create a serene atmosphere", category: "chime" },
  { id: "rain-drop", name: "Rain Drop", description: "The gentle sound of rain falling on leaves", category: "nature" },
  { id: "ocean-wave", name: "Ocean Wave", description: "A calming wave that washes over you with tranquility", category: "nature" },
  { id: "forest", name: "Forest", description: "Ambient forest sounds with birds and rustling leaves", category: "nature" },
  { id: "piano", name: "Piano", description: "A soft piano note that is elegant and refined", category: "instrument" },
  { id: "minimal-digital", name: "Minimal Digital", description: "A clean, modern digital tone that is subtle and professional", category: "digital" },
  { id: "classic-notification", name: "Classic Notification", description: "A familiar, reliable notification sound", category: "digital" },
  { id: "soft-gong", name: "Soft Gong", description: "A resonant gong that gently draws your attention", category: "instrument" },
]

export const SOUND_CATEGORIES = [
  { id: "all" as const, label: "All Sounds" },
  { id: "chime" as const, label: "Chimes" },
  { id: "nature" as const, label: "Nature" },
  { id: "digital" as const, label: "Digital" },
  { id: "instrument" as const, label: "Instruments" },
]

const SOUND_STORAGE_KEY = "intenteo-reminder-sound"
const VOLUME_STORAGE_KEY = "intenteo-reminder-volume"
const REPEAT_STORAGE_KEY = "intenteo-reminder-repeat"
const VIBRATION_STORAGE_KEY = "intenteo-reminder-vibration"
const SILENT_STORAGE_KEY = "intenteo-reminder-silent"

export function getSelectedSound(): string {
  if (typeof window === "undefined") return "default"
  return localStorage.getItem(SOUND_STORAGE_KEY) || "default"
}

export function setSelectedSound(id: string): void {
  localStorage.setItem(SOUND_STORAGE_KEY, id)
}

export function getReminderVolume(): number {
  if (typeof window === "undefined") return 80
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY)
  return stored ? parseInt(stored) : 80
}

export function setReminderVolume(volume: number): void {
  localStorage.setItem(VOLUME_STORAGE_KEY, String(volume))
}

export function getRepeatReminder(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(REPEAT_STORAGE_KEY) === "true"
}

export function setRepeatReminder(enabled: boolean): void {
  localStorage.setItem(REPEAT_STORAGE_KEY, String(enabled))
}

export function getVibrationEnabled(): boolean {
  if (typeof window === "undefined") return true
  return localStorage.getItem(VIBRATION_STORAGE_KEY) !== "false"
}

export function setVibrationEnabled(enabled: boolean): void {
  localStorage.setItem(VIBRATION_STORAGE_KEY, String(enabled))
}

export function getSilentMode(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SILENT_STORAGE_KEY) === "true"
}

export function setSilentMode(enabled: boolean): void {
  localStorage.setItem(SILENT_STORAGE_KEY, String(enabled))
}

export function playPreviewSound(soundId: string): void {
  const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()

  const sounds: Record<string, { type: OscillatorType; frequency: number; duration: number; gainRamp: number }> = {
    "default": { type: "sine", frequency: 880, duration: 0.3, gainRamp: 0.3 },
    "soft-chime": { type: "sine", frequency: 523, duration: 0.5, gainRamp: 0.2 },
    "gentle-bell": { type: "sine", frequency: 440, duration: 0.6, gainRamp: 0.15 },
    "morning-birds": { type: "sine", frequency: 1200, duration: 0.2, gainRamp: 0.1 },
    "wind-chimes": { type: "sine", frequency: 659, duration: 0.4, gainRamp: 0.12 },
    "rain-drop": { type: "triangle", frequency: 800, duration: 0.15, gainRamp: 0.08 },
    "ocean-wave": { type: "sine", frequency: 200, duration: 1.0, gainRamp: 0.1 },
    "forest": { type: "sine", frequency: 1000, duration: 0.3, gainRamp: 0.05 },
    "piano": { type: "triangle", frequency: 440, duration: 0.8, gainRamp: 0.2 },
    "minimal-digital": { type: "square", frequency: 600, duration: 0.15, gainRamp: 0.05 },
    "classic-notification": { type: "sine", frequency: 660, duration: 0.25, gainRamp: 0.2 },
    "soft-gong": { type: "sine", frequency: 150, duration: 1.2, gainRamp: 0.15 },
  }

  const config = sounds[soundId] || sounds["default"]
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.type = config.type
  oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime)

  const volume = getReminderVolume() / 100
  gainNode.gain.setValueAtTime(config.gainRamp * volume, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + config.duration)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + config.duration)
}
