import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My Weight Loss Journal",
    short_name: "Journal",
    description: "Log food and exercise, and see your calories in and out each day.",
    start_url: "/journal",
    display: "standalone",
    background_color: "#eaf4fb",
    theme_color: "#eaf4fb",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
