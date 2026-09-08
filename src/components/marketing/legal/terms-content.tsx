"use client"

import { LegalPageLayout } from "./legal-page-layout"

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "eligibility", label: "Eligibility" },
  { id: "account", label: "Creating an Account" },
  { id: "responsibilities", label: "Your Responsibilities" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "your-content", label: "Your Content" },
  { id: "ip", label: "Intellectual Property" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "availability", label: "Availability" },
  { id: "payments", label: "Subscriptions & Payments" },
  { id: "cancellation", label: "Cancellation & Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "service-changes", label: "Changes to the Service" },
  { id: "terms-changes", label: "Changes to These Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact Us" },
]

export function TermsContent() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The terms that govern your use of Intenteo."
      lastUpdated="September 8, 2026"
      tocItems={tocItems}
      tocTitle="Terms of Service"
      otherPageLabel="Privacy Policy"
      otherPageHref="/privacy"
      contactLabel="Questions about these terms? Contact us"
    >
      <section id="introduction">
        <h2>Introduction</h2>
        <p>
          Welcome to Intenteo. These Terms of Service (&quot;Terms&quot;) govern your access to and use of the Intenteo website, application, and services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
        </p>
        <p>
          Please read these Terms carefully before using Intenteo. If you do not agree to these Terms, you may not access or use the Service.
        </p>
      </section>

      <section id="eligibility">
        <h2>Eligibility</h2>
        <p>
          You must be at least 13 years old (or the minimum age required in your jurisdiction) to use Intenteo. By creating an account or using the Service, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.
        </p>
      </section>

      <section id="account">
        <h2>Creating an Account</h2>
        <p>To use certain features of Intenteo, you must create an account. When creating an account, you agree to:</p>
        <ul>
          <li>Provide accurate, current, and complete information</li>
          <li>Maintain the security of your password and account credentials</li>
          <li>Promptly update your account information if it changes</li>
          <li>Accept responsibility for all activities that occur under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>
        <p>
          You are responsible for safeguarding your account credentials. Intenteo is not liable for any loss or damage arising from your failure to maintain the security of your account.
        </p>
      </section>

      <section id="responsibilities">
        <h2>Your Responsibilities</h2>
        <p>As a user of Intenteo, you agree to:</p>
        <ul>
          <li>Use the Service in compliance with all applicable laws and regulations</li>
          <li>Not use the Service for any unlawful or fraudulent purpose</li>
          <li>Not attempt to gain unauthorized access to any part of the Service</li>
          <li>Not interfere with or disrupt the Service or its infrastructure</li>
          <li>Not use automated systems or bots to access the Service without our written permission</li>
        </ul>
      </section>

      <section id="acceptable-use">
        <h2>Acceptable Use</h2>
        <p>You may not use Intenteo to:</p>
        <ul>
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
      </section>

      <section id="your-content">
        <h2>Your Content</h2>
        <p>
          You retain ownership of all content you create, input, or store in Intenteo, including your purposes, visions, goals, tasks, habits, journal entries, and reflections (&quot;Your Content&quot;).
        </p>
        <p>
          By using Intenteo, you grant us a limited, non-exclusive license to process, store, and display Your Content solely for the purpose of providing the Service to you.
        </p>
        <p>
          Since Intenteo primarily stores Your Content in your browser&apos;s local storage, Your Content remains on your device by default. We do not access, read, or use Your Content for advertising, profiling, or any purpose other than delivering the Service to you.
        </p>
      </section>

      <section id="ip">
        <h2>Intenteo&apos;s Intellectual Property</h2>
        <p>
          The Service, including its design, code, features, branding, and documentation, is owned by Intenteo and protected by intellectual property laws. These Terms do not grant you any right, title, or interest in the Service beyond the limited right to use it as described in these Terms.
        </p>
        <p>
          You may not copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
        </p>
      </section>

      <section id="third-party">
        <h2>Third-Party Services</h2>
        <p>
          Intenteo may integrate with or contain links to third-party services. Your use of these third-party services is governed by their own terms and policies. We are not responsible for the availability, accuracy, or practices of third-party services.
        </p>
      </section>

      <section id="availability">
        <h2>App and Website Availability</h2>
        <p>
          We strive to keep Intenteo available and reliable, but we cannot guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We are not liable for any downtime or disruption to the Service.
        </p>
      </section>

      <section id="payments">
        <h2>Subscriptions and Payments</h2>
        <p>
          Intenteo may offer free and paid subscription tiers. If you subscribe to a paid plan, you agree to pay all applicable fees. Fees are non-refundable except as required by law or as described in our cancellation policy.
        </p>
        <p>
          We reserve the right to change our pricing with reasonable notice. Price changes will take effect at the start of your next billing cycle.
        </p>
      </section>

      <section id="cancellation">
        <h2>Cancellation and Termination</h2>
        <p>You may cancel your account at any time through your account settings. Upon cancellation:</p>
        <ul>
          <li>Your access to paid features will end at the conclusion of your current billing period</li>
          <li>Your account data will be removed from our systems within a reasonable timeframe</li>
          <li>Since Intenteo stores most data locally, your browser-stored data will not be automatically deleted</li>
        </ul>
        <p>
          We may suspend or terminate your access to the Service if you violate these Terms, with or without notice.
        </p>
      </section>

      <section id="disclaimers">
        <h2>Disclaimers</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
        </p>
        <p>
          We do not warrant that the Service will be error-free, secure, or continuously available, or that any defects will be corrected.
        </p>
      </section>

      <section id="liability">
        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Intenteo and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or business opportunities arising from your use of the Service.
        </p>
        <p>
          Our total liability to you for any claims arising from or related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
        </p>
      </section>

      <section id="indemnification">
        <h2>Indemnification</h2>
        <p>
          You agree to indemnify, defend, and hold harmless Intenteo and its affiliates from any claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
        </p>
      </section>

      <section id="service-changes">
        <h2>Changes to the Service</h2>
        <p>
          We are constantly working to improve Intenteo. We may add, modify, or discontinue features at any time. We will provide reasonable notice of significant changes that materially affect your use of the Service.
        </p>
      </section>

      <section id="terms-changes">
        <h2>Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of material changes by posting the updated Terms on this page and updating the &quot;Last updated&quot; date. Continued use of the Service after changes are posted constitutes your acceptance of the updated Terms.
        </p>
      </section>

      <section id="governing-law">
        <h2>Governing Law</h2>
        <p>
          These Terms are governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service shall be resolved in the applicable courts of competent jurisdiction.
        </p>
      </section>

      <section id="contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us through our website or at the contact information provided on our Contact page.
        </p>
      </section>
    </LegalPageLayout>
  )
}
