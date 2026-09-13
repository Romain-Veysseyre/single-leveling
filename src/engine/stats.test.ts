import { describe, it, expect } from 'vitest';
import {
  enduranceDepuisMaxKme,
  ascensionDepuisSommeDplus,
  velociteDepuisVeq,
  constanceDepuisCV,
  resilienceDepuisCoutMoyen,
  constance,
} from './stats';
import type { Sortie } from '../types';

describe('stats : repères de contrôle SPEC.md 5.7', () => {
  it('Endurance : maxKME 90 (rang S) -> 46', () => {
    expect(enduranceDepuisMaxKme(90)).toBe(46);
  });

  it('Ascension : D+ 30j = 2500 -> 33', () => {
    expect(ascensionDepuisSommeDplus(2500)).toBe(33);
  });

  it('Vélocité : vEq 10 km/h -> 56', () => {
    expect(velociteDepuisVeq(10)).toBe(56);
  });

  it('Constance : CV 0.20 -> 80 (moyenne hebdo au-dessus du garde-fou de 10 KME)', () => {
    expect(constanceDepuisCV(0.2, 20)).toBe(80);
  });

  it('Résilience : KME 20 à RPE 5 -> 54 (cout = rpe/√KME, SPEC.md 5.7)', () => {
    expect(resilienceDepuisCoutMoyen(5 / Math.sqrt(20))).toBe(54);
  });

  it('Résilience : KME 20 à RPE 3 -> 89', () => {
    expect(resilienceDepuisCoutMoyen(3 / Math.sqrt(20))).toBe(89);
  });
});

function sortieKme(date: string, km: number): Sortie {
  return {
    id: `${date}-${km}`,
    type: 'sortie',
    date,
    km,
    denivele: 0,
    dureeMin: 60,
    rpe: 5,
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

describe('Constance : amorçage (SPEC.md 5.7)', () => {
  const dateJ = '2026-06-15';

  it('journal vide -> null', () => {
    expect(constance([], dateJ)).toBeNull();
  });

  it('13 jours depuis la première sortie (2 blocs) -> null, sous le minimum de 3', () => {
    const sorties = [sortieKme(joursAvant(dateJ, 13), 10)];
    expect(constance(sorties, dateJ)).toBeNull();
  });

  it('14 jours depuis la première sortie (3 blocs pile) -> calcul effectué, plus null', () => {
    const sorties = [sortieKme(joursAvant(dateJ, 14), 10)];
    expect(constance(sorties, dateJ)).not.toBeNull();
  });
});

describe('Constance : blocs glissants de 7 jours, pas des semaines calendaires (SPEC.md 5.7)', () => {
  it('des sorties aux mêmes décalages relatifs donnent le même résultat, à cheval sur le 31 décembre ou non', () => {
    const decalages = [1, 6, 13, 20, 27, 34, 41, 48, 55];

    const dateJAvecPassage = '2026-01-06';
    const datesAvecPassage = decalages.map((d) => joursAvant(dateJAvecPassage, d));
    expect(datesAvecPassage).toContain('2025-12-31');

    const dateJSansPassage = '2026-06-06';
    const datesSansPassage = decalages.map((d) => joursAvant(dateJSansPassage, d));

    const sortiesAvecPassage = datesAvecPassage.map((date, i) => sortieKme(date, 10 + i * 5));
    const sortiesSansPassage = datesSansPassage.map((date, i) => sortieKme(date, 10 + i * 5));

    expect(constance(sortiesAvecPassage, dateJAvecPassage)).toBe(
      constance(sortiesSansPassage, dateJSansPassage),
    );
  });
});
