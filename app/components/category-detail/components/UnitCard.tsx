import type { JSX } from "react";
import {
  CATEGORY_DETAIL_SCREEN,
  DEFAULT_CATEGORY_ICON,
  EQUIPMENT_IMAGE_FIT_CLASS,
  EQUIPMENT_IMAGE_TREATMENT,
  EQUIPMENT_UNIT_OVERDUE_CARD_TINT,
  EQUIPMENT_UNIT_STATUS_CARD_TINT,
  EQUIPMENT_UNIT_STATUS_LABEL,
  type EquipmentUnitStatus,
} from "@/app/constants";
import Image from "@/app/components/image/Image";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import FuelGaugeBar from "@/app/components/fuel-gauge-bar/FuelGaugeBar";
import { computeTimeRemaining } from "@/app/utils/operaciones/timeRemaining";
import UnitCardFrame from "./UnitCardFrame";
import UnitCardSelectionBadge from "./UnitCardSelectionBadge";
import UnitCardStatusBadge from "./UnitCardStatusBadge";
import UnitCardOccupiedDetails from "./UnitCardOccupiedDetails";
import type { UnitCardProps } from "./UnitCardProps.interface";

/**
 * One unit inside a by_unit category (US-TAB-002), restyled from
 * `docs/referencia/stitch/gestion-de-jet-ski--escritorio.html` and again
 * from `docs/decisiones/vista_mobile2.png`/`vista_mobile3.png`: a square
 * tile (the two-column mobile grid needs a shape that tiles cleanly) and
 * a card tinted boldly enough by state to read from across the dock, not
 * just the corner badge. The square holds regardless of image treatment —
 * `Lancha`'s two boats (`BENNINGTON`/`PONTOON`) are real photos, not
 * cutouts, so `EQUIPMENT_IMAGE_FIT_CLASS` bleeds and crops them into the
 * square instead of padding them inside it. When occupied, composes
 * `UnitCardOccupiedDetails` for the return countdown and reservation link.
 *
 * The fuel gauge and the usage reading (US-OPE-002/US-OPE-020) always
 * render for a category that carries them, with no reading yet reading as
 * "Sin lectura" rather than disappearing — this is the screen checked "de
 * reojo" from the dock, and a half-empty cuadraciclo is exactly what
 * decides which one goes out next. Hiding either until a reading existed
 * was a past mistake, not a deliberate declutter: `FuelGaugeBar` itself
 * already draws the "never read" vs. "read empty" distinction, and
 * `/operaciones/maquinas` never hid its own gauge either.
 *
 * In operaciones mode (US-OPE-002, tablero entry), an available unit
 * becomes its own tap target — `UnitCardFrame` swaps the wrapping `div` for
 * a `button` only then, and `UnitCardSelectionBadge` marks whether this one
 * is picked. Every other state keeps the plain display card.
 */
const UnitCard = ({
  isSelectable,
  isSelected,
  now,
  onToggleSelect,
  unit,
}: UnitCardProps): JSX.Element => {
  const status =
    unit.effectiveStatus as EquipmentUnitStatus;
  const isOccupied = Boolean(unit.reservationId);
  const timeRemaining =
    isOccupied && unit.returnsAt
      ? computeTimeRemaining(unit.returnsAt, now)
      : null;
  const isOverdue = timeRemaining?.isOverdue ?? false;
  const cardTintClass = isOverdue
    ? EQUIPMENT_UNIT_OVERDUE_CARD_TINT
    : EQUIPMENT_UNIT_STATUS_CARD_TINT[status];
  const imageTreatment =
    unit.imageTreatment ?? EQUIPMENT_IMAGE_TREATMENT.CUTOUT;

  return (
    <UnitCardFrame
      ariaLabel={CATEGORY_DETAIL_SCREEN.SELECT_UNIT(
        unit.code
      )}
      className={`flex flex-col overflow-hidden rounded-xl border-2 backdrop-blur-xl ${cardTintClass}`}
      isSelectable={isSelectable}
      isSelected={isSelected}
      onToggleSelect={() => onToggleSelect(unit.id)}
    >
      <div className="relative aspect-square w-full bg-surface-container-lowest">
        {unit.imageSrc ? (
          <Image
            src={unit.imageSrc}
            alt={unit.imageAlt}
            fill
            className={`${EQUIPMENT_IMAGE_FIT_CLASS[imageTreatment]} opacity-90`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <MaterialIcon
              name={DEFAULT_CATEGORY_ICON}
              className="!text-[40px] text-on-surface-variant"
            />
          </div>
        )}
        {/*
          Scrim for the status badge, same fix and reasoning as
          `BoardCard`'s tracking-mode badge: without it, the badge tint
          sits on bare photo, unreadable in light theme
          (docs/decisiones/tema-claro.md §2.5). `from-background` resolves
          per theme, so this holds in both.
        */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/60 to-transparent" />
        {isSelectable && (
          <UnitCardSelectionBadge isSelected={isSelected} />
        )}
        <UnitCardStatusBadge
          isOverdue={isOverdue}
          status={status}
        />
      </div>

      <div className="flex flex-col gap-xs p-sm">
        <span className="font-title-md text-title-md text-on-surface">
          {unit.code}
        </span>

        {isOccupied ? (
          <UnitCardOccupiedDetails
            timeRemaining={timeRemaining}
            unit={unit}
          />
        ) : (
          <span className="font-label-mono text-label-mono text-on-surface-variant">
            {EQUIPMENT_UNIT_STATUS_LABEL[status]}
          </span>
        )}

        {typeof unit.fuelMax === "number" && (
          <FuelGaugeBar
            level={unit.fuelLevel}
            max={unit.fuelMax}
          />
        )}

        {unit.usageMetric &&
          typeof unit.usageTotal === "number" && (
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              {CATEGORY_DETAIL_SCREEN.USAGE_READING(
                unit.usageMetric,
                unit.usageTotal
              )}
            </span>
          )}
      </div>
    </UnitCardFrame>
  );
};

export default UnitCard;
