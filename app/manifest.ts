import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    id: "/app",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F8FAFC",
    theme_color: "#2563EB",
    categories: ["business", "productivity", "finance", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
    shortcuts: [
      {
        name: "Overtime",
        short_name: "OT",
        description: "Open overtime entry, approvals, and payment tracking.",
        url: "/app/overtime",
      },
      {
        name: "Petty Cash",
        short_name: "Cash",
        description: "Open the petty cash ledger and add transactions.",
        url: "/app/petty-cash",
      },
      {
        name: "Reports",
        short_name: "Reports",
        description: "Review export-ready overtime and cash summaries.",
        url: "/app/reports",
      },
    ],
  };
}
