// Vérification complète avant mise en ligne. NE DÉPLOIE RIEN, ne pousse rien.
//   npm run verifier:golive            (FORBIDDEN_FILE=<motifs privés> pour le contrôle de fuite)
// Étapes : tests -> build PUBLIC (DVK_PUBLIC_BUILD=1) -> contrôles du site -> aperçu local + test de fumée -> synthèse.
// Verdict : 0 = prêt pour la signature ; 1 = échec technique ; 2 = technique OK mais prérequis humains restants.
import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { listerFichiers } from "./lib/analyse-site.mjs";

const PORT = 4399;
const env = { ...process.env, DVK_PUBLIC_BUILD: "1" };
const etapes = [];
const sh = (cmd, opts = {}) => spawnSync(cmd, { shell: true, encoding: "utf8", env, ...opts });
function etape(nom, fn) {
  const t0 = Date.now();
  const r = fn();
  etapes.push({ nom, ok: r.ok, detail: r.detail ?? "", ms: Date.now() - t0 });
  console.log(`${r.ok ? "OK   " : "ÉCHEC"} ${nom} (${((Date.now() - t0) / 1000).toFixed(1)} s)${r.ok ? "" : "\n" + r.detail.split("\n").map((l) => "       " + l).join("\n")}`);
  return r.ok;
}
const sortie = (r) => `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();

let continuer = etape("Tests (vitest)", () => { const r = sh("npx vitest run"); return { ok: r.status === 0, detail: sortie(r).split("\n").slice(-15).join("\n") }; });
if (continuer) continuer = etape("Build public (DVK_PUBLIC_BUILD=1)", () => { const r = sh("npx astro build"); return { ok: r.status === 0, detail: sortie(r).split("\n").slice(-15).join("\n") }; });
if (continuer) {
  etape("Hygiène et fuites (check:public)", () => { const r = sh("node scripts/check-public.mjs"); return { ok: r.status === 0, detail: sortie(r) }; });
  etape("Liens, SEO, redirections, accessibilité, performance (check:site)", () => { const r = sh("node scripts/check-site.mjs"); return { ok: r.status === 0, detail: sortie(r) }; });
  etape("Capacité Immobilier : matrice du mode publié respectée (check:capacites)", () => { const r = sh("node scripts/check-capacites.mjs"); return { ok: r.status === 0, detail: sortie(r) }; });
  etape("Capacité Immobilier : les trois modes testés par construction réelle (check:modes)", () => { const r = sh("node scripts/verifier-modes.mjs"); return { ok: r.status === 0, detail: sortie(r).split("\n").slice(-14).join("\n") }; });
  etape("Expérience non confirmée absente du build", () => {
    const fautes = [];
    if (existsSync("src/data/experiences")) {
      for (const f of listerFichiers("src/data/experiences").filter((x) => x.endsWith(".json"))) {
        const e = JSON.parse(readFileSync(`src/data/experiences/${f}`, "utf8"));
        if (e.diffusion?.statut !== "confirmee" && existsSync(`dist/experience/${e.slug}`)) fautes.push(`dist/experience/${e.slug}/ présent alors que la diffusion n'est pas confirmée`);
      }
    }
    return { ok: fautes.length === 0, detail: fautes.join("\n") };
  });
  // Aperçu local servi puis test de fumée (mode public).
  const serveur = spawn(`npx astro preview --port ${PORT}`, { shell: true, env, stdio: "ignore" });
  const arreter = () => { try { spawnSync(`taskkill /pid ${serveur.pid} /T /F`, { shell: true, stdio: "ignore" }); } catch { /* déjà arrêté */ } };
  try {
    etape("Aperçu local + test de fumée (mode public)", () => {
      for (let i = 0; i < 40; i++) { const r = sh(`node -e "fetch('http://localhost:${PORT}/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"`); if (r.status === 0) break; spawnSync("node", ["-e", "setTimeout(()=>{},250)"]); }
      const r = sh(`node scripts/smoke.mjs --base http://localhost:${PORT} --public`);
      return { ok: r.status === 0, detail: sortie(r).split("\n").slice(-12).join("\n") };
    });
  } finally { arreter(); }
}

// Prérequis humains : tout ce que le code ne peut pas décider.
const humains = [];
if (existsSync("dist")) {
  const avec = listerFichiers("dist").filter((f) => f.endsWith(".html")).filter((f) => /à compléter/.test(readFileSync(`dist/${f}`, "utf8")));
  if (avec.length) humains.push(`Emplacements « à compléter » : ${avec.length} page(s) (${avec.map((f) => "/" + f.replace(/index\.html$/, "")).join(", ")})`);
}
humains.push("Mode Immobilier « orientation » : confirmer que « Je rejoins le réseau iad France » est exact au jour de la mise en ligne");
humains.push("Mention officielle CM2C, conformité à la charte de communication hemea, dernière vérification visuelle, GO de déploiement");
humains.push("Tarifs : non repris tant qu'ils ne sont pas confirmés (aucune action si non confirmés)");
humains.push("Logos et partenaires : non repris tant que l'autorisation n'est pas obtenue");
humains.push("Check-list de docs/mise-en-ligne.md à relire et signer");

const technique = etapes.every((e) => e.ok);
console.log("\n" + "=".repeat(60));
console.log(`TECHNIQUE : ${technique ? "OK" : "ÉCHEC"} (${etapes.filter((e) => e.ok).length}/${etapes.length} étapes)`);
const bloquants = humains.filter((h) => /à compléter/.test(h));
console.log(`PRÉREQUIS HUMAINS : ${bloquants.length} bloquant(s) de mise en production`);
for (const h of humains) console.log(`  - ${bloquants.includes(h) ? "[BLOQUANT] " : ""}${h}`);
if (!technique) { console.error("\nNON PRÊT : corriger l'échec technique."); process.exit(1); }
if (bloquants.length) { console.log("\nTechniquement prêt. NON PRÊT à publier : prérequis humains restants."); process.exit(2); }
console.log("\nPRÊT pour la signature de la check-list. Aucun déploiement n'a été fait.");
