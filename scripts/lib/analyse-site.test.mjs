// Les contrôles du site construit doivent REFUSER ce qu'ils prétendent refuser : chaque règle est testée par un cas fautif.
import { describe, it, expect } from "vitest";
import { verifierLiens, verifierSeo, verifierA11y, verifierPerf, resoudre, ORIGINE } from "./analyse-site.mjs";

const D = "Une description assez longue pour passer le contrôle de longueur minimale, avec un contenu précis et utile pour un moteur de recherche.";
function page(url, { titre = "Titre " + url, desc = D + url, canon = ORIGINE + url, corps = "", noindex = false, h1 = 1, entete = "" } = {}) {
  return {
    url, fichier: url === "/" ? "index.html" : url.slice(1) + "index.html", redirection: false,
    html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titre}</title><meta name="description" content="${desc}"><link rel="canonical" href="${canon}">${noindex ? '<meta name="robots" content="noindex,nofollow">' : ""}<meta property="og:title" content="t"><meta property="og:description" content="d"><meta property="og:url" content="${ORIGINE + url}">${entete}</head><body><a href="#contenu">Aller au contenu</a><header><nav aria-label="Principal"><a href="/">Accueil</a></nav></header><main id="contenu">${"<h1>T</h1>".repeat(h1)}${corps}</main><footer>pied</footer></body></html>`,
  };
}
const redirection = (url, cible, { noindex = false, canon = ORIGINE + cible } = {}) => ({
  url, fichier: url.slice(1), redirection: true,
  html: `<!doctype html><html lang="fr"><head>${noindex ? '<meta name="robots" content="noindex">' : ""}<link rel="canonical" href="${canon}"><meta http-equiv="refresh" content="0; url=${cible}"><script>location.replace(${JSON.stringify(cible)});</script></head><body></body></html>`,
});
const toutExiste = () => true;
const sitemapDe = (pages) => pages.filter((p) => !p.redirection).map((p) => ORIGINE + p.url);
const robotsOk = `User-agent: *\nAllow: /\nSitemap: ${ORIGINE}/sitemap-index.xml\n`;

describe("liens", () => {
  const a = page("/a/", { corps: '<a href="/b/">B</a>' });
  const b = page("/b/", { corps: '<h2 id="x">x</h2>' });
  it("accepte des liens et des ancres valides", () => {
    const p = [page("/a/", { corps: '<a href="/b/#x">B</a>' }), b];
    expect(verifierLiens(p, toutExiste).problemes).toEqual([]);
  });
  it("refuse un lien cassé", () => expect(verifierLiens([a], () => false).problemes.join()).toMatch(/lien cassé/));
  it("refuse une ancre introuvable", () => expect(verifierLiens([page("/a/", { corps: '<a href="/b/#absent">B</a>' }), b], toutExiste).problemes.join()).toMatch(/ancre introuvable/));
  it("refuse http://, target=_blank sans noopener, mailto et tel invalides", () => {
    const p = page("/a/", { corps: '<a href="http://x.fr">x</a><a href="https://x.fr" target="_blank">x</a><a href="mailto:oups">m</a><a href="tel:06 40">t</a>' });
    const r = verifierLiens([p], toutExiste).problemes.join("|");
    expect(r).toMatch(/non sécurisé/); expect(r).toMatch(/noopener/); expect(r).toMatch(/mailto invalide/); expect(r).toMatch(/tel invalide/);
  });
  it("refuse une ressource locale absente", () => {
    const p = page("/a/", { entete: '<link rel="stylesheet" href="/_astro/x.css">' });
    expect(verifierLiens([p], (c) => c !== "_astro/x.css").problemes.join()).toMatch(/ressource absente/);
  });
  it("résout les liens relatifs", () => expect(resoudre("../b/", "/a/c/")).toEqual({ cible: "/a/b/", hash: "" }));
});

describe("SEO", () => {
  const ok = [page("/"), page("/b/")];
  const verifier = (pages, opts = {}) => verifierSeo(pages, { sitemap: sitemapDe(pages), robots: robotsOk, ...opts });
  it("accepte un site cohérent", () => expect(verifier(ok)).toEqual([]));
  it("refuse un canonical faux", () => expect(verifier([page("/", { canon: ORIGINE + "/autre/" })]).join()).toMatch(/canonical/));
  it("refuse un titre ou une description dupliqués", () => {
    expect(verifier([page("/", { titre: "Même" }), page("/b/", { titre: "Même" })]).join()).toMatch(/titre identique/);
    expect(verifier([page("/", { desc: D }), page("/b/", { desc: D })]).join()).toMatch(/description identique/);
  });
  it("refuse une description trop courte et un h1 absent ou multiple", () => {
    expect(verifier([page("/", { desc: "Court" })]).join()).toMatch(/description de 5/);
    expect(verifier([page("/", { h1: 0 })]).join()).toMatch(/0 h1/);
    expect(verifier([page("/", { h1: 2 })]).join()).toMatch(/2 h1/);
  });
  it("refuse noindex dans le sitemap et indexable hors sitemap", () => {
    const n = page("/", { noindex: true });
    expect(verifierSeo([n], { sitemap: [ORIGINE + "/"], robots: robotsOk }).join()).toMatch(/noindex mais présente/);
    expect(verifierSeo([page("/")], { sitemap: [], robots: robotsOk }).join()).toMatch(/absente du sitemap/);
  });
  it("refuse une URL de sitemap sans barre finale ou inexistante", () => {
    expect(verifierSeo([page("/")], { sitemap: [ORIGINE + "/", ORIGINE + "/zzz"], robots: robotsOk }).join()).toMatch(/sans barre finale/);
    expect(verifierSeo([page("/")], { sitemap: [ORIGINE + "/", ORIGINE + "/zzz/"], robots: robotsOk }).join()).toMatch(/page inexistante/);
  });
  it("refuse un robots.txt qui bloque le site ou sans plan de site", () => {
    expect(verifierSeo([page("/")], { sitemap: [ORIGINE + "/"], robots: "User-agent: *\nDisallow: /\n" }).join()).toMatch(/Disallow/);
    expect(verifierSeo([page("/")], { sitemap: [ORIGINE + "/"], robots: "User-agent: *\n" }).join()).toMatch(/Sitemap/);
  });
  it("refuse un JSON-LD invalide", () => expect(verifier([page("/", { entete: '<script type="application/ld+json">{oups</script>' })]).join()).toMatch(/JSON-LD/));
  it("redirections : cible, canonical, chaîne, noindex, couverture de l'ancien site", () => {
    const base = [page("/"), page("/neuf/")];
    expect(verifier([...base, redirection("/vieux.html", "/neuf/")])).toEqual([]);
    expect(verifier([...base, redirection("/vieux.html", "/absent/")]).join()).toMatch(/introuvable/);
    expect(verifier([...base, redirection("/vieux.html", "/neuf/", { canon: ORIGINE + "/ailleurs/" })]).join()).toMatch(/canonical/);
    expect(verifier([...base, redirection("/vieux.html", "/neuf/", { noindex: true })]).join()).toMatch(/noindex/);
    expect(verifier([...base, redirection("/a.html", "/b.html"), redirection("/b.html", "/neuf/")]).join()).toMatch(/chaîne/);
    expect(verifierSeo(base, { sitemap: sitemapDe(base), robots: robotsOk, ancien: ["vieux.html"] }).join()).toMatch(/ancienne URL/);
  });
});

describe("accessibilité structurelle", () => {
  const verifier = (corps, entete) => verifierA11y([page("/", { corps, entete })]);
  it("accepte une page propre", () => expect(verifier('<h2>Titre</h2><img src="/a.png" alt="x"><a href="/b/">Voir le détail</a>')).toEqual([]));
  it("refuse image sans alt, lien vide ou non descriptif", () => {
    expect(verifier('<img src="/a.png">').join()).toMatch(/sans alt/);
    expect(verifier('<a href="/b/"></a>').join()).toMatch(/sans nom/);
    expect(verifier('<a href="/b/">ici</a>').join()).toMatch(/non descriptif/);
  });
  it("refuse un saut de titre, un id en double, une référence ARIA cassée, un tabindex positif", () => {
    expect(verifier("<h3>x</h3>").join()).toMatch(/saut de titre/);
    expect(verifier('<p id="d"></p><p id="d"></p>').join()).toMatch(/id en double/);
    expect(verifier('<p aria-labelledby="fantome"></p>').join()).toMatch(/introuvable/);
    expect(verifier('<p tabindex="3"></p>').join()).toMatch(/tabindex positif/);
  });
  it("refuse details sans summary, svg sans nom, deux nav sans nom, zoom bloqué", () => {
    expect(verifier("<details><p>x</p></details>").join()).toMatch(/details sans summary/);
    expect(verifier('<svg role="img"></svg>').join()).toMatch(/svg role=img/);
    expect(verifier("<nav><a href='/'>x</a></nav>").join()).toMatch(/nav/);
    expect(verifierA11y([{ ...page("/"), html: page("/").html.replace("initial-scale=1", "initial-scale=1, user-scalable=no") }]).join()).toMatch(/zoom bloqué/);
  });
  it("refuse l'absence de lien d'évitement ou de main", () => {
    const p = page("/");
    expect(verifierA11y([{ ...p, html: p.html.replace('<a href="#contenu">Aller au contenu</a>', "") }]).join()).toMatch(/évitement/);
    expect(verifierA11y([{ ...p, html: p.html.replace("<main", "<div").replace("</main>", "</div>") }]).join()).toMatch(/0 <main>/);
  });
});

describe("budget de performance", () => {
  const taille = (octets) => () => octets;
  const lire = () => "";
  it("accepte une page légère avec deux polices préchargées", () => {
    const p = page("/", { entete: '<link rel="stylesheet" href="/s.css"><link rel="preload" href="/f.woff2" as="font" type="font/woff2" crossorigin>' });
    expect(verifierPerf([p], taille(10_000), lire).problemes).toEqual([]);
  });
  it("refuse CSS trop lourd, trop de polices, préchargement sans crossorigin", () => {
    const lourd = page("/", { entete: '<link rel="stylesheet" href="/s.css">' });
    expect(verifierPerf([lourd], taille(70_000), lire).problemes.join()).toMatch(/CSS de/);
    const trois = page("/", { entete: '<link rel="preload" href="/a" as="font" crossorigin><link rel="preload" href="/b" as="font" crossorigin><link rel="preload" href="/c" as="font" crossorigin>' });
    expect(verifierPerf([trois], taille(1000), lire).problemes.join()).toMatch(/polices préchargées/);
    const sans = page("/", { entete: '<link rel="preload" href="/a" as="font">' });
    expect(verifierPerf([sans], taille(1000), lire).problemes.join()).toMatch(/crossorigin/);
  });
  it("refuse toute ressource tierce (script, police, image, CSS)", () => {
    const tiers = page("/", { entete: '<script src="https://cdn.exemple.com/x.js"></script><link rel="stylesheet" href="https://fonts.googleapis.com/css">' });
    expect(verifierPerf([tiers], taille(1), lire).problemes.join()).toMatch(/ressource tierce/);
    const css = page("/", { entete: '<link rel="stylesheet" href="/s.css">' });
    expect(verifierPerf([css], taille(1), () => "a{background:url(https://x.fr/i.png)}").problemes.join()).toMatch(/CSS charge/);
  });
  it("refuse une image sans dimensions", () => expect(verifierPerf([page("/", { corps: '<img src="/a.png" alt="x">' })], taille(1), lire).problemes.join()).toMatch(/sans dimensions/));
});
