/**
 * Opportunity score calculations and formula.
 * Pure business logic only.
 */

// Invariant 1: Default weights are frozen and immutable
export const DEFAULT_WEIGHTS = Object.freeze({
  sentiment: 0.35,
  frequency: 0.25,
  validation: 0.25,
  breadth: 0.15,
});

/**
 * Calculates the opportunity score for a need based on normalized signals.
 * Opportunity Score = (frequency * w_freq) + (sentiment * w_sent) + (validation * w_val) + (breadth * w_breadth)
 * All signals must be in the range [0, 1].
 * 
 * @param {number} frequencySignal - Normalized frequency of mentions [0, 1]
 * @param {number} sentimentSignal - Normalized sentiment intensity [0, 1] (where 1 is worst sentiment, i.e. highest pain)
 * @param {number} validationSignal - Normalized validation signal [0, 1] (verified purchase ratio)
 * @param {number} breadthSignal - Normalized brand breadth signal [0, 1] (brands affected / total brands)
 * @param {Object} weights - Configuration of weights (must sum to 1.0)
 * @returns {number} Opportunity score between 0 and 1, rounded to 4 decimal places
 */
export function calculateOpportunityScore(
  frequencySignal,
  sentimentSignal,
  validationSignal,
  breadthSignal,
  weights = DEFAULT_WEIGHTS
) {
  const wFreq = weights.frequency ?? DEFAULT_WEIGHTS.frequency;
  const wSent = weights.sentiment ?? DEFAULT_WEIGHTS.sentiment;
  const wVal = weights.validation ?? DEFAULT_WEIGHTS.validation;
  const wBreadth = weights.breadth ?? DEFAULT_WEIGHTS.breadth;

  // Weighted sum
  const score =
    frequencySignal * wFreq +
    sentimentSignal * wSent +
    validationSignal * wVal +
    breadthSignal * wBreadth;

  // Round to 4 decimal places for display consistency
  return Math.round(score * 10000) / 10000;
}
