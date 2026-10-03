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
  // Activité de mandataire immobilier : emplacement prévu, AUCUNE valeur inventée. À fournir par Kevin
  // avant toute mise en ligne (voir docs/avant-mise-en-ligne.md).
  mandataire: {
    reseau: "IAD France",
    carteProfessionnelle: A_COMPLETER,
    garantieFinanciere: A_COMPLETER,
    assuranceRcp: A_COMPLETER,
    registreMandataires: A_COMPLETER,
  },
  reseaux: { instagram: "https://www.instagram.com/dvk_studio_officiel/", linkedin: "https://www.linkedin.com/in/kevin-de-vlieger-88b261364/", facebook: "https://www.facebook.com/profile.php?id=61575906091084" },
};

export const navigation = [
  { libelle: "Immobilier", href: "/immobilier/" },
  { libelle: "Travaux", href: "/travaux/" },
  { libelle: "DVK Expérience", href: "/experience/", badge: "Nouveau" },
  { libelle: "Professionnels", href: "/professionnels/" },
  { libelle: "À propos", href: "/a-propos/" },
];

// Hero : mode interchangeable par simple changement de contenu.
//  - "typo"        : hero typographique (par défaut tant que le droit d'usage du visuel n'est pas confirmé)
//  - "avantApres"  : curseur avant/après (visuels dans src/assets/hero/, voir scripts/prepare-images.mjs)
export const hero = {
  mode: "typo" as "typo" | "avantApres",
  avantApres: { avant: "", apres: "", legende: "Projection réalisée par DVK Studio à partir de photos du bien — une visualisation, pas un travail réalisé." },
};
