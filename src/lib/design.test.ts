// La charte exécutable : le Design System DVK v1 est vérifié sur le code de la V2.
// Chaque test cite la règle du Design System (dvk-design-system/docs/09-regles.md).
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const racine = process.cwd();
function fichiers(dossier: string, ext: RegExp): string[] {
  return readdirSync(dossier).flatMap((n) => {
    const p = join(dossier, n);
    return statSync(p).isDirectory() ? fichiers(p, ext) : ext.test(n) ? [p] : [];
  });
}
const sources = fichiers(join(racine, "src"), /\.(astro|css)$/);
const lire = (p: string) => readFileSync(p, "utf8");
const sansCommentaires = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/<!--[\s\S]*?-->/g, "");

describe("Design System v1 appliqué à la V2", () => {
  it("TYP-05 : aucun texte sous 12 px", () => {
    const fautes = sources.flatMap((f) => [...sansCommentaires(lire(f)).matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)].filter((m) => Number(m[1]) < 12).map((m) => `${f} : ${m[0]}`));
    expect(fautes).toEqual([]);
  });

  it("TYP-01 : Montserrat pour le texte, Fraunces pour les titres (charte « Atelier · hemea »), toutes deux auto-hébergées", () => {
    const base = lire(join(racine, "src", "layouts", "Base.astro"));
    expect(base).toMatch(/@fontsource-variable\/montserrat/);
    expect(base).toMatch(/@fontsource\/fraunces/);
    expect(base).not.toMatch(/fonts\.googleapis|instrument-sans/i);
    const css = lire(join(racine, "src", "styles", "global.css"));
    expect(css).toMatch(/--dvk-font:\s*"Montserrat Variable"/);
    expect(css).toMatch(/--dvk-font-display:\s*"?Fraunces/);
    expect(css).not.toMatch(/Instrument Sans|@import url\(/);
    const autres = sources.flatMap((f) => [...sansCommentaires(lire(f)).matchAll(/font-family:\s*([^;}]+)/g)].filter((m) => !/^(var\(--(dvk-font|dvk-font-display|serif|sans)\)|inherit)$/.test(m[1].trim())).map((m) => `${f} : ${m[0].trim()}`));
    expect(autres).toEqual([]);
  });

  it("TYP-02 : peu de graisses (400 texte, 500 titres serif, 600 libellés et boutons)", () => {
    const fautes = sources.flatMap((f) => [...sansCommentaires(lire(f)).matchAll(/font-weight:\s*(\d+)/g)].filter((m) => ![400, 500, 600].includes(Number(m[1]))).map((m) => `${f} : ${m[0]}`));
    expect(fautes).toEqual([]);
  });

  it("SPC-02 : rayons limités aux jetons (4 px boutons et champs, 16 px cartes), cercle ou pilule", () => {
    const autorises = /^(var\(--dvk-radius-(sm|md|pill)\)|var\(--rayon\)|50%|0|var\(--dvk-radius-md\) var\(--dvk-radius-md\) 0 0)$/;
    const fautes = sources.flatMap((f) => [...sansCommentaires(lire(f)).matchAll(/border-radius:\s*([^;}]+)/g)].filter((m) => !autorises.test(m[1].trim())).map((m) => `${f} : ${m[0].trim()}`));
    expect(fautes).toEqual([]);
  });

  it("RSP-01 : deux seuils seulement (720 et 900 px)", () => {
    const autorises = new Set(["720px", "721px", "900px"]);
    const fautes = sources.flatMap((f) => [...sansCommentaires(lire(f)).matchAll(/@media\s*\((min|max)-width:\s*([\d.]+px)\)/g)].filter((m) => !autorises.has(m[2])).map((m) => `${f} : ${m[0]}`));
    expect(fautes).toEqual([]);
  });

  it("STA-05 : statuts de donnée et de disponibilité séparés (plus de classe .statut-*)", () => {
    const fautes = sources.filter((f) => /\.statut-|class="statut\b|statut-(dispo|demo|avenir)/.test(lire(f)));
    expect(fautes).toEqual([]);
    expect(lire(join(racine, "src", "components", "experience", "Statut.astro"))).toMatch(/data-status/);
  });

  it("INT-09 : chaque chapitre de DVK Expérience déclare son intensité", () => {
    const page = lire(join(racine, "src", "pages", "experience", "[slug].astro"));
    const sections = [...page.matchAll(/<section\s+id="(?!t-)[^"]+"[^>]*>/g)].map((m) => m[0]);
    expect(sections.length).toBeGreaterThanOrEqual(8);
    for (const s of sections) expect(s, s).toMatch(/data-intensite="(editorial|equilibre|augmente)"/);
  });

  it("PHO-04 : une photographie n'est affichée que si ses droits sont confirmés", () => {
    for (const f of sources) {
      for (const m of lire(f).matchAll(/<Photo\b[^>]*>/g)) {
        if (/\bsrc=/.test(m[0])) expect(m[0], `${f} : ${m[0]}`).toMatch(/droits="confirmes"/);
      }
    }
    const composant = lire(join(racine, "src", "components", "Photo.astro"));
    expect(composant).toMatch(/droits === "confirmes"/);
  });

  it("PHO-02 : une projection porte le badge Projection et la mention « non contractuelle »", () => {
    const c = lire(join(racine, "src", "components", "ProjectionFrame.astro"));
    expect(c).toMatch(/statut="projection"/);
    expect(c).toMatch(/non contractuelle/);
  });

  it("TRA-01 / PLN-02 : tout plan est légendé « Plan illustratif, non à l'échelle »", () => {
    const c = lire(join(racine, "src", "components", "Plan.astro"));
    expect(c).toMatch(/Plan illustratif, non à l'échelle/);
    const usages = sources.filter((f) => /<Plan\b/.test(lire(f)));
    expect(usages.length).toBeGreaterThan(0);
    for (const f of usages) expect(lire(f), f).toMatch(/Plan illustratif, non à l'échelle/);
  });

  it("DAT-03 : un budget non chiffré s'affiche « À chiffrer »", () => {
    const page = lire(join(racine, "src", "pages", "experience", "[slug].astro"));
    expect(page).toMatch(/s\.budget\.statut === "manquant" \? "À chiffrer"/);
  });

  it("EDI-02 : pas de « nous » flottant dans les pages de contenu", () => {
    const pages = fichiers(join(racine, "src", "pages"), /\.astro$/).filter((f) => !/mentions-legales|confidentialite|cgv/.test(f));
    const fautes = pages.filter((f) => /\b(nous|Nous|-nous)\b/.test(sansCommentaires(lire(f)).replace(/<style[\s\S]*?<\/style>/g, "")));
    expect(fautes).toEqual([]);
  });

  it("COL-01 : les jetons de la V2 reprennent ceux du Design System (si le dépôt est présent)", () => {
    const chemin = join(racine, "..", "dvk-design-system", "tokens", "dvk-tokens.json");
    if (!existsSync(chemin)) return;
    const ds = JSON.parse(readFileSync(chemin, "utf8")).color as Record<string, { value: string; bg?: string }>;
    const css = lire(join(racine, "src", "styles", "global.css"));
    const lus = (nom: string) => new RegExp(`--dvk-${nom}:\\s*([^;]+);`).exec(css)?.[1].trim().toLowerCase();
    const roles = ["background", "surface", "text", "text-muted", "text-subtle", "primary", "action", "accent", "border", "night", "real", "estimate", "hypothesis", "projection", "coming", "missing", "warning"];
    for (const r of roles) expect(lus(r), `--dvk-${r}`).toBe(ds[r].value.toLowerCase());
    for (const r of ["real", "estimate", "projection", "warning"]) expect(lus(`${r}-bg`), `--dvk-${r}-bg`).toBe(ds[r].bg!.toLowerCase());
  });
});

describe("Polish V2 : cohérence transversale", () => {
  const css = lire(join(racine, "src", "styles", "global.css"));
  const pages = fichiers(join(racine, "src", "pages"), /\.astro$/);

  it("STA-05 : la disponibilité d'un service n'a ni fond ni pastille (≠ statut de donnée)", () => {
    const bloc = /\.dvk-availability \{[^}]*\}/.exec(css)![0];
    expect(bloc).not.toMatch(/background|border-radius/);
    expect(bloc).toMatch(/border-left/);
  });

  it("STA-05 : une disponibilité n'est jamais posée au milieu d'une phrase", () => {
    const fautes = fichiers(join(racine, "src"), /\.astro$/).filter((f) => /<(p|li)[^>]*>[^<\n]{3,}<span class="dvk-availability/.test(lire(f)));
    expect(fautes).toEqual([]);
  });

  it("CMP-01 : un seul composant de processus pour l'accueil, travaux et professionnels", () => {
    for (const p of ["index.astro", "travaux.astro", "professionnels.astro"]) {
      const s = lire(join(racine, "src", "pages", p));
      expect(s, p).toMatch(/<Processus\b/);
      expect(s, p).not.toMatch(/<ol class="(liste-simple|methode|etapes-pros)/);
    }
  });

  it("STA-04 : la provenance est repliée par section, pas répétée par donnée", () => {
    const page = lire(join(racine, "src", "pages", "experience", "[slug].astro"));
    expect((page.match(/<SourcesSection\b/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(lire(join(racine, "src", "components", "experience", "Donnee.astro"))).not.toMatch(/D'où vient cette donnée/);
  });

  it("PHO-02 / STA-03 : l'état « à venir » d'une projection reste visible", () => {
    expect(lire(join(racine, "src", "components", "ProjectionFrame.astro"))).toMatch(/statut="a_venir"/);
  });

  it("EDI-02 : pas de voix mêlée (« je » et « DVK Studio » sujet) dans une même séquence", () => {
    const fautes: string[] = [];
    for (const f of pages.filter((p) => !/mentions-legales|confidentialite|cgv/.test(p))) {
      // Les entrées « Je vends / J'achète… » parlent avec la voix du visiteur : hors périmètre.
      const brut = sansCommentaires(lire(f)).replace(/<nav[^>]*(?:entrees|parcours)[\s\S]*?<\/nav>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/^---[\s\S]*?\n---/, "");
      for (const s of brut.split(/<(?:section|header)\b/).slice(1)) {
        const texte = s.replace(/<[^>]+>/g, " ");
        const je = /(?:^|[\s>(])(?:je|j'|m'|moi|Je|J')(?=[\s'a-zéèêà])/.test(texte);
        const marque = /DVK Studio (?:vous|identifie|mobilise|cadre|estime|regarde|accompagne|aide|oriente)/.test(texte);
        if (je && marque) fautes.push(`${f} : ${texte.replace(/\s+/g, " ").trim().slice(0, 60)}`);
      }
    }
    expect(fautes).toEqual([]);
  });

  it("Layout : le pied de page reste en bas (pages courtes, 404)", () => {
    expect(css).toMatch(/body \{[^}]*display: flex;[^}]*flex-direction: column/);
    expect(css).toMatch(/main \{ flex: 1 0 auto; \}/);
  });
});
