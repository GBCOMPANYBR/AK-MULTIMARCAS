import type { MetadataRoute } from "next";

const baseUrl = "https://aklocacoesmultimarcas.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/area-do-cliente", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
