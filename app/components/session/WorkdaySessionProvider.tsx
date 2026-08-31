"use client";

import type { JSX } from "react";
import LayoutSessionProvider from "./LayoutSessionProvider";
import { useWorkdaySessionConfig } from "./hooks/useWorkdaySessionConfig";
import type { WorkdaySessionProviderProps } from "./models/WorkdaySessionProviderProps.interface";

/**
 * Root-level wiring for US-ACC-009/US-ACC-010: asks the server which
 * `SESSION_CONFIG` applies (`useWorkdaySessionConfig`) and hands it to
 * `LayoutSessionProvider`, which already existed but nothing in the app
 * mounted yet. Kept as a thin wrapper instead of changing
 * `LayoutSessionProviderProps` — that component's contract (take a
 * `configType`) did not need to change, only something needed to compute
 * one from the server instead of a hardcoded prop.
 */
const WorkdaySessionProvider = ({
  children,
}: WorkdaySessionProviderProps): JSX.Element => {
  const configType = useWorkdaySessionConfig();

  return (
    <LayoutSessionProvider configType={configType}>
      {children}
    </LayoutSessionProvider>
  );
};

export default WorkdaySessionProvider;
