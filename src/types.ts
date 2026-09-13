// Modèle de données — journal d'événements (SPEC.md section 4).
// Seuls des faits bruts sont représentés ici. Rien de dérivé (XP, niveau,
// rang, stats) n'apparaît dans ces types : voir src/engine/ pour ça.

export type Sortie = {
  id: string;
  type: 'sortie';
  date: string; // YYYY-MM-DD, date locale
  km: number; // km réels, > 0
  denivele: number; // D+ en mètres, >= 0
  dureeMin: number; // minutes, > 0
  rpe: number; // entier 1..10, échelle CR10
  ratioCharge: number; // figé à la saisie, voir SPEC.md 5.2
  equipementIds: string[];
  note?: string;
};

export type CheckForme = {
  id: string;
  type: 'forme';
  date: string; // YYYY-MM-DD, un seul par jour, le dernier écrase
  valeur: 1 | 2 | 3 | 4 | 5;
};

export type CategorieEquipement = 'chaussures' | 'sac' | 'batons' | 'veste' | 'autre';

export type Equipement = {
  id: string;
  type: 'equipement';
  date: string; // date d'achat / mise en service, YYYY-MM-DD
  nom: string;
  categorie: CategorieEquipement;
  kmSeuil: number; // défaut selon catégorie, voir src/config/balance.ts
  actif: boolean;
};

export type JournalEvent = Sortie | CheckForme | Equipement;

export const SCHEMA_VERSION = 1;

export type JournalExport = {
  schemaVersion: number;
  events: JournalEvent[];
};
