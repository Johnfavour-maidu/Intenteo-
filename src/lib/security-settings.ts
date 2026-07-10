// Security Settings Store — localStorage-backed with validation

export interface SecuritySettings {
  // Password
  passwordHash: string
  passwordChangedAt: string

  // Biometric
  biometricEnabled: boolean

  // PIN
  pinEnabled: boolean
  pinHash: string
  pinCreatedAt: string

  // Devices
  devices: DeviceInfo[]
  currentSessionId: string

  // Connected Accounts
  connectedAccounts: ConnectedAccount[]

  // Backup
  backupEnabled: boolean
  lastBackup: string
  backupSize: string

  // Privacy
  analyticsEnabled: boolean
  personalizationEnabled: boolean
  aiMemoryEnabled: boolean
  usageHistoryEnabled: boolean
  recommendationEnabled: boolean
}

export interface DeviceInfo {
  id: string
  name: string
  browser: string
  os: string
  location: string
  lastActive: string
  isCurrent: boolean
}

export interface ConnectedAccount {
  provider: string
  connected: boolean
  connectedAt?: string
  email?: string
}

const STORAGE_KEY = "intenteo-security-settings"

function generateId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function hashString(str: string): string {
  // Simple hash for demo — in production use bcrypt/argon2
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `h_${Math.abs(hash).toString(36)}`
}

function getDeviceFingerprint(): string {
  if (typeof navigator === "undefined") return "server"
  const ua = navigator.userAgent
  const screen = `${window.screen.width}x${window.screen.height}`
  return hashString(ua + screen)
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "Unknown"
  const ua = navigator.userAgent
  if (ua.includes("Firefox")) return "Firefox"
  if (ua.includes("Edg")) return "Edge"
  if (ua.includes("Chrome")) return "Chrome"
  if (ua.includes("Safari")) return "Safari"
  return "Unknown"
}

function detectOS(): string {
  if (typeof navigator === "undefined") return "Unknown"
  const ua = navigator.userAgent
  if (ua.includes("Windows")) return "Windows"
  if (ua.includes("Mac")) return "macOS"
  if (ua.includes("Linux")) return "Linux"
  if (ua.includes("Android")) return "Android"
  if (ua.includes("iOS") || ua.includes("iPhone")) return "iOS"
  return "Unknown"
}

function detectLocation(): string {
  // Approximate — in production use IP geolocation
  return "Current location"
}

function getDefaultSettings(): SecuritySettings {
  return {
    passwordHash: "",
    passwordChangedAt: "",
    biometricEnabled: false,
    pinEnabled: false,
    pinHash: "",
    pinCreatedAt: "",
    devices: [],
    currentSessionId: "",
    connectedAccounts: [
      { provider: "Google", connected: false },
      { provider: "Apple", connected: false },
      { provider: "GitHub", connected: false },
    ],
    backupEnabled: true,
    lastBackup: "",
    backupSize: "",
    analyticsEnabled: true,
    personalizationEnabled: true,
    aiMemoryEnabled: true,
    usageHistoryEnabled: true,
    recommendationEnabled: true,
  }
}

export function loadSecuritySettings(): SecuritySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultSettings()
    const parsed = JSON.parse(raw)
    return { ...getDefaultSettings(), ...parsed }
  } catch {
    return getDefaultSettings()
  }
}

export function saveSecuritySettings(settings: SecuritySettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// ─── Password ───

export function validatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { score, label: "Weak", color: "#EF4444" }
  if (score <= 3) return { score, label: "Fair", color: "#F59E0B" }
  if (score <= 4) return { score, label: "Good", color: "#3B82F6" }
  return { score, label: "Strong", color: "#22C55E" }
}

