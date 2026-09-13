// Niveau — SPEC.md section 5.5. Démarre à 0, ne redescend jamais.

import { NIVEAU_DEPART, XP_NIVEAU_BASE, XP_NIVEAU_INCREMENT } from '../config/balance';

/** xpPourNiveauSuivant(n) = XP_NIVEAU_BASE + XP_NIVEAU_INCREMENT × n */
export function xpPourNiveauSuivant(niveau: number): number {
  return XP_NIVEAU_BASE + XP_NIVEAU_INCREMENT * niveau;
}

/** XP cumulée pour atteindre `niveau` : 100n + 20n(n-1) avec les valeurs par défaut. */
export function xpCumuleePourNiveau(niveau: number): number {
  return XP_NIVEAU_BASE * niveau + (XP_NIVEAU_INCREMENT * niveau * (niveau - 1)) / 2;
}

export type ProgressionNiveau = {
  niveau: number;
  xpCourante: number;
  xpRequise: number;
};

/** Niveau atteint par `xpTotale`, et progression vers le niveau suivant. */
export function niveauEtProgression(xpTotale: number): ProgressionNiveau {
  let niveau = NIVEAU_DEPART;
  while (xpCumuleePourNiveau(niveau + 1) <= xpTotale) {
    niveau++;
  }
  return {
    niveau,
    xpCourante: xpTotale - xpCumuleePourNiveau(niveau),
    xpRequise: xpPourNiveauSuivant(niveau),
  };
}
