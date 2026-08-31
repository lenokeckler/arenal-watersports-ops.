"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  RESERVATION_CLOSE_SCREEN,
  SPINNER_SIZE,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import Spinner from "@/app/components/spinner/Spinner";
import ReservationCloseEquipmentRow from "./components/ReservationCloseEquipmentRow";
import { useReservationCloseViewModel } from "./hooks/useReservationCloseViewModel";
import type { ReservationCloseProps } from "./models/ReservationCloseProps.interface";

/**
 * `/operaciones/cierre/[reservationId]` (US-OPE-009). Presentation only;
 * `useReservationCloseViewModel` owns row state, validation and the write
 * (`component-architecture`).
 */
const ReservationClose = ({
  data,
  workerId,
}: ReservationCloseProps): JSX.Element => {
  const {
    error,
    handleDamageCauseChange,
    handleDamageDescriptionChange,
    handleDamageImpactChange,
    handleFuelChange,
    handleSubmit,
    handleToggleDamage,
    handleUsageChange,
    isBusy,
    rows,
  } = useReservationCloseViewModel({ data, workerId });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-32 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-3xl flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
          {RESERVATION_CLOSE_SCREEN.TITLE}
        </h1>
        <p className="font-body-base text-body-base text-on-surface-variant">
          {RESERVATION_CLOSE_SCREEN.SUBTITLE(
            data.customerName
          )}
        </p>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-md">
        <h2 className="font-title-md text-title-md text-on-surface">
          {RESERVATION_CLOSE_SCREEN.EQUIPMENT_TITLE}
        </h2>

        <div className="flex flex-col gap-sm">
          {rows.map((row) => (
            <ReservationCloseEquipmentRow
              key={row.itemId}
              isBusy={isBusy}
              onDamageCauseChange={handleDamageCauseChange}
              onDamageDescriptionChange={
                handleDamageDescriptionChange
              }
              onDamageImpactChange={
                handleDamageImpactChange
              }
              onFuelChange={handleFuelChange}
              onToggleDamage={handleToggleDamage}
              onUsageChange={handleUsageChange}
              row={row}
            />
          ))}
        </div>

        <p className="font-body-base text-body-base text-on-surface-variant">
          {RESERVATION_CLOSE_SCREEN.OK_NOTICE}
        </p>

        {error && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {error}
          </p>
        )}

        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={handleSubmit}
          className="flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-primary px-md py-sm text-button uppercase text-on-primary-fixed shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <Spinner size={SPINNER_SIZE.SMALL} />
          ) : (
            RESERVATION_CLOSE_SCREEN.SUBMIT
          )}
        </Button>
      </main>
    </div>
  );
};

export default ReservationClose;
