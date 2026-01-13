/**
 * Test Script for Reddit Scraper + Data Aggregator
 * 
 * Usage: node tests/test-reddit-scraper.js [productName]
 */

const redditScraper = require('../services/redditScraper');
const dataAggregator = require('../services/dataAggregator');

async function testRedditScraper(productName = 'iPhone 15') {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🧪 Reddit Scraper + Data Aggregator Test');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Product: ${productName}\n`);
  
  try {
    // 1. Test Reddit Scraper
    console.log('📝 Phase 1: Testing Reddit Scraper...\n');
    
    const startTime = Date.now();
    const posts = await redditScraper.smartSearch(productName, 'smartphones');
    const scrapeDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n⏱️  Scraping took ${scrapeDuration} seconds`);
    console.log(`📊 Results: ${posts.length} posts found\n`);
    
    if (posts.length > 0) {
      console.log('🔝 Top 3 posts by relevance:\n');
      posts.slice(0, 3).forEach((post, idx) => {
        console.log(`${idx + 1}. [Score: ${post.relevanceScore}] ${post.title}`);
        console.log(`   Subreddit: r/${post.subreddit} | Upvotes: ${post.score} | Comments: ${post.numComments}`);
        console.log(`   URL: ${post.url}`);
        console.log(`   Preview: ${post.content.substring(0, 150)}...`);
        console.log('');
      });
    }
    
    // 2. Test Data Aggregator
    console.log('\n📝 Phase 2: Testing Data Aggregator...\n');
    
    const aggregateStartTime = Date.now();
    const analysis = await dataAggregator.aggregate(posts, productName);
    const aggregateDuration = ((Date.now() - aggregateStartTime) / 1000).toFixed(1);
    
    console.log(`\n⏱️  Aggregation took ${aggregateDuration} seconds`);
    console.log(`\n═══════════════════════════════════════════════════════════`);
    console.log('📊 Analysis Results:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Summary
    console.log(`📝 Summary:\n${analysis.summary}\n`);
    
    // Sentiment
    console.log(`😊 Sentiment Analysis:`);
    console.log(`   Overall: ${analysis.sentiment.overall.toFixed(2)}`);
    console.log(`   Positive: ${analysis.sentiment.positive} reviews (${analysis.sentiment.percentPositive}%)`);
    console.log(`   Neutral: ${analysis.sentiment.neutral} reviews`);
    console.log(`   Negative: ${analysis.sentiment.negative} reviews (${analysis.sentiment.percentNegative}%)`);
    console.log(`   Confidence: ${analysis.confidence}/100\n`);
    
    // Top Patterns
    if (analysis.patterns.length > 0) {
      console.log(`🔍 Top Patterns (repeating phrases):`);
      analysis.patterns.slice(0, 5).forEach((p, idx) => {
        console.log(`   ${idx + 1}. "${p.pattern}" - appears ${p.frequency} times (${p.percentage}%)`);
      });
      console.log('');
    }
    
    // Pros
    if (analysis.pros.length > 0) {
      console.log(`✅ Pros (${analysis.pros.length} found):`);
      analysis.pros.slice(0, 5).forEach((pro, idx) => {
        console.log(`   ${idx + 1}. ${pro}`);
      });
      console.log('');
    }
    
    // Cons
    if (analysis.cons.length > 0) {
      console.log(`❌ Cons (${analysis.cons.length} found):`);
      analysis.cons.slice(0, 5).forEach((con, idx) => {
        console.log(`   ${idx + 1}. ${con}`);
      });
      console.log('');
    }
    
    // Common Issues
    if (analysis.commonIssues.length > 0) {
      console.log(`🔴 Common Issues (${analysis.commonIssues.length} found):`);
      analysis.commonIssues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`);
      });
      console.log('');
    }
    
    // Sources
    console.log(`📍 Data Sources:`);
    console.log(`   Reddit: ${analysis.sources.reddit} reviews`);
    console.log(`   YouTube: ${analysis.sources.youtube} reviews`);
    console.log(`   Amazon: ${analysis.sources.amazon} reviews`);
    console.log('');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Test Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Performance summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`⏱️  Total execution time: ${totalTime} seconds`);
    console.log(`   - Reddit scraping: ${scrapeDuration}s`);
    console.log(`   - Data aggregation: ${aggregateDuration}s`);
    console.log('');
    
    return {
      success: true,
      posts: posts.length,
      analysis
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
testRedditScraper(productName);
