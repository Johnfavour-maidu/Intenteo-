"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { TeoIcon } from "@/components/ui/teo-icon"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"

export default function SignInPage() {
  const { isSignedIn, signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isSignedIn) return null

  const handleDemoLogin = () => {
    setLoading(true)
    setTimeout(() => {
      signIn()
    }, 600)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setTimeout(() => {
      signIn()
    }, 600)
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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

          <p className="text-[11px] text-muted-foreground text-center">
            Explore Intenteo with sample data. No account required.
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
