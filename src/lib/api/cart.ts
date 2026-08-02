import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, writeBatch 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { PanierItem, Produit, UserProfile } from '../../types/database';

export type CartItem = PanierItem & {
  product?: Produit & {
    seller?: Pick<UserProfile, 'full_name' | 'avatar_url'>;
  };
};

const LOCAL_CART_KEY = 'dugu_sugu_local_cart';

function getLocalCart(): any[] {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCart(cart: any[]) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

export async function getCart(userId?: string): Promise<CartItem[]> {
  if (!userId) {
    const localCart = getLocalCart();
    if (localCart.length === 0) return [];

    const items = await Promise.all(localCart.map(async (item) => {
      try {
        const pSnap = await getDoc(doc(db, 'produits', item.product_id));
        if (pSnap.exists()) {
          const pData = pSnap.data() as Produit;
          return {
            ...item,
            product: { ...pData, id: pSnap.id },
          };
        }
      } catch (e) {}
      return item;
    }));

    return items;
  }

  const q = query(collection(db, 'panierItems'), where('user_id', '==', userId));
  const snap = await getDocs(q);

  const cartItems = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as PanierItem;
    const item: CartItem = {
      ...data,
      id: d.id,
      user_id: data.user_id || data.userId || '',
      product_id: data.product_id || data.produitId || '',
      quantity: data.quantity ?? data.quantite ?? 1,
    };

    if (item.product_id) {
      try {
        const pSnap = await getDoc(doc(db, 'produits', item.product_id));
        if (pSnap.exists()) {
          const pData = pSnap.data() as Produit;
          const prod: any = { ...pData, id: pSnap.id };

          const sellerId = pData.seller_id || pData.vendeurId;
          if (sellerId) {
            const sSnap = await getDoc(doc(db, 'users', sellerId));
            if (sSnap.exists()) {
              const sData = sSnap.data() as UserProfile;
              prod.seller = {
                full_name: sData.full_name || `${sData.prenom || ''} ${sData.nom || ''}`.trim(),
                avatar_url: sData.avatar_url,
              };
            }
          }
          item.product = prod;
        }
      } catch (e) {}
    }

    return item;
  }));

  return cartItems;
}

export async function addToCart(productId: string, quantity: number, userId?: string) {
  if (!userId) {
    const cart = getLocalCart();
    const existing = cart.find(item => item.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ id: `local-${Date.now()}`, product_id: productId, quantity });
    }
    saveLocalCart(cart);
    return cart;
  }

  // Check if item exists in Firestore
  const q = query(
    collection(db, 'panierItems'),
    where('user_id', '==', userId),
    where('product_id', '==', productId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    const existingDoc = snap.docs[0];
    const newQty = (existingDoc.data().quantity || 1) + quantity;
    await updateDoc(doc(db, 'panierItems', existingDoc.id), { quantity: newQty, quantite: newQty });
    return { id: existingDoc.id, ...existingDoc.data(), quantity: newQty };
  } else {
    const now = new Date().toISOString();
    const newItem = {
      user_id: userId,
      userId,
      product_id: productId,
      produitId: productId,
      quantity,
      quantite: quantity,
      created_at: now,
      createdAt: now,
    };
    const docRef = await addDoc(collection(db, 'panierItems'), newItem);
    return { id: docRef.id, ...newItem };
  }
}

export async function updateCartItem(itemId: string, quantity: number, userId?: string) {
  if (!userId) {
    let cart = getLocalCart();
    if (quantity <= 0) {
      cart = cart.filter(item => item.id !== itemId);
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item) item.quantity = quantity;
    }
    saveLocalCart(cart);
    return cart;
  }

  if (quantity <= 0) {
    await deleteDoc(doc(db, 'panierItems', itemId));
    return null;
  } else {
    const itemRef = doc(db, 'panierItems', itemId);
    await updateDoc(itemRef, { quantity, quantite: quantity });
    const snap = await getDoc(itemRef);
    return { id: itemId, ...snap.data() };
  }
}

export async function clearCart(userId?: string) {
  if (!userId) {
    localStorage.removeItem(LOCAL_CART_KEY);
    return;
  }

  const q = query(collection(db, 'panierItems'), where('user_id', '==', userId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function syncCartToDb(userId: string) {
  const localCart = getLocalCart();
  if (localCart.length === 0) return;

  for (const item of localCart) {
    await addToCart(item.product_id, item.quantity, userId);
  }

  localStorage.removeItem(LOCAL_CART_KEY);
}
