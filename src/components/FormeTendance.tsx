import type { PointTendanceForme } from '../engine/formeTendance';
import './FormeTendance.css';

export function FormeTendance({ points }: { points: PointTendanceForme[] }) {
  return (
    <div className="forme-tendance" aria-label="Tendance de forme sur 14 jours">
      {points.map((p) => (
        <span
          key={p.date}
          className="forme-tendance__point"
          title={p.valeur ? `${p.date} : ${p.valeur}/5` : `${p.date} : pas de check`}
          style={{ opacity: p.valeur ? p.valeur / 5 : 0.15 }}
        />
      ))}
    </div>
  );
}
