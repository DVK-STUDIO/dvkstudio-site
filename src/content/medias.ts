// Registre des médias photographiques : SEUL endroit où un média est déclaré.
//
// Règle : un média n'est publié que si ses droits sont « confirmes » (avec une référence de justificatif et une date)
// ET que son fichier existe dans src/assets/medias/. Tant que tout est « non-confirmes », le site public reste celui
// sans photographie : aucun emplacement vide, aucune image pour remplir.
//
// Les stand-ins (src/assets/standins/, jamais versionnés) ne servent qu'au développement local : `npm run dev:standins`.
// Ils ne peuvent jamais entrer dans un build (voir src/lib/medias.ts). Les coordonnées (x, y) sont en % de l'image.
import type { Statut } from "../lib/experience/experience";

export type Droits = { statut: "confirmes" | "non-confirmes"; reference?: string; date?: string };
export type Repere = { x: number; y: number; libelle: string; statut: Extract<Statut, "reel" | "estimation" | "hypothese" | "manquant"> };
export type Lot = { nom: string; note: string; statut: Repere["statut"] };
export type Provenance = "meme-projet" | "autre-projet";

export interface ConfigPaire {
  /** Noms de fichier (sans extension) dans src/assets/medias/. Même bien, même cadrage, mêmes dimensions. */
  avant: string;
  apres: string;
  altAvant: string;
  altApres: string;
  /** Au plus 2 repères dans le hero (sur la projection). */
  reperesHero: Repere[];
  /** Au plus 4 repères sur l'existant, étape 02 « Potentiel » de la chaîne. */
  reperesPotentiel: Repere[];
  /** Lots de l'étape 05 : repères, statuts, ordre de grandeur lorsqu'il existe. Jamais de montant inventé. */
  lots: Lot[];
  droits: Droits;
}

export interface ConfigImage {
  fichier: string;
  alt: string;
  /** Au plus 3 repères de potentiel. */
  reperes: Repere[];
  /** Obligatoire pour un chantier : dit si l'image appartient au projet présenté. */
  provenance?: Provenance;
  droits: Droits;
}

const aConfirmer: Droits = { statut: "non-confirmes" };

/** Production : rien n'est autorisé tant que les droits ne sont pas archivés. */
export const registre: { paire: ConfigPaire; chantier: ConfigImage; immobilier: ConfigImage; acquereurs: ConfigImage; ambiance: ConfigImage } = {
  paire: { avant: "hero-avant", apres: "hero-apres", altAvant: "", altApres: "", reperesHero: [], reperesPotentiel: [], lots: [], droits: aConfirmer },
  chantier: { fichier: "chantier", alt: "", reperes: [], provenance: "autre-projet", droits: aConfirmer },
  immobilier: { fichier: "immobilier-bien", alt: "", reperes: [], droits: aConfirmer },
  acquereurs: { fichier: "acquereurs-bien", alt: "", reperes: [], droits: aConfirmer },
  /** Photo d'ambiance du hero de l'accueil (charte « Atelier · hemea ») : illustration, jamais présentée comme un chantier réalisé. */
  ambiance: {
    fichier: "ambiance",
    alt: "",
    reperes: [],
    droits: { statut: "confirmes", reference: "Droits d'usage confirmés par Kévin DE VLIEGER lors de la validation de la charte (photo d'illustration du hero)", date: "2026-10-11" },
  },
};

/** Développement local uniquement (voir src/lib/medias.ts). */
export const standins: { paire: ConfigPaire; chantier: ConfigImage; immobilier: ConfigImage; acquereurs: ConfigImage; ambiance: ConfigImage } = {
  paire: {
    avant: "standin-paire-avant",
    apres: "standin-paire-apres",
    altAvant: "Séjour existant, tel qu'il est",
    altApres: "Projection du même séjour",
    reperesHero: [
      { x: 94, y: 50, libelle: "Ouverture", statut: "hypothese" },
      { x: 58, y: 87, libelle: "Sol", statut: "manquant" },
    ],
    reperesPotentiel: [
      { x: 5, y: 36, libelle: "Ouverture : à repenser", statut: "hypothese" },
      { x: 12, y: 57, libelle: "Cuisine : à reprendre", statut: "hypothese" },
      { x: 50, y: 85, libelle: "Sol carrelé : à déposer ?", statut: "manquant" },
    ],
    lots: [
      { nom: "Ouverture", note: "Menuiserie et reprise du mur", statut: "manquant" },
      { nom: "Cuisine", note: "Ordre de grandeur, à confirmer après visite", statut: "estimation" },
      { nom: "Sol", note: "Dépose du carrelage ou pose sur l'existant", statut: "manquant" },
      { nom: "Peinture et finitions", note: "Ordre de grandeur, à confirmer après visite", statut: "estimation" },
    ],
    droits: aConfirmer,
  },
  chantier: { fichier: "standin-chantier", alt: "Mur ouvert : brique, plaque de plâtre, ossature", reperes: [], provenance: "autre-projet", droits: aConfirmer },
  immobilier: {
    fichier: "standin-immobilier",
    alt: "Maison ancienne en pierre, toit de tuiles à deux pans",
    reperes: [
      { x: 53, y: 60, libelle: "Baie élargie", statut: "hypothese" },
      { x: 65, y: 27, libelle: "Combles aménageables", statut: "manquant" },
    ],
    droits: aConfirmer,
  },
  acquereurs: {
    fichier: "standin-acquereurs",
    alt: "Séjour daté, carrelage et cuisine ouverte",
    reperes: [
      { x: 51, y: 51, libelle: "Cuisine ouverte : à reprendre", statut: "hypothese" },
      { x: 83, y: 85, libelle: "Sol carrelé : à déposer ?", statut: "manquant" },
    ],
    droits: aConfirmer,
  },
  ambiance: { fichier: "standin-ambiance", alt: "", reperes: [], droits: aConfirmer },
};

/** Illustration IA dédiée au simulateur, distincte de la photo du hero. */
export const simulateur: ConfigImage = {
  fichier: 'simulateur-renovation', alt: '', reperes: [],
  droits: { statut: 'confirmes', reference: 'Illustration générée avec image_gen pour DVK Studio le 13 octobre 2026 ; ne représente aucun chantier client.', date: '2026-10-13' },
};