export function changePassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  const settings = loadSecuritySettings()

  // First-time: set password
  if (!settings.passwordHash) {
    if (newPassword.length < 8) return { success: false, error: "Password must be at least 8 characters." }
    if (newPassword !== currentPassword) return { success: false, error: "Passwords do not match." }
    settings.passwordHash = hashString(newPassword)
    settings.passwordChangedAt = new Date().toISOString()
    saveSecuritySettings(settings)
    return { success: true }
  }

  // Validate current password
  if (hashString(currentPassword) !== settings.passwordHash) {
    return { success: false, error: "Current password is incorrect." }
  }

  // Validate new password
  if (newPassword.length < 8) return { success: false, error: "Password must be at least 8 characters." }
  if (currentPassword === newPassword) return { success: false, error: "New password must be different from current password." }

  settings.passwordHash = hashString(newPassword)
  settings.passwordChangedAt = new Date().toISOString()
  saveSecuritySettings(settings)
  return { success: true }
}

// ─── Biometric ───

export async function isBiometricAvailable(): Promise<{ available: boolean; reason?: string }> {
  if (typeof window === "undefined") return { available: false, reason: "Not available in this environment." }

  if (window.PublicKeyCredential) {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      if (!available) return { available: false, reason: "Biometric authentication is not available on this device." }
      return { available: true }
    } catch {
      return { available: false, reason: "Biometric authentication is not available on this device." }
    }
  }

  return { available: false, reason: "Biometric authentication is not supported in this browser." }
}

export function setBiometricEnabled(enabled: boolean): void {
  const settings = loadSecuritySettings()
  settings.biometricEnabled = enabled
  saveSecuritySettings(settings)
}

// ─── PIN ───

export function validatePIN(pin: string): { valid: boolean; error?: string } {
  if (!/^\d{4,6}$/.test(pin)) return { valid: false, error: "PIN must be 4–6 digits." }
  return { valid: true }
}

export function createPIN(pin: string, confirmPin: string): { success: boolean; error?: string } {
  if (pin !== confirmPin) return { success: false, error: "PINs do not match." }
  const v = validatePIN(pin)
  if (!v.valid) return { success: false, error: v.error }

  const settings = loadSecuritySettings()
  settings.pinEnabled = true
  settings.pinHash = hashString(pin)
  settings.pinCreatedAt = new Date().toISOString()
  saveSecuritySettings(settings)
  return { success: true }
}

export function changePIN(currentPin: string, newPin: string, confirmPin: string): { success: boolean; error?: string } {
  const settings = loadSecuritySettings()
  if (hashString(currentPin) !== settings.pinHash) return { success: false, error: "Current PIN is incorrect." }
  if (newPin !== confirmPin) return { success: false, error: "PINs do not match." }
  if (currentPin === newPin) return { success: false, error: "New PIN must be different from current PIN." }
  const v = validatePIN(newPin)
  if (!v.valid) return { success: false, error: v.error }

  settings.pinHash = hashString(newPin)
  saveSecuritySettings(settings)
  return { success: true }
}

export function disablePIN(password: string): { success: boolean; error?: string } {
  const settings = loadSecuritySettings()
  if (!settings.passwordHash) {
    // No password set — just disable
    settings.pinEnabled = false
    settings.pinHash = ""
    saveSecuritySettings(settings)
    return { success: true }
  }
  if (hashString(password) !== settings.passwordHash) return { success: false, error: "Password is incorrect." }
  settings.pinEnabled = false
  settings.pinHash = ""
  saveSecuritySettings(settings)
  return { success: true }
}

// ─── Devices ───

export function initCurrentDevice(): void {
  const settings = loadSecuritySettings()
  const fingerprint = getDeviceFingerprint()
  const sessionId = `session-${Date.now()}`

  // Check if this device already exists
  const existing = settings.devices.find((d) => d.id === fingerprint)
  if (existing) {
    existing.lastActive = new Date().toISOString()
    existing.isCurrent = true
  } else {
    settings.devices.push({
      id: fingerprint,
      name: `${detectOS()} Device`,
      browser: detectBrowser(),
      os: detectOS(),
      location: detectLocation(),
      lastActive: new Date().toISOString(),
      isCurrent: true,
    })
  }

  // Mark other devices as not current
  settings.devices.forEach((d) => {
    if (d.id !== fingerprint) d.isCurrent = false
  })

  settings.currentSessionId = sessionId
  saveSecuritySettings(settings)
}

