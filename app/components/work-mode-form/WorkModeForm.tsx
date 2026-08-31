"use client";

import type { JSX } from "react";
import {
  BUTTON,
  BUTTON_TYPES,
  MATERIAL_ICON_NAME,
  SPINNER_SIZE,
  WORK_AREA_LABEL,
  WORK_MODE_SCREEN,
} from "@/app/constants";
import Button from "../button/Button";
import MaterialIcon from "../icons/material-icon/MaterialIcon";
import Spinner from "../spinner/Spinner";
import Text from "../text/Text";
import Title from "../title/Title";
import { TitleVariant } from "@/app/components/title/constants";
import { useWorkModeFormViewModel } from "./hooks/useWorkModeFormViewModel";
import type { WorkModeFormProps } from "./models/WorkModeFormProps.interface";

/**
 * `/acceso/modo-de-trabajo` (US-ACC-011), restyled to the desktop design
 * generated for this screen specifically
 * (`docs/referencia/stitch/modo-de-trabajo--escritorio.html`): three large
 * glass cards in a row that collapse to one column on a narrow screen
 * (`grid-cols-1 md:grid-cols-3`), each one a full tap target. Only the
 * areas this account actually has are drawn — `proxy.ts` already
 * guarantees there are at least two. Presentation only; every decision
 * lives in `useWorkModeFormViewModel` (`component-architecture`).
 */
const WorkModeForm = ({ areas }: WorkModeFormProps): JSX.Element => {
  const {
    errorMessage,
    handleLogout,
    handleSelectArea,
    isSubmitting,
    selectedArea,
  } = useWorkModeFormViewModel({ areas });

  const orderedAreas = WORK_MODE_SCREEN.CARD_ORDER.filter((area) =>
    areas.includes(area)
  );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-background px-margin-mobile py-margin-desktop text-on-surface md:px-margin-desktop">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-20%,rgba(45,212,191,0.15)_0%,rgba(11,19,38,1)_60%)]"
      />

      <header className="mt-lg flex w-full max-w-3xl flex-col items-center text-center md:mt-xl">
        <div className="mb-md flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-surface-container-high shadow-lg">
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ANCHOR}
            className="!text-[32px] text-primary"
          />
        </div>
        <Title
          variant={TitleVariant.PRIMARY}
          text={WORK_MODE_SCREEN.TITLE}
          className="!text-headline-lg-mobile font-semibold tracking-tight text-on-surface md:!text-display-lg"
        />
        <Text className="!mt-sm !text-body-base text-on-surface-variant">
          {WORK_MODE_SCREEN.SUBTITLE}
        </Text>
      </header>

      {errorMessage && (
        <div className="mt-md flex items-center gap-sm rounded-lg border border-error/50 bg-error-container/80 p-sm backdrop-blur-md">
          <MaterialIcon
            name={MATERIAL_ICON_NAME.ERROR}
            className="!text-[20px] text-error"
          />
          <Text className="!text-[13px] text-on-error-container">
            {errorMessage}
          </Text>
        </div>
      )}

      <main className="mt-lg w-full max-w-6xl flex-grow md:mt-xl">
        <div className="grid grid-cols-1 gap-md md:grid-cols-3 md:gap-lg">
          {orderedAreas.map((area) => {
            const card = WORK_MODE_SCREEN.CARD[area];
            const isThisAreaSubmitting =
              isSubmitting && selectedArea === area;

            return (
              <Button
                key={area}
                type={BUTTON_TYPES.BUTTON}
                variant={BUTTON.BASE}
                disabled={isSubmitting}
                onClick={() => handleSelectArea(area)}
                className="group flex min-h-48 flex-col items-start rounded-2xl border border-white/5 bg-surface-container/40 p-lg text-left shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-container/70 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="mb-md flex h-16 w-16 items-center justify-center rounded-xl border border-white/5 bg-surface-container-low text-on-surface-variant transition-colors group-hover:text-primary">
                  {isThisAreaSubmitting ? (
                    <Spinner size={SPINNER_SIZE.MEDIUM} />
                  ) : (
                    <MaterialIcon
                      name={card.ICON}
                      className="!text-[32px]"
                    />
                  )}
                </div>
                <Title
                  variant={TitleVariant.SECONDARY}
                  text={WORK_AREA_LABEL[area]}
                  className="!mb-sm !text-headline-lg-mobile !text-on-surface"
                />
                <Text className="!flex-grow !text-body-base text-on-surface-variant/80">
                  {card.DESCRIPTION}
                </Text>
                <span className="mt-md flex items-center gap-1 text-label-mono uppercase tracking-wider text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {WORK_MODE_SCREEN.ENTER}
                  <MaterialIcon
                    name={MATERIAL_ICON_NAME.ARROW_FORWARD}
                    className="!text-[16px]"
                  />
                </span>
              </Button>
            );
          })}
        </div>
      </main>

      <footer className="mt-lg w-full pb-margin-mobile text-center md:mt-xl">
        <Button
          type={BUTTON_TYPES.BUTTON}
          variant={BUTTON.BASE}
          onClick={handleLogout}
          className="inline-flex min-h-12 items-center gap-2 px-md text-label-mono uppercase tracking-widest text-on-surface-variant/60 transition-colors hover:text-error"
        >
          <MaterialIcon
            name={MATERIAL_ICON_NAME.LOGOUT}
            className="!text-[18px]"
          />
          {WORK_MODE_SCREEN.LOGOUT}
        </Button>
      </footer>
    </div>
  );
};

export default WorkModeForm;
