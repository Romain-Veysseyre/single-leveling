# SPEC.md — Single Leveling (application)

PWA de trail gamifiée, mono-utilisateur, usage personnel.
Ce document fait autorité. **Aucune valeur numérique ne doit être inventée.**
Si une constante manque, demander avant de coder.

---

## 1. Objectif

Saisir manuellement ses sorties de trail (km, D+, durée, RPE) et les transformer
en progression RPG : XP, niveau, rangs E → Souverain, 5 stats, avatar évolutif.

Bêta mono-utilisateur : pas de compte, pas de backend, pas de social, pas de
synchronisation. Une seule personne, un seul appareil, un iPhone.

---

## 2. Stack imposée

| Poste | Choix | Non négociable |
|---|---|---|
| Framework | React + TypeScript | oui |
| Build | Vite | oui |
| Persistance | Dexie sur IndexedDB | oui |
| Déploiement | GitHub Pages (`base` configurée dans `vite.config.ts`) | oui |
| Tests | Vitest | oui |
| Styles | CSS modules ou CSS simple | oui |

**Interdits explicites en v0 :** backend, service worker, bibliothèque de
composants (MUI, Chakra, shadcn…), routeur, gestionnaire d'état global
(Redux, Zustand), ORM, authentification, analytics.

**Cible : iPhone.** Le manifest PWA doit permettre l'installation depuis
Safari en plein écran (`display: standalone`, icônes 180×180 et 512×512,
balises `apple-mobile-web-app-*`). Aucune notification push : impossible sans
serveur sur iOS, et hors périmètre.

---

## 3. Principe architectural : journal d'événements

**Le stockage ne contient que des faits bruts.**
Aucun XP, niveau, rang ou stat n'est jamais écrit en base.
Tout est recalculé depuis le journal à chaque ouverture de l'application.

Raison : la formule d'XP et la grille de rangs vont être retouchées chaque
semaine pendant deux mois. Une valeur dérivée stockée devient un mensonge dès
la première retouche. Une valeur dérivée se réécrit seule.

Le moteur de dérivation doit être un ensemble de **fonctions pures**, sans
accès à la base, testables en isolation, prenant le journal en entrée et
retournant l'état de jeu complet.

### Unique exception

Le champ `ratioCharge` d'une sortie est **figé au moment de la saisie** et
stocké sur l'événement. C'est un fait daté : il dépend de l'état du journal à
l'instant T. Les seuils qui le transforment en multiplicateur restent, eux,
dans la configuration et donc retouchables.

Conséquence voulue : **l'XP déjà gagnée ne baisse jamais rétroactivement.**

---

## 4. Modèle de données

Trois types d'événements dans une table Dexie unique `events`, triée par `date`.

