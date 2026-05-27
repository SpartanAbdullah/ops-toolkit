import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Terms of Use",
  description: "Terms of use for the Ops Toolkit internal application.",
});

export default function TermsPage() {
  return (
    <LegalPageShell title="Terms of Use" effectiveDate="24 May 2026">
      <p>
        These Terms of Use (&ldquo;<strong>Terms</strong>&rdquo;) govern your access to and use of Ops Toolkit (the
        &ldquo;<strong>App</strong>&rdquo;), an internal operations application made available by Interior360
        (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;). By creating an account or signing in,
        you agree to these Terms and to our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>1. Who may use the App</h2>
      <p>
        The App is provided for internal use by Interior360 employees and authorised team members in the United Arab
        Emirates. You may only use it in connection with your role at Interior360 or the team that invited you. Sharing
        your credentials or letting another person sign in as you is not permitted.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must provide accurate registration information and keep it up to date.</li>
        <li>You are responsible for the activity that happens under your account.</li>
        <li>Choose a strong password (minimum eight characters) and keep it confidential. Notify us immediately at <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> if you suspect unauthorised access.</li>
        <li>You must be at least 18 years old to use the App.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the App for any unlawful purpose, or in any way that violates UAE law;</li>
        <li>enter personal data of any third party without a lawful basis;</li>
        <li>attempt to bypass authentication, authorisation, or rate limits;</li>
        <li>scrape, mirror, or reverse-engineer the App;</li>
        <li>interfere with or disrupt the App or the infrastructure that supports it;</li>
        <li>upload malware or content that infringes third-party rights.</li>
      </ul>

      <h2>4. Data you enter</h2>
      <p>
        You are responsible for the accuracy of the operational data you enter, including overtime hours, petty cash
        amounts, categories, vendors, and notes. The App provides calculation helpers — including UAE MOHRE-aligned
        overtime calculations under Federal Decree-Law No. 33 of 2021 — as a convenience. <strong>You and Interior360
        remain responsible for verifying calculations against current law and for the underlying payroll, accounting,
        and tax obligations.</strong>
      </p>

      <h2>5. Edits, voids, and the audit trail</h2>
      <p>
        The App records who creates, edits, voids, or approves each entry. Petty cash transactions that are voided
        remain visible in the ledger with the reason you provide and are excluded from balances; they are not deleted.
        Edits to overtime entries are tracked alongside the original calculation. This is intentional — do not rely on
        the App as a way to remove records from the audit trail.
      </p>

      <h2>6. Service availability</h2>
      <p>
        We aim to keep the App available but provide no specific uptime guarantee. We may carry out maintenance,
        upgrade dependencies, change features, or temporarily suspend access for security reasons without prior notice.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The App, including its design, brand marks, and source materials, is owned by Interior360 and protected by
        applicable laws. No rights are granted to you other than a limited, revocable, non-transferable right to use
        the App for its intended internal purpose.
      </p>

      <h2>8. Termination</h2>
      <p>
        We may suspend or terminate your access at any time if you breach these Terms, leave Interior360, or for any
        other reasonable business reason. You may close your account by emailing{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. Audit logs, overtime entries, and
        petty cash transactions will be retained per our{" "}
        <a href="/privacy">Privacy Policy</a> even after account closure.
      </p>

      <h2>9. Disclaimer</h2>
      <p>
        The App is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied, including
        warranties of merchantability, fitness for a particular purpose, or non-infringement. We do not warrant that
        calculations or reports are error-free or that the App will meet your specific compliance needs.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Interior360 will not be liable for any indirect, incidental, special,
        consequential, or punitive damages, or for any loss of profits, revenue, data, or goodwill, arising out of or
        related to your use of the App. Our total aggregate liability for any direct damages will not exceed AED 100.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the United Arab Emirates. Any dispute will be resolved by the courts
        of the Emirate in which Interior360 is registered, unless mandatory law provides otherwise.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms from time to time. The updated version takes effect when posted; material changes
        will be communicated by email or in-app notice. Continued use of the App after a change constitutes acceptance
        of the revised Terms.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </LegalPageShell>
  );
}
