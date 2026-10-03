// Contrôle de fuite et d'hygiène sur le site CONSTRUIT (dist/). Échoue si un élément interdit apparaît.
// Les motifs propres à un projet (noms de famille, adresse…) sont lus dans un fichier PRIVÉ hors dépôt :
//   FORBIDDEN_FILE=<chemin>  (une expression régulière par ligne, '#' pour commenter). Jamais versionné ici.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const racine = "dist";
if (!existsSync(racine)) {
  console.error("dist/ introuvable : lancer npm run build d'abord");
  process.exit(2);
}

// Motifs génériques (jamais de donnée personnelle dans ce fichier).
const generiques = [
  [/\bFR\d{2}[ ]?(?:\d{4}[ ]?){4,}\d{0,3}\b/, "IBAN"],
  [/clarity\.ms|clarity\.microsoft/i, "Microsoft Clarity"],
  [/googletagmanager\.com|google-analytics\.com|gtag\(/i, "Google Analytics / Ads"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, "Google Fonts (polices non auto-hébergées)"],
  [/app\.habil\.fr/i, "simulateur tiers"],
  [/facebook\.net|connect\.facebook|fbq\(/i, "Pixel Meta"],
];
const prives = process.env.FORBIDDEN_FILE && existsSync(process.env.FORBIDDEN_FILE)
  ? readFileSync(process.env.FORBIDDEN_FILE, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => [new RegExp(l, "i"), "motif privé"])
  : [];
const motifs = [...generiques, ...prives];

const textuel = /\.(html|css|js|mjs|json|xml|txt|svg|webmanifest)$/i;
const interdits = ["files.zip", "download"];
const problemes = [];
function parcourir(dossier) {
  for (const nom of readdirSync(dossier)) {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) parcourir(chemin);
    else {
      if (interdits.includes(nom)) problemes.push(`${chemin} : fichier interdit`);
      if (textuel.test(nom)) {
        const contenu = readFileSync(chemin, "utf8");
        for (const [motif, libelle] of motifs) if (motif.test(contenu)) problemes.push(`${chemin} : ${libelle}`);
      }
    }
  }
}
parcourir(racine);

// Avant mise en ligne : aucun emplacement « à compléter » ne doit rester (option --golive).
if (process.argv.includes("--golive")) {
  const restants = [];
  (function chercher(d) {
    for (const n of readdirSync(d)) {
      const c = join(d, n);
      if (statSync(c).isDirectory()) chercher(c);
      else if (n.endsWith(".html") && /à compléter/.test(readFileSync(c, "utf8"))) restants.push(c);
    }
  })(racine);
  for (const r of restants) problemes.push(`${r} : emplacement « à compléter » (mise en ligne impossible)`);

  // Une expérience dont la diffusion n'est pas confirmée par la famille ne doit pas être dans le build public,
  // même anonymisée (construire avec DVK_PUBLIC_BUILD=1).
  const donnees = "src/data/experiences";
  if (existsSync(donnees)) {
    for (const f of readdirSync(donnees).filter((x) => x.endsWith(".json"))) {
      const e = JSON.parse(readFileSync(join(donnees, f), "utf8"));
      if (e.diffusion?.statut !== "confirmee" && existsSync(join(racine, "experience", e.slug))) {
        problemes.push(`dist/experience/${e.slug}/ : diffusion non confirmée par la famille (mise en ligne impossible)`);
      }
    }
  }
}

if (problemes.length) {
  console.error("CONTRÔLE ÉCHOUÉ :\n- " + problemes.join("\n- "));
  process.exit(1);
}
console.log(`Contrôle réussi (${motifs.length} motifs).`);
