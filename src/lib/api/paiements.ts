import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Paiement } from '../../types/database';

export type { Paiement };

// InitierPaiement()
export async function createPaiement(data: {
  order_id: string;
  montant: number;
  mode_paiement?: 'livraison' | 'mobile_money' | 'virement';
  statut_paiement?: 'en_attente' | 'confirme' | 'annule';
}) {
  const now = new Date().toISOString();
  const payload = {
    order_id: data.order_id,
    commandeId: data.order_id,
    montant: data.montant,
    mode_paiement: data.mode_paiement || 'livraison',
    modePaiement: data.mode_paiement || 'livraison',
    statut_paiement: 'en_attente',
    statutPaiement: 'en_attente',
    date_paiement: now,
    datePaiement: now,
  };

  const docRef = await addDoc(collection(db, 'paiements'), payload);
  return { id: docRef.id, ...payload };
}

export async function getPaiementByOrder(orderId: string) {
  const q = query(collection(db, 'paiements'), where('order_id', '==', orderId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Paiement;
}

// ConfirmerPaiement()
export async function confirmerPaiement(paiementId: string) {
  const ref = doc(db, 'paiements', paiementId);
  await updateDoc(ref, {
    statut_paiement: 'confirme',
    statutPaiement: 'confirme',
  });
  const snap = await getDoc(ref);
  return { id: paiementId, ...snap.data() } as Paiement;
}
