-- 1. Add new column 'images' as text array if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='products' AND column_name='images'
    ) THEN
        ALTER TABLE public.products ADD COLUMN images TEXT[] DEFAULT array[]::text[];
    END IF;
END
$$;

-- 2. Migrate existing 'image' data into 'images' array if 'image' column still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='products' AND column_name='image'
    ) THEN
        UPDATE public.products SET images = ARRAY[image] WHERE image IS NOT NULL AND image != '';
        -- 3. Remove old 'image' column
        ALTER TABLE public.products DROP COLUMN image;
    END IF;
END
$$;

-- 4. Create the 'product-images' storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up RLS for the storage bucket 'product-images'

DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
CREATE POLICY "Public Access to product-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'product-images' );

DROP POLICY IF EXISTS "Authenticated users can upload product-images" ON storage.objects;
CREATE POLICY "Authenticated users can upload product-images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update own product-images" ON storage.objects;
CREATE POLICY "Users can update own product-images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'product-images' 
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete own product-images" ON storage.objects;
CREATE POLICY "Users can delete own product-images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images' 
    AND auth.uid() = owner
);
