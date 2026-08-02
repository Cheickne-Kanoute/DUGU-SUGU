import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Livraison } from '../../types/database';

export type { Livraison };

// LivrerCommande()
export async function createLivraison(data: {
  order_id: string;
  adresse_livraison?: string;
  statut_livraison?: 'en_attente' | 'en_cours' | 'livre';
}) {
  // Check if exists
  const q = query(collection(db, 'livraisons'), where('order_id', '==', data.order_id));
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingId = snap.docs[0].id;
    const ref = doc(db, 'livraisons', existingId);
    await updateDoc(ref, {
      statut_livraison: data.statut_livraison || 'en_cours',
      statutLivraison: data.statut_livraison || 'en_cours',
    });
    return { id: existingId, ...snap.docs[0].data() };
  }

  const now = new Date().toISOString();
  const payload = {
    order_id: data.order_id,
    commandeId: data.order_id,
    adresse_livraison: data.adresse_livraison || '',
    adresseLivraison: data.adresse_livraison || '',
    statut_livraison: data.statut_livraison || 'en_attente',
    statutLivraison: data.statut_livraison || 'en_attente',
    date_livraison: null,
    created_at: now,
  };

  const docRef = await addDoc(collection(db, 'livraisons'), payload);
  return { id: docRef.id, ...payload };
}

export async function getLivraisonByOrder(orderId: string) {
  const q = query(collection(db, 'livraisons'), where('order_id', '==', orderId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Livraison;
}

// ConfirmerReception()
export async function confirmerReception(livraisonId: string) {
  const now = new Date().toISOString();
  const ref = doc(db, 'livraisons', livraisonId);
  await updateDoc(ref, {
    statut_livraison: 'livre',
    statutLivraison: 'livre',
    date_livraison: now,
    dateLivraison: now,
  });
  const snap = await getDoc(ref);
  return { id: livraisonId, ...snap.data() } as Livraison;
}
