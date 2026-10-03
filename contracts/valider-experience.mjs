// Validation d'une ExperiencePubliée v1 : schéma JSON + cohérence entre références.
// Module sans dépendance au site : importé par le build (src/lib/experience) et par l'export du dépôt privé.
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import schema from "./experience-publiee.v1.schema.json" with { type: "json" };

const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false, allowUnionTypes: true });
addFormats(ajv);
const verifierSchema = ajv.compile(schema);

/** Toutes les `valeur` d'une expérience (objets portant un `statut` de donnée). */
function* valeurs(exp) {
  for (const f of exp.bien.faits) yield ["bien." + f.id, f.valeur];
  for (const f of exp.potentiel.faits) yield ["potentiel." + f.id, f.valeur];
  for (const s of exp.scenarios) {
    yield ["scenario." + s.id + ".budget", s.budget];
    yield ["scenario." + s.id + ".impactEnergetique", s.impactEnergetique];
    yield ["scenario." + s.id + ".projection", s.projection];
  }
  const e = exp.energie;
  for (const k of ["classeAvant", "classeApres", "consommation", "emissions", "factureAnnuelle", "economieAnnuelle"]) yield ["energie." + k, e[k]];
  const b = exp.budget.energie;
  for (const l of b.lots) yield ["budget.lot." + l.lot, l.montant];
  yield ["budget.total", b.total];
  for (const a of b.financements) yield ["budget.financement." + a.libelle, a.montant];
  yield ["budget.resteACharge", b.resteACharge];
}

function doublons(ids) {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

export function validerExperience(donnees) {
  const erreurs = [];
  if (!verifierSchema(donnees)) {
    for (const e of verifierSchema.errors ?? []) erreurs.push(`schéma ${e.instancePath || "/"} : ${e.message}`);
    return { ok: false, erreurs };
  }
  const exp = donnees;
  const sources = new Set(exp.sources.map((s) => s.id));
  for (const d of doublons(exp.sources.map((s) => s.id))) erreurs.push(`source en double : ${d}`);

  const verifSources = (chemin, ids) => {
    for (const id of ids ?? []) if (!sources.has(id)) erreurs.push(`${chemin} : source inconnue « ${id} »`);
  };
  for (const [chemin, v] of valeurs(exp)) {
    verifSources(chemin, v.sources);
    for (const c of v.conflits ?? []) verifSources(chemin + ".conflit", c.sources);
  }
  for (const b of exp.besoins) verifSources("besoin." + b.id, b.sources);
  verifSources("matrice", exp.matrice.sources);

  const besoins = exp.besoins.map((b) => b.id);
  const scenarios = exp.scenarios.map((s) => s.id);
  for (const d of doublons(besoins)) erreurs.push(`besoin en double : ${d}`);
  for (const d of doublons(scenarios)) erreurs.push(`scénario en double : ${d}`);
  for (const d of doublons(exp.scenarios.map((s) => s.numero))) erreurs.push(`numéro de scénario en double : ${d}`);

  // Matrice complète : chaque besoin face à chaque scénario, une seule fois, sans référence orpheline.
  const vues = new Set();
  for (const c of exp.matrice.cellules) {
    if (!besoins.includes(c.besoin)) erreurs.push(`matrice : besoin inconnu « ${c.besoin} »`);
    if (!scenarios.includes(c.scenario)) erreurs.push(`matrice : scénario inconnu « ${c.scenario} »`);
    const cle = c.besoin + "|" + c.scenario;
    if (vues.has(cle)) erreurs.push(`matrice : cellule en double ${cle}`);
    vues.add(cle);
  }
  for (const b of besoins) for (const s of scenarios) if (!vues.has(b + "|" + s)) erreurs.push(`matrice : cellule manquante ${b} × ${s}`);

  // Un total chiffré doit être la somme de ses lots (aucun chiffre « arrangé »).
  const be = exp.budget.energie;
  if (be.total.statut !== "manquant" && be.lots.every((l) => typeof l.montant.valeur === "number") && typeof be.total.valeur === "number") {
    const somme = be.lots.reduce((t, l) => t + l.montant.valeur, 0);
    if (somme !== be.total.valeur) erreurs.push(`budget : somme des lots (${somme}) différente du total (${be.total.valeur})`);
  }
  // Reste à charge = total − financements mobilisés (prime, prêt), lorsque tout est chiffré.
  if (typeof be.total.valeur === "number" && typeof be.resteACharge.valeur === "number" && be.financements.every((a) => typeof a.montant.valeur === "number")) {
    // Financements = primes et prêts mobilisés ; le reste à charge est le solde.
    const financements = be.financements.reduce((t, a) => t + a.montant.valeur, 0);
    if (be.total.valeur - financements !== be.resteACharge.valeur) erreurs.push(`budget : total − financements (${be.total.valeur - financements}) différent du reste à charge (${be.resteACharge.valeur})`);
  }
  // Une cellule « n'a pas de budget » : un scénario sans chiffrage ne doit pas porter de valeur.
  for (const s of exp.scenarios) if (s.maturite === "a_etudier" && s.projection.statut !== "a_venir" && s.projection.statut !== "manquant") erreurs.push(`scénario ${s.id} : projection non autorisée à ce stade`);
  if (exp.projection.statut !== "a_venir") erreurs.push("projection : doit rester « à venir » tant qu'aucune projection n'est contrôlée");

  return { ok: erreurs.length === 0, erreurs };
}
