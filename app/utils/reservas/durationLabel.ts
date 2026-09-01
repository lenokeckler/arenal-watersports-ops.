import {
  DURATION_PRESET_LABEL,
  DURATION_PRESET_ORDER,
  TIME,
  type DurationPreset,
} from "@/app/constants";

const isDurationPreset = (
  minutes: number
): minutes is DurationPreset =>
  DURATION_PRESET_ORDER.includes(minutes as DurationPreset);

/**
 * US-RES-004/US-OPE-006: "1h 30m", never a bare "90" — the owner's own
 * words are that raw minutes don't read in Costa Rica ("cuesta saber
 * cuánto es"). Shared by the duration input's presets and every read-only
 * display of a reservation's duration, so both always agree on the words.
 */
export const formatDurationLabel = (
  minutes: number
): string => {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "";
  }
  if (isDurationPreset(minutes)) {
    return DURATION_PRESET_LABEL[minutes];
  }

  const hours = Math.floor(
    minutes / TIME.UNITS.MINUTES_IN_HOUR
  );
  const remainderMinutes =
    minutes % TIME.UNITS.MINUTES_IN_HOUR;

  if (hours === 0) {
    return `${remainderMinutes}m`;
  }
  if (remainderMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainderMinutes}m`;
};
