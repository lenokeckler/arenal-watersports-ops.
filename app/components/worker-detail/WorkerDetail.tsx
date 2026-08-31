"use client";

import type { JSX } from "react";
import {
  MATERIAL_ICON_NAME,
  PATHS,
  WORK_AREA_LABEL,
  WORKER_DETAIL_SCREEN,
  WORKER_FORM_SCREEN,
  WORKER_STATUS,
  WORKER_STATUS_LABEL,
} from "@/app/constants";
import Badge from "@/app/components/badge/Badge";
import Link from "@/app/components/link/Link";
import MaterialIcon from "@/app/components/icons/material-icon/MaterialIcon";
import { useWorkerDetailViewModel } from "./hooks/useWorkerDetailViewModel";
import WorkerDetailAreas from "./components/WorkerDetailAreas";
import WorkerDetailMarks from "./components/WorkerDetailMarks";
import WorkerDetailActions from "./components/WorkerDetailActions";
import WorkerFormSuccess from "@/app/components/worker-form/WorkerFormSuccess";
import type { WorkerDetailProps } from "./models/WorkerDetailProps.interface";

/**
 * `/administracion/trabajadores/[workerId]` (US-ADM-002 through
 * US-ADM-010). Presentation composed from `useWorkerDetailViewModel`; the
 * single administration account never renders the block/reactivate action
 * at all, matching the module brief ("do not build UI that offers those
 * actions for it") — the database's own trigger is the real guard.
 */
const WorkerDetail = ({
  worker: initialWorker,
}: WorkerDetailProps): JSX.Element => {
  const {
    actionError,
    availableAreas,
    expiresAtDraft,
    handleAddArea,
    handleBlock,
    handleExpiresAtDraftChange,
    handleExtendExpiry,
    handleReactivate,
    handleRemoveArea,
    handleResetPassword,
    handleToggleMark,
    isAdminAccount,
    isBusy,
    resetPasswordResult,
    status,
    worker,
  } = useWorkerDetailViewModel({ worker: initialWorker });

  return (
    <div className="min-h-screen bg-background px-margin-mobile pb-24 pt-margin-mobile text-on-surface md:px-margin-desktop md:pt-margin-desktop">
      <header className="mx-auto mb-lg flex max-w-3xl items-center gap-sm">
        <Link
          href={PATHS.ADMIN.WORKERS}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-on-surface-variant hover:text-primary"
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ARROW_BACK}
          />
        </Link>
        <div className="flex flex-col">
          <h1 className="font-headline-lg text-headline-lg-mobile font-semibold text-on-surface md:text-headline-lg">
            {worker.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              @{worker.username}
            </span>
            <Badge className="border-white/10 bg-surface-container-high text-on-surface-variant">
              {WORK_AREA_LABEL[worker.baseRole]}
            </Badge>
            <Badge
              className={
                status === WORKER_STATUS.ACTIVE
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-error/30 bg-error/10 text-error"
              }
            >
              {WORKER_STATUS_LABEL[status]}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-md">
        {actionError && (
          <p className="rounded-lg border border-error/40 bg-error/10 px-sm py-2 font-body-base text-body-base text-error">
            {actionError}
          </p>
        )}

        {resetPasswordResult && (
          <WorkerFormSuccess
            onCopyTemporaryPassword={() => {
              void navigator.clipboard.writeText(
                resetPasswordResult
              );
            }}
            showViewWorkerLink={false}
            temporaryPassword={resetPasswordResult}
            title={WORKER_FORM_SCREEN.SUCCESS.RESET_TITLE}
            workerId={worker.id}
          />
        )}

        <WorkerDetailAreas
          additionalAreas={worker.additionalAreas}
          availableAreas={availableAreas}
          isBusy={isBusy}
          onAddArea={handleAddArea}
          onRemoveArea={handleRemoveArea}
        />

        <WorkerDetailMarks
          isBusy={isBusy}
          marks={worker.marks}
          onToggleMark={handleToggleMark}
        />

        {isAdminAccount ? (
          <p className="rounded-xl border border-white/10 bg-surface-container/40 p-md font-body-base text-body-base text-on-surface-variant">
            {WORKER_DETAIL_SCREEN.ADMIN_PROTECTED_NOTE}
          </p>
        ) : (
          <WorkerDetailActions
            expiresAtDraft={expiresAtDraft}
            isBusy={isBusy}
            isExternalGuide={worker.isExternalGuide}
            onBlock={handleBlock}
            onExpiresAtDraftChange={
              handleExpiresAtDraftChange
            }
            onExtendExpiry={handleExtendExpiry}
            onReactivate={handleReactivate}
            onResetPassword={handleResetPassword}
            status={status}
          />
        )}
      </main>
    </div>
  );
};

export default WorkerDetail;
