import { useMemo } from 'react';
import { aggregateReviews } from '../engine/aggregate.js';
import { calculateOpportunityScore } from '../engine/score.js';

/**
 * Hook to derive, score, and rank unmet needs from raw review data.
 * Recalculates immediately when reviews or weights change (<100ms).
 */
export function useRankings(reviews, activeWeights) {
  return useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) {
      return {
        rankedNeeds: [],
        dataQuality: { totalReviews: 0, zeroNeedCount: 0, ratingCounts: {}, verifiedCount: 0 },
        activeWeights
      };
    }

    const { needStats, dataQuality } = aggregateReviews(reviews);
    const rankedNeeds = [];

    // Calculate score for each unmet need
    for (const stats of needStats.values()) {
      const score = calculateOpportunityScore(
        stats.frequencySignal,
        stats.sentimentSignal,
        stats.validationSignal,
        stats.breadthSignal,
        activeWeights
      );

      rankedNeeds.push({
        need: stats.need,
        score,
        mentions: stats.mentions,
        avgRating: stats.avgRating,
        avgHelpfulVotes: stats.avgHelpfulVotes,
        verifiedPurchasePct: stats.verifiedPurchasePct,
        verifiedPurchaseRatio: stats.verifiedPurchaseRatio,
        uniqueBrandsCount: stats.uniqueBrandsCount,
        brandsAffected: stats.brandsAffected,
        
        // Expose signals for transparency
        signals: {
          frequency: stats.frequencySignal,
          sentiment: stats.sentimentSignal,
          validation: stats.validationSignal,
          breadth: stats.breadthSignal
        }
      });
    }

    // Sort: score descending, then helpful votes descending (tie-breaker)
    rankedNeeds.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.avgHelpfulVotes - a.avgHelpfulVotes;
    });

    // Add rank number (1-based index)
    const rankedNeedsWithIndex = rankedNeeds.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    return {
      rankedNeeds: rankedNeedsWithIndex,
      dataQuality,
      activeWeights
    };
  }, [reviews, activeWeights]);
}
