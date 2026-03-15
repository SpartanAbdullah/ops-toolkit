import { LegalPageShell, LegalSection } from "@/components/legal/legal-page-shell";
import { buildMetadata, siteConfig } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "Read the Ops Toolkit privacy policy covering account data, operational records, technical information, service providers, retention, and policy updates.",
  path: "/privacy",
  keywords: ["ops toolkit privacy", "operations software privacy policy"],
});

export default function PrivacyPage() {
  return (
    <LegalPageShell
      title="Privacy Policy"
      description="This Privacy Policy explains what information Ops Toolkit may collect, how that information is used to operate the service, and the practical limits of the current product."
      lastUpdated={siteConfig.legalEffectiveDate}
      relatedLinks={[
        { label: "Terms of Service", href: "/terms", variant: "secondary" },
      ]}
    >
      <LegalSection title="What Ops Toolkit is">
        <p>
          Ops Toolkit is a lightweight operations product for teams that need faster day-to-day tools for workflows such as overtime tracking, petty cash logging, team setup, and reporting.
        </p>
        <p>
          Some parts of Ops Toolkit are public, such as marketing pages and public tools. Other parts are private and require an account so users can save data and work inside an authenticated workspace.
        </p>
      </LegalSection>

      <LegalSection title="Information we may collect">
        <p>We collect only the information needed to run the service and support users.</p>
        <ul>
          <li>Account information, such as name, email address, authentication details, and basic profile information.</li>
          <li>Operational data entered into the product, such as team names, member roles, overtime entries, petty cash transactions, notes, dates, hours, amounts, statuses, and report filters.</li>
          <li>Technical information, such as browser type, device type, IP address, log data, and basic diagnostic information generated when the app is used.</li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use information">
        <ul>
          <li>To create and manage user accounts and authenticated sessions.</li>
          <li>To save, organize, display, and export the operational records users choose to enter.</li>
          <li>To keep team workspaces, permissions, and role-based views functioning correctly.</li>
          <li>To maintain security, investigate issues, and improve reliability and usability.</li>
          <li>To respond to support requests, product questions, and service-related communications.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Data sharing and service providers">
        <p>
          Ops Toolkit does not sell personal data. We may use trusted infrastructure and software providers to host the application, authenticate users, store data, monitor reliability, and deliver core product functionality.
        </p>
        <p>
          Those providers may process information on our behalf only as needed to operate the service. We do not share customer data for unrelated advertising or resale purposes.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use reasonable administrative and technical measures to protect the service, but no online system can promise absolute security. Users should also manage access carefully inside their own organizations, especially when operational or financial records are involved.
        </p>
      </LegalSection>

      <LegalSection title="Data retention">
        <p>
          We keep account and workspace data for as long as it is reasonably needed to operate the service, maintain records, resolve disputes, meet legal obligations, or support legitimate product administration.
        </p>
        <p>
          Retention periods may vary depending on the type of data and the status of the account. We may delete or anonymize data when it is no longer reasonably needed.
        </p>
      </LegalSection>

      <LegalSection title="Children's privacy">
        <p>
          Ops Toolkit is intended for business and operational use and is not directed to children under 13. If you believe a child has provided personal information through the service, contact us and we will review the request.
        </p>
      </LegalSection>

      <LegalSection title="Policy updates and contact">
        <p>
          We may update this Privacy Policy as the product changes. When we do, we will update the "Last updated" date on this page.
        </p>
        <p>
          Questions about this Privacy Policy can be sent to{" "}
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
