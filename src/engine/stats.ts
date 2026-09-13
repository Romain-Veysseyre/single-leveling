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
  CONSTANCE_NB_BLOCS,
  CONSTANCE_TAILLE_BLOC_JOURS,
  CONSTANCE_BLOCS_MIN,
  CONSTANCE_SEUIL_MOYENNE_HEBDO_KME,
  CONSTANCE_PLAFOND_SI_FAIBLE_VOLUME,
  RESILIENCE_COUT_REF,
  RESILIENCE_FENETRE_JOURS,
} from '../config/balance';
import { kme } from './kme';
import { dansFenetre, joursEntre } from './dateUtils';
import { sommeSurFenetre, maxSurFenetre } from './fenetres';

function clampRound(valeur: number): number {
  return Math.min(STAT_MAX, Math.max(STAT_MIN, Math.round(valeur)));
}

// --- Endurance : 100 × (maxKME / 270)^0.7, 90 j glissants ---

export function enduranceDepuisMaxKme(maxKme: number): number {
  return clampRound(STAT_MAX * Math.pow(maxKme / ENDURANCE_REF_KME, ENDURANCE_EXPOSANT));
}

export function endurance(sorties: readonly Sortie[], dateJ: string): number {
  const maxKme = maxSurFenetre(sorties, dateJ, ENDURANCE_FENETRE_JOURS, (s) => s.date, kme);
  return enduranceDepuisMaxKme(maxKme);
}

// --- Ascension : 100 × (sommeDplus / 12000)^0.7, 30 j glissants ---

export function ascensionDepuisSommeDplus(sommeDplus: number): number {
  return clampRound(STAT_MAX * Math.pow(sommeDplus / ASCENSION_REF_DPLUS, ASCENSION_EXPOSANT));
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
  return clampRound((STAT_MAX * (vEq - VELOCITE_VITESSE_MIN)) / VELOCITE_VITESSE_PLAGE);
}

export function velocite(sorties: readonly Sortie[], dateJ: string): number {
  const sortiesFenetre = sorties.filter((s) => dansFenetre(s.date, dateJ, VELOCITE_FENETRE_JOURS));
  const sommeKme = sortiesFenetre.reduce((total, s) => total + kme(s), 0);
  const sommeHeures = sortiesFenetre.reduce((total, s) => total + s.dureeMin / 60, 0);
  const vEq = sommeHeures > 0 ? sommeKme / sommeHeures : 0;
  return velociteDepuisVeq(vEq);
}

// --- Constance : 100 × (1 - CV), 8 blocs glissants de 7 jours ---

function moyenne(valeurs: readonly number[]): number {
  return valeurs.reduce((total, v) => total + v, 0) / valeurs.length;
}

/** Écart-type de population (÷ N) : les blocs retenus sont l'ensemble observé, pas un échantillon. */
function ecartTypePopulation(valeurs: readonly number[]): number {
  const m = moyenne(valeurs);
  const sommeCarres = valeurs.reduce((total, v) => total + (v - m) ** 2, 0);
  return Math.sqrt(sommeCarres / valeurs.length);
}

export function constanceDepuisCV(cv: number, moyenneHebdoKme: number): number {
  const valeurBrute = STAT_MAX * (1 - cv);
  const valeur =
    moyenneHebdoKme < CONSTANCE_SEUIL_MOYENNE_HEBDO_KME
      ? Math.min(valeurBrute, CONSTANCE_PLAFOND_SI_FAIBLE_VOLUME)
      : valeurBrute;
  return clampRound(valeur);
}

/**
 * Somme de KME par bloc glissant de CONSTANCE_TAILLE_BLOC_JOURS jours,
 * ancrés sur dateJ : bloc 0 = [J-6, J] (le plus récent), bloc 1 =
 * [J-13, J-7], etc. Retourne CONSTANCE_NB_BLOCS sommes, du plus récent au
 * plus ancien.
 */
function sommesParBlocGlissant(sorties: readonly Sortie[], dateJ: string): number[] {
  const sommes = new Array(CONSTANCE_NB_BLOCS).fill(0) as number[];
  for (const s of sorties) {
    const delta = joursEntre(s.date, dateJ);
    if (delta < 0) continue;
    const indexBloc = Math.floor(delta / CONSTANCE_TAILLE_BLOC_JOURS);
    if (indexBloc < CONSTANCE_NB_BLOCS) {
      sommes[indexBloc] += kme(s);
    }
  }
  return sommes;
}

/**
 * Amorçage (SPEC.md 5.7) : le nombre de blocs retenus est plafonné au
 * nombre de blocs complets écoulés depuis la première sortie du journal,
 * pour ne pas laisser des blocs vides antérieurs à tout entraînement
 * écraser artificiellement le CV. En dessous de CONSTANCE_BLOCS_MIN blocs
 * disponibles, la stat n'est pas définie (`null`, affiché « — »).
 */
export function constance(sorties: readonly Sortie[], dateJ: string): number | null {
  if (sorties.length === 0) return null;

  const premiereSortieDate = sorties.reduce(
    (min, s) => (s.date < min ? s.date : min),
    sorties[0].date,
  );
  const deltaPremiereSortie = Math.max(0, joursEntre(premiereSortieDate, dateJ));
  const blocsEcoules = Math.floor(deltaPremiereSortie / CONSTANCE_TAILLE_BLOC_JOURS) + 1;
  const nombreBlocsRetenus = Math.min(CONSTANCE_NB_BLOCS, blocsEcoules);

  if (nombreBlocsRetenus < CONSTANCE_BLOCS_MIN) return null;

  const sommes = sommesParBlocGlissant(sorties, dateJ).slice(0, nombreBlocsRetenus);
  const moyenneHebdo = moyenne(sommes);
  const cv = moyenneHebdo === 0 ? 0 : ecartTypePopulation(sommes) / moyenneHebdo;
  return constanceDepuisCV(cv, moyenneHebdo);
}

// --- Résilience : 100 × (0.60 / coûtMoyen), 60 j glissants ---

export function resilienceDepuisCoutMoyen(coutMoyen: number): number {
  return clampRound(STAT_MAX * (RESILIENCE_COUT_REF / coutMoyen));
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
