import { supabase } from './supabase';

/** Redirect to /login when there is no active session. Call on protected pages. */
export async function requireAuth(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) location.href = '/login';
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  location.href = '/login';
}

export type Role = 'admin' | 'staff' | 'reservas';

/** The signed-in user's role, or null if not signed in or blocked. */
export async function getRole(): Promise<Role | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('role, blocked')
    .eq('id', userData.user.id)
    .single();
  if (data?.blocked) {
    await supabase.auth.signOut();
    if (typeof location !== 'undefined') location.href = '/login';
    return null;
  }
  return (data?.role as Role) ?? null;
}

/** True when the signed-in user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === 'admin';
}

/** Admin and staff (operaciones) can create/close reservations and edit equipment. */
export async function canOperate(): Promise<boolean> {
  const r = await getRole();
  return r === 'admin' || r === 'staff';
}

/** Hide elements marked `.operate-only` from the "reservas" (read-only) role. */
export async function applyRoleVisibility(): Promise<void> {
  if (await canOperate()) return;
  document.querySelectorAll<HTMLElement>('.operate-only').forEach((el) => {
    el.style.display = 'none';
  });
}
