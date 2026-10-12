import { describe, expect, it } from "vitest";
import {
  RDV_BASE,
  construireLienRdv,
  ecartOffre,
  fusionnerOrigine,
  lireAttribution,
  normaliserUtm,
  offreDepuisCampagne,
  offreDepuisChemin,
  type Attribution,
} from "./rdv";

const HOTE = "dvkstudio.fr";
// Format exigé par Growth/Core (core.project_origin).
const FORMAT_CORE = /^[a-z0-9][a-z0-9._-]{0,119}$/;

describe("normaliserUtm", () => {
  it("replie casse, accents et espaces de bord sans marque", () => {
    expect(normaliserUtm("Rénovation-Été_2026")).toBe("renovation-ete_2026");
    expect(normaliserUtm("  Meta.Ads  ")).toBe("meta.ads");
    expect(normaliserUtm("  ")).toBeUndefined();
    expect(normaliserUtm(null)).toBeUndefined();
    expect(normaliserUtm(undefined)).toBeUndefined();
  });
  it("une valeur modifiée au-delà de la casse et des accents reçoit une marque -h…", () => {
    expect(normaliserUtm("Rénovation Été 2026")).toMatch(/^renovation-ete-2026-h[a-z0-9]{7}$/);
    expect(normaliserUtm("Meta_Ads/Carrousel #3")).toMatch(/^meta_ads-carrousel-3-h[a-z0-9]{7}$/);
  });
  it("deux valeurs différentes ne deviennent jamais identiques", () => {
    const groupes = [
      ["a b", "a-b", "a/b", "a  b", "a+b", "a b ", "a_b"],
      ["ad 7", "ad-7", "ad/7", "ad#7", "ad7"],
      ["{campaignid}", "campaignid", "[campaignid]"],
      ["x".repeat(130), "x".repeat(130) + "y", "x".repeat(125) + "z".repeat(10)],
    ];
    for (const g of groupes) {
      const sorties = g.map((v) => normaliserUtm(v)!);
      // « a b » et « a b  » ne diffèrent que par un espace de bord : même valeur ; on retire ce doublon voulu.
      const attendu = new Set(g.map((v) => v.trim().toLowerCase())).size;
      expect(new Set(sorties).size).toBe(attendu);
    }
  });
  it("casse et accents seuls : même valeur (fusion voulue)", () => {
    expect(normaliserUtm("Rénovation")).toBe(normaliserUtm("renovation"));
    expect(normaliserUtm("META")).toBe(normaliserUtm("meta"));
  });
  it("valeur sans caractère exploitable : conservée sous « invalide-h… », jamais perdue", () => {
    expect(normaliserUtm("###")).toMatch(/^invalide-h[a-z0-9]{7}$/);
    expect(normaliserUtm("###")).not.toBe(normaliserUtm("@@@"));
  });
  it("troncature à 120 caractères avec marque, format Core respecté", () => {
    const v = normaliserUtm("a".repeat(300))!;
    expect(v.length).toBeLessThanOrEqual(120);
    expect(v).toMatch(/-h[a-z0-9]{7}$/);
    expect(v).toMatch(FORMAT_CORE);
  });
  it("est idempotente", () => {
    for (const brut of ["Rénovation Été 2026", "a/b", "###", "x".repeat(300), "meta", "ad-12"]) {
      const une = normaliserUtm(brut)!;
      expect(normaliserUtm(une)).toBe(une);
    }
  });
  it("toute sortie respecte le format Core", () => {
    for (const brut of ["<script>alert(1)</script>", "Été 2026 !", "{campaignid}", "AbC.dEf_12", "x".repeat(500), "-- --", "é"]) {
      const v = normaliserUtm(brut);
      if (v) expect(v).toMatch(FORMAT_CORE);
    }
  });
});

