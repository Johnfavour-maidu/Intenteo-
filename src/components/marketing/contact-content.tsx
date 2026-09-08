"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, CheckCircle, ArrowRight } from "lucide-react"

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) { setVisible(true); return }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: "0px 0px -20px 0px" }
    )
    obs.observe(el)
    const fallback = setTimeout(() => { setVisible(true); obs.disconnect() }, 800)
    return () => { obs.disconnect(); clearTimeout(fallback) }
  }, [threshold])
  return { ref, visible }
}

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

function HeroSection() {
  const { ref, visible } = useReveal()
  return (
    <section className="pt-20 pb-10 md:pt-24 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal text-center max-w-3xl mx-auto", visible && "visible")}>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Let&apos;s talk.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Have a question about Intenteo, need help getting started, or want to work with us?
            We&apos;d love to hear from you.
          </p>
        </div>
      </div>
    </section>
  )
}

function ContactForm() {
  const { ref, visible } = useReveal()
  const [form, setForm] = useState<FormData>({ name: "", email: "", subject: "", message: "" })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!form.name.trim()) errs.name = "Name is required."
    if (!form.email.trim()) {
      errs.email = "Email is required."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address."
    }
    if (!form.subject.trim()) errs.subject = "Subject is required."
    if (!form.message.trim()) {
      errs.message = "Message is required."
    } else if (form.message.trim().length < 10) {
      errs.message = "Message must be at least 10 characters."
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus("loading")
    // Simulate submission — connect to backend later
    await new Promise((r) => setTimeout(r, 1200))
    setStatus("success")
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  if (status === "success") {
    return (
      <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-xl text-center py-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Message sent!</h2>
            <p className="mt-3 text-muted-foreground">
              Thank you for reaching out. We&apos;ll get back to you as soon as possible.
            </p>
            <button
              onClick={() => { setStatus("idle"); setForm({ name: "", email: "", subject: "", message: "" }) }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1E0E6B] hover:underline"
            >
              Send another message <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-xl", visible && "visible")}>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20",
                  errors.name ? "border-red-400" : "border-border"
                )}
                placeholder="Your name"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20",
                  errors.email ? "border-red-400" : "border-border"
                )}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
              <input
                id="subject"
                type="text"
                value={form.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20",
                  errors.subject ? "border-red-400" : "border-border"
                )}
                placeholder="What is this about?"
              />
              {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">Message</label>
              <textarea
                id="message"
                value={form.message}
                onChange={(e) => handleChange("message", e.target.value)}
                rows={5}
                className={cn(
                  "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20 resize-none",
                  errors.message ? "border-red-400" : "border-border"
                )}
                placeholder="Tell us how we can help..."
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {status === "loading" ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

function ContactInfo() {
  const { ref, visible } = useReveal()
  return (
    <section className="py-8 md:py-10 bg-[#FAFBFF] dark:bg-[#0F0D1A]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-xl text-center", visible && "visible")}>
          <p className="text-sm text-muted-foreground">
            You can also reach us at{" "}
            <a href="mailto:hello@intenteo.com" className="font-medium text-[#1E0E6B] hover:underline">hello@intenteo.com</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export function ContactContent() {
  return (
    <>
      <HeroSection />
      <ContactForm />
      <ContactInfo />
    </>
  )
}
