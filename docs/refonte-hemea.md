# V2 — Chef de projet travaux hemea

Cette proposition reprend la V2 existante et sa charte. Elle cible exclusivement les particuliers et les prescripteurs immobiliers dans l'Oise et la Somme.

- Accueil recentré sur la préparation des travaux et la prise de contact.
- Parcours Particuliers, Avant d'acheter et Prescripteurs.
- Contact : 06 40 32 47 52, k.devlieger@hemea.fr, prise de rendez-vous existante.
- Immobilier désactivé ; DVK Expérience conservée en source mais ses routes ne sont plus générées.
- Ancienne URL realisations.html redirigée vers /travaux/.

## Vérifications

Après installation des dépendances : npm test, npm run build (DVK_PUBLIC_BUILD=1), npm run check:public, npm run check:site, npm run check:capacites, node scripts/check-hemea.mjs, puis test de fumée et vérification visuelle sur ordinateur et mobile.

L'environnement local de préparation ne peut pas télécharger les dépendances npm : compilation, tests Vitest et aperçu visuel restent à confirmer. Les contrôles de syntaxe des scripts et de cohérence des sources ont été réalisés ; ils ne remplacent pas ces vérifications.

La proposition ne déploie rien. Les conditions de mise en ligne déjà documentées (identité légale, usage de la marque hemea, rendez-vous et validation explicite) restent à vérifier avant publication. Aucun avis client, résultat chiffré ni photographie de chantier n'a été inventé.
