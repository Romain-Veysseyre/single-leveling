// Lecture et écriture du journal d'événements (SPEC.md section 4).
// Seuls des faits bruts transitent ici. Aucune valeur dérivée
// (XP, niveau, rang, stats) n'est jamais écrite en base.

import { db } from './db';
import { calculerRatioCharge } from '../engine/charge';
import {
  SCHEMA_VERSION,
  type CheckForme,
  type Equipement,
  type JournalEvent,
  type JournalExport,
  type Sortie,
} from '../types';

function validerSortie(data: Pick<Sortie, 'km' | 'denivele' | 'dureeMin' | 'rpe'>): void {
  if (!(data.km > 0)) throw new Error('km doit être > 0');
  if (!(data.denivele >= 0)) throw new Error('denivele doit être >= 0');
  if (!(data.dureeMin > 0)) throw new Error('dureeMin doit être > 0');
  if (!Number.isInteger(data.rpe) || data.rpe < 1 || data.rpe > 10) {
    throw new Error('rpe doit être un entier entre 1 et 10');
  }
}

/** Tous les événements du journal, triés par date croissante. */
export async function getAllEvents(): Promise<JournalEvent[]> {
  const events = await db.events.toArray();
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getSorties(): Promise<Sortie[]> {
  const events = await getAllEvents();
  return events.filter((e): e is Sortie => e.type === 'sortie');
}

export async function getEquipements(): Promise<Equipement[]> {
  const events = await getAllEvents();
  return events.filter((e): e is Equipement => e.type === 'equipement');
}

/**
 * Enregistre une sortie. `ratioCharge` doit déjà avoir été calculé par
 * l'appelant (voir src/engine/charge.ts) : cette fonction ne fait
 * qu'écrire le fait brut, elle n'accède à aucune logique de dérivation.
 */
export async function addSortie(data: Omit<Sortie, 'id' | 'type'>): Promise<Sortie> {
  validerSortie(data);
  const sortie: Sortie = { ...data, id: crypto.randomUUID(), type: 'sortie' };
  await db.events.add(sortie);
  return sortie;
}

/** Un seul check de forme par jour : le dernier écrase la valeur. */
export async function upsertCheckForme(
  date: string,
  valeur: CheckForme['valeur'],
): Promise<CheckForme> {
  const existant = (await db.events.where('date').equals(date).toArray()).find(
    (e): e is CheckForme => e.type === 'forme',
  );

  if (existant) {
    const misAJour: CheckForme = { ...existant, valeur };
    await db.events.put(misAJour);
    return misAJour;
  }

  const cree: CheckForme = { id: crypto.randomUUID(), type: 'forme', date, valeur };
  await db.events.add(cree);
  return cree;
}

export async function addEquipement(data: Omit<Equipement, 'id' | 'type'>): Promise<Equipement> {
  const equipement: Equipement = { ...data, id: crypto.randomUUID(), type: 'equipement' };
  await db.events.add(equipement);
  return equipement;
}

export async function updateEquipement(equipement: Equipement): Promise<void> {
  await db.events.put(equipement);
}

/**
 * Recalcule le ratioCharge de toutes les sorties, en rejouant le journal
 * dans l'ordre chronologique. Action manuelle uniquement (SPEC.md 5.2) :
 * jamais appelée automatiquement. Sert après une saisie antidatée ou un
 * import.
 */
export async function recalculerRatiosCharge(): Promise<void> {
  const sorties = await getSorties();

  const misesAJour: Sortie[] = sorties.map((sortie, index) => {
    const sortiesJusquIci = sorties.slice(0, index + 1);
    const ratioCharge = calculerRatioCharge(sortiesJusquIci, sortie.date);
    return { ...sortie, ratioCharge };
  });

  await db.events.bulkPut(misesAJour);
}

/** Journal complet + numéro de version de schéma (SPEC.md section 7). */
export async function exportJournal(): Promise<JournalExport> {
  const events = await getAllEvents();
  return { schemaVersion: SCHEMA_VERSION, events };
}

/** Remplace intégralement le journal. La confirmation utilisateur est à la charge de l'appelant (UI). */
export async function importJournal(data: JournalExport): Promise<void> {
  if (data.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(`Version de schéma non supportée : ${data.schemaVersion}`);
  }
  await db.transaction('rw', db.events, async () => {
    await db.events.clear();
    await db.events.bulkAdd(data.events);
  });
}
