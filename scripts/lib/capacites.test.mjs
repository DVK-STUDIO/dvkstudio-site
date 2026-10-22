// Le contrôle de la capacité Immobilier doit REFUSER ce qu'il prétend refuser : chaque règle est testée par un cas fautif.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { analyserImmobilier, lireModeImmobilier, lireValide } from "./capacites.mjs";

const f = (chemin, contenu) => ({ chemin, contenu });
const accueil = f("index.html", "<h1>DVK Studio</h1><p>Chef de projet travaux hemea</p>");
const pageOk = (extra = "") => f("immobilier/index.html", `<title>Immobilier et travaux dans l'Oise | DVK Studio</title><meta name="description" content="Comprendre le potentiel d'un bien"><h1>Un projet immobilier</h1><p>Je rejoins le réseau iad France.</p>${extra}`);
const analyser = (mode, fichiers, valide = false) => analyserImmobilier({ mode, fichiers, valide });

describe("mode off", () => {
  it("accepte un build sans page Immobilier ni réseau", () => expect(analyser("off", [accueil, f("acquereurs/index.html", "<p>Acheter un bien à rénover</p>")])).toEqual([]));
  it("refuse la page /immobilier/", () => expect(analyser("off", [accueil, f("immobilier/index.html", "<p>x</p>")]).join()).toMatch(/page Immobilier présente/));
  it("refuse « iad » (toute casse), « mandataire immobilier », « mandat de vente »", () => {
    for (const t of ["réseau iad France", "IAD", "Iad", "Mandataires immobiliers", "un mandat de vente exclusif"]) {
      expect(analyser("off", [f("index.html", t)]).length, t).toBeGreaterThan(0);
    }
  });
  it("refuse un lien /immobilier/ et l'entrée « Je vends »", () => {
    expect(analyser("off", [f("index.html", '<a href="/immobilier/#vendre">x</a>')]).length).toBeGreaterThan(0);
    expect(analyser("off", [f("index.html", "<span>Je vends</span>")]).length).toBeGreaterThan(0);
  });
  it("autorise la qualité contractuelle de mandataire indépendant hemea", () => {
    const t = "Kévin DE VLIEGER est mandataire indépendant de la société NOVARE CONSTRUCTION, exploitant sous l'enseigne hemea.";
    expect(analyser("off", [f("mentions-legales/index.html", t)])).toEqual([]);
  });
  it("ne confond pas avec des mots voisins", () => expect(analyser("off", [f("index.html", "radiateur, médiation, ouvriad")])).toEqual([]));
});

describe("mode orientation", () => {
  it("accepte la page avec « je rejoins le réseau iad France »", () => expect(analyser("orientation", [accueil, pageOk()])).toEqual([]));
  it("exige la page Immobilier", () => expect(analyser("orientation", [accueil]).join()).toMatch(/page Immobilier absente/));
  it("refuse chaque qualité ou acte réservé", () => {
    const fautes = [
      "mandataire immobilier du réseau", "conseiller immobilier iad", "agent commercial immobilier", "j'interviens en tant que",
      "un mandat de vente", "signer un mandat", "un avis de valeur", "les honoraires", "le barème", "RSAC", "carte professionnelle",
      "garantie financière", "responsabilité civile professionnelle", "habilité à prendre un mandat", "dans le cadre iad France",
      "rémunération", "une commission", "apporteur d'affaires", "RealEstateAgent", "<form action=\"/x\">",
    ];
    for (const t of fautes) expect(analyser("orientation", [accueil, pageOk(`<p>${t}</p>`)]).length, t).toBeGreaterThan(0);
  });
  it("autorise « professionnel immobilier habilité » (sans acte réservé)", () => {
    expect(analyser("orientation", [accueil, pageOk("<p>un professionnel immobilier habilité</p>")])).toEqual([]);
  });
  it("refuse un titre ou une description transactionnels", () => {
    const p = f("immobilier/index.html", `<title>Vendre ou acheter dans l'Oise | DVK Studio</title><meta name="description" content="x">`);
    expect(analyser("orientation", [accueil, p]).join()).toMatch(/transactionnels/);
  });
  it("accepte la FAQ de la promesse (question seule) mais refuse la promesse ailleurs", () => {
    expect(analyser("orientation", [accueil, pageOk("<summary>Mon bien se vendra-t-il plus vite ou plus cher ?</summary><p>Je ne peux pas le promettre.</p>")])).toEqual([]);
    expect(analyser("orientation", [accueil, pageOk("<p>Votre bien sera vendu plus vite.</p>")]).length).toBeGreaterThan(0);
    expect(analyser("orientation", [accueil, pageOk("<p>au meilleur prix</p>")]).length).toBeGreaterThan(0);
  });
});

