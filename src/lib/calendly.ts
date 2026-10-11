// Attribution du visiteur jusqu'au rendez-vous : source → campagne → page → bouton → RDV.
// Fonctions pures (testées sans réseau). Aucun cookie : l'origine vit dans sessionStorage, côté navigateur,
// et ne part que dans l'URL Calendly que le visiteur choisit d'ouvrir. Growth la relit ensuite dans la
// réservation (utm_*), sans base ni CRM parallèle.
//
// Règles (revue technique du tracking, 2026-10) :
// - Seuls les cinq champs utm_* voyagent vers Calendly. Les paramètres a1..a3 sont RETIRÉS : ils préremplissent
//   les questions visibles du formulaire (« Type de projet », « Localisation ») au lieu de porter du suivi.
// - Les utm_* d'origine (Ads, Meta, newsletter...) sont conservés tels quels, seulement normalisés au format
//   attendu par Growth/Core : ^[a-z0-9][a-z0-9._-]{0,119}$. Jamais remplacés par l'identifiant du bouton.
// - utm_term est réservé au mot-clé de campagne. utm_content porte le bouton seulement quand aucune valeur
//   d'origine n'existe, avec le préfixe « dvk. » qui le distingue d'une valeur publicitaire.
// - gclid : ni lu, ni conservé, ni transmis tant que le consentement n'est pas en place.

export const CALENDLY_BASE = "https://calendly.com/contact-dvkstudio/premier-contact";

/** Offres d'acquisition publiées. Toute autre capacité reste hors de ce type tant qu'elle n'est pas validée. */
export type Offre = "renovation" | "achat_travaux";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrerHote?: string;
  atterrissage?: string;
  /**
   * Offre d'origine retenue : celle de la campagne, à défaut celle de la page d'arrivée. C'est une ORIGINE,
   * jamais le besoin qualifié. Les deux sources restent conservées séparément ci-dessous, même en désaccord.
   */
  offre?: Offre;
  offreCampagne?: Offre;
  offreAtterrissage?: Offre;
};

/** Vrai quand la campagne et la page d'arrivée annoncent deux offres différentes (ex. /travaux/ + achat-travaux-*). */
export function ecartOffre(a: Attribution): boolean {
  return a.offreCampagne !== undefined && a.offreAtterrissage !== undefined && a.offreCampagne !== a.offreAtterrissage;
}

const MAX_UTM = 120;

// Seules différences considérées comme « la même valeur » : casse, accents, espaces de bord.
const plier = (v: string): string => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// FNV-1a 32 bits (déterministe, sans dépendance), 7 caractères base 36.
function empreinte(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  return h.toString(36).padStart(7, "0");
}

/**
 * Normalise une valeur de campagne au format Growth/Core (^[a-z0-9][a-z0-9._-]{0,119}$).
 *
 * - Valeur vide ou blanche : undefined (rien à transmettre).
 * - Écart limité à la casse, aux accents et aux espaces de bord : valeur pliée, sans marque.
 * - Toute autre modification (caractère remplacé, séparateur ajusté, troncature) : suffixe « -h<7 car.> » calculé
 *   sur la valeur pliée. Deux valeurs différentes ne deviennent donc jamais identiques en silence
 *   (« a b » → « a-b-h… », distinct de « a-b »).
 * - Valeur sans aucun caractère exploitable (« ### ») : « invalide-h… ». Elle n'est jamais perdue en silence, ni
 *   remplacée par un identifiant de bouton interne.
 * Idempotente : une valeur déjà normalisée ressort identique.
 */
export function normaliserUtm(v: string | null | undefined): string | undefined {
  const plie = plier(v ?? "");
  if (plie === "") return undefined;
  const base = plie
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "");
  if (base !== "" && base === plie && base.length <= MAX_UTM) return base;
  const marque = `-h${empreinte(plie)}`;
  const tronque = base.slice(0, MAX_UTM - marque.length).replace(/[^a-z0-9]+$/, "");
  return `${tronque === "" ? "invalide" : tronque}${marque}`;
}

// Chemin d'atterrissage : informatif (navigateur), jamais envoyé à Calendly.
const nettoyerChemin = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim().replace(/[^\w.\-/]/g, "").slice(0, 100);
  return t === "" ? undefined : t;
};

/**
 * Offre d'ORIGINE annoncée par la campagne : préfixe « renovation- » ou « achat-travaux- » de utm_campaign.
 * C'est l'origine publicitaire, pas le besoin réellement qualifié (travaux | immobilier | mixte), que Growth
 * établit à la qualification et qui peut différer.
 */