describe("offreDepuisCampagne", () => {
  it("lit la convention renovation- / achat-travaux-", () => {
    expect(offreDepuisCampagne("renovation-oct-2026")).toBe("renovation");
    expect(offreDepuisCampagne("Rénovation-Oct")).toBe("renovation");
    expect(offreDepuisCampagne("achat-travaux-meta-1")).toBe("achat_travaux");
  });
  it("aucune offre sans le préfixe exact", () => {
    expect(offreDepuisCampagne("renovation")).toBeUndefined();
    expect(offreDepuisCampagne("brand-renovation-oct")).toBeUndefined();
    expect(offreDepuisCampagne("iad-vendre")).toBeUndefined();
    expect(offreDepuisCampagne(null)).toBeUndefined();
  });
});

describe("lireAttribution", () => {
  it("lit et normalise les paramètres de campagne", () => {
    const a = lireAttribution("?utm_source=Meta&utm_medium=paid_social&utm_campaign=Renovation-Oct&utm_content=Ad-12&utm_term=Maçon-Oise", "", "/travaux/", HOTE);
    expect(a).toMatchObject({
      utm_source: "meta",
      utm_medium: "paid_social",
      utm_campaign: "renovation-oct",
      utm_content: "ad-12",
      utm_term: "macon-oise",
      atterrissage: "/travaux/",
      offre: "renovation",
    });
  });
  it("l'offre de la campagne prime sur la page d'arrivée ; sans convention, la page décide", () => {
    expect(lireAttribution("?utm_campaign=achat-travaux-meta-1", "", "/travaux/", HOTE).offre).toBe("achat_travaux");
    expect(lireAttribution("?utm_campaign=autre", "", "/acquereurs/", HOTE).offre).toBe("achat_travaux");
    expect(lireAttribution("?utm_campaign=autre", "", "/", HOTE).offre).toBeUndefined();
  });
  it("une valeur incompatible reste visible : jamais supprimée ni remplacée par le bouton", () => {
    const a = lireAttribution("?utm_source=meta&utm_content=" + encodeURIComponent("###"), "", "/travaux/", HOTE);
    expect(a.utm_content).toMatch(/^invalide-h/);
    const u = new URL(construireLienRdv(RDV_BASE, a, { page: "travaux", bouton: "hero.rdv" }));
    expect(u.searchParams.get("utm_content")).toBe(a.utm_content);
    expect(u.searchParams.get("utm_content")).not.toMatch(/^dvk./);
  });
  it("sans campagne, retient l'hôte référent externe ; ignore le site lui-même", () => {
    expect(lireAttribution("", "https://www.google.com/search?q=x", "/", HOTE).referrerHote).toBe("google.com");
    expect(lireAttribution("", "https://dvkstudio.fr/immobilier/", "/", HOTE).referrerHote).toBeUndefined();
    expect(lireAttribution("", "pas une url", "/", HOTE).referrerHote).toBeUndefined();
  });
  it("neutralise les caractères dangereux et borne la longueur", () => {
    const a = lireAttribution("?utm_source=" + encodeURIComponent("<script>alert(1)</script>" + "x".repeat(300)), "", "/", HOTE);
    expect(a.utm_source).not.toMatch(/[<>()]/);
    expect(a.utm_source!.length).toBeLessThanOrEqual(120);
    expect(a.utm_source).toMatch(FORMAT_CORE);
  });
  it("ne lit jamais le gclid", () => {
    const a = lireAttribution("?gclid=abc123&utm_source=google", "", "/travaux/", HOTE) as Record<string, unknown>;
    expect(a.gclid).toBeUndefined();
    expect(JSON.stringify(a)).not.toContain("abc123");
  });
});

describe("offreDepuisChemin", () => {
  it("associe les deux pages d'offre ; aucune autre valeur", () => {
    expect(offreDepuisChemin("/travaux/")).toBe("renovation");
    expect(offreDepuisChemin("/travaux")).toBe("renovation");
    expect(offreDepuisChemin("/acquereurs/")).toBe("achat_travaux");
    expect(offreDepuisChemin("/")).toBeUndefined();
    expect(offreDepuisChemin("/immobilier/")).toBeUndefined();
    expect(offreDepuisChemin("/iad/")).toBeUndefined();
  });
});

