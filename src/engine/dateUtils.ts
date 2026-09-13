// Utilitaires de date partagés par le moteur de dérivation.
// Fonctions pures, sans accès à la base.

/** Nombre de jours entre deux dates YYYY-MM-DD (peut être négatif). */
export function joursEntre(dateDebut: string, dateFin: string): number {
  const debut = new Date(`${dateDebut}T00:00:00`);
  const fin = new Date(`${dateFin}T00:00:00`);
  return Math.round((fin.getTime() - debut.getTime()) / 86_400_000);
}

/**
 * Vrai si `date` tombe dans la fenêtre glissante de `nombreJours` jours se
 * terminant le `dateJ` inclus, c'est-à-dire [dateJ - (nombreJours-1), dateJ].
 */
export function dansFenetre(date: string, dateJ: string, nombreJours: number): boolean {
  const delta = joursEntre(date, dateJ);
  return delta >= 0 && delta < nombreJours;
}

/**
 * Formate une Date en YYYY-MM-DD à partir de ses composantes locales.
 * `toISOString()` convertirait en UTC et décalerait la date d'un jour
 * selon le fuseau horaire : à éviter pour des dates locales sans heure.
 */
function formatDateLocale(d: Date): string {
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Lundi (YYYY-MM-DD) de la semaine ISO contenant `date`. */
export function lundiDeLaSemaine(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  const jourIso = (d.getDay() + 6) % 7; // lundi = 0 ... dimanche = 6
  d.setDate(d.getDate() - jourIso);
  return formatDateLocale(d);
}

function ajouterJours(date: string, jours: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + jours);
  return formatDateLocale(d);
}

/**
 * Les `nbSemaines` dernières semaines calendaires ISO (lundi→dimanche)
 * entièrement terminées avant `dateJ` (la semaine en cours, non terminée,
 * est exclue). Retourne les lundis de chaque semaine, du plus ancien au
 * plus récent.
 */
export function semainesPleinesPrecedentes(dateJ: string, nbSemaines: number): string[] {
  const lundiSemaineEnCours = lundiDeLaSemaine(dateJ);
  const lundis: string[] = [];
  for (let i = nbSemaines; i >= 1; i--) {
    lundis.push(ajouterJours(lundiSemaineEnCours, -7 * i));
  }
  return lundis;
}

export { ajouterJours };
