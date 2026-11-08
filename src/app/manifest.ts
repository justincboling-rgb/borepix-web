import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Web app manifest, served at /manifest.webmanifest.
 * Icons: static metadata images in src/app are served from the app root by file name,
 * so src/app/icon.png (512x512) is /icon.png and src/app/apple-icon.png (180x180) is /apple-icon.png.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    lang: "en",
    categories: ["education", "medical"],
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
