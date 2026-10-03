# Avant mise en ligne — checklist V2

`npm run check:public -- --golive` échoue tant qu'un emplacement « à compléter » reste dans le site construit.

## À fournir / confirmer par Kevin
- [ ] Mentions légales : informations du mandataire IAD France (emplacement prévu, rien d'inventé).
- [ ] Tarifs (180 / 360 / 500 €) : non repris dans la V2 tant que non confirmés.
- [ ] Logos et partenaires : retirés ; à réintroduire seulement avec autorisation écrite.
- [ ] Visuel du hero : version typographique par défaut. Version avant/après (dossier de projection existant) seulement si les droits d'usage sont confirmés (voir `src/assets/hero/LISEZMOI.md`, `hero.mode` dans `src/content/site.ts`).
- [ ] Projection du projet pilote : reste « À venir » tant que le jalon 2 n'est pas autorisé.

## Technique
- [ ] GitHub Pages : Settings > Pages > Source = « GitHub Actions » (workflow `deploy.yml`, inactif tant que non poussé).
- [ ] Redirections des anciennes URL `.html` : générées par `scripts/make-redirects.mjs` (contrôler en jalon 3).
- [ ] Contrôle de fuite avec motifs privés : `FORBIDDEN_FILE=<fichier hors dépôt> npm run check:public`.
- [ ] Ancien site : l'IBAN reste dans l'historique Git public (pas de réécriture décidée).
- [ ] Domaine : DNS inchangé jusqu'à la bascule contrôlée (jalon 3).
