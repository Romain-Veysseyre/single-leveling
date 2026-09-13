import { describe, it, expect } from 'vitest';
import { dansFenetre, joursEntre } from './dateUtils';

describe('dansFenetre : bornes inclusives des deux côtés (SPEC.md 5.2)', () => {
  const dateJ = '2026-06-15';

  it('[J-6, J] (nombreJours=7) inclut J et J-6, exclut J-7', () => {
    expect(dansFenetre(dateJ, dateJ, 7)).toBe(true);
    expect(dansFenetre('2026-06-09', dateJ, 7)).toBe(true); // J-6
    expect(dansFenetre('2026-06-08', dateJ, 7)).toBe(false); // J-7
  });

  it('[J-27, J] (nombreJours=28) inclut J et J-27, exclut J-28', () => {
    expect(dansFenetre(dateJ, dateJ, 28)).toBe(true);
    expect(dansFenetre('2026-05-19', dateJ, 28)).toBe(true); // J-27
    expect(dansFenetre('2026-05-18', dateJ, 28)).toBe(false); // J-28
  });
});

describe('joursEntre : passage d\'année', () => {
  it('calcule correctement à travers le 31 décembre', () => {
    expect(joursEntre('2025-12-31', '2026-01-01')).toBe(1);
    expect(joursEntre('2025-12-31', '2026-01-06')).toBe(6);
    expect(joursEntre('2025-12-25', '2026-01-06')).toBe(12);
  });
});
