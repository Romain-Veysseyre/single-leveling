// Km-effort (KME) — SPEC.md section 5.1.
// Unité de base de tout le système. Le D+ est déjà contenu dedans : il ne
// doit jamais être recompté ailleurs dans le calcul d'XP ou de rang.
//
// Le diviseur 100 fait partie de la définition même du KME (pas une valeur
// de balance retouchable au sens de la section 6 : il n'apparaît pas dans
// la liste des constantes à centraliser, contrairement à ALPHA ou aux
// seuils de rang).

import type { Sortie } from '../types';

export function kme(sortie: Pick<Sortie, 'km' | 'denivele'>): number {
  return sortie.km + sortie.denivele / 100;
}
