# Mise en ligne contrôlée (C9) — procédure, check-list, retour arrière

**État au 3 octobre 2026 : procédure préparée et testée en local. Rien n'a été poussé, déployé ni mis en production.** Ce document est la source de vérité de la bascule. Les prérequis de contenu sont dans `docs/avant-mise-en-ligne.md`.

## 1. Vérifier (aucun effet sur le dépôt distant)

```
npm run verifier:golive          # FORBIDDEN_FILE=<motifs privés> pour le contrôle de fuite
```

Enchaîne : tests, build public (`DVK_PUBLIC_BUILD=1`), `check:public`, `check:site` (liens, SEO, redirections, accessibilité structurelle, budget de performance), absence de l'expérience non confirmée, aperçu local servi puis test de fumée.
Verdict : **0** prêt à signer · **1** échec technique · **2** technique OK mais prérequis humains restants (avec la capacité IAD désactivée, il n'y en a plus de bloquant automatique).
Inclut `check:capacites` : capacité IAD désactivée => aucune occurrence de « IAD » ni de « mandataire immobilier » dans le build, et pas de page `/immobilier/`.

Aperçu à l'œil (build public, comme en production) :
```
DVK_PUBLIC_BUILD=1 npm run build && npm run preview
```

## 2. Prérequis humains (bloquent la mise en production, pas le développement)

- [x] **Capacité IAD désactivée (option b, faite le 3 octobre 2026)** : interrupteur unique `src/content/capacites.ts`, contenus isolés dans `src/content/iad.ts` et `src/iad/`, test de build `check:capacites`. Aucune mention publique du statut. Voir « Activer la capacité IAD » plus bas.
- [ ] Tarifs : aucun repris tant que non confirmés.
- [ ] Logos et partenaires : aucun repris sans autorisation.
- [ ] Hero : version typographique (aucune photo non autorisée).
- [ ] Expérience pilote : **hors publication** tant que `diffusion` n'est pas `confirmee` (accord de la famille). Elle n'a aucune raison de bloquer le site.
- [ ] Domaine : le DNS de `dvkstudio.fr` ne change pas (fichier `CNAME` conservé).

## Activer la capacité IAD (plus tard, statut validé)

1. Vérifier le statut exact de communication ; compléter l'objet `reglementaire` de `src/content/iad.ts` (aucune valeur provisoire).
2. Relire les textes de `src/content/iad.ts` et `src/iad/` (page `/immobilier/`, section des mentions légales, FAQ, À propos).
3. Passer `iad` à `true` dans `src/content/capacites.ts` : la page `/immobilier/`, l'entrée de navigation, l'entrée « Je vends » de l'accueil, la FAQ et les mentions réapparaissent (rien n'a été supprimé).
4. `npm run verifier:golive` : `check:public --golive` bloque tant qu'un « [à compléter] » subsiste.
5. GO explicite avant toute publication.

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
| 2 | Capacité IAD désactivée (`check:capacites` vert) ou mentions définitives intégrées | ☐ |
| 3 | Aperçu relu desktop et mobile 390 px | ☐ |
| 4 | Aucune photo, aucun logo, aucun tarif non autorisé | ☐ |
| 5 | Expérience pilote exclue (ou diffusion confirmée par écrit) | ☐ |
| 6 | Retour arrière relu (section 4) | ☐ |

Signé par : ____________________  Date : ____________________
