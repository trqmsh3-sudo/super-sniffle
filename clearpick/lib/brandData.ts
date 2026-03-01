// =============================================================================
// ClearPick.ai — Brand Data Layer
// Fetches rich brand + product data from API with registry fallback
// =============================================================================

import { BRAND_BY_SLUG } from './brandRegistry';
import { buildBrandData } from './brandBuilder';
import { API_BASE } from './config';

// ── Public Types ─────────────────────────────────────────────────────────────

export interface BrandProduct {
  id: string;
  name: string;
  image: string;
  year: number;
  price: string;
  rating: number;
  description: string;
  source: string;
  specs: string[];        // max 3 bullet points (legacy)
  priceRange?: string;
}

export interface BrandYearGroup {
  year: number;
  items: BrandProduct[];
}

export interface BrandData {
  brand: {
    name: string;
    slug: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    bio: string;
    founded: number;
    headquarters: string;
    category: string;
  };
  products: BrandYearGroup[];  // grouped by year, newest first, last 15 years
}

// ── Color Utilities ──────────────────────────────────────────────────────────

/** Parse hex to {r,g,b} */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/** Convert {r,g,b} back to hex */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Derive a secondary color from the primary:
 * - Dark primaries → lighten by 40%
 * - Light primaries → darken by 25%
 */
function deriveSecondaryColor(primary: string): string {
  const { r, g, b } = hexToRgb(primary);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance < 0.45) {
    // Lighten
    const factor = 1.4;
    return rgbToHex(r * factor + 60, g * factor + 60, b * factor + 60);
  } else {
    // Darken
    const factor = 0.65;
    return rgbToHex(r * factor, g * factor, b * factor);
  }
}

// ── Fallback Bios ────────────────────────────────────────────────────────────

