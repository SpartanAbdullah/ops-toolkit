import {
  AlarmClockCheck,
  BadgePercent,
  Banknote,
  Barcode,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardCheck,
  HeartHandshake,
  PackageSearch,
  ShieldCheck,
  Truck,
  UserRoundCog,
  Wallet,
  Wrench,
} from "lucide-react";

import type { FaqItem, NavGroup, PricingTier, Solution, Tool, ToolCategory } from "@/lib/types";

export const tools: Tool[] = [
  {
    slug: "uae-overtime-calculator",
    name: "UAE Overtime Calculator",
    shortDescription: "Estimate overtime pay with clear breakdowns for standard, night, rest day, holiday, or flat-rate policies.",
    description:
      "A practical payroll utility for supervisors and HR teams who need a fast overtime estimate without rebuilding the math in spreadsheets.",
    category: "HR & payroll tools",
    status: "Free",
    tone: "blue",
    icon: Calculator,
    featured: true,
    live: true,
    bestFor: "Payroll admins, HR coordinators, and operations leads",
    setupTime: "Under 1 minute",
    output: "Instant overtime estimate with explanation",
    problemSummary:
      "Overtime is often calculated manually across messages, spreadsheets, and memory, which creates payroll friction and avoidable review cycles.",
    benefitSummary:
      "Ops Toolkit gives teams a repeatable, quick estimate with the multiplier and hourly basis clearly visible before payroll is finalized.",
    previewInputs: [
      "Monthly basic salary",
      "Daily working hours",
      "Overtime hours",
      "Overtime type",
      "Optional company flat hourly rate",
    ],
    previewOutputs: [
      "Estimated overtime pay in AED",
      "Base hourly rate used",
      "Applicable multiplier or flat rate",
      "Transparent calculation explanation",
    ],
    faqs: [
      {
        question: "What salary should I enter?",
        answer:
          "Enter the employee's monthly basic salary, because UAE overtime guidance is generally based on basic wage rather than total compensation.",
      },
      {
        question: "Why does the tool ask for daily working hours?",
        answer:
          "The calculator converts the monthly basic salary into an estimated hourly rate by using a 30-day month assumption and your daily working hours.",
      },
      {
        question: "Is the result legally final?",
        answer:
          "No. This is an operational estimate intended to speed up review. Company policy, contract wording, exemptions, shift work, and legal interpretation may change the final payable amount.",
      },
    ],
  },
  {
    slug: "sku-barcode-batch-generator",
    name: "SKU Barcode Batch Generator",
    shortDescription: "Generate printable SKU, retail, and internal barcode labels with manual entry or CSV batch upload.",
    description:
      "A practical barcode utility for warehouse teams, retail users, ecommerce sellers, and operations admins who need fast previews, print-ready label sheets, and clean CSV-based batch generation.",
    category: "Warehouse tools",
    status: "Free",
    tone: "purple",
    icon: Barcode,
    featured: true,
    live: true,
    bestFor: "Warehouse teams, ecommerce operators, retail staff, and admin users",
    setupTime: "Under 3 minutes",
    output: "Printable barcode previews, sheets, and HTML export",
    problemSummary:
      "Barcode labels are often made through scattered spreadsheet templates, old desktop tools, or manual relabeling steps that are hard to trust and hard to repeat.",
    benefitSummary:
      "Ops Toolkit turns barcode generation into a clean workflow with manual entry, CSV batches, preview validation, and print-ready output in one place.",
    previewInputs: [
      "Manual item entry",
      "CSV file upload",
      "Barcode type selector",
      "Quantity per label",
      "Display setting controls",
    ],
    previewOutputs: [
      "Browser-rendered barcode previews",
      "Printable label sheet",
      "Downloadable HTML export",
      "CSV row validation warnings",
    ],
    faqs: [
      {
        question: "Can I upload multiple SKU rows at once?",
        answer:
          "Yes. The tool supports CSV batch upload with validation for the required columns, barcode type, value format, and label quantity.",
      },
      {
        question: "Which barcode type should I use for internal inventory?",
        answer:
          "Code128 is usually the most flexible option for internal SKU labels. EAN-13 and UPC-A are stricter retail formats and require exact numeric lengths.",
      },
      {
        question: "Can I print the generated labels directly?",
        answer:
          "Yes. The generator includes a print-friendly label sheet view and a downloadable HTML export for operational printing workflows.",
      },
    ],
  },
  {
    slug: "petty-cash-tracker",
    name: "Petty Cash Tracker",
    shortDescription: "Track outflows, receipts, balances, and reconciliation notes in one clean operational view.",
    description:
      "A lightweight finance utility for teams that need control without deploying a full accounting suite.",
    category: "Admin & finance tools",
    status: "Pro",
    tone: "green",
    icon: Wallet,
    featured: true,
    bestFor: "Office admins and finance assistants",
    setupTime: "Same-day rollout",
    output: "Daily balance visibility and audit trail",
    problemSummary:
      "Petty cash usually lives in scattered notes, envelopes, and unstructured spreadsheet logs.",
    benefitSummary:
      "A focused tracker makes it easier to capture small expenses on time and reconcile balances without backtracking.",
    previewInputs: ["Expense entry", "Receipt reference", "Cash float", "Approver"],
    previewOutputs: ["Live balance", "Transaction timeline", "Reconciliation view"],
    faqs: [
      {
        question: "Will this replace accounting software?",
        answer:
          "No. It is meant to cover the operational capture layer before data is posted into a larger accounting system.",
      },
      {
        question: "Can it handle approvals later?",
        answer:
          "Yes. The structure is being designed so approval flows and role-based permissions can be layered in later.",
      },
    ],
  },
  {
    slug: "equipment-maintenance-reminder",
    name: "Equipment Maintenance Reminder",
    shortDescription: "Keep recurring checks, service dates, and operational reminders visible without a bloated CMMS.",
    description:
      "For supervisors who need dependable maintenance reminders and basic service visibility, not a heavyweight asset platform.",
    category: "Utilities",
    status: "Coming Soon",
    tone: "amber",
    icon: Wrench,
    featured: true,
    bestFor: "Site supervisors and warehouse leads",
    setupTime: "Under 10 minutes",
    output: "Upcoming service reminders and checklist cadence",
    problemSummary:
      "Maintenance follow-up often depends on memory, message threads, or wall notes that break under operational pressure.",
    benefitSummary:
      "A dedicated reminder tool keeps repetitive checks visible, consistent, and easy to delegate.",
    previewInputs: ["Asset name", "Service interval", "Assigned owner", "Reminder cadence"],
    previewOutputs: ["Upcoming reminders", "Service history snapshot", "Missed-task alerts"],
    faqs: [
      {
        question: "Is this meant for enterprise maintenance teams?",
        answer:
          "No. It is intentionally scoped for small teams that want reliable reminders and lightweight operational visibility.",
      },
      {
        question: "Will it support recurring checklists?",
        answer: "Yes. Recurring checks are a core part of the planned workflow.",
      },
    ],
  },
];

