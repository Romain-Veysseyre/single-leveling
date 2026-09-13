// Multiplicateur et état, dérivés de ratioCharge — SPEC.md section 5.3.
// Jamais stocké : toujours recalculé.

import { SEUILS_ETAT, type Etat } from '../config/balance';

export function etatEtMultiplicateur(ratioCharge: number): { etat: Etat; multiplicateur: number } {
  const seuil = SEUILS_ETAT.find((s) => ratioCharge <= s.max) ?? SEUILS_ETAT[SEUILS_ETAT.length - 1];
  return { etat: seuil.etat, multiplicateur: seuil.multiplicateur };
}
