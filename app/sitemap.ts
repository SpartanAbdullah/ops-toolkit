import type { MetadataRoute } from "next";

import { solutions, tools } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

const staticPages: Array<{
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/tools", changeFrequency: "monthly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.75 },
  { path: "/about", changeFrequency: "monthly", priority: 0.75 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.75 },
  { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
  { path: "/solutions", changeFrequency: "monthly", priority: 0.7 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticPages.map((page) => ({
      url: absoluteUrl(page.path),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...tools.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}`),
      lastModified: now,
      changeFrequency: tool.live ? "weekly" : "monthly",
      priority: tool.live ? 0.85 : 0.65,
    } satisfies MetadataRoute.Sitemap[number])),
    ...solutions.map((solution) => ({
      url: absoluteUrl(`/solutions/${solution.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    } satisfies MetadataRoute.Sitemap[number])),
  ];
}