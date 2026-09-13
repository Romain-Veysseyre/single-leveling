import type { StatsJoueur } from '../engine/deriveGameState';
import { STAT_MAX } from '../config/balance';
import './StatsPanel.css';

const LABELS: { cle: keyof StatsJoueur; label: string }[] = [
  { cle: 'endurance', label: 'Endurance' },
  { cle: 'ascension', label: 'Ascension' },
  { cle: 'velocite', label: 'Vélocité' },
  { cle: 'constance', label: 'Constance' },
  { cle: 'resilience', label: 'Résilience' },
];

export function StatsPanel({ stats }: { stats: StatsJoueur }) {
  return (
    <div className="stats-panel">
      {LABELS.map(({ cle, label }) => {
        const valeur = stats[cle];
        return (
          <div className="stats-panel__ligne" key={cle}>
            <span className="stats-panel__label">{label}</span>
            <div className="stats-panel__piste">
              <div
                className="stats-panel__remplissage"
                style={{ width: `${valeur === null ? 0 : (valeur / STAT_MAX) * 100}%` }}
              />
            </div>
            <span className="stats-panel__valeur">{valeur === null ? '—' : valeur}</span>
          </div>
        );
      })}
    </div>
  );
}
