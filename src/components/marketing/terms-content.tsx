"use client"

import Link from "next/link"

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

export function TermsContent() {
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

          <div className="mt-8 space-y-8">
            <PolicySection title="1. Introduction">
              <p>
                Welcome to Intentéo. These Terms of Service (&quot;Terms&quot;) govern your access to and use
                of the Intentéo website and application (collectively, the &quot;Service&quot;). By accessing
                or using the Service, you agree to be bound by these Terms.
              </p>
              <p>
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </PolicySection>

            <PolicySection title="2. Eligibility">
              <p>
                You must be at least 13 years of age to use the Service. By using the Service, you represent
                and warrant that you meet this age requirement and have the legal capacity to enter into
                these Terms.
              </p>
            </PolicySection>

            <PolicySection title="3. Account Registration">
              <p>
                To access certain features, you may need to create an account. You agree to provide accurate,
                current, and complete information during registration and to keep your account credentials
                secure. You are responsible for all activity that occurs under your account.
              </p>
              <p>
                You must notify us immediately if you suspect unauthorized access to your account.
              </p>
            </PolicySection>

            <PolicySection title="4. Use of Intentéo">
              <p>
                Intentéo is a personal productivity and intentional living platform. You may use the Service
                for your own personal, non-commercial purposes. You agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Service for any unlawful purpose or in violation of these Terms.</li>
                <li>Attempt to gain unauthorized access to any part of the Service.</li>
                <li>Interfere with or disrupt the integrity or performance of the Service.</li>
                <li>Reverse engineer, decompile, or disassemble any aspect of the Service.</li>
                <li>Use automated systems to access the Service without our written permission.</li>
              </ul>
            </PolicySection>

            <PolicySection title="5. User Content">
              <p>
                You retain ownership of any content you create within the Service, including goals, tasks,
                habits, journal entries, and reflections (&quot;User Content&quot;). By creating User Content,
                you grant us a limited license to store, process, and display that content as necessary to
                provide the Service.
              </p>
              <p>
                We will not use your User Content for purposes other than providing and improving the Service
                without your explicit consent.
              </p>
            </PolicySection>

            <PolicySection title="6. Acceptable Use">
              <p>
                You agree not to upload, post, or transmit content that is harmful, threatening, abusive,
                harassing, defamatory, or otherwise objectionable. We reserve the right to suspend or
                terminate accounts that violate these standards.
              </p>
            </PolicySection>

            <PolicySection title="7. Intellectual Property">
              <p>
                The Service, including its design, features, and underlying technology, is owned by Intentéo
                and protected by copyright, trademark, and other intellectual property laws. You may not
                copy, modify, distribute, or create derivative works based on the Service without our prior
                written consent.
              </p>
            </PolicySection>

            <PolicySection title="8. Third-Party Services">
              <p>
                The Service may integrate with or link to third-party services. We are not responsible for
                the availability, content, or practices of third-party services. Your use of third-party
                services is governed by their own terms and policies.
              </p>
            </PolicySection>

            <PolicySection title="9. Subscriptions and Payments">
              <p>
                If Intentéo offers paid subscriptions, the terms of pricing, billing, and cancellation will
                be provided at the time of purchase. All payments are non-refundable unless stated otherwise
                or required by applicable law.
              </p>
            </PolicySection>

            <PolicySection title="10. Disclaimers">
              <p>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                whether express or implied. We do not warrant that the Service will be uninterrupted, error-free,
                or secure. We disclaim all warranties, including implied warranties of merchantability, fitness
                for a particular purpose, and non-infringement.
              </p>
            </PolicySection>

            <PolicySection title="11. Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Intentéo shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenue,
                whether incurred directly or indirectly, arising from your use of the Service.
              </p>
            </PolicySection>

            <PolicySection title="12. Termination">
              <p>
                We may suspend or terminate your access to the Service at any time, with or without cause,
                with or without notice. Upon termination, your right to use the Service ceases immediately.
                You may also terminate your account at any time by contacting us.
              </p>
            </PolicySection>

            <PolicySection title="13. Changes to the Terms">
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of material
                changes by posting the updated Terms on this page. Your continued use of the Service after
                changes are posted constitutes acceptance of the revised Terms.
              </p>
            </PolicySection>

            <PolicySection title="14. Governing Law">
              <p>
                These Terms are governed by and construed in accordance with applicable laws, without regard
                to conflict of law principles. Any disputes arising from these Terms or the Service shall be
                resolved in the competent courts of the applicable jurisdiction.
              </p>
            </PolicySection>

            <PolicySection title="15. Contact Us">
              <p>
                If you have questions about these Terms, please contact us at{" "}
                <a href="mailto:hello@intenteo.com" className="font-medium text-[#1E0E6B] hover:underline">hello@intenteo.com</a>.
              </p>
            </PolicySection>
          </div>

          <div className="mt-10 pt-6 border-t border-border/40">
            <Link href="/" className="text-sm font-medium text-[#1E0E6B] hover:underline">
              &larr; Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
