import { describe, expect, it, vi } from 'vitest';
import { contexteDemande, renseignerContexte, FORMULAIRE_DVK, CHAMP_CONTEXTE } from './capture-projet';

describe('contexte de demande', () => {
  const creer = (stockee: string | null, search = '') => JSON.parse(contexteDemande(stockee, search, '', '/contact/?email=prive', 'dvkstudio.fr', 'demande-test'));
  it('conserve les cinq UTM de première origine sans transmettre les champs inconnus', () => {
    const valeur = creer(JSON.stringify({ utm_source:'meta', utm_medium:'paid', utm_campaign:'renovation-2026', utm_content:'ad-7', utm_term:'travaux', atterrissage:'/travaux/', email:'secret', gclid:'secret', a1:'secret' }), '?utm_source=google');
    expect(valeur.utm).toEqual({ utm_source:'meta', utm_medium:'paid', utm_campaign:'renovation-2026', utm_content:'ad-7', utm_term:'travaux' });
    expect(JSON.stringify(valeur)).not.toContain('secret');
    expect(valeur.page).toBe('/contact/');
    expect(valeur.demande_id).toBe('demande-test');
  });
  it('supporte stockage indisponible, invalide et sans campagne sans inventer de source', () => {
    for (const origine of [null, '{', '[]', '42']) expect(creer(origine).utm).toEqual({});
    expect(creer('{', '?utm_source=Meta').utm).toEqual({utm_source:'meta'});
  });
  it('ne met jamais le contexte d’une autre demande dans le champ du contact', async () => {
    const set = vi.fn();
    expect(await renseignerContexte({getFormId:()=> 'autre', setFieldValue:set, getFieldValue:async()=>''}, '{}')).toBe(false);
    expect(set).not.toHaveBeenCalled();
  });
  it('vérifie le champ masqué après écriture et refuse une valeur non reçue', async () => {
    const set = vi.fn();
    const api = {getFormId:()=>FORMULAIRE_DVK, setFieldValue:set, getFieldValue:async()=>['contexte']};
    expect(await renseignerContexte(api, 'contexte')).toBe(true);
    expect(set).toHaveBeenCalledWith(CHAMP_CONTEXTE, ['contexte']);
    expect(await renseignerContexte({...api,getFieldValue:async()=>['ancien']}, 'contexte')).toBe(false);
  });
});
