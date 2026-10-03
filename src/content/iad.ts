// Contenus dépendant du statut de mandataire IAD France. ISOLÉS ici : aucune page publique ne doit les citer en dur.
// Ils ne sont lus que si `capacites.iad` vaut true (src/content/capacites.ts). Rien n'est supprimé : réactivation = un interrupteur.
// Aucune valeur inventée : tout champ non confirmé reste « [à compléter] » (le contrôle de mise en ligne bloque alors).
import { A_COMPLETER } from "./site";

export const reglementaire = {
  reseau: "IAD France",
  carteProfessionnelle: A_COMPLETER,
  garantieFinanciere: A_COMPLETER,
  assuranceRcp: A_COMPLETER,
  registreMandataires: A_COMPLETER,
};

export const iad = {
  navigation: [{ libelle: "Immobilier", href: "/immobilier/" }],

  accueil: {
    description: "Un seul interlocuteur pour votre projet immobilier : vendre, acheter, rénover. DVK Studio révèle le potentiel d'un bien et cadre travaux et budget, dans l'Oise.",
    entree: { titre: "Je vends", texte: "Estimer et valoriser mon bien.", lien: "Estimer mon bien →", href: "/immobilier/#vendre" },
    faq: { q: "Quel est le rôle d'IAD et de hemea ?", r: "Ce sont les réseaux que DVK Studio mobilise selon votre besoin : IAD France pour l'achat et la vente, hemea pour l'accompagnement des travaux. Vous gardez un seul interlocuteur, et chaque rôle vous est expliqué avant tout engagement." },
    confiance: "Je suis aussi mandataire immobilier du réseau IAD France.",
  },

  aPropos: {
    description: "DVK Studio est le nom sous lequel Kevin De Vlieger exerce, en Oise : mandataire immobilier du réseau IAD France et chef de projet travaux hemea.",
    chapo: "Kevin De Vlieger, basé à Gannes, dans l'Oise. J'accompagne les projets immobiliers de la décision aux travaux : acheter, vendre, rénover. Je suis aussi mandataire immobilier du réseau IAD France.",
    blocTitre: "Immobilier",
    blocTexte: (reseau: string) => `Acheter ou vendre un bien, en tant que mandataire du réseau ${reseau}. Les informations réglementaires de cette activité figurent dans les`,
  },

  cgv: "Les prestations de mandataire immobilier et d'accompagnement de travaux relèvent de leurs propres conditions, communiquées avant tout engagement.",

  mentions: {
    description: "Mentions légales du site dvkstudio.fr : éditeur, activité de mandataire immobilier, hébergeur.",
  },
};
