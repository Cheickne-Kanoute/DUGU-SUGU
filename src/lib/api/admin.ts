import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import type { DemandeVendeur, UserProfile } from '../../types/database';

export type SellerRequest = DemandeVendeur & {
  profiles?: {
    full_name: string;
    email: string;
  };
};

export async function createSellerRequest(message: string) {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Non authentifié');

  const now = new Date().toISOString();
  const payload = {
    user_id: currentUser.uid,
    userId: currentUser.uid,
    message,
    status: 'pending',
    statut: 'pending',
    created_at: now,
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, 'demandesVendeur'), payload);
  return { id: docRef.id, ...payload };
}

export async function getSellerRequests() {
  const snap = await getDocs(collection(db, 'demandesVendeur'));

  const requests = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as DemandeVendeur;
    const req: SellerRequest = {
      ...data,
      id: d.id,
      user_id: data.user_id || data.userId || '',
      status: data.status || data.statut || 'pending',
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
    };

    if (req.user_id) {
      try {
        const uSnap = await getDoc(doc(db, 'users', req.user_id));
        if (uSnap.exists()) {
          const uData = uSnap.data() as UserProfile;
          req.profiles = {
            full_name: uData.full_name || `${uData.prenom || ''} ${uData.nom || ''}`.trim(),
            email: uData.email || '',
          };
        }
      } catch (e) {}
    }

    return req;
  }));

  return requests.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function approveSellerRequest(requestId: string, userId: string) {
  const now = new Date().toISOString();
  // 1. Update seller_request status
  await updateDoc(doc(db, 'demandesVendeur', requestId), { status: 'approved', statut: 'approved' });
  // 2. Promote user to seller role
  await updateDoc(doc(db, 'users', userId), { role: 'seller', updatedAt: now });
  return true;
}

export async function rejectSellerRequest(requestId: string) {
  const reqRef = doc(db, 'demandesVendeur', requestId);
  await updateDoc(reqRef, { status: 'rejected', statut: 'rejected' });
  const snap = await getDoc(reqRef);
  return { id: requestId, ...snap.data() };
}
