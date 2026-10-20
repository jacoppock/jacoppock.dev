import { defineConfig } from "astro/config";

// Static output; Vercel serves dist/ directly.
export default defineConfig({
  site: "https://jacoppock.dev",
  trailingSlash: "never",
});