export function offreDepuisCampagne(campagne: string | null | undefined): Offre | undefined {
  const c = normaliserUtm(campagne);
  if (!c) return undefined;
  if (c.startsWith("renovation-")) return "renovation";
  if (c.startsWith("achat-travaux-")) return "achat_travaux";
  return undefined;
}

/** Offre d'origine portée par une page : /travaux/ → renovation, /acquereurs/ → achat_travaux, sinon aucune. */
export function offreDepuisChemin(chemin: string | null | undefined): Offre | undefined {
  const c = (chemin ?? "").replace(/\/+$/, "");
  if (c === "/travaux") return "renovation";
  if (c === "/acquereurs") return "achat_travaux";
  return undefined;
}

// Lit l'origine à l'arrivée : paramètres de campagne, sinon l'hôte du site référent (hors site lui-même).
export function lireAttribution(search: string, referrer: string, chemin: string, hoteSite: string): Attribution {
  const p = new URLSearchParams(search);
  let referrerHote: string | undefined;
  try {
    const h = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
    if (h && h !== hoteSite.replace(/^www\./, "")) referrerHote = h;
  } catch {
    referrerHote = undefined;
  }
  return {
    utm_source: normaliserUtm(p.get("utm_source")),
    utm_medium: normaliserUtm(p.get("utm_medium")),
    utm_campaign: normaliserUtm(p.get("utm_campaign")),
    utm_content: normaliserUtm(p.get("utm_content")),
    utm_term: normaliserUtm(p.get("utm_term")),
    referrerHote: normaliserUtm(referrerHote),
    atterrissage: nettoyerChemin(chemin),
    ...offresDepuis(p.get("utm_campaign"), chemin),
  };
}

// Offres d'origine : la convention de campagne prime sur la page d'arrivée, les deux restent conservées.
function offresDepuis(campagne: string | null | undefined, chemin: string | null | undefined) {
  const offreCampagne = offreDepuisCampagne(campagne);
  const offreAtterrissage = offreDepuisChemin(chemin);
  return { offre: offreCampagne ?? offreAtterrissage, offreCampagne, offreAtterrissage };
}

// Origine stockée par une version précédente ou altérée dans le navigateur : on ne lui fait pas confiance.
// Seuls les champs connus sont gardés (gclid, a1..a3 purgés), chacun est renormalisé et les offres sont recalculées.
const texte = (v: unknown): string | undefined => (typeof v === "string" ? v : undefined);
function purger(o: Attribution): Attribution {
  const campagne = normaliserUtm(texte(o.utm_campaign));
  const atterrissage = nettoyerChemin(texte(o.atterrissage));
  return {
    utm_source: normaliserUtm(texte(o.utm_source)),
    utm_medium: normaliserUtm(texte(o.utm_medium)),
    utm_campaign: campagne,
    utm_content: normaliserUtm(texte(o.utm_content)),
    utm_term: normaliserUtm(texte(o.utm_term)),
    referrerHote: normaliserUtm(texte(o.referrerHote)),
    atterrissage,
    ...offresDepuis(campagne, atterrissage),
  };
}

// Conserve la PREMIÈRE origine d'une session (jamais écrasée par une navigation interne).
export function fusionnerOrigine(existante: Attribution | null, nouvelle: Attribution): Attribution {
  if (existante && (existante.utm_source || existante.referrerHote || existante.atterrissage)) return purger(existante);
  return nouvelle;
}

export type ContexteBouton = { page: string; bouton: string; parcours?: string; offre?: Offre };

// Construit le lien de prise de rendez-vous. Les utm_* d'origine passent tels quels (normalisés). Sans utm_content
// d'origine, il vaut « dvk.[offre.]page.bouton » : le bouton est identifié sans écraser une valeur de campagne.
// `parcours` reste accepté (information de navigation) mais n'est plus transmis à Calendly.
export function construireLienRdv(base: string, origine: Attribution | null, ctx: ContexteBouton): string {
  const url = new URL(base);
  const o = origine ?? {};
  const source = normaliserUtm(o.utm_source) ?? normaliserUtm(o.referrerHote) ?? "direct";
  const medium = normaliserUtm(o.utm_medium) ?? (o.referrerHote ? "referral" : "none");
  url.searchParams.set("utm_source", source);
  url.searchParams.set("utm_medium", medium);
  const campagne = normaliserUtm(o.utm_campaign);
  if (campagne) url.searchParams.set("utm_campaign", campagne);
  const contenu =
    normaliserUtm(o.utm_content) ??
    normaliserUtm(["dvk", ctx.offre ?? o.offre, ctx.page, ctx.bouton].filter(Boolean).join("."));
  if (contenu) url.searchParams.set("utm_content", contenu);
  const terme = normaliserUtm(o.utm_term);
  if (terme) url.searchParams.set("utm_term", terme);
  return url.toString();
}
