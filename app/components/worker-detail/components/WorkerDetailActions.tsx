import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  FIELD_IDS,
  INPUT_TYPES,
  MATERIAL_ICON_NAME,
  WORKER_DETAIL_SCREEN,
  WORKER_STATUS,
  type WorkerStatus,
} from "@/app/constants";
import Button from "@/app/components/button/Button";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";

interface WorkerDetailActionsProps {
  expiresAtDraft: string;
  isBusy: boolean;
  isExternalGuide: boolean;
  onBlock: () => void;
  onExpiresAtDraftChange: (value: string) => void;
  onExtendExpiry: () => void;
  onReactivate: () => void;
  onResetPassword: () => void;
  status: WorkerStatus;
}

const ACTION_BUTTON_CLASS =
  "flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/10 px-md font-button text-button uppercase text-on-surface transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";

/**
 * US-ADM-006 through US-ADM-010: block/reactivate, a fresh temporary
 * password, and — only for an external guide — extending the caducidad
 * date. "Desbloquear" and "reactivar" are the same write
 * (`status = 'active'`, `failed_attempts = 0`): the database does not
 * distinguish a block from ten failed attempts from one administración
 * chose, so neither does this screen.
 */
const WorkerDetailActions = ({
  expiresAtDraft,
  isBusy,
  isExternalGuide,
  onBlock,
  onExpiresAtDraftChange,
  onExtendExpiry,
  onReactivate,
  onResetPassword,
  status,
}: WorkerDetailActionsProps): JSX.Element => (
  <section className="flex flex-col gap-sm rounded-xl border border-white/10 bg-surface-container/40 p-md backdrop-blur-md">
    <h2 className="font-title-md text-title-md text-on-surface">
      {WORKER_DETAIL_SCREEN.SECTION.ACCOUNT}
    </h2>

    <div className="flex flex-wrap gap-sm">
      {status === WORKER_STATUS.ACTIVE ? (
        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={onBlock}
          className={`${ACTION_BUTTON_CLASS} hover:border-error/40 hover:text-error`}
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.BLOCK} />
          {WORKER_DETAIL_SCREEN.ACTIONS.BLOCK}
        </Button>
      ) : (
        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          disabled={isBusy}
          onClick={onReactivate}
          className={ACTION_BUTTON_CLASS}
        >
          <MaterialIcon name={MATERIAL_ICON_NAME.CHECK_CIRCLE} />
          {WORKER_DETAIL_SCREEN.ACTIONS.REACTIVATE}
        </Button>
      )}

      <Button
        type={BUTTON_TYPES.BUTTON}
        variant={BUTTON.BASE}
        disabled={isBusy}
        onClick={onResetPassword}
        className={ACTION_BUTTON_CLASS}
      >
        <MaterialIcon name={MATERIAL_ICON_NAME.LOCK_RESET} />
        {WORKER_DETAIL_SCREEN.ACTIONS.RESET_PASSWORD}
      </Button>
    </div>

    <div className="flex flex-col gap-1 border-t border-white/5 pt-sm">
      <span className="font-label-mono text-label-mono uppercase text-on-surface-variant">
        {WORKER_DETAIL_SCREEN.EXPIRY.LABEL}
      </span>
      {isExternalGuide ? (
        <div className="flex flex-wrap items-center gap-sm">
          <input
            id={FIELD_IDS.EXPIRES_AT}
            type={INPUT_TYPES.DATE}
            value={expiresAtDraft}
            disabled={isBusy}
            onChange={(event) => onExpiresAtDraftChange(event.target.value)}
            className="min-h-12 rounded-lg border border-white/10 bg-surface-container-low px-sm text-on-surface"
          />
          <Button
            type={BUTTON_TYPES.BUTTON}
            variant={BUTTON.BASE}
            disabled={isBusy}
            onClick={onExtendExpiry}
            className={ACTION_BUTTON_CLASS}
          >
            <MaterialIcon name={MATERIAL_ICON_NAME.SCHEDULE} />
            {WORKER_DETAIL_SCREEN.ACTIONS.EXTEND_EXPIRY}
          </Button>
        </div>
      ) : (
        <p className="font-body-base text-body-base text-on-surface-variant">
          {WORKER_DETAIL_SCREEN.EXPIRY.NOT_APPLICABLE}
        </p>
      )}
    </div>
  </section>
);

export default WorkerDetailActions;
