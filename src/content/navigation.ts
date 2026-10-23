// Navigation publique de la version hemea. Les autres capacités restent en source.
type Entree = { libelle: string; href: string; badge?: string };
export const navigation: Entree[] = [
  { libelle: "Particuliers", href: "/travaux/" },
  { libelle: "Avant d'acheter", href: "/acquereurs/" },
  { libelle: "Prescripteurs", href: "/professionnels/" },
  { libelle: "Relevé & Plans 3D", href: "/releve-scanner-imapper/" },
  { libelle: "À propos", href: "/a-propos/" },
];
