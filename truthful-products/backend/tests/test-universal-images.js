/**
 * Test Universal Image Service
 * 
 * Usage: node tests/test-universal-images.js [productName]
 */

require('dotenv').config({ path: '../.env' });
const universalImageService = require('../services/universalImageService');

async function testUniversalImages(productName = 'iPhone 15') {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Universal Image Service Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Product: ${productName}\n`);
  
  const startTime = Date.now();
  
  try {
    // Test getMultipleImages
    console.log('📝 Testing getMultipleImages (up to 5 images)...\n');
    
    const images = await universalImageService.getMultipleImages(productName, 5);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 Results:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Found ${images.length} images in ${duration} seconds\n`);
    
    if (images.length === 0) {
      console.log('❌ No images found!');
      console.log('\n💡 Possible reasons:');
      console.log('   1. No API keys configured in .env');
      console.log('   2. API rate limits exceeded');
      console.log('   3. Product name too generic');
      console.log('\n📝 See API_KEYS_SETUP.md for instructions');
      return;
    }
    
    // Display images by source
    const bySource = {};
    images.forEach(img => {
      if (!bySource[img.source]) bySource[img.source] = [];
      bySource[img.source].push(img);
    });
    
    console.log('📂 Images by Source:\n');
    Object.entries(bySource).forEach(([source, imgs]) => {
      console.log(`   ${source.toUpperCase()}: ${imgs.length} image(s)`);
      imgs.forEach((img, idx) => {
        console.log(`      ${idx + 1}. ${img.url}`);
        if (img.type) console.log(`         Type: ${img.type}`);
        if (img.isPrimary) console.log(`         ⭐ Primary image`);
      });
      console.log('');
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Test Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('🎯 API Keys Status:');
    console.log(`   Unsplash: ${process.env.UNSPLASH_ACCESS_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Pexels: ${process.env.PEXELS_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log(`   Bing: ${process.env.BING_SEARCH_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
    console.log('');
    
    if (!process.env.UNSPLASH_ACCESS_KEY && !process.env.PEXELS_API_KEY && !process.env.BING_SEARCH_API_KEY) {
      console.log('⚠️  No image API keys configured!');
      console.log('📝 See API_KEYS_SETUP.md for free API key instructions');
    }
    
    return {
      success: true,
      images,
      duration
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
const productName = process.argv[2] || 'iPhone 15';
testUniversalImages(productName);
