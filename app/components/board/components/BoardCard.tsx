import type { JSX } from "react";
import {
  BOARD_CARD_OCCUPANCY_CLASS,
  BOARD_SCREEN,
  DEFAULT_CATEGORY_ICON,
  EQUIPMENT_IMAGE_FIT_CLASS,
  EQUIPMENT_IMAGE_TREATMENT,
  MATERIAL_ICON_NAME,
  PATHS,
  TRACKING_MODE_LABEL,
} from "@/app/constants";
import Link from "@/app/components/link/Link";
import Image from "@/app/components/image/Image";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import Badge from "@/app/components/badge/Badge";
import { resolveBoardCardOccupancy } from "@/app/utils/tablero/boardCardGrouping";
import type { BoardCardProps } from "./BoardCardProps.interface";

const FULL_PERCENT = 100;
const NO_UNITS_PERCENT = 0;
const NO_UNITS_IN_USE = 0;

/**
 * One card per reservable category (US-TAB-001), restyled twice: first from
 * `docs/referencia/stitch/tablero-arenal-ops--escritorio.html`, then again
 * from `docs/decisiones/vista_mobile.png` after the photo-as-hero layout
 * proved too tall for a phone (only two cards fit a screen). Most
 * `public/equipos/` files are product cutouts and are contained over the
 * card's own surface instead of bled with `object-cover` — freeing the
 * free-over-total count to be the thing a glance actually needs — but
 * `Lancha` has no cutout, only a real ambient photo
 * (`EQUIPMENT_IMAGE_TREATMENT.PHOTO`, verified against the file's own alpha
 * channel), which still bleeds like the reference's own "Lanchas" card.
 * `EQUIPMENT_IMAGE_FIT_CLASS` is what decides which; this component never
 * hard-codes it. The tracking-mode chip is desktop-only now: on a
 * two-column phone layout it competed with the count for the same corner.
 * `IN_USE_NOW` and the occupancy-tinted progress bar are unchanged.
 */
const BoardCard = ({
  category,
}: BoardCardProps): JSX.Element => {
  const freeRatio =
    category.total > NO_UNITS_PERCENT
      ? Math.round(
          (category.free / category.total) * FULL_PERCENT
        )
      : NO_UNITS_PERCENT;
  const occupancy = resolveBoardCardOccupancy(
    category.inUse,
    category.total
  );
  const occupancyClass =
    BOARD_CARD_OCCUPANCY_CLASS[occupancy];
  const imageTreatment =
    category.imageTreatment ??
    EQUIPMENT_IMAGE_TREATMENT.CUTOUT;
  const isPhoto =
    imageTreatment === EQUIPMENT_IMAGE_TREATMENT.PHOTO;

  return (
    <Link
      href={PATHS.COMMON.CATEGORY_DETAIL(category.id)}
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface-container/40 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 ${occupancyClass.BORDER}`}
    >
      <div className="relative h-24 shrink-0 overflow-hidden bg-surface-container-lowest sm:h-28">
        {category.imageSrc ? (
          <Image
            src={category.imageSrc}
            alt={category.imageAlt}
            fill
            className={`${EQUIPMENT_IMAGE_FIT_CLASS[imageTreatment]} transition-transform duration-700 group-hover:scale-105`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MaterialIcon
              name={DEFAULT_CATEGORY_ICON}
              className="!text-[48px] text-on-surface-variant"
            />
          </div>
        )}
        {/*
          Seam gradient for a bled photo only: a contained cutout already
          sits on the card's own surface color with nothing to blend, but a
          `PHOTO`-treatment image reaches every edge of this box, including
          the one against the panel below — the exact seam this gradient
          softens. Kept short (h-12) and low-opacity on purpose: the
          light-theme bug this card used to have was a `from-background`
          wash across the *entire* photo (`inset-0`), reported as "casi no
          se ve la imagen" — this is a quarter of that footprint, at the one
          edge that still needs it, in both themes.
        */}
        {isPhoto && (
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background/70 to-transparent" />
        )}
        {/*
          Scrim for the tracking-mode badge, kept even though the badge it
          protects is desktop-only below: the badge's own tint read fine
          over a photo in dark theme, where `--color-primary` is a bright
          cyan, but in light theme it is a dark teal that disappears against
          a bright photo (docs/decisiones/tema-claro.md §2.5).
          `from-background` resolves per theme, so the fix holds in both
          without touching the badge's color.
        */}
        <div className="absolute inset-x-0 top-0 hidden h-16 bg-gradient-to-b from-background/60 to-transparent md:block" />
        <div className="absolute left-sm top-sm hidden md:block">
          <Badge className="border-primary/30 bg-primary/10 text-primary">
            {TRACKING_MODE_LABEL[category.trackingMode]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-xs border-t border-outline-variant bg-surface-container-high/60 p-sm sm:gap-sm sm:p-md">
        <h3 className="font-headline-lg text-title-md text-on-surface sm:text-headline-lg-mobile">
          {category.name}
        </h3>
        <p
          className="flex items-baseline gap-1"
          aria-label={BOARD_SCREEN.FREE_OF_TOTAL(
            category.free,
            category.total
          )}
        >
          <span
            aria-hidden
            className="font-display-lg text-display-lg text-primary"
          >
            {category.free}
          </span>
          <span
            aria-hidden
            className="whitespace-nowrap font-label-mono text-label-mono text-on-surface-variant"
          >
            {BOARD_SCREEN.OF_TOTAL_LIBRES(category.total)}
          </span>
        </p>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-low">
          <div
            className={`h-full transition-all ${occupancyClass.BAR}`}
            style={{ width: `${freeRatio}%` }}
          />
        </div>
        {category.inUse > NO_UNITS_IN_USE && (
          <div className="flex items-center gap-1 text-on-surface-variant">
            <MaterialIcon
              name={MATERIAL_ICON_NAME.WATER}
              className="!text-[16px] text-tertiary"
            />
            <span className="font-label-mono text-label-mono">
              {BOARD_SCREEN.IN_USE_NOW(category.inUse)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default BoardCard;
