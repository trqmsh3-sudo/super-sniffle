import stringSimilarity from 'string-similarity';
import { logger } from '../utils/logger.js';

const commonProducts = [
  'iPhone 15 Pro',
  'Samsung Galaxy S24',
  'MacBook Pro',
  'Dell XPS 15',
  'Sony WH-1000XM5',
  'AirPods Pro',
  'Weber Spirit II E-310',
  'Traeger Pro 575',
  'Dyson V15',
  'Roomba j7+',
  'KitchenAid Stand Mixer',
  'Instant Pot Duo',
  'Nintendo Switch OLED',
  'PlayStation 5',
  'Xbox Series X',
  'LG C3 OLED TV',
  'Samsung Frame TV',
];

export const fuzzyCorrect = (query) => {
  if (!query || query.length < 3) {
    return query;
  }

  const normalized = query.trim().toLowerCase();
  
  const matches = stringSimilarity.findBestMatch(
    normalized,
    commonProducts.map(p => p.toLowerCase())
  );

  if (matches.bestMatch.rating > 0.6) {
    const correctedProduct = commonProducts[matches.bestMatchIndex];
    logger.info(`Fuzzy correction: "${query}" → "${correctedProduct}" (confidence: ${matches.bestMatch.rating.toFixed(2)})`);
    return correctedProduct;
  }

  return query;
};

export const getSuggestions = (partialQuery) => {
  if (!partialQuery || partialQuery.length < 2) {
    return [];
  }

  const normalized = partialQuery.trim().toLowerCase();
  
  const suggestions = commonProducts
    .filter(product => product.toLowerCase().includes(normalized))
    .slice(0, 5);

  return suggestions;
};
