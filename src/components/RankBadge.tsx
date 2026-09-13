import type { NomRang } from '../config/balance';
import './RankBadge.css';

export function RankBadge({ rang }: { rang: NomRang }) {
  return (
    <div className="rank-badge">
      <span className="rank-badge__label">Rang</span>
      <span className="rank-badge__valeur">{rang}</span>
    </div>
  );
}
