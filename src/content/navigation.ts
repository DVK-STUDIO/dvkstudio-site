// Navigation principale. Avec la capacité Immobilier (mode orientation ou mandataire), « Immobilier » ouvre le menu
// et « Acquéreurs » en sort (la page reste publiée : accueil, /immobilier/, plan de site). En mode « off » : menu d'origine.
import { immobilierVisible } from "./capacites";

type Entree = { libelle: string; href: string; badge?: string };

const travaux: Entree = { libelle: "Travaux", href: "/travaux/" };
const professionnels: Entree = { libelle: "Professionnels", href: "/professionnels/" };
const experience: Entree = { libelle: "DVK Expérience", href: "/experience/", badge: "Nouveau" };
const aPropos: Entree = { libelle: "À propos", href: "/a-propos/" };

export const navigation: Entree[] = immobilierVisible
  ? [{ libelle: "Immobilier", href: "/immobilier/" }, travaux, experience, professionnels, aPropos]
  : [travaux, { libelle: "Acquéreurs", href: "/acquereurs/" }, professionnels, experience, aPropos];