export const toolCategories: ToolCategory[] = [
  "Warehouse tools",
  "HR & payroll tools",
  "Admin & finance tools",
  "Logistics tools",
  "Utilities",
];

export const toolNavGroups: NavGroup[] = [
  {
    label: "Warehouse tools",
    href: "/tools?category=Warehouse%20tools",
    description: "Barcode, stock, and floor utilities for receiving and storage teams.",
  },
  {
    label: "HR & payroll tools",
    href: "/tools?category=HR%20%26%20payroll%20tools",
    description: "Fast calculators and operational helpers for payroll and HR workflows.",
  },
  {
    label: "Admin & finance tools",
    href: "/tools?category=Admin%20%26%20finance%20tools",
    description: "Focused controls for petty cash, approvals, and daily admin operations.",
  },
  {
    label: "Logistics tools",
    href: "/tools?category=Logistics%20tools",
    description: "Route, dispatch, and movement utilities for fast-moving operations.",
  },
  {
    label: "Utilities",
    href: "/tools?category=Utilities",
    description: "Small but powerful operational helpers for repeat everyday tasks.",
  },
];

export const solutions: Solution[] = [
  {
    slug: "warehouses",
    label: "For warehouses",
    title: "Operational tools that fit the floor, not just the boardroom",
    summary: "Reduce label friction, missed checks, and spreadsheet overload across receiving, storage, and dispatch.",
    description:
      "Warehouse teams need clear utility tools that can be used quickly during real work. Ops Toolkit focuses on the operational moments that slow teams down the most.",
    tone: "purple",
    icon: Boxes,
    painPoints: [
      "Receiving teams rely on ad hoc label templates and inconsistent SKU naming.",
      "Maintenance reminders are easy to lose across chat threads and notebooks.",
      "Supervisors need practical tools, not a full warehouse system rollout.",
    ],
    benefits: [
      "Fast card-based access to repeat warehouse utilities",
      "Lower training load for floor teams",
      "Future-ready structure for approvals and shared team views",
    ],
    relatedToolSlugs: ["sku-barcode-batch-generator", "equipment-maintenance-reminder"],
  },
  {
    slug: "hr-teams",
    label: "For HR teams",
    title: "Faster everyday HR operations without payroll guesswork",
    summary: "Give HR and payroll staff clear tools for overtime, policy checks, and repeat administrative calculations.",
    description:
      "Small and midsize HR teams often need practical utilities more than they need another all-in-one platform. Ops Toolkit is designed to reduce manual effort in the steps that happen every week.",
    tone: "blue",
    icon: UserRoundCog,
    painPoints: [
      "Overtime calculations are repeated manually in spreadsheets or messages.",
      "Managers ask the same payroll questions again and again.",
      "Teams need outputs that are easy to review and explain.",
    ],
    benefits: [
      "Transparent calculations with clearer handoff into payroll review",
      "Low-friction interface for non-technical users",
      "Expandable foundation for approvals and role-based workflows",
    ],
    relatedToolSlugs: ["uae-overtime-calculator"],
  },
  {
    slug: "small-businesses",
    label: "For small businesses",
    title: "A smarter operating layer between memory and full enterprise software",
    summary: "Replace scattered spreadsheets and message threads with focused tools that solve one job well.",
    description:
      "Small business teams rarely need a giant ERP on day one. They need reliable, easy tools that solve operational work cleanly and are simple to roll out.",
    tone: "green",
    icon: Building2,
    painPoints: [
      "Critical processes live in spreadsheets, chat messages, and personal memory.",
      "Owners need visibility without creating software sprawl.",
      "Teams need practical systems they can understand immediately.",
    ],
    benefits: [
      "Focused utilities with faster time-to-value",
      "Reusable patterns across new operational tools",
      "Premium UX without enterprise complexity",
    ],
    relatedToolSlugs: [
      "uae-overtime-calculator",
      "petty-cash-tracker",
      "equipment-maintenance-reminder",
    ],
  },
  {
    slug: "operations-managers",
    label: "For operations managers",
    title: "Operational visibility for the jobs that repeat every day",
    summary: "Help supervisors standardize overtime, equipment follow-up, and recurring admin work with less manual chasing.",
    description:
      "Operations managers need quick tools that can be introduced team by team. Ops Toolkit keeps the hierarchy clear, the next step obvious, and the implementation lightweight.",
    tone: "amber",
    icon: ClipboardCheck,
    painPoints: [
      "Processes vary by person and become hard to audit.",
      "Teams waste time recreating the same calculations and reminders.",
      "Oversized dashboards create friction instead of adoption.",
    ],
    benefits: [
      "Single-purpose tools with strong clarity",
      "Card-based discovery that is easy to extend later",
      "Structured outputs that support review and approval",
    ],
    relatedToolSlugs: [
      "uae-overtime-calculator",
      "equipment-maintenance-reminder",
      "sku-barcode-batch-generator",
    ],
  },
  {
    slug: "admin-teams",
    label: "For admin teams",
    title: "Lean admin workflows with better consistency and fewer manual gaps",
    summary: "Give office admins lightweight tools for tracking, calculations, and repeat checks without software overload.",
    description:
      "Admin teams often carry many small but critical processes. Ops Toolkit turns those repeat tasks into simple, reusable utilities with clearer outputs.",
    tone: "green",
    icon: BriefcaseBusiness,
    painPoints: [
      "Manual tracking processes are easy to delay and hard to review.",
      "Small operational tasks become bottlenecks when only one person knows the process.",
      "Teams need tools that feel obvious from the first minute.",
    ],
    benefits: [
      "Cleaner day-to-day handoffs",
      "Better repeatability with less spreadsheet clutter",
      "A path from solo utility to small team workflow",
    ],
    relatedToolSlugs: ["petty-cash-tracker", "uae-overtime-calculator"],
  },
];

