import { MATERIAL_ICON_NAME } from "@/app/components/icons/material-icon/constants";

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
  { alt: string; src: string }
> = {
  "Cuadraciclo": {
    alt: "Cuadraciclo",
    src: "/equipos/cuadraciclo.webp",
  },
  "Jet Ski": { alt: "Jet ski", src: "/equipos/jet-ski.webp" },
  "Kayak doble": {
    alt: "Kayak doble",
    src: "/equipos/kayak-doble.webp",
  },
  "Kayak individual": {
    alt: "Kayak individual",
    src: "/equipos/kayak-individual.webp",
  },
  "Lancha": { alt: "Lancha", src: "/equipos/pontoon.webp" },
  "Paddleboard": {
    alt: "Paddleboard",
    src: "/equipos/paddleboard.webp",
  },
};

/** Per-unit override for categories whose units do not all look alike. */
export const UNIT_IMAGE_BY_CODE: Record<
  string,
  { alt: string; src: string }
> = {
  BENNINGTON: { alt: "Bennington", src: "/equipos/bennington.webp" },
  PONTOON: { alt: "Pontoon", src: "/equipos/pontoon.webp" },
};

export const DEFAULT_CATEGORY_ICON = MATERIAL_ICON_NAME.WAVES;
