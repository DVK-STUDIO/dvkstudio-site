// Garde au niveau du SOURCE : le contenu IAD vit uniquement dans src/content/iad.ts et src/iad/.
// Aucune autre source ne doit le citer en dur (il passerait alors dans le build malgré l'interrupteur).
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { capacites } from "../content/capacites";
import { navigation } from "../content/navigation";

const AUTORISES = [/^src[\\/]content[\\/]iad\.ts$/, /^src[\\/]iad[\\/]/, /^src[\\/]lib[\\/]capacites\.test\.ts$/, /^src[\\/]lib[\\/]calendly\.test\.ts$/, /^src[\\/]content[\\/]capacites\.ts$/];
function sources(d: string): string[] {
  return readdirSync(d).flatMap((n) => {
    const c = join(d, n);
    if (statSync(c).isDirectory()) return n === "data" || n === "assets" ? [] : sources(c);
    return /\.(astro|ts|css|md)$/.test(n) ? [c] : [];
  });
}

describe("capacité IAD : isolation des sources", () => {
  it("aucune source hors du périmètre IAD ne cite IAD ou mandataire immobilier", () => {
    const fautes = sources("src")
      .filter((c) => !AUTORISES.some((r) => r.test(c)))
      .filter((c) => /\bIAD\b|[Mm]andataires? immobili/.test(readFileSync(c, "utf8")));
    expect(fautes).toEqual([]);
  });
  it("l'interrupteur est unique et désactivé tant que le statut n'est pas validé", () => {
    expect(Object.keys(capacites)).toEqual(["iad"]);
    expect(capacites.iad).toBe(false);
  });
  it("la navigation n'expose pas l'immobilier IAD quand la capacité est désactivée", () => {
    expect(navigation.map((n) => n.href)).not.toContain("/immobilier/");
    expect(navigation.map((n) => n.libelle)).toEqual(["Travaux", "Acquéreurs", "Professionnels", "DVK Expérience", "À propos"]);
  });
});
