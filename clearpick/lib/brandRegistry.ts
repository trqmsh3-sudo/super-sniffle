// =============================================================================
// ClearPick.ai — Brand Registry
// Full list of 85+ global brands with slug, primary color, and category
// =============================================================================

export interface BrandEntry {
  name: string;
  slug: string;
  primaryColor: string;
  category: 'electronics' | 'cars' | 'fashion' | 'food' | 'sports' | 'tech' | 'luxury' | 'home';
  aliases?: string[];
}

export const BRAND_REGISTRY: BrandEntry[] = [
  // ── Electronics ───────────────────────────────────────────────────────────
  { name: 'Apple', slug: 'apple', primaryColor: '#555555', category: 'electronics', aliases: ['appl', 'aple'] },
  { name: 'Samsung', slug: 'samsung', primaryColor: '#1428A0', category: 'electronics', aliases: ['samung', 'samsng'] },
  { name: 'Sony', slug: 'sony', primaryColor: '#000000', category: 'electronics' },
  { name: 'LG', slug: 'lg', primaryColor: '#A50034', category: 'electronics' },
  { name: 'Huawei', slug: 'huawei', primaryColor: '#CF0A2C', category: 'electronics', aliases: ['hauwei', 'huwaei'] },
  { name: 'Xiaomi', slug: 'xiaomi', primaryColor: '#FF6900', category: 'electronics', aliases: ['xiomi', 'shaomi'] },
  { name: 'OnePlus', slug: 'oneplus', primaryColor: '#F5010C', category: 'electronics' },
  { name: 'Google', slug: 'google', primaryColor: '#4285F4', category: 'electronics' },
  { name: 'Microsoft', slug: 'microsoft', primaryColor: '#00A4EF', category: 'electronics', aliases: ['microsft'] },
  { name: 'Dell', slug: 'dell', primaryColor: '#007DB8', category: 'electronics' },
  { name: 'HP', slug: 'hp', primaryColor: '#0096D6', category: 'electronics', aliases: ['hewlett packard'] },
  { name: 'Lenovo', slug: 'lenovo', primaryColor: '#E2231A', category: 'electronics' },
  { name: 'Asus', slug: 'asus', primaryColor: '#00539B', category: 'electronics' },
  { name: 'Acer', slug: 'acer', primaryColor: '#83B81A', category: 'electronics' },
  { name: 'Intel', slug: 'intel', primaryColor: '#0071C5', category: 'electronics' },
  { name: 'AMD', slug: 'amd', primaryColor: '#ED1C24', category: 'electronics' },
  { name: 'Nvidia', slug: 'nvidia', primaryColor: '#76B900', category: 'electronics' },
  { name: 'Panasonic', slug: 'panasonic', primaryColor: '#0F58A0', category: 'electronics' },
  { name: 'Philips', slug: 'philips', primaryColor: '#0B5ED7', category: 'electronics' },
  { name: 'Bose', slug: 'bose', primaryColor: '#1A1A1A', category: 'electronics' },
  { name: 'JBL', slug: 'jbl', primaryColor: '#FF6600', category: 'electronics' },
  { name: 'Canon', slug: 'canon', primaryColor: '#CC0000', category: 'electronics' },
  { name: 'Nikon', slug: 'nikon', primaryColor: '#FFCC00', category: 'electronics' },
  { name: 'GoPro', slug: 'gopro', primaryColor: '#00A0D6', category: 'electronics' },
  { name: 'Dyson', slug: 'dyson', primaryColor: '#6A2382', category: 'electronics' },
  { name: 'Nintendo', slug: 'nintendo', primaryColor: '#E60012', category: 'electronics' },
  { name: 'PlayStation', slug: 'playstation', primaryColor: '#003791', category: 'electronics', aliases: ['ps5', 'ps4'] },
  { name: 'Xbox', slug: 'xbox', primaryColor: '#107C10', category: 'electronics' },

  // ── Cars ───────────────────────────────────────────────────────────────────
  { name: 'BMW', slug: 'bmw', primaryColor: '#0066B1', category: 'cars' },
  { name: 'Mercedes-Benz', slug: 'mercedes', primaryColor: '#242424', category: 'cars', aliases: ['mercedes benz', 'merc', 'benz'] },
  { name: 'Audi', slug: 'audi', primaryColor: '#BB0A30', category: 'cars' },
  { name: 'Volkswagen', slug: 'volkswagen', primaryColor: '#001E50', category: 'cars', aliases: ['vw'] },
  { name: 'Toyota', slug: 'toyota', primaryColor: '#EB0A1E', category: 'cars', aliases: ['toyata'] },
  { name: 'Honda', slug: 'honda', primaryColor: '#CC0000', category: 'cars' },
  { name: 'Tesla', slug: 'tesla', primaryColor: '#CC0000', category: 'cars' },
  { name: 'Skoda', slug: 'skoda', primaryColor: '#4BA82E', category: 'cars', aliases: ['škoda'] },
  { name: 'Ford', slug: 'ford', primaryColor: '#003399', category: 'cars' },
  { name: 'Chevrolet', slug: 'chevrolet', primaryColor: '#D1A01E', category: 'cars', aliases: ['chevy'] },
  { name: 'Hyundai', slug: 'hyundai', primaryColor: '#002C5F', category: 'cars', aliases: ['hundai', 'hyundia'] },
  { name: 'Kia', slug: 'kia', primaryColor: '#05141F', category: 'cars' },
  { name: 'Nissan', slug: 'nissan', primaryColor: '#C3002F', category: 'cars' },
  { name: 'Mazda', slug: 'mazda', primaryColor: '#910A2A', category: 'cars' },
  { name: 'Subaru', slug: 'subaru', primaryColor: '#013B7C', category: 'cars' },
  { name: 'Porsche', slug: 'porsche', primaryColor: '#B12B28', category: 'cars' },
  { name: 'Volvo', slug: 'volvo', primaryColor: '#003057', category: 'cars' },
  { name: 'Jaguar', slug: 'jaguar', primaryColor: '#9B8758', category: 'cars' },
  { name: 'Land Rover', slug: 'land-rover', primaryColor: '#005A2B', category: 'cars', aliases: ['landrover'] },
  { name: 'Ferrari', slug: 'ferrari', primaryColor: '#DC0000', category: 'luxury' },
  { name: 'Lamborghini', slug: 'lamborghini', primaryColor: '#DDB321', category: 'luxury', aliases: ['lambo'] },

  // ── Fashion ────────────────────────────────────────────────────────────────
  { name: 'Nike', slug: 'nike', primaryColor: '#111111', category: 'fashion' },
  { name: 'Adidas', slug: 'adidas', primaryColor: '#000000', category: 'fashion' },
  { name: 'Puma', slug: 'puma', primaryColor: '#E42313', category: 'fashion' },
  { name: 'Reebok', slug: 'reebok', primaryColor: '#CC1527', category: 'fashion' },
  { name: 'New Balance', slug: 'new-balance', primaryColor: '#CF0A2C', category: 'fashion', aliases: ['newbalance', 'nb'] },
  { name: 'Under Armour', slug: 'under-armour', primaryColor: '#1D1D1D', category: 'fashion', aliases: ['underarmour', 'ua'] },
  { name: 'Zara', slug: 'zara', primaryColor: '#000000', category: 'fashion' },
  { name: 'H&M', slug: 'hm', primaryColor: '#E50010', category: 'fashion', aliases: ['h and m', 'h&m'] },
  { name: 'Gucci', slug: 'gucci', primaryColor: '#000000', category: 'luxury' },
  { name: 'Louis Vuitton', slug: 'louis-vuitton', primaryColor: '#8B6914', category: 'luxury', aliases: ['lv', 'louisvuitton'] },
  { name: 'Chanel', slug: 'chanel', primaryColor: '#000000', category: 'luxury' },
  { name: 'Hermès', slug: 'hermes', primaryColor: '#F37021', category: 'luxury', aliases: ['hermes'] },
  { name: 'Prada', slug: 'prada', primaryColor: '#000000', category: 'luxury' },
  { name: 'Versace', slug: 'versace', primaryColor: '#FFCC00', category: 'luxury' },
  { name: 'Levi\'s', slug: 'levis', primaryColor: '#C41230', category: 'fashion', aliases: ['levis'] },
  { name: 'The North Face', slug: 'the-north-face', primaryColor: '#000000', category: 'fashion', aliases: ['northface', 'tnf'] },
  { name: 'Patagonia', slug: 'patagonia', primaryColor: '#1D3557', category: 'fashion' },

  // ── Food & Beverages ───────────────────────────────────────────────────────
  { name: 'Coca-Cola', slug: 'coca-cola', primaryColor: '#F40009', category: 'food', aliases: ['coke', 'cocacola'] },
  { name: 'Pepsi', slug: 'pepsi', primaryColor: '#004B93', category: 'food' },
  { name: 'Nestlé', slug: 'nestle', primaryColor: '#003781', category: 'food', aliases: ['nestle'] },
  { name: 'Red Bull', slug: 'red-bull', primaryColor: '#DB0032', category: 'food', aliases: ['redbull'] },
  { name: 'Starbucks', slug: 'starbucks', primaryColor: '#006241', category: 'food' },
  { name: 'McDonald\'s', slug: 'mcdonalds', primaryColor: '#FFC72C', category: 'food', aliases: ['mcdonalds', 'mcd'] },

  // ── Sports Equipment ───────────────────────────────────────────────────────
  { name: 'Wilson', slug: 'wilson', primaryColor: '#E31937', category: 'sports' },
  { name: 'Callaway', slug: 'callaway', primaryColor: '#003865', category: 'sports' },
  { name: 'Titleist', slug: 'titleist', primaryColor: '#1B3D2F', category: 'sports' },
  { name: 'Yonex', slug: 'yonex', primaryColor: '#003DA5', category: 'sports' },
  { name: 'Shimano', slug: 'shimano', primaryColor: '#003F87', category: 'sports' },

  // ── Home & Appliances ──────────────────────────────────────────────────────
  { name: 'IKEA', slug: 'ikea', primaryColor: '#0058A3', category: 'home' },
  { name: 'Bosch', slug: 'bosch', primaryColor: '#E20015', category: 'home' },
  { name: 'Whirlpool', slug: 'whirlpool', primaryColor: '#1A3E72', category: 'home' },
  { name: 'KitchenAid', slug: 'kitchenaid', primaryColor: '#B22222', category: 'home' },
  { name: 'Miele', slug: 'miele', primaryColor: '#BE1622', category: 'home' },
  { name: 'Electrolux', slug: 'electrolux', primaryColor: '#001E62', category: 'home' },

  // ── Tech / Software ────────────────────────────────────────────────────────
  { name: 'Amazon', slug: 'amazon', primaryColor: '#FF9900', category: 'tech' },
  { name: 'Meta', slug: 'meta', primaryColor: '#0668E1', category: 'tech', aliases: ['facebook'] },
  { name: 'Netflix', slug: 'netflix', primaryColor: '#E50914', category: 'tech' },
  { name: 'Spotify', slug: 'spotify', primaryColor: '#1DB954', category: 'tech' },

  // ── Additional Brands ──────────────────────────────────────────────────────
  { name: 'Sennheiser', slug: 'sennheiser', primaryColor: '#1A1A1A', category: 'electronics' },
  { name: 'Qualcomm', slug: 'qualcomm', primaryColor: '#3253DC', category: 'electronics' },
  { name: 'Oppo', slug: 'oppo', primaryColor: '#1A6A34', category: 'electronics' },
  { name: 'Fitbit', slug: 'fitbit', primaryColor: '#00B0B9', category: 'electronics' },
  { name: 'Garmin', slug: 'garmin', primaryColor: '#000000', category: 'electronics' },
  { name: 'Logitech', slug: 'logitech', primaryColor: '#00B8FC', category: 'electronics' },
  { name: 'Razer', slug: 'razer', primaryColor: '#44D62C', category: 'electronics' },
];

