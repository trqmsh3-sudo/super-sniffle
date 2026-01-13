require('dotenv').config();
const db = require('../config/database');
const productImageService = require('../services/productImageService');

/**
 * Backfill Product Images Script
 * מוודא שכל המוצרים בדוסייה יש להם תמונות
 */

async function backfillImages() {
  console.log('\n🖼️  Starting product images backfill...\n');
  
  try {
    // Get all products without images
    const result = await db.query(`
      SELECT id, name, image_url, images 
      FROM products 
      WHERE image_url IS NULL OR images IS NULL OR images = '[]'::jsonb
      ORDER BY created_at DESC
    `);
    
    const products = result.rows;
    console.log(`📊 Found ${products.length} products needing images\n`);
    
    if (products.length === 0) {
      console.log('✅ All products already have images!');
      return;
    }
    
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`\n[${i + 1}/${products.length}] Processing: "${product.name}"`);
      
      try {
        // Get multiple images
        const images = await productImageService.getMultipleImages(product.name, 3);
        
        if (images.length === 0) {
          console.log(`   ⚠️  No images found`);
          failed++;
          continue;
        }
        
        // Primary image
        const imageUrl = images[0].url;
        
        // Update database
        await db.query(
          `UPDATE products 
           SET image_url = $1, images = $2, updated_at = NOW() 
           WHERE id = $3`,
          [imageUrl, JSON.stringify(images), product.id]
        );
        
        console.log(`   ✅ Updated with ${images.length} images`);
        console.log(`      Primary: ${imageUrl.substring(0, 60)}...`);
        updated++;
        
        // Rate limiting - wait 1 second between requests
        if (i < products.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Backfill Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total: ${products.length}`);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n❌ Backfill failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run the script
backfillImages();
