import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.SERVER_PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ ADMIN MIDDLEWARE ============
import { Request, Response, NextFunction } from 'express';

const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token manquant' });

    (req as any).adminUserId = 'admin';
    next();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ============ ADMIN ROUTES ============

// Stats globales
app.get('/api/admin/stats', adminOnly, async (req, res) => {
  try {
    res.json({
      totalUsers: 0,
      totalSellers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingRequests: 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lister tous les utilisateurs
app.get('/api/admin/users', adminOnly, async (req, res) => {
  try {
    res.json({ users: [], total: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Créer un utilisateur
app.post('/api/admin/users', adminOnly, async (req, res) => {
  try {
    const { email, full_name } = req.body;
    if (!email || !full_name) {
      return res.status(400).json({ error: 'Email et nom complet requis' });
    }
    res.status(201).json({ user: { id: Date.now().toString(), email, full_name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Changer le rôle d'un utilisateur
app.patch('/api/admin/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    res.json({ id, role });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Bloquer / Débloquer un utilisateur
app.post('/api/admin/users/:id/block', adminOnly, async (req, res) => {
  try {
    const { blocked } = req.body;
    res.json({ success: true, is_blocked: !!blocked });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Supprimer un utilisateur
app.delete('/api/admin/users/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- CATEGORIES ----
app.get('/api/admin/categories', adminOnly, async (req, res) => {
  try {
    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/categories', adminOnly, async (req, res) => {
  try {
    const { id, name, description } = req.body;
    if (!id || !name) return res.status(400).json({ error: 'ID et nom requis' });
    res.status(201).json({ id, name, description });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    res.json({ id, name, description });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/categories/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- SELLER REQUESTS ----
app.get('/api/admin/seller-requests', adminOnly, async (req, res) => {
  try {
    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/seller-requests/:id', adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ADMIN PRODUCTS (global view) ----
app.get('/api/admin/products', adminOnly, async (req, res) => {
  try {
    res.json({ products: [], total: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/products/:id', adminOnly, async (req, res) => {
  try {
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- ADMIN ORDERS (global view) ----
app.get('/api/admin/orders', adminOnly, async (req, res) => {
  try {
    res.json({ orders: [], total: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---- EMAILS (TRANSACTIONAL) ----
import { 
  sendOrderConfirmationEmail, 
  sendSellerStatusEmail, 
  sendSellerRequestAcknowledgmentEmail, 
  sendNewSellerRequestAlertEmail,
  sendNewOrderToSellerEmail,
  sendOrderStatusEmail
} from './email';

// Route pour l'envoi d'un email de confirmation de commande
app.post('/api/email/order-confirmation', async (req, res) => {
  try {
    const { email, customerName, orderId, totalAmount } = req.body;

    if (!email || !customerName || !orderId || !totalAmount) {
      return res.status(400).json({ error: 'Données manquantes (email, customerName, orderId, totalAmount)' });
    }

    const result = await sendOrderConfirmationEmail(email, customerName, orderId, totalAmount);

    if (!result.success) {
      return res.status(500).json({ error: "Erreur lors de l'envoi de l'email", details: result.error });
    }

    res.json({ success: true, message: 'Email envoyé avec succès', data: result.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour notifier le client d'un changement de statut
app.post('/api/email/order-status-update', async (req, res) => {
  try {
    const { buyerEmail, buyerName, sellerName, orderId, newStatus } = req.body;

    if (!buyerEmail || !buyerName || !sellerName || !orderId || !newStatus) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const result = await sendOrderStatusEmail(buyerEmail, buyerName, sellerName, orderId, newStatus);

    if (!result.success) {
      return res.status(500).json({ error: "Erreur lors de l'envoi de l'email de statut", details: result.error });
    }

    res.json({ success: true, message: 'Email statut envoyé avec succès', data: result.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour notifier le vendeur d'une nouvelle commande
app.post('/api/email/new-order-seller', async (req, res) => {
  try {
    const { sellerEmail, sellerName, customerName, orderId, totalAmount } = req.body;

    if (!sellerEmail || !sellerName || !customerName || !orderId || totalAmount === undefined) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    const result = await sendNewOrderToSellerEmail(sellerEmail, sellerName, customerName, orderId, totalAmount);

    if (!result.success) {
      return res.status(500).json({ error: "Erreur lors de l'envoi de l'email au vendeur", details: result.error });
    }

    res.json({ success: true, message: 'Email vendeur envoyé avec succès', data: result.data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Route pour notifier la création d'une demande vendeur (client + admin)
app.post('/api/email/seller-request-submitted', async (req, res) => {
  try {
    const { email, customerName } = req.body;

    if (!email || !customerName) {
      return res.status(400).json({ error: 'Données manquantes (email, customerName)' });
    }

    await sendSellerRequestAcknowledgmentEmail(email, customerName);
    await sendNewSellerRequestAlertEmail(customerName, email);

    res.json({ success: true, message: 'Emails envoyés avec succès' });
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
});
