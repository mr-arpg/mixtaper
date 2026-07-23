import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import {
  DEFAULT_SEO,
  getMixPageUrl,
  getSeoEntry,
  type SeoEntry,
} from "@/lib/seo-data";

function sanitizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, "").trim();
}

export const Route = createFileRoute("/mix/$slug")({
  loader: ({ params }): SeoEntry => {
    const slug = sanitizeSlug(params.slug ?? "");
    const entry = getSeoEntry(slug);
    if (!entry) throw notFound();
    return entry;
  },
  head: ({ loaderData }) => {
    const title = loaderData?.title || DEFAULT_SEO.title;
    const description = loaderData?.description || DEFAULT_SEO.description;
    const slug = loaderData?.slug;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: slug ? [{ rel: "canonical", href: getMixPageUrl(slug) }] : [],
    };
  },
  component: MixSeoPage,
});

function MixSeoPage() {
  const entry = Route.useLoaderData();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        <div className="mx-auto max-w-xl text-center">
          <h1
            className="mb-4"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "clamp(2rem, 6vw, 3.5rem)",
              color: "#a78bfa",
              lineHeight: 1.1,
            }}
          >
            {entry.h1}
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-white/70">{entry.description}</p>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
          >
            Make your mixtape →
          </Link>
          <p className="mt-8 text-xs text-white/40">
            Free tool — paste a YouTube playlist, write a title, share the link.
          </p>
        </div>
      </div>
    </div>
  );
}
