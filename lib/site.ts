import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://opstoolkit.app";

function normalizePath(path = "/") {
  if (!path) {
    return "/";
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized === "/" ? normalized : normalized.replace(/\/+$/, "");
}

function getConfiguredSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return FALLBACK_SITE_URL;
  }

  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

export const siteConfig = {
  name: "Ops Toolkit",
  shortName: "Ops Toolkit",
  url: getConfiguredSiteUrl(),
  description:
    "Ops Toolkit helps warehouses, HR teams, admin operators, and small businesses replace scattered spreadsheets, WhatsApp messages, and manual calculations with focused operations tools and lightweight workflows.",
  supportEmail: "hello@opstoolkit.app",
  socialImagePath: "/opengraph-image",
  legalEffectiveDate: "March 14, 2026",
  defaultKeywords: [
    "operations toolkit",
    "operations software",
    "warehouse tools",
    "petty cash tracker",
    "overtime management",
    "UAE overtime calculator",
    "barcode generator",
    "admin tools",
    "small business operations",
    "operations manager toolkit",
  ],
} as const;

export function absoluteUrl(path = "/") {
  return new URL(normalizePath(path), `${siteConfig.url}/`).toString();
}

function buildFullTitle(title?: string) {
  return title ? `${title} | ${siteConfig.name}` : siteConfig.name;
}

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: "website" | "article";
  imagePath?: string;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  keywords = [],
  noIndex = false,
  type = "website",
  imagePath = siteConfig.socialImagePath,
}: BuildMetadataOptions): Metadata {
  const pageUrl = absoluteUrl(path);
  const fullTitle = buildFullTitle(title);
  const dedupedKeywords = Array.from(new Set([...siteConfig.defaultKeywords, ...keywords]));

  return {
    title,
    description,
    keywords: dedupedKeywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_AE",
      type,
      images: [
        {
          url: absoluteUrl(imagePath),
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [absoluteUrl(imagePath)],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
}