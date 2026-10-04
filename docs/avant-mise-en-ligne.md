# Avant mise en ligne — checklist V2

`npm run check:public -- --golive` échoue tant qu'un emplacement « à compléter » reste dans le site construit.

## À fournir / confirmer par Kevin
- [x] Informations réglementaires du mandataire : sans objet en mode `orientation` (aucune mention publique). À fournir avant le mode `mandataire` (liste dans `docs/mise-en-ligne.md`).
- [ ] **Action humaine : confirmer que « Je rejoins le réseau iad France » est exact** au jour de la mise en ligne.
- [ ] **Action humaine : médiateur de la consommation CM2C.** Adhésion confirmée par l'e-mail du 11/11/2025 (3 ans). Récupérer la mention officielle dans l'espace professionnel CM2C et l'intégrer aux emplacements juridiquement nécessaires. Aucune coordonnée n'est devinée : tant que ce n'est pas fait, rien n'est affiché.
- [ ] **Action humaine : conformité à la charte de communication hemea.** Le contrat de mandataire (art. 5.5 et 5.11) impose la conformité des supports commerciaux à la charte, ou leur approbation écrite, et la mention de la qualité de mandataire et des références du mandant. Confirmer la conformité du site ou obtenir l'approbation.
- [ ] Mention de l'assurance RCP : non affichée tant que la formulation autorisée n'est pas confirmée.
- [ ] Relation contractuelle : le site ne dit pas qui facture le client tant que les conditions générales de hemea n'ont pas été vérifiées.
- [ ] Dernière vérification visuelle (desktop et mobile) puis GO de déploiement.
- [x] /cgv/ retirée du site public (DVK ne commercialise pas ces prestations au lancement ; l'ancienne adresse .html renvoie vers les mentions légales). Source conservée dans `docs/archives/cgv-v2-2026-10-03.astro`, anciennes CGV dans l'historique Git. À rétablir si DVK Studio commercialise une prestation propre (par exemple autour de DVK Expérience).
- [ ] Tarifs (180 / 360 / 500 €) : non repris dans la V2 tant que non confirmés.
- [ ] Logos et partenaires : retirés ; à réintroduire seulement avec autorisation écrite.
- [ ] Visuel du hero : version typographique par défaut. Version avant/après seulement si les droits d'usage sont confirmés (voir `src/assets/hero/LISEZMOI.md`, `hero.mode` dans `src/content/site.ts`).

## Expérience pilote (`/experience/maison-familiale/`)
- [ ] Faire confirmer par la famille le périmètre « toute la maison » : type de bien, énergie (classe, consommation, facture), budget travaux agrégé. Le consentement initial couvre cuisine, séjour et plan anonymisé.
- [ ] Archiver la date et la preuve de l'accord dans le dépôt privé (`consentement.dateAccord`) et vider `perimetreAConfirmer`, puis ré-exporter : l'instantané passe en `diffusion: confirmee`.
- **Garde automatique** : « anonymisé » ne veut pas dire « diffusable ». Un build public (`DVK_PUBLIC_BUILD=1`, déjà posé dans `deploy.yml`) n'émet aucune expérience non confirmée, et `check:public --golive` échoue si une telle page se retrouve dans `dist/`.
- [ ] Choisir l'URL définitive (par défaut un nom neutre, sans nom de famille) et passer `indexable` à `true` dans le dépôt privé, puis ré-exporter.
- [ ] Photos et documents : aucun publié. Droits d'usage à valider avant tout ajout.
- [ ] Projection : reste « À venir » (aucun générateur d'image appelé).

## Technique
- [ ] GitHub Pages : Settings > Pages > Source = « GitHub Actions » (workflow `deploy.yml`, inactif tant que non poussé).
- [ ] Redirections des anciennes URL `.html` : générées par `scripts/make-redirects.mjs` (contrôler en jalon 3).
- [ ] Contrôle de fuite avec motifs privés : `FORBIDDEN_FILE=<fichier hors dépôt> npm run check:public` et `npm test`.
- [ ] Ancien site : l'IBAN reste dans l'historique Git public (pas de réécriture décidée).
- [ ] Domaine : DNS inchangé jusqu'à la bascule contrôlée (jalon 3).

## Jalon 3 (C8) : ce qui est déjà vérifié par le code
- `npm run check:site` : liens et ancres, canonicals, titres et descriptions uniques, sitemap, `noindex`, redirections des anciennes URL, accessibilité structurelle, budget de performance (aucune ressource tierce, CSS, JS et polices bornés).
- `npm run verifier:golive` : enchaîne tous les contrôles et un test de fumée, sans rien déployer. Procédure de bascule et retour arrière : `docs/mise-en-ligne.md`.