const FALLBACK_BIOS: Record<string, { bio: string; founded: number; hq: string }> = {
  apple:        { bio: 'Apple designs and manufactures consumer electronics, software, and services. Known for the iPhone, Mac, iPad, and Apple Watch, the company has redefined personal technology since 1976.', founded: 1976, hq: 'Cupertino, CA, USA' },
  samsung:      { bio: 'Samsung Electronics is a global leader in smartphones, semiconductors, displays, and home appliances. The South Korean giant ships more phones worldwide than any other brand.', founded: 1938, hq: 'Suwon, South Korea' },
  sony:         { bio: 'Sony Corporation is a Japanese multinational known for PlayStation gaming consoles, cameras, audio equipment, and entertainment. A pioneer in consumer electronics since 1946.', founded: 1946, hq: 'Tokyo, Japan' },
  lg:           { bio: 'LG Electronics produces televisions, home appliances, and mobile devices. Renowned for their OLED display technology and innovative home solutions.', founded: 1958, hq: 'Seoul, South Korea' },
  huawei:       { bio: 'Huawei is a Chinese multinational technology company specializing in telecommunications equipment, smartphones, and networking infrastructure.', founded: 1987, hq: 'Shenzhen, China' },
  xiaomi:       { bio: 'Xiaomi designs and sells smartphones, smart home devices, and lifestyle products. Known for offering high-spec devices at competitive prices.', founded: 2010, hq: 'Beijing, China' },
  oneplus:      { bio: 'OnePlus creates flagship-grade smartphones with clean software and fast charging. The brand has cultivated a devoted community since its 2013 launch.', founded: 2013, hq: 'Shenzhen, China' },
  google:       { bio: 'Google builds Pixel smartphones, Nest smart-home devices, Chromecast, and the Android operating system used by billions of devices worldwide.', founded: 1998, hq: 'Mountain View, CA, USA' },
  microsoft:    { bio: 'Microsoft develops the Windows operating system, Surface devices, Xbox gaming consoles, and Azure cloud services. A defining force in personal computing.', founded: 1975, hq: 'Redmond, WA, USA' },
  dell:         { bio: 'Dell Technologies manufactures personal computers, servers, storage, and networking products. A major enterprise and consumer computing brand.', founded: 1984, hq: 'Round Rock, TX, USA' },
  hp:           { bio: 'HP Inc. produces personal computers, printers, and related supplies. One of the original Silicon Valley companies, continuously innovating since 1939.', founded: 1939, hq: 'Palo Alto, CA, USA' },
  lenovo:       { bio: 'Lenovo is the world\'s largest PC vendor, manufacturing ThinkPad laptops, desktops, tablets, and data center solutions from its dual headquarters.', founded: 1984, hq: 'Beijing, China & Morrisville, NC, USA' },
  asus:         { bio: 'ASUS creates laptops, motherboards, graphics cards, and gaming gear under the ROG brand. A Taiwanese company known for pushing performance boundaries.', founded: 1989, hq: 'Taipei, Taiwan' },
  nvidia:       { bio: 'NVIDIA pioneered the GPU and leads in graphics, AI computing, and autonomous vehicle platforms. Their GeForce and RTX cards power gaming worldwide.', founded: 1993, hq: 'Santa Clara, CA, USA' },
  amd:          { bio: 'AMD designs high-performance CPUs and GPUs for gaming, data centers, and embedded systems. The Ryzen and Radeon brands compete at the cutting edge.', founded: 1969, hq: 'Santa Clara, CA, USA' },
  intel:        { bio: 'Intel Corporation is the world\'s largest semiconductor chip manufacturer, producing processors that power most of the world\'s personal computers and servers.', founded: 1968, hq: 'Santa Clara, CA, USA' },
  canon:        { bio: 'Canon produces cameras, lenses, printers, and medical equipment. A Japanese giant that has shaped photography and imaging technology for decades.', founded: 1937, hq: 'Tokyo, Japan' },
  nikon:        { bio: 'Nikon designs cameras, lenses, and precision optics. From professional DSLRs to mirrorless systems, the brand is synonymous with imaging excellence.', founded: 1917, hq: 'Tokyo, Japan' },
  bose:         { bio: 'Bose Corporation engineers premium audio products including noise-cancelling headphones, speakers, and home theater systems with signature sound quality.', founded: 1964, hq: 'Framingham, MA, USA' },
  jbl:          { bio: 'JBL produces speakers, headphones, and professional audio equipment. Owned by Harman, the brand is a favorite for portable Bluetooth speakers worldwide.', founded: 1946, hq: 'Los Angeles, CA, USA' },
  dyson:        { bio: 'Dyson engineers vacuum cleaners, air purifiers, hair dryers, and fans using patented cyclone and bladeless technology. Design-driven British innovation.', founded: 1991, hq: 'Malmesbury, UK' },
  gopro:        { bio: 'GoPro makes rugged action cameras and accessories for extreme sports and adventure. The HERO series is the world\'s best-selling action camera line.', founded: 2002, hq: 'San Mateo, CA, USA' },
  nintendo:     { bio: 'Nintendo develops gaming consoles and beloved franchises like Mario, Zelda, and Pokemon. The Switch became one of the best-selling consoles in history.', founded: 1889, hq: 'Kyoto, Japan' },
  playstation:  { bio: 'PlayStation is Sony\'s gaming brand, producing consoles, controllers, and exclusive game titles. The PS5 continues a legacy that began in 1994.', founded: 1994, hq: 'San Mateo, CA, USA' },
  xbox:         { bio: 'Xbox is Microsoft\'s gaming platform encompassing consoles, Game Pass subscription, and exclusive titles. The Series X delivers high-performance gaming.', founded: 2001, hq: 'Redmond, WA, USA' },
  panasonic:    { bio: 'Panasonic manufactures consumer electronics, automotive systems, and industrial solutions. A Japanese conglomerate with over a century of innovation.', founded: 1918, hq: 'Osaka, Japan' },
  philips:      { bio: 'Philips focuses on health technology, personal care, and lighting solutions. The Dutch company has evolved from electronics into healthcare innovation.', founded: 1891, hq: 'Amsterdam, Netherlands' },
  bmw:          { bio: 'BMW produces luxury vehicles, motorcycles, and electric cars. The Bavarian automaker is renowned for driving performance and premium engineering.', founded: 1916, hq: 'Munich, Germany' },
  mercedes:     { bio: 'Mercedes-Benz crafts luxury automobiles, trucks, and vans. The oldest automotive brand in the world, synonymous with engineering excellence and prestige.', founded: 1926, hq: 'Stuttgart, Germany' },
  audi:         { bio: 'Audi manufactures premium vehicles with Quattro all-wheel drive and progressive design. Part of the Volkswagen Group, competing in the luxury segment.', founded: 1909, hq: 'Ingolstadt, Germany' },
  volkswagen:   { bio: 'Volkswagen is one of the world\'s largest automakers, producing cars from the iconic Golf to the electric ID series. German engineering at scale.', founded: 1937, hq: 'Wolfsburg, Germany' },
  toyota:       { bio: 'Toyota is the world\'s largest automaker by volume, known for reliability, hybrid technology with Prius, and the luxury Lexus brand.', founded: 1937, hq: 'Toyota City, Japan' },
  honda:        { bio: 'Honda manufactures automobiles, motorcycles, power equipment, and engines. The Civic and Accord are among the best-selling cars globally.', founded: 1948, hq: 'Tokyo, Japan' },
  tesla:        { bio: 'Tesla designs electric vehicles, battery energy storage, and solar products. Led the EV revolution with Model S, Model 3, and Cybertruck.', founded: 2003, hq: 'Austin, TX, USA' },
  skoda:        { bio: 'Skoda Auto produces practical, value-oriented vehicles within the Volkswagen Group. The Czech brand offers solid engineering at accessible prices.', founded: 1895, hq: 'Mlada Boleslav, Czech Republic' },
  ford:         { bio: 'Ford Motor Company is an American automaker known for the F-Series trucks, Mustang, and Bronco. A pioneer of mass automobile production.', founded: 1903, hq: 'Dearborn, MI, USA' },
  hyundai:      { bio: 'Hyundai Motor produces sedans, SUVs, and electric vehicles. The South Korean automaker has rapidly risen in quality, design, and global market share.', founded: 1967, hq: 'Seoul, South Korea' },
  kia:          { bio: 'Kia designs affordable and stylish vehicles spanning sedans, SUVs, and EVs. The EV6 marked a bold leap into electric mobility.', founded: 1944, hq: 'Seoul, South Korea' },
  porsche:      { bio: 'Porsche engineers luxury sports cars including the iconic 911, Cayenne, and the electric Taycan. German performance luxury at its finest.', founded: 1931, hq: 'Stuttgart, Germany' },
  volvo:        { bio: 'Volvo Cars is synonymous with safety innovation. The Swedish brand produces premium SUVs and sedans, now transitioning to a fully electric lineup.', founded: 1927, hq: 'Gothenburg, Sweden' },
  ferrari:      { bio: 'Ferrari crafts high-performance luxury sports cars and competes in Formula 1. The prancing horse emblem is one of the most recognized symbols in the world.', founded: 1939, hq: 'Maranello, Italy' },
  lamborghini:  { bio: 'Lamborghini manufactures extreme luxury supercars known for dramatic design and V10/V12 power. An Italian icon of automotive excess and performance.', founded: 1963, hq: 'Sant\'Agata, Italy' },
  nike:         { bio: 'Nike designs athletic footwear, apparel, and equipment. The swoosh is the world\'s most recognizable sports brand, worn by elite athletes globally.', founded: 1964, hq: 'Beaverton, OR, USA' },
  adidas:       { bio: 'Adidas produces sports shoes, clothing, and accessories. The three-stripe brand competes across running, football, lifestyle, and streetwear.', founded: 1949, hq: 'Herzogenaurach, Germany' },
  puma:         { bio: 'Puma designs athletic and casual footwear, apparel, and accessories. A German brand with strong roots in football and motorsport.', founded: 1948, hq: 'Herzogenaurach, Germany' },
  'new-balance':{ bio: 'New Balance manufactures athletic footwear with a focus on fit and comfort. Known for Made-in-USA craftsmanship and a loyal running community.', founded: 1906, hq: 'Boston, MA, USA' },
  zara:         { bio: 'Zara is a fast-fashion retailer offering trendy clothing, accessories, and home goods. Part of the Inditex group with a rapid design-to-store cycle.', founded: 1975, hq: 'Arteixo, Spain' },
  gucci:        { bio: 'Gucci is an Italian luxury fashion house known for bold design, leather goods, and ready-to-wear collections. A symbol of opulent style since 1921.', founded: 1921, hq: 'Florence, Italy' },
  'louis-vuitton': { bio: 'Louis Vuitton crafts luxury trunks, handbags, and fashion. The monogram LV is the world\'s most valuable luxury brand.', founded: 1854, hq: 'Paris, France' },
  chanel:       { bio: 'Chanel creates haute couture, ready-to-wear, accessories, and fragrance. Founded by Coco Chanel, it remains the pinnacle of Parisian elegance.', founded: 1910, hq: 'Paris, France' },
  hermes:       { bio: 'Hermes produces luxury goods including the Birkin bag, silk scarves, and equestrian leather goods. French craftsmanship at its most exclusive.', founded: 1837, hq: 'Paris, France' },
  ikea:         { bio: 'IKEA designs and sells affordable, flat-pack furniture and home accessories. The Swedish brand democratized modern interior design worldwide.', founded: 1943, hq: 'Delft, Netherlands' },
  bosch:        { bio: 'Bosch manufactures power tools, home appliances, automotive parts, and industrial technology. German engineering trusted by professionals globally.', founded: 1886, hq: 'Gerlingen, Germany' },
  miele:        { bio: 'Miele manufactures premium domestic appliances and commercial equipment. The German brand is synonymous with durability and engineering excellence.', founded: 1899, hq: 'Gutersloh, Germany' },
  amazon:       { bio: 'Amazon builds Kindle e-readers, Echo smart speakers, Fire tablets, Ring doorbells, and the expansive Alexa smart-home ecosystem.', founded: 1994, hq: 'Seattle, WA, USA' },
  netflix:      { bio: 'Netflix is the world\'s leading streaming entertainment service with over 200 million subscribers watching original and licensed content across devices.', founded: 1997, hq: 'Los Gatos, CA, USA' },
  spotify:      { bio: 'Spotify provides music and podcast streaming to hundreds of millions of users. The Swedish platform revolutionized how the world listens to music.', founded: 2006, hq: 'Stockholm, Sweden' },
  'coca-cola':  { bio: 'Coca-Cola is the world\'s largest beverage company, producing soft drinks, juices, and water brands sold in over 200 countries.', founded: 1886, hq: 'Atlanta, GA, USA' },
  starbucks:    { bio: 'Starbucks operates the largest chain of coffeehouses worldwide, known for specialty coffee drinks, food, and the third-place experience.', founded: 1971, hq: 'Seattle, WA, USA' },
  'red-bull':   { bio: 'Red Bull sells energy drinks and owns sports teams and media properties. The Austrian brand dominates the global energy drink market.', founded: 1987, hq: 'Fuschl am See, Austria' },
};

