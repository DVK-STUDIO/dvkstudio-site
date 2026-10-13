export const HABIL_SIMULATION = 'https://app.habil.fr/dvk-studio/simulation';
import { normaliserUtm, type Attribution } from './rdv';

/** Contexte de collecte : liste fermée, sans URL complète, coordonnées ni contenu libre du formulaire. */
export function contexteDemande(requestId: string, origin: Attribution): string {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(requestId)) {
    throw new Error('Identifiant de demande invalide');
  }
  const context: Record<string, string | number> = { schema: 1, request_id: requestId, source: 'formulaire_dvk', notice: 'dvk-demande-2026-10-13' };
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const) {
    const value = normaliserUtm(origin[key]);
    if (value) context[key] = value;
  }
  return JSON.stringify(context);
}
export interface AdresseHabil { label: string; context: string; id: string; lat: number; lng: number }

/** Ne jamais considérer les réponses du géocodeur comme du HTML fiable. */
export function adressesHabil(data: unknown): AdresseHabil[] {
  const features = (data as { features?: unknown[] })?.features;
  if (!Array.isArray(features)) return [];
  return features.slice(0, 5).flatMap((feature: any) => {
    const p = feature?.properties, c = feature?.geometry?.coordinates;
    if (typeof p?.label !== 'string' || !p.label.trim() || p.label.length > 500 ||
        typeof p.id !== 'string' || !p.id || p.id.length > 200 ||
        feature?.geometry?.type !== 'Point' || !Array.isArray(c) ||
        !Number.isFinite(c[0]) || !Number.isFinite(c[1]) ||
        Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90) return [];
    return [{ label: p.label, context: typeof p.context === 'string' ? p.context.slice(0, 300) : '', id: p.id, lng: c[0], lat: c[1] }];
  });
}

export function lienHabil(adresse: AdresseHabil): string {
  const url = new URL(HABIL_SIMULATION);
  url.searchParams.set('address', adresse.label);
  url.searchParams.set('lat', String(adresse.lat));
  url.searchParams.set('lng', String(adresse.lng));
  url.searchParams.set('ban_id', adresse.id);
  return url.href;
}

export function rechercheAdresse(query: string): string {
  const url = new URL('https://data.geopf.fr/geocodage/search/');
  url.searchParams.set('q', query.trim().slice(0, 200));
  url.searchParams.set('limit', '5');
  return url.href;
}
