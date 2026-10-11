// Contrôle du positionnement demandé, sur le site construit.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";

assert.ok(existsSync("dist/index.html"), "Construire le site avant ce contrôle");
const fichiers = [];
function parcourir(d) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) parcourir(p);
    else if (/\.(html|xml|js|json)$/i.test(n)) fichiers.push(p);
  }
}
parcourir("dist");
for (const p of fichiers) {
  const texte = readFileSync(p, "utf8");
  assert.doesNotMatch(texte, /\biad\b|DVK\s+Expérience|href=["']\/experience(?:\/|["'])/i, `${p} : activité exclue`);
}
assert.ok(!existsSync("dist/experience"), "Aucune page Expérience publiée");
assert.ok(!existsSync("dist/immobilier"), "Aucune page Immobilier publiée");
for (const p of ["index.html", "travaux/index.html", "acquereurs/index.html", "professionnels/index.html", "contact/index.html"]) {
  const texte = readFileSync(join("dist", p), "utf8");
  assert.match(texte, /hemea/i, `${p} : activité hemea`);
  assert.match(texte, /Oise/, `${p} : zone Oise`);
  assert.match(texte, /Somme/, `${p} : zone Somme`);
}
const accueil = readFileSync("dist/index.html", "utf8");
assert.match(accueil, /k\.devlieger@hemea\.fr/, "Email professionnel");
assert.match(accueil, /tel:\+33640324752/, "Téléphone cliquable");
console.log(`Positionnement hemea vérifié dans ${fichiers.length} fichiers construits.`);
