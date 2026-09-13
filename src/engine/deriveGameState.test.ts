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

  // Point à trancher avec l'utilisateur : aucun rang n'est gagné sur un
  // journal vide (les seuils du rang E lui-même, 12 KME / 20 KME hebdo, ne
  // sont pas atteints avec 0 sortie). Le SPEC ne définit pas d'état
  // "avant E" explicitement — voir la réponse envoyée avec ce Bloc 4.
  it('rang : aucun rang gagné sur un journal vide', () => {
    const etat = deriveGameState([], '2026-06-15');
    expect(etat.rang.rangAcquis).toBeNull();
  });

  it('état AFFUTE par défaut sur un journal vide (ratio neutralisé à 1.0)', () => {
    const etat = deriveGameState([], '2026-06-15');
    expect(etat.etatCourant).toBe('AFFUTE');
  });
});
