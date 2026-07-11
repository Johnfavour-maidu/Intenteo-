"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { TeoIcon } from "@/components/ui/teo-icon"
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react"
import { loadUserSettings, updateUserSettings } from "@/lib/user-settings"

const DEMO_EMAIL = "john@intenteo.com"
const DEMO_PASSWORD = "intenteo2026"

export default function SignInPage() {
  const { isSignedIn, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [profileName, setProfileName] = useState("")
  const [profileUsername, setProfileUsername] = useState("")

  useEffect(() => {
    try {
      const settings = loadUserSettings()
      setProfileName(settings.profile.name || "John Favour")
      setProfileUsername(settings.profile.username || "Favourite")
    } catch {
      setProfileName("John Favour")
      setProfileUsername("Favourite")
    }
  }, [])

  if (isSignedIn) return null

  const handleDemoLogin = () => {
    setLoading(true)
    setError("")
    // Set demo profile on first login
    try {
      const settings = loadUserSettings()
      if (!settings.profile.name) {
        updateUserSettings({
          profile: {
            ...settings.profile,
            name: "John Favour",
            username: "Favourite",
            email: DEMO_EMAIL,
          },
        })
      }
    } catch {}
    setTimeout(() => {
      signIn()
    }, 800)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email || !password) return
    setLoading(true)
    // Accept demo credentials or any email/password combo
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        signIn()
      } else if (email && password) {
        // Accept any credentials for demo purposes
        signIn()
      } else {
        setError("Invalid credentials. Try the demo login below.")
        setLoading(false)
      }
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730] px-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E0E6B] shadow-lg shadow-[#1E0E6B]/20">
              <TeoIcon size="lg" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Intenteo</h1>
          <p className="text-muted-foreground mt-1">Live with Intentionality</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl shadow-black/5 border border-[#1E0E6B]/10 p-6 space-y-5">
          {/* Profile Preview */}
          {profileName && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1E0E6B]/5 border border-[#1E0E6B]/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E0E6B] text-white shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{profileName}</p>
                <p className="text-xs text-muted-foreground truncate">@{profileUsername}</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Sign in to continue your journey</p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  placeholder={DEMO_EMAIL}
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#1E0E6B]/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/30 focus:border-[#1E0E6B]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="Enter your password"
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-[#1E0E6B]/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/30 focus:border-[#1E0E6B]/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={!email || !password || loading}
              className="w-full h-10 rounded-lg bg-[#1E0E6B] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1E0E6B]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E0E6B]/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-950 px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Demo Login */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full h-10 rounded-lg border border-[#1E0E6B] text-[#1E0E6B] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1E0E6B]/5 transition-all disabled:opacity-40"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-[#1E0E6B]/30 border-t-[#1E0E6B] rounded-full animate-spin" />
            ) : (
              <>Continue with Demo</>
            )}
          </button>

          {/* Demo Credentials */}
          <div className="rounded-lg bg-muted/50 border border-[#1E0E6B]/5 p-3 space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Demo Credentials</p>
            <div className="flex items-center gap-2 text-xs">
              <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-foreground font-mono">{DEMO_EMAIL}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-foreground font-mono">{DEMO_PASSWORD}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Intenteo. Built for intentional living.
        </p>
      </div>
    </div>
  )
}
