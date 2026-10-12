# Conversion — version hemea

## Deux publics, une prochaine étape claire

- Particuliers : accueil → travaux (ou acquéreurs) → premier échange.
- Prescripteurs : lien LinkedIn ou prise de contact → professionnels → échange sur un projet client.
- Le rendez-vous reste accessible immédiatement. La préparation d’un email est facultative et ne conditionne jamais la réservation.
- Le premier écran précise le besoin, la zone, l’interlocuteur et l’utilité de l’échange. Le plan illustratif explique la démarche plus bas ; il n’est pas présenté comme une réalisation.

## Qualification réelle

Le 12 octobre 2026, la prise de rendez-vous est passée de Calendly à HubSpot (https://meetings-eu1.hubspot.com/kevin-de-vlieger). Les paragraphes ci-dessous décrivent l’ancienne configuration Calendly : questions et durée à reproduire dans la page de réunion HubSpot.

Calendly a été vérifié en lecture seule le 11 octobre 2026. Le rendez-vous « Premier contact » est actif, dure 30 minutes et se fait par appel entrant au 06 40 32 47 52. Il n’est pas payant. Le site est aligné sur ces informations.

Questions déjà actives : type de bien (obligatoire), localisation (obligatoire), délai (facultatif), budget indicatif (obligatoire, avec « Budget en cours de définition »), précision libre (facultative). Le stade d’avancement est désactivé. Aucun réglage Calendly n’a été modifié.

La préparation locale d’un email demande la commune, la situation, le calendrier et les travaux. Aucun enregistrement ni envoi automatique : le visiteur relit et envoie depuis sa messagerie. Ce parcours ne confirme donc jamais une demande reçue.

## Mesure : bien séparer les étapes

| Étape | Preuve | Statut de cette version |
|---|---|---|
| Visite | Mesure d’audience agrégée | Non activée |
| Intention de contact | Clic rendez-vous, téléphone, email | Signaux locaux disponibles, aucun collecteur connecté |
| Brouillon préparé | Préparation du message dans le navigateur | Signal local, aucune preuve d’envoi |
| Demande reçue | Email effectivement reçu ou appel pris | À enregistrer dans le suivi commercial existant |
| Rendez-vous réservé | Réservation Calendly confirmée | Source Calendly, jamais déduite d’un clic |
| Échange réalisé | Résultat renseigné après l’échange | À enregistrer dans le suivi commercial existant |
| Projet qualifié | Besoin, zone, calendrier et adéquation confirmés | Décision commerciale après échange |

Le site conserve l’attribution UTM existante jusqu’au lien Calendly. Les signaux `dvk:conversion` sont limités à page_vue, rdv_ouvert, appel_ouvert, email_ouvert et brouillon_prepare. Ils ne contiennent ni données de formulaire, ni URL complète, ni identité. Ils ne sont ni stockés ni envoyés. Aucun taux de conversion agrégé ne peut être annoncé avant raccordement d’une mesure adaptée.

## Exploitation après publication

Chaque semaine, distinguer particuliers et prescripteurs : demandes reçues, réservations, annulations, échanges réalisés, projets qualifiés et raison de non-adéquation. Dédupliquer les demandes d’une même personne dans le suivi existant. Conserver la source lorsqu’elle est connue et laisser « inconnue » sinon.

Calculer échanges réalisés / rendez-vous arrivés à échéance (annulations séparées), puis projets qualifiés / échanges réalisés. Le taux visiteurs → réservations nécessite une mesure d’audience et un périmètre temporel cohérents ; il n’est pas disponible dans cette version.

Avant publication : vérifier le formulaire de préparation avec et sans JavaScript, le lien mailto dans la messagerie, la réservation sans effectuer de fausse réservation, les contenus et contrastes sur mobile, puis les contrôles de build. Les témoignages, photos et résultats commerciaux ne seront ajoutés qu’à partir de preuves réelles et autorisées.
