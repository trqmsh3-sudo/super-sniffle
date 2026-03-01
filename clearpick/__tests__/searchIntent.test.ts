// =============================================================================
// ClearPick.ai — Search Intent Unit Tests
// 25+ edge cases covering garbage, brands, products, categories, and ambiguous
// =============================================================================

import { detectSearchIntent, type SearchIntent, type IntentType } from '../lib/searchIntent';

// ── Test Helpers ─────────────────────────────────────────────────────────────

function expectType(query: string, expectedType: IntentType, label?: string) {
  const result = detectSearchIntent(query);
  const pass = result.type === expectedType;
  const icon = pass ? '✅' : '❌';
  const tag = label ?? query;
  console.log(
    `${icon} [${expectedType.toUpperCase().padEnd(9)}] "${tag}" → got: ${result.type} (conf: ${result.confidence})`,
  );
  if (!pass) {
    console.log(`   EXPECTED: ${expectedType}, GOT: ${result.type}`);
    failCount++;
  }
  totalCount++;
  return result;
}

let totalCount = 0;
let failCount = 0;

// ── Tests ────────────────────────────────────────────────────────────────────

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(' ClearPick.ai — Search Intent Detection Tests');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

// ── 1. Garbage Detection (should be rejected) ───────────────────────────────

console.log('── Garbage Detection ──────────────────────');

expectType('', 'garbage', 'empty string');
expectType('a', 'garbage', 'single char');
expectType('xx', 'garbage', 'two consonants');
expectType('asdfgh', 'garbage', 'keyboard mash');
expectType('qwrtyp', 'garbage', 'no vowels keyboard');
expectType('zzz', 'garbage', 'repeated char');
expectType('kkkkkk', 'garbage', 'repeated consonant');
expectType('bdfghjklmnp', 'garbage', 'all consonants long');
expectType('xyzxyz', 'garbage', 'consonant pattern');
expectType('!!!', 'garbage', 'only special chars');

// ── 2. Brand Detection ──────────────────────────────────────────────────────

console.log('');
console.log('── Brand Detection ────────────────────────');

expectType('Apple', 'brand', 'Apple exact');
expectType('apple', 'brand', 'apple lowercase');
expectType('SAMSUNG', 'brand', 'SAMSUNG uppercase');
expectType('sony', 'brand', 'sony');
expectType('Nike', 'brand', 'Nike');
expectType('Skoda', 'brand', 'Skoda');
expectType('BMW', 'brand', 'BMW');
expectType('Mercedes', 'brand', 'Mercedes');
expectType('Adidas', 'brand', 'Adidas');
expectType('Tesla', 'brand', 'Tesla');

// Brand misspellings
console.log('');
console.log('── Brand Misspellings ─────────────────────');

expectType('appl', 'brand', 'appl → Apple');
expectType('samung', 'brand', 'samung → Samsung');
expectType('toyata', 'brand', 'toyata → Toyota');

// ── 3. Product Detection ────────────────────────────────────────────────────

console.log('');
console.log('── Product Detection ──────────────────────');

expectType('iPhone 15', 'product', 'iPhone 15');
expectType('Galaxy S24', 'product', 'Galaxy S24');
expectType('MacBook Pro', 'product', 'MacBook Pro');
expectType('PlayStation 5', 'product', 'PlayStation 5');
expectType('Xbox Series X', 'product', 'Xbox series (ambiguous/product)');

// ── 4. Category Detection ───────────────────────────────────────────────────

console.log('');
console.log('── Category Detection ─────────────────────');

expectType('laptops', 'category', 'laptops');
expectType('headphones', 'category', 'headphones');
expectType('running shoes', 'category', 'running shoes');
expectType('cameras', 'category', 'cameras');
expectType('tablets', 'category', 'tablets');

// ── 5. Ambiguous Queries ────────────────────────────────────────────────────

console.log('');
console.log('── Ambiguous / Edge Cases ─────────────────');

const ambiguousResult = detectSearchIntent('best gaming laptop');
console.log(
  `${ambiguousResult.type !== 'garbage' ? '✅' : '❌'} [NOT-GARBAGE] "best gaming laptop" → got: ${ambiguousResult.type}`,
);
totalCount++;
if (ambiguousResult.type === 'garbage') failCount++;

const nikeShoes = detectSearchIntent('nike shoes');
console.log(
  `${nikeShoes.type !== 'garbage' ? '✅' : '❌'} [NOT-GARBAGE] "nike shoes" → got: ${nikeShoes.type}`,
);
totalCount++;
if (nikeShoes.type === 'garbage') failCount++;

// ── 6. Route Verification ───────────────────────────────────────────────────

console.log('');
console.log('── Route Verification ─────────────────────');

const appleIntent = detectSearchIntent('Apple');
const routePass = appleIntent.suggestedRoute === '/brand/[slug]' && appleIntent.slug === 'apple';
console.log(
  `${routePass ? '✅' : '❌'} Apple → route: ${appleIntent.suggestedRoute}, slug: ${appleIntent.slug}`,
);
totalCount++;
if (!routePass) failCount++;

const laptopsIntent = detectSearchIntent('laptops');
const catRoutePass =
  laptopsIntent.suggestedRoute === '/category/[slug]' && laptopsIntent.slug === 'laptops';
console.log(
  `${catRoutePass ? '✅' : '❌'} laptops → route: ${laptopsIntent.suggestedRoute}, slug: ${laptopsIntent.slug}`,
);
totalCount++;
if (!catRoutePass) failCount++;

const garbageIntent = detectSearchIntent('asdfgh');
const garbageRoutePass = garbageIntent.suggestedRoute === null;
console.log(
  `${garbageRoutePass ? '✅' : '❌'} asdfgh → route: ${garbageIntent.suggestedRoute} (expected null)`,
);
totalCount++;
if (!garbageRoutePass) failCount++;

// ── 7. Performance ──────────────────────────────────────────────────────────

console.log('');
console.log('── Performance ────────────────────────────');

const perfQueries = [
  'apple', 'iPhone 15 Pro Max', 'asdfghjkl', 'laptops', 'best wireless headphones',
  'Samsung Galaxy S24 Ultra', 'Nike', 'zzz', 'Mercedes-Benz', 'running shoes',
];

const start = performance.now();
for (let i = 0; i < 1000; i++) {
  for (const q of perfQueries) {
    detectSearchIntent(q);
  }
}
const elapsed = performance.now() - start;
const perCall = elapsed / 10000;

console.log(`⏱  10,000 calls in ${elapsed.toFixed(1)} ms (${perCall.toFixed(3)} ms/call)`);
const perfPass = perCall < 5;
console.log(`${perfPass ? '✅' : '❌'} Performance target: < 5 ms/call → ${perCall.toFixed(3)} ms/call`);
totalCount++;
if (!perfPass) failCount++;

// ── Summary ──────────────────────────────────────────────────────────────────

console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log(` Results: ${totalCount - failCount}/${totalCount} passed${failCount > 0 ? ` (${failCount} FAILED)` : ' — ALL PASSED'}`);
console.log('═══════════════════════════════════════════════════════════════');
console.log('');

process.exit(failCount > 0 ? 1 : 0);