Dates au format `YYYY-MM-DD` (date locale, pas d'horodatage, pas de fuseau).
Identifiants via `crypto.randomUUID()`.

### 4.1 Sortie

```ts
type Sortie = {
  id: string;
  type: 'sortie';
  date: string;          // YYYY-MM-DD
  km: number;            // km réels, > 0
  denivele: number;      // D+ en mètres, >= 0
  dureeMin: number;      // minutes, > 0
  rpe: number;           // entier 1..10, échelle CR10
  ratioCharge: number;   // figé à la saisie, voir 5.2
  equipementIds: string[];
  note?: string;
};
```

### 4.2 Check de forme

```ts
type CheckForme = {
  id: string;
  type: 'forme';
  date: string;          // un seul par jour, le dernier écrase
  valeur: 1 | 2 | 3 | 4 | 5;
};
```

### 4.3 Équipement

```ts
type Equipement = {
  id: string;
  type: 'equipement';
  date: string;              // date d'achat / mise en service
  nom: string;
  categorie: 'chaussures' | 'sac' | 'batons' | 'veste' | 'autre';
  kmSeuil: number;           // défaut selon catégorie, voir 6
  actif: boolean;
};
```

---

## 5. Moteur de dérivation

### 5.1 Km-effort (KME)

```
KME = km + denivele / 100
```

Unité de base de tout le système. Le D+ est déjà contenu dedans : il ne doit
jamais être recompté ailleurs dans le calcul d'XP ou de rang.

### 5.2 Charge et ratio

```
charge(sortie) = rpe × dureeMin                     // sRPE
```

Au moment de la saisie d'une sortie datée J :

```
CA = somme des charges sur [J-6, J]     inclut la sortie saisie
CC = somme des charges sur [J-27, J] / 4
ratioCharge = CA / CC
```

**Neutralisation à l'amorçage.** Si moins de 28 jours séparent le premier
événement du journal de la date J, ou si `CC == 0`, alors `ratioCharge = 1.0`.
Sans cette règle, les premières semaines produisent des ratios délirants et
l'XP est écrasée dès le départ.

### 5.3 Multiplicateur et état

Dérivé de `ratioCharge`, jamais stocké :

| ratioCharge | multiplicateur | état |
|---|---|---|
| ≤ 1.30 | 1.00 | `AFFUTE` |
| > 1.30 et ≤ 1.50 | 0.60 | `CHARGE` |
| > 1.50 | 0.30 | `EPUISE` |

L'état n'est pas une sanction. Il s'affiche sur l'avatar et explique pourquoi
l'XP du jour est réduite. Rien n'est retiré, seul le gain est diminué.

### 5.4 XP

```
xp(sortie) = round( XP_COEF × KME^ALPHA × multiplicateur )
```

Avec `XP_COEF = 10` et `ALPHA = 0.8`.

Repères de contrôle (multiplicateur 1.0), à vérifier en test :

| Sortie | KME | XP |
|---|---|---|
| 10 km plat | 10 | 63 |
| 15 km / 600 D+ | 21 | 114 |
| 45 km / 2000 D+ | 65 | 282 |
| 2 × (20 km / ...) | 20 + 20 | 220 |
| 1 × équivalent | 40 | 191 |

L'exposant concave garantit que **deux sorties moyennes battent une grosse
sortie**. C'est le réglage anti-volume principal. `ALPHA` est la molette la
plus sensible du système.

**L'intensité ne module jamais l'XP.** Le RPE n'entre dans l'XP que par le
ratio de charge. Il alimente sinon les stats. Deux monnaies distinctes.

### 5.5 Niveau

Le joueur démarre au **niveau 0**.

```
xpPourNiveauSuivant(n) = XP_NIVEAU_BASE + XP_NIVEAU_INCREMENT × n
                       = 100 + 40 × n
```

Cumul pour atteindre le niveau n : `100n + 20n(n-1)`

| Niveau | XP cumulée |
|---|---|
| 1 | 100 |
| 5 | 900 |
| 10 | 2 800 |
| 20 | 9 600 |
| 30 | 20 400 |
| 50 | 54 000 |

Le niveau ne redescend jamais. Le passage 0 → 1 doit intervenir à la première
ou deuxième sortie : c'est l'éclosion de l'œuf « Niveau 0 » du visuel.

### 5.6 Rangs

Le rang mesure une capacité démontrée, pas une ancienneté. Il ne s'achète pas
avec de l'XP.

| Rang | KME plus longue sortie | KME hebdo moyen (4 sem.) | Repère réel |
|---|---|---|---|
| `E` | 12 | 20 | premier trail |
| `D` | 22 | 30 | trail court |
| `C` | 35 | 42 | trail 25 km |
| `B` | 50 | 55 | trail long |
| `A` | 70 | 70 | Marathon du Mont-Blanc |
| `S` | 90 | 85 | OCC |
| `SS` | 120 | 105 | Templiers |
| `SSS` | 165 | 135 | CCC |
| `MONARQUE` | 270 | 190 | UTMB, Diagonale des Fous |
| `SOUVERAIN` | 450 | 260 | Tor des Géants, Barkley |

**Règles :**

1. Deux portes. Le rang courant est **le plus faible des deux** rangs obtenus
   séparément sur chaque colonne.
2. `plus longue sortie` = maximum de KME sur **tout l'historique**.
3. `KME hebdo moyen` = somme des KME sur les 28 derniers jours ÷ 4.
4. **Plancher D+ à partir de `S`** : franchir `S` ou au-delà exige
   D+ cumulé ≥ 2500 m sur 30 jours glissants. C'est une condition de
   franchissement, pas de maintien.
5. **Le rang est acquis définitivement.** Implémentation : rejouer le journal
   chronologiquement, calculer le rang courant après chaque sortie, conserver
   le maximum atteint. Rien n'est stocké.
6. L'interface affiche le rang acquis, l'état courant (5.3), et **la porte qui
   bloque** : « bloqué en C par ton volume hebdo » est exploitable,
   « il te manque 4 000 XP » ne l'est pas.

### 5.7 Les 5 stats

Toutes sur une échelle 0–100, toutes dérivées de km, D+, durée et RPE.
Arrondi à l'entier. Bornage strict `clamp(0, 100)`.

| Stat | Formule | Fenêtre |
|---|---|---|
| **Endurance** | `100 × (maxKME / 270)^0.7` | 90 j glissants |
| **Ascension** | `100 × (sommeDplus / 12000)^0.7` | 30 j glissants |
| **Vélocité** | `100 × (vEq − 5) / 9` | 30 j glissants |
| **Constance** | `100 × (1 − CV)` | 8 semaines pleines |
| **Résilience** | `100 × (0.60 / coutMoyen)` | 60 j glissants |

Détails :

- `vEq = Σ KME / Σ heures` sur la fenêtre. Vitesse équivalente à plat, en km/h.
- `CV` = écart-type ÷ moyenne du KME hebdomadaire sur 8 semaines pleines.
  **Garde-fou :** si la moyenne hebdo < 10 KME, la stat est plafonnée à 30.
  Sans ça, ne rien faire régulièrement donne une constance parfaite.
- `cout(sortie) = rpe / √KME`. `coutMoyen` = moyenne pondérée par le KME.
  Plus le coût baisse à charge égale, plus la stat monte.

**Résilience est la seule stat qui progresse pendant une semaine de décharge.**
C'est ce qui justifie la saisie du RPE. Ne pas la retirer.

Repères de contrôle à vérifier en test :

| Cas | Stat | Attendu |
|---|---|---|
| maxKME 90 (rang S) | Endurance | 46 |
| D+ 30 j = 2500 | Ascension | 33 |
| vEq 10 km/h | Vélocité | 56 |
| CV 0.20 | Constance | 80 |
| KME 20 à RPE 5 | Résilience | 54 |
| KME 20 à RPE 3 | Résilience | 89 |

### 5.8 Panoplie

```
usure(equipement) = Σ km réels des sorties le référençant
```

**Km réels, pas KME.** Une chaussure s'use au kilomètre parcouru.

- Seuils par défaut : chaussures 700 km, sac 2000 km, bâtons 1500 km,
  veste 2000 km, autre 1000 km. Modifiables par pièce.
- Alerte visuelle à 80 % du seuil, alerte forte à 100 %.
- **Aucun bonus de stat, jamais.** Un équipement qui améliore une stat pousse
  à acheter pour progresser et pollue la lecture des stats. Le rôle de la
  panoplie est l'usure réelle et l'habillage de l'avatar.

### 5.9 Check de forme

Une question, cinq niveaux, un tap, au lancement de l'application, une fois
par jour, toujours passable.

En v0 : capturé, stocké, affiché sous forme de tendance sur 14 jours.
**Aucun effet mécanique.** Le moteur de missions arrive plus tard et sera réglé
sur deux mois de données réelles.

Règles déjà arbitrées, à respecter quand les missions seront implémentées, et
à ne surtout pas coder maintenant :

- La forme ne touche **jamais** l'XP. Sinon l'auto-évaluation est corrompue.
- Asymétrie stricte : la forme peut **alléger** la mission du jour, jamais
  l'augmenter.
- Décharge déclenchée par 3 jours consécutifs à `valeur ≤ 2`, ou 2 jours
  consécutifs si l'état courant est `CHARGE` ou `EPUISE`.

---

## 6. Fichier de configuration

**Toutes** les constantes ci-dessus dans un seul fichier `src/config/balance.ts`,
exporté, commenté, sans aucune valeur numérique dupliquée ailleurs dans le code.

Ce fichier sera modifié chaque semaine pendant deux mois. Une constante en dur
dans un composant est un bug.

Contenu minimal : `XP_COEF`, `ALPHA`, `XP_NIVEAU_BASE`, `XP_NIVEAU_INCREMENT`,
les trois seuils de ratio et leurs multiplicateurs, la grille de rangs complète,
le plancher D+, les six références de stats, les fenêtres glissantes, les
seuils d'usure par catégorie.

---

## 7. Écran v0

**Un seul écran. Pas de navigation, pas de menu, pas de routeur.**

Composition, de haut en bas, sur l'image de fond fournie dans
`public/assets/menu-bg.png` :

1. Badge de rang, en haut à droite.
2. Niveau et barre d'XP vers le niveau suivant, avec XP courante / XP requise.
3. État courant (`AFFUTE` / `CHARGE` / `EPUISE`) et la porte qui bloque le rang.
4. Les 5 stats, valeur et barre.
5. Bouton principal « Saisir une sortie », ouvrant une feuille modale :
   date, km, D+, durée, RPE, équipements portés, note. Validation stricte des
   bornes définies en 4.1.
6. Après validation : animation courte du gain d'XP, et de la montée de niveau
   ou de rang le cas échéant.
7. Au lancement, une fois par jour : le check de forme, passable.
8. En pied d'écran, discret : export JSON, import JSON.

L'export produit le journal complet plus un numéro de version de schéma.
L'import remplace intégralement le journal, après confirmation explicite.
**L'export doit passer par la feuille de partage iOS** afin de pouvoir déposer
le fichier dans iCloud Drive en un tap. C'est le seul filet contre une purge du
stockage navigateur. Relance automatique proposée toutes les 10 sorties.

---

## 8. Périmètre

### Dans la v0

Journal d'événements, moteur de dérivation complet (5.1 à 5.8), configuration
centralisée, écran unique, saisie de sortie, check de forme, export/import JSON,
manifest PWA, tests unitaires du moteur.

Le modèle de données `Equipement` et le calcul d'usure sont **dans la v0**,
même si leur interface arrive plus tard : le journal doit être correct dès le
premier jour.

### Hors v0, à ne pas anticiper

Interface panoplie, missions journalières et hebdomadaires, plan d'entraînement
vers une course cible, référentiel de massifs et sentiers, import CSV depuis
Excel, avatar animé, service worker, offline, notifications, comptes, partage.

Un dossier `public/assets/avatar/` accueillera des PNG rendus sous Blender
selon la convention `rang_etat.png`, par exemple `E_AFFUTE.png`. En v0, une
silhouette provisoire unique suffit.

---

## 9. Règles de collaboration attendues

1. Écrire un plan complet et attendre validation **avant** d'écrire du code.
2. S'arrêter après chaque bloc numéroté de la séance et attendre le feu vert.
3. Un commit Git par bloc validé, message en français.
4. Ne deviner aucune valeur numérique. Toutes sont ci-dessus. Si l'une manque,
   poser la question.
5. Ne pas ajouter de dépendance non listée en section 2 sans la proposer et
   obtenir un accord.
6. Tests unitaires du moteur avec les repères de contrôle des sections 5.4
   et 5.7 comme cas de test. Ils doivent passer avant de toucher à l'interface.
