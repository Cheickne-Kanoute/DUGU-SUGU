// Types Firestore — DUGU SUGU

export interface UserProfile {
  id: string;
  nom: string;
  prenom: string;
  full_name?: string; // Computed helper / compatibility
  email: string;
  role: 'client' | 'seller' | 'admin';
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  nomBoutique?: string | null;
  product_count?: number;
  productCount?: number;
  rating?: number;
  is_blocked?: boolean;
  isBlocked?: boolean;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Categorie {
  id: string;
  name: string;
  nom?: string;
  image: string;
  description?: string | null;
}

export interface Produit {
  id: string;
  seller_id: string;
  vendeurId?: string;
  category_id: string;
  categorieId?: string;
  name: string;
  nomProduit?: string;
  description: string;
  price: number;
  prix?: number;
  images: string[];
  stock: number;
  quantiteStock?: number;
  unit: string;
  unite?: string;
  is_bio: boolean;
  isBio?: boolean;
  available: boolean;
  disponible?: boolean;
  low_stock_threshold: number;
  seuilStockBas?: number;
  seller?: UserProfile;
  vendeur?: UserProfile;
  categories?: { name: string; image: string };
  categorie?: Categorie;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleCommande {
  id?: string;
  product_id: string;
  produitId?: string;
  quantity: number;
  quantite?: number;
  price_at_time: number;
  prixAuMoment?: number;
  product?: Produit;
  produit?: Produit;
}

export type StatutCommande = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Commande {
  id: string;
  buyer_id: string;
  acheteurId?: string;
  seller_id: string;
  vendeurId?: string;
  status: StatutCommande;
  statut?: StatutCommande;
  total: number;
  shipping_address?: string | null;
  adresseLivraison?: string | null;
  items?: ArticleCommande[];
  articles?: ArticleCommande[];
  buyer?: UserProfile;
  seller?: UserProfile;
  acheteur?: UserProfile;
  vendeur?: UserProfile;
  created_at: string;
  updated_at: string;
  dateCommande?: string;
  updatedAt?: string;
}

export interface Paiement {
  id: string;
  order_id: string;
  commandeId?: string;
  date_paiement: string;
  datePaiement?: string;
  montant: number;
  mode_paiement: 'livraison' | 'mobile_money' | 'virement';
  modePaiement?: 'livraison' | 'mobile_money' | 'virement';
  statut_paiement: 'en_attente' | 'confirme' | 'refuse';
  statutPaiement?: 'en_attente' | 'confirme' | 'refuse';
  created_at?: string;
}

export interface Livraison {
  id: string;
  order_id: string;
  commandeId?: string;
  date_livraison?: string | null;
  dateLivraison?: string | null;
  statut_livraison: 'en_attente' | 'en_cours' | 'livre';
  statutLivraison?: 'en_attente' | 'en_cours' | 'livre';
  adresse_livraison?: string | null;
  adresseLivraison?: string | null;
  created_at?: string;
}

export interface PanierItem {
  id: string;
  user_id: string;
  userId?: string;
  product_id: string;
  produitId?: string;
  quantity: number;
  quantite?: number;
  product?: Produit;
  produit?: Produit;
  created_at?: string;
  createdAt?: string;
}

export interface Avis {
  id: string;
  product_id: string;
  produitId?: string;
  buyer_id: string;
  acheteurId?: string;
  rating: number;
  note?: number;
  comment?: string | null;
  commentaire?: string | null;
  buyer?: UserProfile;
  acheteur?: UserProfile;
  created_at?: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  userId?: string;
  type: 'new_order' | 'order_status' | 'low_stock' | 'new_review' | 'system';
  title: string;
  titre?: string;
  message: string;
  link?: string | null;
  lien?: string | null;
  read: boolean;
  lu?: boolean;
  created_at?: string;
  createdAt?: string;
}

export interface Favori {
  id: string;
  user_id: string;
  userId?: string;
  product_id: string;
  produitId?: string;
  created_at?: string;
  createdAt?: string;
}

export interface DemandeVendeur {
  id: string;
  user_id: string;
  userId?: string;
  status: 'pending' | 'approved' | 'rejected';
  statut?: 'pending' | 'approved' | 'rejected';
  message: string;
  profiles?: { full_name: string; email: string };
  created_at?: string;
  createdAt?: string;
}

// Database interface compatibility shim for previous imports if any
export interface Database {
  public: {
    Tables: {
      profiles: { Row: UserProfile; Insert: Partial<UserProfile>; Update: Partial<UserProfile> };
      categories: { Row: Categorie; Insert: Partial<Categorie>; Update: Partial<Categorie> };
      products: { Row: Produit; Insert: Partial<Produit>; Update: Partial<Produit> };
      orders: { Row: Commande; Insert: Partial<Commande>; Update: Partial<Commande> };
      order_items: { Row: ArticleCommande; Insert: Partial<ArticleCommande>; Update: Partial<ArticleCommande> };
      cart_items: { Row: PanierItem; Insert: Partial<PanierItem>; Update: Partial<PanierItem> };
      reviews: { Row: Avis; Insert: Partial<Avis>; Update: Partial<Avis> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
      favorites: { Row: Favori; Insert: Partial<Favori>; Update: Partial<Favori> };
      seller_requests: { Row: DemandeVendeur; Insert: Partial<DemandeVendeur>; Update: Partial<DemandeVendeur> };
      paiements: { Row: Paiement; Insert: Partial<Paiement>; Update: Partial<Paiement> };
      livraisons: { Row: Livraison; Insert: Partial<Livraison>; Update: Partial<Livraison> };
    }
  }
}
