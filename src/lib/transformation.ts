// Logique de la chaîne « Bien actuel → Enveloppe indicative » au défilement : petite, déterministe, sans animation.
// progres : avancement du défilement dans la zone épinglée, de 0 à 1.
export type Etape = 1 | 2 | 3 | 4 | 5;

/** Fin de chaque étape (en avancement du défilement). L'étape 3 (projection) dure de 0,30 à 0,54. */
export const SEUILS = [0.14, 0.30, 0.54, 0.76] as const;

export const borner = (x: number): number => (Number.isFinite(x) ? Math.max(0, Math.min(1, x)) : 0);

export function progresDefilement(haut: number, hauteurZone: number, hauteurFenetre: number): number {
  const total = hauteurZone - hauteurFenetre;
  return total <= 0 ? 0 : borner(-haut / total);
}

export function etapeDepuisProgres(progres: number): Etape {
  const p = borner(progres);
  if (p < SEUILS[0]) return 1;
  if (p < SEUILS[1]) return 2;
  if (p < SEUILS[2]) return 3;
  if (p < SEUILS[3]) return 4;
  return 5;
}

/** Position du rideau existant | projection (0 = tout l'existant, 1 = toute la projection). */
export function rideauDepuisProgres(progres: number): number {
  const p = borner(progres);
  if (p < SEUILS[1]) return 0;
  if (p >= SEUILS[2]) return 1;
  return borner((p - SEUILS[1]) / (SEUILS[2] - SEUILS[1]));
}
