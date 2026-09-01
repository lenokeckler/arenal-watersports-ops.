import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";

/**
 * How a card renders its `src`, verified against each file's own alpha
 * channel rather than assumed: `cutout` (`jet-ski`, `kayak-*`,
 * `paddleboard`, `cuadraciclo`) is a product photo isolated on real
 * transparent pixels (WebP `VP8X`, alpha flag set), so it is contained
 * with room to breathe on the card's own background. `photo`
 * (`bennington`, `pontoon`) is a real ambient shot with no alpha channel
 * at all (plain lossy WebP `VP8 `) — it bleeds edge to edge instead, the
 * same read `docs/decisiones/vista_mobile.png` gives its own "Lanchas"
 * card.
 */
export const EQUIPMENT_IMAGE_TREATMENT = {
  CUTOUT: "cutout",
  PHOTO: "photo",
} as const;

export type EquipmentImageTreatment =
  (typeof EQUIPMENT_IMAGE_TREATMENT)[keyof typeof EQUIPMENT_IMAGE_TREATMENT];

/**
 * The `next/image` classes each treatment renders with — `BoardCard` and
 * `UnitCard` both key off this instead of hard-coding the choice
 * themselves, so a new entry below carries its own presentation with it.
 */
export const EQUIPMENT_IMAGE_FIT_CLASS = {
  [EQUIPMENT_IMAGE_TREATMENT.CUTOUT]: "object-contain p-sm",
  [EQUIPMENT_IMAGE_TREATMENT.PHOTO]: "object-cover",
} as const satisfies Record<
  EquipmentImageTreatment,
  string
>;

interface EquipmentImageEntry {
  alt: string;
  src: string;
  treatment: EquipmentImageTreatment;
}

/**
 * The photos in `public/equipos/` are keyed by category name or, for
 * `Lancha` (two very different boats sharing one category), by unit code
 * — matching the exact strings seeded in `supabase/seed.sql`. The catalog
 * is deliberately open-ended (US-ADM-012: "la lista no queda cerrada de
 * antemano"), so a category or unit with no matching photo falls back to
 * `DEFAULT_CATEGORY_ICON` instead of a broken image.
 */
export const CATEGORY_IMAGE_BY_NAME: Record<
  string,
  EquipmentImageEntry
> = {
  Cuadraciclo: {
    alt: "Cuadraciclo",
    src: "/equipos/cuadraciclo.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.CUTOUT,
  },
  "Jet Ski": {
    alt: "Jet ski",
    src: "/equipos/jet-ski.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.CUTOUT,
  },
  "Kayak doble": {
    alt: "Kayak doble",
    src: "/equipos/kayak-doble.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.CUTOUT,
  },
  "Kayak individual": {
    alt: "Kayak individual",
    src: "/equipos/kayak-individual.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.CUTOUT,
  },
  Lancha: {
    alt: "Lancha",
    src: "/equipos/pontoon.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.PHOTO,
  },
  Paddleboard: {
    alt: "Paddleboard",
    src: "/equipos/paddleboard.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.CUTOUT,
  },
};

/** Per-unit override for categories whose units do not all look alike. */
export const UNIT_IMAGE_BY_CODE: Record<
  string,
  EquipmentImageEntry
> = {
  BENNINGTON: {
    alt: "Bennington",
    src: "/equipos/bennington.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.PHOTO,
  },
  PONTOON: {
    alt: "Pontoon",
    src: "/equipos/pontoon.webp",
    treatment: EQUIPMENT_IMAGE_TREATMENT.PHOTO,
  },
};

export const DEFAULT_CATEGORY_ICON =
  MATERIAL_ICON_NAME.WAVES;
