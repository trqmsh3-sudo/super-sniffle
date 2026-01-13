-- Migration: Add support for multiple product images
-- Date: 2026-01-13

-- Add images array column (JSONB for flexibility)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url to images array
UPDATE products 
SET images = jsonb_build_array(
  jsonb_build_object(
    'url', image_url,
    'type', 'primary',
    'source', 'migrated'
  )
)
WHERE image_url IS NOT NULL AND images = '[]'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);

-- Comment
COMMENT ON COLUMN products.images IS 'Array of product images in JSONB format: [{url, type, source}]';
