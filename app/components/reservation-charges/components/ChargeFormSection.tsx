"use client";

import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import { useChargeFormViewModel } from "../hooks/useChargeFormViewModel";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import ChargesSection from "./ChargesSection";
import ChargeKindPicker from "./ChargeKindPicker";
import CurrencyToggle from "./CurrencyToggle";
import MoneyField from "./MoneyField";
import PaymentMethodPicker from "./PaymentMethodPicker";
import ProposalRow from "./ProposalRow";
import SubmitRow from "./SubmitRow";

type ChargeFormSectionProps = Pick<
  ReservationChargesProps,
  "context" | "proposal" | "workerId"
> & { onSaved: () => void };

/**
 * US-RES-023 through US-RES-027 and US-RES-031: registering one payment.
 * A charge can be recorded at any time between scheduling and closing —
 * the story covers both the client who pays up front and the one who pays
 * on the way back — so nothing here is gated by the reservation's status.
 */
const ChargeFormSection = (
  props: ChargeFormSectionProps
): JSX.Element => {
  const viewModel = useChargeFormViewModel(props);

  return (
    <ChargesSection
      icon={MATERIAL_ICON_NAME.PAYMENTS}
      title={RESERVATION_CHARGES_SCREEN.CHARGE_FORM.TITLE}
    >
      <ChargeKindPicker
        isBusy={viewModel.isBusy}
        isTariffBlocked={viewModel.isTariffBlocked}
        onChange={viewModel.handleKindChange}
        value={viewModel.kind}
      />
      <CurrencyToggle
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.CHARGE_FORM
            .CURRENCY_LABEL
        }
        onChange={viewModel.handleCurrencyChange}
        value={viewModel.currency}
      />
      <ProposalRow
        amount={viewModel.proposedAmount}
        currency={viewModel.currency}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.CHARGE_FORM
            .PROPOSAL_LABEL
        }
        onUse={viewModel.handleUseProposal}
      />
      <MoneyField
        error={viewModel.errors.amount}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.CHARGE_FORM
            .AMOUNT_LABEL
        }
        onChange={viewModel.handleAmountChange}
        value={viewModel.amount}
      />
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.CHARGE_FORM.ADJUST_HINT}
      </p>
      <PaymentMethodPicker
        error={viewModel.errors.paymentMethod}
        isBusy={viewModel.isBusy}
        method={viewModel.method}
        onMethodChange={viewModel.handleMethodChange}
        onOtherMethodChange={
          viewModel.handleOtherMethodChange
        }
        otherMethod={viewModel.otherMethod}
      />
      <SubmitRow
        error={viewModel.submitError}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.CHARGE_FORM.SUBMIT
        }
        onSubmit={viewModel.handleSubmit}
      />
    </ChargesSection>
  );
};

export default ChargeFormSection;
