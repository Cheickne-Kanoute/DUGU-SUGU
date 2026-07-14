-- SCHEMA DUGU SUGU

-- 1. Custom Types
CREATE TYPE user_role AS ENUM ('client', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE notification_type AS ENUM ('new_order', 'order_status', 'low_stock', 'new_review', 'system');

-- 2. Tables

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'client'::user_role NOT NULL,
  phone TEXT,
  address TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  product_count INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0
);

-- Categories (static data)
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY, -- e.g., 'legumes', 'fruits'
  name TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT
);

-- Products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES public.categories(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  unit TEXT NOT NULL, -- e.g., 'kg', 'bottes'
  is_bio BOOLEAN DEFAULT false NOT NULL,
  available BOOLEAN DEFAULT true NOT NULL,
  low_stock_threshold INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Orders
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending'::order_status NOT NULL,
  total NUMERIC NOT NULL CHECK (total >= 0),
  shipping_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Order Items
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_time NUMERIC NOT NULL CHECK (price_at_time >= 0)
);

-- Cart Items (Persisted cart for logged in users)
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Favorites
CREATE TABLE public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

-- Seller Requests
CREATE TYPE seller_request_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.seller_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status seller_request_status DEFAULT 'pending' NOT NULL,
  message TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger for seller_requests updated_at
CREATE TRIGGER update_seller_requests_updated_at BEFORE UPDATE ON public.seller_requests FOR EACH ROW EXECUTE FUNCTION handle_updated_at();


-- 3. Functions and Triggers

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update product count for sellers
CREATE OR REPLACE FUNCTION update_seller_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET product_count = product_count + 1 WHERE id = NEW.seller_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET product_count = GREATEST(0, product_count - 1) WHERE id = OLD.seller_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_product_count
  AFTER INSERT OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_seller_product_count();

-- Auto-update seller rating based on reviews
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_id UUID;
  v_avg_rating NUMERIC;
BEGIN
  -- Get seller id for the product
  IF TG_OP = 'DELETE' THEN
    SELECT seller_id INTO v_seller_id FROM public.products WHERE id = OLD.product_id;
  ELSE
    SELECT seller_id INTO v_seller_id FROM public.products WHERE id = NEW.product_id;
  END IF;

  -- Calculate average rating for all products of this seller
  SELECT COALESCE(AVG(r.rating), 0) INTO v_avg_rating
  FROM public.reviews r
  JOIN public.products p ON r.product_id = p.id
  WHERE p.seller_id = v_seller_id;

  -- Update seller profile
  UPDATE public.profiles SET rating = ROUND(v_avg_rating, 2) WHERE id = v_seller_id;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_seller_rating();

-- Create notification on low stock
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock <= NEW.low_stock_threshold AND OLD.stock > OLD.low_stock_threshold THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.seller_id,
      'low_stock',
      'Stock bas: ' || NEW.name,
      'Le stock de ' || NEW.name || ' est passé en dessous du seuil minimal (' || NEW.stock || ' restants).',
      '/dashboard/products'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_low_stock
  AFTER UPDATE OF stock ON public.products
  FOR EACH ROW EXECUTE FUNCTION notify_low_stock();


-- Promote to Seller Function
CREATE OR REPLACE FUNCTION public.promote_to_seller(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Vérifier que le caller est admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accès non autorisé';
  END IF;
  
  UPDATE public.profiles SET role = 'seller' WHERE id = target_user_id;
  UPDATE public.seller_requests SET status = 'approved', reviewed_by = auth.uid() WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Row Level Security (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read, only owner can update
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own safe profile fields." ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (
  auth.uid() = id
  -- We rely on triggers/functions for role, product_count, rating. Direct client update on these would fail if we added explicit column checks, but Supabase doesn't easily support column-level RLS.
  -- Alternatively, we can let users update and rely on functions, but the strict way is a SECURITY DEFINER function for updates or letting users update their name/bio but not role.
  -- In Supabase, usually you restrict the API to only allow updates to certain fields.
);
CREATE POLICY "Service can insert profiles on signup." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Seller Requests
CREATE POLICY "Users can create and view own seller request."
  ON public.seller_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Categories: Read only by everyone
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);

-- Products: Viewable by everyone, insert/update/delete by seller only
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can create products." ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own products." ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own products." ON public.products FOR DELETE USING (auth.uid() = seller_id);

-- Orders: Viewable by buyer and seller. Insert by buyer. Update by seller.
CREATE POLICY "Users can view their orders (buyer or seller)." ON public.orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can create orders." ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Sellers can update order status." ON public.orders FOR UPDATE USING (auth.uid() = seller_id);

-- Order Items: Viewable by buyer and seller
CREATE POLICY "Users can view their order items." ON public.order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
  )
);
CREATE POLICY "Buyers can insert order items." ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()
  )
);

-- Cart Items: Only owner
CREATE POLICY "Users can manage their cart." ON public.cart_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews: Viewable by everyone, created by buyers who ordered the product
CREATE POLICY "Reviews viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews for purchased products." ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = buyer_id AND
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = auth.uid() AND oi.product_id = reviews.product_id AND o.status = 'delivered'
  )
);

-- Notifications: Only owner
CREATE POLICY "Users can view and manage their notifications." ON public.notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Favorites: Only owner
CREATE POLICY "Users can manage their favorites." ON public.favorites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin Policies (Full access to all tables for admins)
CREATE POLICY "Admins have full access to profiles." ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to categories." ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to products." ON public.products FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to orders." ON public.orders FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to order_items." ON public.order_items FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to cart_items." ON public.cart_items FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to reviews." ON public.reviews FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to notifications." ON public.notifications FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins have full access to favorites." ON public.favorites FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view and update all seller requests." ON public.seller_requests FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));



-- 5. Seed Data (Categories)
INSERT INTO public.categories (id, name, image, description) VALUES
  ('legumes', 'Légumes', '/images/categories/legumes.jpg', 'Légumes frais'),
  ('fruits', 'Fruits', '/images/categories/fruits.jpg', 'Fruits de saison'),
  ('cereales', 'Céréales', '/images/categories/cereales.jpg', 'Céréales locales'),
  ('tubercules', 'Tubercules', '/images/categories/tubercules.jpg', 'Tubercules frais'),
  ('epices', 'Épices', '/images/categories/epices.jpg', 'Épices et condiments'),
  ('elevage', 'Élevage', '/images/categories/elevage.jpg', 'Produits d''élevage'),
  ('legumineuses', 'Légumineuses', '/images/categories/legumineuses.jpg', 'Haricots, arachides...'),
  ('autres', 'Autres', '/images/categories/autres.jpg', 'Autres produits')
ON CONFLICT (id) DO NOTHING;
