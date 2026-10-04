// Contenus de la capacité Immobilier : socle commun + variantes minimales par mode (orientation / mandataire).
// Seul fichier de contenu à citer le réseau. Les pages importent ces textes ; aucune ne cite le réseau en dur.
// « orientation » = dégradation contrôlée de la page « mandataire » : mêmes sections, mêmes composants.
// Texte hors périmètre de l'un des modes : écrit dans la branche de l'autre uniquement (voir `choisir`).
import { mandataireActif } from "./capacites";
import { reseau, reglementaire, verrouMandataire } from "./iad";

// Verrou : le mode « mandataire » ne se construit pas avec des données réglementaires incomplètes ou non validées.
if (mandataireActif) {
  const erreur = verrouMandataire(reglementaire);
  if (erreur) throw new Error(erreur);
}

const choisir = <T>(orientation: T, mandataire: T): T => (mandataireActif ? mandataire : orientation);
const R = reseau.nom;
const Q = reglementaire.qualite;

type Etape = { titre: string; texte: string };
type Question = { q: string; r: string };

export const page = {
  titre: choisir("Immobilier et travaux dans l'Oise", "Vendre ou acheter dans l'Oise, travaux compris"),
  description: choisir(
    "Comprendre le potentiel d'un bien et anticiper ses travaux dans l'Oise : DVK Studio relie immobilier et rénovation dans un même parcours.",
    "Vendre ou acheter un bien dans l'Oise avec DVK Studio : potentiel du bien, travaux envisageables et enveloppe indicative réunis dans un même parcours.",
  ),

  hero: {
    surtitre: "Immobilier · Oise",
    titre: "Un projet immobilier ne s'arrête pas au prix du bien.",
    chapo: "Vendre, acheter, comprendre le potentiel d'un bien et anticiper ses travaux : DVK Studio réunit immobilier et rénovation dans un même parcours.",
    vendre: "Je souhaite vendre",
    acheter: "Je souhaite acheter",
    ligne: "Basé à Gannes, dans l'Oise. Premier échange de vingt minutes, sans engagement.",
  },

  approche: {
    surtitre: "L'approche DVK Studio",
    titre: "Un bien avec travaux est plus difficile à comprendre.",
    blocs: [
      { titre: "Pour celui qui vend", texte: "Un bien daté ou à rénover peut être plus difficile à comprendre et à projeter pour un acquéreur, qui voit d'abord ce qui manque avant d'imaginer ce qui est possible." },
      { titre: "Pour celui qui achète", texte: "Devant un bien à rénover, la vraie question est ce qu'on peut transformer et quelle enveloppe de travaux envisager. En visite, la réponse manque souvent." },
      {
        titre: "Ce que fait DVK Studio",
        texte: choisir(
          `Je crée la continuité entre l'immobilier et les travaux. Je suis chef de projet travaux hemea, et je rejoins le réseau ${R} pour l'immobilier. Le potentiel du bien, les travaux envisageables et une première enveloppe indicative sont présentés au même endroit, avec leur niveau de certitude.`,
          `Je crée la continuité entre l'immobilier et les travaux. Pour l'immobilier, j'interviens en tant que ${Q} du réseau ${R}. Pour les travaux, je suis chef de projet travaux hemea. Le potentiel du bien, les travaux envisageables et une première enveloppe indicative sont présentés au même endroit, avec leur niveau de certitude.`,
        ),
      },
    ],
    chaine: [
      { titre: "Le bien", texte: "Le comprendre tel qu'il est." },
      { titre: "Son potentiel", texte: "Voir ce qu'il peut devenir." },
      { titre: "Ses travaux", texte: "Les cadrer, avec une enveloppe indicative." },
      { titre: "Votre projet", texte: "Le poursuivre, côté immobilier comme côté travaux." },
    ] as Etape[],
  },

  experience: {
    surtitre: "DVK Expérience",
    titre: "Une page claire pour chaque bien.",
    intro: "Pour un bien avec travaux, DVK Expérience fait ce que la visite ne permet pas toujours : montrer le bien tel qu'il est, puis ce qu'il pourrait devenir.",
    points: [
      "Le bien actuel.",
      "Des pistes de transformation et des projections pour s'y voir.",
      "Les travaux envisageables.",
      "Une enveloppe indicative, lorsque les éléments le permettent.",
    ],
    limites: "Les projections sont des outils pour comprendre. Elles ne constituent ni une étude de faisabilité, ni des plans d'architecte, ni un engagement technique.",
    cta: "Voir un exemple",
    legendeTitre: "Ce que veulent dire les statuts",
    legende: [
      { statut: "reel" as const, texte: "Constaté ou mesuré, avec sa source." },
      { statut: "estimation" as const, texte: "Ordre de grandeur, à confirmer après visite." },
      { statut: "hypothese" as const, texte: "Lecture de DVK Studio, à vérifier." },
      { statut: "manquant" as const, libelle: "À chiffrer", texte: "Pas encore établi : rien n'est inventé." },
    ],
  },

  vendre: {
    surtitre: "Je vends",
    titre: "Un bien avec travaux ne doit pas obliger l'acquéreur à tout imaginer seul.",
    chapo: choisir(
      "Votre bien est daté, à rafraîchir ou à rénover ? Je le rends plus compréhensible, notamment avec DVK Expérience. Pour la vente elle-même, nous voyons ensemble comment avancer.",
      `Votre bien est daté, à rafraîchir ou à rénover ? Je le rends plus compréhensible grâce à DVK Expérience, puis je le commercialise dans le cadre ${R}.`,
    ),
    etapes: [
      {
        titre: "Comprendre votre projet",
        texte: choisir(
          "Échange sur votre projet de vente et visite du bien.",
          "Échange sur votre projet de vente, visite du bien et avis de valeur.",
        ),
      },
      { titre: "Lire le potentiel travaux", texte: "État du bien, transformations possibles, travaux envisageables et, lorsque c'est possible, une enveloppe indicative." },
      { titre: "Aider les acquéreurs à se projeter", texte: "Ils voient le bien tel qu'il est et ce qu'il peut devenir, chaque information étant marquée Réel, Estimation, Hypothèse ou À chiffrer." },
      {
        titre: "Commercialiser",
        texte: choisir(
          "La mise en vente est confiée à un professionnel immobilier habilité. Nous voyons ensemble comment avancer.",
          `Mise en vente dans le cadre ${R}, après signature d'un mandat. Les honoraires vous sont communiqués avant tout engagement.`,
        ),
      },
      { titre: "Relayer vers les travaux", texte: "Si l'acquéreur le souhaite, il peut être accompagné par un chef de projet travaux hemea pour cadrer ses travaux." },
    ] as Etape[],
    cta: choisir("Échanger sur mon projet de vente", "Parler de mon projet de vente"),
  },

  acheter: {
    surtitre: "J'achète",
    titre: "Acheter un bien à rénover, en sachant ce qu'il peut devenir.",
    etapes: [
      { titre: "Découvrir votre projet", texte: "Vos critères, votre calendrier, ce que vous voulez faire du bien." },
      {
        titre: "Sélectionner et visiter",
        texte: choisir(
          "Recherche et visites avec un professionnel habilité ; je vous aide à lire chaque bien sous l'angle des travaux.",
          `Recherche et visites dans le cadre ${R}.`,
        ),
      },
      { titre: "Comprendre le potentiel travaux", texte: "Ce qui peut être transformé, présenté comme une hypothèse et non comme une étude de faisabilité." },
      { titre: "Première enveloppe indicative", texte: "Vous disposez d'une première enveloppe, lorsque les éléments le permettent. Sinon elle reste « À chiffrer »." },
      {
        titre: "Acquérir",
        texte: choisir(
          "La transaction se déroule avec un professionnel immobilier habilité.",
          `La transaction se déroule dans le cadre ${R}, de l'offre à la signature.`,
        ),
      },
      { titre: "Poursuivre avec les travaux", texte: "Si vous le souhaitez, je cadre vos travaux avec vous et vous aide à consulter des entreprises labellisées hemea." },
    ] as Etape[],
    zoom: "Comprendre un bien à rénover avant d'acheter →",
    cta: "Parler de mon projet d'achat",
  },

  qui: {
    titre: "Un interlocuteur, des rôles clairement séparés.",
    colonnes: [
      {
        titre: "Kevin De Vlieger · DVK Studio",
        texte: "DVK Studio est le nom sous lequel j'exerce mes activités. Je reste votre interlocuteur tout au long du parcours, avec des rôles clairement séparés entre immobilier et travaux.",
      },
      {
        titre: `Immobilier · ${R}`,
        texte: choisir(
          `Je rejoins le réseau ${R}, qui sera le cadre de mon activité immobilière. Aujourd'hui, je ne réalise pas de transaction immobilière : pour cette partie, nous voyons ensemble comment avancer avec un professionnel habilité.`,
          `Pour vendre ou acheter, j'interviens en tant que ${Q} du réseau ${R}. C'est le cadre de mon activité immobilière. DVK Studio n'est ni une agence ${R}, ni une société du réseau.`,
        ),
      },
      {
        titre: "Travaux · hemea",
        texte: "Je suis chef de projet travaux hemea et j'exerce sous le nom DVK Studio. Je cadre votre projet et vous aide à consulter des entreprises labellisées hemea.",
      },
    ],
  },

  faq: [
    {
      q: `Qui est mon interlocuteur ? DVK Studio est-elle une agence ${R} ?`,
      r: choisir(
        `Votre interlocuteur, c'est moi, Kevin De Vlieger. DVK Studio est le nom sous lequel j'exerce. Je suis chef de projet travaux hemea et je rejoins le réseau ${R} pour l'immobilier. DVK Studio n'est pas une agence ${R}.`,
        `Votre interlocuteur, c'est moi, Kevin De Vlieger. DVK Studio est le nom sous lequel j'exerce. Ce n'est pas une agence ${R}. Pour la partie immobilière, j'interviens en tant que ${Q} du réseau.`,
      ),
    },
    {
      q: "Mon bien se vendra-t-il plus vite ou plus cher ?",
      r: "Je ne peux pas le promettre. Ce que je peux faire, c'est rendre le bien plus lisible pour les acquéreurs : son état, son potentiel, les travaux envisageables.",
    },
    {
      q: "Faites-vous les travaux ?",
      r: "Non. Je ne suis ni maître d'œuvre ni assistant à maîtrise d'ouvrage, et je ne réalise pas les travaux : ils sont exécutés par des entreprises labellisées hemea. DVK Studio ne garantit personnellement ni ces entreprises ni leurs prix ou leurs travaux.",
    },
    {
      q: "Les budgets de travaux sont-ils des devis ?",
      r: "Non. Ce sont des estimations indicatives, avec leurs hypothèses et leurs limites. Un devis ne vient qu'avec les entreprises consultées.",
    },
    {
      q: "Donnez-vous un conseil financier ou en investissement ?",
      r: "Non. Je n'interviens ni comme conseiller financier, ni comme conseiller juridique, ni comme conseiller en investissement immobilier.",
    },
    {
      q: "Combien cela coûte-t-il ?",
      r: choisir(
        "Le premier échange de vingt minutes est sans engagement. Si une transaction est envisagée, le professionnel concerné vous communique ses conditions avant tout engagement.",
        `Le premier échange de vingt minutes est sans engagement. Les honoraires de l'activité immobilière figurent dans le barème ${R}, remis avant tout engagement et rappelé dans le mandat.`,
      ),
    },
    {
      q: "Où intervenez-vous ?",
      r: choisir(
        "Je suis basé à Gannes, et je travaille autour de Saint-Just-en-Chaussée et dans l'Oise.",
        "Je suis basé à Gannes, et je travaille autour de Saint-Just-en-Chaussée et dans l'Oise. Pour un bien situé ailleurs, nous regardons ensemble ce que le réseau permet.",
      ),
    },
  ] as Question[],

  cloture: {
    titre: "Parlons de votre bien.",
  },
};

