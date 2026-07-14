import { API_URL, supabase } from '../supabase';
import type { Database } from '../../types/database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileWithAccessState = Profile & {
  is_blocked?: boolean;
};

export async function getProfileById(id: string, accessToken?: string) {
  const res = await fetch(`${API_URL}/profiles/${id}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Profile not found');
  }

  return data as ProfileWithAccessState;
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
