# Prompt — Séance 1

À coller intégralement dans Claude Code, dans le dossier du projet.

---

Je construis une PWA de trail gamifiée, mono-utilisateur, pour mon usage
personnel sur iPhone. Lis `SPEC.md` en entier avant d'écrire quoi que ce soit.

Le projet est vide. Tu pars de zéro.

Stack imposée : React + TypeScript + Vite, Dexie sur IndexedDB, déploiement
GitHub Pages, tests avec Vitest. Pas de backend, pas de service worker, pas de
routeur, pas de bibliothèque de composants, pas de gestionnaire d'état global.

SÉANCE 1, périmètre strict, dans cet ordre :

1. Initialisation du projet Vite + React + TypeScript, configuration de `base`
   pour GitHub Pages, manifest PWA installable en plein écran sur iOS.

2. Le modèle de données en journal d'événements, section 4 du SPEC : les trois
   types d'événements, la table Dexie, les fonctions de lecture et d'écriture.
   Seuls les faits bruts sont stockés.

3. Le moteur de dérivation, section 5 du SPEC : KME, charge et ratio, XP,
   niveau, rang, les 5 stats, l'usure des équipements. Fonctions pures, sans
   accès à la base, prenant le journal en entrée.

4. Les tests Vitest du moteur, en utilisant les repères de contrôle des
   sections 5.4 et 5.7 du SPEC comme cas de test. Ils doivent tous passer
   avant de continuer.

5. Toutes les constantes dans `src/config/balance.ts`, section 6 du SPEC.
   Aucune valeur numérique en dur ailleurs dans le code.

6. L'écran unique, section 7 du SPEC : fond, badge de rang, barre d'XP, état,
   les 5 stats, bouton de saisie avec feuille modale, check de forme au
   lancement, export et import JSON en pied d'écran.

NE FAIS PAS : navigation, routeur, interface panoplie, missions, plan
d'entraînement, massifs, avatar animé, service worker, mode hors ligne,
notifications, compte utilisateur, import CSV.

Méthode de travail :

- Écris d'abord un plan complet que je valide, avant de coder.
- Arrête-toi après chaque bloc numéroté et attends mon feu vert.
- Un commit Git par bloc validé, message en français.
- Ne devine aucune valeur numérique : elles sont toutes dans `SPEC.md`. Si
  l'une manque ou te semble ambiguë, demande-la moi au lieu de l'inventer.
- N'ajoute aucune dépendance non listée sans me la proposer d'abord.

Commence par lire `SPEC.md` et me présenter ton plan.
