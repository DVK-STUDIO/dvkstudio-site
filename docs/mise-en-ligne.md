# Mise en ligne contrôlée (C9) — procédure, check-list, retour arrière

**État au 3 octobre 2026 : procédure préparée et testée en local. Rien n'a été poussé, déployé ni mis en production.** Ce document est la source de vérité de la bascule. Les prérequis de contenu sont dans `docs/avant-mise-en-ligne.md`.

## 1. Vérifier (aucun effet sur le dépôt distant)

```
npm run verifier:golive          # FORBIDDEN_FILE=<motifs privés> pour le contrôle de fuite
```

Enchaîne : tests, build public (`DVK_PUBLIC_BUILD=1`), `check:public`, `check:site` (liens, SEO, redirections, accessibilité structurelle, budget de performance), absence de l'expérience non confirmée, aperçu local servi puis test de fumée.
Verdict : **0** prêt à signer · **1** échec technique · **2** technique OK mais prérequis humains restants (en mode Immobilier « orientation » ou « off », il n'y a plus de bloquant automatique ; le mode « mandataire » ne se construit pas tant que les données réglementaires manquent).
Inclut `check:capacites` (la matrice du mode publié, voir « Mode Immobilier » plus bas) et `check:modes` (les trois modes construits réellement, dans un dossier temporaire ; les sources sont restaurées et `dist/` n'est pas touché). Inclut aussi `check:medias` (aucun stand-in, aucun emplacement vide, aucun montant dans la chaîne, aucun EXIF, hero : dimensions explicites et budget de chargement) et `check:modes-medias` (constructions réelles de la couche photographique : livraison dormante, stand-ins refusés, paire fictive confirmée, dimensions différentes refusées, droits sans justificatif refusés). Voir `docs/medias.md`.

Aperçu à l'œil (build public, comme en production) :
```
DVK_PUBLIC_BUILD=1 npm run build && npm run preview
```

## 2. Prérequis humains (bloquent la mise en production, pas le développement)

- [x] **Mode Immobilier « orientation » (décision du 4 octobre 2026, remplace l'option b du 3 octobre)** : interrupteur unique `src/content/capacites.ts` (`immobilier.mode`), contenus dans `src/content/immobilier.ts`, données réglementaires séparées dans `src/content/iad.ts`, contrôles `check:capacites` et `check:modes`. La page `/immobilier/` est publiable ; le site ne présente jamais Kevin comme professionnel immobilier. Voir « Mode Immobilier » plus bas.
- [ ] **Action humaine : confirmer que « Je rejoins le réseau iad France » est exact** au jour de la mise en ligne (texte affiché en mode orientation).
- [x] **Médiateur de la consommation CM2C** (validé le 11/10/2026) : attestation d'affiliation de DVK Studio, expiration le 11/11/2028. Coordonnées reprises de l'attestation dans `site.mediateur` et affichées dans les mentions légales.
- [x] **Conformité à la charte de communication hemea** (art. 5.5 et 5.11 du contrat de mandataire) : validée par hemea, confirmé par Kevin De Vlieger le 11/10/2026. Toute évolution notable du site devra rester conforme.
- [x] Mention de l'assurance RCP (validée le 11/10/2026) : police Hiscox n° PL-FR-PSC900388806 souscrite par NOVARE CONSTRUCTION, qui couvre ses mandataires (`site.assurance`, mentions légales). **L'attestation fournie couvre la période du 01/09/2025 au 31/08/2026 : archiver l'attestation 2026-2027.**
- [ ] Relation contractuelle : le site ne dit pas qui facture le client tant que les conditions générales de hemea n'ont pas été vérifiées.
- [ ] Dernière vérification visuelle (desktop et mobile) puis GO de déploiement.
- [x] /cgv/ retirée du site public (DVK ne commercialise pas ces prestations au lancement ; l'ancienne adresse .html renvoie vers les mentions légales). Source conservée dans `docs/archives/cgv-v2-2026-10-03.astro`, anciennes CGV dans l'historique Git. À rétablir si DVK Studio commercialise une prestation propre (par exemple autour de DVK Expérience).
- [ ] Tarifs : aucun repris tant que non confirmés.
- [ ] Logos et partenaires : aucun repris sans autorisation.
- [ ] Hero : version actuelle (plan, aucune photo non autorisée). La couche photographique est livrée dormante : elle ne s'active que lorsqu'un média est marqué « confirmés » dans `src/content/medias.ts` (voir `docs/medias.md`).
- [ ] Expérience pilote : **hors publication** tant que `diffusion` n'est pas `confirmee` (accord de la famille). Elle n'a aucune raison de bloquer le site.
- [ ] Domaine : le DNS de `dvkstudio.fr` ne change pas (fichier `CNAME` conservé).

## Mode Immobilier (`immobilier.mode` dans `src/content/capacites.ts`)

| Mode | Effet |
|---|---|
| `off` | Aucune page `/immobilier/`, aucune présentation de l'activité immobilière, aucune référence au réseau iad. Menu et accueil d'origine. |
| `orientation` (**publié**) | Page `/immobilier/` active, menu « Immobilier », accueil Je rénove / J'achète / Je vends. Autorisé : « je rejoins le réseau iad France » (si exact). Interdits : qualité de professionnel immobilier (mandataire, conseiller, agent commercial), mandat, avis de valeur, honoraires ou barème, mentions réglementaires, SEO transactionnel, formulaire de transmission à un tiers, rémunération de recommandation. CTA : rendez-vous général de 20 minutes. |
| `mandataire` | Page définitive. **Verrouillé** : le build échoue tant que `reglementaire` (`src/content/iad.ts`) est incomplet ou que `valide` vaut false. |

Règle : **Immobilier orientation = publiable. Immobilier mandataire = verrouillé jusqu'à validation réglementaire.** Graphie du réseau : « iad France » (vérifiée sur les e-mails officiels d'iad), variable `reseau.nom`. Pas de logo iad. « Conseil en investissement » : exclu dans tous les modes.

### Activer le mode mandataire (plus tard, statut validé)

1. Vérifier le statut exact de communication. Renseigner `reglementaire` dans `src/content/iad.ts` avec les valeurs OFFICIELLES (qualité, RSAC, carte professionnelle, garantie financière, RCP, honoraires, médiateur après vérification du périmètre CM2C et des exigences iad). Aucune valeur provisoire.
2. Passer `valide` à `true`, puis `immobilier.mode` à `"mandataire"` dans `src/content/capacites.ts`. Le build refuse si un champ manque.
3. Relire les textes de `src/content/immobilier.ts` (variantes `mandataire`) et la section réglementaire des mentions légales.
4. Relire les canaux d'acquisition de Growth (contrôle de cohérence inscrit au roadmap Growth).
5. `npm run verifier:golive` (inclut `check:capacites` et `check:modes`), puis GO explicite avant toute publication.

## 3. Bascule (à exécuter seulement après GO explicite)

1. Relire et signer la check-list (section 6).
2. Pousser **la branche** `v2/refonte` (pas `main`) et ouvrir une demande de fusion vers `main` : la CI exécute tests, build public, `check:public --golive`, `check:site`.
3. Réglage unique : GitHub > Settings > Pages > Source = **GitHub Actions**.
4. Fusionner dans `main` (fusion avec commit, pour pouvoir l'annuler d'un seul geste). Le workflow `Déploiement` publie, puis le job `fumee` teste le site réellement servi.
5. Contrôle manuel : `https://dvkstudio.fr/`, une ancienne URL (`/particuliers.html`), `/robots.txt`, `/sitemap-index.xml`, un lien de rendez-vous.
6. Après la mise en ligne : déclarer le plan de site dans la Search Console.

Pas de changement DNS, pas de nouvelle plateforme, pas de dépendance ajoutée.

## 4. Retour arrière

Déclencheurs : échec du job `fumee`, page cassée, mention légale erronée, fuite de donnée.

**Retour A, annuler la fusion (le plus rapide)**
```
git checkout main && git pull
git revert -m 1 <commit de fusion>
git push origin main
```
Puis Settings > Pages > Source = « Deploy from a branch », branche `main`, dossier `/ (root)` : le site V1 est de nouveau servi (la V2 vit sur sa branche, rien n'est perdu).

**Retour B, depuis l'étiquette** (si `main` est devenue inexploitable)
```
git switch -c retour-v1 v1-2026-06-27
git push origin retour-v1
```
Puis Pages > Source = « Deploy from a branch », branche `retour-v1`, dossier `/ (root)`.

**Répétition du retour A (3 octobre 2026, clone jetable, aucun push)** : fusion de `v2/refonte` dans une copie de `main` (V1, `14b7fbb`), puis `git revert -m 1` de la fusion. Résultat : **0 fichier de différence avec `main`** ; `index.html`, `CNAME` et les pages V1 sont restitués. L'étiquette `v1-2026-06-27` contient bien `index.html` et `CNAME`. Le seul réglage manuel du retour est la Source de Pages (le workflow n'existe plus sur `main` après le retour).

## 5. Ce que le code protège déjà
- Une expérience dont `diffusion` n'est pas `confirmee` n'est jamais émise en build public, ni dans le plan de site ; `check:public --golive` et le job `fumee` échouent si elle apparaît.
- Aucune ressource tierce (polices, suivi) : mesuré et testé (budget de performance).
- Les anciennes URL `.html` redirigent vers la nouvelle page (canonical + refresh + secours JavaScript, sans `noindex`). `download` et `files.zip` ne sont **volontairement pas** conservés (documents publics de la V1).
- Motifs privés : `FORBIDDEN_FILE` (fichier hors dépôt) contrôle le build et le HTML servi.

## 6. Check-list signée

| # | Vérification | Résultat |
|---|---|---|
| 1 | `npm run verifier:golive` : technique OK | ☐ |
| 2 | Mode Immobilier `orientation` : `check:capacites` et `check:modes` verts ; « Je rejoins le réseau iad France » confirmé exact | ☐ |
| 3 | Aperçu relu desktop et mobile 390 px | ☐ |
| 4 | Aucune photo, aucun logo, aucun tarif non autorisé | ☐ |
| 5 | Expérience pilote exclue (ou diffusion confirmée par écrit) | ☐ |
| 6 | Retour arrière relu (section 4) | ☐ |

Signé par : ____________________  Date : ____________________
