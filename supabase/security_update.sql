-- 1. Create seller_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seller_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, status) -- Prevent multiple pending requests for the same user
);

-- Enable RLS on seller_requests
ALTER TABLE public.seller_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist so we can recreate them
DROP POLICY IF EXISTS "Users can view their own requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.seller_requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.seller_requests;

-- 2. Policies for seller_requests
CREATE POLICY "Users can view their own requests"
  ON public.seller_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests"
  ON public.seller_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON public.seller_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update requests"
  ON public.seller_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Secure RPC to promote user
CREATE OR REPLACE FUNCTION promote_to_seller(user_to_promote UUID, request_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update user role
  UPDATE public.profiles
  SET role = 'seller'
  WHERE id = user_to_promote;

  -- Update request status
  UPDATE public.seller_requests
  SET status = 'approved'
  WHERE id = request_id;
END;
$$;

-- 4. Update the handle_new_user trigger to always set role to 'client'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'client' -- Force le rôle à client
  );
  RETURN new;
END;
$$;
