// Tendance du check de forme — SPEC.md section 5.9.
// « Capturé, stocké, affiché sous forme de tendance sur 14 jours.
//   Aucun effet mécanique. » Fonction pure, sans accès à la base.

import type { CheckForme, JournalEvent } from '../types';
import { FORME_TENDANCE_FENETRE_JOURS } from '../config/balance';
import { ajouterJours } from './dateUtils';

export type PointTendanceForme = {
  date: string;
  valeur: CheckForme['valeur'] | null;
};

/**
 * Un point par jour sur FORME_TENDANCE_FENETRE_JOURS jours, du plus ancien
 * au plus récent (le dernier point est dateJ). `valeur` est `null` pour un
 * jour sans check de forme enregistré.
 */
export function tendanceForme(events: readonly JournalEvent[], dateJ: string): PointTendanceForme[] {
  const formes = events.filter((e): e is CheckForme => e.type === 'forme');
  const valeurParDate = new Map(formes.map((f) => [f.date, f.valeur]));

  const points: PointTendanceForme[] = [];
  for (let i = FORME_TENDANCE_FENETRE_JOURS - 1; i >= 0; i--) {
    const date = ajouterJours(dateJ, -i);
    points.push({ date, valeur: valeurParDate.get(date) ?? null });
  }
  return points;
}
