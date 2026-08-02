import { doc, getDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile } from '../../types/database';

export type Profile = UserProfile;
export type ProfileWithAccessState = Profile & {
  is_blocked?: boolean;
};

export async function getProfileById(id: string, _accessToken?: string) {
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) {
    throw new Error('Profile not found');
  }
  const data = snap.data() as UserProfile;
  return {
    ...data,
    id: snap.id,
    full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim(),
    created_at: data.created_at || data.createdAt,
    updated_at: data.updated_at || data.updatedAt,
  } as ProfileWithAccessState;
}

export async function getSellers() {
  const q = query(collection(db, 'users'), where('role', '==', 'seller'));
  const querySnap = await getDocs(q);
  return querySnap.docs.map(d => {
    const data = d.data() as UserProfile;
    return {
      ...data,
      id: d.id,
      full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim(),
    };
  });
}

export async function getSellerById(id: string) {
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists() || snap.data().role !== 'seller') {
    throw new Error('Vendeur non trouvé');
  }
  const data = snap.data() as UserProfile;
  return {
    ...data,
    id: snap.id,
    full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim(),
  };
}

export async function updateProfile(id: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', id);
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await updateDoc(userRef, payload);
  const updatedSnap = await getDoc(userRef);
  return { id, ...updatedSnap.data() };
}
