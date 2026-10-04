// Interrupteur UNIQUE de la capacité Immobilier du site. Ne pas dupliquer cette valeur ailleurs.
//
//   "off"         : aucune page /immobilier/, aucune présentation de l'activité immobilière, aucune référence au réseau.
//   "orientation" : page /immobilier/ publiée. Dégradation contrôlée de la page définitive : le site peut dire
//                   « je rejoins le réseau » (si c'est exact), mais ne présente JAMAIS Kevin comme professionnel
//                   immobilier, ni mandat, ni avis de valeur, ni honoraires, ni mention réglementaire.
//   "mandataire"  : page définitive. VERROUILLÉ : le build échoue tant que `reglementaire` (src/content/iad.ts)
//                   n'est pas complet et `valide`. Voir docs/mise-en-ligne.md, section « Activer le mode mandataire ».
//
// Le contrôle `npm run check:capacites` lit cette valeur et vérifie le site construit selon la matrice du mode.
export type ModeImmobilier = "off" | "orientation" | "mandataire";

export const immobilier = {
  mode: "orientation" as ModeImmobilier,
};

export const modeImmobilier: ModeImmobilier = immobilier.mode;
export const immobilierVisible = modeImmobilier !== "off";
export const mandataireActif = modeImmobilier === "mandataire";
