# dvkstudio-site (V2)

Site statique Astro de DVK Studio. Branche de travail : `v2/refonte`. Aucune mise en ligne tant que le jalon 3 n'est pas autorisé.

## Commandes
- `npm run dev` : serveur local
- `npm run build` : site statique dans `dist/`
- `npm run preview` : aperçu du build
- `npm test` : tests unitaires (liens de rendez-vous HubSpot et attribution)
- `npm run check:public` : contrôle d'hygiène du build (IBAN, trackers, polices tierces) ; `-- --golive` refuse les « à compléter »

## Principes
- Aucun cookie, aucun traceur. L'origine de visite (page, bouton) est gardée en `sessionStorage` puis transmise à HubSpot par paramètres UTM.
- Polices auto-hébergées. JavaScript natif, seulement où utile.
- Statuts honnêtes : Disponible / Démonstration / À venir.
- Ancien site conservé dans `legacy/` (non déployé).

Avant mise en ligne : `docs/avant-mise-en-ligne.md`.
