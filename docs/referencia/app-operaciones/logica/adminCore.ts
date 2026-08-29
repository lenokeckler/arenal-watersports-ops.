import type { SupabaseClient } from '@supabase/supabase-js';
import type { Role } from './auth';
import { checkAdminGuard } from './adminGuards';
import { usernameToEmail, isValidUsername } from './username';

export type AdminActionBody =
  | { action: 'create'; username: string; password: string; name: string; role: Role; is_guide: boolean }
  | { action: 'block'; userId: string }
  | { action: 'unblock'; userId: string }
  | { action: 'reset-password'; userId: string; password: string };

export type AdminActionResult = { status: number; body: { error?: string; ok?: boolean; id?: string } };

const BAN_FOREVER = '876000h'; // ~100 años

export async function runAdminAction(
  client: SupabaseClient,
  callerToken: string | null,
  body: AdminActionBody,
): Promise<AdminActionResult> {
  if (!callerToken) return { status: 401, body: { error: 'No autorizado.' } };
  const { data: userData, error: userErr } = await client.auth.getUser(callerToken);
  if (userErr || !userData?.user) return { status: 401, body: { error: 'Sesión inválida.' } };
  const callerId = userData.user.id;

  const { data: callerProfile } = await client
    .from('profiles').select('role').eq('id', callerId).single();
  if (callerProfile?.role !== 'admin') return { status: 403, body: { error: 'Solo administradores.' } };

  switch (body.action) {
    case 'create': return createWorker(client, body);
    case 'block': return setBlocked(client, callerId, body.userId, true);
    case 'unblock': return setBlocked(client, callerId, body.userId, false);
    case 'reset-password': return resetPassword(client, callerId, body.userId, body.password);
    default: return { status: 400, body: { error: 'Acción desconocida.' } };
  }
}

async function countActiveAdmins(client: SupabaseClient): Promise<number> {
  const { count } = await client
    .from('profiles').select('id', { count: 'exact', head: true })
    .eq('role', 'admin').eq('blocked', false);
  return count ?? 0;
}

async function isAdminTarget(client: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await client.from('profiles').select('role').eq('id', userId).single();
  return data?.role === 'admin';
}

async function createWorker(
  client: SupabaseClient,
  body: Extract<AdminActionBody, { action: 'create' }>,
): Promise<AdminActionResult> {
  if (!isValidUsername(body.username)) {
    return { status: 400, body: { error: 'Usuario inválido (use letras, números, . _ -).' } };
  }
  if (!body.password || body.password.length < 6) {
    return { status: 400, body: { error: 'La contraseña debe tener al menos 6 caracteres.' } };
  }
  const email = usernameToEmail(body.username);
  const { data, error } = await client.auth.admin.createUser({
    email, password: body.password, email_confirm: true,
  });
  if (error || !data?.user) {
    const dup = (error?.message ?? '').toLowerCase().includes('already');
    return { status: dup ? 409 : 400, body: { error: dup ? 'Ese usuario ya existe.' : (error?.message ?? 'No se pudo crear.') } };
  }
  // El trigger handle_new_user creó el perfil; fijamos sus campos.
  // Si este UPDATE falla, la cuenta de Auth ya existe con los valores por
  // defecto del trigger (role 'staff', name vacío) y queda editable desde la
  // lista; reintentar el alta da 409 (ya existe) en vez de duplicar.
  const { error: pErr } = await client.from('profiles')
    .update({ name: body.name, role: body.role, is_guide: body.is_guide, blocked: false })
    .eq('id', data.user.id);
  if (pErr) return { status: 400, body: { error: 'Cuenta creada pero no se pudo guardar el perfil.' } };
  return { status: 200, body: { ok: true, id: data.user.id } };
}

async function setBlocked(
  client: SupabaseClient, callerId: string, userId: string, block: boolean,
): Promise<AdminActionResult> {
  if (block) {
    const guard = checkAdminGuard({
      isSelf: userId === callerId,
      targetIsAdmin: await isAdminTarget(client, userId),
      activeAdminCount: await countActiveAdmins(client),
    });
    if (!guard.ok) return { status: 400, body: { error: guard.reason } };
  }
  // Orden deliberado: primero el ban en Auth (la mitad crítica para la
  // seguridad), luego se espeja profiles.blocked; si el espejo falla, el
  // usuario queda bloqueado en Auth (seguro) y se corrige reintentando.
  const { error: banErr } = await client.auth.admin.updateUserById(userId, {
    ban_duration: block ? BAN_FOREVER : 'none',
  });
  if (banErr) return { status: 400, body: { error: banErr.message } };
  const { error: pErr } = await client.from('profiles').update({ blocked: block }).eq('id', userId);
  if (pErr) return { status: 400, body: { error: pErr.message } };
  return { status: 200, body: { ok: true } };
}

async function resetPassword(
  client: SupabaseClient, callerId: string, userId: string, password: string,
): Promise<AdminActionResult> {
  if (userId === callerId) return { status: 400, body: { error: 'No puedes resetear tu propia cuenta desde aquí.' } };
  if (!password || password.length < 6) {
    return { status: 400, body: { error: 'La contraseña debe tener al menos 6 caracteres.' } };
  }
  const { error } = await client.auth.admin.updateUserById(userId, { password });
  if (error) return { status: 400, body: { error: error.message } };
  return { status: 200, body: { ok: true } };
}
