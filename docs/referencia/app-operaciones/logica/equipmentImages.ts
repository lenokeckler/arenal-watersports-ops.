/**
 * Mapea cada máquina a su imagen y modo de presentación.
 * - 'cutout'  → recorte transparente sobre degradado de marca (fotos de producto).
 * - 'photo'   → foto real a sangre, oscurecida (lanchas en el lago).
 *
 * Las imágenes viven en public/equipos/ (procesadas desde imagenes_a_usar/).
 */
export type ImageMode = 'cutout' | 'photo';
export type EquipmentImage = { src: string; mode: ImageMode };

const BASE = '/equipos';

const norm = (s: string) =>
  (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

/** Coincidencias por nombre de tipo (más específico). */
const BY_TYPE: Array<[RegExp, EquipmentImage]> = [
  [/jet\s*ski/, { src: `${BASE}/jet-ski.webp`, mode: 'cutout' }],
  [/cuadra/, { src: `${BASE}/cuadraciclo.webp`, mode: 'cutout' }],
  [/pontoon/, { src: `${BASE}/pontoon.webp`, mode: 'photo' }],
  [/bening|benning/, { src: `${BASE}/bennington.webp`, mode: 'photo' }],
  [/kayak.*doble|doble.*kayak/, { src: `${BASE}/kayak-doble.webp`, mode: 'cutout' }],
  [/kayak.*indiv|indiv.*kayak/, { src: `${BASE}/kayak-individual.webp`, mode: 'cutout' }],
  [/paddle/, { src: `${BASE}/paddleboard.webp`, mode: 'cutout' }],
  [/kayak/, { src: `${BASE}/kayak-doble.webp`, mode: 'cutout' }],
];

/** Imagen representativa de cada grupo del tablero. */
const BY_GROUP: Array<[RegExp, EquipmentImage]> = [
  [/jet\s*ski/, { src: `${BASE}/jet-ski.webp`, mode: 'cutout' }],
  [/lancha/, { src: `${BASE}/pontoon.webp`, mode: 'photo' }],
  [/cuadra/, { src: `${BASE}/cuadraciclo.webp`, mode: 'cutout' }],
  [/paddle/, { src: `${BASE}/paddleboard.webp`, mode: 'cutout' }],
  [/kayak/, { src: `${BASE}/kayak-doble.webp`, mode: 'cutout' }],
];

/** Imagen para una unidad concreta (usa el nombre del tipo, cae al grupo). */
export function imageForType(typeName: string, menuGroup = ''): EquipmentImage | null {
  const t = norm(typeName);
  for (const [re, img] of BY_TYPE) if (re.test(t)) return img;
  return imageForGroup(menuGroup);
}

/** Imagen para un tile de grupo del tablero. */
export function imageForGroup(group: string): EquipmentImage | null {
  const g = norm(group);
  for (const [re, img] of BY_GROUP) if (re.test(g)) return img;
  for (const [re, img] of BY_TYPE) if (re.test(g)) return img;
  return null;
}

export const LOGO = `${BASE}/logo.webp`;
