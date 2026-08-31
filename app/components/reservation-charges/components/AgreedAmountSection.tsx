"use client";

import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { Nullable } from "@/app/types";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { useAgreedAmountViewModel } from "../hooks/useAgreedAmountViewModel";
import MoneyField from "./MoneyField";
import SubmitRow from "./SubmitRow";

interface AgreedAmountSectionProps {
  agreedCrc: Nullable<number>;
  agreedUsd: Nullable<number>;
  onSaved: () => void;
  reservationId: string;
  workerId: string;
}

/**
 * US-RES-024/US-RES-025: lo que se acordo cobrar por la salida.
 *
 * Es lo que le da sentido a "cuanto falta". Una reserva del momento no tiene
 * tarifa de catalogo detras, asi que sin esto cada moneda quedaba en "—" para
 * siempre y nadie podia saber si el cliente ya termino de pagar.
 *
 * Las dos monedas se ofrecen juntas porque asi se cobra de verdad: cien
 * dolares y cincuenta mil colones por la misma salida. Cada una se salda
 * contra lo acordado en ella misma — el sistema no convierte, y por eso nunca
 * las suma.
 */
const AgreedAmountSection = ({
  agreedCrc,
  agreedUsd,
  onSaved,
  reservationId,
  workerId,
}: AgreedAmountSectionProps): JSX.Element => {
  const viewModel = useAgreedAmountViewModel({
    agreedCrc,
    agreedUsd,
    onSaved,
    reservationId,
    workerId,
  });

  return (
    <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
      <h2 className="flex items-center gap-sm font-title-md text-title-md text-on-surface">
        <MaterialIcon
          name={MATERIAL_ICON_NAME.ATTACH_MONEY}
          className="text-primary"
        />
        {RESERVATION_CHARGES_SCREEN.AGREED.TITLE}
      </h2>

      <div className="grid grid-cols-1 gap-sm sm:grid-cols-2">
        <MoneyField
          isBusy={viewModel.isBusy}
          label={
            RESERVATION_CHARGES_SCREEN.AGREED.USD_LABEL
          }
          onChange={viewModel.handleUsdChange}
          value={viewModel.usd}
        />
        <MoneyField
          isBusy={viewModel.isBusy}
          label={
            RESERVATION_CHARGES_SCREEN.AGREED.CRC_LABEL
          }
          onChange={viewModel.handleCrcChange}
          value={viewModel.crc}
        />
      </div>

      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.AGREED.HINT}
      </p>

      <SubmitRow
        error={viewModel.submitError ?? null}
        isBusy={viewModel.isBusy}
        label={RESERVATION_CHARGES_SCREEN.AGREED.SUBMIT}
        onSubmit={viewModel.handleSubmit}
      />
    </section>
  );
};

export default AgreedAmountSection;
