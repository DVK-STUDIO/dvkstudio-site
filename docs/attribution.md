# Attribution entrante : conventions et comportement

Source : `src/lib/calendly.ts` (fonctions pures, tests dans `src/lib/calendly.test.ts`). Aucun cookie : l'origine vit dans `sessionStorage` et ne part que dans l'URL Calendly ouverte par le visiteur.

## Ce qui part vers Calendly

Uniquement cinq paramètres `utm_*`. Aucun `gclid`, aucun paramètre personnalisé `a1..a10` (ils préremplissent les questions visibles du formulaire Calendly).

| Paramètre | Valeur |
|---|---|
| `utm_source` | origine ; à défaut hôte du référent ; à défaut `direct` |
| `utm_medium` | origine ; à défaut `referral` ou `none` |
| `utm_campaign` | origine, si présente |
| `utm_content` | valeur d'origine conservée telle quelle. Sans valeur d'origine : `dvk.[offre.]page.bouton` |
| `utm_term` | mot-clé de campagne d'origine uniquement. Jamais rempli par le site |

Le préfixe `dvk.` distingue un bouton du site d'une valeur publicitaire (Meta, Google).

## Convention de campagne (offre d'origine)

| Préfixe de `utm_campaign` | Offre d'origine |
|---|---|
| `renovation-` | Rénovation / Travaux |
| `achat-travaux-` | Achat + Travaux |

Sans préfixe, l'offre d'origine est déduite de la page d'arrivée (`/travaux/` → `renovation`, `/acquereurs/` → `achat_travaux`). Le préfixe prime sur la page.

Cette offre est une **origine**. Le besoin réellement qualifié (`travaux`, `immobilier`, `mixte`) est établi dans Growth à la qualification et peut différer : les deux champs ne se confondent jamais.

## Normalisation et valeurs incompatibles

Format imposé par Growth/Core : `^[a-z0-9][a-z0-9._-]{0,119}$`.

| Entrée | Sortie |
|---|---|
| vide ou blanche | rien n'est transmis |
| casse, accents, espaces de bord seulement | valeur pliée, sans marque (`Rénovation` → `renovation`) |
| tout autre écart (caractère remplacé, espace, troncature) | valeur nettoyée + `-h` + 7 caractères base 36 calculés sur la valeur pliée |
| aucun caractère exploitable (`###`) | `invalide-h…` |

Garanties :
- Deux valeurs différentes (au-delà de la casse et des accents) ne deviennent jamais identiques : `a b` → `a-b-h…`, distinct de `a-b`.
- Une valeur incompatible n'est ni supprimée, ni remplacée par l'identifiant d'un bouton.
- La normalisation est idempotente.
- La marque `-h…` signale qu'une valeur a été altérée : à corriger à la source (nom de campagne), pas à ignorer.

Conseil pour les annonces : nommer les campagnes directement dans le format (minuscules, chiffres, `.`, `_`, `-`) pour ne jamais produire de marque.

## Hors périmètre de ce module
- Aucune lecture ni transmission du `gclid` tant que le consentement n'est pas en place.
- Aucun événement navigateur, aucune intégration GA4, Ads ou Meta.
- La remontée des réservations vers Growth (polling Calendly) est une étape distincte.
