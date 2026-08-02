import { 
  collection, doc, getDoc, getDocs, addDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Favori, Produit } from '../../types/database';

export type Favorite = Favori & {
  product?: Produit;
};

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const q = query(collection(db, 'favoris'), where('user_id', '==', userId));
  const snap = await getDocs(q);

  const favorites = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as Favori;
    const prodId = data.product_id || data.produitId || '';
    let product: Produit | undefined = undefined;

    if (prodId) {
      try {
        const pSnap = await getDoc(doc(db, 'produits', prodId));
        if (pSnap.exists()) {
          const pData = pSnap.data() as Produit;
          product = {
            ...pData,
            id: pSnap.id,
            name: pData.name || pData.nomProduit || '',
            price: pData.price ?? pData.prix ?? 0,
            images: pData.images || [],
          };
        }
      } catch (e) {}
    }

    return {
      ...data,
      id: d.id,
      product_id: prodId,
      user_id: data.user_id || data.userId || '',
      product,
    };
  }));

  return favorites;
}

export async function addFavorite(productId: string, userId: string) {
  const q = query(
    collection(db, 'favoris'),
    where('user_id', '==', userId),
    where('product_id', '==', productId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    userId,
    product_id: productId,
    produitId: productId,
    created_at: now,
    createdAt: now,
  };

  const docRef = await addDoc(collection(db, 'favoris'), payload);
  return { id: docRef.id, ...payload };
}

export async function removeFavorite(productId: string, userId: string) {
  const q = query(
    collection(db, 'favoris'),
    where('user_id', '==', userId),
    where('product_id', '==', productId)
  );
  const snap = await getDocs(q);

  for (const d of snap.docs) {
    await deleteDoc(d.ref);
  }
}

export async function toggleFavorite(userId: string, productId: string): Promise<boolean> {
  const q = query(
    collection(db, 'favoris'),
    where('user_id', '==', userId),
    where('product_id', '==', productId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
    return false;
  } else {
    await addFavorite(productId, userId);
    return true;
  }
}
