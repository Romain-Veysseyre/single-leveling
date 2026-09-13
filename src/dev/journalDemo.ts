// Outil de développement uniquement : génère un journal plausible sur
// 90 jours pour voir l'application à un rang avancé sans attendre.
// N'a rien à voir avec le moteur de dérivation (SPEC.md section 5) :
// aucune valeur ici n'est un repère de contrôle à tester.

import type { Sortie } from '../types';
import { calculerRatioCharge } from '../engine/charge';
import { ajouterJours, aujourdHui } from '../engine/dateUtils';

const NB_JOURS = 90;
/** Jour (0-89, en arrière depuis aujourd'hui) de la sortie longue « pic ». */
const JOUR_PIC = 5;

function alea(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function arrondi(valeur: number, decimales: number): number {
  const f = 10 ** decimales;
  return Math.round(valeur * f) / f;
}

/**
 * 90 jours de sorties plausibles : entraînement régulier (repos mardi et
 * vendredi, sortie longue le dimanche) avec une sortie « pic » longue et
 * dénivelée 5 jours avant aujourd'hui, pour franchir les portes du rang S
 * (SPEC.md 5.6). Le ratioCharge est calculé au fil de l'eau, comme une
 * vraie saisie chronologique.
 */
export function construireJournalDemo(dateJ: string = aujourdHui()): Sortie[] {
  const sorties: Sortie[] = [];

  for (let joursAvant = NB_JOURS - 1; joursAvant >= 0; joursAvant--) {
    const date = ajouterJours(dateJ, -joursAvant);
    const jourSemaine = new Date(`${date}T00:00:00`).getDay(); // 0 = dimanche
    const estLeJourDuPic = joursAvant === JOUR_PIC;

    // Repos mardi/vendredi, sauf le jour du pic : une sortie « événement »
    // peut plausiblement tomber n'importe quel jour de la semaine.
    if (!estLeJourDuPic && (jourSemaine === 2 || jourSemaine === 5)) continue;

    let km: number;
    let denivele: number;
    let rpeBrut: number;

    if (estLeJourDuPic) {
      km = alea(68, 76);
      denivele = alea(3000, 3600);
      rpeBrut = 8;
    } else if (jourSemaine === 0) {
      km = alea(25, 35);
      denivele = alea(800, 1500);
      rpeBrut = alea(6, 7);
    } else {
      km = alea(8, 16);
      denivele = alea(100, 350);
      rpeBrut = alea(3, 6);
    }

    km = arrondi(km, 1);
    denivele = Math.round(denivele);
    const rpe = Math.min(10, Math.max(1, Math.round(rpeBrut)));

    const kme = km + denivele / 100;
    const vitesseKmh = alea(8, 10.5); // vitesse équivalente à plat plausible
    const dureeMin = Math.max(1, Math.round((kme / vitesseKmh) * 60));

    const candidat: Sortie = {
      id: crypto.randomUUID(),
      type: 'sortie',
      date,
      km,
      denivele,
      dureeMin,
      rpe,
      ratioCharge: 1,
      equipementIds: [],
      note: 'Sortie de démonstration',
    };

    candidat.ratioCharge = calculerRatioCharge([...sorties, candidat], date);
    sorties.push(candidat);
  }

  return sorties;
}
