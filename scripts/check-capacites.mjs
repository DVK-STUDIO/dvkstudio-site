// Contrôle de build : le site construit respecte la matrice du mode Immobilier (off / orientation / mandataire).
// Usage : npm run check:capacites   (options : --dist <dossier>, --mode <off|orientation|mandataire> pour contrôler un autre build)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { analyserImmobilier, lireModeImmobilier, lireValide } from "./lib/capacites.mjs";

const args = process.argv.slice(2);
const val = (nom) => { const i = args.indexOf(nom); return i >= 0 ? args[i + 1] : undefined; };
const racine = val("--dist") ?? "dist";
if (!existsSync(racine)) { console.error(`${racine}/ introuvable : lancer npm run build d'abord`); process.exit(2); }
const mode = val("--mode") ?? lireModeImmobilier(readFileSync("src/content/capacites.ts", "utf8"));
const valide = lireValide(readFileSync("src/content/iad.ts", "utf8"));
const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|map)$/i;
const fichiers = [];
(function parcourir(d) {
  for (const n of readdirSync(d)) {
    const c = join(d, n);
    if (statSync(c).isDirectory()) parcourir(c);
    else fichiers.push({ chemin: relative(racine, c).replace(/\\/g, "/"), contenu: textuel.test(n) ? readFileSync(c, "utf8") : null });
  }
})(racine);

const problemes = analyserImmobilier({ mode, fichiers, valide });
if (problemes.length) { console.error(`CAPACITÉ IMMOBILIER (mode ${mode}) : ÉCHEC\n- ${problemes.join("\n- ")}`); process.exit(1); }
console.log(`Capacité Immobilier, mode « ${mode} » : matrice respectée dans ${fichiers.length} fichiers du build.`);
