// Teste RÉELLEMENT la couche photographique par constructions du site (dossiers temporaires ; sources et dist/ restaurés/intacts) :
//   1. livraison dormante : build public sans média autorisé -> aucun hero photographique, aucun comparateur, contrôle des médias vert ;
//   2. DVK_STANDINS=1 dans un build -> le build DOIT échouer (aucun stand-in ne peut entrer dans un site publié) ;
//   3. paire fictive « confirmée » (justificatif + date) -> comparateur et chaîne présents, dimensions explicites, budget du hero tenu ;
//   4. paire aux dimensions différentes -> le build DOIT échouer ; 5. droits confirmés sans justificatif -> le build DOIT échouer.
//   npm run check:modes-medias
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdtempSync, rmSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { analyserMedias, budgetHero, verifierCls } from "./lib/medias.mjs";

const REGISTRE = "src/content/medias.ts";
const DOSSIER_MEDIAS = "src/assets/medias";
const original = readFileSync(REGISTRE, "utf8");
const dejaLa = new Set(existsSync(DOSSIER_MEDIAS) ? readdirSync(DOSSIER_MEDIAS) : []);
const nettoyer = () => {
  writeFileSync(REGISTRE, original);
  if (existsSync(DOSSIER_MEDIAS)) for (const f of readdirSync(DOSSIER_MEDIAS)) if (!dejaLa.has(f)) rmSync(join(DOSSIER_MEDIAS, f));
};
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => { nettoyer(); process.exit(130); });

