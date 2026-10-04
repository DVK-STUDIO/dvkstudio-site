// Les cinq étapes de DVK Expérience : textes et statuts de la NATURE de l'information (jamais une valeur de projet).
// Partagé par la chaîne horizontale (ChaineExperience) et la chaîne au défilement (TransformationChaine).
import type { Statut } from "../lib/experience/experience";

export interface Jalon { n: string; titre: string; texte: string; statut: Statut; libelle?: string }

export const jalons: Jalon[] = [
  { n: "01", titre: "Bien actuel", texte: "Le bien tel qu'il est, avec la source de chaque donnée.", statut: "reel" },
  { n: "02", titre: "Potentiel", texte: "Ce qu'il permettrait, lu à partir de vos besoins.", statut: "hypothese" },
  { n: "03", titre: "Projection", texte: "Une image pour s'y voir, présentée comme un outil de compréhension.", statut: "hypothese" },
  { n: "04", titre: "Travaux", texte: "Les travaux envisageables, en ordre de grandeur avant la visite.", statut: "estimation" },
  { n: "05", titre: "Enveloppe indicative", texte: "Une première enveloppe, ou « à chiffrer » tant que rien n'est établi.", statut: "manquant", libelle: "À chiffrer" },
];
