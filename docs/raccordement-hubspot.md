# Demandes web vers HubSpot — proposition non déployée

Compte 148248593, formulaire 3461dedf-4e70-465b-858c-d924a55fdd8c.

Le formulaire apparaît dans le bloc de premier échange des pages particuliers. Les prescripteurs conservent la préparation d'email sans saisir les coordonnées de leur client. Le formulaire se charge après une action explicite ; aucun script HubSpot de capture n'est chargé par ce composant avant ce clic. Les liens Meetings existants et leur attribution sont conservés. La durée annoncée est alignée à 30 minutes.

## Contexte de demande

`src/lib/capture-projet.ts` remplit le champ masqué `0-1/dvk___contexte_acquisition__derniere_demande_` avec un tableau contenant un JSON. Schéma `dvk.demande.v1` : `demande_id` UUID, `origine`, `notice`, chemin sans query ni fragment, cinq UTM normalisés présents dans la première origine de session. Aucune identité, URL complète ou identifiant publicitaire de clic n'y est ajouté. Les conventions de normalisation existantes sont conservées.

L'écouteur V4 est installé avant le script d'intégration. Le champ est relu après écriture avant d'afficher le formulaire. En cas de timeout, champ manquant ou chargement bloqué : message d'échec, alternatives email/téléphone, aucune confirmation de demande envoyée. L'email local reste disponible.

Documentation primaire : https://developers.hubspot.com/docs/api-reference/latest/marketing/forms/global-form-events

## Idempotence : ne pas activer le workflow existant automatiquement

L'UUID client aide au rapprochement ; il ne garantit pas l'absence de doublons. Il n'est pas un consentement et n'est pas fiable comme autorisation. Les propriétés Contact ne conservent que la dernière demande. Avant activation d'un traitement automatique, conserver un historique de soumissions côté serveur et une clé unique `(portail, formulaire, identifiant de soumission HubSpot)` dans un stockage durable. La même clé doit retrouver la tâche/demande existante ; une nouvelle soumission d'un contact existant ne doit pas créer mécaniquement un deuxième projet. La décision nouveau projet / complément d'un projet doit être explicitement qualifiée.

Le workflow web 5096053976 reste désactivé : il crée une transaction puis une tâche, sans exclusions ni traitement des répétitions démontrés. L'accès aux workflows avancés est verrouillé dans ce compte. L'écran d'automatisation Meta consulté ne permet que l'ajout à un segment. Aucun achat d'abonnement, service d'automatisation ou nouveau connecteur n'est engagé par cette proposition.

## Avant fusion et publication

- Publier séparément les changements du formulaire (secteur/échéance et aides), après validation ; le site utilise jusque-là sa version publiée.
- Valider la notice et la collecte de données avec les services effectivement chargés. Aucun pixel publicitaire ajouté par cette proposition.
- Tester le script d'intégration réel V4 et le champ masqué avec une soumission de recette explicitement autorisée, puis vérifier la notification et l'historique. Ne pas transmettre la recette à hemea.
- Vérifier nouveau contact, contact existant, complément de projet, nouveau projet du même contact et répétition réseau : ne jamais déduire une qualification du seul budget ou département.
- Conserver la transmission à hemea manuelle jusqu'à validation du projet et du périmètre des données à transmettre.
- La fusion dans `main` déclenche le déploiement GitHub Pages. Cette proposition doit rester non fusionnée tant que la publication n'est pas autorisée.

## Point séparé à examiner

Le groupe Meta « [DVK] Ciblage Oise & Somme - 28-65 ans » affiche dans HubSpot « Picardie, France » et 18–65 ans. Vérifier le ciblage natif Meta avant modification ; cette proposition ne change ni ciblage ni budget.

## Incident signalé : Habil affiche « Demande envoyée » avant la saisie

Le 13 octobre 2026, l’utilisateur signale ce blocage dans le simulateur accessible depuis dvkstudio.fr. Le site publié contient une recherche d’adresse IGN puis un lien vers app.habil.fr/dvk-studio/simulation ; il ne contient pas le formulaire final ni son état de confirmation. Le dépôt DVK ne permet donc pas de corriger cet état externe.

Un parcours navigateur neuf, sur un lieu public avec des caractéristiques fictives, a affiché les champs prénom, nom, téléphone, email et consentement aux résultats. Aucun formulaire de contact n’a été envoyé. Le blocage a ensuite été reproduit dans l’onglet concerné, y compris après rechargement et confirmation du même logement : les résultats affichent directement « Demande envoyée », sans saisie de coordonnées ni soumission pendant ce test. Le mécanisme exact reste inconnu ; ni une persistance locale ni une donnée serveur ne sont établies comme cause.

Le snippet Habil fourni par le titulaire a été vérifié : il géocode l’adresse avec IGN, puis ouvre `/dvk-studio/simulation` avec seulement `address`, `lat`, `lng` et `ban_id`. Il ne soumet pas de coordonnées, n’écrit aucun état de confirmation et n’affiche pas « Demande envoyée ». La version Astro du dépôt réalise le même passage avec validation des réponses et rendu textuel des adresses.

Les arbres des dépôts accessibles dvkstudio-site, dvk-experience, dvk-growth-os et dvk-projets ont été inspectés. Le formulaire final Habil n’y est pas disponible. `dvk-experience/src/domain/sources/habil.ts` décrit uniquement la structure d’un rapport énergétique. Aucun correctif de la logique interne de Habil n’a donc été appliqué.

Recette requise pour un correctif Habil : les résultats d’une simulation existante ne doivent pas être assimilés à une demande de contact envoyée ; une confirmation doit dépendre d’une soumission validée et confirmée par le serveur pour la demande concernée. Vérifier un nouveau visiteur sur un bien déjà simulé, une deuxième personne pour le même bien, le rechargement, une erreur réseau et une réponse serveur en échec. Ces exigences ne constituent pas un diagnostic de la ligne fautive sans accès au code.

Mesure de repli dans cette PR : lien visible sous le simulateur vers /contact/#demande-projet, indépendant de Habil. Il ne récupère pas automatiquement le résultat de simulation. La correction de l’état « Demande envoyée » doit être vérifiée côté Habil, avec la page exacte concernée et les étapes de reproduction. Aucune publication du site effectuée.
