// Rangs — SPEC.md section 5.6.
// Le rang mesure une capacité démontrée. Deux portes (plus longue sortie
// jamais faite, KME hebdo moyen sur 4 semaines), le rang courant est le
// plus faible des deux. Plancher D+ à partir de S. Le rang acquis est le
// maximum atteint en rejouant le journal chronologiquement : il ne
// redescend jamais.

import type { Sortie } from '../types';
import {
  RANGS,
  RANG_PLANCHER_DPLUS_MIN,
  PLANCHER_DPLUS_METRES,
  PLANCHER_DPLUS_FENETRE_JOURS,
  RANG_HEBDO_FENETRE_JOURS,
  RANG_HEBDO_DIVISEUR,
  type NomRang,
} from '../config/balance';
import { kme } from './kme';
import { sommeSurFenetre } from './fenetres';

export type PorteRang = 'longueSortie' | 'hebdo' | 'dplus';

export type EtatRang = {
  rangAcquis: NomRang | null;
  /** Portes qui bloquent le passage au rang suivant, évaluées aujourd'hui. Vide si rang max atteint. */
  portesBloquantes: PorteRang[];
};

const INDEX_PLANCHER = RANGS.findIndex((r) => r.rang === RANG_PLANCHER_DPLUS_MIN);

function longestKmeJusqua(sorties: readonly Sortie[], dateJ: string): number {
  const kmes = sorties.filter((s) => s.date <= dateJ).map(kme);
  return kmes.length > 0 ? Math.max(...kmes) : 0;
}

function kmeHebdoMoyenJusqua(sorties: readonly Sortie[], dateJ: string): number {
  return (
    sommeSurFenetre(sorties, dateJ, RANG_HEBDO_FENETRE_JOURS, (s) => s.date, kme) /
    RANG_HEBDO_DIVISEUR
  );
}

function dplusSurFenetreJusqua(sorties: readonly Sortie[], dateJ: string): number {
  return sommeSurFenetre(
    sorties,
    dateJ,
    PLANCHER_DPLUS_FENETRE_JOURS,
    (s) => s.date,
    (s) => s.denivele,
  );
}

/** Dernier index de RANGS dont le seuil (croissant) est atteint par `valeur`, -1 si aucun. */
function dernierIndexAtteint(valeur: number, seuilDe: (r: (typeof RANGS)[number]) => number): number {
  let index = -1;
  for (let i = 0; i < RANGS.length; i++) {
    if (valeur >= seuilDe(RANGS[i])) index = i;
    else break;
  }
  return index;
}

/** Index de rang atteint à `dateJ`, à partir des sorties dont la date est <= dateJ. */
function rangIndexAtteint(sorties: readonly Sortie[], dateJ: string): number {
  const longestKme = longestKmeJusqua(sorties, dateJ);
  const hebdoMoyen = kmeHebdoMoyenJusqua(sorties, dateJ);

  const indexLongest = dernierIndexAtteint(longestKme, (r) => r.kmeLonguesortie);
  const indexHebdo = dernierIndexAtteint(hebdoMoyen, (r) => r.kmeHebdoMoyen);

  let indexCandidat = Math.min(indexLongest, indexHebdo);

  if (indexCandidat >= INDEX_PLANCHER) {
    const dplus = dplusSurFenetreJusqua(sorties, dateJ);
    if (dplus < PLANCHER_DPLUS_METRES) {
      indexCandidat = INDEX_PLANCHER - 1;
    }
  }

  return indexCandidat;
}

function calculerPortesBloquantes(
  sorties: readonly Sortie[],
  dateJ: string,
  rangActuelIndex: number,
): PorteRang[] {
  const prochainIndex = rangActuelIndex + 1;
  if (prochainIndex >= RANGS.length) return [];

  const prochainRang = RANGS[prochainIndex];
  const longestKme = longestKmeJusqua(sorties, dateJ);
  const hebdoMoyen = kmeHebdoMoyenJusqua(sorties, dateJ);

  const portes: PorteRang[] = [];
  if (longestKme < prochainRang.kmeLonguesortie) portes.push('longueSortie');
  if (hebdoMoyen < prochainRang.kmeHebdoMoyen) portes.push('hebdo');

  if (prochainIndex >= INDEX_PLANCHER) {
    const dplus = dplusSurFenetreJusqua(sorties, dateJ);
    if (dplus < PLANCHER_DPLUS_METRES) portes.push('dplus');
  }

  return portes;
}

/**
 * Calcule le rang acquis (maximum jamais atteint, en rejouant le journal
 * chronologiquement) et les portes qui bloquent le rang suivant,
 * évaluées à `dateJ` (aujourd'hui).
 */
export function calculerRang(sorties: readonly Sortie[], dateJ: string): EtatRang {
  // Seules les sorties jusqu'à dateJ comptent : le rang à une date donnée
  // ne doit rien devoir à des sorties futures relatives à cette date.
  const sortiesTriees = [...sorties]
    .filter((s) => s.date <= dateJ)
    .sort((a, b) => a.date.localeCompare(b.date));

  let maxRangIndex = -1;
  for (let i = 0; i < sortiesTriees.length; i++) {
    const candidat = rangIndexAtteint(sortiesTriees.slice(0, i + 1), sortiesTriees[i].date);
    if (candidat > maxRangIndex) maxRangIndex = candidat;
  }

  const rangAcquis = maxRangIndex >= 0 ? RANGS[maxRangIndex].rang : null;
  const portesBloquantes = calculerPortesBloquantes(sortiesTriees, dateJ, maxRangIndex);

  return { rangAcquis, portesBloquantes };
}
