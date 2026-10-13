# Conversion — demandes travaux hemea

Les particuliers accèdent au premier échange depuis l'accueil, la page travaux ou la page acquéreurs. Les prescripteurs conservent l'email local sans coordonnées de leur client. Le rendez-vous reste accessible immédiatement : le formulaire de demande ne conditionne jamais la réservation.

## Rendez-vous HubSpot

Le lien https://meetings-eu1.hubspot.com/kevin-de-vlieger est configuré depuis le 13 octobre 2026 pour un appel de 30 minutes. Questions obligatoires vérifiées : prénom, nom, email, téléphone, type de client, commune/code postal du bien, travaux/échéance. Confirmation et rappels 24 h et 1 h activés. Aucune réservation de recette effectuée.

## Demande web

Le formulaire DVK est proposé après un clic explicite de chargement. La valeur du champ masqué d'acquisition est relue avant affichage ; une erreur laisse les alternatives email/téléphone disponibles et ne confirme jamais une demande reçue. Le contexte contient un UUID de corrélation, la page sans query ni fragment et les cinq UTM normalisés de première origine. L'UUID client ne garantit pas l'idempotence.

Les champs secteur/échéance ajoutés le 13 octobre sont enregistrés dans HubSpot comme modifications non publiées. Le workflow web reste désactivé jusqu'à sécurisation des exclusions de tests et des demandes répétées. L'intégration et les corrections de durée de cette proposition ne sont pas déployées. Voir `docs/raccordement-hubspot.md`.

## Mesure : distinguer les preuves

| Étape | Preuve |
|---|---|
| Visite | Aucune mesure d'audience agrégée activée |
| Intention | Clic rendez-vous, téléphone ou email : signaux locaux sans collecteur |
| Brouillon préparé | Texte dans le navigateur ; ne prouve pas l'envoi |
| Demande web reçue | Soumission enregistrée dans HubSpot, jamais déduite de l'ouverture du formulaire |
| Rendez-vous réservé | Réservation HubSpot confirmée, jamais déduite d'un clic |
| Échange réalisé | Résultat renseigné après échange |
| Projet qualifié | Besoin, zone, calendrier et adéquation confirmés par Kevin |

Le site conserve l'attribution UTM jusqu'au lien HubSpot. Les signaux `dvk:conversion` existants ne contiennent ni coordonnées ni URL complète et ne sont pas envoyés à un collecteur. Aucun pixel publicitaire n'est ajouté par cette proposition.

Avant publication, recetter avec autorisation la nouvelle demande, le contact existant, le complément d'un projet, un deuxième projet, les erreurs et répétitions, la réception de notification, les UTM, la réservation, le report et l'annulation. La qualification et le transfert à hemea restent contrôlés manuellement. Aucun taux agrégé ne peut être annoncé sans mesure adaptée.
