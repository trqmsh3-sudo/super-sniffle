require('./loadEnv');
const SmartAIRouter = require('./services/aiRouter');

/**
 * בדיקת Smart AI Router
 * מדגים איך המערכת מחליטה אוטומטית בין Gemini ו-Claude
 */

async function testSmartRouter() {
  console.log('\n🧪 Testing Smart AI Router\n');
  console.log('═'.repeat(70));
  
  const router = new SmartAIRouter();
  
  // ============================================================================
  // Test 1: משימה פשוטה → Gemini (חינם)
  // ============================================================================
  
  console.log('\n📝 Test 1: Product Identification (should use Gemini - FREE)');
  console.log('-'.repeat(70));
  
  try {
    const result1 = await router.route('identify_product', {
      query: 'iphone 15 pro max 256gb'
    });
    
    console.log('\nResult:');
    console.log(JSON.stringify(result1, null, 2));
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
  }
  
  // ============================================================================
  // Test 2: סינון ספאם → Gemini (חינם)
  // ============================================================================
  
  console.log('\n\n📝 Test 2: Spam Detection (should use Gemini - FREE)');
  console.log('-'.repeat(70));
  
  try {
    const result2 = await router.route('filter_spam', {
      text: 'AMAZING PRODUCT!!! BUY NOW!!! CLICK HERE FOR DISCOUNT!!!'
    });
    
    console.log('\nResult:');
    console.log(JSON.stringify(result2, null, 2));
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // ============================================================================
  // Test 3: סיכום תיק קיים → Gemini (חינם)
  // ============================================================================
  
  console.log('\n\n📝 Test 3: Summarize Existing Dossier (should use Gemini - FREE)');
  console.log('-'.repeat(70));
  
  try {
    const result3 = await router.route('summarize_existing', {
      product_name: 'Sony WH-1000XM5',
      overall_score: 87,
      pros: ['Excellent noise cancellation', 'Superior sound quality', 'Comfortable'],
      cons: ['Expensive', 'Touch controls can be finicky'],
      summary: 'Industry-leading headphones with exceptional audio quality'
    });
    
    console.log('\nResult:');
    console.log(JSON.stringify(result3, null, 2));
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
  
  // ============================================================================
  // Test 4: בניית תיק חדש → Claude (בתשלום, web search!)
  // ============================================================================
  
  console.log('\n\n📝 Test 4: Build New Dossier (should use Claude - PAID, WEB SEARCH)');
  console.log('-'.repeat(70));
  
  if (!process.env.CLAUDE_API_KEY) {
    console.log('⚠️  Skipping - No Claude API key configured');
    console.log('   Add CLAUDE_API_KEY to .env to test this feature');
  } else {
    try {
      console.log('⚠️  This will use Claude API (costs ~$0.02)');
      console.log('   Searching the web for product reviews...\n');
      
      const result4 = await router.route('build_dossier', {
        productName: 'Sony WH-1000XM5 Headphones'
      });
      
      console.log('\nResult:');
      console.log(JSON.stringify(result4, null, 2));
    } catch (error) {
      console.error('❌ Test 4 failed:', error.message);
    }
  }
  
  // ============================================================================
  // סטטיסטיקות
  // ============================================================================
  
  console.log('\n\n📊 AI Usage Statistics');
  console.log('═'.repeat(70));
  
  const stats = router.getStats();
  
  console.log('\nCalls:');
  console.log(`  Total: ${stats.calls.total}`);
  console.log(`  Gemini (free): ${stats.calls.gemini} (${stats.calls.gemini_percentage})`);
  console.log(`  Claude (paid): ${stats.calls.claude}`);
  
  console.log('\nCosts:');
  console.log(`  Gemini: ${stats.costs.gemini}`);
  console.log(`  Claude: ${stats.costs.claude}`);
  console.log(`  Total: ${stats.costs.total}`);
  
  console.log('\nSavings:');
  console.log(`  Without routing: ${stats.costs.potential_without_routing}`);
  console.log(`  With routing: ${stats.costs.total}`);
  console.log(`  Saved: ${stats.costs.actual_savings} (${stats.costs.actual_savings_ils})`);
  
  console.log('\n' + stats.message);
  
  console.log('\n═'.repeat(70));
  console.log('✅ All tests completed!\n');
  
  process.exit(0);
}

// הרץ בדיקות
testSmartRouter().catch(error => {
  console.error('\n❌ Test suite failed:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure GEMINI_API_KEY is set in .env');
  console.error('   2. For full testing, add CLAUDE_API_KEY to .env');
  console.error('   3. Check internet connection for API calls\n');
  process.exit(1);
});
