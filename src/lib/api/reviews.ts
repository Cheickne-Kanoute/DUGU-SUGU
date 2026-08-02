import { 
  collection, doc, getDoc, getDocs, addDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Avis, UserProfile } from '../../types/database';

export type Review = Avis & {
  buyer?: UserProfile;
};

export async function getProductReviews(productId: string) {
  const q = query(
    collection(db, 'avis'),
    where('product_id', '==', productId)
  );
  const snap = await getDocs(q);

  const reviews = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as Avis;
    const rev: Review = {
      ...data,
      id: d.id,
      product_id: data.product_id || data.produitId || '',
      buyer_id: data.buyer_id || data.acheteurId || '',
      rating: data.rating ?? data.note ?? 5,
      comment: data.comment || data.commentaire || '',
      created_at: data.created_at || data.createdAt || new Date().toISOString(),
    };

    if (rev.buyer_id) {
      try {
        const bSnap = await getDoc(doc(db, 'users', rev.buyer_id));
        if (bSnap.exists()) {
          const bData = bSnap.data() as UserProfile;
          rev.buyer = {
            ...bData,
            id: bSnap.id,
            full_name: bData.full_name || `${bData.prenom || ''} ${bData.nom || ''}`.trim(),
          };
        }
      } catch (e) {}
    }

    return rev;
  }));

  return reviews.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime());
}

export async function getSellerReviews(sellerId: string) {
  const snap = await getDocs(collection(db, 'avis'));
  const allReviews = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as Avis;
    const prodId = data.product_id || data.produitId;
    let prodSellerId = '';
    if (prodId) {
      try {
        const pSnap = await getDoc(doc(db, 'produits', prodId));
        if (pSnap.exists()) {
          prodSellerId = pSnap.data().seller_id || pSnap.data().vendeurId || '';
        }
      } catch (e) {}
    }

    return {
      ...data,
      id: d.id,
      seller_id: prodSellerId,
    };
  }));

  return allReviews.filter(r => r.seller_id === sellerId);
}

export async function createReview(review: Omit<Avis, 'id' | 'created_at'>) {
  const now = new Date().toISOString();
  const payload = {
    ...review,
    created_at: now,
    createdAt: now,
  };
  const docRef = await addDoc(collection(db, 'avis'), payload);
  return { id: docRef.id, ...payload };
}
