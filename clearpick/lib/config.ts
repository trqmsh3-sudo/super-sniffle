// =============================================================================
// ClearPick.ai — Shared Configuration
// =============================================================================

export const API_BASE = process.env.PRODUCT_API_URL ?? 'http://localhost:3000';
export const REVALIDATE_SECONDS = 86400;
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://clearpick.ai';