function construire(dossier, env = {}) {
  const r = spawnSync(`npx astro build --outDir "${dossier}"`, { shell: true, encoding: "utf8", env: { ...process.env, DVK_PUBLIC_BUILD: "1", ...env } });
  return { ok: r.status === 0, sortie: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
function lister(racine) {
  const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest)$/i, image = /\.(avif|webp|jpe?g|png)$/i, out = [];
  (function parcourir(d) {
    for (const n of readdirSync(d)) {
      const c = join(d, n);
      if (statSync(c).isDirectory()) parcourir(c);
      else out.push({ chemin: relative(racine, c).replace(/\\/g, "/"), contenu: textuel.test(n) ? readFileSync(c, "utf8") : undefined, octets: image.test(n) ? readFileSync(c) : undefined });
    }
  })(racine);
  return out;
}
/** Contrôles du build : médias, CLS, budget du hero. */
function controler(racine, fichiers) {
  const problemes = analyserMedias({ fichiers });
  const accueil = fichiers.find((f) => f.chemin === "index.html")?.contenu ?? "";
  for (const p of verifierCls(accueil)) problemes.push(`index.html : ${p}`);
  const b = budgetHero(accueil, (u) => { const c = join(racine, u.replace(/^\//, "")); return existsSync(c) ? statSync(c).size : undefined; });
  for (const p of b.problemes) problemes.push(`index.html : ${p}`);
  return { problemes, total: b.total, images: b.images };
}
/** Active des droits « confirmés » fictifs pour la paire (et éventuellement le chantier) dans le registre. */
function confirmer({ reference = "TEST-JUSTIFICATIF", date = "2026-10-04", chantier = false } = {}) {
  let s = original;
  const droits = `{ statut: "confirmes", reference: ${JSON.stringify(reference)}, date: ${JSON.stringify(date)} }`;
  const bloc = (nom) => new RegExp(`(\\b${nom}: \\{[^\\n]*?droits: )aConfirmer`);
  s = s.replace(/(paire: \{ avant: "hero-avant"[^\n]*droits: )aConfirmer/, `$1${droits}`);
  if (chantier) s = s.replace(bloc("chantier"), `$1${droits}`);
  if (s === original) throw new Error("registre : activation fictive impossible (format inattendu)");
  writeFileSync(REGISTRE, s);
}
async function deposerPaire(avant, apres, base = "src/assets/standins") {
  mkdirSync(DOSSIER_MEDIAS, { recursive: true });
  await sharp(`${base}/standin-paire-avant.jpg`).resize(avant.l, avant.h, { fit: "fill" }).jpeg({ quality: 80 }).toFile(join(DOSSIER_MEDIAS, "hero-avant.jpg"));
  await sharp(`${base}/standin-paire-apres.jpg`).resize(apres.l, apres.h, { fit: "fill" }).jpeg({ quality: 80 }).toFile(join(DOSSIER_MEDIAS, "hero-apres.jpg"));
}

const base = mkdtempSync(join(tmpdir(), "dvk-medias-"));
const echecs = [];
const rapporter = (nom, verdict) => { console.log(`${verdict.length === 0 ? "OK   " : "ÉCHEC"} ${nom}${verdict.length ? "\n       - " + verdict.join("\n       - ") : ""}`); if (verdict.length) echecs.push(nom); };
const aStandins = existsSync("src/assets/standins/standin-paire-avant.jpg");

try {
  // 1. Dormant
  {
    const d = join(base, "1"); const b = construire(d); const v = [];
    if (!b.ok) v.push(`build échoué : ${b.sortie.split("\n").slice(-5).join(" | ")}`);
    else {
      const fichiers = lister(d), accueil = fichiers.find((f) => f.chemin === "index.html").contenu;
      v.push(...controler(d, fichiers).problemes);
      if (/data-comparateur|data-transformation|data-hero-image/.test(accueil)) v.push("comparateur ou chaîne photographique présents sans média autorisé");
    }
    rapporter("livraison dormante : aucun média autorisé, aucun comparateur, aucun emplacement vide", v);
  }
  // 2. Stand-ins refusés par un build
  {
    const b = construire(join(base, "2"), { DVK_STANDINS: "1" }); const v = [];
    if (b.ok) v.push("un build avec DVK_STANDINS=1 a RÉUSSI (les stand-ins pourraient entrer en production)");
    else if (!/réservé à `astro dev`/.test(b.sortie)) v.push("le build a échoué, mais pas avec le message attendu");
    rapporter("stand-ins : un build avec DVK_STANDINS=1 échoue", v);
  }
  if (!aStandins) {
    console.log("INFO  scénarios 3 à 5 ignorés : stand-ins locaux absents (src/assets/standins/, non versionnés)");
  } else {
    // 3. Paire fictive confirmée
    {
      await deposerPaire({ l: 2400, h: 2010 }, { l: 2400, h: 2010 }); confirmer();
      const d = join(base, "3"); const b = construire(d); nettoyer(); const v = [];
      if (!b.ok) v.push(`build échoué : ${b.sortie.split("\n").slice(-5).join(" | ")}`);
      else {
        const fichiers = lister(d), accueil = fichiers.find((f) => f.chemin === "index.html").contenu;
        const c = controler(d, fichiers); v.push(...c.problemes);
        if (!/data-comparateur/.test(accueil)) v.push("comparateur absent malgré une paire confirmée");
        if (!/data-transformation/.test(accueil)) v.push("chaîne au défilement absente malgré une paire confirmée");
        if (c.images !== 2) v.push(`le hero devrait avoir 2 images critiques (trouvé ${c.images})`);
        if (/stand-?in/i.test(accueil)) v.push("mention de stand-in dans la page");
        console.log(`       hero : ${Math.round(c.total / 1024)} Ko de chargement initial en mobile (variantes ~800 px)`);
      }
      rapporter("paire fictive confirmée : comparateur et chaîne présents, CLS et budget du hero tenus", v);
    }
    // 4. Dimensions différentes
    {
      await deposerPaire({ l: 2400, h: 2010 }, { l: 2400, h: 2000 }); confirmer();
      const b = construire(join(base, "4")); nettoyer(); const v = [];
      if (b.ok) v.push("le build a RÉUSSI avec une paire de dimensions différentes");
      else if (!/dimensions différentes/.test(b.sortie)) v.push("échec pour une autre raison que les dimensions");
      rapporter("paire aux dimensions différentes : le build échoue", v);
    }
    // 5. Droits sans justificatif
    {
      await deposerPaire({ l: 2400, h: 2010 }, { l: 2400, h: 2010 }); confirmer({ reference: "" });
      const b = construire(join(base, "5")); nettoyer(); const v = [];
      if (b.ok) v.push("le build a RÉUSSI avec des droits confirmés sans justificatif");
      else if (!/sans référence de justificatif/.test(b.sortie)) v.push("échec pour une autre raison que l'absence de justificatif");
      rapporter("droits confirmés sans justificatif : le build échoue", v);
    }
  }
} finally {
  nettoyer();
  rmSync(base, { recursive: true, force: true });
}
if (readFileSync(REGISTRE, "utf8") !== original) { console.error("ERREUR : le registre n'a pas été restauré."); process.exit(1); }
if (echecs.length) { console.error(`\nMÉDIAS (constructions) : ${echecs.length} scénario(s) en échec.`); process.exit(1); }
console.log("\nMÉDIAS (constructions) : conformes. Registre restauré, dist/ intact.");