// Adaptations strictement nécessaires des autres pages.
export const accueil = {
  entreeAchat: {
    titre: "J'achète",
    texte: "Comprendre le potentiel d'un bien et le coût des travaux avant de signer, pour l'habiter ou le louer.",
    lien: "Analyser un bien →",
    href: "/acquereurs/",
  },
  entreeVente: {
    titre: "Je vends",
    texte: "Vendre un bien dont les travaux freinent les acquéreurs.",
    lien: choisir("Échanger sur ma vente →", "Parler de ma vente →"),
    href: "/immobilier/#vendre",
  },
  lignePro: { texte: "Vous êtes agent, courtier ou prescripteur ?", lien: "Envoyer une annonce →", href: "/professionnels/" },
  faq: {
    q: `Quel est le rôle d'${R} et de hemea ?`,
    r: choisir(
      `hemea est le cadre de l'accompagnement des travaux. Pour l'immobilier, je rejoins le réseau ${R}. Vous gardez un interlocuteur, avec des rôles clairement séparés.`,
      `${R} est le cadre de mon activité immobilière (achat et vente), hemea celui de l'accompagnement des travaux. Vous gardez un interlocuteur, avec des rôles clairement séparés.`,
    ),
  },
  confiance: choisir(`Pour l'immobilier, je rejoins le réseau ${R}.`, `Pour l'immobilier, j'interviens en tant que ${Q} du réseau ${R}.`),
};

