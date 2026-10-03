// Contrôle de la capacité IAD sur le site CONSTRUIT. Quand l'interrupteur (src/content/capacites.ts) vaut false,
// ni « IAD » ni « mandataire immobilier » ne doivent apparaître dans le moindre fichier texte du build, et la page /immobilier/ ne doit pas exister.
// La qualité contractuelle de « mandataire indépendant hemea » n'est PAS visée : seule la capacité immobilière (IAD, mandataire immobilier) l'est.
export const MOTIFS_IAD = [
  [/\biad\b/i, "« IAD »"],
  [/mandataires?\s+immobili/i, "« mandataire immobilier »"],
  [/mandats?\s+de\s+vente/i, "« mandat de vente »"],
];

/** Lit la valeur de l'interrupteur dans le source de src/content/capacites.ts. Échoue s'il n'est pas lisible : jamais de valeur supposée. */
export function lireInterrupteurIad(source) {
  const m = /iad\s*:\s*(true|false)\b/.exec(source.replace(/\/\/.*$/gm, ""));
  if (!m) throw new Error("interrupteur iad introuvable dans src/content/capacites.ts");
  return m[1] === "true";
}

/** fichiers : [{ chemin: "index.html" | "immobilier/index.html" …, contenu }]. Retourne la liste des problèmes (vide = conforme). */
export function analyserCapaciteIad({ iadActif, fichiers }) {
  if (iadActif) return [];
  const problemes = [];
  for (const { chemin, contenu } of fichiers) {
    if (/^immobilier(\/|$)/.test(chemin)) problemes.push(`${chemin} : page IAD présente alors que la capacité est désactivée`);
    if (typeof contenu !== "string") continue;
    for (const [motif, libelle] of MOTIFS_IAD) {
      const m = motif.exec(contenu);
      if (m) {
        const debut = Math.max(0, m.index - 30);
        problemes.push(`${chemin} : ${libelle} alors que la capacité est désactivée (…${contenu.slice(debut, m.index + 40).replace(/\s+/g, " ")}…)`);
      }
    }
  }
  return problemes;
}
