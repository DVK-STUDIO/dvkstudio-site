// Navigation principale. Les entrées dépendant d'une capacité inactive n'y figurent pas (voir capacites.ts).
import { iadActive } from "./capacites";
import { iad } from "./iad";

export const navigation: { libelle: string; href: string; badge?: string }[] = [
  ...(iadActive ? iad.navigation : []),
  { libelle: "Travaux", href: "/travaux/" },
  { libelle: "Acquéreurs", href: "/acquereurs/" },
  { libelle: "Professionnels", href: "/professionnels/" },
  { libelle: "DVK Expérience", href: "/experience/", badge: "Nouveau" },
  { libelle: "À propos", href: "/a-propos/" },
];
