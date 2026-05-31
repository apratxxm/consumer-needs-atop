/**
 * Business logic for calculating temporal trends.
 * Pure functions only - no UI, no fetch, no localStorage.
 */

import { parseNeedTags } from './aggregate.js';

const MONTH_LABELS = [
  'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
  'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025'
];

/**
 * Parses a date string and returns the month index (0 for Jan 2025 to 10 for Nov 2025).
 * If the date is outside of Jan-Nov 2025, returns -1.
 * 
 * @param {string} dateStr 
 * @returns {number} Month index [0-10] or -1 if invalid/out-of-range
 */
export function getMonthIndex(dateStr) {
  if (!dateStr) return -1;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return -1;
    
    const year = d.getFullYear();
    const month = d.getMonth(); // 0-11
    
    // The timeline is explicitly Jan - Nov 2025
    if (year === 2025 && month >= 0 && month <= 10) {
      return month;
    }
    
    // If year is not 2025 but within 0-10, we can fallback to the month index to be robust
    // if the dataset has slightly off dates, but let's strictly check 2025 first.
    if (month >= 0 && month <= 10) {
      return month;
    }
    
    return -1;
  } catch (e) {
    return -1;
  }
}

/**
 * Groups reviews by month (Jan-Nov 2025) and counts mentions for all unmet needs.
 * This can be filtered for the top N needs in the charting layer.
 * 
 * @param {Array<Object>} reviews 
 * @returns {Array<Object>} List of 11 month trend data objects
 */
export function calculateTemporalTrends(reviews) {
  // Initialize trend buckets for Jan (0) to Nov (10)
  const trends = MONTH_LABELS.map((label, idx) => ({
    month: label,
    monthIndex: idx,
    totalMentions: 0
    // need_name: count will be added dynamically below
  }));

  if (!Array.isArray(reviews)) {
    return trends;
  }

  for (const review of reviews) {
    const dateStr = review.review_date || review.date || review.timestamp || review.created_at;
    const mIdx = getMonthIndex(dateStr);
    
    if (mIdx < 0 || mIdx > 10) continue;

    const tags = parseNeedTags(review);
    if (tags.length === 0) continue;

    const monthObj = trends[mIdx];
    monthObj.totalMentions += tags.length;

    for (const tag of tags) {
      if (!monthObj[tag]) {
        monthObj[tag] = 0;
      }
      monthObj[tag]++;
    }
  }

  return trends;
}

/**
 * Identifies the need with the steepest upward trend in recent months
 * (e.g. from Jun/Jul to Oct/Nov).
 * Useful for annotating the chart with "↑ Accelerating".
 * 
 * @param {Array<Object>} trendData - Output of calculateTemporalTrends
 * @param {Array<string>} targetNeeds - List of needs to evaluate (e.g. top 5)
 * @returns {string|null} The need name with the steepest growth, or null
 */
export function findSteepestTrend(trendData, targetNeeds) {
  if (!Array.isArray(trendData) || trendData.length < 2 || !Array.isArray(targetNeeds) || targetNeeds.length === 0) {
    return null;
  }

  let steepestNeed = null;
  let maxGrowth = -Infinity;

  for (const need of targetNeeds) {
    // Compare average of first 3 months with average of last 3 months to see general direction
    const firstHalfVal = (trendData[0]?.[need] || 0) + (trendData[1]?.[need] || 0) + (trendData[2]?.[need] || 0);
    const lastHalfVal = (trendData[8]?.[need] || 0) + (trendData[9]?.[need] || 0) + (trendData[10]?.[need] || 0);
    
    const growth = lastHalfVal - firstHalfVal;
    
    if (growth > maxGrowth && growth > 0) {
      maxGrowth = growth;
      steepestNeed = need;
    }
  }

  return steepestNeed;
}
