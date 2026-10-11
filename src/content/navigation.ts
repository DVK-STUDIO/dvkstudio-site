// Navigation publique de la version hemea. Les autres capacités restent en source.
type Entree = { libelle: string; href: string; badge?: string };
export const navigation: Entree[] = [
  { libelle: "Particuliers", href: "/travaux/" },
  { libelle: "Avant d'acheter", href: "/acquereurs/" },
  { libelle: "Prescripteurs", href: "/professionnels/" },
  { libelle: "À propos", href: "/a-propos/" },
];

