// Signaux locaux disponibles pour un futur collecteur. Aucun envoi réseau ni donnée de formulaire.
const evenements = new Set(["page_vue", "rdv_ouvert", "appel_ouvert", "email_ouvert", "brouillon_prepare"]);
const pages = new Set(["home", "travaux", "acquereurs", "professionnels", "contact", "a-propos"]);
export function signalConversion(evenement, page, bouton) {
  if (!evenements.has(evenement) || !pages.has(page)) return null;
  return { evenement, page, ...(typeof bouton === "string" && /^[a-z0-9._-]{1,80}$/.test(bouton) ? { bouton } : {}) };
}
