# Avant mise en ligne — checklist V2

`npm run check:public -- --golive` échoue tant qu'un emplacement « à compléter » reste dans le site construit.

## À fournir / confirmer par Kevin
- [ ] Mentions légales : informations du mandataire IAD France (emplacement prévu, rien d'inventé).
- [ ] Tarifs (180 / 360 / 500 €) : non repris dans la V2 tant que non confirmés.
- [ ] Logos et partenaires : retirés ; à réintroduire seulement avec autorisation écrite.
- [ ] Visuel du hero : version typographique par défaut. Version avant/après seulement si les droits d'usage sont confirmés (voir `src/assets/hero/LISEZMOI.md`, `hero.mode` dans `src/content/site.ts`).

## Expérience pilote (`/experience/maison-familiale/`)
- [ ] Faire confirmer par la famille le périmètre « toute la maison » : type de bien, énergie (classe, consommation, facture), budget travaux agrégé. Le consentement initial couvre cuisine, séjour et plan anonymisé.
- [ ] Archiver la date et la preuve de l'accord dans le dépôt privé (`consentement.dateAccord`).
- [ ] Choisir l'URL définitive (par défaut un nom neutre, sans nom de famille) et passer `indexable` à `true` dans le dépôt privé, puis ré-exporter.
- [ ] Photos et documents : aucun publié. Droits d'usage à valider avant tout ajout.
- [ ] Projection : reste « À venir » (aucun générateur d'image appelé).

## Technique
- [ ] GitHub Pages : Settings > Pages > Source = « GitHub Actions » (workflow `deploy.yml`, inactif tant que non poussé).
- [ ] Redirections des anciennes URL `.html` : générées par `scripts/make-redirects.mjs` (contrôler en jalon 3).
- [ ] Contrôle de fuite avec motifs privés : `FORBIDDEN_FILE=<fichier hors dépôt> npm run check:public` et `npm test`.
- [ ] Ancien site : l'IBAN reste dans l'historique Git public (pas de réécriture décidée).
- [ ] Domaine : DNS inchangé jusqu'à la bascule contrôlée (jalon 3).
