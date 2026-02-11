-- Migration: Add headphones table
-- Description: Stores headphones recommendations data (optional - for future caching)
-- Date: 2026-01-17

-- Create headphones table (optional - not required for MVP)
-- This table can be used for caching popular recommendations later
CREATE TABLE IF NOT EXISTS headphones (
  id SERIAL PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  price_range TEXT,
  price_min INTEGER,
  price_max INTEGER,
  features JSONB DEFAULT '[]'::JSONB,
  use_cases JSONB DEFAULT '[]'::JSONB,
  overall_score INTEGER,
  quality_score INTEGER,
  value_score INTEGER,
  pros TEXT[],
  cons TEXT[],
  affiliate_links JSONB DEFAULT '{}'::JSONB,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_headphones_brand ON headphones(brand);
CREATE INDEX IF NOT EXISTS idx_headphones_price_range ON headphones(price_min, price_max);
CREATE INDEX IF NOT EXISTS idx_headphones_score ON headphones(overall_score DESC);

-- Add comment
COMMENT ON TABLE headphones IS 'Headphones recommendations data (optional - for caching)';