describe("fusionnerOrigine", () => {
  it("conserve la première origine d'une session", () => {
    const premiere = lireAttribution("?utm_source=linkedin", "", "/", HOTE);
    const seconde = lireAttribution("", "https://dvkstudio.fr/", "/travaux/", HOTE);
    expect(fusionnerOrigine(premiere, seconde)).toEqual(premiere);
    expect(fusionnerOrigine(null, seconde)).toBe(seconde);
  });
  it("purge un gclid stocké par une version précédente", () => {
    const ancienne = { utm_source: "google", gclid: "abc123", atterrissage: "/" } as unknown as Attribution;
    const fusion = fusionnerOrigine(ancienne, lireAttribution("", "", "/", HOTE)) as Record<string, unknown>;
    expect(fusion.gclid).toBeUndefined();
    expect(fusion.utm_source).toBe("google");
  });
});

describe("origine stockée par une ancienne session", () => {
  const rejouer = (stockee: unknown) =>
    fusionnerOrigine(stockee as Attribution, lireAttribution("", "", "/", HOTE)) as Record<string, unknown>;

  it("renormalise les valeurs enregistrées au format Core", () => {
    const r = rejouer({ utm_source: "Meta", utm_campaign: "Rénovation Oct", utm_content: "AD 7", atterrissage: "/travaux/" });
    expect(r.utm_source).toBe("meta");
    expect(r.utm_campaign).toMatch(/^renovation-oct-h[a-z0-9]{7}$/);
    expect(r.utm_content).toMatch(/^ad-7-h[a-z0-9]{7}$/);
    for (const k of ["utm_source", "utm_campaign", "utm_content"]) expect(r[k]).toMatch(FORMAT_CORE);
  });
  it("ne fait pas confiance aux offres stockées : elles sont recalculées", () => {
    const r = rejouer({ utm_source: "meta", utm_campaign: "renovation-oct", atterrissage: "/", offre: "iad", offreCampagne: "iad" });
    expect(r.offreCampagne).toBe("renovation");
    expect(r.offre).toBe("renovation");
    expect(r.offreAtterrissage).toBeUndefined();
  });
  it("ignore les valeurs qui ne sont pas du texte et les champs inconnus", () => {
    const r = rejouer({ utm_source: { x: 1 }, utm_content: 42, atterrissage: "/", gclid: "abc", a1: "x" });
    expect(r.utm_source).toBeUndefined();
    expect(r.utm_content).toBeUndefined();
    expect(r.gclid).toBeUndefined();
    expect(r.a1).toBeUndefined();
  });
});

describe("campagne, page d'arrivée et offre d'origine restent distinctes", () => {
  it("conserve les trois, même en désaccord", () => {
    const a = lireAttribution("?utm_source=meta&utm_campaign=achat-travaux-meta-1", "", "/travaux/", HOTE);
    expect(a.utm_campaign).toBe("achat-travaux-meta-1");
    expect(a.atterrissage).toBe("/travaux/");
    expect(a.offreCampagne).toBe("achat_travaux");
    expect(a.offreAtterrissage).toBe("renovation");
    expect(a.offre).toBe("achat_travaux");
    expect(ecartOffre(a)).toBe(true);
  });
  it("pas d'écart quand les deux concordent ou qu'une seule est connue", () => {
    expect(ecartOffre(lireAttribution("?utm_campaign=renovation-x", "", "/travaux/", HOTE))).toBe(false);
    expect(ecartOffre(lireAttribution("?utm_campaign=renovation-x", "", "/", HOTE))).toBe(false);
    expect(ecartOffre(lireAttribution("", "", "/acquereurs/", HOTE))).toBe(false);
  });
  it("l'écart survit à la fusion de session", () => {
    const premiere = lireAttribution("?utm_source=meta&utm_campaign=achat-travaux-meta-1", "", "/travaux/", HOTE);
    const apres = fusionnerOrigine(premiere, lireAttribution("", "https://dvkstudio.fr/", "/", HOTE));
    expect(ecartOffre(apres)).toBe(true);
  });
});

