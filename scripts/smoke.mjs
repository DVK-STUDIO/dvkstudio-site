// Test de fumée d'un site SERVI (aperçu local ou production) : pages, redirections, robots, sitemap, 404,
// absence des expériences non confirmées, absence de motifs privés.
//   node scripts/smoke.mjs --base http://localhost:4321 [--public] [--golive]
//   BASE_URL=https://dvkstudio.fr node scripts/smoke.mjs --public --golive      (après une mise en ligne)
//   FORBIDDEN_FILE=<motifs privés>  : ajoute le contrôle de fuite sur tout le HTML servi.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const val = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const base = (val("--base") ?? process.env.BASE_URL ?? "http://localhost:4321").replace(/\/$/, "");
const modePublic = args.includes("--public");
const golive = args.includes("--golive");

const echecs = [];
const verifs = [];
const ok = (cond, msg) => { verifs.push(msg); if (!cond) echecs.push(msg); };

const motifsPrives = process.env.FORBIDDEN_FILE && existsSync(process.env.FORBIDDEN_FILE)
  ? readFileSync(process.env.FORBIDDEN_FILE, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => new RegExp(l, "i"))
  : [];

async function lire(chemin) {
  const r = await fetch(base + chemin, { redirect: "manual" });
  return { statut: r.status, type: r.headers.get("content-type") ?? "", corps: await r.text() };
}
const titre = (h) => /<title>([\s\S]*?)<\/title>/i.exec(h)?.[1]?.trim();
const canonique = (h) => /<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i.exec(h)?.[1];

// Pages attendues : celles du plan de site construit.
// Plan de site : celui de dist/ s'il existe, sinon celui du site servi (contrôle après mise en ligne, sans build local).
const xmlSitemap = existsSync("dist/sitemap-0.xml") ? readFileSync("dist/sitemap-0.xml", "utf8") : (await lire("/sitemap-0.xml")).corps;
const sitemap = [...xmlSitemap.matchAll(/<loc>https:\/\/dvkstudio\.fr([^<]*)<\/loc>/g)].map((m) => m[1]);
const experiencesInterdites = [];
const experiencesAutorisees = [];
if (existsSync("src/data/experiences")) {
  for (const f of readdirSync("src/data/experiences").filter((x) => x.endsWith(".json"))) {
    const e = JSON.parse(readFileSync(join("src/data/experiences", f), "utf8"));
    (e.diffusion?.statut === "confirmee" ? experiencesAutorisees : experiencesInterdites).push(e.slug);
  }
}
const attendues = new Set(["/", ...sitemap, ...(modePublic ? [] : experiencesAutorisees.concat(experiencesInterdites).map((s) => `/experience/${s}/`))]);
if (modePublic) for (const s of experiencesAutorisees) attendues.add(`/experience/${s}/`);

let html = "";
for (const chemin of [...attendues].sort()) {
  const r = await lire(chemin);
  ok(r.statut === 200 && /html/.test(r.type), `${chemin} : 200 HTML`);
  if (r.statut !== 200) continue;
  html += r.corps;
  ok(!!titre(r.corps), `${chemin} : titre présent`);
  const c = canonique(r.corps);
  ok(!!c && new URL(c).pathname === chemin, `${chemin} : canonical cohérent`);
  if (golive) ok(!/à compléter/.test(r.corps), `${chemin} : aucun « à compléter »`);
}

// Anciennes URL : stub avec refresh vers une page qui répond.
if (existsSync("public")) {
  for (const f of readdirSync("public").filter((x) => x.endsWith(".html"))) {
    const r = await lire("/" + f);
    const cible = /http-equiv="refresh"\s+content="0;\s*url=([^"]+)"/i.exec(r.corps)?.[1];
    ok(r.statut === 200 && !!cible, `/${f} : redirection vers ${cible ?? "?"}`);
    if (cible) ok((await lire(cible)).statut === 200, `/${f} : la cible ${cible} répond 200`);
  }
}

// Fichiers techniques et 404.
const robots = await lire("/robots.txt");
ok(robots.statut === 200 && /Sitemap:\s*https:\/\/dvkstudio\.fr\/sitemap-index\.xml/.test(robots.corps), "robots.txt : plan de site déclaré");
const index = await lire("/sitemap-index.xml");
ok(index.statut === 200 && /sitemap-0\.xml/.test(index.corps), "sitemap-index.xml présent");
const absente = await lire("/page-qui-n-existe-pas/");
ok(absente.statut === 404, "page inexistante : 404");
if (absente.statut === 404) ok(/noindex/.test(absente.corps), "page 404 : noindex");

// Confidentialité : une expérience non confirmée ne doit pas être servie en mode public.
if (modePublic) {
  for (const s of experiencesInterdites) {
    const r = await lire(`/experience/${s}/`);
    ok(r.statut === 404, `/experience/${s}/ : non servie (diffusion non confirmée)`);
    html += r.corps;
  }
}
for (const re of motifsPrives) ok(!re.test(html), `fuite : motif privé /${re.source}/ absent du HTML servi`);
if (motifsPrives.length === 0) console.log("(aucun FORBIDDEN_FILE : contrôle de fuite privé non exécuté)");

console.log(`Test de fumée sur ${base}${modePublic ? " (mode public)" : ""} : ${verifs.length - echecs.length}/${verifs.length} vérifications.`);
if (echecs.length) { console.error("ÉCHECS :\n- " + echecs.join("\n- ")); process.exit(1); }
console.log("Test de fumée réussi.");
