// Résolution des médias : applique les règles du registre (src/content/medias.ts) et ne rend un média que s'il est autorisé.
//  - production : droits « confirmes » + référence + date + fichier présent dans src/assets/medias/ ;
//  - paire du comparateur : mêmes dimensions exactes (même cadrage), définition suffisante ;
//  - stand-ins : `astro dev` avec DVK_STANDINS=1 uniquement. Dans un build, leur demande lève une erreur.
import type { ImageMetadata } from "astro";
import standinsDev from "./standins-dev";
import { registre, standins, type ConfigImage, type ConfigPaire, type Droits, type Lot, type Provenance, type Repere } from "../content/medias";

export const MAX_REPERES_HERO = 2;
export const MAX_REPERES_POTENTIEL = 4;
export const MAX_REPERES_PAGE = 3;
/** Définition minimale d'une paire publiée (la cible de production du hero signature est 2400 × 2000). */
export const LARGEUR_MIN_PAIRE = 1600;

type Dossier = Record<string, { default: ImageMetadata }>;
const medias = import.meta.glob<{ default: ImageMetadata }>("../assets/medias/*.{webp,jpg,jpeg,png,avif}", { eager: true }) as Dossier;
// Liste des stand-ins : vide dans tout build (plugin « dvk-standins », astro.config.mjs).
const dossierStandins = standinsDev as Dossier;

export const STANDINS_DEMANDES = process.env.DVK_STANDINS === "1";
if (STANDINS_DEMANDES && !import.meta.env.DEV) {
  throw new Error("DVK_STANDINS=1 est réservé à `astro dev` : les stand-ins ne peuvent pas entrer dans un build.");
}

export interface MediaImage { src: ImageMetadata; alt: string; reperes: Repere[]; provenance?: Provenance; standin: boolean }
export interface MediaPaire { avant: ImageMetadata; apres: ImageMetadata; altAvant: string; altApres: string; reperesHero: Repere[]; reperesPotentiel: Repere[]; lots: Lot[]; standin: boolean }

export function trouver(dossier: Dossier, base: string): ImageMetadata | undefined {
  const cle = Object.keys(dossier).find((k) => new RegExp(`/${base}\\.[a-z0-9]+$`, "i").test(k));
  return cle ? dossier[cle].default : undefined;
}

export function verifierDroits(nom: string, d: Droits): void {
  if (d.statut !== "confirmes") return;
  if (!d.reference?.trim() || !d.date?.trim()) throw new Error(`média « ${nom} » : droits confirmés sans référence de justificatif et date`);
}

export function verifierReperes(nom: string, reperes: Repere[], max: number): void {
  if (reperes.length > max) throw new Error(`média « ${nom} » : ${reperes.length} repères (maximum ${max})`);
  for (const r of reperes) if (r.x < 0 || r.x > 100 || r.y < 0 || r.y > 100) throw new Error(`média « ${nom} » : repère « ${r.libelle} » hors de l'image`);
}

/** Identité stricte de dimensions (donc de ratio) entre l'existant et la projection ; définition minimale pour une paire publiée. */
export function verifierPaire(avant: ImageMetadata, apres: ImageMetadata, options: { largeurMin?: number } = {}): void {
  if (avant.width !== apres.width || avant.height !== apres.height) {
    throw new Error(`paire du comparateur : dimensions différentes (${avant.width}×${avant.height} et ${apres.width}×${apres.height}) ; même cadrage exact requis`);
  }
  if (options.largeurMin && avant.width < options.largeurMin) throw new Error(`paire du comparateur : ${avant.width} px de large (minimum ${options.largeurMin})`);
}

function configImage(slot: "chantier" | "immobilier" | "acquereurs", c: ConfigImage, dossier: Dossier, standin: boolean): MediaImage | null {
  const src = trouver(dossier, c.fichier);
  if (!src) {
    if (!standin && c.droits.statut === "confirmes") throw new Error(`média « ${slot} » : droits confirmés mais fichier ${c.fichier} absent de src/assets/medias/`);
    return null;
  }
  verifierReperes(slot, c.reperes, MAX_REPERES_PAGE);
  if (slot === "chantier" && !c.provenance) throw new Error("média « chantier » : provenance obligatoire (meme-projet ou autre-projet)");
  return { src, alt: c.alt, reperes: c.reperes, provenance: c.provenance, standin };
}

function resoudreImage(slot: "chantier" | "immobilier" | "acquereurs"): MediaImage | null {
  const c = registre[slot];
  if (c.droits.statut === "confirmes") {
    verifierDroits(slot, c.droits);
    return configImage(slot, c, medias, false);
  }
  if (STANDINS_DEMANDES) return configImage(slot, standins[slot], dossierStandins, true);
  return null;
}

function resoudrePaire(): MediaPaire | null {
  const c: ConfigPaire = registre.paire;
  if (c.droits.statut === "confirmes") {
    verifierDroits("paire", c.droits);
    const avant = trouver(medias, c.avant), apres = trouver(medias, c.apres);
    if (!avant || !apres) throw new Error("média « paire » : droits confirmés mais fichiers absents de src/assets/medias/");
    verifierPaire(avant, apres, { largeurMin: LARGEUR_MIN_PAIRE });
    verifierReperes("paire (hero)", c.reperesHero, MAX_REPERES_HERO);
    verifierReperes("paire (potentiel)", c.reperesPotentiel, MAX_REPERES_POTENTIEL);
    return { avant, apres, altAvant: c.altAvant, altApres: c.altApres, reperesHero: c.reperesHero, reperesPotentiel: c.reperesPotentiel, lots: c.lots, standin: false };
  }
  if (STANDINS_DEMANDES) {
    const s = standins.paire;
    const avant = trouver(dossierStandins, s.avant), apres = trouver(dossierStandins, s.apres);
    if (!avant || !apres) return null;
    verifierPaire(avant, apres);
    verifierReperes("paire (hero, stand-in)", s.reperesHero, MAX_REPERES_HERO);
    verifierReperes("paire (potentiel, stand-in)", s.reperesPotentiel, MAX_REPERES_POTENTIEL);
    return { avant, apres, altAvant: s.altAvant, altApres: s.altApres, reperesHero: s.reperesHero, reperesPotentiel: s.reperesPotentiel, lots: s.lots, standin: true };
  }
  return null;
}

/** Paire existant / projection du hero et de la chaîne. null = repli sur le hero et la chaîne actuels. */
export const paire = (): MediaPaire | null => resoudrePaire();
export const chantier = (): MediaImage | null => resoudreImage("chantier");
export const imageImmobilier = (): MediaImage | null => resoudreImage("immobilier");
export const imageAcquereurs = (): MediaImage | null => resoudreImage("acquereurs");

/** Mention de provenance d'un chantier : jamais de fausse continuité. */
export const mentionChantier = (p: Provenance | undefined): string =>
  p === "meme-projet" ? "Chantier du projet présenté" : "Illustration · chantier d'un autre projet";
