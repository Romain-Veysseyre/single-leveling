// Agrégations génériques sur fenêtre glissante, réutilisées par plusieurs
// formules du moteur (rang, stats). Fonctions pures, sans accès à la base.

import { dansFenetre } from './dateUtils';

export function sommeSurFenetre<T>(
  items: readonly T[],
  dateJ: string,
  nombreJours: number,
  dateDe: (item: T) => string,
  valeurDe: (item: T) => number,
): number {
  return items
    .filter((item) => dansFenetre(dateDe(item), dateJ, nombreJours))
    .reduce((total, item) => total + valeurDe(item), 0);
}

/** Somme des valeurs des items dont la date tombe dans [dateDebut, dateFin] (bornes incluses). */
export function sommeSurIntervalle<T>(
  items: readonly T[],
  dateDebut: string,
  dateFin: string,
  dateDe: (item: T) => string,
  valeurDe: (item: T) => number,
): number {
  return items
    .filter((item) => {
      const d = dateDe(item);
      return d >= dateDebut && d <= dateFin;
    })
    .reduce((total, item) => total + valeurDe(item), 0);
}

export function maxSurFenetre<T>(
  items: readonly T[],
  dateJ: string,
  nombreJours: number,
  dateDe: (item: T) => string,
  valeurDe: (item: T) => number,
): number {
  const valeurs = items
    .filter((item) => dansFenetre(dateDe(item), dateJ, nombreJours))
    .map(valeurDe);
  return valeurs.length > 0 ? Math.max(...valeurs) : 0;
}
