// Redirections des anciennes URL (GitHub Pages ne permet pas de 301) : pages minimales (sans noindex, pour transmettre leurs signaux) avec refresh,
// canonical vers la nouvelle adresse et JavaScript de secours. Génère public/<ancien>.html.
import { writeFileSync, mkdirSync } from "node:fs";
const correspondances = {
  "particuliers.html": "/travaux/",
  "professionnels.html": "/professionnels/",
  "a-propos.html": "/a-propos/",
  "realisations.html": "/travaux/",
  "contact.html": "/contact/",
  "mentions-legales.html": "/mentions-legales/",
  "confidentialite.html": "/confidentialite/",
  "cgv.html": "/mentions-legales/", // page /cgv/ retirée (voir docs/archives/)
  "merci.html": "/merci/",
};
mkdirSync("public", { recursive: true });
for (const [ancien, nouveau] of Object.entries(correspondances)) {
  const url = `https://dvkstudio.fr${nouveau}`;
  writeFileSync(
    `public/${ancien}`,
    `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Cette page a déménagé | DVK Studio</title><link rel="canonical" href="${url}"><meta http-equiv="refresh" content="0; url=${nouveau}"><script>location.replace(${JSON.stringify(nouveau)});</script></head><body><p>Cette page a déménagé : <a href="${nouveau}">${url}</a></p></body></html>\n`
  );
}
console.log(`${Object.keys(correspondances).length} redirections écrites`);

