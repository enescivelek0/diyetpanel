import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite yalnızca yerel geliştirmede kullanılır; paketlenmesin.
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
