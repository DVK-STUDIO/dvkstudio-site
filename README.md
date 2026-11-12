# dvkstudio-site (V2)

Site statique Astro de DVK Studio, en ligne sur https://dvkstudio.fr. Toute fusion dans `main` est construite, contrôlée puis publiée sur GitHub Pages (`.github/workflows/deploy.yml`).

## Commandes
- `npm run dev` : serveur local
- `npm run build` : site statique dans `dist/`
- `npm run preview` : aperçu du build
- `npm test` : tests unitaires (liens de rendez-vous HubSpot et attribution)
- `npm run check:public` : contrôle d'hygiène du build (IBAN, trackers, polices tierces) ; `-- --golive` refuse les « à compléter »

## Principes
- Aucun cookie déposé par le site lui-même. L'origine de visite (page, bouton) est gardée en `sessionStorage` puis transmise à HubSpot par paramètres UTM.
- Services tiers chargés sur les pages : Metricool (mesure d'audience) et Typebot (assistant « Le Zèbre »). Tout nouveau service doit être ajouté à la page Confidentialité.
- Polices auto-hébergées. JavaScript natif, seulement où utile.
- Statuts honnêtes : Disponible / Démonstration / À venir.

Les notes internes (mise en ligne, HubSpot, feuille de route) sont conservées hors de ce dépôt public.
