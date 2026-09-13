import { describe, it, expect } from 'vitest';
import { calculerRang } from './rang';
import type { Sortie } from '../types';

function sortie(date: string, km: number, denivele = 0): Sortie {
  return {
    id: `${date}-${km}-${denivele}`,
    type: 'sortie',
    date,
    km,
    denivele,
    dureeMin: 60,
    rpe: 5,
    ratioCharge: 1,
    equipementIds: [],
  };
}

describe('rang : journal vide', () => {
  it('ne plante pas, aucun rang gagné (les seuils de E lui-même ne sont pas atteints avec 0 sortie)', () => {
    const { rangAcquis } = calculerRang([], '2026-06-15');
    expect(rangAcquis).toBeNull();
  });
});

describe('rang : les deux portes, le plus faible gagne (SPEC.md 5.6 règle 1)', () => {
  it('une sortie énorme et isolée (200 KME) ne fait pas monter le rang au-delà de ce que la porte hebdo autorise', () => {
    const dateJ = '2026-06-15';
    // longest = 200 -> satisferait jusqu'à SSS (seuil 165) sur la porte "plus longue sortie".
    // hebdo moyen = 200 / 4 = 50 -> ne satisfait que C (seuil hebdo 42), pas B (seuil 55).
    const { rangAcquis } = calculerRang([sortie(dateJ, 200)], dateJ);
    expect(rangAcquis).toBe('C');
  });
});

describe('rang : plancher D+ à partir de S (SPEC.md 5.6 règle 4)', () => {
  it('satisfait les deux portes de S (longest >= 90, hebdo >= 85) mais D+ 30j = 0 -> plafonné à A', () => {
    const dateJ = '2026-06-15';
    // 4 sorties de 90 km plat (D+ = 0), espacées de 7 jours : longest = 90,
    // hebdo moyen sur les 28 derniers jours = 4×90 / 4 = 90. Les deux portes
    // de S sont franchies, mais le plancher D+ (2500 m / 30j) ne l'est pas.
    const sorties = [
      sortie('2026-05-25', 90), // J-21
      sortie('2026-06-01', 90), // J-14
      sortie('2026-06-08', 90), // J-7
      sortie('2026-06-15', 90), // J
    ];
    const { rangAcquis } = calculerRang(sorties, dateJ);
    expect(rangAcquis).toBe('A');
  });

  it('la même progression, avec du D+, franchit bien S', () => {
    const dateJ = '2026-06-15';
    const sorties = [
      sortie('2026-05-25', 90, 700),
      sortie('2026-06-01', 90, 700),
      sortie('2026-06-08', 90, 700),
      sortie('2026-06-15', 90, 700), // D+ cumulé sur 30j = 2800 >= 2500
    ];
    const { rangAcquis } = calculerRang(sorties, dateJ);
    expect(rangAcquis).toBe('S');
  });
});

describe('rang : acquis définitivement, ne redescend jamais (SPEC.md 5.6 règle 5)', () => {
  it('après 60 jours sans nouvelle sortie, le rang acquis est inchangé', () => {
    const dateDerniereSortie = '2026-06-15';
    const sorties = [sortie(dateDerniereSortie, 200)];

    const rangImmediat = calculerRang(sorties, dateDerniereSortie).rangAcquis;
    const rang60joursApres = calculerRang(sorties, '2026-08-14').rangAcquis; // +60 jours

    expect(rangImmediat).toBe('C');
    expect(rang60joursApres).toBe('C');
  });
});
