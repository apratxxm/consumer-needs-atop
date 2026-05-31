/**
 * Business logic for aggregating raw reviews into need-based statistics.
 * Pure functions only - no UI, no fetch, no localStorage.
 */

/**
 * Extracts need tags from a review object.
 * Handles arrays, single strings, comma-separated strings, and null/undefined values.
 * 
 * @param {Object} review 
 * @returns {Array<string>} Array of parsed unmet need tags
 */
export function parseNeedTags(review) {
  const needsField = review?.detected_unmet_needs;
  if (!needsField) return [];

  if (Array.isArray(needsField)) {
    return needsField.map(tag => String(tag).trim()).filter(Boolean);
  }

  if (typeof needsField === 'string') {
    // If it is a JSON string of an array (sometimes occurs in raw exports)
    if (needsField.startsWith('[') && needsField.endsWith(']')) {
      try {
        const parsed = JSON.parse(needsField);
        if (Array.isArray(parsed)) {
          return parsed.map(tag => String(tag).trim()).filter(Boolean);
        }
      } catch (e) {
        // Fall back to normal string processing
      }
    }
    
    // Comma separated or simple string
    return needsField
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

/**
 * Aggregates raw reviews into unmet needs statistics and builds signals for opportunity scoring.
 * 
 * @param {Array<Object>} reviews - Array of raw review objects
 * @returns {Object} { needStats: Map, dataQuality: Object }
 */
export function aggregateReviews(reviews) {
  if (!Array.isArray(reviews)) {
    return { needStats: new Map(), dataQuality: { totalReviews: 0, zeroNeedCount: 0, ratingCounts: {}, verifiedCount: 0 } };
  }

  const needMap = new Map();
  let zeroNeedCount = 0;
  let verifiedCount = 0;
  const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const allBrands = new Set();

  // First pass: aggregate raw totals
  for (const review of reviews) {
    // Brand tracking
    const brand = (review.competitor_brand || review.brand) ? String(review.competitor_brand || review.brand).trim() : 'Unknown';
    if (brand && brand !== 'Unknown') {
      allBrands.add(brand);
    }

    // Rating tracking
    const rating = Math.round(Number(review.rating || 0));
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }

    // Verified purchase tracking
    // Handles boolean true/false, numeric 1/0, strings '1'/'0', 'yes'/'no', 'true'/'false'
    const isVerified = 
      review.verified_purchase === true || 
      review.verified_purchase === 1 ||
      String(review.verified_purchase) === '1' ||
      String(review.verified_purchase).toLowerCase() === 'yes' ||
      String(review.verified_purchase).toLowerCase() === 'true';
    if (isVerified) {
      verifiedCount++;
    }

    // Unmet needs extraction
    const tags = parseNeedTags(review);
    if (tags.length === 0) {
      zeroNeedCount++;
      continue;
    }

    // Helpfulness votes (handles helpful_votes or helpful_count)
    const helpfulVotes = Number(review.helpful_votes ?? review.helpful_count ?? 0);

    for (const tag of tags) {
      if (!needMap.has(tag)) {
        needMap.set(tag, {
          need: tag,
          mentions: 0,
          totalRating: 0,
          totalHelpfulVotes: 0,
          verifiedMentions: 0,
          brandsAffected: new Map(), // Brand Name -> Complaint Count
        });
      }

      const stats = needMap.get(tag);
      stats.mentions++;
      stats.totalRating += Number(review.rating || 0);
      stats.totalHelpfulVotes += helpfulVotes;
      if (isVerified) {
        stats.verifiedMentions++;
      }

      // Track brand mentions for the matrix
      const brandCount = stats.brandsAffected.get(brand) || 0;
      stats.brandsAffected.set(brand, brandCount + 1);
    }
  }

  const totalBrands = allBrands.size || 15; // fallback to 15 if set is empty
  const needStats = new Map();

  // Second pass: Calculate averages and normalized signals for scoring
  // Find maximum mentions of any need to normalize frequency
  let maxMentions = 0;
  for (const stats of needMap.values()) {
    if (stats.mentions > maxMentions) {
      maxMentions = stats.mentions;
    }
  }

  for (const [tag, stats] of needMap.entries()) {
    const avgRating = stats.mentions > 0 ? stats.totalRating / stats.mentions : 0;
    const avgHelpfulVotes = stats.mentions > 0 ? stats.totalHelpfulVotes / stats.mentions : 0;
    const verifiedRatio = stats.mentions > 0 ? stats.verifiedMentions / stats.mentions : 0;
    const uniqueBrandsCount = stats.brandsAffected.size;

    // Normalised signals [0, 1]
    const frequencySignal = maxMentions > 0 ? stats.mentions / maxMentions : 0;
    // Invert rating: lower rating = higher pain/sentiment signal
    // Bound to [0, 1] just in case
    const sentimentSignal = Math.max(0, Math.min(1, (5 - avgRating) / 5));
    const validationSignal = verifiedRatio; // verified purchase ratio
    const breadthSignal = uniqueBrandsCount / totalBrands; // unique brands affected / total brands

    needStats.set(tag, {
      need: tag,
      mentions: stats.mentions,
      avgRating: Math.round(avgRating * 10) / 10,
      avgHelpfulVotes: Math.round(avgHelpfulVotes * 10) / 10,
      verifiedPurchaseRatio: verifiedRatio,
      verifiedPurchasePct: Math.round(verifiedRatio * 100),
      uniqueBrandsCount,
      brandsAffected: Object.fromEntries(stats.brandsAffected), // convert to plain object
      
      // Normalized signals
      frequencySignal,
      sentimentSignal,
      validationSignal,
      breadthSignal
    });
  }

  return {
    needStats,
    dataQuality: {
      totalReviews: reviews.length,
      zeroNeedCount,
      zeroNeedPct: reviews.length > 0 ? Math.round((zeroNeedCount / reviews.length) * 100) : 0,
      ratingCounts,
      verifiedCount,
      verifiedPct: reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 0,
    }
  };
}
