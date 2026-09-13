// Charge et ratio de charge — SPEC.md section 5.2.
// Fonctions pures, sans accès à la base.
//
// Anticipé au Bloc 2 (au lieu du Bloc 3) car l'action manuelle
// « Recalculer les ratios de charge » en dépend directement.
// Le reste du moteur (KME, XP, niveau, rang, stats, usure) arrive au Bloc 3.

import type { Sortie } from '../types';

/** sRPE d'une sortie : charge(sortie) = rpe × dureeMin */
export function chargeSortie(sortie: Pick<Sortie, 'rpe' | 'dureeMin'>): number {
  return sortie.rpe * sortie.dureeMin;
}

function joursEntre(dateDebut: string, dateFin: string): number {
  const debut = new Date(`${dateDebut}T00:00:00`);
  const fin = new Date(`${dateFin}T00:00:00`);
  return Math.round((fin.getTime() - debut.getTime()) / 86_400_000);
}

function sommeChargeFenetre(sorties: Sortie[], dateJ: string, joursGlissants: number): number {
  return sorties
    .filter((s) => {
      const delta = joursEntre(s.date, dateJ);
      return delta >= 0 && delta <= joursGlissants;
    })
    .reduce((total, s) => total + chargeSortie(s), 0);
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
 * Neutralisation à l'amorçage : si moins de 28 jours séparent la première
 * sortie du journal de dateJ, ou si CC == 0, ratioCharge = 1.0.
 */
export function calculerRatioCharge(sorties: Sortie[], dateJ: string): number {
  if (sorties.length === 0) return 1.0;

  const premiereSortieDate = sorties.reduce(
    (min, s) => (s.date < min ? s.date : min),
    sorties[0].date,
  );

  const CA = sommeChargeFenetre(sorties, dateJ, 6);
  const CC = sommeChargeFenetre(sorties, dateJ, 27) / 4;

  const joursHistorique = joursEntre(premiereSortieDate, dateJ);
  if (joursHistorique < 28 || CC === 0) {
    return 1.0;
  }

  return CA / CC;
}
