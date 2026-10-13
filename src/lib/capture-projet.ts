import { fusionnerOrigine, lireAttribution, normaliserUtm, type Attribution } from './rdv';

export const FORMULAIRE_DVK = '3461dedf-4e70-465b-858c-d924a55fdd8c';
export const CHAMP_CONTEXTE = '0-1/dvk___contexte_acquisition__derniere_demande_';
const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

// Le stockage et les métadonnées client ne sont jamais des preuves de consentement ou d'idempotence.
export function contexteDemande(stockee: string | null, search: string, referrer: string, chemin: string, hote: string, demandeId: string) {
  let precedente: Attribution | null = null;
  try {
    const valeur = stockee ? JSON.parse(stockee) : null;
    if (valeur && typeof valeur === 'object' && !Array.isArray(valeur)) precedente = valeur;
  } catch { /* Une session illisible ne bloque pas la demande. */ }
  const origine = fusionnerOrigine(precedente, lireAttribution(search, referrer, chemin, hote));
  const utm = Object.fromEntries(UTM.flatMap(cle => {
    const valeur = typeof origine[cle] === 'string' ? normaliserUtm(origine[cle]) : undefined;
    return valeur ? [[cle, valeur]] : [];
  }));
  return JSON.stringify({
    schema: 'dvk.demande.v1', demande_id: demandeId,
    origine: 'formulaire_dvk', notice: '2026-10-13',
    page: chemin.split(/[?#]/, 1)[0].slice(0, 100),
    utm,
  });
}

export interface FormulaireV4 {
  getFormId(): string;
  setFieldValue(nom: string, valeur: string[]): void | Promise<void>;
  getFieldValue(nom: string): Promise<string | string[]>;
}

// On n'affiche le formulaire qu'après confirmation de la valeur reçue par l'API documentée.
export async function renseignerContexte(formulaire: FormulaireV4, contexte: string): Promise<boolean> {
  if (formulaire.getFormId() !== FORMULAIRE_DVK) return false;
  await formulaire.setFieldValue(CHAMP_CONTEXTE, [contexte]);
  const valeur = await formulaire.getFieldValue(CHAMP_CONTEXTE);
  return Array.isArray(valeur) ? valeur.length === 1 && valeur[0] === contexte : valeur === contexte;
}
