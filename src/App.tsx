import { useEffect, useState } from 'react';
import './App.css';
import { getAllEvents } from './db/events';
import type { JournalEvent } from './types';
import { EcranAccueil } from './components/EcranAccueil';
import { EcranPanoplie } from './components/EcranPanoplie';

type Ecran = 'accueil' | 'panoplie';

function App() {
  const [events, setEvents] = useState<JournalEvent[]>([]);
  const [pret, setPret] = useState(false);
  const [ecran, setEcran] = useState<Ecran>('accueil');

  async function rechargerEvents() {
    const tous = await getAllEvents();
    setEvents(tous);
    return tous;
  }

  useEffect(() => {
    rechargerEvents().then(() => setPret(true));
  }, []);

  if (!pret) return null;

  return (
    <div
      className="app"
      style={{ backgroundImage: `url(${import.meta.env.BASE_URL}assets/menu-bg.png)` }}
    >
      {ecran === 'accueil' ? (
        <EcranAccueil events={events} rechargerEvents={rechargerEvents} />
      ) : (
        <EcranPanoplie events={events} rechargerEvents={rechargerEvents} />
      )}

      <nav className="app__barre-onglets">
        <button
          type="button"
          className={`app__onglet${ecran === 'accueil' ? ' app__onglet--actif' : ''}`}
          onClick={() => setEcran('accueil')}
        >
          Accueil
        </button>
        <button
          type="button"
          className={`app__onglet${ecran === 'panoplie' ? ' app__onglet--actif' : ''}`}
          onClick={() => setEcran('panoplie')}
        >
          Panoplie
        </button>
      </nav>
    </div>
  );
}

export default App;
