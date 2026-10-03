// Données constantes du site. Rien d'inventé : tout champ non confirmé est marqué À_COMPLETER.
export const A_COMPLETER = "[à compléter]";

export const site = {
  nom: "DVK Studio",
  url: "https://dvkstudio.fr",
  zone: "Oise et secteurs limitrophes",
  telephone: "06 40 32 47 52",
  telephoneLien: "tel:+33640324752",
  email: "contact@dvkstudio.fr",
  editeur: {
    forme: "Entrepreneur individuel",
    nom: "Kevin De Vlieger",
    nomCommercial: "DVK Studio",
    adresse: "17 Rue Machaut, 60120 Gannes, France",
    siret: "892 737 156 00026",
    siren: "892 737 156",
    ape: "7410Z – Activités spécialisées de design",
    debutActivite: "01/04/2026",
    tva: "FR61892737156",
  },
  // Mandant hemea : identité telle qu'elle figure au contrat de mandataire indépendant signé en avril 2026.
  // Références complémentaires éventuellement imposées par la charte hemea : à confirmer, jamais inventées.
  mandant: {
    denomination: "NOVARE CONSTRUCTION",
    enseigne: "hemea",
    forme: "Société par actions simplifiée",
    capital: "18 266,24 €",
    rcs: "RCS Nanterre 813 776 416",
    siege: "176 avenue Charles de Gaulle, 92200 Neuilly-sur-Seine",
  },
  reseaux: { instagram: "https://www.instagram.com/dvk_studio_officiel/", linkedin: "https://www.linkedin.com/in/kevin-de-vlieger-88b261364/", facebook: "https://www.facebook.com/profile.php?id=61575906091084" },
};

// Hero : mode interchangeable par simple changement de contenu.
//  - "typo"        : hero typographique (par défaut tant que le droit d'usage du visuel n'est pas confirmé)
//  - "avantApres"  : curseur avant/après (visuels dans src/assets/hero/, voir scripts/prepare-images.mjs)
export const hero = {
  mode: "typo" as "typo" | "avantApres",
  avantApres: { avant: "", apres: "", legende: "Projection réalisée par DVK Studio à partir de photos du bien — une visualisation, pas un travail réalisé." },
};
