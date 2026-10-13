import { FORMULAIRE_DVK, renseignerContexte, type FormulaireV4 } from './capture-projet';

interface Environnement {
  evenements: EventTarget;
  contexte: () => string;
  formulaire: (event: Event) => FormulaireV4 | undefined;
  charger: (echec: () => void) => void;
  delaiMs?: number;
}

export function installerCapture(racine: HTMLElement, env: Environnement) {
  const bouton = racine.querySelector<HTMLButtonElement>('[data-ouvrir-formulaire]')!;
  const zone = racine.querySelector<HTMLElement>('[data-zone-formulaire]')!;
  const statut = racine.querySelector<HTMLElement>('[data-statut-capture]')!;
  let etat: 'initial' | 'chargement' | 'pret' | 'erreur' = 'initial';
  let verification = false;
  let contexte = '';
  let delai: ReturnType<typeof setTimeout>;
  const nettoyer = () => {
    clearTimeout(delai);
    env.evenements.removeEventListener('hs-form-event:on-ready', pret);
  };
  const echec = () => {
    if (etat !== 'chargement') return;
    etat = 'erreur';
    nettoyer();
    zone.hidden = true;
    zone.setAttribute('aria-busy', 'false');
    statut.textContent = 'Le formulaire ne peut pas être chargé. Votre demande n’a pas été envoyée. Contactez-nous par email ou téléphone.';
  };
  const pret = async (event: Event) => {
    if (etat !== 'chargement' || verification || (event as CustomEvent).detail?.formId !== FORMULAIRE_DVK) return;
    verification = true;
    try {
      const formulaire = env.formulaire(event);
      if (!formulaire || !await renseignerContexte(formulaire, contexte)) { echec(); return; }
      if (etat !== 'chargement') return;
      etat = 'pret';
      nettoyer();
      zone.inert = false;
      zone.removeAttribute('aria-hidden');
      zone.removeAttribute('data-chargement');
      zone.setAttribute('aria-busy', 'false');
      statut.textContent = 'Le formulaire est prêt. Votre demande sera envoyée lorsque vous validerez le formulaire.';
    } catch { echec(); }
  };
  bouton.hidden = false;
  bouton.addEventListener('click', () => {
    if (etat !== 'initial') return;
    etat = 'chargement';
    bouton.disabled = true;
    statut.textContent = 'Chargement du formulaire…';
    // Un parent display:none peut empêcher l'initialisation différée du formulaire tiers.
    // On conserve sa boîte de rendu, mais aucun champ n'est visible, lisible ou focalisable avant validation.
    zone.inert = true;
    zone.setAttribute('aria-hidden', 'true');
    zone.setAttribute('aria-busy', 'true');
    zone.setAttribute('data-chargement', 'true');
    zone.hidden = false;
    try {
      contexte = env.contexte();
      env.evenements.addEventListener('hs-form-event:on-ready', pret);
      delai = setTimeout(echec, env.delaiMs ?? 25000);
      env.charger(echec);
    } catch { echec(); }
  });
}
