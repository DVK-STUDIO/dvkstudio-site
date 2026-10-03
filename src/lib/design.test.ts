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

  it("TYP-04 : Fraunces est chargée avec l'axe optique", () => {
    const base = lire(join(racine, "src", "layouts", "Base.astro"));
    expect(base).toMatch(/@fontsource-variable\/fraunces\/opsz\.css/);
  });

  it("SPC-02 : rayons limités à 3 px, 6 px, cercle, pilule ou jeton", () => {
    const autorises = /^(var\(--dvk-radius-(sm|md|pill)\)|var\(--rayon\)|3px|6px|50%|0|2px|var\(--dvk-radius-md\) var\(--dvk-radius-md\) 0 0)$/;
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
