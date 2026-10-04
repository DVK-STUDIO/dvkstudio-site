// Données du réseau et données réglementaires de l'activité immobilière. ISOLÉES ici : aucune page publique ne doit les citer en dur.
// Aucune valeur inventée : tout champ non confirmé reste « [à compléter] ». En mode « mandataire », le build échoue
// tant qu'un champ manque ou que `valide` vaut false (voir src/content/immobilier.ts et scripts/check-capacites.mjs).
import { A_COMPLETER } from "./site";

// Graphie vérifiée le 2026-10-04 sur les e-mails officiels d'iad (expéditeur notif.iadinternational.com) : « iad » et « iad France ».
// Utilisée partout par cette seule variable. Pas de logo iad pour l'instant.
export const reseau = {
  nom: "iad France",
};

export const reglementaire = {
  // Passer à true seulement quand tous les champs ci-dessous sont les valeurs officielles, validées par Kevin et par iad.
  valide: false,
  // Qualité exacte, telle que validée par iad (ne jamais la deviner).
  qualite: A_COMPLETER,
  // Immatriculation au RSAC : numéro et greffe.
  rsac: A_COMPLETER,
  carteProfessionnelle: A_COMPLETER,
  garantieFinanciere: A_COMPLETER,
  assuranceRcp: A_COMPLETER,
  // Honoraires : barème iad et modalités d'accès.
  honoraires: A_COMPLETER,
  // Médiateur : périmètre de l'adhésion CM2C du 11/11/2025 et exigences d'iad à vérifier avant de remplir.
  mediateur: A_COMPLETER,
};

export type Reglementaire = typeof reglementaire;

/** Retourne les champs absents ou encore à compléter (liste vide = complet). */
export function reglementaireManquant(r: Reglementaire): string[] {
  return (Object.entries(r) as [string, unknown][])
    .filter(([cle]) => cle !== "valide")
    .filter(([, v]) => typeof v !== "string" || v.trim() === "" || /à compléter/i.test(v))
    .map(([cle]) => cle);
}

/** Message d'erreur si le mode « mandataire » est demandé avec des données incomplètes ou non validées ; null sinon. */
export function verrouMandataire(r: Reglementaire): string | null {
  const manque = reglementaireManquant(r);
  if (!r.valide) return "mode « mandataire » refusé : `reglementaire.valide` vaut false (src/content/iad.ts)";
  if (manque.length) return `mode « mandataire » refusé : données réglementaires incomplètes (${manque.join(", ")})`;
  return null;
}
