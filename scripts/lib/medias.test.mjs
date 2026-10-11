// Le contrôle des médias doit REFUSER ce qu'il prétend refuser : chaque règle est testée par un cas fautif.
import { describe, it, expect } from "vitest";
import { analyserMedias, budgetHero, verifierCls } from "./medias.mjs";

const f = (chemin, contenu, octets) => ({ chemin, contenu, octets });

describe("analyserMedias", () => {
  it("accepte un build sans stand-in ni emplacement vide", () => {
    expect(analyserMedias({ fichiers: [f("index.html", "<h1>DVK Studio</h1>"), f("_astro/hero-avant.abc.avif", null, Buffer.from("avif-sans-exif"))] })).toEqual([]);
  });
  it("refuse un fichier ou un texte de stand-in", () => {
    expect(analyserMedias({ fichiers: [f("_astro/standin-paire-avant.abc.webp", null)] }).join()).toMatch(/stand-in/);
    expect(analyserMedias({ fichiers: [f("index.html", "<span>STAND-IN · HORS PRODUCTION</span>")] }).join()).toMatch(/stand-in/);
    expect(analyserMedias({ fichiers: [f("index.html", '<img src="/_astro/standin-chantier.x.jpg">')] }).length).toBeGreaterThan(0);
  });
  it("refuse l'emplacement « Photographie à venir »", () => {
    expect(analyserMedias({ fichiers: [f("travaux/index.html", "<div>Photographie à venir</div>")] }).join()).toMatch(/à venir/);
  });
  it("refuse tout montant dans la chaîne, accepte les statuts et l'ordre de grandeur sans somme", () => {
    const chaine = (t) => f("index.html", `<div data-transformation><ol class="lots"><li>${t}</li></ol></div>`);
    for (const t of ["12 000 €", "12000€", "€ 800", "3,5 k€", "1.200 €"]) expect(analyserMedias({ fichiers: [chaine(t)] }).join(), t).toMatch(/montant/);
    expect(analyserMedias({ fichiers: [chaine("Ordre de grandeur, à confirmer après visite · À chiffrer")] })).toEqual([]);
  });
  it("ne cherche pas de montant hors de la chaîne (la page peut parler d'euros ailleurs)", () => {
    expect(analyserMedias({ fichiers: [f("faq/index.html", "<p>Un devis de 1 000 €</p>")] })).toEqual([]);
  });
  it("refuse les métadonnées EXIF dans une image", () => {
    expect(analyserMedias({ fichiers: [f("_astro/a.b.jpg", null, Buffer.from("....Exif\0\0...."))] }).join()).toMatch(/EXIF/);
    expect(analyserMedias({ fichiers: [f("_astro/a.b.avif", null, Buffer.from("aucun marqueur"))] })).toEqual([]);
  });
});

describe("verifierCls", () => {
  it("exige width et height sur les images du hero", () => {
    expect(verifierCls('<img data-hero-image src="/a.jpg">').length).toBe(1);
    expect(verifierCls('<img data-hero-image width="960" height="804" src="/a.jpg">')).toEqual([]);
    expect(verifierCls('<img src="/autre.jpg">')).toEqual([]);
  });
});

describe("budgetHero", () => {
  const picture = (urls) => `<picture><source srcset="${urls.map(([u, w]) => `${u} ${w}w`).join(", ")}" type="image/avif"><img data-hero-image width="960" height="804" src="/x.jpg"></picture>`;
  const tailles = { "/a480.avif": 30_000, "/a800.avif": 90_000, "/a1600.avif": 400_000, "/b800.avif": 100_000 };
  const taille = (u) => tailles[u];
  it("choisit la variante la plus proche de 800 px, pas la plus lourde", () => {
    const html = picture([["/a480.avif", 480], ["/a800.avif", 800], ["/a1600.avif", 1600]]) + picture([["/b800.avif", 800]]);
    const r = budgetHero(html, taille);
    expect(r.total).toBe(190_000);
    expect(r.problemes).toEqual([]);
  });
  it("refuse un hero dont le chargement initial dépasse le budget", () => {
    const html = picture([["/a1600.avif", 1600]]) + picture([["/a1600.avif", 1600]]);
    expect(budgetHero(html, taille, { largeur: 1600 }).problemes.join()).toMatch(/budget/);
  });
  it("refuse un hero sans variantes adaptées ou un fichier introuvable", () => {
    expect(budgetHero('<picture><img data-hero-image src="/x.jpg"></picture>', taille).problemes.join()).toMatch(/srcset/);
    expect(budgetHero(picture([["/inconnu.avif", 800]]), taille).problemes.join()).toMatch(/introuvable/);
  });
  it("ne dit rien d'une page sans hero photographique (livraison dormante)", () => {
    expect(budgetHero("<picture><img src='/logo.png'></picture>", taille)).toEqual({ problemes: [], total: 0, images: 0 });
  });
});
