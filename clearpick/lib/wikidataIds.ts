// =============================================================================
// ClearPick.ai — Wikidata Entity IDs for Brand Product Lookups
// Maps brand slug → Wikidata QID for the manufacturer entity
// Used by wikiProductData.ts to query products via SPARQL
// =============================================================================

export interface WikidataBrandEntry {
  /** Wikidata entity ID (e.g., "Q312" for Apple) */
  qid: string;
  /** Wikipedia article title for enrichment fallback search */
  wikiSearchPrefix: string;
  /** Additional product line prefixes that count as "this brand" in title matching.
   *  e.g., Apple owns "iPhone", "iPad", "MacBook" — titles starting with these are Apple products. */
  productPrefixes?: string[];
}

/**
 * Brand slug → Wikidata manufacturer entity.
 *
 * QIDs were validated against query.wikidata.org with:
 *   SELECT ?p ?pLabel WHERE { ?p wdt:P176 wd:QID . SERVICE ... } LIMIT 10
 *
 * Brands with `qid: ''` have no usable manufacturer entity on Wikidata;
 * they use Wikipedia search fallback exclusively.
 */
export const WIKIDATA_BRANDS: Record<string, WikidataBrandEntry> = {
  // ── Tech / Electronics ─────────────────────────────────────────────────
  apple:        { qid: 'Q312',    wikiSearchPrefix: 'Apple iPhone iPad MacBook product', productPrefixes: ['iphone', 'ipad', 'macbook', 'mac ', 'imac', 'airpods', 'ipod', 'apple watch', 'apple tv', 'apple vision'] },
  samsung:      { qid: '',        wikiSearchPrefix: 'Samsung Galaxy', productPrefixes: ['galaxy'] },
  sony:         { qid: 'Q41187',  wikiSearchPrefix: 'Sony' },
  lg:           { qid: '',        wikiSearchPrefix: 'LG' },
  huawei:       { qid: 'Q160120', wikiSearchPrefix: 'Huawei' },
  xiaomi:       { qid: 'Q1535624', wikiSearchPrefix: 'Xiaomi phone Mi smartphone' },
  oneplus:      { qid: 'Q18720055', wikiSearchPrefix: 'OnePlus smartphone phone' },
  google:       { qid: 'Q95',     wikiSearchPrefix: 'Google Pixel' },
  microsoft:    { qid: 'Q2283',   wikiSearchPrefix: 'Microsoft Surface' },
  dell:         { qid: 'Q1599',    wikiSearchPrefix: 'Dell laptop XPS Inspiron' },
  hp:           { qid: 'Q510',     wikiSearchPrefix: 'HP laptop Spectre Envy' },
  lenovo:       { qid: 'Q44896',   wikiSearchPrefix: 'Lenovo ThinkPad IdeaPad' },
  asus:         { qid: 'Q643084',  wikiSearchPrefix: 'Asus laptop ROG' },
  nvidia:       { qid: '',        wikiSearchPrefix: 'Nvidia GeForce' },
  amd:          { qid: 'Q182477',  wikiSearchPrefix: 'AMD Ryzen Radeon processor' },
  intel:        { qid: 'Q248',     wikiSearchPrefix: 'Intel Core processor chip' },
  canon:        { qid: 'Q192975',  wikiSearchPrefix: 'Canon camera EOS mirrorless' },
  nikon:        { qid: 'Q151117',  wikiSearchPrefix: 'Nikon camera Z series DSLR' },
  bose:         { qid: '',         wikiSearchPrefix: 'Bose headphones speaker QuietComfort' },
  jbl:          { qid: '',         wikiSearchPrefix: 'JBL speaker bluetooth headphones' },
  dyson:        { qid: '',        wikiSearchPrefix: 'Dyson' },
  gopro:        { qid: 'Q1100607', wikiSearchPrefix: 'GoPro camera action HERO' },

  // ── Gaming ─────────────────────────────────────────────────────────────
  nintendo:     { qid: 'Q8093',   wikiSearchPrefix: 'Nintendo' },
  playstation:  { qid: '',        wikiSearchPrefix: 'PlayStation' },
  xbox:         { qid: '',        wikiSearchPrefix: 'Xbox' },

  // ── Automotive ─────────────────────────────────────────────────────────
  bmw:          { qid: 'Q26678',  wikiSearchPrefix: 'BMW' },
  mercedes:     { qid: '',        wikiSearchPrefix: 'Mercedes-Benz' },
  audi:         { qid: 'Q23317',  wikiSearchPrefix: 'Audi car A4 A6 Q5 electric' },
  volkswagen:   { qid: 'Q246',    wikiSearchPrefix: 'Volkswagen Golf Passat Tiguan' },
  toyota:       { qid: 'Q53268',  wikiSearchPrefix: 'Toyota' },
  honda:        { qid: 'Q9584',   wikiSearchPrefix: 'Honda' },
  tesla:        { qid: 'Q478214', wikiSearchPrefix: 'Tesla' },
  skoda:        { qid: 'Q29637',  wikiSearchPrefix: 'Škoda Octavia Fabia Kodiaq' },
  ford:         { qid: 'Q44294',  wikiSearchPrefix: 'Ford car truck Mustang F-150' },
  hyundai:      { qid: 'Q81965',  wikiSearchPrefix: 'Hyundai car Ioniq Tucson Elantra' },
  kia:          { qid: 'Q35517',  wikiSearchPrefix: 'Kia car EV6 Sportage Telluride' },
  porsche:      { qid: 'Q40993',  wikiSearchPrefix: 'Porsche' },
  volvo:        { qid: 'Q215293', wikiSearchPrefix: 'Volvo car XC90 XC60 electric' },
  ferrari:      { qid: 'Q27586',  wikiSearchPrefix: 'Ferrari' },
  lamborghini:  { qid: '',        wikiSearchPrefix: 'Lamborghini' },

  // ── Sportswear / Fashion ───────────────────────────────────────────────
  nike:         { qid: 'Q483915', wikiSearchPrefix: 'Nike' },
  adidas:       { qid: 'Q3895',   wikiSearchPrefix: 'Adidas' },
  puma:         { qid: '',        wikiSearchPrefix: 'Puma' },
  'new-balance': { qid: '',       wikiSearchPrefix: 'New Balance' },

  // ── Luxury / Fashion ──────────────────────────────────────────────────
  zara:         { qid: '',        wikiSearchPrefix: 'Zara' },
  gucci:        { qid: '',        wikiSearchPrefix: 'Gucci' },
  'louis-vuitton': { qid: '',     wikiSearchPrefix: 'Louis Vuitton' },
  chanel:       { qid: '',        wikiSearchPrefix: 'Chanel' },
  hermes:       { qid: '',        wikiSearchPrefix: 'Hermès' },

  // ── Home / Appliances ──────────────────────────────────────────────────
  ikea:         { qid: '',        wikiSearchPrefix: 'IKEA' },
  bosch:        { qid: '',        wikiSearchPrefix: 'Bosch' },
  miele:        { qid: '',        wikiSearchPrefix: 'Miele' },
  panasonic:    { qid: 'Q44457',  wikiSearchPrefix: 'Panasonic TV camera appliance' },
  philips:      { qid: 'Q45178',  wikiSearchPrefix: 'Philips TV monitor healthcare' },

  // ── Digital / Services ─────────────────────────────────────────────────
  amazon:       { qid: '',        wikiSearchPrefix: 'Amazon' },
  netflix:      { qid: '',        wikiSearchPrefix: 'Netflix' },
  spotify:      { qid: '',        wikiSearchPrefix: 'Spotify' },
  // ── Additional Brands (Block 3) ────────────────────────────────────
  acer:         { qid: 'Q1137486', wikiSearchPrefix: 'Acer laptop notebook' },
  sennheiser:   { qid: 'Q491591',  wikiSearchPrefix: 'Sennheiser headphones audio' },
  chevrolet:    { qid: 'Q29552',   wikiSearchPrefix: 'Chevrolet car truck Corvette' },
  qualcomm:     { qid: 'Q183512',  wikiSearchPrefix: 'Qualcomm Snapdragon processor' },
  oppo:         { qid: 'Q1763534', wikiSearchPrefix: 'Oppo smartphone Find Reno' },
  fitbit:       { qid: 'Q5456843', wikiSearchPrefix: 'Fitbit smartwatch fitness tracker' },
  garmin:       { qid: 'Q789757',  wikiSearchPrefix: 'Garmin GPS watch navigation' },
  logitech:     { qid: 'Q300186',  wikiSearchPrefix: 'Logitech mouse keyboard webcam' },
  razer:        { qid: 'Q2527492', wikiSearchPrefix: 'Razer gaming laptop mouse keyboard' },};

/**
 * Look up Wikidata info for a brand slug.
 * Returns undefined for brands not in the map.
 */
export function getWikidataBrand(slug: string): WikidataBrandEntry | undefined {
  return WIKIDATA_BRANDS[slug];
}
