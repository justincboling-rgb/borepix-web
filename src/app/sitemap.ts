import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { QUIZ_CATEGORIES } from "@/data/types";
import { WORKBOOK_SLUGS } from "@/data/workbooks";
import { legalPages, site } from "@/lib/site";

const baseUrl = site.url.replace(/\/+$/, "");

/** Static date so the sitemap stays deterministic under cacheComponents. Bump it when content changes. */
const LAST_MODIFIED = "2026-11-05";

type Entry = MetadataRoute.Sitemap[number];

const entry = (path: string, priority: number, changeFrequency: Entry["changeFrequency"]): Entry => ({
  url: `${baseUrl}${path}`,
  lastModified: LAST_MODIFIED,
  changeFrequency,
  priority,
});

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    entry("/", 1, "weekly"),
    entry("/store", 0.9, "weekly"),
    entry("/anatomy", 0.8, "monthly"),
    entry("/quizzes", 0.8, "monthly"),
    entry("/faq", 0.6, "monthly"),
    entry("/about", 0.5, "yearly"),
    entry("/affiliates", 0.5, "monthly"),
    ...products.map((p) => entry(`/store/${p.slug}`, 0.8, "weekly")),
    ...WORKBOOK_SLUGS.map((slug) => entry(`/anatomy/${slug}`, 0.7, "monthly")),
    ...QUIZ_CATEGORIES.map((slug) => entry(`/quizzes/${slug}`, 0.7, "monthly")),
    ...legalPages.map((page) => entry(`/legal/${page.slug}`, 0.3, "yearly")),
  ];
}
