import { supabase } from './supabase';
import type {
  Reservation,
  UnitWithType,
  ActiveReservation,
  ReservationKind,
  DamageKind,
  Unit,
} from './types';

export async function listUnitsWithType(): Promise<UnitWithType[]> {
  const { data, error } = await supabase
    .from('units')
    .select('*, type:equipment_types(*)')
    .eq('active', true);
  if (error) throw error;
  return (data ?? []) as unknown as UnitWithType[];
}

/** Active reservations, each with the list of unit ids it occupies. */
export async function listAddons() {
  const { data, error } = await supabase
    .from('addons')
    .select('*')
    .eq('active', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as import('./types').Addon[];
}

export async function listActiveReservations(): Promise<ActiveReservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_units(unit_id)')
    .eq('status', 'active');
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    ...r,
    unit_ids: (r.reservation_units ?? []).map((ru: any) => ru.unit_id),
  })) as ActiveReservation[];
}

export type NewReservationInput = {
  kind: ReservationKind;
  customer_name: string;
  start_time: string;
  duration_min: number;
  unit_ids: string[];
  guide_ids?: string[];
  guide_freelance?: string;
  addons?: { addon_id: string; quantity: number }[];
  notes?: string;
};

export async function createReservation(input: NewReservationInput): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      kind: input.kind,
      customer_name: input.customer_name,
      start_time: input.start_time,
      duration_min: input.duration_min,
      end_time: input.start_time, // overwritten by the set_end_time trigger
      guide_freelance: input.guide_freelance ?? '',
      notes: input.notes ?? '',
      created_by: userData.user?.id ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;

  const unitRows = input.unit_ids.map((unit_id) => ({ reservation_id: data.id, unit_id }));
  if (unitRows.length) {
    const { error: e2 } = await supabase.from('reservation_units').insert(unitRows);
    if (e2) throw e2;
  }

  if (input.guide_ids?.length) {
    const guideRows = input.guide_ids.map((guide_id) => ({ reservation_id: data.id, guide_id }));
    const { error: e3 } = await supabase.from('reservation_guides').insert(guideRows);
    if (e3) throw e3;
  }

  if (input.addons?.length) {
    const addonRows = input.addons.map((a) => ({ reservation_id: data.id, ...a }));
    const { error: e4 } = await supabase.from('reservation_addons').insert(addonRows);
    if (e4) throw e4;
  }
}

export type CloseInput = {
  status: 'returned' | 'cancelled';
  return_ok?: boolean;
  deposit_pending?: boolean;
};

export async function closeReservation(id: string, input: CloseInput): Promise<void> {
  const { error } = await supabase
    .from('reservations')
    .update({
      status: input.status,
      return_ok: input.return_ok ?? null,
      deposit_pending: input.deposit_pending ?? false,
    })
    .eq('id', id);
  if (error) throw error;
}

/** Marca un depósito de garantía como devuelto o retenido y lo saca de pendientes. */
export async function resolveDeposit(id: string, resolution: 'returned' | 'retained'): Promise<void> {
  const { error } = await supabase
    .from('reservations')
    .update({ deposit_pending: false, deposit_resolution: resolution })
    .eq('id', id);
  if (error) throw error;
}

export async function extendReservation(id: string, extraMin: number): Promise<void> {
  const { data, error } = await supabase
    .from('reservations')
    .select('duration_min')
    .eq('id', id)
    .single();
  if (error) throw error;
  const next = Math.max(1, (data.duration_min as number) + extraMin);
  const { error: e2 } = await supabase
    .from('reservations')
    .update({ duration_min: next })
    .eq('id', id);
  if (e2) throw e2;
}

/** Patch any unit fields (damage, gas, hours, maintenance, gas_max, oil threshold). */
export async function updateUnit(unit_id: string, patch: Partial<Unit>): Promise<void> {
  const { error } = await supabase.from('units').update(patch).eq('id', unit_id);
  if (error) throw error;
}

export async function createDamageReport(input: {
  unit_id: string;
  reservation_id?: string | null;
  kind: DamageKind;
  description: string;
  x_added: number;
}): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const { error } = await supabase.from('damage_reports').insert({
    unit_id: input.unit_id,
    reservation_id: input.reservation_id ?? null,
    kind: input.kind,
    description: input.description,
    x_added: input.x_added,
    created_by: userData.user?.id ?? null,
  });
  if (error) throw error;

  // If X were added now, bump the unit's damage_count.
  if (input.x_added > 0) {
    const { data: u, error: e2 } = await supabase
      .from('units')
      .select('damage_count')
      .eq('id', input.unit_id)
      .single();
    if (e2) throw e2;
    const { error: e3 } = await supabase
      .from('units')
      .update({ damage_count: (u.damage_count as number) + input.x_added })
      .eq('id', input.unit_id);
    if (e3) throw e3;
  }
}

export async function loadReservationWithDetails(id: string): Promise<
  (Reservation & { units: UnitWithType[]; addons: { name: string; quantity: number }[] }) | null
> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*, reservation_units(unit:units(*, type:equipment_types(*))), reservation_addons(quantity, addon:addons(name))')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  const units = ((data as any).reservation_units ?? []).map((ru: any) => ru.unit) as UnitWithType[];
  const addons = ((data as any).reservation_addons ?? []).map((ra: any) => ({
    name: ra.addon?.name ?? '',
    quantity: ra.quantity,
  }));
  return { ...(data as any), units, addons };
}
