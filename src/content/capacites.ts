// Interrupteur UNIQUE des capacités activables du site.
//
// iad = false : aucun contenu relatif à IAD France ni au statut de mandataire n'est émis par le build.
//   Les contenus restent dans le dépôt (src/content/iad.ts, src/iad/), prêts à être réactivés.
// iad = true  : à ne faire qu'une fois le statut IAD validé ET les mentions réglementaires définitives intégrées
//   (src/content/iad.ts, objet `mandataire`). Voir docs/mise-en-ligne.md, section « Activer la capacité IAD ».
//
// Le contrôle `npm run check:capacites` lit cette valeur et échoue si « IAD » ou « mandataire immobilier » apparaît
// dans le site construit alors qu'elle vaut false. Ne pas dupliquer cette valeur ailleurs.
export const capacites = {
  iad: false as boolean,
};

export const iadActive = capacites.iad;
