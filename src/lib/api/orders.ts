import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Commande, ArticleCommande, UserProfile, StatutCommande } from '../../types/database';

export type Order = Commande & {
  buyer?: UserProfile;
  seller?: UserProfile;
  items?: (ArticleCommande & {
    product?: any;
  })[];
};

export async function getOrders(options?: { buyerId?: string; sellerId?: string }) {
  const ordersRef = collection(db, 'commandes');
  const constraints: any[] = [];

  if (options?.buyerId) {
    constraints.push(where('buyer_id', '==', options.buyerId));
  }
  if (options?.sellerId) {
    constraints.push(where('seller_id', '==', options.sellerId));
  }

  const q = query(ordersRef, ...constraints);
  const snap = await getDocs(q);

  const orders = await Promise.all(snap.docs.map(async (d) => {
    const data = d.data() as Commande;
    const orderId = d.id;

    const order: Order = {
      ...data,
      id: orderId,
      status: data.status || data.statut || 'pending',
      buyer_id: data.buyer_id || data.acheteurId || '',
      seller_id: data.seller_id || data.vendeurId || '',
      created_at: data.created_at || data.dateCommande || new Date().toISOString(),
      updated_at: data.updated_at || data.updatedAt || new Date().toISOString(),
      items: data.items || data.articles || [],
    };

    // Load buyer
    if (order.buyer_id) {
      try {
        const bSnap = await getDoc(doc(db, 'users', order.buyer_id));
        if (bSnap.exists()) {
          const bData = bSnap.data() as UserProfile;
          order.buyer = {
            ...bData,
            id: bSnap.id,
            full_name: bData.full_name || `${bData.prenom || ''} ${bData.nom || ''}`.trim(),
          };
        }
      } catch (e) {}
    }

    // Load seller
    if (order.seller_id) {
      try {
        const sSnap = await getDoc(doc(db, 'users', order.seller_id));
        if (sSnap.exists()) {
          const sData = sSnap.data() as UserProfile;
          order.seller = {
            ...sData,
            id: sSnap.id,
            full_name: sData.full_name || `${sData.prenom || ''} ${sData.nom || ''}`.trim(),
          };
        }
      } catch (e) {}
    }

    // Populate products for items if needed
    if (order.items && order.items.length > 0) {
      order.items = await Promise.all(order.items.map(async (item) => {
        const prodId = item.product_id || item.produitId;
        let product: any = item.product || item.produit;
        if (!product && prodId) {
          try {
            const pSnap = await getDoc(doc(db, 'produits', prodId));
            if (pSnap.exists()) {
              product = { id: pSnap.id, ...pSnap.data() };
            }
          } catch (e) {}
        }
        return {
          ...item,
          product_id: prodId || '',
          quantity: item.quantity ?? item.quantite ?? 1,
          price_at_time: item.price_at_time ?? item.prixAuMoment ?? 0,
          product: product || { name: 'Produit inconnu', images: [] },
        };
      }));
    }

    return order;
  }));

  // Sort descending by created_at
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getOrderById(id: string) {
  const snap = await getDoc(doc(db, 'commandes', id));
  if (!snap.exists()) throw new Error('Commande non trouvée');

  const data = snap.data() as Commande;
  const order: Order = {
    ...data,
    id: snap.id,
    status: data.status || data.statut || 'pending',
    buyer_id: data.buyer_id || data.acheteurId || '',
    seller_id: data.seller_id || data.vendeurId || '',
    created_at: data.created_at || data.dateCommande || new Date().toISOString(),
    updated_at: data.updated_at || data.updatedAt || new Date().toISOString(),
    items: data.items || data.articles || [],
  };

  if (order.buyer_id) {
    try {
      const bSnap = await getDoc(doc(db, 'users', order.buyer_id));
      if (bSnap.exists()) {
        const bData = bSnap.data() as UserProfile;
        order.buyer = { ...bData, id: bSnap.id, full_name: bData.full_name || `${bData.prenom || ''} ${bData.nom || ''}`.trim() };
      }
    } catch (e) {}
  }

  if (order.seller_id) {
    try {
      const sSnap = await getDoc(doc(db, 'users', order.seller_id));
      if (sSnap.exists()) {
        const sData = sSnap.data() as UserProfile;
        order.seller = { ...sData, id: sSnap.id, full_name: sData.full_name || `${sData.prenom || ''} ${sData.nom || ''}`.trim() };
      }
    } catch (e) {}
  }

  return order;
}

export async function createOrder(
  order: Omit<Commande, 'id' | 'created_at' | 'updated_at'>,
  items: ArticleCommande[]
) {
  const now = new Date().toISOString();
  
  // Attach populated items to order doc
  const fullOrder = {
    ...order,
    status: order.status || 'pending',
    statut: order.status || 'pending',
    items,
    articles: items,
    created_at: now,
    dateCommande: now,
    updated_at: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'commandes'), fullOrder);
  const createdOrder = { id: docRef.id, ...fullOrder };

  // Deduct product stock & check low stock
  for (const item of items) {
    const prodId = item.product_id || item.produitId;
    if (!prodId) continue;

    try {
      const pRef = doc(db, 'produits', prodId);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const pData = pSnap.data();
        const currentStock = pData.stock ?? pData.quantiteStock ?? 0;
        const newStock = Math.max(0, currentStock - (item.quantity || item.quantite || 1));
        const threshold = pData.low_stock_threshold ?? pData.seuilStockBas ?? 10;
        const sellerId = pData.seller_id || pData.vendeurId;

        await updateDoc(pRef, { stock: newStock, quantiteStock: newStock });

        if (currentStock > threshold && newStock <= threshold && sellerId) {
          await addDoc(collection(db, 'notifications'), {
            user_id: sellerId,
            userId: sellerId,
            title: 'Stock faible',
            titre: 'Stock faible',
            message: `Le stock pour le produit "${pData.name || pData.nomProduit}" est maintenant bas (${newStock} restant).`,
            type: 'low_stock',
            lu: false,
            read: false,
            created_at: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error('Erreur mise à jour stock:', err);
    }
  }

  return createdOrder;
}

export async function updateOrderStatus(id: string, status: StatutCommande) {
  const orderRef = doc(db, 'commandes', id);
  const now = new Date().toISOString();
  await updateDoc(orderRef, { 
    status, 
    statut: status,
    updated_at: now,
    updatedAt: now
  });
  const snap = await getDoc(orderRef);
  return { id, ...snap.data() };
}
