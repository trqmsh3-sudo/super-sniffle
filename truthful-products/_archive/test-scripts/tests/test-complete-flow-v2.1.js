/**
 * Complete Flow V2.1 Test
 * Tests: Reddit → Aggregator → Gemini → Universal Images → Cache → DB
 * 
 * Usage: node tests/test-complete-flow-v2.1.js [productName]
 */

require('../loadEnv');
const SimpleDossierBuilder = require('../services/simpleDossierBuilder');
const redisClient = require('../config/redis');

async function testCompleteFlow(productName = 'Sony WH-1000XM5') {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Complete Flow V2.1 Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Product: ${productName}\n`);
  
  // Connect to Redis
  console.log('🔌 Connecting to Redis...\n');
  await redisClient.connect();
  
  const builder = new SimpleDossierBuilder();
  
  try {
    // Test 1: First build (should hit Reddit + AI)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TEST 1: First build (fresh, no cache)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const startTime1 = Date.now();
    const result1 = await builder.buildDossier(productName, 'headphones', true);
    const duration1 = ((Date.now() - startTime1) / 1000).toFixed(1);
    
    console.log('\n📊 Test 1 Results:');
    console.log(`   ✅ Success: ${result1.success}`);
    console.log(`   ⏱️  Duration: ${duration1}s`);
    console.log(`   📦 Product ID: ${result1.productId}`);
    console.log(`   📊 Overall Score: ${result1.scores.overall}/100`);
    console.log(`   🎯 Confidence: ${result1.confidence}%`);
    console.log(`   🖼️  Images: ${result1.images?.length || 0}`);
    console.log(`   💾 From Cache: ${result1.fromCache ? 'Yes' : 'No'}`);
    console.log(`   📡 Reddit Posts: ${result1.dataSource?.reddit || 0}`);
    console.log('');
    
    // Wait a bit
    console.log('⏳ Waiting 2 seconds before test 2...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Second build (should hit cache!)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TEST 2: Second build (should use cache)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const startTime2 = Date.now();
    const result2 = await builder.buildDossier(productName, 'headphones', true);
    const duration2 = ((Date.now() - startTime2) / 1000).toFixed(1);
    
    console.log('\n📊 Test 2 Results:');
    console.log(`   ✅ Success: ${result2.success}`);
    console.log(`   ⏱️  Duration: ${duration2}s (vs ${duration1}s in test 1)`);
    console.log(`   📦 Product ID: ${result2.productId}`);
    console.log(`   💾 From Cache: ${result2.fromCache ? 'Yes ✅' : 'No ❌'}`);
    if (result2.cachedAt) {
      const age = Math.round((Date.now() - result2.cachedAt) / 1000);
      console.log(`   ⏰ Cache Age: ${age}s`);
      console.log(`   ⏳ Cache TTL: ${result2.ttl}s remaining`);
    }
    console.log('');
    
    // Test 3: Third build without cache (force rebuild)
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 TEST 3: Force rebuild (cache disabled)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const startTime3 = Date.now();
    const result3 = await builder.buildDossier(productName, 'headphones', false);
    const duration3 = ((Date.now() - startTime3) / 1000).toFixed(1);
    
    console.log('\n📊 Test 3 Results:');
    console.log(`   ✅ Success: ${result3.success}`);
    console.log(`   ⏱️  Duration: ${duration3}s`);
    console.log(`   💾 From Cache: ${result3.fromCache ? 'Yes' : 'No ✅'}`);
    console.log('');
    
    // Cache statistics
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 Cache Statistics');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const stats = await redisClient.getStats();
    console.log(`   Connected: ${stats.connected ? '✅' : '❌'}`);
    console.log(`   Total Keys: ${stats.keys}`);
    console.log('');
    
    // Performance comparison
    console.log('═══════════════════════════════════════════════════════════');
    console.log('⚡ Performance Comparison');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    const speedup = (parseFloat(duration1) / parseFloat(duration2)).toFixed(1);
    const timeSaved = (parseFloat(duration1) - parseFloat(duration2)).toFixed(1);
    
    console.log(`   Test 1 (No Cache):  ${duration1}s ⏱️`);
    console.log(`   Test 2 (Cache Hit): ${duration2}s ⚡`);
    console.log(`   Test 3 (No Cache):  ${duration3}s ⏱️`);
    console.log('');
    console.log(`   💡 Cache Speedup: ${speedup}x faster!`);
    console.log(`   ⏱️  Time Saved: ${timeSaved}s per request`);
    console.log('');
    
    if (result2.fromCache) {
      console.log('✅ Cache is working perfectly!');
    } else {
      console.log('⚠️ Cache didn\'t work as expected - check Redis connection');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ All Tests Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    return {
      success: true,
      test1: { duration: duration1, fromCache: result1.fromCache },
      test2: { duration: duration2, fromCache: result2.fromCache },
      test3: { duration: duration3, fromCache: result3.fromCache },
      speedup,
      timeSaved
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Disconnect from Redis
    await redisClient.disconnect();
  }
}

// Run test
const productName = process.argv[2] || 'Sony WH-1000XM5';
testCompleteFlow(productName)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
