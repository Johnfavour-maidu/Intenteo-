"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { TeoIcon } from "@/components/ui/teo-icon"
import { Eye, EyeOff, Mail, Lock, ArrowRight, User } from "lucide-react"
import { loadUserSettings, updateUserSettings } from "@/lib/user-settings"
import Link from "next/link"

export default function SignUpPage() {
  const { isSignedIn, signIn } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (isSignedIn) return null

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim() || !email || !password) {
      setError("All fields are required.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        const settings = loadUserSettings()
        updateUserSettings({
          profile: {
            ...settings.profile,
            name: name.trim(),
            email,
            username: name.trim().split(" ")[0].toLowerCase(),
          },
        })
        localStorage.setItem("intenteo-user-password", password)
      } catch {}
      signIn()
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

        {/* Sign Up Card */}
        <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl shadow-black/5 border border-[#1E0E6B]/10 p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Start your intentional living journey</p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError("") }}
                  placeholder="Your full name"
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-[#1E0E6B]/20 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#1E0E6B]/30 focus:border-[#1E0E6B]/40 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  placeholder="you@example.com"
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
                  placeholder="At least 6 characters"
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
              disabled={!name.trim() || !email || !password || loading}
              className="w-full h-10 rounded-lg bg-[#1E0E6B] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#1E0E6B]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
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

          {/* Continue with Google */}
          <button
            onClick={() => { setLoading(true); setTimeout(() => signIn(), 800) }}
            disabled={loading}
            className="w-full h-10 rounded-lg border border-[#1E0E6B]/20 text-sm font-medium flex items-center justify-center gap-2 hover:bg-muted/50 transition-all disabled:opacity-40"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/signin" className="text-[#1E0E6B] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} Intenteo. Built for intentional living.
        </p>
      </div>
    </div>
  )
}
