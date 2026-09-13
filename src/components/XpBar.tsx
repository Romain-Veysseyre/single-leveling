import type { ProgressionNiveau } from '../engine/niveau';
import './XpBar.css';

export function XpBar({ niveau, xpCourante, xpRequise }: ProgressionNiveau) {
  const pourcentage = xpRequise > 0 ? Math.min(100, (xpCourante / xpRequise) * 100) : 0;

  return (
    <div className="xp-bar">
      <div className="xp-bar__ligne">
        <span className="xp-bar__niveau">Niveau {niveau}</span>
        <span className="xp-bar__valeurs">
          {xpCourante} / {xpRequise} XP
        </span>
      </div>
      <div className="xp-bar__piste">
        <div className="xp-bar__remplissage" style={{ width: `${pourcentage}%` }} />
      </div>
    </div>
  );
}
