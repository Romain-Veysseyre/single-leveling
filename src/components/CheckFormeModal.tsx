import './CheckFormeModal.css';

const VALEURS = [1, 2, 3, 4, 5] as const;

export function CheckFormeModal({
  onChoisir,
  onPasser,
}: {
  onChoisir: (valeur: 1 | 2 | 3 | 4 | 5) => void;
  onPasser: () => void;
}) {
  return (
    <div className="check-forme__fond" role="dialog" aria-modal="true">
      <div className="check-forme__feuille">
        <h2>Comment tu te sens aujourd'hui ?</h2>
        <div className="check-forme__valeurs">
          {VALEURS.map((valeur) => (
            <button key={valeur} type="button" onClick={() => onChoisir(valeur)}>
              {valeur}
            </button>
          ))}
        </div>
        <button type="button" className="check-forme__passer" onClick={onPasser}>
          Passer
        </button>
      </div>
    </div>
  );
}
