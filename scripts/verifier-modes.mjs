// Teste RÉELLEMENT les trois modes Immobilier : pour chaque scénario, le mode (et au besoin les données réglementaires) est
// modifié dans le source, le site est construit dans un dossier temporaire, puis la matrice est vérifiée.
// Les fichiers sources sont TOUJOURS restaurés (finally + signaux) ; le dossier dist/ n'est jamais touché.
//   npm run check:modes
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";
import { analyserImmobilier } from "./lib/capacites.mjs";

const CAPACITES = "src/content/capacites.ts";
const IAD = "src/content/iad.ts";
const originaux = { [CAPACITES]: readFileSync(CAPACITES, "utf8"), [IAD]: readFileSync(IAD, "utf8") };
const restaurer = () => { for (const [chemin, contenu] of Object.entries(originaux)) writeFileSync(chemin, contenu); };
for (const s of ["SIGINT", "SIGTERM"]) process.on(s, () => { restaurer(); process.exit(130); });

const avecMode = (source, mode) => source.replace(/mode:\s*"(off|orientation|mandataire)"/, `mode: "${mode}"`);
const CHAMPS = ["qualite", "rsac", "carteProfessionnelle", "garantieFinanciere", "assuranceRcp", "honoraires", "mediateur"];
const completer = (source) =>
  CHAMPS.reduce((s, c) => s.replace(new RegExp(`(\\b${c}\\s*:\\s*)A_COMPLETER`), `$1"TEST-${c.toUpperCase()}"`), source).replace(/valide:\s*false/, "valide: true");

function lister(racine) {
  const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|map)$/i;
  const fichiers = [];
  (function parcourir(d) {
    for (const n of readdirSync(d)) {
      const c = join(d, n);
      if (statSync(c).isDirectory()) parcourir(c);
      else fichiers.push({ chemin: relative(racine, c).replace(/\\/g, "/"), contenu: textuel.test(n) ? readFileSync(c, "utf8") : null });
    }
  })(racine);
  return fichiers;
}

function construire(dossier) {
  const r = spawnSync(`npx astro build --outDir "${dossier}"`, { shell: true, encoding: "utf8", env: { ...process.env, DVK_PUBLIC_BUILD: "1" } });
  return { ok: r.status === 0, sortie: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}

const scenarios = [
  { nom: "off", mode: "off", donnees: false, attendu: "ok" },
  { nom: "orientation", mode: "orientation", donnees: false, attendu: "ok" },
  { nom: "orientation + données réglementaires complètes (aucune fuite)", mode: "orientation", donnees: true, attendu: "ok", sansFuite: true },
  { nom: "mandataire + données incomplètes (le build doit échouer)", mode: "mandataire", donnees: false, attendu: "echec" },
  { nom: "mandataire + données complètes et validées (fictives, test)", mode: "mandataire", donnees: true, attendu: "ok", avecMentions: true },
];

const echecs = [];
const base = mkdtempSync(join(tmpdir(), "dvk-modes-"));
try {
  for (const [i, s] of scenarios.entries()) {
    const dossier = join(base, String(i));
    writeFileSync(CAPACITES, avecMode(originaux[CAPACITES], s.mode));
    writeFileSync(IAD, s.donnees ? completer(originaux[IAD]) : originaux[IAD]);
    const b = construire(dossier);
    restaurer();
    const verdict = [];
    if (s.attendu === "echec") {
      if (b.ok) verdict.push("le build a RÉUSSI alors qu'il devait échouer");
      else if (!/mode « mandataire » refusé/.test(b.sortie)) verdict.push("le build a échoué, mais pas pour la bonne raison (message de verrou absent)");
      else if (existsSync(join(dossier, "immobilier"))) verdict.push("une page /immobilier/ est sortie malgré l'échec");
    } else if (!b.ok) {
      verdict.push(`le build a échoué : ${b.sortie.split("\n").slice(-6).join(" | ")}`);
    } else {
      const fichiers = lister(dossier);
      const valide = s.donnees;
      verdict.push(...analyserImmobilier({ mode: s.mode, fichiers, valide }));
      if (s.sansFuite) {
        for (const f of fichiers) if (typeof f.contenu === "string" && /TEST-[A-Z]+/.test(f.contenu)) verdict.push(`${f.chemin} : donnée réglementaire exposée alors que le mode n'est pas « mandataire »`);
      }
      if (s.avecMentions) {
        const page = fichiers.find((f) => f.chemin === "immobilier/index.html")?.contenu ?? "";
        for (const c of CHAMPS) if (!page.includes(`TEST-${c.toUpperCase()}`)) verdict.push(`immobilier/index.html : valeur réglementaire « ${c} » absente`);
      }
    }
    console.log(`${verdict.length === 0 ? "OK   " : "ÉCHEC"} ${s.nom}${verdict.length ? "\n       - " + verdict.join("\n       - ") : ""}`);
    if (verdict.length) echecs.push(s.nom);
  }
} finally {
  restaurer();
  rmSync(base, { recursive: true, force: true });
}

const intacts = readFileSync(CAPACITES, "utf8") === originaux[CAPACITES] && readFileSync(IAD, "utf8") === originaux[IAD];
if (!intacts) { console.error("ERREUR : les sources n'ont pas été restaurées."); process.exit(1); }
if (echecs.length) { console.error(`\nMODES : ${echecs.length} scénario(s) en échec.`); process.exit(1); }
console.log(`\nMODES : ${scenarios.length}/${scenarios.length} scénarios conformes. Sources restaurées, dist/ intact.`);