export const aPropos = {
  description: choisir(
    "DVK Studio est le nom sous lequel Kevin De Vlieger exerce, en Oise, comme chef de projet travaux hemea : cadrage, budget et consultation d'entreprises.",
    `DVK Studio est le nom sous lequel Kevin De Vlieger exerce, en Oise : ${Q} du réseau ${R} et chef de projet travaux hemea.`,
  ),
  chapo: choisir(
    `Kevin De Vlieger, basé à Gannes, dans l'Oise. J'accompagne les projets de rénovation, y compris l'achat d'un bien à rénover, de la décision aux travaux. Pour l'immobilier, je rejoins le réseau ${R}.`,
    `Kevin De Vlieger, basé à Gannes, dans l'Oise. J'accompagne les projets immobiliers de la décision aux travaux : acheter, vendre, rénover. Pour l'immobilier, j'interviens en tant que ${Q} du réseau ${R}.`,
  ),
  bloc: {
    titre: "Immobilier",
    texte: choisir(
      `Un projet immobilier ne s'arrête pas au prix du bien : je relie l'immobilier et les travaux. Je rejoins le réseau ${R} pour la partie immobilière.`,
      `Vendre ou acheter un bien, en tant que ${Q} du réseau ${R}. Les informations réglementaires de cette activité figurent dans les`,
    ),
    lien: choisir({ libelle: "Voir la page Immobilier", href: "/immobilier/" }, { libelle: "mentions légales", href: "/mentions-legales/" }),
  },
};

export const mentions = {
  description: `Mentions légales du site dvkstudio.fr : éditeur, activité de mandataire immobilier, accompagnement des travaux, hébergeur.`,
};

// Accompagnement des acquéreurs : seule la mention de la transaction change avec le mode.
export const faqAcquereurConseil = choisir(
  "Non. L'accompagnement porte sur les travaux à envisager. DVK Studio ne donne pas de conseil financier, juridique ou en investissement immobilier, et n'intervient pas dans la transaction d'achat.",
  `Non. L'accompagnement porte sur les travaux à envisager. DVK Studio ne donne pas de conseil financier, juridique ou en investissement immobilier. Selon votre projet, je peux aussi vous accompagner dans la recherche et l'achat dans le cadre ${R}.`,
);

export { reglementaire, reseau };
