import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Auth from '@/pages/Auth';
import Sellers from '@/pages/Sellers';
import SellerProfile from '@/pages/SellerProfile';
import Unauthorized from '@/pages/Unauthorized';
import DashboardPage from '@/pages/Dashboard';
import ProfilePage from '@/pages/Profile';
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import SellerOrdersPage from '@/pages/dashboard/seller/SellerOrdersPage';
import SellerProductsPage from '@/pages/dashboard/seller/SellerProductsPage';
import BecomeSellerPage from '@/pages/dashboard/client/BecomeSellerPage';
import ClientOrdersPage from '@/pages/dashboard/client/ClientOrdersPage';
import ClientFavoritesPage from '@/pages/dashboard/client/ClientFavoritesPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Footer } from './components/Footer';

// Admin imports
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminSellerRequests from '@/pages/admin/AdminSellerRequests';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';

export default function App() {
  const location = useLocation();
  const isAuthPage = ['/auth', '/login', '/register', '/dashboard', '/profile', '/admin'].some(p => location.pathname.startsWith(p));

  return (
    <div className="relative flex min-h-screen flex-col font-body">
      {!isAuthPage && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/seller/:id" element={<SellerProfile />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole={['client', 'seller']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="become-seller" element={<BecomeSellerPage />} />
            <Route path="purchases" element={<ClientOrdersPage />} />
            <Route path="favorites" element={<ClientFavoritesPage />} />
            <Route
              path="orders"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="products"
              element={
                <ProtectedRoute requiredRole="seller">
                  <SellerProductsPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/profile"
            element={ 
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="seller-requests" element={<AdminSellerRequests />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="app-page flex items-center justify-center">
                <div className="surface-panel max-w-md px-8 py-10 text-center">
                  <h1 className="text-5xl font-medium text-primary">404</h1>
                  <p className="mt-3 text-muted-foreground">Page non trouvée</p>
                  <a href="/" className="brand-button mt-6">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
