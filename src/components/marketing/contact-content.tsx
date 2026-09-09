"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, CheckCircle, ArrowRight, Mail, Clock, Lightbulb, HelpCircle } from "lucide-react"

/* ═══════════════════════════════════ HOOKS ═══════════════════════════════════ */

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

/* ═══════════════════════════════════ DATA ═══════════════════════════════════ */

const CONTACT_CATEGORIES = [
  "General Question",
  "Getting Started",
  "Account & Login",
  "App Download",
  "Technical Support",
  "Billing & Subscription",
  "Feature Feedback",
  "Partnership",
  "Report a Problem",
  "Other",
] as const

type ContactCategory = typeof CONTACT_CATEGORIES[number]

interface FormData {
  name: string
  email: string
  category: ContactCategory
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  category?: string
  subject?: string
  message?: string
}

/* ═══════════════════════════════════ SUBMIT ═══════════════════════════════════ */

function submitContactForm(_data: FormData): Promise<{ ok: boolean; error?: string }> {
  // TODO: Connect to backend / email service (e.g. Resend, SendGrid, Formspree, etc.)
  // Replace this stub with the actual API call.
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1200))
}

/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */

function HeroSection() {
  const { ref, visible } = useReveal(0.05)
  return (
    <section className="relative pt-16 pb-10 md:pt-20 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="text-center max-w-3xl mx-auto">
          <p className={cn("text-xs font-bold uppercase tracking-[0.2em] text-[#EB9E5B] reveal", visible && "visible")}>
            Get in touch
          </p>
          <h1 className={cn("mt-4 text-4xl font-bold tracking-tight sm:text-5xl reveal reveal-delay-1 bg-gradient-to-r from-[#1E0E6B] via-[#3D1FA0] to-[#1E0E6B] bg-clip-text text-transparent leading-tight", visible && "visible")}>
            Let&apos;s talk about intentional living
          </h1>
          <p className={cn("mt-5 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed reveal reveal-delay-2", visible && "visible")}>
            Have a question about Intenteo, need help getting started, or simply want to share an idea? We&apos;d love to hear from you.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════ CONTACT INFO ═══════════════════════════════ */

function ContactInfo() {
  const { ref, visible } = useReveal(0.1)

  const infoCards = [
    {
      icon: Mail,
      title: "Email",
      content: "hello@intenteo.com",
      href: "mailto:hello@intenteo.com",
    },
    {
      icon: Clock,
      title: "Response time",
      content: "We usually respond within 1–2 business days.",
    },
    {
      icon: Lightbulb,
      title: "Feedback",
      content: "Have an idea that could make Intenteo better? We would love to hear it.",
    },
    {
      icon: HelpCircle,
      title: "FAQ",
      content: "Find quick answers to common questions.",
      link: { label: "Browse FAQs →", href: "/faq" },
    },
  ]

  return (
    <div ref={ref} className={cn("reveal", visible && "visible")}>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground">We&apos;re here to help</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Whether you have a question about Intenteo, want to share feedback, or simply want to say hello, send us a message.
          </p>
        </div>

        <div className="space-y-3">
          {infoCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="flex items-start gap-4 rounded-xl border border-[#1E0E6B]/10 bg-[#FAFBFF] dark:bg-[#141220] px-5 py-4 transition-colors hover:border-[#1E0E6B]/15"
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1E0E6B]/5">
                  <Icon className="h-4.5 w-4.5 text-[#1E0E6B]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  {card.href ? (
                    <a href={card.href} className="text-sm text-muted-foreground hover:text-[#1E0E6B] transition-colors">
                      {card.content}
                    </a>
                  ) : card.link ? (
                    <div>
                      <p className="text-sm text-muted-foreground">{card.content}</p>
                      <Link href={card.link.href} className="mt-1 inline-block text-sm font-medium text-[#1E0E6B] hover:underline">
                        {card.link.label}
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{card.content}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ FORM ═══════════════════════════════════ */

function ContactForm() {
  const { ref, visible } = useReveal(0.1)
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    category: "General Question",
    subject: "",
    message: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

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
    setErrorMsg("")
    const result = await submitContactForm(form)
    if (result.ok) {
      setStatus("success")
    } else {
      setStatus("error")
      setErrorMsg(result.error || "Something went wrong. Please try again later.")
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (status === "error") setStatus("idle")
  }

  const inputBase =
    "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[#1E0E6B]/20 focus:border-[#1E0E6B]/30"

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-[480px]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Message sent successfully ✓</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Thanks for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
          <button
            onClick={() => {
              setStatus("idle")
              setForm({ name: "", email: "", category: "General Question", subject: "", message: "" })
            }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            Send another message <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("reveal", visible && "visible")}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={cn(inputBase, errors.name ? "border-red-400" : "border-border")}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">Email Address *</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={cn(inputBase, errors.email ? "border-red-400" : "border-border")}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-foreground mb-2">What can we help with? *</label>
          <select
            id="category"
            value={form.category}
            onChange={(e) => handleChange("category", e.target.value as ContactCategory)}
            className={cn(inputBase, "appearance-none cursor-pointer pr-10 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat")}
          >
            {CONTACT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold text-foreground mb-2">Subject *</label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className={cn(inputBase, errors.subject ? "border-red-400" : "border-border")}
            placeholder="What is this about?"
          />
          {errors.subject && <p className="mt-1.5 text-xs text-red-500">{errors.subject}</p>}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-foreground mb-2">Message *</label>
          <textarea
            id="message"
            value={form.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={5}
            className={cn(inputBase, "resize-none min-h-[140px]", errors.message ? "border-red-400" : "border-border")}
            placeholder="Tell us how we can help..."
          />
          {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
        </div>

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {status === "loading" ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Sending...
            </>
          ) : (
            <>
              Send Message <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed text-center">
        We respect your privacy. Your information is only used to respond to your message.{" "}
        <Link href="/privacy" className="font-medium text-[#1E0E6B] hover:underline">Privacy Policy</Link>.
      </p>
    </div>
  )
}

/* ═══════════════════════════════════ CTA ═══════════════════════════════════ */

function CtaSection() {
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-8 md:py-10 bg-[#1E0E6B]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-2xl text-center", visible && "visible")}>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to live with intention?
          </h2>
          <p className="mt-3 text-lg text-white/70">
            Start connecting what matters to you with what you do every day.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
            >
              Start Living With Intention
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all duration-200"
            >
              Download the App
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════ EXPORT ═══════════════════════════════════ */

export function ContactContent() {
  const { ref, visible } = useReveal(0.05)

  return (
    <>
      <HeroSection />

      {/* Two-column contact area */}
      <section className="py-14 md:py-20 bg-white dark:bg-[#0F0D1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ref}
            className={cn(
              "reveal mx-auto grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16",
              visible && "visible"
            )}
          >
            {/* Left — support info */}
            <ContactInfo />

            {/* Right — form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
