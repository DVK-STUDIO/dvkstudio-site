// Contrôles du site CONSTRUIT sur les médias photographiques (hero, chaîne, pages) :
//  - aucun stand-in, aucun emplacement « à venir » dans un build ;
//  - aucun montant dans la chaîne DVK Expérience (lots : repères, statuts, ordre de grandeur, jamais de somme inventée) ;
//  - aucune métadonnée EXIF (donc aucune position GPS) dans les images publiées ;
//  - hero : dimensions explicites (pas de CLS) et budget de chargement initial (variante mobile ~800 px de large).

export const BUDGET_HERO_OCTETS = 400 * 1024;
export const LARGEUR_REFERENCE_MOBILE = 800;

const MOTIFS_INTERDITS = [
  [/stand-?in/i, "stand-in de développement"],
  [/Photographie à venir/i, "emplacement « Photographie à venir »"],
];
const MONTANT = /\d[\d\s .,]*\s?[kKmM]?\s?€|€\s?\d/;
const EXTENSIONS_IMAGES = /\.(avif|webp|jpe?g|png)$/i;

/** fichiers : [{ chemin, contenu?: string, octets?: Buffer }] */
export function analyserMedias({ fichiers }) {
  const problemes = [];
  for (const { chemin, contenu, octets } of fichiers) {
    if (/stand-?in/i.test(chemin)) problemes.push(`${chemin} : fichier de stand-in dans le build`);
    if (typeof contenu === "string") {
      for (const [motif, libelle] of MOTIFS_INTERDITS) {
        const m = motif.exec(contenu);
        if (m) problemes.push(`${chemin} : ${libelle} (…${contenu.slice(Math.max(0, m.index - 20), m.index + 40).replace(/\s+/g, " ")}…)`);
      }
      if (/data-transformation/.test(contenu)) {
        const zone = contenu.slice(contenu.indexOf("data-transformation"));
        const m = MONTANT.exec(zone.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/g, ""));
        if (m) problemes.push(`${chemin} : montant dans la chaîne DVK Expérience (« ${m[0].trim()} »)`);
      }
    }
    if (Buffer.isBuffer(octets) && EXTENSIONS_IMAGES.test(chemin) && octets.subarray(0, 65536).includes("Exif")) {
      problemes.push(`${chemin} : métadonnées EXIF dans une image publiée`);
    }
  }
  return problemes;
}

function attributs(balise) {
  const out = {};
  for (const m of balise.matchAll(/([a-zA-Z-]+)(?:="([^"]*)")?/g)) out[m[1]] = m[2] ?? "";
  return out;
}

/** Les images critiques du hero doivent déclarer width et height (réservation de l'espace : pas de décalage de mise en page). */
export function verifierCls(html) {
  const problemes = [];
  for (const m of html.matchAll(/<img\b[^>]*\bdata-hero-image\b[^>]*>/g)) {
    const a = attributs(m[0]);
    if (!a.width || !a.height) problemes.push("image du hero sans width/height explicites");
  }
  return problemes;
}

function candidats(srcset) {
  return srcset.split(",").map((c) => c.trim().split(/\s+/)).filter((c) => c.length === 2).map(([url, w]) => ({ url, largeur: parseInt(w, 10) })).filter((c) => c.largeur > 0);
}

/**
 * Budget de chargement initial du hero : somme des variantes (AVIF de préférence) les plus proches de 800 px de large,
 * une par image du comparateur. tailleDe(chemin) retourne la taille en octets d'un fichier du build.
 */
export function budgetHero(html, tailleDe, { budget = BUDGET_HERO_OCTETS, largeur = LARGEUR_REFERENCE_MOBILE } = {}) {
  const problemes = [];
  let total = 0, nb = 0;
  for (const m of html.matchAll(/<picture\b[\s\S]*?<\/picture>/g)) {
    if (!/\bdata-hero-image\b/.test(m[0])) continue;
    nb++;
    const sources = [...m[0].matchAll(/<source\b[^>]*>/g)].map((s) => attributs(s[0]));
    const source = sources.find((s) => s.type === "image/avif") ?? sources[0];
    const liste = candidats(source?.srcset ?? /<img\b[^>]*\bsrcset="([^"]*)"/.exec(m[0])?.[1] ?? "");
    if (!liste.length) { problemes.push("image du hero sans srcset (variantes adaptées requises)"); continue; }
    const choix = liste.reduce((a, c) => (Math.abs(c.largeur - largeur) < Math.abs(a.largeur - largeur) ? c : a));
    const taille = tailleDe(choix.url);
    if (typeof taille !== "number") { problemes.push(`image du hero introuvable : ${choix.url}`); continue; }
    total += taille;
  }
  if (nb && total > budget) problemes.push(`hero : ${Math.round(total / 1024)} Ko de chargement initial en mobile (budget ${Math.round(budget / 1024)} Ko)`);
  return { problemes, total, images: nb };
}
