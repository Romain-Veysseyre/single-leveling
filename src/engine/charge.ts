// Charge et ratio de charge — SPEC.md section 5.2.
// Fonctions pures, sans accès à la base.

import type { Sortie } from '../types';
import {
  FENETRE_CA_JOURS,
  FENETRE_CC_JOURS,
  FENETRE_CC_DIVISEUR,
  NEUTRALISATION_JOURS_MIN,
} from '../config/balance';
import { joursEntre } from './dateUtils';
import { sommeSurFenetre } from './fenetres';

/** sRPE d'une sortie : charge(sortie) = rpe × dureeMin */
export function chargeSortie(sortie: Pick<Sortie, 'rpe' | 'dureeMin'>): number {
  return sortie.rpe * sortie.dureeMin;
}

/**
 * ratioCharge à la date `dateJ`, à partir de `sorties`.
 *
 * `sorties` doit contenir exactement les sorties du journal dont la date
 * est <= dateJ : l'appelant décide de la portée selon l'usage (5.3) :
 *   - ratioCharge figé d'une sortie en cours de saisie : sorties existantes
 *     + la sortie elle-même, dateJ = sa date.
 *   - état affiché à l'écran, recalculé en direct : toutes les sorties du
 *     journal dont la date est <= aujourd'hui, dateJ = aujourd'hui.
 *   - recalcul manuel (replay chronologique) : sorties du journal dont la
 *     date est <= la sortie rejouée, dateJ = sa date.
 *
 * Neutralisation à l'amorçage : si moins de NEUTRALISATION_JOURS_MIN jours
 * séparent la première sortie du journal de dateJ, ou si CC == 0,
 * ratioCharge = 1.0.
 */
export function calculerRatioCharge(sorties: readonly Sortie[], dateJ: string): number {
  if (sorties.length === 0) return 1.0;

  const premiereSortieDate = sorties.reduce(
    (min, s) => (s.date < min ? s.date : min),
    sorties[0].date,
  );

  const CA = sommeSurFenetre(sorties, dateJ, FENETRE_CA_JOURS, (s) => s.date, chargeSortie);
  const CC =
    sommeSurFenetre(sorties, dateJ, FENETRE_CC_JOURS, (s) => s.date, chargeSortie) /
    FENETRE_CC_DIVISEUR;

  const joursHistorique = joursEntre(premiereSortieDate, dateJ);
  if (joursHistorique < NEUTRALISATION_JOURS_MIN || CC === 0) {
    return 1.0;
  }

  return CA / CC;
}
