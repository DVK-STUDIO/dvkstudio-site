import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Site statique : aucune dépendance d'exécution côté serveur. Les parties interactives sont du JavaScript
// natif, chargé uniquement là où il est utile (curseur avant/après, étapes de DVK Expérience).
export default defineConfig({
  site: "https://dvkstudio.fr",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
  integrations: [sitemap({ filter: (page) => !/\/(merci|404)\/?$/.test(page) })],
});
