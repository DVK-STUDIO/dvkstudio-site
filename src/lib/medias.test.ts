// Les médias photographiques : droits, paire, repères, provenance, stand-ins. Tant que rien n'est confirmé, rien n'est publié.
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { registre, standins } from "../content/medias";
import {
  LARGEUR_MIN_PAIRE, MAX_REPERES_HERO, MAX_REPERES_PAGE, MAX_REPERES_POTENTIEL, STANDINS_DEMANDES,
  chantier, imageAcquereurs, imageImmobilier, mentionChantier, paire, trouver, verifierDroits, verifierPaire, verifierReperes,
} from "./medias";

const img = (width: number, height: number) => ({ src: "/x.jpg", width, height, format: "jpg" }) as never;
const repere = (n: number) => Array.from({ length: n }, (_, i) => ({ x: 10 + i, y: 20, libelle: `r${i}`, statut: "hypothese" as const }));

describe("livraison dormante : rien n'est publié sans droits confirmés", () => {
  it("tous les médias du registre sont « non-confirmes » tant que la paire signature n'existe pas", () => {
    for (const [nom, c] of Object.entries(registre)) expect(c.droits.statut, nom).toBe("non-confirmes");
  });
  it("sans stand-ins demandés, aucun média n'est résolu (hero et chaîne actuels, aucun emplacement vide)", () => {
    if (STANDINS_DEMANDES) return; // développement avec stand-ins : voir `npm run dev:standins`
    expect(paire()).toBeNull();
    expect(chantier()).toBeNull();
    expect(imageImmobilier()).toBeNull();
    expect(imageAcquereurs()).toBeNull();
  });
});

describe("verifierDroits", () => {
  it("exige une référence de justificatif et une date quand les droits sont confirmés", () => {
    expect(() => verifierDroits("x", { statut: "confirmes" })).toThrow(/référence/);
    expect(() => verifierDroits("x", { statut: "confirmes", reference: "  ", date: "2026-10-04" })).toThrow(/référence/);
    expect(() => verifierDroits("x", { statut: "confirmes", reference: "AUT-001", date: "" })).toThrow(/date/);
    expect(() => verifierDroits("x", { statut: "confirmes", reference: "AUT-001", date: "2026-10-04" })).not.toThrow();
    expect(() => verifierDroits("x", { statut: "non-confirmes" })).not.toThrow();
  });
});

describe("verifierPaire (uniquement la paire du comparateur)", () => {
  it("exige exactement les mêmes dimensions, donc le même cadrage", () => {
    expect(() => verifierPaire(img(2400, 2000), img(2400, 2000))).not.toThrow();
    expect(() => verifierPaire(img(2400, 2000), img(2400, 1999))).toThrow(/dimensions différentes/);
    expect(() => verifierPaire(img(2400, 2000), img(1200, 1000))).toThrow(/même cadrage/);
  });
  it("applique une définition minimale à la paire publiée sans l'imposer aux autres photographies", () => {
    expect(() => verifierPaire(img(1200, 1000), img(1200, 1000), { largeurMin: LARGEUR_MIN_PAIRE })).toThrow(/minimum/);
    expect(() => verifierPaire(img(1600, 1333), img(1600, 1333), { largeurMin: LARGEUR_MIN_PAIRE })).not.toThrow();
    expect(() => verifierPaire(img(960, 804), img(960, 804))).not.toThrow(); // stand-ins : pas de plancher
  });
});

describe("verifierReperes", () => {
  it("limite les repères (hero 2, potentiel 4, pages 3) et les garde dans l'image", () => {
    expect(() => verifierReperes("hero", repere(MAX_REPERES_HERO), MAX_REPERES_HERO)).not.toThrow();
    expect(() => verifierReperes("hero", repere(MAX_REPERES_HERO + 1), MAX_REPERES_HERO)).toThrow(/maximum/);
    expect(() => verifierReperes("page", repere(MAX_REPERES_PAGE + 1), MAX_REPERES_PAGE)).toThrow();
    expect(() => verifierReperes("pot", repere(MAX_REPERES_POTENTIEL + 1), MAX_REPERES_POTENTIEL)).toThrow();
    expect(() => verifierReperes("x", [{ x: 101, y: 5, libelle: "hors", statut: "hypothese" }], 3)).toThrow(/hors de l'image/);
  });
  it("le registre de production et les stand-ins respectent les limites", () => {
    for (const r of [registre, standins]) {
      verifierReperes("paire hero", r.paire.reperesHero, MAX_REPERES_HERO);
      verifierReperes("paire potentiel", r.paire.reperesPotentiel, MAX_REPERES_POTENTIEL);
      verifierReperes("immobilier", r.immobilier.reperes, MAX_REPERES_PAGE);
      verifierReperes("acquereurs", r.acquereurs.reperes, MAX_REPERES_PAGE);
    }
  });
});

describe("chantier : provenance toujours dite", () => {
  it("n'affirme jamais une continuité fabriquée", () => {
    expect(mentionChantier("meme-projet")).toBe("Chantier du projet présenté");
    expect(mentionChantier("autre-projet")).toBe("Illustration · chantier d'un autre projet");
    expect(mentionChantier(undefined)).toBe("Illustration · chantier d'un autre projet");
  });
  it("le chantier du registre déclare sa provenance", () => {
    expect(registre.chantier.provenance).toBeDefined();
    expect(standins.chantier.provenance).toBeDefined();
  });
});

describe("trouver", () => {
  it("retrouve un fichier par son nom de base, quelle que soit l'extension, sans confondre les préfixes", () => {
    const d = { "../assets/medias/hero-avant.webp": { default: img(10, 10) }, "../assets/medias/hero-avant-bis.webp": { default: img(20, 20) } };
    expect(trouver(d as never, "hero-avant")).toEqual(img(10, 10));
    expect(trouver(d as never, "hero")).toBeUndefined();
  });
});

describe("garde-fous des sources", () => {
  const sources = (d: string): string[] =>
    readdirSync(d).flatMap((n) => {
      const c = join(d, n);
      return statSync(c).isDirectory() ? (n === "assets" ? [] : sources(c)) : /\.(astro|ts)$/.test(n) ? [c] : [];
    });
  const racine = process.cwd();
  it("seul src/lib/medias.ts lit les dossiers de médias", () => {
    const fautes = sources("src")
      .filter((c) => !/src[\\/](lib[\\/](medias(\.test)?|standins-dev)|content[\\/]medias)\.ts$/.test(c))
      .filter((c) => /assets\/(medias|standins)/.test(readFileSync(c, "utf8")));
    expect(fautes).toEqual([]);
  });
  it("les stand-ins sont ignorés par Git et refusés par tout build", () => {
    expect(readFileSync(join(racine, ".gitignore"), "utf8")).toMatch(/src\/assets\/standins\//);
    const lib = readFileSync(join(racine, "src", "lib", "medias.ts"), "utf8");
    expect(lib).toMatch(/STANDINS_DEMANDES && !import\.meta\.env\.DEV/);
    expect(lib).toMatch(/throw new Error\("DVK_STANDINS=1 est réservé/);
  });
  it("les composants de média n'affichent aucun emplacement vide et ne câblent aucune image", () => {
    for (const c of ["BeforeAfter", "PhotoAnnotee", "MatiereChantier", "TransformationChaine"]) {
      const s = readFileSync(join(racine, "src", "components", `${c}.astro`), "utf8");
      expect(s, c).not.toMatch(/à venir|src="\/|src="\.\.?\//);
    }
  });
});
