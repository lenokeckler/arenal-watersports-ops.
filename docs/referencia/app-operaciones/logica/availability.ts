import type { Unit, Reservation, ActiveReservation } from './types';

export type UnitState = 'free' | 'busy' | 'overdue' | 'maintenance';

export function unitStatus(unit: Unit, active: Reservation | null, now: Date): UnitState {
  if (unit.status === 'maintenance') return 'maintenance';
  if (!active) return 'free';
  return now >= new Date(active.end_time) ? 'overdue' : 'busy';
}

export function minutesUntilFree(active: Reservation, now: Date): number {
  const ms = new Date(active.end_time).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 60000));
}

/** A motorized unit needs an oil change once its engine hours reach the threshold. */
export function needsOil(unit: { engine_hours: number; oil_change_at: number | null }): boolean {
  return unit.oil_change_at != null && unit.engine_hours >= unit.oil_change_at;
}

/** Map each occupied unit id to the active reservation holding it. */
export function occupancyMap(reservations: ActiveReservation[]): Map<string, ActiveReservation> {
  const m = new Map<string, ActiveReservation>();
  for (const r of reservations) {
    for (const uid of r.unit_ids) m.set(uid, r);
  }
  return m;
}