// ── Top 20 Brands for Static Generation ──────────────────────────────────────

// ── API Config ───────────────────────────────────────────────────────────────

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE = 15;

// ── Main Fetch Function ──────────────────────────────────────────────────────

/**
 * Fetch complete brand data with products grouped by year.
 *
 * Priority:
 *  1. External API (PRODUCT_API_URL)
 *  2. AI pipeline (Gemini + Brave + Playwright)
 *  3. Never returns empty — always shows something
 */
export async function fetchBrandData(slug: string): Promise<BrandData> {
  const registryEntry = BRAND_BY_SLUG.get(slug);

  // For completely unknown brands (not in registry), build a synthetic entry
  const brandName = registryEntry?.name ?? capitalizeName(slug.replace(/-/g, ' '));
  const brandCategory = registryEntry?.category ?? 'general';

  const primaryColor = BRAND_BY_SLUG.get(slug)?.primaryColor ?? '#333333';
  const secondaryColor = deriveSecondaryColor(primaryColor);

  // ── Try V12 backend API ─────────────────────────────────────────────────
  try {
    const [brandRes, productsRes] = await Promise.all([
      fetch(`${API_BASE}/api/brands/${slug}`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`${API_BASE}/api/search?q=${encodeURIComponent(brandName)}`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    if (brandRes.ok) {
      const apiData = await brandRes.json();
      const brand = apiData.brand ?? apiData;
      const apiProducts = productsRes.ok ? await productsRes.json() : null;

      let products = normalizeProducts(apiProducts?.products ?? apiProducts?.items ?? []);

      // If V12 returned few or no products, supplement with AI pipeline
      if (products.length < 5) {
        try {
          const aiData = await buildBrandData(slug);
          if (aiData.products.length > products.length) {
            products = aiData.products;
          }
        } catch {
          // AI pipeline failed — use whatever V12 returned
        }
      }

      return {
        brand: {
          name: capitalizeName(brand.name ?? brandName),
          slug,
          logo: brand.logo ?? buildLogoUrl(slug),
          primaryColor,
          secondaryColor,
          bio: brand.bio ?? brand.description ?? getFallbackBio(slug),
          founded: brand.founded ?? getFallbackFounded(slug),
          headquarters: brand.headquarters ?? getFallbackHQ(slug),
          category: brand.category ?? brandCategory,
        },
        products,
      };
    }
  } catch {
    // API unreachable — fall through to AI pipeline
  }

  // ── Fallback: AI-powered brand research pipeline ────────────────────
  return buildFallbackDataWithAI(slug, brandName, brandCategory, primaryColor, secondaryColor);
}

// ── Name Capitalization ──────────────────────────────────────────────────────

/** Capitalize first letter of each word in a brand name */
function capitalizeName(name: string): string {
  if (!name) return name;
  return name
    .split(/[\s-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(name.includes('-') ? '-' : ' ');
}

// ── Normalize API Products ───────────────────────────────────────────────────

interface RawProduct {
  id?: string;
  name?: string;
  image?: string;
  thumbnail?: string;
  specs?: string[] | string;
  features?: string[];
  price?: string;
  priceRange?: string;
  price_range?: string;
  year?: number;
  release_year?: number;
  released?: number;
}

function normalizeProducts(raw: RawProduct[]): BrandYearGroup[] {
  const minYear = CURRENT_YEAR - YEAR_RANGE;
  const byYear = new Map<number, BrandProduct[]>();

  for (const item of raw) {
    const year = item.year ?? item.release_year ?? item.released ?? CURRENT_YEAR;
    if (year < minYear) continue;

    const specs = Array.isArray(item.specs)
      ? item.specs.slice(0, 3)
      : item.features
        ? item.features.slice(0, 3)
        : typeof item.specs === 'string'
          ? [item.specs]
          : [];

    const product: BrandProduct = {
      id: String(item.id ?? item.name ?? Math.random().toString(36).slice(2)),
      name: String(item.name ?? 'Unknown Model'),
      image: item.image ?? item.thumbnail ?? '',
      year,
      price: item.priceRange ?? item.price_range ?? item.price ?? 'Unknown',
      rating: 0,
      description: '',
      source: '',
      specs,
      priceRange: item.priceRange ?? item.price_range ?? item.price,
    };

    const existing = byYear.get(year) ?? [];
    existing.push(product);
    byYear.set(year, existing);
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => b - a)
    .map(([year, items]) => ({ year, items }));
}

// ── Fallback Builder ─────────────────────────────────────────────────────────

function buildFallbackData(
  slug: string,
  brandName: string,
  brandCategory: string,
  primaryColor: string,
  secondaryColor: string,
): BrandData {
  return {
    brand: {
      name: capitalizeName(brandName),
      slug,
      logo: buildLogoUrl(slug),
      primaryColor,
      secondaryColor,
      bio: getFallbackBio(slug),
      founded: getFallbackFounded(slug),
      headquarters: getFallbackHQ(slug),
      category: brandCategory,
    },
    products: [],  // Will be filled by wiki fallback in fetchBrandData caller
  };
}

/**
 * Build fallback data and then enrich with AI-powered pipeline.
 * Called when V12 backend is unreachable.
 */
async function buildFallbackDataWithAI(
  slug: string,
  brandName: string,
  brandCategory: string,
  primaryColor: string,
  secondaryColor: string,
): Promise<BrandData> {
  const base = buildFallbackData(slug, brandName, brandCategory, primaryColor, secondaryColor);

  // Try AI pipeline for products
  try {
    const aiData = await buildBrandData(slug);
    base.products = aiData.products;

    // If AI pipeline returned better brand info, merge it
    if (aiData.brand.bio && aiData.brand.bio.length > base.brand.bio.length) {
      base.brand.bio = aiData.brand.bio;
    }
    if (aiData.brand.category && aiData.brand.category !== 'general') {
      base.brand.category = aiData.brand.category;
    }
  } catch (err) {
    console.error('[BrandData] AI pipeline failed:', err);
    // Products will be empty — graceful degradation
  }

  return base;
}

function buildLogoUrl(slug: string): string {
  // Use Clearbit or Logo.dev as a free logo source
  const cleanDomain = LOGO_DOMAINS[slug] ?? `${slug}.com`;
  return `https://logo.clearbit.com/${cleanDomain}`;
}

/** Map brand slugs to their actual domain for logo resolution */
const LOGO_DOMAINS: Record<string, string> = {
  apple: 'apple.com',
  samsung: 'samsung.com',
  sony: 'sony.com',
  lg: 'lg.com',
  huawei: 'huawei.com',
  xiaomi: 'mi.com',
  oneplus: 'oneplus.com',
  google: 'google.com',
  microsoft: 'microsoft.com',
  dell: 'dell.com',
  hp: 'hp.com',
  lenovo: 'lenovo.com',
  asus: 'asus.com',
  nvidia: 'nvidia.com',
  amd: 'amd.com',
  intel: 'intel.com',
  canon: 'canon.com',
  nikon: 'nikon.com',
  bose: 'bose.com',
  jbl: 'jbl.com',
  dyson: 'dyson.com',
  gopro: 'gopro.com',
  nintendo: 'nintendo.com',
  playstation: 'playstation.com',
  xbox: 'xbox.com',
  bmw: 'bmw.com',
  mercedes: 'mercedes-benz.com',
  audi: 'audi.com',
  volkswagen: 'vw.com',
  toyota: 'toyota.com',
  honda: 'honda.com',
  tesla: 'tesla.com',
  skoda: 'skoda-auto.com',
  ford: 'ford.com',
  hyundai: 'hyundai.com',
  kia: 'kia.com',
  porsche: 'porsche.com',
  volvo: 'volvocars.com',
  ferrari: 'ferrari.com',
  lamborghini: 'lamborghini.com',
  nike: 'nike.com',
  adidas: 'adidas.com',
  puma: 'puma.com',
  'new-balance': 'newbalance.com',
  'under-armour': 'underarmour.com',
  zara: 'zara.com',
  gucci: 'gucci.com',
  'louis-vuitton': 'louisvuitton.com',
  chanel: 'chanel.com',
  hermes: 'hermes.com',
  ikea: 'ikea.com',
  bosch: 'bosch.com',
  amazon: 'amazon.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  'coca-cola': 'coca-cola.com',
  starbucks: 'starbucks.com',
  'red-bull': 'redbull.com',
};

function getFallbackBio(slug: string): string {
  return FALLBACK_BIOS[slug]?.bio ?? 'A leading global brand delivering quality products and innovation.';
}

function getFallbackFounded(slug: string): number {
  return FALLBACK_BIOS[slug]?.founded ?? 1990;
}

function getFallbackHQ(slug: string): string {
  return FALLBACK_BIOS[slug]?.hq ?? 'Global';
}
