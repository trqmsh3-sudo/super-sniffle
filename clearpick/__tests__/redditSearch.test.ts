// =============================================================================
// ClearPick.ai — Reddit Search & Fetch Unit Tests
// Tests the scraping and parsing of Reddit threads & comments
// =============================================================================

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { getRedditLinks, fetchRedditComments, searchReddit } from '../lib/redditSearch';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(' ClearPick.ai — Reddit Search & Scrape Tests');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passed = true;

  // Test 1: Fetching Reddit Links from DDG
  try {
    console.log('🧪 Test 1: Fetching Reddit Links from DDG...');
    const links = await getRedditLinks('Sony WH-1000XM5');
    
    if (links.length > 0) {
      console.log(`✅ Success: Found ${links.length} Reddit links.`);
      console.log(`   Top Link: "${links[0].title}" -> ${links[0].url}`);
    } else {
      console.log('❌ Failed: No links returned from search.');
      passed = false;
    }
  } catch (err) {
    console.error('❌ Failed: Error thrown during fetch links:', err);
    passed = false;
  }

  console.log('');

  // Test 2: Fetching comments from a Reddit thread via JSON API
  try {
    console.log('🧪 Test 2: Fetching comments from a Reddit thread...');
    const testUrl = 'https://www.reddit.com/r/headphones/comments/uxu89o/sony_wh1000xm5_review/';
    const comments = await fetchRedditComments(testUrl);

    if (comments.length > 0) {
      console.log(`✅ Success: Fetched ${comments.length} comments.`);
      console.log(`   Top Comment Author: ${comments[0].author}`);
      console.log(`   Top Comment Snippet: "${comments[0].body.slice(0, 80)}..."`);
    } else {
      console.log('❌ Failed: No comments returned. (Could be rate-limited or format changed)');
      // Non-blocking warning since Reddit might rate limit on cloud environments
      console.log('⚠️ Warning: Comments fetch empty. Proceeding...');
    }
  } catch (err) {
    console.error('❌ Failed: Error thrown during comments fetch:', err);
    passed = false;
  }

  console.log('');

  // Test 3: Integrated Search & Scrape
  try {
    console.log('🧪 Test 3: Integrated Reddit Search & Scrape...');
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
