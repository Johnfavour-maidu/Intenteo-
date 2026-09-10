"use client"

import Link from "next/link"
import { ReadingProgress } from "./reading-progress"
import { ArrowRight } from "lucide-react"

export function TermsContent() {
  return (
    <>
      <ReadingProgress />

      {/* Hero */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14 bg-gradient-to-br from-[#FAFBFF] via-white to-[#F3F0FF] dark:from-[#0F0D1A] dark:via-[#0F0D1A] dark:to-[#1A1730]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              The terms that govern your use of Intentéo.
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
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 first:mt-0 pb-2 border-b border-[#1E0E6B]/10">1. Introduction</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Welcome to Intentéo. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Intentéo website, application, and services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
                </p>
                <p>
                  Please read these Terms carefully before using Intentéo. If you do not agree to these Terms, you may not access or use the Service.
                </p>
              </div>
            </section>

            <section id="eligibility">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">2. Eligibility</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  You must be at least 13 years old (or the minimum age required in your jurisdiction) to use Intentéo. By creating an account or using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
                </p>
              </div>
            </section>

            <section id="account">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">3. Creating an Account</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>To use certain features of Intentéo, you must create an account. When creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account credentials</li>
                  <li>Promptly update your account information if it changes</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  You are responsible for safeguarding your account credentials. Intentéo is not liable for any loss or damage arising from your failure to maintain the security of your account.
                </p>
              </div>
            </section>

            <section id="responsibilities">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">4. Your Responsibilities</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>As a user of Intentéo, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Service in compliance with all applicable laws and regulations</li>
                  <li>Not use the Service for any unlawful or fraudulent purpose</li>
                  <li>Not attempt to gain unauthorized access to any part of the Service</li>
                  <li>Not interfere with or disrupt the Service or its infrastructure</li>
                  <li>Not use automated systems or bots to access the Service without our written permission</li>
                </ul>
              </div>
            </section>

            <section id="acceptable-use">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">5. Acceptable Use</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>You may not use Intentéo to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload or transmit malware, viruses, or other harmful code</li>
                  <li>Phish, spam, or otherwise attempt to deceive other users</li>
                  <li>Harass, abuse, or harm other users or third parties</li>
                  <li>Violate the intellectual property rights of others</li>
                  <li>Engage in any activity that could damage, disable, or impair the Service</li>
                  <li>Resell or redistribute the Service without written authorization</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate your access to the Service for violations of this acceptable use policy.
                </p>
              </div>
            </section>

            <section id="your-content">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">6. Your Content</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  You retain ownership of all content you create, input, or store in Intentéo, including your purposes, visions, goals, tasks, habits, journal entries, and reflections (&quot;Your Content&quot;).
                </p>
                <p>
                  By using Intentéo, you grant us a limited, non-exclusive license to process, store, and display Your Content solely for the purpose of providing the Service to you.
                </p>
                <p>
                  Since Intentéo primarily stores Your Content in your browser&apos;s local storage, Your Content remains on your device by default. We do not access, read, or use Your Content for advertising, profiling, or any purpose other than delivering the Service to you.
                </p>
              </div>
            </section>

            <section id="ip">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">7. Intentéo&apos;s Intellectual Property</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  The Service, including its design, code, features, branding, and documentation, is owned by Intentéo and protected by intellectual property laws. These Terms do not grant you any right, title, or interest in the Service beyond the limited right to use it as described in these Terms.
                </p>
                <p>
                  You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
                </p>
              </div>
            </section>

            <section id="third-party">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">8. Third-Party Services</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Intentéo may integrate with or contain links to third-party services. Your use of these third-party services is governed by their own terms and policies. We are not responsible for the availability, accuracy, or practices of third-party services.
                </p>
              </div>
            </section>

            <section id="availability">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">9. App and Website Availability</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We strive to keep Intentéo available and reliable, but we cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any downtime or disruption to the Service.
                </p>
              </div>
            </section>

            <section id="payments">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">10. Subscriptions and Payments</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  Intentéo may offer free and paid subscription tiers. If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law or as described in our cancellation policy.
                </p>
                <p>
                  We reserve the right to change our pricing with reasonable notice. Price changes will take effect at the start of your next billing cycle.
                </p>
              </div>
            </section>

            <section id="cancellation">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">11. Cancellation and Termination</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>You may cancel your account at any time through your account settings. Upon cancellation:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to paid features will end at the conclusion of your current billing period</li>
                  <li>Your account data will be removed from our systems within a reasonable timeframe</li>
                  <li>Since Intentéo stores most data locally, your browser-stored data will not be automatically deleted</li>
                </ul>
                <p>
                  We may suspend or terminate your access to the Service if you violate these Terms, with or without notice.
                </p>
              </div>
            </section>

            <section id="disclaimers">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">12. Disclaimers</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
                </p>
                <p>
                  We do not warrant that the Service will be error-free, secure, or continuously available, or that any defects will be corrected.
                </p>
              </div>
            </section>

            <section id="liability">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">13. Limitation of Liability</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  To the maximum extent permitted by law, Intentéo and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or business opportunities arising from your use of the Service.
                </p>
                <p>
                  Our total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
                </p>
              </div>
            </section>

            <section id="indemnification">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">14. Indemnification</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  You agree to indemnify, defend, and hold harmless Intentéo and its affiliates from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
                </p>
              </div>
            </section>

            <section id="service-changes">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">15. Changes to the Service</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We are constantly working to improve Intentéo. We may add, modify, or discontinue features at any time. We will provide reasonable notice of significant changes that materially affect your use of the Service.
                </p>
              </div>
            </section>

            <section id="terms-changes">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">16. Changes to These Terms</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
                </p>
              </div>
            </section>

            <section id="governing-law">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">17. Governing Law</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved in the applicable courts of competent jurisdiction.
                </p>
              </div>
            </section>

            <section id="contact">
              <h2 className="text-[1.35rem] font-bold text-foreground mt-12 mb-5 pb-2 border-b border-[#1E0E6B]/10">18. Contact Us</h2>
              <div className="space-y-4 text-[15px] leading-[1.8] text-muted-foreground">
                <p>
                  If you have any questions about these Terms, please contact us through our website or at the contact information provided on our Contact page.
                </p>
              </div>
            </section>

          </article>

          {/* Bottom links */}
          <div className="mx-auto max-w-[780px] mt-14 pt-8 border-t border-[#1E0E6B]/10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                See our Privacy Policy <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-[#1E0E6B] transition-colors"
              >
                Questions about these terms? Contact us <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
