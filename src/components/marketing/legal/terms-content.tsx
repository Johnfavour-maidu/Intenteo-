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
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-[3.25rem]">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">The terms that govern your use of Intenteo.</p>
            <p className="mt-3 text-sm text-muted-foreground/70">Last updated: September 8, 2026</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <article className="mx-auto max-w-[800px] text-[15px] leading-[1.75] text-muted-foreground">

            <section id="introduction">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4 first:mt-0">Introduction</h2>
              <p className="mb-4">
                Welcome to Intenteo. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Intenteo website, application, and services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
              </p>
              <p className="mb-4">
                Please read these Terms carefully before using Intenteo. If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section id="eligibility">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Eligibility</h2>
              <p className="mb-4">
                You must be at least 13 years old (or the minimum age required in your jurisdiction) to use Intenteo. By creating an account or using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
              </p>
            </section>

            <section id="account">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Creating an Account</h2>
              <p className="mb-4">To use certain features of Intenteo, you must create an account. When creating an account, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account credentials</li>
                <li>Promptly update your account information if it changes</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="mb-4">
                You are responsible for safeguarding your account credentials. Intenteo is not liable for any loss or damage arising from your failure to maintain the security of your account.
              </p>
            </section>

            <section id="responsibilities">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Your Responsibilities</h2>
              <p className="mb-4">As a user of Intenteo, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Not use the Service for any unlawful or fraudulent purpose</li>
                <li>Not attempt to gain unauthorized access to any part of the Service</li>
                <li>Not interfere with or disrupt the Service or its infrastructure</li>
                <li>Not use automated systems or bots to access the Service without our written permission</li>
              </ul>
            </section>

            <section id="acceptable-use">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Acceptable Use</h2>
              <p className="mb-4">You may not use Intenteo to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Upload or transmit malware, viruses, or other harmful code</li>
                <li>Phish, spam, or otherwise attempt to deceive other users</li>
                <li>Harass, abuse, or harm other users or third parties</li>
                <li>Violate the intellectual property rights of others</li>
                <li>Engage in any activity that could damage, disable, or impair the Service</li>
                <li>Resell or redistribute the Service without written authorization</li>
              </ul>
              <p className="mb-4">
                We reserve the right to suspend or terminate your access to the Service for violations of this acceptable use policy.
              </p>
            </section>

            <section id="your-content">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Your Content</h2>
              <p className="mb-4">
                You retain ownership of all content you create, input, or store in Intenteo, including your purposes, visions, goals, tasks, habits, journal entries, and reflections (&quot;Your Content&quot;).
              </p>
              <p className="mb-4">
                By using Intenteo, you grant us a limited, non-exclusive license to process, store, and display Your Content solely for the purpose of providing the Service to you.
              </p>
              <p className="mb-4">
                Since Intenteo primarily stores Your Content in your browser&apos;s local storage, Your Content remains on your device by default. We do not access, read, or use Your Content for advertising, profiling, or any purpose other than delivering the Service to you.
              </p>
            </section>

            <section id="ip">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Intenteo&apos;s Intellectual Property</h2>
              <p className="mb-4">
                The Service, including its design, code, features, branding, and documentation, is owned by Intenteo and protected by intellectual property laws. These Terms do not grant you any right, title, or interest in the Service beyond the limited right to use it as described in these Terms.
              </p>
              <p className="mb-4">
                You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
              </p>
            </section>

            <section id="third-party">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Third-Party Services</h2>
              <p className="mb-4">
                Intenteo may integrate with or contain links to third-party services. Your use of these third-party services is governed by their own terms and policies. We are not responsible for the availability, accuracy, or practices of third-party services.
              </p>
            </section>

            <section id="availability">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">App and Website Availability</h2>
              <p className="mb-4">
                We strive to keep Intenteo available and reliable, but we cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any downtime or disruption to the Service.
              </p>
            </section>

            <section id="payments">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Subscriptions and Payments</h2>
              <p className="mb-4">
                Intenteo may offer free and paid subscription tiers. If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law or as described in our cancellation policy.
              </p>
              <p className="mb-4">
                We reserve the right to change our pricing with reasonable notice. Price changes will take effect at the start of your next billing cycle.
              </p>
            </section>

            <section id="cancellation">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Cancellation and Termination</h2>
              <p className="mb-4">You may cancel your account at any time through your account settings. Upon cancellation:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your access to paid features will end at the conclusion of your current billing period</li>
                <li>Your account data will be removed from our systems within a reasonable timeframe</li>
                <li>Since Intenteo stores most data locally, your browser-stored data will not be automatically deleted</li>
              </ul>
              <p className="mb-4">
                We may suspend or terminate your access to the Service if you violate these Terms, with or without notice.
              </p>
            </section>

            <section id="disclaimers">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Disclaimers</h2>
              <p className="mb-4">
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="mb-4">
                We do not warrant that the Service will be error-free, secure, or continuously available, or that any defects will be corrected.
              </p>
            </section>

            <section id="liability">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, Intenteo and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or business opportunities arising from your use of the Service.
              </p>
              <p className="mb-4">
                Our total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section id="indemnification">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless Intenteo and its affiliates from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
              </p>
            </section>

            <section id="service-changes">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Changes to the Service</h2>
              <p className="mb-4">
                We are constantly working to improve Intenteo. We may add, modify, or discontinue features at any time. We will provide reasonable notice of significant changes that materially affect your use of the Service.
              </p>
            </section>

            <section id="terms-changes">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Changes to These Terms</h2>
              <p className="mb-4">
                We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
              </p>
            </section>

            <section id="governing-law">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Governing Law</h2>
              <p className="mb-4">
                These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved in the applicable courts of competent jurisdiction.
              </p>
            </section>

            <section id="contact">
              <h2 className="text-xl font-semibold text-foreground mt-10 mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us through our website or at the contact information provided on our Contact page.
              </p>
            </section>

          </article>

          {/* Bottom links */}
          <div className="mx-auto max-w-[800px] mt-12 pt-8 border-t border-[#1E0E6B]/10">
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
