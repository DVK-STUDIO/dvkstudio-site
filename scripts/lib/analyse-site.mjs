// Contrôles statiques du site CONSTRUIT (dist/) : liens, SEO, accessibilité structurelle, budget de performance.
// Fonctions pures sur des pages { chemin, html } : testables avec des fixtures, utilisées par scripts/check-site.mjs.
// Aucune dépendance : l'analyse HTML est volontairement simple (le HTML du site est généré, régulier).
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, posix } from "node:path";

export const ORIGINE = "https://dvkstudio.fr";

// ---------- Lecture de dist/ ----------
export function listerFichiers(dossier, base = dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    return statSync(chemin).isDirectory() ? listerFichiers(chemin, base) : [chemin.slice(base.length + 1).replace(/\\/g, "/")];
  });
}

/** Pages HTML : { url: "/immobilier/", fichier: "immobilier/index.html", html, redirection } */
export function lirePages(dist) {
  return listerFichiers(dist)
    .filter((f) => f.endsWith(".html"))
    .map((fichier) => {
      const html = readFileSync(join(dist, fichier), "utf8");
      const url = fichier === "index.html" ? "/" : fichier.endsWith("/index.html") ? "/" + fichier.slice(0, -"index.html".length) : "/" + fichier;
      return { url, fichier, html, redirection: /http-equiv="refresh"/i.test(html) };
    });
}

