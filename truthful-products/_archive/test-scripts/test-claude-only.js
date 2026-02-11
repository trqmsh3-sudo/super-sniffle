require('./loadEnv');
const SmartAIRouter = require('./services/aiRouter');

async function testClaudeWebSearch() {
  console.log('\n🔍 Testing Claude Web Search\n');
  console.log('═'.repeat(70));
  
  const router = new SmartAIRouter();
  
  console.log('\n🌐 Searching the web for: "iPhone 15 Pro reviews"\n');
  console.log('⏳ This will take 30-60 seconds...\n');
  
  try {
    const result = await router.route('build_dossier', {
      productName: 'iPhone 15 Pro'
    });
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ WEB SEARCH RESULTS:');
    console.log('═'.repeat(70));
    console.log(JSON.stringify(result, null, 2));
    console.log('═'.repeat(70));
    
    const stats = router.getStats();
    console.log('\n💰 Cost for this search: $0.02');
    console.log(`📊 Total stats: ${JSON.stringify(stats.calls, null, 2)}`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testClaudeWebSearch();
