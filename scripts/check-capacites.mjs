// Contrôle de build : capacité IAD désactivée => aucune apparition publique de « IAD » ou « mandataire ». Usage : npm run check:capacites
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { analyserCapaciteIad, lireInterrupteurIad } from "./lib/capacites.mjs";

const racine = "dist";
if (!existsSync(racine)) { console.error("dist/ introuvable : lancer npm run build d'abord"); process.exit(2); }
const iadActif = lireInterrupteurIad(readFileSync("src/content/capacites.ts", "utf8"));
const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest|map)$/i;
const fichiers = [];
(function parcourir(d) {
  for (const n of readdirSync(d)) {
    const c = join(d, n);
    if (statSync(c).isDirectory()) parcourir(c);
    else fichiers.push({ chemin: relative(racine, c).replace(/\\/g, "/"), contenu: textuel.test(n) ? readFileSync(c, "utf8") : null });
  }
})(racine);

const problemes = analyserCapaciteIad({ iadActif, fichiers });
if (problemes.length) { console.error(`CAPACITÉ IAD : ÉCHEC\n- ${problemes.join("\n- ")}`); process.exit(1); }
console.log(`Capacité IAD ${iadActif ? "ACTIVE (aucun contrôle d'absence)" : "désactivée : aucune occurrence de « IAD » ni de « mandataire »"} dans ${fichiers.length} fichiers du build.`);
