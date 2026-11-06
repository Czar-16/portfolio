import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, changeFrequency: "monthly" },
    { path: "/projects", priority: 0.9, changeFrequency: "monthly" },
    { path: "/stack", priority: 0.7, changeFrequency: "monthly" },
    { path: "/watch", priority: 0.6, changeFrequency: "yearly" },
    { path: "/quotes", priority: 0.6, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "yearly" },

  ];

  return [
    ...routes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
  ];
}
