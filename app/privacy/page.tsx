import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const privacySections = [
  {
    title: "Information we collect",
    body: "Ops Toolkit currently presents public product pages and public tools. If you contact the business, shared information such as your name, email address, and workflow details may be used to respond to your request.",
  },
  {
    title: "How information is used",
    body: "Information is used to answer inquiries, understand product demand, improve the toolkit, and support future customer relationships. It is not intended to create unnecessary data collection beyond operational communication needs.",
  },
  {
    title: "Operational data",
    body: "The current calculator experience is designed as a browser-side utility. Future authenticated features may introduce stored operational records, at which point this policy should be updated to reflect storage, retention, and access controls more specifically.",
  },
  {
    title: "Questions",
    body: "If you have questions about privacy or data handling, contact hello@opstoolkit.app.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Privacy Policy"
        title={<>Clear privacy expectations for a <span className="text-gradient">focused operational product</span></>}
        description="This policy is intentionally concise and aligned with the current scope of the product foundation built in this release."
      />
      <SectionShell title="Policy overview" description="The product is being built in stages, so the policy mirrors the current scope and signals where future updates will be needed.">
        <div className="grid gap-6">
          {privacySections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}


