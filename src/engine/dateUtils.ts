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
