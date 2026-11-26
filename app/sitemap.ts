import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";

const SITE = "https://myweightlossjournal.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, priority: 1 },
    { url: `${SITE}/learn`, priority: 0.8 },
    { url: `${SITE}/book`, priority: 0.5 },
    { url: `${SITE}/how-we-calculate`, priority: 0.5 },
    { url: `${SITE}/privacy`, priority: 0.2 },
    { url: `${SITE}/terms`, priority: 0.2 },
    { url: `${SITE}/delete-account`, priority: 0.1 },
    ...ARTICLES.map((a) => ({ url: `${SITE}/learn/${a.slug}`, priority: 0.6 })),
  ];
}
