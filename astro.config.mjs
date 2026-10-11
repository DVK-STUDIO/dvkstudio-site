import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { readdirSync, readFileSync } from "node:fs";

// Site statique : aucune dépendance d'exécution côté serveur. Les parties interactives sont du JavaScript
// natif, chargé uniquement là où il est utile (curseur avant/après, étapes de DVK Expérience).
// Une expérience non indexable (indexable: false) reste hors du plan de site.
const dossierExperiences = new URL("./src/data/experiences/", import.meta.url);
const horsPlan = readdirSync(dossierExperiences)
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(new URL(f, dossierExperiences), "utf8")))
  .filter((e) => e.indexable === false || (process.env.DVK_PUBLIC_BUILD === "1" && e.diffusion?.statut !== "confirmee"))
  .map((e) => `/experience/${e.slug}/`);

// Aucun stand-in de développement ne doit entrer dans un build : le module qui les liste est vidé hors du serveur de développement.
let commande = "build";
const standinsSeulementEnDev = () => ({
  name: "dvk-standins",
  enforce: "pre",
  configResolved(config) { commande = config.command; },
  transform(code, id) {
    if (commande !== "serve" && /src[\\/]lib[\\/]standins-dev\.ts$/.test(id.split("?")[0])) return { code: "export default {};", map: null };
  },
});

export default defineConfig({
  site: "https://dvkstudio.fr",
  output: "static",
  trailingSlash: "always",
  build: { format: "directory" },
  compressHTML: true,
  vite: { plugins: [standinsSeulementEnDev()] },
  integrations: [sitemap({ filter: (page) => !/\/(merci|404)\/?$/.test(page) && !horsPlan.some((p) => page.endsWith(p)) })],
});
