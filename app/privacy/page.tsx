import { LegalPageShell } from "@/components/layout/legal-page-shell";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "How Ops Toolkit collects, uses, and protects your personal data.",
});

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" effectiveDate="24 May 2026">
      <p>
        This Privacy Policy explains how Interior360 (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;)
        collects, uses, and protects personal data when you use Ops Toolkit (the &ldquo;<strong>App</strong>&rdquo;).
        Ops Toolkit is an internal operations tool used by the Interior360 team in the United Arab Emirates and is not
        offered to the general public.
      </p>

      <p>
        We process personal data in accordance with the United Arab Emirates Federal Decree-Law No. 45 of 2021 on the
        Protection of Personal Data (&ldquo;<strong>UAE PDPL</strong>&rdquo;).
      </p>

      <h2>1. Data Controller</h2>
      <p>
        Interior360 is the data controller for personal data processed through the App. For any privacy enquiry,
        contact us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>2. What we collect</h2>
      <p>We collect only what is necessary to operate the App:</p>
      <ul>
        <li><strong>Account data</strong> — name, work email, and password hash (via Supabase Auth) or Google account identifier if you sign in with Google.</li>
        <li><strong>Profile data</strong> — full name, phone number, time zone, and team membership.</li>
        <li><strong>Operational data you enter</strong> — overtime entries (worked dates, start/end times, calculated amounts), petty cash transactions (dates, amounts, categories, vendors, references, receipts), payment markers, approvals, and notes.</li>
        <li><strong>Audit metadata</strong> — a log of who created, edited, voided, or approved each record, with timestamps and a JSON snapshot of the change. This is required for the integrity of payroll-adjacent data.</li>
        <li><strong>Session and security data</strong> — authentication cookies set by Supabase. We do not use advertising cookies or trackers.</li>
      </ul>

      <h2>3. Why we process it (lawful basis)</h2>
      <ul>
        <li><strong>Performance of an employment-related contract</strong> — to record working hours, overtime, and petty cash on your behalf or your colleagues&rsquo;.</li>
        <li><strong>Legal obligation</strong> — to comply with UAE labour and tax requirements, including record-keeping for overtime under Federal Decree-Law No. 33 of 2021.</li>
        <li><strong>Legitimate interest</strong> — to maintain an audit trail, prevent fraud, and secure the App.</li>
      </ul>

      <h2>4. Who we share it with</h2>
      <p>
        We do not sell personal data and we do not share it with third parties for advertising. We use the following
        sub-processors to deliver the App:
      </p>
      <ul>
        <li><strong>Supabase</strong> — authentication, database hosting, and session storage. Data is stored in the AWS ap-southeast-1 region.</li>
        <li><strong>Google</strong> — only if you choose &ldquo;Sign in with Google&rdquo;, Google receives the standard OAuth claims.</li>
      </ul>
      <p>
        Where the App makes overtime or petty cash data available to a colleague (for example a team admin approving
        an entry), that sharing is internal to your Interior360 team only.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li><strong>Account and profile data</strong> — for as long as your account is active, then up to 30 days after closure unless a longer retention is required by law.</li>
        <li><strong>Overtime entries, petty cash transactions, and audit logs</strong> — retained for at least <strong>5 years</strong> to meet UAE record-keeping expectations for payroll and financial records, then deleted or anonymised.</li>
        <li><strong>Authentication logs from Supabase</strong> — retained per Supabase&rsquo;s defaults.</li>
      </ul>
      <p>
        Voided petty cash transactions are kept in the ledger with a void reason for the same retention period, so the
        audit trail remains intact.
      </p>

      <h2>6. Your rights</h2>
      <p>Under the UAE PDPL you have the right to:</p>
      <ul>
        <li>access the personal data we hold about you;</li>
        <li>request correction of inaccurate or incomplete data;</li>
        <li>request deletion of your personal data, subject to our legal obligation to retain payroll and financial records;</li>
        <li>object to or restrict processing in certain circumstances;</li>
        <li>request a copy of your data in a portable format;</li>
        <li>withdraw consent where processing relies on consent.</li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. We will respond within a reasonable
        period and in any event in line with the UAE PDPL.
      </p>

      <h2>7. Data security</h2>
      <p>
        We protect personal data with industry-standard measures: TLS in transit, encryption at rest in Supabase,
        scoped database access, server-side authorisation checks on every action, an immutable audit log of mutating
        events, and HSTS-enforced HTTPS with strict Content Security Policy headers. No system is perfectly secure;
        we will notify affected users without undue delay if a personal data breach is likely to result in a high risk
        to their rights.
      </p>

      <h2>8. International transfers</h2>
      <p>
        Personal data is stored on Supabase infrastructure in the AWS ap-southeast-1 region (Singapore). Any transfer
        outside the UAE is made under appropriate safeguards as required by the UAE PDPL.
      </p>

      <h2>9. Children</h2>
      <p>
        The App is for adult employees of Interior360 and its teams. We do not knowingly collect personal data from
        anyone under 18.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. When we do, we will update the &ldquo;Effective&rdquo; date at the
        top and, for material changes, notify active users by email or in-app.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions, requests, or complaints? Email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. You also have the right to lodge a
        complaint with the UAE Data Office.
      </p>
    </LegalPageShell>
  );
}