// ---------- Mini-analyse HTML ----------
export function attributs(brut) {
  const attrs = {};
  for (const m of brut.matchAll(/([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return attrs;
}
export function balises(html, nom) {
  return [...html.matchAll(new RegExp(`<${nom}\\b([^>]*)>`, "gi"))].map((m) => ({ ...attributs(m[1]), _brut: m[0], _index: m.index }));
}
const retirerBruit = (html) => html.replace(/<script\b[\s\S]*?<\/script>/gi, (s) => (/type="application\/ld\+json"/i.test(s) ? s : "")).replace(/<style\b[\s\S]*?<\/style>/gi, "");
export const texte = (html) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
export function elementsAvecTexte(html, nom) {
  return [...html.matchAll(new RegExp(`<${nom}\\b([^>]*)>([\\s\\S]*?)</${nom}>`, "gi"))].map((m) => ({ ...attributs(m[1]), _interieur: m[2], _texte: texte(m[2]) }));
}
export const ids = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
export const titre = (html) => /<title>([\s\S]*?)<\/title>/i.exec(html)?.[1]?.trim() ?? "";
export const meta = (html, cle, valeur = "name") => balises(html, "meta").find((b) => b[valeur] === cle)?.content;
export const canonique = (html) => balises(html, "link").find((b) => b.rel === "canonical")?.href;
export const estNoindex = (html) => /noindex/i.test(meta(html, "robots") ?? "");

/** Résout un lien interne vers { url de page, hash } ou null si externe. */
export function resoudre(href, urlPage) {
  if (!href || /^(https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(href)) return null;
  const [sansHash, hash = ""] = href.split("#");
  const [chemin] = sansHash.split("?");
  const cible = chemin === "" ? urlPage : chemin.startsWith("/") ? chemin : posix.join(urlPage.endsWith("/") ? urlPage : posix.dirname(urlPage) + "/", chemin);
  return { cible: posix.normalize(cible), hash };
}
function pageDe(cible, pages) {
  return pages.find((p) => p.url === cible) ?? pages.find((p) => p.url === cible + "/") ?? pages.find((p) => p.fichier === cible.replace(/^\//, ""));
}

// ---------- Liens ----------
export function verifierLiens(pages, existeFichier) {
  const problemes = [];
  const externes = new Set();
  for (const p of pages) {
    const html = retirerBruit(p.html);
    for (const a of balises(html, "a")) {
      const href = a.href;
      if (href === undefined) { problemes.push(`${p.url} : lien sans href`); continue; }
      if (/^https?:\/\//i.test(href)) {
        externes.add(href);
        if (/^http:\/\//i.test(href)) problemes.push(`${p.url} : lien non sécurisé ${href}`);
        if (a.target === "_blank" && !/noopener/.test(a.rel ?? "")) problemes.push(`${p.url} : target=_blank sans rel=noopener (${href})`);
        continue;
      }
      if (/^mailto:/i.test(href)) { if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@?]+(\?.*)?$/i.test(href)) problemes.push(`${p.url} : mailto invalide ${href}`); continue; }
      if (/^tel:/i.test(href)) { if (!/^tel:\+\d{8,15}$/.test(href)) problemes.push(`${p.url} : tel invalide ${href}`); continue; }
      const r = resoudre(href, p.url);
      if (!r) continue;
      const cible = r.cible === "" ? p.url : r.cible;
      const page = pageDe(cible, pages);
      if (!page && !existeFichier(cible.replace(/^\//, ""))) { problemes.push(`${p.url} : lien cassé ${href}`); continue; }
      if (r.hash && page && !ids(page.html).includes(r.hash)) problemes.push(`${p.url} : ancre introuvable ${href}`);
    }
    for (const [nom, attr] of [["img", "src"], ["script", "src"], ["link", "href"], ["source", "src"]]) {
      for (const b of balises(html, nom)) {
        const v = b[attr];
        if (!v || /^(data:|#)/.test(v)) continue;
        if (/^(https?:)?\/\//i.test(v)) continue; // ressource externe : traitée par le budget de performance
        if (nom === "link" && b.rel === "canonical") continue;
        const chemin = v.split("?")[0].replace(/^\//, "");
        if (!existeFichier(chemin)) problemes.push(`${p.url} : ressource absente ${v}`);
      }
    }
  }
  return { problemes, externes: [...externes].sort() };
}

// ---------- SEO ----------
export function verifierSeo(pages, { sitemap = [], robots = "", ancien = [] } = {}) {
  const problemes = [];
  const titres = new Map();
  const descriptions = new Map();
  const reelles = pages.filter((p) => !p.redirection);
  for (const p of reelles) {
    const t = titre(p.html);
    const d = meta(p.html, "description") ?? "";
    const noindex = estNoindex(p.html);
    const est404 = p.fichier === "404.html";
    if (!t) problemes.push(`${p.url} : <title> absent`);
    else if (t.length > 78) problemes.push(`${p.url} : titre trop long (${t.length})`);
    if (titres.has(t)) problemes.push(`${p.url} : titre identique à ${titres.get(t)}`);
    titres.set(t, p.url);
    if (!d) problemes.push(`${p.url} : meta description absente`);
    else {
      if (!noindex && (d.length < 70 || d.length > 175)) problemes.push(`${p.url} : description de ${d.length} caractères (70 à 175 attendus)`);
      if (descriptions.has(d) && !noindex) problemes.push(`${p.url} : description identique à ${descriptions.get(d)}`);
      descriptions.set(d, p.url);
    }
    const c = canonique(p.html);
    const attendu = est404 ? `${ORIGINE}/404/` : `${ORIGINE}${p.url}`;
    if (!c) problemes.push(`${p.url} : canonical absent`);
    else if (c !== attendu) problemes.push(`${p.url} : canonical ${c} ≠ ${attendu}`);
    if (!/<html[^>]*\slang="fr"/i.test(p.html)) problemes.push(`${p.url} : lang="fr" absent`);
    const nbH1 = (retirerBruit(p.html).match(/<h1\b/gi) ?? []).length;
    if (nbH1 !== 1) problemes.push(`${p.url} : ${nbH1} h1`);
    for (const cle of ["og:title", "og:description", "og:url"]) if (!meta(p.html, cle, "property")) problemes.push(`${p.url} : ${cle} absent`);
    if (!meta(p.html, "viewport")) problemes.push(`${p.url} : viewport absent`);
    for (const m of p.html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
      try { JSON.parse(m[1]); } catch { problemes.push(`${p.url} : JSON-LD invalide`); }
    }
    const urlSitemap = est404 ? null : `${ORIGINE}${p.url}`;
    if (urlSitemap) {
      if (noindex && sitemap.includes(urlSitemap)) problemes.push(`${p.url} : noindex mais présente dans le sitemap`);
      if (!noindex && !sitemap.includes(urlSitemap)) problemes.push(`${p.url} : indexable mais absente du sitemap`);
    }
    if (est404 && !noindex) problemes.push("404.html doit être noindex");
  }
  for (const u of sitemap) {
    const url = u.replace(ORIGINE, "");
    if (!u.startsWith(ORIGINE + "/")) problemes.push(`sitemap : URL hors domaine ${u}`);
    else if (!url.endsWith("/")) problemes.push(`sitemap : URL sans barre finale ${u}`);
    else if (!reelles.some((p) => p.url === url)) problemes.push(`sitemap : page inexistante ${u}`);
  }
  if (!/^User-agent:\s*\*/im.test(robots)) problemes.push("robots.txt : User-agent absent");
  if (/^Disallow:\s*\/\s*$/im.test(robots)) problemes.push("robots.txt : Disallow: / (site bloqué)");
  if (!new RegExp(`^Sitemap:\\s*${ORIGINE.replace(/\./g, "\\.")}/sitemap-index\\.xml`, "im").test(robots)) problemes.push("robots.txt : ligne Sitemap absente ou incorrecte");

  // Redirections des anciennes URL : cible réelle, canonical absolu, pas de chaîne, ancienne page couverte.
  for (const r of pages.filter((p) => p.redirection)) {
    const cible = /http-equiv="refresh"\s+content="0;\s*url=([^"]+)"/i.exec(r.html)?.[1];
    const c = canonique(r.html);
    if (!cible) { problemes.push(`${r.url} : redirection sans cible`); continue; }
    const page = pages.find((p) => p.url === cible);
    if (!page) problemes.push(`${r.url} : redirige vers ${cible}, introuvable`);
    else if (page.redirection) problemes.push(`${r.url} : chaîne de redirections via ${cible}`);
    if (c !== ORIGINE + cible) problemes.push(`${r.url} : canonical ${c} ≠ ${ORIGINE + cible}`);
    if (!/location\.replace/.test(r.html)) problemes.push(`${r.url} : pas de secours JavaScript`);
    if (estNoindex(r.html)) problemes.push(`${r.url} : une redirection ne doit pas être noindex (elle doit transmettre ses signaux)`);
  }
  for (const nom of ancien) if (!pages.some((p) => p.fichier === nom)) problemes.push(`ancienne URL /${nom} : ni page ni redirection`);
  return problemes;
}

// ---------- Accessibilité structurelle ----------
export function verifierA11y(pages) {
  const problemes = [];
  for (const p of pages.filter((x) => !x.redirection)) {
    const html = retirerBruit(p.html);
    const ou = (m) => `${p.url} : ${m}`;
    if (!titre(p.html)) problemes.push(ou("titre absent"));
    if (!/<html[^>]*\slang="/i.test(p.html)) problemes.push(ou("lang absent"));
    const mains = (html.match(/<main\b/gi) ?? []).length;
    if (mains !== 1) problemes.push(ou(`${mains} <main>`));
    for (const l of ["header", "nav", "footer"]) if (!new RegExp(`<${l}\\b`, "i").test(html)) problemes.push(ou(`landmark <${l}> absent`));
    const navs = balises(html, "nav");
    if (navs.length > 1) for (const n of navs) if (!n["aria-label"] && !n["aria-labelledby"]) problemes.push(ou("plusieurs <nav> : un sans nom (aria-label)"));
    // Lien d'évitement
    const saut = balises(html, "a").find((a) => a.href?.startsWith("#") && /contenu|main/.test(a.href));
    if (!saut) problemes.push(ou("lien d'évitement absent"));
    else if (!ids(p.html).includes(saut.href.slice(1))) problemes.push(ou(`cible du lien d'évitement ${saut.href} absente`));
    // Titres
    let dernier = 0;
    for (const m of html.matchAll(/<h([1-6])\b/gi)) {
      const n = Number(m[1]);
      if (dernier && n > dernier + 1) problemes.push(ou(`saut de titre h${dernier} > h${n}`));
      dernier = n;
    }
    // Images, liens et contrôles nommés
    for (const i of balises(html, "img")) if (i.alt === undefined) problemes.push(ou(`img sans alt (${(i.src ?? "").slice(-30)})`));
    for (const el of [...elementsAvecTexte(html, "a"), ...elementsAvecTexte(html, "button")]) {
      const nom = el._texte || el["aria-label"] || /<img[^>]*alt="[^"]+"/.test(el._interieur);
      if (!nom) problemes.push(ou("lien ou bouton sans nom accessible"));
      if (/^(ici|cliquez ici|en savoir plus|lire la suite)$/i.test(el._texte)) problemes.push(ou(`libellé de lien non descriptif « ${el._texte} »`));
    }
    for (const s of balises(html, "svg")) if (s.role === "img" && !s["aria-label"] && !s["aria-labelledby"]) problemes.push(ou("svg role=img sans nom"));
    // Références ARIA et identifiants
    const tous = ids(p.html);
    const doublons = tous.filter((x, i) => tous.indexOf(x) !== i);
    for (const d of new Set(doublons)) problemes.push(ou(`id en double « ${d} »`));
    for (const attr of ["aria-labelledby", "aria-controls", "aria-describedby"]) {
      for (const m of html.matchAll(new RegExp(`${attr}="([^"]+)"`, "g"))) for (const ref of m[1].split(/\s+/)) if (!tous.includes(ref)) problemes.push(ou(`${attr} → #${ref} introuvable`));
    }
    for (const el of html.matchAll(/\stabindex="(\d+)"/g)) if (Number(el[1]) > 0) problemes.push(ou("tabindex positif"));
    // <details> : un résumé
    for (const m of html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)) if (!/<summary\b/i.test(m[1])) problemes.push(ou("details sans summary"));
    if (/<meta[^>]*name="viewport"[^>]*(user-scalable=no|maximum-scale=1(\.0)?\b)/i.test(html)) problemes.push(ou("zoom bloqué par le viewport"));
  }
  return problemes;
}

// ---------- Budget de performance ----------
export const BUDGET = { htmlOctets: 80_000, cssOctetsParPage: 60_000, jsOctetsParPage: 40_000, policesCritiques: 2, policesCritiquesOctets: 130_000 };

export function verifierPerf(pages, tailleFichier, lireTexte) {
  const problemes = [];
  const rapport = [];
  const hotes = new Set();
  for (const p of pages.filter((x) => !x.redirection)) {
    const html = p.html;
    const css = balises(html, "link").filter((l) => l.rel === "stylesheet");
    const cssOctets = css.reduce((t, l) => t + (tailleFichier(l.href.replace(/^\//, "")) ?? 0), 0);
    const js = balises(html, "script").filter((s) => s.src);
    const jsOctets = js.reduce((t, s) => t + (tailleFichier(s.src.replace(/^\//, "")) ?? 0), 0) + [...html.matchAll(/<script\b(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/gi)].reduce((t, m) => t + m[1].length, 0);
    const critiques = balises(html, "link").filter((l) => l.rel === "preload" && l.as === "font");
    const critiquesOctets = critiques.reduce((t, l) => t + (tailleFichier(l.href.replace(/^\//, "")) ?? 0), 0);
    const htmlOctets = Buffer.byteLength(html);
    rapport.push({ url: p.url, htmlOctets, cssOctets, jsOctets, policesCritiques: critiques.length, policesCritiquesOctets: critiquesOctets });
    if (htmlOctets > BUDGET.htmlOctets) problemes.push(`${p.url} : HTML de ${htmlOctets} octets (> ${BUDGET.htmlOctets})`);
    if (cssOctets > BUDGET.cssOctetsParPage) problemes.push(`${p.url} : CSS de ${cssOctets} octets (> ${BUDGET.cssOctetsParPage})`);
    if (jsOctets > BUDGET.jsOctetsParPage) problemes.push(`${p.url} : JS de ${jsOctets} octets (> ${BUDGET.jsOctetsParPage})`);
    if (critiques.length > BUDGET.policesCritiques) problemes.push(`${p.url} : ${critiques.length} polices préchargées (> ${BUDGET.policesCritiques})`);
    if (critiquesOctets > BUDGET.policesCritiquesOctets) problemes.push(`${p.url} : polices préchargées de ${critiquesOctets} octets`);
    for (const l of critiques) if (l.crossorigin === undefined) problemes.push(`${p.url} : préchargement de police sans crossorigin`);
    // Aucune ressource tierce (suivi, polices, scripts) : seuls les liens <a> sortent du site.
    for (const [nom, attr] of [["script", "src"], ["link", "href"], ["img", "src"], ["iframe", "src"], ["source", "src"]]) {
      for (const b of balises(html, nom)) if (/^(https?:)?\/\//i.test(b[attr] ?? "") && b.rel !== "canonical") { hotes.add(b[attr]); problemes.push(`${p.url} : ressource tierce chargée ${b[attr]}`); }
    }
    for (const l of css) {
      const contenu = lireTexte(l.href.replace(/^\//, ""));
      for (const m of contenu?.matchAll(/url\(\s*["']?(https?:\/\/[^)"']+)/g) ?? []) problemes.push(`${p.url} : CSS charge ${m[1]}`);
    }
    for (const img of balises(html, "img")) if (img.width === undefined && img.height === undefined && !/aspect-ratio/.test(img.style ?? "")) problemes.push(`${p.url} : img sans dimensions (risque de décalage de mise en page)`);
  }
  return { problemes, rapport };
}

export { existsSync };
