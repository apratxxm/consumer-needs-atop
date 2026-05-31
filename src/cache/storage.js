/**
 * Caching layer for local storage.
 * Encapsulates all reads/writes to localStorage.
 * No UI components touch localStorage directly.
 */

const CACHE_KEY = 'ngf_reviews_v1';
const TIMESTAMP_KEY = 'ngf_reviews_fetched_at';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Checks if the cached data is still fresh (under 24 hours).
 * @param {string} timestampStr - ISO string timestamp of the fetch
 * @returns {boolean} True if fresh, false if expired or invalid
 */
function isCacheFresh(timestampStr) {
  if (!timestampStr) return false;
  try {
    const fetchedAt = new Date(timestampStr).getTime();
    const now = Date.now();
    return now - fetchedAt < CACHE_EXPIRY_MS;
  } catch (e) {
    return false;
  }
}

/**
 * Reads reviews from local storage cache if it exists and is fresh.
 * @returns {Array|null} Array of raw reviews or null if cache is missing/stale
 */
export function getReviewsFromCache() {
  try {
    const timestamp = localStorage.getItem(TIMESTAMP_KEY);
    if (!isCacheFresh(timestamp)) {
      console.log('[Cache] Cache is missing or expired (>24 hours).');
      return null;
    }

    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) {
      console.log('[Cache] Cache key is empty.');
      return null;
    }

    const reviews = JSON.parse(cachedData);
    if (!Array.isArray(reviews) || reviews.length === 0) {
      console.warn('[Cache] Cached data is invalid or empty.');
      return null;
    }

    console.log(`[Cache] Cache hit. Loaded ${reviews.length} reviews. Fetched at: ${timestamp}`);
    return {
      reviews,
      fetchedAt: timestamp
    };
  } catch (error) {
    console.error('[Cache] Failed to read from cache:', error);
    return null;
  }
}

/**
 * Saves reviews and timestamp to local storage.
 * @param {Array} reviews - Raw reviews array
 */
export function saveReviewsToCache(reviews) {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    console.warn('[Cache] Refusing to cache empty or invalid reviews array.');
    return;
  }
  try {
    const nowStr = new Date().toISOString();
    localStorage.setItem(CACHE_KEY, JSON.stringify(reviews));
    localStorage.setItem(TIMESTAMP_KEY, nowStr);
    console.log(`[Cache] Cache written with ${reviews.length} reviews.`);
  } catch (error) {
    console.error('[Cache] Failed to write to cache (might exceed localStorage limit):', error);
  }
}

/**
 * Clears the cache key and fetch timestamp.
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(TIMESTAMP_KEY);
    console.log('[Cache] Cache cleared successfully.');
  } catch (error) {
    console.error('[Cache] Failed to clear cache:', error);
  }
}
