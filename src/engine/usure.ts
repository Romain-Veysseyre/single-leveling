// Usure des équipements — SPEC.md section 5.8.
// usure(equipement) = Σ km réels des sorties le référençant. Km réels,
// pas KME : une chaussure s'use au kilomètre parcouru. Aucun bonus de
// stat, jamais.

import type { Equipement, Sortie } from '../types';
import {
  KM_SEUIL_PAR_CATEGORIE,
  USURE_ALERTE_RATIO,
  USURE_ALERTE_FORTE_RATIO,
} from '../config/balance';

export type NiveauAlerteUsure = 'ok' | 'alerte' | 'alerteForte';

export type UsureEquipement = {
  equipementId: string;
  kmParcourus: number;
  kmSeuil: number;
  ratio: number;
  niveauAlerte: NiveauAlerteUsure;
};

/** Seuil par défaut selon la catégorie (SPEC.md section 6), avant personnalisation par pièce. */
export function kmSeuilParDefaut(categorie: Equipement['categorie']): number {
  return KM_SEUIL_PAR_CATEGORIE[categorie];
}

export function usureEquipement(
  equipement: Equipement,
  sorties: readonly Sortie[],
): UsureEquipement {
  const kmParcourus = sorties
    .filter((s) => s.equipementIds.includes(equipement.id))
    .reduce((total, s) => total + s.km, 0);

  const ratio = equipement.kmSeuil > 0 ? kmParcourus / equipement.kmSeuil : 0;
  const niveauAlerte: NiveauAlerteUsure =
    ratio >= USURE_ALERTE_FORTE_RATIO ? 'alerteForte' : ratio >= USURE_ALERTE_RATIO ? 'alerte' : 'ok';

  return {
    equipementId: equipement.id,
    kmParcourus,
    kmSeuil: equipement.kmSeuil,
    ratio,
    niveauAlerte,
  };
}

export function usureTousEquipements(
  equipements: readonly Equipement[],
  sorties: readonly Sortie[],
): UsureEquipement[] {
  return equipements.map((e) => usureEquipement(e, sorties));
}
