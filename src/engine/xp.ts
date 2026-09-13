// XP — SPEC.md section 5.4.
// L'intensité ne module jamais l'XP : le RPE n'y entre que via ratioCharge.

import type { Sortie } from '../types';
import { XP_COEF, ALPHA } from '../config/balance';
import { kme } from './kme';
import { etatEtMultiplicateur } from './etat';

/** xp(sortie) = round(XP_COEF × KME^ALPHA × multiplicateur) */
export function xpDepuisKme(kmeValeur: number, multiplicateur: number): number {
  return Math.round(XP_COEF * Math.pow(kmeValeur, ALPHA) * multiplicateur);
}

/**
 * XP d'une sortie, à partir de son ratioCharge figé (voir SPEC.md
 * section 3 : l'unique exception stockée). L'XP déjà gagnée ne baisse
 * donc jamais rétroactivement si les seuils de 5.3 changent.
 */
export function xpSortie(sortie: Sortie): number {
  const { multiplicateur } = etatEtMultiplicateur(sortie.ratioCharge);
  return xpDepuisKme(kme(sortie), multiplicateur);
}

/** XP totale du journal : somme des XP de chaque sortie. */
export function xpTotale(sorties: readonly Sortie[]): number {
  return sorties.reduce((total, s) => total + xpSortie(s), 0);
}
