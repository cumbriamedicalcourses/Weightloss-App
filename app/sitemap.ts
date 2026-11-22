import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";

const SITE = "https://myweightlossjournal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, priority: 1 },
    { url: `${SITE}/learn`, priority: 0.8 },
    ...ARTICLES.map((a) => ({ url: `${SITE}/learn/${a.slug}`, priority: 0.6 })),
  ];
}
