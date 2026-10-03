# Feuille de route — site DVK Studio V2 et écosystème DVK

Dernière mise à jour : 2026-10-03.

## Jalons du site V2
| Jalon | Contenu | État |
|---|---|---|
| 1 | Socle Astro, pages publiques, DVK Expérience en démonstration | Livré (local, non poussé) |
| 2 | ExperiencePubliée v1 (contrat), dépôt privé `dvk-projets`, `/experience/[slug]` avec le projet pilote | Livré (local, non poussé) |
| 3 | C8 performance, accessibilité, SEO, redirections ; C9 mise en ligne contrôlée | En attente d'un GO explicite |

Prérequis du jalon 3 : `docs/avant-mise-en-ligne.md`.

## Prochain chantier prévu : DVK DESIGN SYSTEM v1 + NAPKIN
**Statut : inscrit, NON démarré.** Ne démarre qu'après le GO de Kevin (le jalon 2 est livré ; ce chantier n'a pas encore été autorisé).

### Objectif
Un système visuel et éditorial unique, exploitable par des humains et par des IA, pour dvkstudio.fr, DVK Expérience, présentations, PDF, propositions clients, réseaux sociaux, infographies, supports prescripteurs et futurs produits. Le site V2 en est la première implémentation et la référence.

### Principes
- Le Design System DVK est la source de vérité. Napkin, Canva et autres sont des moteurs de production, jamais la référence.
- Partir de l'existant validé dans la V2 (couleurs, typographies, composants, statuts, ton). Ne pas redessiner arbitrairement une identité.
- Principe 80/20 : le minimum de règles pour environ 90 % de cohérence. Accélérer la production, ne pas créer de charge de maintenance. Pas de gros chantier de branding.
- Règles vérifiables, pas subjectives : MUST / SHOULD / MAY / MUST NOT (ex. « une projection porte toujours le badge Projection »).
- Une information, plusieurs supports : donnée projet → message structuré → Design System → site, DVK Expérience, LinkedIn, Instagram, présentation, PDF. Pas de recréation manuelle.

### Étapes
1. **Analyse de l'existant (lecture seule, sans toucher au site)** : ce qui est l'identité DVK, ce qui est propre au site, ce qui devient règle réutilisable, les incohérences à corriger.
2. **Design tokens** : couleurs par rôle (`--dvk-background`, `-surface`, `-text`, `-text-muted`, `-primary`, `-action`, `-border`) et statuts sémantiques (`--dvk-real`, `-estimate`, `-hypothesis`, `-projection`, `-coming`, `-warning`, appartenant au Design System) ; typographie (display, h1 à h3, body, small, caption, data, label) ; espacements, rayons, bordures, ombres, largeurs, breakpoints, motion (durées, easing, reduced-motion).
3. **Langage graphique** : photographie (une projection ne se confond jamais avec une photo réelle), plans, données (surface, budget, énergie, économies, travaux, hypothèses, conflits de sources), scénarios (le plus spectaculaire n'est pas implicitement le meilleur), provenance (Réel / Estimation / Hypothèse / Projection / À venir + source).
4. **Composants** : retenir seulement ceux à vraie valeur de réutilisation (candidats : bouton, carte, statut, source, scénario, besoin, budget, avant/après, plan, processus, comparaison, CTA).
5. **Système éditorial** : ton, longueur des titres, accroches, vocabulaire privilégié et à éviter, CTA, formulation d'une estimation, d'une information manquante, d'une incertitude. « À chiffrer » vaut mieux qu'une fausse précision.
6. **Napkin** : Napkin Brand Profile (paramètres transposables seulement) et 5 cas tests (parcours d'un projet DVK ; matrice besoins × scénarios ; répartition d'un budget travaux ; étapes d'une rénovation ; parcours prescripteur → DVK → hemea), chacun en INPUT STRUCTURÉ → CONSIGNE NAPKIN → TYPE DE VISUEL → CRITÈRES DE CONFORMITÉ. Rien n'est généré dans Napkin avant autorisation.
7. **Multi-support et règles pour IA** : déclinaison automatisable, règles exploitables par un agent.

### Livrables attendus
DVK Design System v1 ; tokens ; règles photo ; règles plans / données / graphiques ; composants ; système éditorial ; Napkin Brand Profile ; prompts et templates Napkin ; règles multi-support ; règles exploitables par IA ; liste des incohérences du site actuel.

Critère de réussite : pouvoir dire « Crée-moi une présentation DVK sur ce projet » sans réexpliquer la charte.

### À éviter (rappel du cadrage)
Gradients « IA » génériques, violet/bleu tech cliché, surcharge graphique, pictogrammes décoratifs, banques d'images impersonnelles, effets 3D gratuits, PowerPoint corporate classique, multiplication des styles selon les supports.

### Rappel
À la fin du jalon 2, rappeler à Kevin que le prochain chantier prévu est **DVK DESIGN SYSTEM v1 + NAPKIN**.
