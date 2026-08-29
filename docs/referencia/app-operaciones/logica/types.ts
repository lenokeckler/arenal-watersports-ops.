export type EquipmentType = {
  id: string;
  name: string;
  category: string;
  default_duration_min: number;
  color: string;
  sort_order: number;
  active: boolean;
  menu_group: string;
  damageable: boolean;
  motorized: boolean;
  gas_max_default: number;
  tour_only: boolean;
};

export type Unit = {
  id: string;
  type_id: string;
  label: string;
  damage_count: number;
  damage_notes: string;
  status: 'available' | 'maintenance';
  active: boolean;
  gas_level: number;
  gas_max: number;
  engine_hours: number;
  oil_change_at: number | null;
};

export type Addon = {
  id: string;
  name: string;
  active: boolean;
  /** '' = applies to both lanchas; otherwise the type name (e.g. 'Pontoon'). */
  applies_to: string;
  /** When set, this add-on reserves N real units of that menu group (drops availability). */
  consumes_type: string;
};

/** A fixed guide is a user profile flagged as a guide (Federico, Allan, …). */
export type GuideUser = {
  id: string;
  name: string;
  phone: string;
  color: string;
  is_guide: boolean;
  role: 'admin' | 'staff' | 'reservas';
  blocked: boolean;
};

export type ReservationKind = 'tour' | 'renta';

export type Reservation = {
  id: string;
  unit_id: string | null;
  customer_name: string;
  start_time: string;
  duration_min: number;
  end_time: string;
  status: 'active' | 'returned' | 'cancelled';
  kind: ReservationKind;
  guide_freelance: string;
  return_ok: boolean | null;
  deposit_pending: boolean;
  deposit_resolution: 'returned' | 'retained' | null;
  notes: string;
  created_by: string | null;
  created_at: string;
};

export type DamageKind = 'vuelco' | 'choque' | 'error_maquina' | 'otro';

export type DamageReport = {
  id: string;
  unit_id: string;
  reservation_id: string | null;
  kind: DamageKind;
  description: string;
  x_added: number;
  resolved: boolean;
  created_by: string | null;
  created_at: string;
};

export type UnitWithType = Unit & { type: EquipmentType };

/** An active reservation joined with the unit ids it occupies. */
export type ActiveReservation = Reservation & { unit_ids: string[] };
