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
    background_color: "#F7F8FB",
    theme_color: "#0E1D34",
    categories: ["business", "productivity", "finance"],
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
    ],
  };
}
