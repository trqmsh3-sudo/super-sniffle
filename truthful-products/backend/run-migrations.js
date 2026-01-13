#!/usr/bin/env node

/**
 * Auto-migration script
 * Runs on server startup to ensure DB schema is up-to-date
 */

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
    
    console.log('✅ All migrations complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
