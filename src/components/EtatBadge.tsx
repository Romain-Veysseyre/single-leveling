import type { Etat, NomRang } from '../config/balance';
import type { DetailPorteBloquante, PorteRang } from '../engine/rang';
import './EtatBadge.css';

const LIBELLE_PORTE: Record<PorteRang, string> = {
  longueSortie: 'ta plus longue sortie',
  hebdo: 'ton volume hebdo',
  dplus: 'ton dénivelé sur 30 jours',
};

const UNITE_PORTE: Record<PorteRang, string> = {
  longueSortie: 'KME',
  hebdo: 'KME',
  dplus: 'm',
};

function phrasePorte(rangAcquis: NomRang, detail: DetailPorteBloquante): string {
  const unite = UNITE_PORTE[detail.porte];
  return `Bloqué en ${rangAcquis} par ${LIBELLE_PORTE[detail.porte]} : ${Math.round(
    detail.requis,
  )} ${unite} requis, ${Math.round(detail.atteint)} ${unite} atteints.`;
}

export function EtatBadge({
  etat,
  rangAcquis,
  portesBloquantes,
}: {
  etat: Etat;
  rangAcquis: NomRang;
  portesBloquantes: DetailPorteBloquante[];
}) {
  return (
    <div className="etat-badge">
      <span className={`etat-badge__etat etat-badge__etat--${etat.toLowerCase()}`}>{etat}</span>
      <div className="etat-badge__portes">
        {portesBloquantes.length === 0 ? (
          <p>Rang maximum atteint.</p>
        ) : (
          portesBloquantes.map((detail) => <p key={detail.porte}>{phrasePorte(rangAcquis, detail)}</p>)
        )}
      </div>
    </div>
  );
}
