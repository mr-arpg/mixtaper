import seoData from "../../seo_data.json";

export type SeoEntry = {
  slug: string;
  title: string;
  description: string;
  h1: string;
};

export const SITE_ORIGIN = "https://mr-arpg.github.io";

export const DEFAULT_SEO = {
  title: "Your CD, mixtaped with love",
  description:
    "A nostalgic mixtape CD player. Craft your own mix by sharing a YouTube playlist link with a handwritten title.",
} as const;

export const SEO_ENTRIES = seoData as SeoEntry[];
export const SEO_BY_SLUG = new Map(SEO_ENTRIES.map((entry) => [entry.slug, entry]));

export function getSeoEntry(slug: string): SeoEntry | undefined {
  return SEO_BY_SLUG.get(slug);
}

export function getBasePath(): string {
  const base = import.meta.env.BASE_URL ?? "/";
  return base.endsWith("/") ? base : `${base}/`;
}

export function getSiteUrl(path = ""): string {
  const basePath = getBasePath();
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${SITE_ORIGIN}${basePath}${normalizedPath}`;
}

export function getMixPageUrl(slug: string): string {
  return getSiteUrl(`mix/${slug}/`);
}
