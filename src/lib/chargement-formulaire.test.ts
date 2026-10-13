import { afterEach, describe, expect, it, vi } from 'vitest';
import { installerCapture } from './chargement-formulaire';
import { FORMULAIRE_DVK, CHAMP_CONTEXTE } from './capture-projet';

// Contrat DOM minimal : tests hors navigateur, aucune requête réseau ni soumission CRM.
class ElementTest extends EventTarget {
  hidden = true; inert = false; disabled = false; textContent = '';
  attributs = new Map<string, string>();
  setAttribute(nom: string, valeur: string) { this.attributs.set(nom, valeur); }
  removeAttribute(nom: string) { this.attributs.delete(nom); }
}
function scenario(options: {valeur?: string; rejeter?: boolean; sansApi?: boolean; erreurChargement?: boolean; contexteErreur?: boolean; suspendre?: boolean} = {}) {
  const bouton = new ElementTest(); const zone = new ElementTest(); const statut = new ElementTest();
  const elements: Record<string, ElementTest> = {'[data-ouvrir-formulaire]':bouton,'[data-zone-formulaire]':zone,'[data-statut-capture]':statut};
  const racine = {querySelector:(cle:string)=>elements[cle]} as unknown as HTMLElement;
  const evenements = new EventTarget();
  let terminerLecture: (valeur: string[]) => void = () => {};
  const set = vi.fn();
  const api = {getFormId:()=>FORMULAIRE_DVK, setFieldValue:set, getFieldValue: async () => {
    if (options.rejeter) throw new Error('SDK indisponible');
    if (options.suspendre) return new Promise<string[]>(resolve => { terminerLecture = resolve; });
    return [options.valeur ?? 'contexte-test'];
  }};
  let echecChargement = () => {};
  const charger = vi.fn((echec:()=>void) => { echecChargement=echec; if(options.erreurChargement)echec(); });
  installerCapture(racine, {evenements, contexte:()=>{if(options.contexteErreur)throw new Error('UUID indisponible'); return 'contexte-test';}, formulaire:()=> options.sansApi ? undefined : api, charger});
  return {bouton,zone,statut,charger,set,terminerLecture:(v:string[])=>terminerLecture(v),echec:()=>echecChargement(),clic:()=>bouton.dispatchEvent(new Event('click')),pret:(formId=FORMULAIRE_DVK)=>evenements.dispatchEvent(new CustomEvent('hs-form-event:on-ready',{detail:{formId}}))};
}
afterEach(()=>vi.useRealTimers());
describe('chargement du formulaire', () => {
  it('ne charge rien avant clic et ne charge qu’une fois malgré un double clic', () => {
    vi.useFakeTimers(); const s=scenario();
    expect(s.charger).not.toHaveBeenCalled(); expect(s.zone.hidden).toBe(true);
    s.clic(); s.clic(); expect(s.charger).toHaveBeenCalledTimes(1);
    expect(s.zone.hidden).toBe(false); expect(s.zone.inert).toBe(true);
    expect(s.zone.attributs.get('aria-hidden')).toBe('true');
    expect(s.zone.attributs.get('data-chargement')).toBe('true');
  });
  it('ignore un autre formulaire puis n’autorise la saisie qu’après relecture du contexte', async () => {
    vi.useFakeTimers(); const s=scenario(); s.clic(); s.pret('autre'); expect(s.set).not.toHaveBeenCalled();
    s.pret(); await vi.advanceTimersByTimeAsync(0);
    expect(s.set).toHaveBeenCalledWith(CHAMP_CONTEXTE,['contexte-test']);
    expect(s.zone.inert).toBe(false); expect(s.zone.hidden).toBe(false);
    expect(s.zone.attributs.has('aria-hidden')).toBe(false);
    expect(s.zone.attributs.has('data-chargement')).toBe(false);
    expect(s.statut.textContent).toContain('sera envoyée');
    await vi.advanceTimersByTimeAsync(26000); s.echec();
    expect(s.zone.hidden).toBe(false);
  });
  it.each([{sansApi:true},{valeur:'ancien'},{rejeter:true},{erreurChargement:true},{contexteErreur:true}])('cache les champs et annonce aucun envoi en cas d’échec : %j',async options=>{
    vi.useFakeTimers(); const s=scenario(options); s.clic(); s.pret(); await vi.advanceTimersByTimeAsync(0);
    expect(s.zone.hidden).toBe(true); expect(s.statut.textContent).toContain('n’a pas été envoyée');
  });
  it('un délai dépassé ne peut pas être annulé par une réponse SDK tardive',async()=>{
    vi.useFakeTimers(); const s=scenario({suspendre:true}); s.clic(); s.pret(); await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(25000); s.terminerLecture(['contexte-test']); await vi.advanceTimersByTimeAsync(0);
    expect(s.zone.hidden).toBe(true); expect(s.statut.textContent).toContain('n’a pas été envoyée');
  });
});
