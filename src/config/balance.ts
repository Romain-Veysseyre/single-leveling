// Configuration centralisée — SPEC.md section 6.
// Toute valeur numérique de jeu vit ici. Aucune constante de jeu en dur
// ailleurs dans le code. Ce fichier sera modifié chaque semaine : une
// constante dupliquée dans un composant ou dans le moteur est un bug.

// ---------------------------------------------------------------------
// 5.2 — Charge et ratio de charge
// ---------------------------------------------------------------------

/** Taille de la fenêtre « charge aiguë » CA, en jours : [J-6, J]. */
export const FENETRE_CA_JOURS = 7;

/** Taille de la fenêtre « charge chronique » CC, en jours : [J-27, J]. */
export const FENETRE_CC_JOURS = 28;

/** CC = somme des charges sur la fenêtre, divisée par ce nombre de semaines. */
export const FENETRE_CC_DIVISEUR = 4;

/**
 * Neutralisation à l'amorçage : si moins de ce nombre de jours sépare la
 * première sortie du journal de la date évaluée, ratioCharge = 1.0.
 */
export const NEUTRALISATION_JOURS_MIN = 28;

// ---------------------------------------------------------------------
// 5.3 — Multiplicateur et état, dérivés de ratioCharge
// ---------------------------------------------------------------------

export type Etat = 'AFFUTE' | 'CHARGE' | 'EPUISE';

/**
 * Seuils de ratioCharge, dans l'ordre croissant. Le premier seuil dont
 * `max` est >= ratioCharge s'applique.
 */
export const SEUILS_ETAT: ReadonlyArray<{ max: number; multiplicateur: number; etat: Etat }> = [
  { max: 1.3, multiplicateur: 1.0, etat: 'AFFUTE' },
  { max: 1.5, multiplicateur: 0.6, etat: 'CHARGE' },
  { max: Infinity, multiplicateur: 0.3, etat: 'EPUISE' },
];

// ---------------------------------------------------------------------
// 5.4 — XP
// ---------------------------------------------------------------------

export const XP_COEF = 10;

/** Exposant concave de l'XP. La molette la plus sensible du système. */
export const ALPHA = 0.8;

// ---------------------------------------------------------------------
// 5.5 — Niveau
// ---------------------------------------------------------------------

export const NIVEAU_DEPART = 0;
export const XP_NIVEAU_BASE = 100;
export const XP_NIVEAU_INCREMENT = 40;

// ---------------------------------------------------------------------
// 5.6 — Rangs
// ---------------------------------------------------------------------

export type NomRang =
  | 'E'
  | 'D'
  | 'C'
  | 'B'
  | 'A'
  | 'S'
  | 'SS'
  | 'SSS'
  | 'MONARQUE'
  | 'SOUVERAIN';

/** Grille des rangs, dans l'ordre croissant. */
export const RANGS: ReadonlyArray<{
  rang: NomRang;
  kmeLonguesortie: number;
  kmeHebdoMoyen: number;
}> = [
  { rang: 'E', kmeLonguesortie: 12, kmeHebdoMoyen: 20 },
  { rang: 'D', kmeLonguesortie: 22, kmeHebdoMoyen: 30 },
  { rang: 'C', kmeLonguesortie: 35, kmeHebdoMoyen: 42 },
  { rang: 'B', kmeLonguesortie: 50, kmeHebdoMoyen: 55 },
  { rang: 'A', kmeLonguesortie: 70, kmeHebdoMoyen: 70 },
  { rang: 'S', kmeLonguesortie: 90, kmeHebdoMoyen: 85 },
  { rang: 'SS', kmeLonguesortie: 120, kmeHebdoMoyen: 105 },
  { rang: 'SSS', kmeLonguesortie: 165, kmeHebdoMoyen: 135 },
  { rang: 'MONARQUE', kmeLonguesortie: 270, kmeHebdoMoyen: 190 },
  { rang: 'SOUVERAIN', kmeLonguesortie: 450, kmeHebdoMoyen: 260 },
];

/** Premier rang à partir duquel le plancher D+ s'applique pour franchir. */
export const RANG_PLANCHER_DPLUS_MIN: NomRang = 'S';

export const PLANCHER_DPLUS_METRES = 2500;
export const PLANCHER_DPLUS_FENETRE_JOURS = 30;

/** Fenêtre du KME hebdomadaire moyen (5.6 règle 3) : somme / diviseur. */
export const RANG_HEBDO_FENETRE_JOURS = 28;
export const RANG_HEBDO_DIVISEUR = 4;

// ---------------------------------------------------------------------
// 5.7 — Les 5 stats
// ---------------------------------------------------------------------

export const STAT_MIN = 0;
export const STAT_MAX = 100;

export const ENDURANCE_REF_KME = 270;
export const ENDURANCE_EXPOSANT = 0.7;
export const ENDURANCE_FENETRE_JOURS = 90;

export const ASCENSION_REF_DPLUS = 12000;
export const ASCENSION_EXPOSANT = 0.7;
export const ASCENSION_FENETRE_JOURS = 30;

export const VELOCITE_VITESSE_MIN = 5;
export const VELOCITE_VITESSE_PLAGE = 9;
export const VELOCITE_FENETRE_JOURS = 30;

/** Nombre de semaines calendaires pleines utilisées pour la Constance. */
export const CONSTANCE_NB_SEMAINES = 8;

/** Garde-fou : sous cette moyenne hebdo de KME, la stat est plafonnée. */
export const CONSTANCE_SEUIL_MOYENNE_HEBDO_KME = 10;
export const CONSTANCE_PLAFOND_SI_FAIBLE_VOLUME = 30;

export const RESILIENCE_COUT_REF = 0.6;
export const RESILIENCE_FENETRE_JOURS = 60;

// ---------------------------------------------------------------------
// 5.8 — Usure des équipements
// ---------------------------------------------------------------------

export const KM_SEUIL_PAR_CATEGORIE = {
  chaussures: 700,
  sac: 2000,
  batons: 1500,
  veste: 2000,
  autre: 1000,
} as const;

export const USURE_ALERTE_RATIO = 0.8;
export const USURE_ALERTE_FORTE_RATIO = 1.0;

// ---------------------------------------------------------------------
// 5.9 — Check de forme (pour le Bloc 6 : affichage de tendance uniquement,
// aucun effet mécanique en v0)
// ---------------------------------------------------------------------

export const FORME_TENDANCE_FENETRE_JOURS = 14;
