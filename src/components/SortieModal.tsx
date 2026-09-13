import { useState } from 'react';
import type { Equipement } from '../types';
import { aujourdHui } from '../engine/dateUtils';
import './SortieModal.css';

export type DonneesSortie = {
  date: string;
  km: number;
  denivele: number;
  dureeMin: number;
  rpe: number;
  equipementIds: string[];
  note?: string;
};

const RPE_VALEURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function parseNombre(texte: string): number {
  return Number(texte.trim().replace(',', '.'));
}

export function SortieModal({
  equipements,
  onValider,
  onFermer,
}: {
  equipements: Equipement[];
  onValider: (donnees: DonneesSortie) => void;
  onFermer: () => void;
}) {
  const [date, setDate] = useState(aujourdHui());
  const [kmTexte, setKmTexte] = useState('');
  const [deniveleTexte, setDeniveleTexte] = useState('');
  const [dureeTexte, setDureeTexte] = useState('');
  const [rpe, setRpe] = useState<number | null>(null);
  const [equipementIds, setEquipementIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);

  function basculerEquipement(id: string) {
    setEquipementIds((actuel) =>
      actuel.includes(id) ? actuel.filter((e) => e !== id) : [...actuel, id],
    );
  }

  function valider() {
    const km = parseNombre(kmTexte);
    const denivele = parseNombre(deniveleTexte);
    const dureeMin = parseNombre(dureeTexte);

    if (!(km > 0)) return setErreur('Km : entre un nombre supérieur à 0.');
    if (!(denivele >= 0)) return setErreur('D+ : entre un nombre supérieur ou égal à 0.');
    if (!(dureeMin > 0)) return setErreur('Durée : entre un nombre supérieur à 0.');
    if (rpe === null) return setErreur('Choisis un RPE.');
    if (!date) return setErreur('Choisis une date.');

    setErreur(null);
    onValider({ date, km, denivele, dureeMin, rpe, equipementIds, note: note.trim() || undefined });
  }

  return (
    <div className="sortie-modal__fond" role="dialog" aria-modal="true">
      <div className="sortie-modal__feuille">
        <h2>Saisir une sortie</h2>

        <label className="sortie-modal__champ">
          Date
          <input type="date" value={date} max={aujourdHui()} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label className="sortie-modal__champ">
          Km
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={kmTexte}
            onChange={(e) => setKmTexte(e.target.value)}
          />
        </label>

        <label className="sortie-modal__champ">
          D+ (m)
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={deniveleTexte}
            onChange={(e) => setDeniveleTexte(e.target.value)}
          />
        </label>

        <label className="sortie-modal__champ">
          Durée (min)
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={dureeTexte}
            onChange={(e) => setDureeTexte(e.target.value)}
          />
        </label>

        <div className="sortie-modal__champ">
          RPE
          <div className="sortie-modal__rpe">
            {RPE_VALEURS.map((valeur) => (
              <button
                key={valeur}
                type="button"
                className={`sortie-modal__rpe-bouton${rpe === valeur ? ' sortie-modal__rpe-bouton--actif' : ''}`}
                onClick={() => setRpe(valeur)}
              >
                {valeur}
              </button>
            ))}
          </div>
        </div>

        <div className="sortie-modal__champ">
          Équipements portés
          {equipements.length === 0 ? (
            <p className="sortie-modal__note-vide">Aucun équipement enregistré.</p>
          ) : (
            <div className="sortie-modal__equipements">
              {equipements.map((equipement) => (
                <label key={equipement.id} className="sortie-modal__equipement">
                  <input
                    type="checkbox"
                    checked={equipementIds.includes(equipement.id)}
                    onChange={() => basculerEquipement(equipement.id)}
                  />
                  {equipement.nom}
                </label>
              ))}
            </div>
          )}
        </div>

        <label className="sortie-modal__champ">
          Note (optionnel)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </label>

        {erreur && <p className="sortie-modal__erreur">{erreur}</p>}

        <div className="sortie-modal__actions">
          <button type="button" onClick={onFermer}>
            Annuler
          </button>
          <button type="button" onClick={valider}>
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
