"use client"

import React, { useState, useCallback } from "react"
import { Mail, Clock, Send, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = "Name is required"
  if (!data.email.trim()) errors.email = "Email is required"
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email format"
  if (!data.subject.trim()) errors.subject = "Subject is required"
  if (!data.message.trim()) errors.message = "Message is required"
  else if (data.message.length > 2000) errors.message = "Message must be under 2000 characters"
  return errors
}

function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-9 w-full rounded-lg bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-9 w-full rounded-lg bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-9 w-full rounded-lg bg-muted" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-20 w-full rounded-lg bg-muted" />
      </div>
    </div>
  )
}

export function ContactUs() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" })

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  const updateField = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const handleSubmit = useCallback(() => {
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)
    setTimeout(() => {
      const requests = JSON.parse(localStorage.getItem("intenteo-support-requests") || "[]")
      requests.push({
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
        status: "sent",
      })
      localStorage.setItem("intenteo-support-requests", JSON.stringify(requests))
      setSubmitting(false)
      setSubmitted(true)
    }, 1200)
  }, [form])

  if (loading) return <SkeletonLoader />

  if (submitted) {
    return (
      <div className="py-8 text-center space-y-3">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
        <p className="text-sm font-medium">Your support request has been sent.</p>
        <p className="text-xs text-muted-foreground">We&apos;ll get back to you as soon as possible.</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }) }}>
          Send Another
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={cn("w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary", errors.name && "border-red-500 focus:ring-red-500")}
          />
          {errors.name && <p className="text-[11px] text-red-500">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={cn("w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary", errors.email && "border-red-500 focus:ring-red-500")}
          />
          {errors.email && <p className="text-[11px] text-red-500">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Subject</label>
          <input
            type="text"
            placeholder="How can we help?"
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            className={cn("w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary", errors.subject && "border-red-500 focus:ring-red-500")}
          />
          {errors.subject && <p className="text-[11px] text-red-500">{errors.subject}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message</label>
          <textarea
            placeholder="Describe your issue or suggestion..."
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            rows={4}
            className={cn("w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none", errors.message && "border-red-500 focus:ring-red-500")}
          />
          <div className="flex justify-between">
            {errors.message && <p className="text-[11px] text-red-500">{errors.message}</p>}
            <p className="text-[10px] text-muted-foreground ml-auto">{form.message.length}/2000</p>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-[#1E0E6B] hover:bg-[#1E0E6B]/90 text-white"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
          {submitting ? "Sending..." : "Send Message"}
        </Button>
      </div>

      <div className="pt-3 border-t space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">support@intenteo.app</p>
            <p className="text-xs text-muted-foreground">Email Support</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">Monday–Friday, 9:00 AM – 5:00 PM UTC</p>
            <p className="text-xs text-muted-foreground">Average response time: 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  )
}
