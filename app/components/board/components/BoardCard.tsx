import type { JSX } from "react";
import {
  BOARD_CARD_OCCUPANCY_CLASS,
  BOARD_SCREEN,
  DEFAULT_CATEGORY_ICON,
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
 * One card per reservable category (US-TAB-001), restyled from
 * `docs/referencia/stitch/tablero-arenal-ops--escritorio.html`: a photo,
 * the tracking-mode chip, the name, how many are free over the total with a
 * progress bar, and — the part the old board never had — how many are out
 * right now, with the whole card tinted so a fully-booked category stands
 * out from across the dock instead of requiring a tap to find out.
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

  return (
    <Link
      href={PATHS.COMMON.CATEGORY_DETAIL(category.id)}
      className={`group flex h-64 flex-col overflow-hidden rounded-2xl border bg-surface-container/40 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 ${occupancyClass.BORDER}`}
    >
      <div className="relative flex-1 overflow-hidden bg-surface-container-lowest">
        {category.imageSrc ? (
          <Image
            src={category.imageSrc}
            alt={category.imageAlt}
            fill
            className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MaterialIcon
              name={DEFAULT_CATEGORY_ICON}
              className="!text-[48px] text-on-surface-variant"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <Badge className="absolute left-sm top-sm border-primary/30 bg-primary/10 text-primary">
          {TRACKING_MODE_LABEL[category.trackingMode]}
        </Badge>
      </div>

      <div className="flex flex-col gap-sm border-t border-white/10 bg-surface-container-high/60 p-md">
        <div className="flex items-end justify-between gap-sm">
          <h3 className="font-headline-lg text-headline-lg-mobile text-on-surface">
            {category.name}
          </h3>
          <span className="whitespace-nowrap font-label-mono text-label-mono text-on-surface-variant">
            {BOARD_SCREEN.FREE_OF_TOTAL(
              category.free,
              category.total
            )}
          </span>
        </div>
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
