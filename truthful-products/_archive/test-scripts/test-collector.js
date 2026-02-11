require('./loadEnv');
const DataCollector = require('./services/dataCollector');

async function test() {
  console.log('\n🧪 Testing Data Collector with Gemini AI\n');
  console.log('═'.repeat(60));

  try {
    const collector = new DataCollector();
    
    console.log('\nTest product: "iPhone 15 Pro"\n');
    
    const data = await collector.collectProductData('iPhone 15 Pro');
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 RESULTS:');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(data, null, 2));
    console.log('═'.repeat(60));
    
    console.log('\n✅ Data collector test passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that GEMINI_API_KEY is set in .env');
    console.error('   2. Verify the API key is valid');
    console.error('   3. Check internet connection\n');
    process.exit(1);
  }
}

test();
