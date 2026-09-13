import { describe, it, expect } from 'vitest';
import { xpCumuleePourNiveau, xpPourNiveauSuivant, niveauEtProgression } from './niveau';

describe('niveau : repères de contrôle SPEC.md 5.5', () => {
  it.each([
    [1, 100],
    [5, 900],
    [10, 2800],
    [20, 9600],
    [30, 20400],
    [50, 54000],
  ])('xpCumuleePourNiveau(%d) = %d', (niveau, attendu) => {
    expect(xpCumuleePourNiveau(niveau)).toBe(attendu);
  });

  it('xpPourNiveauSuivant(0) = 100 (palier 0 -> 1, SPEC.md 5.5)', () => {
    expect(xpPourNiveauSuivant(0)).toBe(100);
  });
});

describe('niveauEtProgression', () => {
  it('niveau 0 au départ (0 XP)', () => {
    expect(niveauEtProgression(0).niveau).toBe(0);
  });

  it('passage au niveau 1 exactement à 100 XP cumulée, pas avant', () => {
    expect(niveauEtProgression(99).niveau).toBe(0);
    expect(niveauEtProgression(100).niveau).toBe(1);
  });
});
