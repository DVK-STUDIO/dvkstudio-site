// Contrôle de la capacité Immobilier sur le site CONSTRUIT, selon la matrice du mode (src/content/capacites.ts) :
//   off         : aucune page /immobilier/, aucune présentation de l'activité immobilière, aucune référence au réseau iad.
//   orientation : page /immobilier/ active ; « je rejoins le réseau iad France » autorisé ; qualité réglementée, mandat, avis de valeur,
//                 honoraires/barème, mentions réglementaires et SEO transactionnel interdits.
//   mandataire  : verrouillé tant que les données réglementaires ne sont pas complètes et validées.
// La qualité contractuelle de « mandataire indépendant hemea » n'est PAS visée : seule la capacité immobilière l'est.

export const MODES = ["off", "orientation", "mandataire"];

const sansCommentaires = (source) => source.replace(/\/\/.*$/gm, "");

/** Lit le mode dans le source de src/content/capacites.ts. Échoue s'il n'est pas lisible : jamais de valeur supposée. */
export function lireModeImmobilier(source) {
  const m = /mode\s*:\s*"(off|orientation|mandataire)"/.exec(sansCommentaires(source));
  if (!m) throw new Error("mode immobilier introuvable dans src/content/capacites.ts");
  return m[1];
}

/** Lit `reglementaire.valide` dans le source de src/content/iad.ts. */
export function lireValide(source) {
  const m = /valide\s*:\s*(true|false)\b/.exec(sansCommentaires(source));
  if (!m) throw new Error("`valide` introuvable dans src/content/iad.ts");
  return m[1] === "true";
}

