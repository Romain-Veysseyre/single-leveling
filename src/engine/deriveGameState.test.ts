import { describe, it, expect } from 'vitest';
import { deriveGameState } from './deriveGameState';

describe('deriveGameState : robustesse sur journal vide', () => {
  it('ne plante pas sur un journal vide', () => {
    expect(() => deriveGameState([], '2026-06-15')).not.toThrow();
  });

  it('niveau 0 sur un journal vide', () => {
    const etat = deriveGameState([], '2026-06-15');
    expect(etat.niveau.niveau).toBe(0);
    expect(etat.xpTotale).toBe(0);
  });

  it('rang : E par défaut sur un journal vide (décision explicite, badge toujours affiché)', () => {
    const etat = deriveGameState([], '2026-06-15');
    expect(etat.rang.rangAcquis).toBe('E');
  });

  it('état AFFUTE par défaut sur un journal vide (ratio neutralisé à 1.0)', () => {
    const etat = deriveGameState([], '2026-06-15');
    expect(etat.etatCourant).toBe('AFFUTE');
  });
});
