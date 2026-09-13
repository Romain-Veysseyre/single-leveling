import { useRef } from 'react';
import { exportJournal, importJournal } from '../db/events';
import type { JournalExport } from '../types';
import { aujourdHui } from '../engine/dateUtils';
import './ExportImport.css';

export async function exporterJournal(): Promise<void> {
  const data = await exportJournal();
  const json = JSON.stringify(data, null, 2);
  const nomFichier = `single-leveling-export-${aujourdHui()}.json`;
  const fichier = new File([json], nomFichier, { type: 'application/json' });

  const partageable = 'canShare' in navigator && navigator.canShare?.({ files: [fichier] });
  if (partageable) {
    await navigator.share({ files: [fichier], title: 'Export Single Leveling' });
    return;
  }

  const url = URL.createObjectURL(fichier);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier;
  lien.click();
  URL.revokeObjectURL(url);
}

export function ExportImport({ onApresImport }: { onApresImport: () => void }) {
  const inputFichierRef = useRef<HTMLInputElement>(null);

  async function gererImport(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier) return;

    const confirme = window.confirm(
      "Importer ce fichier va remplacer intégralement ton journal actuel. Continuer ?",
    );
    if (!confirme) return;

    const texte = await fichier.text();
    const data = JSON.parse(texte) as JournalExport;
    await importJournal(data);
    onApresImport();
  }

  return (
    <div className="export-import">
      <button type="button" onClick={() => void exporterJournal()}>
        Exporter le journal
      </button>
      <button type="button" onClick={() => inputFichierRef.current?.click()}>
        Importer un journal
      </button>
      <input
        ref={inputFichierRef}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => void gererImport(e)}
      />
    </div>
  );
}