// ── Lookup Maps (built once at module load) ──────────────────────────────────

/** slug → BrandEntry */
export const BRAND_BY_SLUG = new Map<string, BrandEntry>(
  BRAND_REGISTRY.map((b) => [b.slug, b]),
);

/** lowercased name → BrandEntry  (includes aliases) */
export const BRAND_LOOKUP = new Map<string, BrandEntry>();

for (const brand of BRAND_REGISTRY) {
  BRAND_LOOKUP.set(brand.name.toLowerCase(), brand);
  BRAND_LOOKUP.set(brand.slug, brand);
  if (brand.aliases) {
    for (const alias of brand.aliases) {
      BRAND_LOOKUP.set(alias.toLowerCase(), brand);
    }
  }
}

/**
 * Find a brand by any name/alias/slug (case-insensitive).
 * Also attempts fuzzy matching for common misspellings (edit-distance ≤ 2).
 */
export function findBrand(query: string): BrandEntry | undefined {
  const q = query.trim().toLowerCase();

  // Exact match
  const exact = BRAND_LOOKUP.get(q);
  if (exact) return exact;

  // Fuzzy: check if query is a substring of a brand name or vice-versa
  for (const brand of BRAND_REGISTRY) {
    const name = brand.name.toLowerCase();
    if (name.startsWith(q) && q.length >= 3) return brand;
    if (q.startsWith(name)) return brand;
  }

  // Levenshtein distance ≤ 2 for short queries
  if (q.length >= 3) {
    let bestMatch: BrandEntry | undefined;
    let bestDist = 3; // threshold

    for (const [key, brand] of BRAND_LOOKUP) {
      if (Math.abs(key.length - q.length) > 2) continue;
      const dist = levenshtein(q, key);
      if (dist < bestDist) {
        bestDist = dist;
        bestMatch = brand;
      }
    }

    if (bestMatch) return bestMatch;
  }

  return undefined;
}

/** Minimal Levenshtein distance (optimized for short strings) */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}
