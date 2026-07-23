import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const SITE_ORIGIN = "https://mr-arpg.github.io";
const publicDir = join(rootDir, ".output/public");
const indexPath = join(publicDir, "index.html");
const seoDataPath = join(rootDir, "seo_data.json");

const basePath = normalizeBasePath(process.env.VITE_BASE_PATH ?? "/");

/** @type {{ slug: string; title: string; description: string; h1: string }[]} */
const seoEntries = JSON.parse(readFileSync(seoDataPath, "utf8"));
const indexHtml = readFileSync(indexPath, "utf8");

for (const entry of seoEntries) {
  const canonical = `${SITE_ORIGIN}${basePath}mix/${entry.slug}/`;
  const html = injectSeoHead(indexHtml, {
    title: entry.title,
    description: entry.description,
    canonical,
  });

  const outDir = join(publicDir, "mix", entry.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
}

const sitemapUrls = [
  `${SITE_ORIGIN}${basePath}`,
  ...seoEntries.map((entry) => `${SITE_ORIGIN}${basePath}mix/${entry.slug}/`),
];
writeFileSync(join(publicDir, "sitemap.xml"), buildSitemap(sitemapUrls), "utf8");

console.log(`Generated ${seoEntries.length} pSEO pages in ${join(publicDir, "mix")}`);
console.log(`Wrote sitemap.xml with ${sitemapUrls.length} URLs`);

function normalizeBasePath(path) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function upsertMeta(html, attrMatch, content) {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attrMatch}\\s+content="[^"]*"\\s*/?>`, "i");
  const tag = `<meta ${attrMatch} content="${escaped}">`;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
}

function upsertLink(html, attrMatch, href) {
  const escaped = escapeHtml(href);
  const pattern = new RegExp(`<link\\s+${attrMatch}\\s+href="[^"]*"\\s*/?>`, "i");
  const tag = `<link ${attrMatch} href="${escaped}">`;

  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
}

function injectSeoHead(html, { title, description, canonical }) {
  let out = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  out = upsertMeta(out, 'name="description"', description);
  out = upsertMeta(out, 'property="og:title"', title);
  out = upsertMeta(out, 'property="og:description"', description);
  out = upsertLink(out, 'rel="canonical"', canonical);
  return out;
}

function buildSitemap(urls) {
  const body = urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
