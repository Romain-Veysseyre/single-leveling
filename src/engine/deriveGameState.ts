// Compose l'état de jeu complet à partir du journal brut — SPEC.md
// section 3 : fonction pure, sans accès à la base, prenant le journal en
// entrée et retournant l'état de jeu complet.

import type { JournalEvent, Sortie, Equipement } from '../types';
import type { Etat } from '../config/balance';
import { xpTotale } from './xp';
import { niveauEtProgression, type ProgressionNiveau } from './niveau';
import { calculerRang, type EtatRang } from './rang';
import { calculerRatioCharge } from './charge';
import { etatEtMultiplicateur } from './etat';
import { endurance, ascension, velocite, constance, resilience } from './stats';
import { usureTousEquipements, type UsureEquipement } from './usure';
import { aujourdHui } from './dateUtils';

export type StatsJoueur = {
  endurance: number;
  ascension: number;
  velocite: number;
  /** null pendant l'amorçage (moins de 3 blocs disponibles) : afficher « — ». */
  constance: number | null;
  resilience: number;
};

export type EtatJeu = {
  xpTotale: number;
  niveau: ProgressionNiveau;
  rang: EtatRang;
  /** Recalculé en direct à dateJ, distinct du ratioCharge figé des sorties (SPEC.md 5.3). */
  etatCourant: Etat;
  stats: StatsJoueur;
  usures: UsureEquipement[];
};

/**
 * `dateJ` par défaut = aujourd'hui, paramétrable pour des calculs
 * déterministes (tests, ou un état figé dans le temps).
 */
export function deriveGameState(
  events: readonly JournalEvent[],
  dateJ: string = aujourdHui(),
): EtatJeu {
  const sorties = events.filter((e): e is Sortie => e.type === 'sortie');
  const equipements = events.filter((e): e is Equipement => e.type === 'equipement');

  const xp = xpTotale(sorties);
  const niveau = niveauEtProgression(xp);
  const rang = calculerRang(sorties, dateJ);

  const ratioCourant = calculerRatioCharge(sorties, dateJ);
  const { etat: etatCourant } = etatEtMultiplicateur(ratioCourant);

  const stats: StatsJoueur = {
    endurance: endurance(sorties, dateJ),
    ascension: ascension(sorties, dateJ),
    velocite: velocite(sorties, dateJ),
    constance: constance(sorties, dateJ),
    resilience: resilience(sorties, dateJ),
  };

  const usures = usureTousEquipements(equipements, sorties);

  return { xpTotale: xp, niveau, rang, etatCourant, stats, usures };
}
