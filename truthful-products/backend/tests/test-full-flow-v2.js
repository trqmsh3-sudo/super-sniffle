/**
 * Test Script for Full Flow V2.0
 * Reddit → Data Aggregator → Gemini Editor → DB
 * 
 * Usage: node tests/test-full-flow-v2.js [productName]
 */

require('dotenv').config({ path: '../.env' });
const SimpleDossierBuilder = require('../services/simpleDossierBuilder');

async function testFullFlowV2(productName = 'JBL Flip 6', category = 'speakers') {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Full Flow V2.0 Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Product: ${productName}`);
  console.log(`Category: ${category}\n`);
  
  const startTime = Date.now();
  
  try {
    const builder = new SimpleDossierBuilder();
    
    // Build dossier
    const result = await builder.buildDossier(productName, category);
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 Final Result:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Success: ${result.success}`);
    console.log(`📦 Product ID: ${result.productId}`);
    console.log(`📝 Product Name: ${result.productName}`);
    console.log('');
    
    console.log(`📊 Scores:`);
    console.log(`   Overall: ${result.scores.overall}/100`);
    console.log(`   Quality: ${result.scores.quality}/100`);
    console.log(`   Value: ${result.scores.value}/100`);
    console.log(`   Reliability: ${result.scores.reliability}/100`);
    console.log('');
    
    console.log(`📈 Metrics:`);
    console.log(`   Confidence: ${result.confidence}/100`);
    console.log(`   Reddit Posts: ${result.dataSource?.reddit || 0}`);
    console.log(`   Sentiment: ${result.dataSource?.sentiment?.percentPositive || 0}% positive`);
    console.log('');
    
    console.log(`🖼️  Images:`);
    console.log(`   Primary Image: ${result.imageUrl ? '✅' : '❌'}`);
    console.log('');
    
    console.log(`🎯 Quality Check:`);
    console.log(`   Quality Score: ${result.qualityCheck.qualityScore}/100`);
    console.log(`   Is Generic: ${result.qualityCheck.isGeneric ? '⚠️ YES' : '✅ NO'}`);
    if (result.qualityCheck.issues.length > 0) {
      console.log(`   Issues:`);
      result.qualityCheck.issues.forEach(issue => console.log(`     - ${issue}`));
    }
    console.log('');
    
    console.log(`📝 Summary (preview):`);
    console.log(`   ${result.summary.substring(0, 200)}${result.summary.length > 200 ? '...' : ''}`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Test Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log(`⏱️  Total execution time: ${totalTime} seconds`);
    console.log('');
    
    // Now fetch the full dossier to verify it was saved
    console.log('🔍 Fetching saved dossier from database...\n');
    
    const dossier = await builder.getDossier(result.productId);
    
    if (dossier) {
      console.log('✅ Dossier successfully saved and retrieved!');
      console.log(`   Product: ${dossier.product.name}`);
      console.log(`   Pros: ${dossier.analysis.pros.length}`);
      console.log(`   Cons: ${dossier.analysis.cons.length}`);
      console.log(`   Common Issues: ${dossier.analysis.common_failures.length}`);
      console.log(`   Total Reviews: ${dossier.meta.total_reviews}`);
      console.log(`   Confidence: ${dossier.meta.confidence}%`);
      console.log('');
    } else {
      console.log('❌ Failed to retrieve dossier from database!');
    }
    
    return {
      success: true,
      result,
      dossier
    };
    
  } catch (error) {
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    console.log(`\n⏱️  Failed after ${totalTime} seconds`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run test
const productName = process.argv[2] || 'JBL Flip 6';
const category = process.argv[3] || 'speakers';

testFullFlowV2(productName, category)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