export const solutionNavGroups: NavGroup[] = solutions.map((solution) => ({
  label: solution.label,
  href: `/solutions/${solution.slug}`,
  description: solution.summary,
}));

export const featuredTools = tools.filter((tool) => tool.featured);

export const whyOpsToolkit = [
  {
    title: "Built for real operational work",
    description:
      "Every tool is scoped around a practical daily job, with just enough structure to remove friction and avoid rework.",
    tone: "blue" as const,
    icon: ShieldCheck,
  },
  {
    title: "Faster than spreadsheet workflows",
    description:
      "The app turns repeat calculations and task flows into clear steps so teams spend less time rebuilding logic.",
    tone: "green" as const,
    icon: AlarmClockCheck,
  },
  {
    title: "Simple enough for non-technical teams",
    description:
      "Navigation, labels, and actions are intentionally obvious so supervisors and admins can move quickly without training overhead.",
    tone: "purple" as const,
    icon: HeartHandshake,
  },
  {
    title: "Designed for repeat everyday use",
    description:
      "Card-based discovery, consistent callouts, and reusable layouts make the app easy to expand without becoming noisy.",
    tone: "amber" as const,
    icon: PackageSearch,
  },
];

export const workflowSteps = [
  {
    step: "1",
    title: "Check the payroll question",
    description:
      "A supervisor enters the employee's overtime case and gets a fast estimate with a visible rule basis.",
    tool: "UAE Overtime Calculator",
    tone: "blue" as const,
    icon: BadgePercent,
  },
  {
    step: "2",
    title: "Capture the operational record",
    description:
      "The private workspace saves petty cash and overtime records instead of scattering them across messages and spreadsheets.",
    tool: "Petty Cash Tracker",
    tone: "green" as const,
    icon: Banknote,
  },
  {
    step: "3",
    title: "Keep the floor moving",
    description:
      "Warehouse and maintenance utilities help teams standardize the repetitive tasks that are easiest to miss under pressure.",
    tool: "Equipment Maintenance Reminder",
    tone: "amber" as const,
    icon: Truck,
  },
];

