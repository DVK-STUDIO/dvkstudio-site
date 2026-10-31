// Navigation publique de la version hemea. Les autres capacités restent en source.
type Entree = { libelle: string; href: string; badge?: string };
export const navigation: Entree[] = [
  { libelle: "Rénovation", href: "/travaux/" },
  { libelle: "Investisseurs", href: "/investisseurs/" },
  { libelle: "Avant d'acheter", href: "/acquereurs/" },
  { libelle: "Plans 2D/3D", href: "/releve-scanner-imapper/" },
  { libelle: "Professionnels", href: "/professionnels/" },
  { libelle: "Guides & Conseils", href: "/blog/" },
  { libelle: "À propos", href: "/a-propos/" },
];
