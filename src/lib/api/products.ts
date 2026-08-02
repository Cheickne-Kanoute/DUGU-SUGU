import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where 
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Produit, UserProfile } from '../../types/database';

export type Product = Produit & {
  seller?: UserProfile;
  categories?: { name: string; image: string };
};

export async function getProducts(options?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
}) {
  const productsRef = collection(db, 'produits');
  const constraints: any[] = [];

  if (options?.category && options.category !== 'all') {
    constraints.push(where('category_id', '==', options.category));
  }

  if (options?.sellerId) {
    constraints.push(where('seller_id', '==', options.sellerId));
  }

  const q = query(productsRef, ...constraints);
  const querySnap = await getDocs(q);

  let products = await Promise.all(querySnap.docs.map(async (d) => {
    const data = d.data() as Produit;
    const prod: Product = {
      ...data,
      id: d.id,
      name: data.name || data.nomProduit || '',
      price: data.price ?? data.prix ?? 0,
      stock: data.stock ?? data.quantiteStock ?? 0,
      seller_id: data.seller_id || data.vendeurId || '',
      category_id: data.category_id || data.categorieId || '',
      low_stock_threshold: data.low_stock_threshold ?? data.seuilStockBas ?? 10,
      unit: data.unit || data.unite || 'kg',
      is_bio: data.is_bio ?? data.isBio ?? false,
      available: data.available ?? data.disponible ?? true,
      images: data.images || [],
    };

    // Fetch seller details if seller_id exists
    if (prod.seller_id) {
      try {
        const sellerSnap = await getDoc(doc(db, 'users', prod.seller_id));
        if (sellerSnap.exists()) {
          const sData = sellerSnap.data() as UserProfile;
          prod.seller = {
            ...sData,
            id: sellerSnap.id,
            full_name: sData.full_name || `${sData.prenom || ''} ${sData.nom || ''}`.trim(),
          };
        }
      } catch (e) {
        console.error('Error loading seller for product', e);
      }
    }

    return prod;
  }));

  // Client-side filtering for search, price range
  if (options?.search) {
    const term = options.search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    );
  }

  if (options?.minPrice !== undefined) {
    products = products.filter(p => p.price >= options.minPrice!);
  }

  if (options?.maxPrice !== undefined) {
    products = products.filter(p => p.price <= options.maxPrice!);
  }

  return products;
}

export async function getProductById(id: string) {
  const snap = await getDoc(doc(db, 'produits', id));
  if (!snap.exists()) {
    throw new Error('Produit non trouvé');
  }

  const data = snap.data() as Produit;
  const prod: Product = {
    ...data,
    id: snap.id,
    name: data.name || data.nomProduit || '',
    price: data.price ?? data.prix ?? 0,
    stock: data.stock ?? data.quantiteStock ?? 0,
    seller_id: data.seller_id || data.vendeurId || '',
    category_id: data.category_id || data.categorieId || '',
    low_stock_threshold: data.low_stock_threshold ?? data.seuilStockBas ?? 10,
    unit: data.unit || data.unite || 'kg',
    is_bio: data.is_bio ?? data.isBio ?? false,
    available: data.available ?? data.disponible ?? true,
    images: data.images || [],
  };

  if (prod.seller_id) {
    try {
      const sellerSnap = await getDoc(doc(db, 'users', prod.seller_id));
      if (sellerSnap.exists()) {
        const sData = sellerSnap.data() as UserProfile;
        prod.seller = {
          ...sData,
          id: sellerSnap.id,
          full_name: sData.full_name || `${sData.prenom || ''} ${sData.nom || ''}`.trim(),
        };
      }
    } catch (e) {}
  }

  return prod;
}

export async function createProduct(product: Omit<Produit, 'id' | 'created_at' | 'updated_at'>) {
  const now = new Date().toISOString();
  const payload = {
    ...product,
    created_at: now,
    createdAt: now,
    updated_at: now,
    updatedAt: now,
  };
  const docRef = await addDoc(collection(db, 'produits'), payload);
  return { id: docRef.id, ...payload };
}

export async function updateProduct(id: string, updates: Partial<Produit>) {
  const prodRef = doc(db, 'produits', id);
  const now = new Date().toISOString();
  const payload = {
    ...updates,
    updated_at: now,
    updatedAt: now,
  };
  await updateDoc(prodRef, payload);
  const snap = await getDoc(prodRef);
  return { id, ...snap.data() };
}

export async function deleteProduct(id: string) {
  await deleteDoc(doc(db, 'produits', id));
}