// Motifs interdits dans tous les modes.
const COMMUNS = [
  [/\bIAD\b|\bIad\b/, "graphie « IAD » (graphie officielle : iad)"],
  [/\[\s*à\s+(vérifier|compléter)/i, "marqueur « [À VÉRIFIER] » ou « [À compléter] »"],
  [/à compléter/i, "emplacement « à compléter »"],
  [/garanties?\s+hemea|protection\s+hemea|garanti(e|s)?\s+par\s+hemea|hemea\s+garanti/i, "description d'une garantie hemea non documentée"],
];
const PROMESSES = [/plus\s+vite|plus\s+cher|meilleur\s+prix|vendu\s+plus/i, "promesse de vente plus rapide ou plus chère"];
const QUESTION_PROMESSE = /Mon bien se vendra-t-il plus vite ou plus cher\s*\?/g;
const CONSEIL = /conseill(?:er|ère)s?\s+en\s+investissement|conseils?\s+en\s+investissement/gi;
const NEGATION = /\bni\b|\bne\b|\bn'|\bpas\b|\bnon\b|\bjamais\b|\bsans\b/i;

// Motifs interdits en « off » : toute trace de l'activité immobilière et du réseau.
const OFF = [
  [/\biad\b/i, "« iad »"],
  [/mandataires?\s+immobili/i, "« mandataire immobilier »"],
  [/mandats?\s+de\s+vente/i, "« mandat de vente »"],
  [/\/immobilier\//, "lien ou URL /immobilier/"],
  [/\bJe vends\b/, "entrée « Je vends »"],
];

// Motifs interdits en « orientation » : tout ce qui présenterait Kevin comme professionnel immobilier.
const ORIENTATION = [
  [/mandataires?\s+immobili/i, "« mandataire immobilier »"],
  [/conseill(?:er|ère)s?\s+immobili/i, "« conseiller immobilier »"],
  [/agents?\s+commerci(?:al|aux)/i, "« agent commercial »"],
  [/interviens\s+en\s+tant\s+que/i, "« j'interviens en tant que » (qualité)"],
  [/\bmandats?\b/i, "« mandat »"],
  [/avis\s+de\s+valeur/i, "« avis de valeur »"],
  [/honoraires?|barème/i, "honoraires ou barème"],
  [/\bRSAC\b|carte\s+professionnelle|garantie\s+financière|responsabilité\s+civile\s+professionnelle/i, "mention réglementaire"],
  [/habilité(?:e|s|es)?\s+à\b/i, "« habilité à » (acte réservé)"],
  [/dans\s+le\s+cadre\s+iad/i, "« dans le cadre iad » (activité exercée)"],
  [/rémunér|commission|apporteur\s+d'affaires?/i, "rémunération de recommandation"],
  [/RealEstateAgent/, "balisage RealEstateAgent (SEO transactionnel)"],
  [/<form\b/i, "formulaire (aucune transmission à un tiers)"],
];

function extrait(contenu, index) {
  const debut = Math.max(0, index - 30);
  return contenu.slice(debut, index + 50).replace(/\s+/g, " ");
}

function titreEtDescription(html) {
  const titre = /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "";
  const description = /<meta[^>]*name="description"[^>]*content="([^"]*)"/i.exec(html)?.[1] ?? "";
  return { titre, description };
}

/**
 * fichiers : [{ chemin: "index.html" | "immobilier/index.html" …, contenu }] ; valide : valeur de `reglementaire.valide`.
 * Retourne la liste des problèmes (vide = conforme).
 */
export function analyserImmobilier({ mode, fichiers, valide = false }) {
  if (!MODES.includes(mode)) return [`mode inconnu : ${mode}`];
  const problemes = [];
  const signaler = (chemin, libelle, contenu, index) => problemes.push(`${chemin} : ${libelle} [mode ${mode}] (…${extrait(contenu, index)}…)`);
  const page = fichiers.find((f) => f.chemin === "immobilier/index.html");

  // Présence de la page.
  if (mode === "off") {
    for (const { chemin } of fichiers) if (/^immobilier(\/|$)/.test(chemin)) problemes.push(`${chemin} : page Immobilier présente alors que le mode est « off »`);
  } else if (!page) problemes.push(`immobilier/index.html : page Immobilier absente alors que le mode est « ${mode} »`);

  if (mode === "mandataire" && !valide) problemes.push("mode « mandataire » avec `reglementaire.valide` à false : activation impossible");

  for (const { chemin, contenu } of fichiers) {
    if (typeof contenu !== "string") continue;
    const regles = [...COMMUNS, ...(mode === "off" ? OFF : []), ...(mode === "orientation" ? ORIENTATION : [])];
    for (const [motif, libelle] of regles) {
      const m = motif.exec(contenu);
      if (m) signaler(chemin, libelle, contenu, m.index);
    }
    // Promesses : seule la question de la FAQ peut contenir ces mots (la réponse est « Je ne peux pas le promettre »).
    const sansQuestion = contenu.replace(QUESTION_PROMESSE, "");
    const p = PROMESSES[0].exec(sansQuestion);
    if (p) signaler(chemin, PROMESSES[1], sansQuestion, p.index);
    // Conseil en investissement : uniquement sous forme de négation (« je ne suis pas / ni comme conseiller… »).
    for (const m of contenu.matchAll(CONSEIL)) {
      // Négation cherchée dans la même phrase (jusqu'à 250 caractères avant).
      const avant = contenu.slice(Math.max(0, m.index - 250), m.index).split(/[.!?]\s/).pop();
      if (!NEGATION.test(avant)) signaler(chemin, "« conseil en investissement » hors négation", contenu, m.index);
    }
  }

  if (page && typeof page.contenu === "string") {
    const { titre, description } = titreEtDescription(page.contenu);
    if (mode === "orientation" && /vendre\s+ou\s+acheter/i.test(`${titre} ${description}`)) {
      problemes.push("immobilier/index.html : titre ou description transactionnels (« vendre ou acheter ») en mode orientation");
    }
    if (mode === "mandataire") {
      const legal = fichiers.find((f) => f.chemin === "mentions-legales/index.html");
      if (!legal || !/Immatriculation au RSAC/.test(legal.contenu ?? "")) problemes.push("mentions-legales/index.html : informations réglementaires absentes en mode mandataire");
      if (!/Immatriculation au RSAC/.test(page.contenu)) problemes.push("immobilier/index.html : informations réglementaires absentes en mode mandataire");
    }
  }
  return problemes;
}
