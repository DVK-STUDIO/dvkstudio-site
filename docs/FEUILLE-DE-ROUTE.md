# Feuille de route — site DVK Studio V2 et écosystème DVK

Dernière mise à jour : 2026-10-03.

## Jalons du site V2
| Jalon | Contenu | État |
|---|---|---|
| 1 | Socle Astro, pages publiques, DVK Expérience en démonstration | Livré (local, non poussé) |
| 2 | ExperiencePubliée v1 (contrat), dépôt privé `dvk-projets`, `/experience/[slug]` avec le projet pilote | Livré (local, non poussé) |
| — | Alignement sur DVK Design System v1 (lots A et B) et passe de polish | Livré (local, non poussé) |
| 3 | C8 performance, accessibilité, SEO, redirections ; C9 mise en ligne contrôlée | **C8 livré. C9 préparé** : procédure, vérification complète, retour arrière répété. **Bascule non exécutée** (ni push, ni déploiement, ni production). |

Ordre retenu : V2 stabilisée → jalon 3 → conformité IAD → contenu et photos réelles → validation finale → push et déploiement.

- Prérequis de mise en ligne : `docs/avant-mise-en-ligne.md`.
- Procédure, check-list signée et retour arrière : `docs/mise-en-ligne.md`.
- Vérification complète sans rien publier : `npm run verifier:golive`.
- L'expérience pilote ne bloque pas le site : elle est exclue du build public tant que sa diffusion n'est pas confirmée (« anonymisé » ne veut pas dire « diffusable »).

## Capacités activables : IAD et hemea (décision du 2026-10-03)

> **Mise à jour du 2026-10-03 : l'option (b) remplace l'option A.** IAD devient une capacité DÉSACTIVÉE pour que la V2 puisse être publiée sans attendre l'intégration IAD de Kevin. **Fait le 2026-10-03.** Étape 1 : cadrage validé. Étape 2 : interrupteur unique `src/content/capacites.ts`, contenus IAD isolés (`src/content/iad.ts`, `src/iad/`, jamais supprimés), page `/immobilier/` absente du build tant que OFF, test `check:capacites` (aucun « IAD » ni « mandataire » dans le build). Étape 3 : nouvelle accueil intégrée (trois entrées, page `/acquereurs/`, barre mobile). Investisseur : intégré à « J'achète un bien à rénover », pas de parcours dédié. Réactivation : voir `docs/mise-en-ligne.md`.

Texte d'origine (option A, remplacée) :

La V2 est **techniquement prête mais volontairement non publiable** : le site présente aujourd'hui le statut de mandataire IAD France comme acquis (accueil, `/immobilier/`, `/a-propos/`, FAQ, mentions légales) alors que l'intégration IAD de Kevin n'est pas finalisée. Aucun contenu IAD n'est modifié pour l'instant, et aucune mention provisoire n'est ajoutée.

**Règle commune à l'écosystème (validée par Kevin, 2026-10-03)**

- Statut IAD **non validé** → **aucune** communication publique ou outbound présentant Kevin ou DVK comme mandataire IAD France. Pas de texte « en cours d'enregistrement », pas de valeur provisoire.
- Statut IAD **validé** et mentions réglementaires **définitives** disponibles → activation des contenus IAD.
- hemea (activité Travaux) est opérationnelle : aucun changement.

| Capacité | État au 2026-10-03 | Condition d'activation |
|---|---|---|
| hemea · Travaux | **actif** | — |
| IAD · Immobilier (vente, achat) | **en attente** | intégration IAD finalisée ; statut exact sous lequel Kevin peut communiquer vérifié ; mentions réglementaires définitives |

IAD et hemea sont des **capacités activables**, pas des hypothèses codées en dur dans l'identité DVK : DVK Studio existe sans elles, et l'une peut s'activer ou changer sans remettre en cause l'autre.

**À l'activation IAD, dans cet ordre :**
1. vérifier le statut exact sous lequel Kevin peut communiquer ;
2. intégrer les mentions réglementaires définitives (4 champs de `src/content/site.ts`, objet `mandataire`, plus les libellés et champs complémentaires que ses documents imposent) ;
3. relire toutes les affirmations relatives à IAD : accueil, `/immobilier/`, `/a-propos/`, FAQ, pages légales ;
4. relancer `npm run verifier:golive` ;
5. décision de mise en ligne : GO explicite de Kevin (la réussite du contrôle ne déclenche aucun déploiement).

**État partagé (documenté, rien de développé).** Hypothèse à tester plus tard, sans architecture disproportionnée : un petit fichier versionné de capacités, par exemple `{ "hemea": { "statut": "actif" }, "iad": { "statut": "en_attente", "mentionsDefinitives": false } }`, lu par le site au build (même mécanisme que `diffusion` : un contenu IAD ne sort pas tant que la capacité n'est pas active) et par Growth (garde avant tout envoi ou contenu mentionnant IAD). Il vivrait côté contrat public partagé (Core), jamais dans un module. D'ici là, la règle est appliquée à la main et par la relecture ci-dessus.

## DVK Design System v1
Livré (dépôt local `dvk-design-system`). Source de vérité graphique : direction Architecture augmentée × Magazine habitat, rythme Ressentir → Comprendre → Décider, intensités Éditorial / Équilibre (défaut) / Augmenté. La V2 en est la première implémentation ; une partie de la charte est exécutable (tests `src/lib/design.test.ts`).

**Décision d'outillage : Napkin et Canva sont retirés de l'architecture.** Workflow de référence : Données / Projet → Claude → DVK Design System → support. Un outil spécialisé n'est ajouté que lorsqu'une capacité réellement manquante le justifie (par exemple un moteur de projection photoréaliste, avec contrôle de fidélité). Voir `dvk-design-system/docs/11-limites-et-briques-specialisees.md`.

## Dette et points volontairement ouverts
- Photographies réelles (dépendance de contenu) : le mode Éditorial sera validé sur un projet disposant des droits.
- Migration complète des espacements et des tailles de texte vers les rôles du Design System ; poids 500 ; repères de plan dans la matrice.
- Plan du potentiel calé sur un projet cuisine / séjour : à généraliser dans le contrat avec un second projet.
- Capacité IAD : désactivée, **ne bloque plus** la mise en ligne. Elle bloquera sa propre réactivation tant que le statut n'est pas validé.
- Portrait, réalisations et avis : absents du site public (aucun emplacement réservé) tant qu'il n'y a pas de matériau réel et autorisé.
