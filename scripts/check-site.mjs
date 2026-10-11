// Contrôles du site construit : liens, SEO (canonical, sitemap, noindex, redirections), accessibilité structurelle,
// budget de performance.   npm run build && npm run check:site        (ajouter --rapport pour le détail)
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { lirePages, verifierLiens, verifierSeo, verifierA11y, verifierPerf, ORIGINE } from "./lib/analyse-site.mjs";

const dist = "dist";
if (!existsSync(dist)) { console.error("dist/ introuvable : lancer npm run build d'abord"); process.exit(2); }
const rapportDetaille = process.argv.includes("--rapport");

const pages = lirePages(dist);
const existeFichier = (chemin) => existsSync(join(dist, chemin)) || existsSync(join(dist, chemin, "index.html"));
const tailleFichier = (chemin) => (existsSync(join(dist, chemin)) ? statSync(join(dist, chemin)).size : undefined);
const lireTexte = (chemin) => (existsSync(join(dist, chemin)) ? readFileSync(join(dist, chemin), "utf8") : undefined);

// Plan de site
const sitemap = [];
if (existsSync(join(dist, "sitemap-0.xml"))) for (const m of readFileSync(join(dist, "sitemap-0.xml"), "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)) sitemap.push(m[1]);
const robots = existsSync(join(dist, "robots.txt")) ? readFileSync(join(dist, "robots.txt"), "utf8") : "";

// Anciennes URL du site V1 : chaque page doit mener quelque part. Les fichiers listés ici sont abandonnés EXPRÈS
// (téléchargement public d'un dossier de documents : hygiène, voir docs/avant-mise-en-ligne.md).
const ABANDONNEES = new Set(["download", "files.zip", "index.html"]);
const ancien = existsSync("legacy") ? readdirSync("legacy").filter((f) => f.endsWith(".html") && !ABANDONNEES.has(f)) : [];

const liens = verifierLiens(pages, existeFichier);
const seo = verifierSeo(pages, { sitemap, robots, ancien });
const a11y = verifierA11y(pages);
const perf = verifierPerf(pages, tailleFichier, lireTexte);

const sections = [["Liens", liens.problemes], ["SEO", seo], ["Accessibilité structurelle", a11y], ["Performance", perf.problemes]];
let total = 0;
for (const [nom, p] of sections) {
  total += p.length;
  console.log(`${p.length === 0 ? "OK   " : "ÉCHEC"} ${nom} (${p.length} problème${p.length > 1 ? "s" : ""})`);
  for (const x of p) console.log(`       - ${x}`);
}
console.log(`\n${pages.length} fichiers HTML (${pages.filter((p) => p.redirection).length} redirections), ${sitemap.length} URL dans le sitemap, ${liens.externes.length} liens externes.`);
if (rapportDetaille) {
  console.log("\nLiens externes :\n" + liens.externes.map((l) => "  " + l).join("\n"));
  console.log("\nPoids par page (octets) :");
  for (const r of perf.rapport) console.log(`  ${r.url.padEnd(34)} HTML ${String(r.htmlOctets).padStart(6)}  CSS ${String(r.cssOctets).padStart(6)}  JS ${String(r.jsOctets).padStart(5)}  polices préchargées ${r.policesCritiques} (${r.policesCritiquesOctets})`);
}
if (total > 0) { console.error(`\nCONTRÔLE DU SITE ÉCHOUÉ : ${total} problème(s).`); process.exit(1); }
console.log(`\nContrôle du site réussi (origine ${ORIGINE}).`);
