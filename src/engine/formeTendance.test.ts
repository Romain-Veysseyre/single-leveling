import { describe, it, expect } from 'vitest';
import { tendanceForme } from './formeTendance';
import type { CheckForme } from '../types';

function forme(date: string, valeur: CheckForme['valeur']): CheckForme {
  return { id: date, type: 'forme', date, valeur };
}

describe('tendanceForme (SPEC.md 5.9)', () => {
  it('retourne 14 points, du plus ancien au plus récent, le dernier étant dateJ', () => {
    const dateJ = '2026-06-15';
    const points = tendanceForme([], dateJ);
    expect(points).toHaveLength(14);
    expect(points[0].date).toBe('2026-06-02'); // J-13
    expect(points[13].date).toBe(dateJ);
  });

  it('valeur null pour un jour sans check de forme enregistré', () => {
    const points = tendanceForme([], '2026-06-15');
    expect(points.every((p) => p.valeur === null)).toBe(true);
  });

  it('reprend la valeur enregistrée au bon jour', () => {
    const dateJ = '2026-06-15';
    const events = [forme('2026-06-15', 4), forme('2026-06-10', 2)];
    const points = tendanceForme(events, dateJ);

    expect(points.find((p) => p.date === '2026-06-15')?.valeur).toBe(4);
    expect(points.find((p) => p.date === '2026-06-10')?.valeur).toBe(2);
    expect(points.find((p) => p.date === '2026-06-09')?.valeur).toBeNull();
  });

  it('reste correct à cheval sur le 31 décembre', () => {
    const dateJ = '2026-01-06';
    const points = tendanceForme([], dateJ);
    expect(points[0].date).toBe('2025-12-24'); // J-13
    expect(points).toContainEqual({ date: '2025-12-31', valeur: null });
  });
});
