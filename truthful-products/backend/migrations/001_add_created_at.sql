-- Migration: Add created_at column to dossiers table
-- Run this on Render PostgreSQL console

-- Add created_at column if it doesn't exist
ALTER TABLE dossiers 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Update existing rows to have a created_at value
UPDATE dossiers 
SET created_at = last_updated 
WHERE created_at IS NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'dossiers';
