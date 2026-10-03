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

## DVK Design System v1
Livré (dépôt local `dvk-design-system`). Source de vérité graphique : direction Architecture augmentée × Magazine habitat, rythme Ressentir → Comprendre → Décider, intensités Éditorial / Équilibre (défaut) / Augmenté. La V2 en est la première implémentation ; une partie de la charte est exécutable (tests `src/lib/design.test.ts`).

**Décision d'outillage : Napkin et Canva sont retirés de l'architecture.** Workflow de référence : Données / Projet → Claude → DVK Design System → support. Un outil spécialisé n'est ajouté que lorsqu'une capacité réellement manquante le justifie (par exemple un moteur de projection photoréaliste, avec contrôle de fidélité). Voir `dvk-design-system/docs/11-limites-et-briques-specialisees.md`.

## Dette et points volontairement ouverts
- Photographies réelles (dépendance de contenu) : le mode Éditorial sera validé sur un projet disposant des droits.
- Migration complète des espacements et des tailles de texte vers les rôles du Design System ; poids 500 ; repères de plan dans la matrice.
- Plan du potentiel calé sur un projet cuisine / séjour : à généraliser dans le contrat avec un second projet.
- Mentions du mandataire IAD : prérequis de mise en production (pas de développement).
