import { PageHero } from "@/components/sections/page-hero";
import { SectionShell } from "@/components/sections/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const termsSections = [
  {
    title: "Product scope",
    body: "Ops Toolkit is a utility-oriented software product. It is intended to help users estimate, track, and structure operational work, but it does not replace professional legal, payroll, accounting, or compliance advice.",
  },
  {
    title: "Use of public calculators",
    body: "Public tools, including the UAE Overtime Calculator, are provided for informational and operational estimation purposes. Users remain responsible for confirming company policy, contracts, and legal requirements before relying on calculated outputs.",
  },
  {
    title: "Future feature changes",
    body: "Features, pricing, and access models may change as the product evolves from public utilities into richer operational workflows and collaborative mini-systems.",
  },
  {
    title: "Contact",
    body: "Questions about these terms can be sent to hello@opstoolkit.app.",
  },
];

export default function TermsPage() {
  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Terms"
        title={<>Simple terms for a <span className="text-gradient">practical operations toolkit</span></>}
        description="The legal page keeps the boundaries of the product clear without burying users in unnecessary complexity."
      />
      <SectionShell title="Terms overview" description="These terms match the current public scope of the product and clarify how the utilities should be used.">
        <div className="grid gap-6">
          {termsSections.map((section) => (
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


