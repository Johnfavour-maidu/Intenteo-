"use client"

import Link from "next/link"
import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Send, CheckCircle, ArrowRight, BookOpen } from "lucide-react"

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

const CONTACT_REASONS = [
  { value: "general", label: "General Question" },
  { value: "feedback", label: "Feedback" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership" },
  { value: "other", label: "Other" },
] as const

type ContactReason = typeof CONTACT_REASONS[number]["value"]

interface FormData {
  name: string
  email: string
  reason: ContactReason
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function submitContactForm(_data: FormData): Promise<{ ok: boolean; error?: string }> {
  // TODO: Connect to backend / email service (e.g. Resend, SendGrid, Formspree, etc.)
  // Replace this stub with the actual API call.
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 1200))
}

/* ═══════════════════════════════════ HERO ═══════════════════════════════════ */
function HeroSection() {
  const { ref, visible } = useReveal(0.05)
  return (
    <section className="pt-16 pb-8 md:pt-20 md:pb-10 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("text-center max-w-3xl mx-auto", visible && "visible")}>
          <p className={cn("text-xs font-bold uppercase tracking-[0.2em] text-[#EB9E5B]", "reveal", visible && "visible")}>
            Get in touch
          </p>
          <h1 className={cn("mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl", "reveal reveal-delay-1", visible && "visible")}>
            Let&apos;s talk.
          </h1>
          <p className={cn("mt-3 text-base text-muted-foreground max-w-lg mx-auto leading-relaxed", "reveal reveal-delay-2", visible && "visible")}>
            Have a question about Intenteo, need help getting started, or want to share feedback?
            We&apos;d love to hear from you.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════ FORM ═══════════════════════════════════ */
function ContactForm() {
  const { ref, visible } = useReveal(0.1)
  const [form, setForm] = useState<FormData>({ name: "", email: "", reason: "general", subject: "", message: "" })
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
    if (field !== "reason" && errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (status === "error") setStatus("idle")
  }

  const inputClass = (hasError: boolean) =>
    cn(
      "w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20",
      hasError ? "border-red-400" : "border-border"
    )

  if (status === "success") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Message sent successfully.</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Thanks for reaching out. We&apos;ll get back to you as soon as we can.
          </p>
          <button
            onClick={() => {
              setStatus("idle")
              setForm({ name: "", email: "", reason: "general", subject: "", message: "" })
            }}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#FFB000] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 hover:shadow-xl hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5 transition-all"
          >
            Send another message <ArrowRight className="h-3.5 w-3.5" />
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
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClass(!!errors.name)}
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
              className={inputClass(!!errors.email)}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-foreground mb-1.5">What can we help with?</label>
          <select
            id="reason"
            value={form.reason}
            onChange={(e) => handleChange("reason", e.target.value as ContactReason)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-[#1E0E6B]/20 appearance-none cursor-pointer"
          >
            {CONTACT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
          <input
            id="subject"
            type="text"
            value={form.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className={inputClass(!!errors.subject)}
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
            className={cn(inputClass(!!errors.message), "resize-none min-h-[120px]")}
            placeholder="Tell us how we can help..."
          />
          {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
        </div>

        {status === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {errorMsg}
          </div>
        )}

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
  )
}

/* ═══════════════════════════════ CONTACT INFO ═══════════════════════════════ */
function ContactInfo() {
  const { ref, visible } = useReveal(0.1)
  return (
    <div ref={ref} className={cn("reveal", visible && "visible")}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">We&apos;re here to help.</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Whether you have a question about Intenteo, want to share feedback, or simply want to say
            hello, send us a message.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-[#FAFBFF] dark:bg-[#141220] p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E0E6B]/5">
              <svg className="h-4 w-4 text-[#1E0E6B]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <a href="mailto:hello@intenteo.com" className="text-sm text-muted-foreground hover:text-[#1E0E6B] transition-colors">
                hello@intenteo.com
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Your message is only used to respond to your enquiry. See our{" "}
          <Link href="/privacy" className="font-medium text-[#1E0E6B] hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════ FAQ ═══════════════════════════════════ */
function FaqMicroSection() {
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-2xl text-center", visible && "visible")}>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#1E0E6B]/5 px-4 py-1.5 mb-4">
            <BookOpen className="h-3.5 w-3.5 text-[#1E0E6B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1E0E6B]">Resources</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Looking for answers?</h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            You may find what you&apos;re looking for in our resources.
          </p>
          <Link
            href="/learn"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[#1E0E6B]/15 bg-white/80 px-6 py-2.5 text-sm font-semibold text-[#1E0E6B] hover:bg-[#F8F6FF] hover:border-[#1E0E6B]/25 transition-all duration-300 dark:bg-gray-950/40"
          >
            Explore Resources <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════ CTA ═══════════════════════════════════ */
function CtaSection() {
  const { ref, visible } = useReveal(0.1)
  return (
    <section className="py-10 md:py-14 bg-[#1E0E6B]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className={cn("reveal mx-auto max-w-2xl text-center", visible && "visible")}>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to live with intention?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Start connecting what matters to you with what you do every day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #FF5A1F 0%, #FF7A00 45%, #FFB000 100%)" }}
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/learn"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white hover:bg-white/10 transition-all duration-300"
            >
              Learn More
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
      <section className="py-12 md:py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={ref}
            className={cn(
              "reveal mx-auto grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16",
              visible && "visible"
            )}
          >
            {/* Left — contact info */}
            <ContactInfo />

            {/* Right — form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <FaqMicroSection />
      <CtaSection />
    </>
  )
}
