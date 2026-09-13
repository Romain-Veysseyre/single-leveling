# Single Leveling

PWA de trail gamifiée, mono-utilisateur, usage personnel. Voir [SPEC.md](./SPEC.md).

## Démarrage de séance

```bash
npm run dev    # serveur de développement
npm run test   # tests du moteur
```

Chaque `git push` sur `main` déclenche automatiquement le build, les tests
et le déploiement sur GitHub Pages (onglet **Actions** du dépôt) :
https://romain-veysseyre.github.io/single-leveling/

### Ouvrir le dev server depuis l'iPhone

`npm run dev` écoute sur le réseau local (`server.host` dans
`vite.config.ts`). Une fois lancé, le terminal affiche une adresse du
type `http://192.168.x.x:5173/` — sur l'iPhone, connecté au même WiFi,
ouvre `http://192.168.x.x:5173/single-leveling/` dans Safari. Cette
adresse IP dépend du réseau et peut changer d'une séance à l'autre :
se fier à celle affichée par le terminal (ligne « Network »), pas à une
valeur mémorisée. Si la connexion échoue, Windows a pu bloquer Node.js
dans le pare-feu au premier lancement — autoriser l'accès réseau privé
quand la fenêtre apparaît.

## Développement

```bash
npm install
npm run dev
```

## Tests

```bash
npm run test
```

## Build (GitHub Pages)

```bash
npm run build
```
