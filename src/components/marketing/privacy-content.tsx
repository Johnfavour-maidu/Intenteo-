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

export function PrivacyContent() {
  return (
    <section className="py-10 md:py-14 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: September 8, 2026</p>

          <div className="mt-8 space-y-8">
            <PolicySection title="1. Introduction">
              <p>
                Inteéntéo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                when you use our website and application (collectively, the &quot;Service&quot;).
              </p>
              <p>
                Please read this policy carefully. If you do not agree with the terms of this Privacy Policy,
                please do not access the Service.
              </p>
            </PolicySection>

            <PolicySection title="2. Information We Collect">
              <p>We may collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Account information such as your name, email address, and password when you create an account.</li>
                <li>Content you create within the Service, such as goals, tasks, habits, journal entries, and reflections.</li>
                <li>Communications you send to us, such as support requests or feedback.</li>
              </ul>
              <p>
                We may also automatically collect certain information when you use the Service, such as
                device information, browser type, operating system, and usage data. This information helps us
                improve the Service and your experience.
              </p>
            </PolicySection>

            <PolicySection title="3. How We Use Information">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide, maintain, and improve the Service.</li>
                <li>Personalize your experience and deliver content relevant to your goals.</li>
                <li>Send administrative information, such as updates, security alerts, and support messages.</li>
                <li>Respond to your comments, questions, and customer service requests.</li>
                <li>Monitor and analyze usage trends and preferences to improve the Service.</li>
                <li>Detect, prevent, and address technical issues and fraudulent activity.</li>
              </ul>
            </PolicySection>

            <PolicySection title="4. Cookies and Similar Technologies">
              <p>
                We use cookies and similar tracking technologies to maintain your session and remember your
                preferences. You can instruct your browser to refuse all cookies, though some features of
                the Service may not function properly without them.
              </p>
            </PolicySection>

            <PolicySection title="5. How We Share Information">
              <p>
                We do not sell your personal information. We may share your information only in the following
                circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>With service providers who perform services on our behalf, such as hosting and analytics.</li>
                <li>When required by law, regulation, or legal process.</li>
                <li>To protect the rights, property, or safety of Inteéntéo, our users, or the public.</li>
                <li>In connection with a merger, acquisition, or sale of all or a portion of our assets, with appropriate notice.</li>
              </ul>
            </PolicySection>

            <PolicySection title="6. Data Storage and Security">
              <p>
                We implement commercially reasonable security measures to protect your personal information.
                However, no method of transmission over the Internet or electronic storage is completely secure,
                and we cannot guarantee absolute security.
              </p>
            </PolicySection>

            <PolicySection title="7. Data Retention">
              <p>
                We retain your personal information for as long as your account is active or as needed to
                provide the Service. If you delete your account, we will remove your personal data within
                a reasonable period, except where we are required to retain certain information for legal
                or legitimate business purposes.
              </p>
            </PolicySection>

            <PolicySection title="8. Your Rights and Choices">
              <p>
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access, correct, or delete your personal information.</li>
                <li>Opt out of certain data collection or processing activities.</li>
                <li>Export your data in a portable format.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p>
                To exercise these rights, please contact us at{" "}
                <a href="mailto:hello@intenteo.com" className="font-medium text-[#1E0E6B] hover:underline">hello@intenteo.com</a>.
              </p>
            </PolicySection>

            <PolicySection title="9. Children&apos;s Privacy">
              <p>
                The Service is not intended for children under 13 years of age. We do not knowingly collect
                personal information from children under 13. If you are a parent or guardian and believe
                your child has provided us with personal information, please contact us.
              </p>
            </PolicySection>

            <PolicySection title="10. Third-Party Services">
              <p>
                The Service may contain links to third-party websites or services. We are not responsible for
                the privacy practices of those third parties. We encourage you to review the privacy policies
                of any third-party services you access.
              </p>
            </PolicySection>

            <PolicySection title="11. Changes to This Privacy Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by
                posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued
                use of the Service after any changes constitutes acceptance of the updated policy.
              </p>
            </PolicySection>

            <PolicySection title="12. Contact Us">
              <p>
                If you have questions about this Privacy Policy, please contact us at{" "}
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
