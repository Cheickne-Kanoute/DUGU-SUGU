import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env from parent directory
import path from 'path';
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: SUPABASE_URL or SUPABASE_SERVICE_KEY not set. Using mock data mode.');
}

// Polyfill minimal pour WebSocket (Requis par @supabase/supabase-js sur Node < 22)
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocket {
    CONNECTING = 0; OPEN = 1; CLOSING = 2; CLOSED = 3;
    readyState = 3;
    constructor() { }
    close() { }
    send() { }
    addEventListener() { }
    removeEventListener() { }
  } as any;
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // some legacy browsers choke on 204
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));



// ============ ADMIN MIDDLEWARE ============
import { Request, Response, NextFunction } from 'express';

const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Token invalide' });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs' });

    (req as any).adminUserId = user.id;
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ============ ADMIN ROUTES ============

// Stats globales
app.get('/api/admin/stats', adminOnly, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: totalSellers },
      { count: totalProducts },
      { count: totalOrders },
      { data: ordersData },
      { count: pendingRequests },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('total'),
      supabase.from('seller_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const totalRevenue = (ordersData || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);

    res.json({
      totalUsers: totalUsers || 0,
      totalSellers: totalSellers || 0,
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalRevenue,
      pendingRequests: pendingRequests || 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lister tous les utilisateurs
app.get('/api/admin/users', adminOnly, async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    let query = supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false });

    if (role && role !== 'all') query = query.eq('role', role as string);
    if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Fetch block status for each user
    const usersWithBlockStatus = await Promise.all(
      (data || []).map(async (u: any) => {
        try {
          const { data: authData } = await supabase.auth.admin.getUserById(u.id);
          return { ...u, is_blocked: !!authData?.user?.banned_until };
        } catch {
          return { ...u, is_blocked: false };
        }
      })
    );

    res.json({ users: usersWithBlockStatus, total: count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Créer un utilisateur
app.post('/api/admin/users', adminOnly, async (req, res) => {
  try {
    const { email, password, full_name, role = 'client' } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, mot de passe et nom complet requis' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Mettre à jour le rôle si différent de 'client'
    if (role !== 'client' && data.user) {
      await supabase.from('profiles').update({ role }).eq('id', data.user.id);
    }

    res.status(201).json({ user: data.user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Changer le rôle d'un utilisateur
app.patch('/api/admin/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['client', 'seller', 'admin'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Rôle invalide' });

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bloquer / Débloquer un utilisateur
app.post('/api/admin/users/:id/block', adminOnly, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { blocked } = req.body;
    
    // Pour bloquer, on utilise un ban très long (100 ans)
    const ban_duration = blocked ? '876000h' : 'none';
    
    const { data, error } = await supabase.auth.admin.updateUserById(id, {
      ban_duration,
    });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, is_blocked: blocked });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/admin/users/:id', adminOnly, async (req, res) => {
  try {
    const id = req.params.id as string;
    
    // Supprimer l'utilisateur via l'API Admin (cela supprimera en cascade le profile si la BDD est configurée ainsi, 
    // sinon il faut aussi le supprimer de 'profiles')
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(id);
    
    if (deleteAuthError) return res.status(400).json({ error: deleteAuthError.message });
    
    // On s'assure qu'il est supprimé de profiles aussi (fallback si pas de cascade)
    await supabase.from('profiles').delete().eq('id', id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- CATEGORIES ----
app.get('/api/admin/categories', adminOnly, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description');

    if (error) return res.status(500).json({ error: error.message });

    // Compter les produits par catégorie
    const categoriesWithCount = await Promise.all(
      (categories || []).map(async (cat: any) => {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', cat.id);
        return { ...cat, product_count: count || 0 };
      })
    );

    res.json(categoriesWithCount);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', adminOnly, async (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'ID et nom requis' });

    const { data, error } = await supabase
      .from('categories')
      .insert({ id, name, description: description || null, image: '' })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data, error } = await supabase
      .from('categories')
      .update({ name, description })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return res.status(409).json({ error: `Impossible de supprimer : ${count} produit(s) utilisent cette catégorie` });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- SELLER REQUESTS ----
app.get('/api/admin/seller-requests', adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('seller_requests')
      .select('*, user:profiles!user_id(id, full_name, email, avatar_url, created_at)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status as string);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/seller-requests/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, user_id } = req.body;
    const adminUserId = (req as any).adminUserId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const { error: updateError } = await supabase
      .from('seller_requests')
      .update({ status })
      .eq('id', id);

    if (updateError) {
      console.error("Error updating seller request:", updateError);
      throw updateError;
    }

    if (status === 'approved' && user_id) {
      await supabase.from('profiles').update({ role: 'seller' }).eq('id', user_id);
      await supabase.from('notifications').insert({
        user_id,
        type: 'system',
        title: 'Demande vendeur approuvée',
        message: 'Félicitations ! Votre demande pour devenir vendeur a été approuvée.',
        link: '/dashboard',
      });
    } else if (status === 'rejected' && user_id) {
      await supabase.from('notifications').insert({
        user_id,
        type: 'system',
        title: 'Demande vendeur refusée',
        message: 'Votre demande pour devenir vendeur a été refusée.',
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ADMIN PRODUCTS (global view) ----
app.get('/api/admin/products', adminOnly, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    let query = supabase
      .from('products')
      .select('*, seller:profiles!seller_id(id, full_name), category:categories(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category_id', category as string);
    if (search) query = query.ilike('name', `%${search}%`);

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ products: data || [], total: count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ADMIN ORDERS (global view) ----
app.get('/api/admin/orders', adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = supabase
      .from('orders')
      .select('*, buyer:profiles!buyer_id(id, full_name, email), seller:profiles!seller_id(id, full_name), items:order_items(*, product:products(id, name, images))', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status as string);

    const from = (Number(page) - 1) * Number(limit);
    query = query.range(from, from + Number(limit) - 1);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json({ orders: data || [], total: count || 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`DUGU SUGU API Server running on port ${PORT}`);
  console.log(`Supabase URL: ${supabaseUrl ? 'Configured' : 'NOT CONFIGURED'}`);
});
