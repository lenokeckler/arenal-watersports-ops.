"use client";

import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  RESERVATION_CHARGES_SCREEN,
} from "@/app/constants";
import type { NullableRef } from "@/app/types";
import type { DepositRecord } from "@/app/utils/reservas/reservationMovementRecords";
import type { ReservationChargesProps } from "../models/ReservationChargesProps.interface";
import ChargesSection from "./ChargesSection";
import DepositHistoryList from "./DepositHistoryList";
import DepositRegisterForm from "./DepositRegisterForm";
import DepositResolutionForm from "./DepositResolutionForm";

const NO_DEPOSITS = 0;

type DepositSectionProps = Pick<
  ReservationChargesProps,
  "context" | "depositProposal" | "workerId"
> & {
  canRegister: boolean;
  canResolve: boolean;
  deposits: DepositRecord[];
  heldDeposit: NullableRef<DepositRecord>;
  onSaved: () => void;
};

/**
 * US-RES-029/US-RES-030: receiving the client's money and, once the
 * outing closed — or was cancelled while already out, which US-RES-022
 * settles the same way — deciding whether it goes back or stays.
 */
const DepositSection = ({
  canRegister,
  canResolve,
  context,
  depositProposal,
  deposits,
  heldDeposit,
  onSaved,
  workerId,
}: DepositSectionProps): JSX.Element => (
  <ChargesSection
    icon={MATERIAL_ICON_NAME.LOCK}
    title={RESERVATION_CHARGES_SCREEN.DEPOSIT.TITLE}
  >
    {context.isSplitChild && (
      <p className="rounded-lg border border-primary/20 bg-primary/10 p-sm font-body-base text-[14px] leading-tight text-on-surface">
        {
          RESERVATION_CHARGES_SCREEN.DEPOSIT
            .SPLIT_CHILD_BLOCKED
        }
      </p>
    )}

    {deposits.length === NO_DEPOSITS ? (
      <p className="font-body-base text-body-base text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.DEPOSIT.EMPTY}
      </p>
    ) : (
      <DepositHistoryList deposits={deposits} />
    )}

    {heldDeposit && (
      <p className="font-label-mono text-label-mono text-on-surface-variant">
        {RESERVATION_CHARGES_SCREEN.DEPOSIT.HELD_NOTICE}
      </p>
    )}

    {canRegister && (
      <DepositRegisterForm
        context={context}
        depositProposal={depositProposal}
        onSaved={onSaved}
        workerId={workerId}
      />
    )}

    {heldDeposit &&
      (canResolve ? (
        <DepositResolutionForm
          deposit={heldDeposit}
          onSaved={onSaved}
        />
      ) : (
        <p className="font-label-mono text-label-mono text-on-surface-variant">
          {
            RESERVATION_CHARGES_SCREEN.DEPOSIT.RESOLUTION
              .LOCKED
          }
        </p>
      ))}
  </ChargesSection>
);

export default DepositSection;