export function removeDevice(deviceId: string): void {
  const settings = loadSecuritySettings()
  settings.devices = settings.devices.filter((d) => d.id !== deviceId)
  saveSecuritySettings(settings)
}

export function signOutAllDevices(): void {
  const settings = loadSecuritySettings()
  const currentFingerprint = getDeviceFingerprint()
  settings.devices = settings.devices.filter((d) => d.id === currentFingerprint)
  saveSecuritySettings(settings)
}

// ─── Connected Accounts ───

export function connectAccount(provider: string): void {
  const settings = loadSecuritySettings()
  const account = settings.connectedAccounts.find((a) => a.provider === provider)
  if (account) {
    account.connected = true
    account.connectedAt = new Date().toISOString()
  } else {
    settings.connectedAccounts.push({ provider, connected: true, connectedAt: new Date().toISOString() })
  }
  saveSecuritySettings(settings)
}

export function disconnectAccount(provider: string): void {
  const settings = loadSecuritySettings()
  const account = settings.connectedAccounts.find((a) => a.provider === provider)
  if (account) {
    account.connected = false
    account.connectedAt = undefined
  }
  saveSecuritySettings(settings)
}

// ─── Backup ───

export function toggleBackup(enabled: boolean): void {
  const settings = loadSecuritySettings()
  settings.backupEnabled = enabled
  saveSecuritySettings(settings)
}

export function performBackup(): { success: boolean; size: string } {
  const settings = loadSecuritySettings()
  const data = JSON.stringify({
    tasks: localStorage.getItem("intenteo-tasks"),
    habits: localStorage.getItem("intenteo-habits"),
    goals: localStorage.getItem("intenteo-goals"),
    journal: localStorage.getItem("intenteo-journal-entries"),
    reminders: localStorage.getItem("intenteo-reminders"),
    reviews: localStorage.getItem("intenteo-reviews"),
    vision: localStorage.getItem("intenteo-vision"),
  })
  const size = `${(new Blob([data]).size / 1024).toFixed(1)} KB`
  settings.lastBackup = new Date().toISOString()
  settings.backupSize = size
  saveSecuritySettings(settings)
  return { success: true, size }
}

// ─── Export ───

export function exportData(format: "json" | "csv"): void {
  const data: Record<string, unknown> = {}
  const keys = ["intenteo-tasks", "intenteo-habits", "intenteo-goals", "intenteo-journal-entries", "intenteo-reminders", "intenteo-reviews", "intenteo-vision"]
  keys.forEach((key) => {
    const raw = localStorage.getItem(key)
    if (raw) {
      try { data[key] = JSON.parse(raw) } catch { data[key] = raw }
    }
  })

  let content: string
  let filename: string
  let mimeType: string

  if (format === "json") {
    content = JSON.stringify(data, null, 2)
    filename = `intenteo-export-${new Date().toISOString().split("T")[0]}.json`
    mimeType = "application/json"
  } else {
    // CSV — flatten all data
    const rows: string[] = ["Key,Value"]
    Object.entries(data).forEach(([key, value]) => {
      rows.push(`"${key}","${JSON.stringify(value).replace(/"/g, '""')}"`)
    })
    content = rows.join("\n")
    filename = `intenteo-export-${new Date().toISOString().split("T")[0]}.csv`
    mimeType = "text/csv"
  }

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Privacy ───

export function updatePrivacySetting(key: keyof Pick<SecuritySettings, "analyticsEnabled" | "personalizationEnabled" | "aiMemoryEnabled" | "usageHistoryEnabled" | "recommendationEnabled">, value: boolean): void {
  const settings = loadSecuritySettings()
  settings[key] = value
  saveSecuritySettings(settings)
}
