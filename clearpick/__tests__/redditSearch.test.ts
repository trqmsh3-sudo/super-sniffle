// =============================================================================
// ClearPick.ai — Reddit Search & Fetch Unit Tests
// Tests the scraping and parsing of Reddit threads & comments
// =============================================================================

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { searchReddit } from '../lib/redditSearch';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' ClearPick.ai — Reddit Search & Scrape Tests');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = true;

  // Test: Integrated Search & Scrape
  try {
    console.log('🧪 Test: Integrated Reddit Search & Scrape...');
    const result = await searchReddit('Sony WH-1000XM5');

    console.log(`✅ Success: Search processed.`);
    console.log(`   Query: "${result.query}"`);
    console.log(`   Low Data Flag: ${result.lowData}`);
    console.log(`   Parsed Feedback Items Count: ${result.commentCount}`);
    console.log(`   Combined Text Length: ${result.allCommentsText.length} characters`);
  } catch (err) {
    console.error('❌ Failed: Error in integrated search:', err);
    passed = false;
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (passed) {
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY');
  } else {
    console.log('❌ SOME TESTS FAILED');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  process.exit(passed ? 0 : 1);
}

runTests();
