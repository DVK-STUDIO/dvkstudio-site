# Médias photographiques : registre, droits, stand-ins

**Principe : le réel attire, la projection donne envie, les repères expliquent, les travaux rendent la transformation crédible, l'enveloppe aide à décider.** Le langage architectural (filets, trame, numéros) reste une couche de lecture posée sur le réel.

## Livraison dormante
Tant qu'aucun média n'est marqué « confirmés » dans `src/content/medias.ts`, le site public reste celui sans photographie : hero avec plan, chaîne horizontale, heros de `/immobilier/` et `/acquereurs/` typographiques, aucune image sur `/travaux/`. **Aucun emplacement vide, aucune image pour remplir.**

## Où est quoi
| Quoi | Où |
|---|---|
| Registre des médias (fichiers, alt, repères, lots, provenance, droits) | `src/content/medias.ts` |
| Fichiers de production | `src/assets/medias/` |
| Résolution et règles (droits, paire, repères) | `src/lib/medias.ts` |
| Comparateur du hero (EXISTANT ↔ PROJECTION) | `src/components/BeforeAfter.astro` |
| Chaîne au défilement (5 étapes) | `src/components/TransformationChaine.astro`, logique `src/lib/transformation.ts` |
| Bien existant + repères de potentiel | `src/components/PhotoAnnotee.astro` (`/immobilier/`, `/acquereurs/`) |
| Matière chantier | `src/components/MatiereChantier.astro` (`/travaux/`) |

## Ajouter la paire signature (petit commit éditorial)
1. Déposer `hero-avant.*` et `hero-apres.*` dans `src/assets/medias/`.
2. Dans `registre.paire` : alt, repères du hero (2 au plus, sur la projection), repères de potentiel (4 au plus, sur l'existant), lots A–D (statuts et ordre de grandeur, jamais de montant), puis `droits: { statut: "confirmes", reference, date }`.
3. `npm run build` : le build refuse si la référence ou la date manquent, si les deux images n'ont pas exactement les mêmes dimensions, ou si la largeur est inférieure à 1600 px.

**Cible de production du hero signature : 2400 × 2000 minimum, même bien, même cadrage, même perspective, existant réellement photographié, projection identifiable comme telle, aucun élément personnel inutile dans l'image, droits confirmés avant publication.**

Les autres photographies (`chantier`, `immobilier`, `acquereurs`) n'ont pas de plancher de taille : seule la paire du comparateur exige l'identité des dimensions.

## Chantier : jamais de fausse continuité
Toute image de chantier déclare sa provenance : `meme-projet` (« Chantier du projet présenté ») ou `autre-projet` (« Illustration · chantier d'un autre projet »).

## Stand-ins (développement local uniquement)
`npm run dev:standins` active des images provisoires déposées dans `src/assets/standins/` (ignoré par Git). Elles portent la mention « STAND-IN · HORS PRODUCTION ». **Elles ne peuvent entrer dans aucun build** : un build avec `DVK_STANDINS=1` échoue, et le module qui les liste est vidé par `astro.config.mjs` hors du serveur de développement.

## Performance et accessibilité
- Formats modernes (AVIF puis WebP), `srcset` de 480 à 1600 px, `sizes` adaptées, dimensions explicites (pas de décalage de mise en page).
- Image critique du hero sans chargement différé et en priorité haute ; médias sous la ligne de flottaison en chargement différé.
- **Budget du hero** : environ 400 Ko de chargement initial en mobile (variantes ~800 px des deux images du comparateur). Contrôlé par `npm run check:medias`.
- Natif d'abord : curseur `<input type="range">`, balayage d'invitation en CSS (une seule fois). `prefers-reduced-motion` : ni balayage ni défilement épinglé ; les étapes de la chaîne se choisissent au clic ou au clavier. Sans JavaScript, les cinq étapes restent lisibles.

## Contrôles
`npm run check:medias` (build : aucun stand-in, aucun emplacement vide, aucun montant dans la chaîne, aucun EXIF, dimensions et budget du hero) et `npm run check:modes-medias` (constructions réelles : dormant, stand-ins refusés, paire fictive confirmée, dimensions différentes refusées, droits sans justificatif refusés). Tous deux sont dans `npm run verifier:golive`.

## Photo d'ambiance du hero (charte « Atelier · hemea »)
`registre.ambiance` (`src/assets/medias/ambiance.jpg`) : photo d'illustration plein écran de l'accueil, sous un voile sombre, avec la mention « Photo d'illustration. ». Droits confirmés par Kévin DE VLIEGER le 11/10/2026 (à archiver avec les autres justificatifs). Elle est décorative (alt vide) et n'est jamais présentée comme un chantier réalisé. Elle ne compte pas dans le budget du comparateur (`data-hero-image`) : elle porte `data-hero-ambiance`.
