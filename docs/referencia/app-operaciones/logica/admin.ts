import { supabase } from './supabase';
import type { Role } from './auth';

const ENDPOINT = '/.netlify/functions/admin-users';

async function call(body: unknown): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: token ? `Bearer ${token}` : '' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({} as { error?: string }));
    throw new Error((msg as { error?: string }).error ?? 'Error del servidor.');
  }
}

export function createWorker(p: { username: string; password: string; name: string; role: Role; is_guide: boolean }): Promise<void> {
  return call({ action: 'create', ...p });
}
export function blockWorker(userId: string): Promise<void> { return call({ action: 'block', userId }); }
export function unblockWorker(userId: string): Promise<void> { return call({ action: 'unblock', userId }); }
export function resetPassword(userId: string, password: string): Promise<void> { return call({ action: 'reset-password', userId, password }); }