export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "AED 0",
    description: "Use the public utilities immediately and evaluate the product without any login or rollout friction.",
    ctaLabel: "Explore free tools",
    ctaHref: "/tools",
    tone: "blue",
    features: [
      "Public UAE overtime and barcode utilities",
      "Searchable card-based tool directory",
      "Responsive experience for desktop and mobile",
      "Clear outputs, previews, and print support where relevant",
    ],
  },
  {
    name: "Pro",
    price: "From AED 49/mo",
    description: "For operator-led teams that want a protected workspace, saved data, exports, and practical day-to-day control.",
    ctaLabel: "Get started",
    ctaHref: "/signup",
    highlight: true,
    tone: "purple",
    features: [
      "Protected app shell with profile and settings",
      "Database-backed petty cash tracking",
      "Saved overtime entries, filters, and CSV export",
      "Secure email/password and Google login",
    ],
  },
  {
    name: "Teams Preview",
    price: "Custom",
    description: "For teams rolling out approvals, member visibility, and shared overtime workflows across a real workspace.",
    ctaLabel: "Talk to sales",
    ctaHref: "/contact",
    tone: "green",
    features: [
      "Team creation and join-by-code workflow",
      "Role-aware overtime approvals and payment tracking",
      "Shared member views and settings foundation",
      "Launch support for operational rollout",
    ],
  },
];

export const homeFaqs: FaqItem[] = [
  {
    question: "Can I use Ops Toolkit without creating an account?",
    answer:
      "Yes. The public tools directory, UAE Overtime Calculator, and SKU Barcode Batch Generator are available without login so teams can test real value before they roll anything out.",
  },
  {
    question: "What does the private workspace unlock?",
    answer:
      "The authenticated app adds saved petty cash tracking, overtime management, team setup, role-aware access, exports, and the data layer needed for future collaborative modules.",
  },
  {
    question: "Is Ops Toolkit meant to replace our ERP or HR system?",
    answer:
      "No. Ops Toolkit is the focused layer for repeat operational jobs that usually fall back to spreadsheets, chat messages, and memory. It is intentionally narrower than a full ERP, CRM, or accounting suite.",
  },
  {
    question: "Will more tools be added later?",
    answer:
      "Yes. The component system and database foundation are designed so new solo utilities and team workflows can be added cleanly without changing how navigation and discovery work.",
  },
];

export const companyFacts = [
  { label: "Live today", value: "Free tools and a private workspace" },
  { label: "Rollout style", value: "Start with one workflow, expand later" },
  { label: "Built for", value: "Ops, warehouse, HR, and admin teams" },
];

export const contactChannels = [
  {
    title: "General inquiries",
    description: "Questions about launch status, roadmap, pricing, or how the product fits your operations stack.",
    value: "hello@opstoolkit.app",
    href: "mailto:hello@opstoolkit.app",
    tone: "blue" as const,
  },
  {
    title: "Sales and demos",
    description: "Share your team size, current workflow, and pain points so we can recommend the right starting point.",
    value: "sales@opstoolkit.app",
    href: "mailto:sales@opstoolkit.app",
    tone: "purple" as const,
  },
  {
    title: "Support",
    description: "Use this for help with live tools, workspace setup, petty cash, or overtime questions.",
    value: "support@opstoolkit.app",
    href: "mailto:support@opstoolkit.app",
    tone: "green" as const,
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slug: string, limit = 3) {
  const currentTool = getToolBySlug(slug);

  return tools
    .filter((tool) => tool.slug !== slug)
    .map((tool) => {
      let score = 0;

      if (currentTool && tool.category === currentTool.category) {
        score += 4;
      }

      if (tool.live) {
        score += 2;
      }

      if (tool.featured) {
        score += 1;
      }

      return { tool, score };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.tool.name.localeCompare(right.tool.name);
    })
    .slice(0, limit)
    .map((item) => item.tool);
}

export function getSolutionBySlug(slug: string) {
  return solutions.find((solution) => solution.slug === slug);
}


