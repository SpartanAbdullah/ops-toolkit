import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://opstoolkit.app";

function getConfiguredSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    return FALLBACK_SITE_URL;
  }

  return configured.endsWith("/") ? configured.slice(0, -1) : configured;
}

export const siteConfig = {
  name: "Ops Toolkit",
  shortName: "Ops",
  url: getConfiguredSiteUrl(),
  description: "Overtime and petty cash, made simple. Built for UAE operations teams.",
  supportEmail: "operations@interior-360.com",
} as const;

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

export function buildMetadata({
  title,
  description = siteConfig.description,
  noIndex = true,
}: BuildMetadataOptions = {}): Metadata {
  return {
    title,
    description,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
