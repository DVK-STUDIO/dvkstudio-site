// Le contrôle de la capacité IAD doit REFUSER ce qu'il prétend refuser : chaque règle est testée par un cas fautif.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { analyserCapaciteIad, lireInterrupteurIad } from "./capacites.mjs";

const f = (chemin, contenu) => ({ chemin, contenu });
const propre = [f("index.html", "<h1>DVK Studio</h1><p>Chef de projet travaux hemea</p>"), f("acquereurs/index.html", "<p>Acheter un bien à rénover</p>")];

describe("capacité IAD désactivée", () => {
  it("accepte un build sans IAD ni mandataire immobilier", () => expect(analyserCapaciteIad({ iadActif: false, fichiers: propre })).toEqual([]));
  it("refuse « IAD » en majuscules, en minuscules ou à côté d'un lien", () => {
    for (const t of ["réseau IAD France", "iad france", '<a href="https://www.iadfrance.fr/">x</a> IAD', "(IAD)"]) {
      expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("index.html", t)] }).join(), t).toMatch(/IAD/);
    }
  });
  it("refuse « mandataire immobilier » (toute casse, singulier ou pluriel), y compris dans les métadonnées et le JavaScript", () => {
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("a/index.html", '<meta name="description" content="Mandataire immobilier">')] })).toHaveLength(1);
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("_astro/x.js", 'const t="mandataires immobiliers"')] })).toHaveLength(1);
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("a/index.html", "un mandat de vente exclusif")] })).toHaveLength(1);
  });
  it("autorise la qualité contractuelle de mandataire indépendant hemea", () => {
    const t = "Kevin De Vlieger est mandataire indépendant de la société NOVARE CONSTRUCTION, exploitant sous l'enseigne hemea. Mandataire de hemea.";
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("mentions-legales/index.html", t)] })).toEqual([]);
  });
  it("refuse IAD même accolé à la qualité hemea", () => {
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("a/index.html", "mandataire indépendant hemea et IAD")] })).toHaveLength(1);
  });
  it("refuse la page /immobilier/ ; le mot immobilier seul n'est pas interdit", () => {
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("immobilier/index.html", "<p>x</p>")] }).join()).toMatch(/page IAD présente/);
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("sitemap-0.xml", "<loc>https://dvkstudio.fr/acquereurs/</loc>"), f("index.html", "projet immobilier")] })).toEqual([]);
  });
  it("ne confond pas avec des mots voisins", () => {
    expect(analyserCapaciteIad({ iadActif: false, fichiers: [f("index.html", "radiateur, médiation, ouvriad")] })).toEqual([]);
  });
});

describe("capacité IAD activée", () => {
  it("n'impose aucune absence", () => expect(analyserCapaciteIad({ iadActif: true, fichiers: [f("immobilier/index.html", "IAD France, mandataire immobilier")] })).toEqual([]));
});

describe("interrupteur", () => {
  it("lit true et false, ignore les commentaires", () => {
    expect(lireInterrupteurIad("export const capacites = {\n  iad: false as boolean,\n};")).toBe(false);
    expect(lireInterrupteurIad("// iad: true\nexport const capacites = { iad: true as boolean };")).toBe(true);
  });
  it("échoue si l'interrupteur est introuvable (jamais de valeur supposée)", () => expect(() => lireInterrupteurIad("export const x = 1;")).toThrow(/introuvable/));
  it("le fichier réel est lisible", () => expect(typeof lireInterrupteurIad(readFileSync("src/content/capacites.ts", "utf8"))).toBe("boolean"));
});
