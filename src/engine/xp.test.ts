import { describe, it, expect } from 'vitest';
import { xpDepuisKme, xpSortie, xpTotale } from './xp';
import { kme } from './kme';
import type { Sortie } from '../types';

describe('xp : repères de contrôle SPEC.md 5.4 (multiplicateur 1.0)', () => {
  it.each([
    [10, 63],
    [21, 114],
    [65, 282],
    [40, 191],
  ])('xpDepuisKme(%d, 1.0) = %d', (kmeValeur, attendu) => {
    expect(xpDepuisKme(kmeValeur, 1.0)).toBe(attendu);
  });

  it('2 × (20 km plat) = 220 XP au total (anti-volume, SPEC.md 5.4)', () => {
    expect(xpDepuisKme(20, 1.0) * 2).toBe(220);
  });

  it('KME et XP dérivés de km/D+ bruts, pour les 3 premières lignes du tableau 5.4', () => {
    const s = (km: number, denivele: number) => kme({ km, denivele });

    expect(s(10, 0)).toBe(10);
    expect(xpDepuisKme(s(10, 0), 1.0)).toBe(63);

    expect(s(15, 600)).toBe(21);
    expect(xpDepuisKme(s(15, 600), 1.0)).toBe(114);

    expect(s(45, 2000)).toBe(65);
    expect(xpDepuisKme(s(45, 2000), 1.0)).toBe(282);
  });
});

function creerSortie(overrides: Partial<Sortie> = {}): Sortie {
  return {
    id: 'test',
    type: 'sortie',
    date: '2026-01-01',
    km: 10,
    denivele: 0,
    dureeMin: 60,
    rpe: 5,
    ratioCharge: 1.0,
    equipementIds: [],
    ...overrides,
  };
}

describe('xpSortie / xpTotale', () => {
  it('xpSortie utilise le ratioCharge figé de la sortie (SPEC.md section 3)', () => {
    expect(xpSortie(creerSortie({ km: 10, denivele: 0, ratioCharge: 1.0 }))).toBe(63);
  });

  it('xpSortie applique le multiplicateur EPUISE (ratioCharge > 1.50) : 0.30', () => {
    // xpDepuisKme(10, 0.30) = round(10 × 10^0.8 × 0.30) = round(18.93) = 19
    expect(xpSortie(creerSortie({ km: 10, denivele: 0, ratioCharge: 2.0 }))).toBe(19);
  });

  it('xpTotale additionne l\'XP de chaque sortie indépendamment', () => {
    const a = creerSortie({ id: 'a', km: 20, denivele: 0, ratioCharge: 1.0 });
    const b = creerSortie({ id: 'b', km: 20, denivele: 0, ratioCharge: 1.0 });
    expect(xpTotale([a, b])).toBe(220);
  });
});
