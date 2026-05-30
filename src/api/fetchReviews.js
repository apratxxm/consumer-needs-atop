/**
 * All communication with the Mosaic Fellowship API lives here.
 * Handles sequential page fetching (1 to 60), retry logic, and progress tracking.
 */

const API_BASE_URL = 'https://mosaicfellowship.in/api/data/npd/reviews';
const TOTAL_PAGES = 60;
const LIMIT = 100;
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 3;

/**
 * Delay execution for a given number of milliseconds.
 * @param {number} ms 
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches a single page of reviews with retry logic.
 * @param {number} page 
 * @param {number} retryCount 
 * @returns {Promise<Array>}
 */
async function fetchPageWithRetry(page, retryCount = 0) {
  try {
    const url = `${API_BASE_URL}?page=${page}&limit=${LIMIT}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate that we received an array or a wrapper containing the reviews array
    // Standard format for this API is usually an array, but let's check
    const reviews = Array.isArray(data) ? data : (data.reviews || data.data || []);
    return reviews;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`[API] Page ${page} failed (Attempt ${retryCount + 1}/${MAX_RETRIES + 1}). Retrying in ${RETRY_DELAY_MS}ms...`, error);
      await delay(RETRY_DELAY_MS);
      return fetchPageWithRetry(page, retryCount + 1);
    } else {
      console.error(`[API] Page ${page} failed completely after ${MAX_RETRIES + 1} attempts.`, error);
      throw error;
    }
  }
}

/**
 * Sequentially fetches all 60 pages of competitor reviews.
 * Emits progress callbacks.
 * 
 * @param {Function} onProgress - Callback receiving (pagesFetched, totalPages, loadedCount)
 * @returns {Promise<Array>} Combined reviews array from all successfully fetched pages
 */
export async function fetchAllReviews(onProgress = () => {}) {
  const allReviews = [];
  console.log(`[API] Starting sequential fetch of ${TOTAL_PAGES} pages...`);

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    try {
      const pageReviews = await fetchPageWithRetry(page);
      allReviews.push(...pageReviews);
      onProgress(page, TOTAL_PAGES, allReviews.length);
    } catch (error) {
      console.error(`[API] Terminating fetch sequence due to unrecoverable failure on page ${page}.`, error);
      throw new Error(`Data fetching failed on page ${page}: ${error.message}`);
    }
  }

  console.log(`[API] Completed fetch. Total reviews loaded: ${allReviews.length}`);
  return allReviews;
}
