// Attribution du visiteur jusqu'au rendez-vous : source → campagne → page → bouton → RDV.
// Fonctions pures (testées sans réseau). Aucun cookie : l'origine vit dans sessionStorage, côté navigateur,
// et ne part que dans l'URL Calendly que le visiteur choisit d'ouvrir. Growth la relit ensuite dans la
// réservation (utm_*), sans base ni CRM parallèle.

export const CALENDLY_BASE = "https://calendly.com/contact-dvkstudio/premier-contact";

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  referrerHote?: string;
  atterrissage?: string;
};

const MAX = 100;
const nettoyer = (v: string | null | undefined): string | undefined => {
  if (!v) return undefined;
  const t = v.trim().replace(/[^\w.\-:/ éèêàùç]/gi, "").slice(0, MAX);
  return t === "" ? undefined : t;
};

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
    utm_source: nettoyer(p.get("utm_source")),
    utm_medium: nettoyer(p.get("utm_medium")),
    utm_campaign: nettoyer(p.get("utm_campaign")),
    utm_content: nettoyer(p.get("utm_content")),
    utm_term: nettoyer(p.get("utm_term")),
    gclid: nettoyer(p.get("gclid")),
    referrerHote: nettoyer(referrerHote),
    atterrissage: nettoyer(chemin),
  };
}

// Conserve la PREMIÈRE origine d'une session (jamais écrasée par une navigation interne).
export function fusionnerOrigine(existante: Attribution | null, nouvelle: Attribution): Attribution {
  if (existante && (existante.utm_source || existante.referrerHote || existante.atterrissage)) return existante;
  return nouvelle;
}

export type ContexteBouton = { page: string; bouton: string; parcours?: string };

// Construit le lien de prise de rendez-vous. utm_content = « page.bouton » (le bouton cliqué) ; le contenu de
// campagne d'origine, l'atterrissage et le gclid passent en paramètres personnalisés a1..a3.
export function construireLienRdv(base: string, origine: Attribution | null, ctx: ContexteBouton): string {
  const url = new URL(base);
  const o = origine ?? {};
  url.searchParams.set("utm_source", o.utm_source ?? o.referrerHote ?? "direct");
  url.searchParams.set("utm_medium", o.utm_medium ?? (o.referrerHote ? "referral" : "none"));
  if (o.utm_campaign) url.searchParams.set("utm_campaign", o.utm_campaign);
  const content = nettoyer(`${ctx.page}.${ctx.bouton}`);
  if (content) url.searchParams.set("utm_content", content);
  const terme = nettoyer(ctx.parcours ?? o.utm_term);
  if (terme) url.searchParams.set("utm_term", terme);
  if (o.utm_content) url.searchParams.set("a1", o.utm_content);
  if (o.atterrissage) url.searchParams.set("a2", o.atterrissage);
  if (o.gclid) url.searchParams.set("a3", o.gclid);
  return url.toString();
}
