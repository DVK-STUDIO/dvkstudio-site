// Gardes au niveau du SOURCE pour la capacité Immobilier :
//  - le réseau (iad) et la qualité de mandataire ne vivent que dans des fichiers dédiés ; aucune autre source ne les cite en dur
//    (ils passeraient dans le build malgré l'interrupteur) ;
//  - l'interrupteur est unique ; le mode publié est « orientation » ; « mandataire » est verrouillé tant que les données manquent.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { immobilier, immobilierVisible, mandataireActif } from "../content/capacites";
import { navigation } from "../content/navigation";
import { reglementaire, reglementaireManquant, verrouMandataire } from "../content/iad";

const AUTORISES = [
  /^src[\\/]content[\\/]iad\.ts$/,
  /^src[\\/]content[\\/]immobilier\.ts$/,
  /^src[\\/]content[\\/]capacites\.ts$/,
  /^src[\\/]immobilier[\\/]/,
  /^src[\\/]lib[\\/]capacites\.test\.ts$/,
  /^src[\\/]lib[\\/]calendly\.test\.ts$/,
];
function sources(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const c = join(d, n);
    if (statSync(c).isDirectory()) return n === "data" || n === "assets" ? [] : sources(c);
    return /\.(astro|ts|css|md)$/.test(n) ? [c] : [];
  });
}

describe("capacité Immobilier : isolation des sources", () => {
  it("aucune source hors du périmètre dédié ne cite le réseau iad ou la qualité de mandataire immobilier", () => {
    const fautes = sources("src")
      .filter((c) => !AUTORISES.some((r) => r.test(c)))
      .filter((c) => /\biad\b|[Mm]andataires? immobili/i.test(readFileSync(c, "utf8")));
    expect(fautes).toEqual([]);
  });
});

describe("capacité Immobilier : interrupteur", () => {
  it("l'interrupteur est unique et vaut « orientation » (version préparée pour publication)", () => {
    expect(Object.keys(immobilier)).toEqual(["mode"]);
    expect(immobilier.mode).toBe("orientation");
    expect(immobilierVisible).toBe(true);
    expect(mandataireActif).toBe(false);
  });
  it("la navigation place Immobilier en tête et en retire Acquéreurs", () => {
    expect(navigation.map((n) => n.href)).toEqual(["/immobilier/", "/travaux/", "/experience/", "/professionnels/", "/a-propos/"]);
    expect(navigation.map((n) => n.libelle)).toEqual(["Immobilier", "Travaux", "DVK Expérience", "Professionnels", "À propos"]);
  });
});

describe("mode mandataire : verrou des données réglementaires", () => {
  it("les données réelles sont incomplètes et non validées : activation refusée", () => {
    expect(reglementaire.valide).toBe(false);
    expect(reglementaireManquant(reglementaire).length).toBeGreaterThan(0);
    expect(verrouMandataire(reglementaire)).toMatch(/refusé/);
  });
  it("refuse un jeu complet mais non validé", () => {
    const complet = { ...reglementaire, qualite: "q", rsac: "r", carteProfessionnelle: "c", garantieFinanciere: "g", assuranceRcp: "a", honoraires: "h", mediateur: "m" };
    expect(reglementaireManquant(complet)).toEqual([]);
    expect(verrouMandataire({ ...complet, valide: false })).toMatch(/valide/);
  });
  it("refuse un jeu validé mais incomplet (champ vide ou à compléter)", () => {
    const complet = { ...reglementaire, valide: true, qualite: "q", rsac: "r", carteProfessionnelle: "c", garantieFinanciere: "g", assuranceRcp: "a", honoraires: "h", mediateur: "m" };
    expect(verrouMandataire(complet)).toBeNull();
    expect(verrouMandataire({ ...complet, rsac: "" })).toMatch(/rsac/);
    expect(verrouMandataire({ ...complet, mediateur: "[à compléter]" })).toMatch(/mediateur/);
  });
});
