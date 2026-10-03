// Chargement et lecture des ExperiencePubliée v1. Le site ne consomme QUE ce contrat public :
// jamais de projet source, jamais de document. Un fichier invalide fait échouer le build.
import { validerExperience } from "../../../contracts/valider-experience.mjs";

export type Statut = "reel" | "estimation" | "hypothese" | "projection" | "a_venir" | "manquant";

export interface Conflit { valeur: string | number; unite?: string; sources: string[]; note?: string }
export interface Valeur { valeur?: string | number; unite?: string; statut: Statut; sources?: string[]; note?: string; conflits?: Conflit[] }
export interface Fait { id: string; libelle: string; valeur: Valeur }
export interface Source { id: string; libelle: string; type: string; date?: string }
export interface Besoin { id: string; espace: "cuisine" | "sejour" | "ensemble"; libelle: string; detail?: string; statut: "reel"; sources: string[] }
export interface Scenario {
  id: string; numero: number; nom: string; maturite: "pre_etude" | "a_etudier"; intention: string;
  changements: string[]; etudesPrealables: string[]; budget: Valeur; impactEnergetique: Valeur; projection: Valeur;
}
export interface Cellule { besoin: string; scenario: string; niveau: "repond" | "partiel" | "non"; note?: string }
export interface ExperiencePubliee {
  schemaVersion: "experience-publiee/1"; slug: string; titre: string; accroche: string;
  statutExperience: "demonstration" | "disponible"; indexable: boolean; genereLe: string; avertissements?: string[];
  sources: Source[];
  bien: { resume: string; faits: Fait[] };
  besoins: Besoin[];
  potentiel: { resume: string; faits: Fait[] };
  scenarios: Scenario[];
  matrice: { statut: "hypothese"; sources: string[]; lecture: string; cellules: Cellule[] };
  budget: { resume: string; energie: { intitule: string; nature: string; lots: { lot: string; montant: Valeur }[]; total: Valeur; financements: { libelle: string; montant: Valeur }[]; resteACharge: Valeur; avertissement: string } };
  energie: { resume: string; classeAvant: Valeur; classeApres: Valeur; consommation: Valeur; emissions: Valeur; factureAnnuelle: Valeur; economieAnnuelle: Valeur };
  projection: { statut: "a_venir"; message: string };
  prochaineAction: { titre: string; etapes: string[]; cta: { libelle: string; bouton: string } };
}

export const LIBELLE_STATUT: Record<Statut, string> = {
  reel: "Réel",
  estimation: "Estimation",
  hypothese: "Hypothèse",
  projection: "Projection",
  a_venir: "À venir",
  manquant: "À établir",
};

/** Ce que chaque statut veut dire, en une phrase (légende et infobulles). */
export const SENS_STATUT: Record<Statut, string> = {
  reel: "Constaté, mesuré ou déclaré, avec sa source.",
  estimation: "Ordre de grandeur calculé, à confirmer.",
  hypothese: "Lecture de DVK Studio, à vérifier.",
  projection: "Image ou simulation du résultat.",
  a_venir: "Pas encore produit.",
  manquant: "Information qu'il reste à établir. Rien n'est inventé.",
};

export const LIBELLE_NIVEAU = { repond: "Répond", partiel: "En partie", non: "Ne répond pas" } as const;
export const LIBELLE_MATURITE = { pre_etude: "Pré-étude", a_etudier: "À étudier" } as const;

const fichiers = import.meta.glob("../../data/experiences/*.json", { eager: true, import: "default" }) as Record<string, unknown>;

export function toutesLesExperiences(): ExperiencePubliee[] {
  return Object.entries(fichiers).map(([chemin, donnees]) => {
    const r = validerExperience(donnees);
    if (!r.ok) throw new Error(`ExperiencePubliée invalide (${chemin}) :\n- ${r.erreurs.join("\n- ")}`);
    return donnees as ExperiencePubliee;
  });
}

export function formaterNombre(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

/** Affichage d'une valeur : nombre séparé par espaces insécables, unité collée. « À établir » si manquant. */
export function afficherValeur(v: Valeur): string {
  if (v.statut === "manquant") return "À établir";
  if (v.statut === "a_venir") return "À venir";
  const brut = typeof v.valeur === "number" ? formaterNombre(v.valeur) : String(v.valeur ?? "");
  return v.unite ? `${brut} ${v.unite}` : brut;
}

export function afficherConflit(c: Conflit): string {
  const brut = typeof c.valeur === "number" ? formaterNombre(c.valeur) : String(c.valeur);
  return c.unite ? `${brut} ${c.unite}` : brut;
}

export function libelleSources(ids: string[] | undefined, sources: Source[]): string[] {
  return (ids ?? []).map((id) => sources.find((s) => s.id === id)?.libelle ?? id);
}

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
export function afficherMois(ym: string | undefined): string {
  if (!ym) return "";
  const [a, m] = ym.split("-");
  return `${MOIS[Number(m) - 1]} ${a}`;
}
export function afficherDate(iso: string): string {
  const [a, m, j] = iso.split("-");
  return `${Number(j)} ${MOIS[Number(m) - 1]} ${a}`;
}

/** Position d'une classe énergétique sur l'échelle A à G (0 à 6). */
export const CLASSES = ["A", "B", "C", "D", "E", "F", "G"] as const;
