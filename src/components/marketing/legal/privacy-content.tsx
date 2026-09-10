"use client"

import Link from "next/link"
import { ReadingProgress } from "./reading-progress"
import { ArrowRight } from "lucide-react"

export function PrivacyContent() {
  return (
    <>
      <ReadingProgress />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              How Inteénteo collects, uses, stores, and protects your information.
            </p>
            <p className="mt-4 text-sm text-muted-foreground/70">Last updated: September 8, 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="mx-auto max-w-[780px]">

            <section id="introduction">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 first:mt-0 pb-2 border-b border-[#1E0E6B]/10">Introduction</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Inteénteo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and application.
                </p>
                <p>
                  By using Inteénteo, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of our services.
                </p>
              </div>
            </section>

            <section id="info-collect">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Information We Collect</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We collect information to provide and improve our services. The types of information we collect fall into two categories: information you provide directly and information collected automatically.
                </p>
              </div>
            </section>

            <section id="info-provide">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Information You Provide</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>When you create an account or use Inteénteo, you may provide:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Account information</strong> — name, email address, and password</li>
                  <li><strong className="text-foreground">Profile data</strong> — avatar, preferences, and settings</li>
                  <li><strong className="text-foreground">Content you create</strong> — purposes, visions, goals, tasks, habits, journal entries, reflections, and any other data you enter into the application</li>
                  <li><strong className="text-foreground">Communications</strong> — messages you send to us through support channels or feedback forms</li>
                </ul>
              </div>
            </section>

            <section id="info-automatic">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Information Collected Automatically</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>When you access Inteénteo, we may automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Device information</strong> — browser type, operating system, device identifiers</li>
                  <li><strong className="text-foreground">Usage data</strong> — pages viewed, features used, actions taken, timestamps</li>
                  <li><strong className="text-foreground">Log data</strong> — IP address, access times, referring URLs</li>
                  <li><strong className="text-foreground">Local storage data</strong> — Inteénteo uses browser local storage to persist your data locally on your device. This data is not transmitted to our servers unless you explicitly sync or back up your data.</li>
                </ul>
              </div>
            </section>

            <section id="how-use">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">How We Use Your Information</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve Inteénteo</li>
                  <li>Personalize your experience and deliver content relevant to your goals</li>
                  <li>Calculate your Intent Score and provide insights</li>
                  <li>Send important account-related notifications</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Detect and prevent fraud, abuse, or security issues</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section id="how-share">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">How We Share Your Information</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>We do not sell your personal information. We may share information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong className="text-foreground">Service providers</strong> — third parties that help us operate our services (hosting, analytics, email delivery), bound by contractual obligations to protect your data</li>
                  <li><strong className="text-foreground">Legal requirements</strong> — when required by law, regulation, or valid legal process</li>
                  <li><strong className="text-foreground">Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, with notice to you</li>
                  <li><strong className="text-foreground">With your consent</strong> — when you explicitly authorize us to share your information</li>
                </ul>
              </div>
            </section>

            <section id="cookies">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Cookies and Similar Technologies</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Inteénteo uses cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.
                </p>
              </div>
            </section>

            <section id="storage-security">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Data Storage and Security</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We implement industry-standard security measures to protect your personal information. These include encryption in transit (TLS/HTTPS), encryption at rest, access controls, and regular security audits.
                </p>
                <p>
                  Inteénteo primarily stores your data in browser local storage on your device. This means your data stays on your device by default and is not automatically transmitted to our servers.
                </p>
              </div>
            </section>

            <section id="retention">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Data Retention</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your data within a reasonable timeframe, except where required to retain certain information for legal or legitimate business purposes.
                </p>
              </div>
            </section>

            <section id="rights">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Your Privacy Rights</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Data portability — receive your data in a structured, machine-readable format</li>
                  <li>Withdraw consent where processing is based on consent</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            <section id="deletion">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Account and Data Deletion</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  You may delete your account at any time from your account settings. Upon deletion, your account data will be permanently removed from our systems. Since Inteénteo stores most data locally in your browser, deleting your account does not automatically remove data stored on your device — you should clear your browser data separately if desired.
                </p>
              </div>
            </section>

            <section id="children">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Children&apos;s Privacy</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Inteénteo is not intended for children under 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
                </p>
              </div>
            </section>

            <section id="third-party">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Third-Party Services</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Inteénteo may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services you access through Inteénteo.
                </p>
              </div>
            </section>

            <section id="transfers">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">International Data Transfers</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted with appropriate safeguards to protect your data in accordance with applicable data protection laws.
                </p>
              </div>
            </section>

            <section id="changes">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Changes to This Privacy Policy</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Inteénteo after changes are posted constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>

            <section id="contact">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">Contact Us</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us through our website or at the contact information provided on our{" "}
                  <Link href="/contact" className="text-[#1E0E6B] hover:underline font-medium">Contact</Link>{" "}
                  page.
                </p>
              </div>
            </section>

          </article>

          {/* Bottom links */}
          <div className="mx-auto max-w-[780px] mt-14 pt-8 border-t border-[#1E0E6B]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
              <Link
                href="/terms"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                See our Terms of Service <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                Questions about this policy? Contact us <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