describe("règles communes (tous les modes)", () => {
  it("refuse la graphie « IAD »", () => expect(analyser("orientation", [accueil, pageOk("<p>réseau IAD France</p>")]).join()).toMatch(/IAD/));
  it("refuse les marqueurs [À VÉRIFIER], [À compléter] et « à compléter »", () => {
    for (const t of ["[À VÉRIFIER hemea]", "[à vérifier]", "[À compléter]", "[à compléter]", "valeur à compléter"]) {
      expect(analyser("orientation", [accueil, pageOk(`<p>${t}</p>`)]).length, t).toBeGreaterThan(0);
    }
  });
  it("laisse passer « à vérifier » dans la légende des statuts (sans crochets)", () => {
    expect(analyser("orientation", [accueil, pageOk("<p>Lecture de DVK Studio, à vérifier.</p>")])).toEqual([]);
  });
  it("refuse une description de garantie hemea", () => {
    for (const t of ["la protection hemea couvre", "garanties hemea", "garanti par hemea", "hemea garantit"]) {
      expect(analyser("orientation", [accueil, pageOk(`<p>${t}</p>`)]).length, t).toBeGreaterThan(0);
    }
  });
  it("accepte « ne garantit personnellement ni ces entreprises ni leurs travaux »", () => {
    expect(analyser("orientation", [accueil, pageOk("<p>DVK Studio ne garantit personnellement ni ces entreprises ni leurs travaux.</p>")])).toEqual([]);
  });
  it("accepte le conseil en investissement en négation, le refuse sinon", () => {
    expect(analyser("orientation", [accueil, pageOk("<p>Je n'interviens ni comme conseiller financier, ni comme conseiller en investissement immobilier.</p>")])).toEqual([]);
    expect(analyser("orientation", [accueil, pageOk("<p>Je suis conseiller en investissement immobilier.</p>")]).join()).toMatch(/conseil en investissement/);
  });
});

describe("mode mandataire", () => {
  const mentions = f("mentions-legales/index.html", "<h2>Activité immobilière</h2><li>Immatriculation au RSAC : 123</li>");
  const pageM = f("immobilier/index.html", "<title>Vendre ou acheter dans l'Oise, travaux compris | DVK Studio</title><p>Immatriculation au RSAC : 123</p><p>mandataire immobilier iad France</p>");
  it("refuse l'activation tant que valide vaut false", () => expect(analyser("mandataire", [accueil, pageM, mentions], false).join()).toMatch(/valide/));
  it("accepte une activation complète et validée", () => expect(analyser("mandataire", [accueil, pageM, mentions], true)).toEqual([]));
  it("exige les informations réglementaires dans la page et les mentions légales", () => {
    expect(analyser("mandataire", [accueil, f("immobilier/index.html", "<title>x</title>"), mentions], true).join()).toMatch(/immobilier\/index\.html : informations réglementaires absentes/);
    expect(analyser("mandataire", [accueil, pageM], true).join()).toMatch(/mentions-legales/);
  });
  it("refuse tout emplacement à compléter", () => expect(analyser("mandataire", [accueil, pageM, f("mentions-legales/index.html", "Immatriculation au RSAC : [à compléter]")], true).length).toBeGreaterThan(0));
});

describe("lecture de la configuration", () => {
  it("lit les trois modes et ignore les commentaires", () => {
    for (const m of ["off", "orientation", "mandataire"]) expect(lireModeImmobilier(`// mode: "off"\nexport const immobilier = { mode: "${m}" as ModeImmobilier };`)).toBe(m);
  });
  it("échoue si le mode est introuvable ou invalide (jamais de valeur supposée)", () => {
    expect(() => lireModeImmobilier("export const x = 1;")).toThrow(/introuvable/);
    expect(() => lireModeImmobilier('export const immobilier = { mode: "autre" };')).toThrow(/introuvable/);
  });
  it("lit `valide`", () => {
    expect(lireValide("export const r = { valide: false };")).toBe(false);
    expect(lireValide("// valide: false\nexport const r = { valide: true };")).toBe(true);
    expect(() => lireValide("x")).toThrow(/introuvable/);
  });
  it("les fichiers réels sont lisibles", () => {
    expect(["off", "orientation", "mandataire"]).toContain(lireModeImmobilier(readFileSync("src/content/capacites.ts", "utf8")));
    expect(typeof lireValide(readFileSync("src/content/iad.ts", "utf8"))).toBe("boolean");
  });
});
