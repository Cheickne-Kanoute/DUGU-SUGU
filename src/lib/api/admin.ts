import { supabase } from '../supabase';

export interface SellerRequest {
  id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

export async function createSellerRequest(message: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('seller_requests')
    .insert({
      user_id: user.id,
      message
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSellerRequests() {
  const { data, error } = await supabase
    .from('seller_requests')
    .select(`
      *,
      profiles!seller_requests_user_id_fkey (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as any[];
}

export async function approveSellerRequest(requestId: string, userId: string) {
  // We need to call the secure RPC function to promote the user
  const { error: rpcError } = await supabase.rpc('promote_to_seller', {
    user_to_promote: userId,
    request_id: requestId
  });

  if (rpcError) throw rpcError;
  return true;
}

export async function rejectSellerRequest(requestId: string) {
  const { data, error } = await supabase
    .from('seller_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
