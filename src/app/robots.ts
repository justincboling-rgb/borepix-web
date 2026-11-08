import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const baseUrl = site.url.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // "/app$" (exact match, honored by Google and Bing) covers the dashboard itself without also
      // blocking "/apple-icon.png", which a bare "/app" prefix would match. "/app/" covers every app route.
      disallow: ["/app$", "/app/", "/login", "/signup", "/account", "/admin"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