describe("construireLienRdv", () => {
  const ctx = { page: "home", bouton: "hero.rdv", parcours: "vendre" };
  const lien = (o: Attribution | null, c = ctx) => new URL(construireLienRdv(RDV_BASE, o, c));

  it("conserve les utm_* d'origine, dont utm_content : le bouton ne l'écrase pas", () => {
    const u = lien(lireAttribution("?utm_source=meta&utm_medium=paid_social&utm_campaign=renovation-oct&utm_content=ad-12&utm_term=maconnerie", "", "/travaux/", HOTE));
    expect(u.origin + u.pathname).toBe(RDV_BASE);
    expect(u.searchParams.get("utm_source")).toBe("meta");
    expect(u.searchParams.get("utm_medium")).toBe("paid_social");
    expect(u.searchParams.get("utm_campaign")).toBe("renovation-oct");
    expect(u.searchParams.get("utm_content")).toBe("ad-12");
    expect(u.searchParams.get("utm_term")).toBe("maconnerie");
  });
  it("utm_term n'est jamais rempli par le parcours", () => {
    expect(lien(null).searchParams.get("utm_term")).toBeNull();
    expect(lien(lireAttribution("?utm_source=linkedin", "", "/", HOTE)).searchParams.get("utm_term")).toBeNull();
  });
  it("sans utm_content d'origine : « dvk.page.bouton », avec l'offre quand elle est connue", () => {
    expect(lien(null).searchParams.get("utm_content")).toBe("dvk.home.hero.rdv");
    const u = lien(null, { page: "travaux", bouton: "hero.rdv", offre: "renovation" });
    expect(u.searchParams.get("utm_content")).toBe("dvk.renovation.travaux.hero.rdv");
    const v = lien(lireAttribution("?utm_source=linkedin", "", "/acquereurs/", HOTE), { page: "home", bouton: "nav.rdv" });
    expect(v.searchParams.get("utm_content")).toBe("dvk.achat_travaux.home.nav.rdv");
  });
  it("sans origine : direct / none ; avec référent : referral", () => {
    const direct = lien(null);
    expect(direct.searchParams.get("utm_source")).toBe("direct");
    expect(direct.searchParams.get("utm_medium")).toBe("none");
    const ref = lien(lireAttribution("", "https://www.bing.com/", "/", HOTE));
    expect(ref.searchParams.get("utm_source")).toBe("bing.com");
    expect(ref.searchParams.get("utm_medium")).toBe("referral");
  });
  it("n'envoie aucun paramètre personnalisé (a1..a10) ni gclid", () => {
    const o = { ...lireAttribution("?gclid=abc123&utm_source=google", "", "/immobilier/", HOTE), gclid: "abc123" } as Attribution;
    const u = lien(o);
    const cles = [...u.searchParams.keys()];
    expect(cles.filter((k) => /^a\d+$/.test(k))).toEqual([]);
    expect(cles).not.toContain("gclid");
    expect(u.toString()).not.toContain("abc123");
  });
  it("seuls des utm_* sont émis, tous au format Core", () => {
    const u = lien(lireAttribution("?utm_source=Meta&utm_campaign=Été Rénovation&utm_content=AD 7&utm_term=###", "", "/travaux/", HOTE));
    for (const [k, v] of u.searchParams) {
      expect(k).toMatch(/^utm_(source|medium|campaign|content|term)$/);
      expect(v).toMatch(FORMAT_CORE);
    }
  });
  it("sans utm_content d'origine, deux boutons produisent deux valeurs distinctes", () => {
    const a = lien(null, { page: "home", bouton: "hero.rdv" });
    const b = lien(null, { page: "home", bouton: "final.rdv" });
    expect(a.searchParams.get("utm_content")).not.toBe(b.searchParams.get("utm_content"));
  });
});
