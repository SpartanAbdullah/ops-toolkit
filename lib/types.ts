import type { LucideIcon } from "lucide-react";

export type IconTone = "blue" | "green" | "purple" | "amber" | "red";

export type ToolStatus = "Free" | "Pro" | "Coming Soon";

export type ToolCategory =
  | "Warehouse tools"
  | "HR & payroll tools"
  | "Admin & finance tools"
  | "Logistics tools"
  | "Utilities";

export type SolutionAudience =
  | "For warehouses"
  | "For HR teams"
  | "For small businesses"
  | "For operations managers"
  | "For admin teams";

export type FaqItem = {
  question: string;
  answer: string;
};

export type Tool = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  tone: IconTone;
  icon: LucideIcon;
  featured?: boolean;
  live?: boolean;
  bestFor: string;
  setupTime: string;
  output: string;
  problemSummary: string;
  benefitSummary: string;
  previewInputs: string[];
  previewOutputs: string[];
  faqs: FaqItem[];
};

export type Solution = {
  slug: string;
  label: SolutionAudience;
  title: string;
  summary: string;
  description: string;
  tone: IconTone;
  icon: LucideIcon;
  painPoints: string[];
  benefits: string[];
  relatedToolSlugs: string[];
};

export type NavGroup = {
  label: string;
  href: string;
  description: string;
};

export type PricingTier = {
  name: string;
  price: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  tone: IconTone;
  features: string[];
};


