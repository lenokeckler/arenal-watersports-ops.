"use client";

import { useEffect } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { REALTIME } from "@/app/constants";
// Deep import on purpose — see `useLoginFormViewModel.ts`: the barrel
// bundles the server client (`next/headers`) together with this one and
// breaks the client build.
import { createClient as createBrowserSupabaseClient } from "@/app/services/supabase/client";

/**
 * US-TAB-003: the board (and a category opened) update on every device the
 * moment a colleague dispatches or closes, with no refresh. Subscribes to
 * the four tables the data model already put in the `supabase_realtime`
 * publication and re-runs `onChange` — which always re-reads from
 * `unit_current_state` / `category_availability`, never recomputes
 * anything client-side. A short debounce coalesces one dispatch, which
 * writes to more than one of those tables, into a single refetch.
 */
export const useEquipmentRealtimeRefresh = (
  onChange: () => void,
  channelName: string
): void => {
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleRefresh = (): void => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      debounceTimer = setTimeout(onChange, REALTIME.DEBOUNCE_MS);
    };

    const channel: RealtimeChannel = REALTIME.WATCHED_TABLES.reduce(
      (channelBuilder, table) =>
        channelBuilder.on(
          "postgres_changes",
          { event: REALTIME.EVENT_ALL, schema: REALTIME.SCHEMA_PUBLIC, table },
          scheduleRefresh
        ),
      supabase.channel(`${REALTIME.CHANNEL_PREFIX}${channelName}`)
    );

    channel.subscribe();

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      void supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);
};
