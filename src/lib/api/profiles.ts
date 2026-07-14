import { supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileWithAccessState = Profile & {
  is_blocked?: boolean;
};

export async function getProfileById(id: string, accessToken?: string) {
  // Get the public profile
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message || 'Profile not found');
  }

  const profileWithAccessState = { ...(data as Profile), is_blocked: false } as ProfileWithAccessState;

  // Check if session is still valid (banned users will fail this check)
  if (accessToken) {
    const { error: authError } = await supabase.auth.getUser(accessToken);
    if (authError) {
      profileWithAccessState.is_blocked = true;
    }
  }

  return profileWithAccessState;
}

export async function getSellers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'seller')
    .order('rating', { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function getSellerById(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'seller')
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(id: string, updates: Database['public']['Tables']['profiles']['Update']) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
