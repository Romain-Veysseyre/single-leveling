import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { getAllEvents, addSortie, upsertCheckForme } from './db/events';
import type { CheckForme, Equipement, JournalEvent, Sortie } from './types';
import { deriveGameState } from './engine/deriveGameState';
import { calculerRatioCharge } from './engine/charge';
import { aujourdHui } from './engine/dateUtils';
import { tendanceForme } from './engine/formeTendance';
import { RankBadge } from './components/RankBadge';
import { XpBar } from './components/XpBar';
import { EtatBadge } from './components/EtatBadge';
import { StatsPanel } from './components/StatsPanel';
import { SortieModal, type DonneesSortie } from './components/SortieModal';
import { CheckFormeModal } from './components/CheckFormeModal';
import { ExportImport } from './components/ExportImport';
import { FormeTendance } from './components/FormeTendance';

type GainAffiche = {
  xp: number;
  niveauSuperieur: number | null;
  rangSuperieur: string | null;
};

function App() {
  const [events, setEvents] = useState<JournalEvent[]>([]);
  const [pret, setPret] = useState(false);
  const [modalSortieOuverte, setModalSortieOuverte] = useState(false);
  const [formePasseeCetteSession, setFormePasseeCetteSession] = useState(false);
  const [gainAffiche, setGainAffiche] = useState<GainAffiche | null>(null);
  const [rappelExportVisible, setRappelExportVisible] = useState(false);

  async function rechargerEvents() {
    const tous = await getAllEvents();
    setEvents(tous);
    return tous;
  }

  useEffect(() => {
    rechargerEvents().then(() => setPret(true));
  }, []);

  useEffect(() => {
    if (!gainAffiche) return;
    const minuteur = setTimeout(() => setGainAffiche(null), 4000);
    return () => clearTimeout(minuteur);
  }, [gainAffiche]);

  const gameState = useMemo(() => deriveGameState(events), [events]);

  const equipements = useMemo(
    () => events.filter((e): e is Equipement => e.type === 'equipement'),
    [events],
  );

  const formeAujourdhui = useMemo(
    () => events.find((e): e is CheckForme => e.type === 'forme' && e.date === aujourdHui()),
    [events],
  );

  const afficherCheckForme = pret && !formeAujourdhui && !formePasseeCetteSession;

  const pointsTendanceForme = useMemo(() => tendanceForme(events, aujourdHui()), [events]);

  async function gererValiderSortie(donnees: DonneesSortie) {
    const etatAvant = gameState;
    const sortiesExistantes = events.filter((e): e is Sortie => e.type === 'sortie');

    const candidatePourCalcul: Sortie = {
      id: 'candidate',
      type: 'sortie',
      date: donnees.date,
      km: donnees.km,
      denivele: donnees.denivele,
      dureeMin: donnees.dureeMin,
      rpe: donnees.rpe,
      ratioCharge: 1,
      equipementIds: donnees.equipementIds,
      note: donnees.note,
    };
    const ratioCharge = calculerRatioCharge([...sortiesExistantes, candidatePourCalcul], donnees.date);

    await addSortie({ ...donnees, ratioCharge });
    const nouveauxEvents = await rechargerEvents();
    const etatApres = deriveGameState(nouveauxEvents);

    setGainAffiche({
      xp: etatApres.xpTotale - etatAvant.xpTotale,
      niveauSuperieur: etatApres.niveau.niveau > etatAvant.niveau.niveau ? etatApres.niveau.niveau : null,
      rangSuperieur:
        etatApres.rang.rangAcquis !== etatAvant.rang.rangAcquis ? etatApres.rang.rangAcquis : null,
    });
    setModalSortieOuverte(false);

    const totalSorties = nouveauxEvents.filter((e) => e.type === 'sortie').length;
    if (totalSorties > 0 && totalSorties % 10 === 0) {
      setRappelExportVisible(true);
    }
  }

  async function gererChoixForme(valeur: 1 | 2 | 3 | 4 | 5) {
    await upsertCheckForme(aujourdHui(), valeur);
    await rechargerEvents();
  }

  if (!pret) return null;

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/menu-bg.png)` }}
    >
      <header className="app__entete">
        <RankBadge rang={gameState.rang.rangAcquis} />
      </header>

      <main className="app__contenu">
        <XpBar
          niveau={gameState.niveau.niveau}
          xpCourante={gameState.niveau.xpCourante}
          xpRequise={gameState.niveau.xpRequise}
        />

        <EtatBadge
          etat={gameState.etatCourant}
          rangAcquis={gameState.rang.rangAcquis}
          portesBloquantes={gameState.rang.portesBloquantes}
        />

        <StatsPanel stats={gameState.stats} />

        <button type="button" className="app__bouton-saisie" onClick={() => setModalSortieOuverte(true)}>
          Saisir une sortie
        </button>

        {gainAffiche && (
          <div className="app__gain">
            <p>+{gainAffiche.xp} XP</p>
            {gainAffiche.niveauSuperieur !== null && <p>Niveau {gainAffiche.niveauSuperieur} !</p>}
            {gainAffiche.rangSuperieur !== null && <p>Rang {gainAffiche.rangSuperieur} !</p>}
          </div>
        )}

        {rappelExportVisible && (
          <div className="app__rappel-export">
            <p>10 sorties enregistrées. Pense à exporter ton journal.</p>
            <button type="button" onClick={() => setRappelExportVisible(false)}>
              Plus tard
            </button>
          </div>
        )}
      </main>

      <footer className="app__pied">
        <FormeTendance points={pointsTendanceForme} />
        <ExportImport onApresImport={rechargerEvents} />
      </footer>

      {modalSortieOuverte && (
        <SortieModal
          equipements={equipements}
          onValider={(donnees) => void gererValiderSortie(donnees)}
          onFermer={() => setModalSortieOuverte(false)}
        />
      )}

      {afficherCheckForme && (
        <CheckFormeModal
          onChoisir={(valeur) => void gererChoixForme(valeur)}
          onPasser={() => setFormePasseeCetteSession(true)}
        />
      )}
    </div>
  );
}

export default App;
