import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Terms of Service",
  description:
    "Read the Ops Toolkit Terms of Service covering lawful use, account responsibility, user data, service availability, liability limits, and updates.",
  path: "/terms",
  keywords: ["ops toolkit terms", "operations software terms of use"],
});

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      description="These Terms of Service explain the basic rules for using Ops Toolkit and the practical limits of the current service."
      lastUpdated={siteConfig.legalEffectiveDate}
      relatedLinks={[
        { label: "Privacy Policy", href: "/privacy", variant: "secondary" },
      ]}
    >
      <LegalSection title="What the service is for">
        <p>
          Ops Toolkit is designed to help teams run practical operational workflows such as overtime tracking, petty cash logging, team coordination, and related reporting.
        </p>
        <p>
          The service is provided for operational support. It does not replace legal, accounting, tax, payroll, HR, or compliance advice.
        </p>
      </LegalSection>

      <LegalSection title="Lawful and acceptable use">
        <p>You agree to use Ops Toolkit only for lawful business or operational purposes.</p>
        <ul>
          <li>Do not use the service to violate laws, regulations, contracts, or workplace obligations.</li>
          <li>Do not attempt to access data, accounts, or systems you are not authorized to use.</li>
          <li>Do not misuse the service in a way that disrupts normal operation or harms other users.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Account responsibility">
        <p>
          You are responsible for keeping your account credentials secure and for activity that happens through your account. If you believe your account has been compromised, you should act promptly to secure it.
        </p>
      </LegalSection>

      <LegalSection title="Your data">
        <p>
          You retain ownership of the data you enter into Ops Toolkit. That includes operational records such as overtime entries, petty cash logs, notes, team information, and related workspace data.
        </p>
        <p>
          By using the service, you give Ops Toolkit permission to host, store, process, and display that data as needed to operate the product, secure the service, support features such as exports and reporting, and provide customer support.
        </p>
      </LegalSection>

      <LegalSection title="Availability and changes">
        <p>
          We aim to keep Ops Toolkit available and reliable, but the service is provided on an "as available" basis. Features may change, improve, or be removed over time, and temporary downtime may happen.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the extent allowed by law, Ops Toolkit is not liable for indirect, incidental, special, consequential, or punitive damages arising from use of the service. Users remain responsible for reviewing their own records, workflows, and operational decisions before relying on them.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          We may suspend or terminate access if the service is misused, if these terms are violated, or if continued access creates security, legal, or operational risk. You may also stop using the service at any time.
        </p>
      </LegalSection>

      <LegalSection title="Updates to these terms and contact">
        <p>
          We may update these Terms of Service as the product evolves. When we do, we will update the "Last updated" date on this page.
        </p>
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href={`mailto:${siteConfig.supportEmail}`}
            className="font-semibold text-text-primary underline-offset-4 hover:underline"
          >
            {siteConfig.supportEmail}
          </a>.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
