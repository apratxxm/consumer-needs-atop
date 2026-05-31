/**
 * Business logic for building the competitor vulnerability matrix.
 * Pure functions only - no UI, no fetch, no localStorage.
 */

import { parseNeedTags } from './aggregate.js';

/**
 * Builds the brand × need matrix, showing complaint counts.
 * 
 * @param {Array<Object>} reviews - Raw reviews array
 * @param {Array<string>} topNeeds - Top 10 unmet needs
 * @returns {Array<Object>} List of brand objects, sorted by total complaint density descending
 */
export function buildCompetitorMatrix(reviews, topNeeds) {
  if (!Array.isArray(reviews) || !Array.isArray(topNeeds) || topNeeds.length === 0) {
    return [];
  }

  const brandMap = new Map();

  // Initialize all known brands from reviews
  for (const review of reviews) {
    const brand = (review.competitor_brand || review.brand) ? String(review.competitor_brand || review.brand).trim() : 'Unknown';
    if (!brand || brand === 'Unknown') continue;

    if (!brandMap.has(brand)) {
      const initialNeeds = {};
      for (const need of topNeeds) {
        initialNeeds[need] = 0;
      }

      brandMap.set(brand, {
        brand,
        needs: initialNeeds,
        totalComplaints: 0,
        averageRatingSum: 0,
        ratingCount: 0
      });
    }

    const brandRecord = brandMap.get(brand);
    const tags = parseNeedTags(review);
    const rating = Number(review.rating || 0);

    if (rating > 0) {
      brandRecord.averageRatingSum += rating;
      brandRecord.ratingCount++;
    }

    for (const tag of tags) {
      if (tag in brandRecord.needs) {
        brandRecord.needs[tag]++;
        brandRecord.totalComplaints++;
      }
    }
  }

  // Convert to array and format
  const matrixData = [];
  for (const record of brandMap.values()) {
    const avgRating = record.ratingCount > 0 
      ? Math.round((record.averageRatingSum / record.ratingCount) * 10) / 10 
      : 0;

    matrixData.push({
      brand: record.brand,
      needs: record.needs,
      totalComplaints: record.totalComplaints,
      avgRating
    });
  }

  // Sort by total complaint density descending by default
  return matrixData.sort((a, b) => b.totalComplaints - a.totalComplaints);
}
