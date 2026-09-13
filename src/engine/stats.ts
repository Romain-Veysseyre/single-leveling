// Les 5 stats — SPEC.md section 5.7.
// Échelle 0-100, arrondi à l'entier, clamp(0,100) strict.

import type { Sortie } from '../types';
import {
  STAT_MIN,
  STAT_MAX,
  ENDURANCE_REF_KME,
  ENDURANCE_EXPOSANT,
  ENDURANCE_FENETRE_JOURS,
  ASCENSION_REF_DPLUS,
  ASCENSION_EXPOSANT,
  ASCENSION_FENETRE_JOURS,
  VELOCITE_VITESSE_MIN,
  VELOCITE_VITESSE_PLAGE,
  VELOCITE_FENETRE_JOURS,
  CONSTANCE_NB_SEMAINES,
  CONSTANCE_SEUIL_MOYENNE_HEBDO_KME,
  CONSTANCE_PLAFOND_SI_FAIBLE_VOLUME,
  RESILIENCE_COUT_REF,
  RESILIENCE_FENETRE_JOURS,
} from '../config/balance';
import { kme } from './kme';
import { ajouterJours, dansFenetre, semainesPleinesPrecedentes } from './dateUtils';
import { sommeSurFenetre, sommeSurIntervalle, maxSurFenetre } from './fenetres';

function clampRound(valeur: number): number {
  return Math.min(STAT_MAX, Math.max(STAT_MIN, Math.round(valeur)));
}

// --- Endurance : 100 × (maxKME / 270)^0.7, 90 j glissants ---

export function enduranceDepuisMaxKme(maxKme: number): number {
  return clampRound(100 * Math.pow(maxKme / ENDURANCE_REF_KME, ENDURANCE_EXPOSANT));
}

export function endurance(sorties: readonly Sortie[], dateJ: string): number {
  const maxKme = maxSurFenetre(sorties, dateJ, ENDURANCE_FENETRE_JOURS, (s) => s.date, kme);
  return enduranceDepuisMaxKme(maxKme);
}

// --- Ascension : 100 × (sommeDplus / 12000)^0.7, 30 j glissants ---

export function ascensionDepuisSommeDplus(sommeDplus: number): number {
  return clampRound(100 * Math.pow(sommeDplus / ASCENSION_REF_DPLUS, ASCENSION_EXPOSANT));
}

export function ascension(sorties: readonly Sortie[], dateJ: string): number {
  const sommeDplus = sommeSurFenetre(
    sorties,
    dateJ,
    ASCENSION_FENETRE_JOURS,
    (s) => s.date,
    (s) => s.denivele,
  );
  return ascensionDepuisSommeDplus(sommeDplus);
}

// --- Vélocité : 100 × (vEq - 5) / 9, 30 j glissants ---

export function velociteDepuisVeq(vEq: number): number {
  return clampRound((100 * (vEq - VELOCITE_VITESSE_MIN)) / VELOCITE_VITESSE_PLAGE);
}

export function velocite(sorties: readonly Sortie[], dateJ: string): number {
  const sortiesFenetre = sorties.filter((s) => dansFenetre(s.date, dateJ, VELOCITE_FENETRE_JOURS));
  const sommeKme = sortiesFenetre.reduce((total, s) => total + kme(s), 0);
  const sommeHeures = sortiesFenetre.reduce((total, s) => total + s.dureeMin / 60, 0);
  const vEq = sommeHeures > 0 ? sommeKme / sommeHeures : 0;
  return velociteDepuisVeq(vEq);
}

// --- Constance : 100 × (1 - CV), 8 semaines calendaires pleines ---

function moyenne(valeurs: readonly number[]): number {
  return valeurs.reduce((total, v) => total + v, 0) / valeurs.length;
}

/** Écart-type de population (÷ N) : les 8 semaines sont l'ensemble observé, pas un échantillon. */
function ecartTypePopulation(valeurs: readonly number[]): number {
  const m = moyenne(valeurs);
  const sommeCarres = valeurs.reduce((total, v) => total + (v - m) ** 2, 0);
  return Math.sqrt(sommeCarres / valeurs.length);
}

export function constanceDepuisCV(cv: number, moyenneHebdoKme: number): number {
  const valeurBrute = 100 * (1 - cv);
  const valeur =
    moyenneHebdoKme < CONSTANCE_SEUIL_MOYENNE_HEBDO_KME
      ? Math.min(valeurBrute, CONSTANCE_PLAFOND_SI_FAIBLE_VOLUME)
      : valeurBrute;
  return clampRound(valeur);
}

export function constance(sorties: readonly Sortie[], dateJ: string): number {
  const lundis = semainesPleinesPrecedentes(dateJ, CONSTANCE_NB_SEMAINES);
  const sommesHebdo = lundis.map((lundi) =>
    sommeSurIntervalle(sorties, lundi, ajouterJours(lundi, 6), (s) => s.date, kme),
  );

  const moyenneHebdo = moyenne(sommesHebdo);
  const cv = moyenneHebdo === 0 ? 0 : ecartTypePopulation(sommesHebdo) / moyenneHebdo;
  return constanceDepuisCV(cv, moyenneHebdo);
}

// --- Résilience : 100 × (0.60 / coûtMoyen), 60 j glissants ---

export function resilienceDepuisCoutMoyen(coutMoyen: number): number {
  return clampRound(100 * (RESILIENCE_COUT_REF / coutMoyen));
}

export function resilience(sorties: readonly Sortie[], dateJ: string): number {
  const sortiesFenetre = sorties.filter((s) => dansFenetre(s.date, dateJ, RESILIENCE_FENETRE_JOURS));
  const sommeKme = sortiesFenetre.reduce((total, s) => total + kme(s), 0);
  if (sommeKme === 0) return clampRound(0);

  const sommeCoutPondere = sortiesFenetre.reduce((total, s) => {
    const k = kme(s);
    const cout = s.rpe / Math.sqrt(k);
    return total + cout * k;
  }, 0);
  const coutMoyen = sommeCoutPondere / sommeKme;
  return resilienceDepuisCoutMoyen(coutMoyen);
}
