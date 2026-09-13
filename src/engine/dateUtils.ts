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

/** Date décalée de `jours` (négatif = dans le passé), au format YYYY-MM-DD. */
export function ajouterJours(date: string, jours: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + jours);
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}

/** Date du jour, locale, au format YYYY-MM-DD. Partagée par le moteur et l'écran. */
export function aujourdHui(): string {
  const d = new Date();
  const annee = d.getFullYear();
  const mois = String(d.getMonth() + 1).padStart(2, '0');
  const jour = String(d.getDate()).padStart(2, '0');
  return `${annee}-${mois}-${jour}`;
}
