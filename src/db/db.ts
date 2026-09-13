import Dexie, { type Table } from 'dexie';
import type { JournalEvent } from '../types';

class SingleLevelingDB extends Dexie {
  events!: Table<JournalEvent, string>;

  constructor() {
    super('single-leveling');
    this.version(1).stores({
      events: 'id, date, type',
    });
  }
}

export const db = new SingleLevelingDB();
