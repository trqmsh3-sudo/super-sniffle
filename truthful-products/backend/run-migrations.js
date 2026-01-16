#!/usr/bin/env node

/**
 * Auto-migration script
 * Runs on server startup to ensure DB schema is up-to-date
 */

require('./loadEnv');
const db = require('./config/database');

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Migration 1: Add created_at to dossiers
    console.log('  📝 Migration 1: Adding created_at column to dossiers...');
    
    await db.query(`
      ALTER TABLE dossiers 
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    `);
    
    await db.query(`
      UPDATE dossiers 
      SET created_at = last_updated 
      WHERE created_at IS NULL;
    `);
    
    console.log('  ✅ Migration 1: Complete');

    // Migration 2: Add image_url + images to products
    console.log('  📝 Migration 2: Adding image_url + images columns to products...');

    await db.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    await db.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_products_images ON products USING GIN (images);
    `);

    await db.query(`
      UPDATE products
      SET images = jsonb_build_array(
        jsonb_build_object(
          'url', image_url,
          'type', 'primary',
          'source', 'migrated'
        )
      )
      WHERE image_url IS NOT NULL AND images = '[]'::jsonb;
    `);

    console.log('  ✅ Migration 2: Complete');
    
    console.log('✅ All migrations complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
