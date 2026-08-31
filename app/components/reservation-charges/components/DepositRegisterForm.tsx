"use client";

import type { JSX } from "react";
import { RESERVATION_CHARGES_SCREEN } from "@/app/constants";
import { useDepositRegisterViewModel } from "../hooks/useDepositRegisterViewModel";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import CurrencyToggle from "./CurrencyToggle";
import MoneyField from "./MoneyField";
import ProposalRow from "./ProposalRow";
import SubmitRow from "./SubmitRow";

type DepositRegisterFormProps = Pick<
  ReservationChargesProps,
  "context" | "depositProposal" | "workerId"
> & { onSaved: () => void };

/**
 * US-RES-029: the office received the deposit, so reservas records it —
 * operaciones never sees it and never collects it, because it handles no
 * money.
 */
const DepositRegisterForm = (
  props: DepositRegisterFormProps
): JSX.Element => {
  const viewModel = useDepositRegisterViewModel(props);

  return (
    <div className="flex flex-col gap-sm">
      <CurrencyToggle
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.DEPOSIT.CURRENCY_LABEL
        }
        onChange={viewModel.handleCurrencyChange}
        value={viewModel.currency}
      />
      <ProposalRow
        amount={viewModel.proposedAmount}
        currency={viewModel.currency}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.DEPOSIT.PROPOSAL_LABEL
        }
        onUse={viewModel.handleUseProposal}
      />
      <MoneyField
        error={viewModel.amountError}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.DEPOSIT.AMOUNT_LABEL
        }
        onChange={viewModel.handleAmountChange}
        value={viewModel.amount}
      />
      <SubmitRow
        error={viewModel.submitError}
        isBusy={viewModel.isBusy}
        label={
          RESERVATION_CHARGES_SCREEN.DEPOSIT.REGISTER_SUBMIT
        }
        onSubmit={viewModel.handleSubmit}
      />
    </div>
  );
};

export default DepositRegisterForm;
