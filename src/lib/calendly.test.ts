import { describe, expect, it } from "vitest";
import { CALENDLY_BASE, construireLienRdv, fusionnerOrigine, lireAttribution } from "./calendly";

const HOTE = "dvkstudio.fr";

describe("lireAttribution", () => {
  it("lit les paramètres de campagne", () => {
    const a = lireAttribution("?utm_source=linkedin&utm_medium=social&utm_campaign=oct&utm_content=post-12", "", "/travaux/", HOTE);
    expect(a).toMatchObject({ utm_source: "linkedin", utm_medium: "social", utm_campaign: "oct", utm_content: "post-12", atterrissage: "/travaux/" });
  });
  it("sans campagne, retient l'hôte référent externe ; ignore le site lui-même", () => {
    expect(lireAttribution("", "https://www.google.com/search?q=x", "/", HOTE).referrerHote).toBe("google.com");
    expect(lireAttribution("", "https://dvkstudio.fr/immobilier/", "/", HOTE).referrerHote).toBeUndefined();
    expect(lireAttribution("", "pas une url", "/", HOTE).referrerHote).toBeUndefined();
  });
  it("neutralise les caractères dangereux et borne la longueur", () => {
    const a = lireAttribution("?utm_source=" + encodeURIComponent("<script>alert(1)</script>" + "x".repeat(300)), "", "/", HOTE);
    expect(a.utm_source).not.toMatch(/[<>()]/);
    expect(a.utm_source!.length).toBeLessThanOrEqual(100);
  });
});

describe("fusionnerOrigine", () => {
  it("conserve la première origine d'une session", () => {
    const premiere = lireAttribution("?utm_source=linkedin", "", "/", HOTE);
    const seconde = lireAttribution("", "https://dvkstudio.fr/", "/travaux/", HOTE);
    expect(fusionnerOrigine(premiere, seconde)).toBe(premiere);
    expect(fusionnerOrigine(null, seconde)).toBe(seconde);
  });
});

describe("construireLienRdv", () => {
  const ctx = { page: "home", bouton: "hero.rdv", parcours: "vendre" };
  it("renseigne source, médium, bouton (page.bouton) et parcours", () => {
    const u = new URL(construireLienRdv(CALENDLY_BASE, lireAttribution("?utm_source=linkedin&utm_medium=social&utm_campaign=oct&utm_content=post-12", "", "/", HOTE), ctx));
    expect(u.origin + u.pathname).toBe(CALENDLY_BASE);
    expect(u.searchParams.get("utm_source")).toBe("linkedin");
    expect(u.searchParams.get("utm_medium")).toBe("social");
    expect(u.searchParams.get("utm_campaign")).toBe("oct");
    expect(u.searchParams.get("utm_content")).toBe("home.hero.rdv");
    expect(u.searchParams.get("utm_term")).toBe("vendre");
    expect(u.searchParams.get("a1")).toBe("post-12"); // contenu de campagne d'origine conservé
  });
  it("sans origine : direct / none ; avec référent : referral", () => {
    const direct = new URL(construireLienRdv(CALENDLY_BASE, null, ctx));
    expect(direct.searchParams.get("utm_source")).toBe("direct");
    expect(direct.searchParams.get("utm_medium")).toBe("none");
    const ref = new URL(construireLienRdv(CALENDLY_BASE, lireAttribution("", "https://www.bing.com/", "/", HOTE), ctx));
    expect(ref.searchParams.get("utm_source")).toBe("bing.com");
    expect(ref.searchParams.get("utm_medium")).toBe("referral");
  });
  it("transmet l'atterrissage et le gclid en paramètres personnalisés", () => {
    const u = new URL(construireLienRdv(CALENDLY_BASE, lireAttribution("?gclid=abc123", "", "/immobilier/", HOTE), ctx));
    expect(u.searchParams.get("a2")).toBe("/immobilier/");
    expect(u.searchParams.get("a3")).toBe("abc123");
  });
  it("chaque bouton produit un utm_content distinct", () => {
    const a = new URL(construireLienRdv(CALENDLY_BASE, null, { page: "home", bouton: "hero.rdv" }));
    const b = new URL(construireLienRdv(CALENDLY_BASE, null, { page: "home", bouton: "final.rdv" }));
    expect(a.searchParams.get("utm_content")).not.toBe(b.searchParams.get("utm_content"));
  });
});
