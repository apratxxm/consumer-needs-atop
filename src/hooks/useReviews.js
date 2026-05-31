import { useState, useEffect, useCallback } from 'react';
import { fetchAllReviews } from '../api/fetchReviews.js';
import { getReviewsFromCache, saveReviewsToCache } from '../cache/storage.js';

/**
 * Hook to manage review data fetching and caching lifecycle.
 * Invariant 5: No ranked output is shown unless the full dataset is loaded.
 */
export function useReviews() {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);
  const [cacheInfo, setCacheInfo] = useState({ isCached: false, fetchedAt: null });

  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setProgress(null);

    // 1. Try to load from cache if not forcing refresh
    if (!forceRefresh) {
      const cached = getReviewsFromCache();
      if (cached) {
        setReviews(cached.reviews);
        setCacheInfo({ isCached: true, fetchedAt: cached.fetchedAt });
        setLoading(false);
        return;
      }
    }

    // 2. Fetch sequentially from Mosaic API
    try {
      setProgress({ page: 0, total: 60, loadedCount: 0 });
      
      const fetchedReviews = await fetchAllReviews((page, total, loadedCount) => {
        setProgress({ page, total, loadedCount });
      });

      // Save to cache
      saveReviewsToCache(fetchedReviews);
      
      setReviews(fetchedReviews);
      setCacheInfo({ isCached: false, fetchedAt: new Date().toISOString() });
      setLoading(false);
    } catch (err) {
      console.error('[useReviews] Error fetching reviews:', err);
      setError(err.message || 'An error occurred while fetching competitor reviews.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const forceRefresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  return {
    reviews,
    loading,
    progress,
    error,
    isCached: cacheInfo.isCached,
    cachedTime: cacheInfo.fetchedAt,
    forceRefresh,
  };
}
