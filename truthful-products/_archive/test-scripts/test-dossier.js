require('./loadEnv');
const DossierBuilder = require('./services/simpleDossierBuilder');

async function test() {
  console.log('\n🧪 Testing Dossier Builder\n');
  console.log('═'.repeat(60));

  try {
    const builder = new DossierBuilder();
    
    console.log('\nBuilding dossier for: "Sony WH-1000XM5"\n');
    
    const result = await builder.buildDossier('Sony WH-1000XM5', 'headphones');
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ DOSSIER BUILT SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('═'.repeat(60));
    
    // Now retrieve it
    console.log('\n📥 Retrieving dossier from database...\n');
    const dossier = await builder.getDossier(result.productId);
    
    console.log('═'.repeat(60));
    console.log('📊 FULL DOSSIER:');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(dossier, null, 2));
    console.log('═'.repeat(60));
    
    console.log('\n🎉 All tests passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Run test-db.js first to verify database connection');
    console.error('   2. Run test-collector.js to verify Gemini AI works');
    console.error('   3. Check that schema.sql was executed\n');
    console.error('\nFull error:', error.stack);
    process.exit(1);
  }
}

test();
