// Contrôle de build des médias : pas de stand-in, pas d'emplacement vide, pas de montant dans la chaîne, pas d'EXIF,
// hero avec dimensions explicites et budget de chargement initial. Usage : npm run check:medias   (option : --dist <dossier>)
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { analyserMedias, budgetHero, verifierCls } from "./lib/medias.mjs";

const args = process.argv.slice(2);
const racine = args.includes("--dist") ? args[args.indexOf("--dist") + 1] : "dist";
if (!existsSync(racine)) { console.error(`${racine}/ introuvable : lancer npm run build d'abord`); process.exit(2); }

const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest)$/i;
const image = /\.(avif|webp|jpe?g|png)$/i;
const fichiers = [];
(function parcourir(d) {
  for (const n of readdirSync(d)) {
    const c = join(d, n);
    if (statSync(c).isDirectory()) parcourir(c);
    else {
      const chemin = relative(racine, c).replace(/\\/g, "/");
      fichiers.push({ chemin, contenu: textuel.test(n) ? readFileSync(c, "utf8") : undefined, octets: image.test(n) ? readFileSync(c) : undefined });
    }
  }
})(racine);

const problemes = analyserMedias({ fichiers });
let imagesHero = 0, totalHero = 0;
for (const { chemin, contenu } of fichiers) {
  if (!chemin.endsWith(".html") || typeof contenu !== "string" || !/data-hero-image/.test(contenu)) continue;
  for (const p of verifierCls(contenu)) problemes.push(`${chemin} : ${p}`);
  const b = budgetHero(contenu, (u) => { const c = join(racine, u.replace(/^\//, "")); return existsSync(c) ? statSync(c).size : undefined; });
  for (const p of b.problemes) problemes.push(`${chemin} : ${p}`);
  imagesHero += b.images; totalHero += b.total;
}
if (problemes.length) { console.error(`MÉDIAS : ÉCHEC\n- ${problemes.join("\n- ")}`); process.exit(1); }
console.log(`Médias : conformes dans ${fichiers.length} fichiers du build. ${imagesHero ? `Hero photographique : ${imagesHero} images, ${Math.round(totalHero / 1024)} Ko de chargement initial en mobile.` : "Aucun média photographique publié (livraison dormante)."}`);
