/**
 * Rebuild all products with images
 * This will rebuild dossiers for all existing products using Gemini
 */

require('../loadEnv');
const db = require('../config/database');
const SimpleDossierBuilder = require('../services/simpleDossierBuilder');

async function rebuildAllProducts() {
  console.log('🔄 Rebuilding all products with images...\n');
  
  try {
    // Get all products
    const products = await db.query('SELECT id, name, category FROM products ORDER BY id');
    
    if (products.rows.length === 0) {
      console.log('   ✅ No products found in database');
      console.log('   💡 Products will be created automatically when you search for them\n');
      process.exit(0);
    }
    
    console.log(`   Found ${products.rows.length} products to rebuild\n`);
    
    const builder = new SimpleDossierBuilder();
    let successCount = 0;
    let errorCount = 0;
    
    // Rebuild each product
    for (const product of products.rows) {
      try {
        console.log(`   📦 Rebuilding: ${product.name} (ID: ${product.id})...`);
        
        // Build dossier (this will also fetch and save the image)
        await builder.buildDossier(product.name, product.category || 'general');
        
        console.log(`   ✅ Success: ${product.name}\n`);
        successCount++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`   ❌ Error rebuilding ${product.name}: ${error.message}\n`);
        errorCount++;
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Rebuild complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Total: ${products.rows.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error rebuilding products:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  rebuildAllProducts();
}

module.exports = rebuildAllProducts;
