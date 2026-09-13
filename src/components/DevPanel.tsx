import { useState } from 'react';
import { importJournal } from '../db/events';
import { construireJournalDemo } from '../dev/journalDemo';
import { deriveGameState } from '../engine/deriveGameState';
import { SCHEMA_VERSION, type JournalEvent } from '../types';
import './DevPanel.css';

export function DevPanel({
  events,
  onApresChangement,
  onFermer,
}: {
  events: JournalEvent[];
  onApresChangement: () => void;
  onFermer: () => void;
}) {
  const [vue, setVue] = useState<'menu' | 'json'>('menu');

  async function genererDemo() {
    const confirme = window.confirm(
      'Générer un journal de démonstration va effacer et remplacer TOUT le journal actuel, y compris tes vraies sorties. Continuer ?',
    );
    if (!confirme) return;
    const sortiesDemo = construireJournalDemo();
    await importJournal({ schemaVersion: SCHEMA_VERSION, events: sortiesDemo });
    onApresChangement();
  }

  async function viderJournal() {
    const confirme = window.confirm('Vider entièrement le journal ? Cette action est irréversible.');
    if (!confirme) return;
    await importJournal({ schemaVersion: SCHEMA_VERSION, events: [] });
    onApresChangement();
  }

  return (
    <div className="dev-panel__fond" role="dialog" aria-modal="true">
      <div className="dev-panel__feuille">
        <h2>Mode développeur</h2>

        {vue === 'menu' ? (
          <div className="dev-panel__actions">
            <button type="button" onClick={() => void genererDemo()}>
              Générer un journal de démo (90 jours)
            </button>
            <button type="button" onClick={() => void viderJournal()}>
              Vider le journal
            </button>
            <button type="button" onClick={() => setVue('json')}>
              Voir l'état de jeu en JSON
            </button>
          </div>
        ) : (
          <>
            <pre className="dev-panel__json">{JSON.stringify(deriveGameState(events), null, 2)}</pre>
            <button type="button" onClick={() => setVue('menu')}>
              Retour
            </button>
          </>
        )}

        <button type="button" className="dev-panel__fermer" onClick={onFermer}>
          Fermer
        </button>
      </div>
    </div>
  );
}
