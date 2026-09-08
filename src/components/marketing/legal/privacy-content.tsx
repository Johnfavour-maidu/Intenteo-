"use client"

import { LegalPageLayout } from "./legal-page-layout"

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "info-collect", label: "Information We Collect" },
  { id: "info-provide", label: "Information You Provide" },
  { id: "info-automatic", label: "Automatically Collected" },
  { id: "how-use", label: "How We Use Your Information" },
  { id: "how-share", label: "How We Share Your Information" },
  { id: "cookies", label: "Cookies" },
  { id: "storage-security", label: "Data Storage & Security" },
  { id: "retention", label: "Data Retention" },
  { id: "rights", label: "Your Privacy Rights" },
  { id: "deletion", label: "Account & Data Deletion" },
  { id: "children", label: "Children's Privacy" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "transfers", label: "International Data Transfers" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
]

export function PrivacyContent() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="How Intenteo collects, uses, stores, and protects your information."
      lastUpdated="September 8, 2026"
      tocItems={tocItems}
      tocTitle="Privacy Policy"
      otherPageLabel="Terms of Service"
      otherPageHref="/terms"
      contactLabel="Questions about this policy? Contact us"
    >
      <section id="introduction">
        <h2>Introduction</h2>
        <p>
          Intenteo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and application.
        </p>
        <p>
          By using Intenteo, you agree to the collection and use of information in accordance with this policy. If you do not agree, please discontinue use of our services.
        </p>
      </section>

      <section id="info-collect">
        <h2>Information We Collect</h2>
        <p>
          We collect information to provide and improve our services. The types of information we collect fall into two categories: information you provide directly and information collected automatically.
        </p>
      </section>

      <section id="info-provide">
        <h2>Information You Provide</h2>
        <p>When you create an account or use Intenteo, you may provide:</p>
        <ul>
          <li><strong>Account information</strong> — name, email address, and password</li>
          <li><strong>Profile data</strong> — avatar, preferences, and settings</li>
          <li><strong>Content you create</strong> — purposes, visions, goals, tasks, habits, journal entries, reflections, and any other data you enter into the application</li>
          <li><strong>Communications</strong> — messages you send to us through support channels or feedback forms</li>
        </ul>
      </section>

      <section id="info-automatic">
        <h2>Information Collected Automatically</h2>
        <p>When you access Intenteo, we may automatically collect:</p>
        <ul>
          <li><strong>Device information</strong> — browser type, operating system, device identifiers</li>
          <li><strong>Usage data</strong> — pages viewed, features used, actions taken, timestamps</li>
          <li><strong>Log data</strong> — IP address, access times, referring URLs</li>
          <li><strong>Local storage data</strong> — Intenteo uses browser local storage to persist your data locally on your device. This data is not transmitted to our servers unless you explicitly sync or back up your data.</li>
        </ul>
      </section>

      <section id="how-use">
        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve Intenteo</li>
          <li>Personalize your experience and deliver content relevant to your goals</li>
          <li>Calculate your Intent Score and provide insights</li>
          <li>Send important account-related notifications</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Detect and prevent fraud, abuse, or security issues</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section id="how-share">
        <h2>How We Share Your Information</h2>
        <p>We do not sell your personal information. We may share information with:</p>
        <ul>
          <li><strong>Service providers</strong> — third parties that help us operate our services (hosting, analytics, email delivery), bound by contractual obligations to protect your data</li>
          <li><strong>Legal requirements</strong> — when required by law, regulation, or valid legal process</li>
          <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, with notice to you</li>
          <li><strong>With your consent</strong> — when you explicitly authorize us to share your information</li>
        </ul>
      </section>

      <section id="cookies">
        <h2>Cookies and Similar Technologies</h2>
        <p>
          Intenteo uses cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns. You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of our services.
        </p>
      </section>

      <section id="storage-security">
        <h2>Data Storage and Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information. These include encryption in transit (TLS/HTTPS), encryption at rest, access controls, and regular security audits.
        </p>
        <p>
          Intenteo primarily stores your data in browser local storage on your device. This means your data stays on your device by default and is not automatically transmitted to our servers.
        </p>
      </section>

      <section id="retention">
        <h2>Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to provide our services. If you delete your account, we will remove your data within a reasonable timeframe, except where required to retain certain information for legal or legitimate business purposes.
        </p>
      </section>

      <section id="rights">
        <h2>Your Privacy Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
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
      </section>

      <section id="deletion">
        <h2>Account and Data Deletion</h2>
        <p>
          You may delete your account at any time from your account settings. Upon deletion, your account data will be permanently removed from our systems. Since Intenteo stores most data locally in your browser, deleting your account does not automatically remove data stored on your device — you should clear your browser data separately if desired.
        </p>
      </section>

      <section id="children">
        <h2>Children&apos;s Privacy</h2>
        <p>
          Intenteo is not intended for children under 13 (or the applicable age of consent in your jurisdiction). We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
        </p>
      </section>

      <section id="third-party">
        <h2>Third-Party Services</h2>
        <p>
          Intenteo may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party services you access through Intenteo.
        </p>
      </section>

      <section id="transfers">
        <h2>International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are conducted with appropriate safeguards to protect your data in accordance with applicable data protection laws.
        </p>
      </section>

      <section id="changes">
        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of Intenteo after changes are posted constitutes acceptance of the updated policy.
        </p>
      </section>

      <section id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please contact us through our website or at the contact information provided on our Contact page.
        </p>
      </section>
    </LegalPageLayout>
  )
}
