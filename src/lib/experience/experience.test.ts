import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { validerExperience } from "../../../contracts/valider-experience.mjs";
import { toutesLesExperiences, afficherValeur, LIBELLE_STATUT, SENS_STATUT, afficherMois, afficherDate, libelleSources } from "./experience";

const experiences = toutesLesExperiences();
const dossier = join(process.cwd(), "src", "data", "experiences");

describe("instantanés ExperiencePubliée", () => {
  it("au moins une expérience publiée, toutes valides au contrat", () => {
    expect(experiences.length).toBeGreaterThan(0);
    for (const e of experiences) expect(validerExperience(e).erreurs).toEqual([]);
  });

  it("chaque statut a un libellé et une explication", () => {
    for (const s of Object.keys(LIBELLE_STATUT)) {
      expect(LIBELLE_STATUT[s as keyof typeof LIBELLE_STATUT].length).toBeGreaterThan(0);
      expect(SENS_STATUT[s as keyof typeof SENS_STATUT].length).toBeGreaterThan(0);
    }
  });

  it("la projection reste « à venir » (aucun générateur d'image appelé)", () => {
    for (const e of experiences) {
      expect(e.projection.statut).toBe("a_venir");
      for (const s of e.scenarios) expect(["a_venir", "manquant"]).toContain(s.projection.statut);
    }
  });

  it("aucun fichier, lien de document ni image dans les données publiées", () => {
    for (const f of readdirSync(dossier)) {
      const t = readFileSync(join(dossier, f), "utf8");
      expect(t).not.toMatch(/drive\.google|docs\.google|\.pdf|\.pptx|\.zip|\.jpe?g|\.png|https?:\/\//i);
      expect(t).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]+/);
      expect(t).not.toMatch(/(?:\+33|0)\s?[1-9](?:[\s.]?\d{2}){4}/);
    }
  });

  it("motifs privés (FORBIDDEN_FILE) absents des données", () => {
    const f = process.env.FORBIDDEN_FILE;
    if (!f || !existsSync(f)) return; // les motifs vivent dans le dépôt privé ; sans eux, le contrôle générique ci-dessus s'applique
    const motifs = readFileSync(f, "utf8").split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#")).map((l) => new RegExp(l, "i"));
    for (const fichier of readdirSync(dossier)) {
      const t = readFileSync(join(dossier, fichier), "utf8");
      for (const m of motifs) expect(t, `motif ${m}`).not.toMatch(m);
    }
  });

  it("les conflits de sources restent visibles dans les données", () => {
    const e = experiences[0];
    const avecConflit = [...e.bien.faits, ...e.potentiel.faits].filter((f) => (f.valeur.conflits ?? []).length > 0);
    expect(avecConflit.length).toBeGreaterThan(0);
  });
});

describe("contrat : ce qui est refusé", () => {
  const base = () => structuredClone(experiences[0]);
  it("valeur manquante avec un chiffre inventé", () => {
    const e = base();
    const f = e.potentiel.faits.find((x) => x.valeur.statut === "manquant")!;
    f.valeur = { statut: "manquant", valeur: 18 } as never;
    expect(validerExperience(e).ok).toBe(false);
  });
  it("estimation sans source", () => {
    const e = base();
    e.energie.economieAnnuelle = { valeur: 100, unite: "€/an", statut: "estimation", sources: [] };
    expect(validerExperience(e).ok).toBe(false);
  });
  it("champ inconnu (aucune donnée non prévue ne passe)", () => {
    const e = base() as Record<string, unknown>;
    e.adresse = "x";
    expect(validerExperience(e).ok).toBe(false);
  });
  it("matrice incomplète", () => {
    const e = base();
    e.matrice.cellules.pop();
    expect(validerExperience(e).ok).toBe(false);
  });
});

describe("affichage", () => {
  it("nombre français et unité", () => {
    expect(afficherValeur({ valeur: 12500, unite: "€", statut: "estimation" })).toBe("12 500 €");
  });
  it("manquant et à venir ne montrent aucun chiffre", () => {
    expect(afficherValeur({ statut: "manquant" })).toBe("À établir");
    expect(afficherValeur({ statut: "a_venir" })).toBe("À venir");
  });
  it("dates et sources", () => {
    expect(afficherMois("2026-06")).toBe("juin 2026");
    expect(afficherDate("2026-10-03")).toBe("3 octobre 2026");
    expect(libelleSources(["x"], [{ id: "x", libelle: "Source X", type: "releve" }])).toEqual(["Source X"]);
  });
});
