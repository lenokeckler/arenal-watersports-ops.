"use client";

import { useEffect, useState } from "react";
import {
  API,
  SESSION_CONFIG_TYPES,
  type SessionConfigType,
} from "@/app/constants";
import type { WorkdayResponseData } from "@/app/api/acceso/jornada/route";

/** How often the client re-asks the server whether we are in the field
 * workday (US-ACC-009, US-ACC-010, section 5 of the access module design).
 * Frequent enough that crossing 19:00 or 7:00 is noticed within a minute
 * without a navigation having to happen first; infrequent enough that it
 * is not a meaningful amount of extra traffic for six internal users.
 */
const POLL_INTERVAL_MS = 60_000;

/**
 * Asks the server which `SESSION_CONFIG` applies right now (section 5:
 * "la franja la decide el servidor"), never the device clock. Starts
 * assuming `WORKDAY` (the config that never auto-logs-out) so a slow first
 * response cannot itself look like an inactivity timeout, then corrects
 * itself from the server's real answer and keeps re-checking so the
 * boundary crossing is caught without waiting for a navigation.
 */
export const useWorkdaySessionConfig = (): SessionConfigType => {
  const [configType, setConfigType] = useState<SessionConfigType>(
    SESSION_CONFIG_TYPES.WORKDAY
  );

  useEffect(() => {
    let isCancelled = false;

    const refreshWorkdayConfig = async (): Promise<void> => {
      try {
        const response = await fetch(API.ROUTES.WORKDAY, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const body =
          (await response.json()) as WorkdayResponseData;

        if (!isCancelled && typeof body.isWithinWorkday === "boolean") {
          setConfigType(
            body.isWithinWorkday
              ? SESSION_CONFIG_TYPES.WORKDAY
              : SESSION_CONFIG_TYPES.OFF_HOURS
          );
        }
      } catch {
        // Network hiccup: keep whatever config was last known good rather
        // than guessing from the device clock.
      }
    };

    void refreshWorkdayConfig();
    const intervalId = setInterval(refreshWorkdayConfig, POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  return configType;
};
