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
  const [sellersSnap, productsSnap] = await Promise.all([
    getDocs(q),
    getDocs(collection(db, 'produits')),
  ]);

  const productCountBySeller = new Map<string, number>();
  productsSnap.docs.forEach(d => {
    const data = d.data();
    const sId = data.seller_id || data.vendeurId;
    if (sId) {
      productCountBySeller.set(sId, (productCountBySeller.get(sId) || 0) + 1);
    }
  });

  return sellersSnap.docs.map(d => {
    const data = d.data() as UserProfile;
    const count = productCountBySeller.get(d.id) || 0;
    return {
      ...data,
      id: d.id,
      full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim(),
      product_count: count,
      productCount: count,
    };
  });
}

export async function getSellerById(id: string) {
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) {
    throw new Error('Vendeur non trouvé');
  }
  const data = snap.data() as UserProfile;

  const prodsQ = query(collection(db, 'produits'), where('seller_id', '==', id));
  const prodsSnap = await getDocs(prodsQ);

  return {
    ...data,
    id: snap.id,
    full_name: data.full_name || `${data.prenom || ''} ${data.nom || ''}`.trim(),
    product_count: prodsSnap.size,
    productCount: prodsSnap.size,
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
