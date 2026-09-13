import { describe, it, expect } from 'vitest';
import { calculerRatioCharge } from './charge';
import type { Sortie } from '../types';

function sortie(date: string, rpe: number, dureeMin: number): Sortie {
  return {
    id: `${date}-${rpe}-${dureeMin}`,
    type: 'sortie',
    date,
    km: 10,
    denivele: 0,
    dureeMin,
    rpe,
    ratioCharge: 1,
    equipementIds: [],
  };
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function joursAvant(dateJ: string, n: number): string {
  const d = new Date(`${dateJ}T00:00:00`);
  d.setDate(d.getDate() - n);
  return formatDate(d);
}

describe('ratioCharge : neutralisation à l\'amorçage (SPEC.md 5.2)', () => {
  const dateJ = '2026-06-15';

  it('une seule sortie datée d\'aujourd\'hui -> neutralisé à 1.0', () => {
    expect(calculerRatioCharge([sortie(dateJ, 5, 60)], dateJ)).toBe(1.0);
  });

  it('première sortie il y a 20 jours -> neutralisé à 1.0 (moins de 28 jours d\'historique)', () => {
    const s = sortie(joursAvant(dateJ, 20), 5, 60);
    expect(calculerRatioCharge([s], dateJ)).toBe(1.0);
  });

  it('première sortie il y a 40 jours, 7 derniers jours à volume doublé -> ratio > 1.5', () => {
    const sorties: Sortie[] = [];
    for (let i = 39; i >= 0; i--) {
      const dureeMin = i <= 6 ? 120 : 60; // derniers 7 jours (i=0..6) : volume doublé
      sorties.push(sortie(joursAvant(dateJ, i), 5, dureeMin));
    }
    expect(calculerRatioCharge(sorties, dateJ)).toBeGreaterThan(1.5);
  });
});
