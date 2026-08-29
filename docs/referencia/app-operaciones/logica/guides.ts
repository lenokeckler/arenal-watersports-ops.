import { supabase } from './supabase';
import type { GuideUser } from './types';

/** Fixed guides = user profiles flagged is_guide. */
export async function listGuides(): Promise<GuideUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, color, is_guide, role, blocked')
    .eq('is_guide', true)
    .order('name');
  if (error) throw error;
  return (data ?? []) as GuideUser[];
}

/** All users (for admin to mark/unmark guides). */
export async function listProfiles(): Promise<GuideUser[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, phone, color, is_guide, role, blocked')
    .order('name');
  if (error) throw error;
  return (data ?? []) as GuideUser[];
}

export async function updateProfile(id: string, patch: Partial<GuideUser>): Promise<void> {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id);
  if (error) throw error;
}
