import type { Equipement, JournalEvent } from '../types';

export function EcranPanoplie({
  events,
}: {
  events: JournalEvent[];
  rechargerEvents: () => Promise<JournalEvent[]>;
}) {
  const nombreEquipements = events.filter((e): e is Equipement => e.type === 'equipement').length;

  return (
    <main className="app__contenu">
      <p>Panoplie — écran à venir ({nombreEquipements} équipement(s) enregistré(s)).</p>
    </main>
  );
}
