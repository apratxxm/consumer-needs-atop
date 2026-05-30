import React from 'react';
import { DEFAULT_WEIGHTS } from '../engine/score.js';

/**
 * Invariant 2: Slider weights must always sum to exactly 1.0.
 * Min: 0.05, Max: 0.70.
 */
export default function WeightSliders({ weights, onChange, onReset }) {
  const keys = ['sentiment', 'frequency', 'validation', 'breadth'];

  const handleSliderChange = (changedKey, event) => {
    const newValue = parseFloat(event.target.value);
    if (isNaN(newValue)) return;

    const min = 0.05;
    const max = 0.70;
    
    // Clamp the new value
    const clampedValue = Math.max(min, Math.min(max, newValue));
    
    const updated = { ...weights, [changedKey]: clampedValue };
    const otherKeys = keys.filter(k => k !== changedKey);
    
    // Target sum for other keys is remaining from 1.0
    const targetOtherSum = 1.0 - clampedValue;
    const currentOtherSum = otherKeys.reduce((sum, k) => sum + weights[k], 0);

    if (currentOtherSum > 0) {
      otherKeys.forEach(k => {
        updated[k] = (weights[k] / currentOtherSum) * targetOtherSum;
      });
    } else {
      otherKeys.forEach(k => {
        updated[k] = targetOtherSum / otherKeys.length;
      });
    }

    // Iteratively enforce constraints: min = 0.05, max = 0.70
    let hasViolations = true;
    let iterations = 0;
    while (hasViolations && iterations < 15) {
      hasViolations = false;
      let excess = 0;
      let elasticKeys = [];

      for (const k of otherKeys) {
        if (updated[k] < min) {
          excess += (updated[k] - min);
          updated[k] = min;
          hasViolations = true;
        } else if (updated[k] > max) {
          excess += (updated[k] - max);
          updated[k] = max;
          hasViolations = true;
        } else {
          elasticKeys.push(k);
        }
      }

      if (excess !== 0 && elasticKeys.length > 0) {
        const dist = excess / elasticKeys.length;
        elasticKeys.forEach(k => {
          updated[k] += dist;
        });
        hasViolations = true;
      }
      iterations++;
    }

    // Correct any floating point rounding drift
    const totalSum = keys.reduce((s, k) => s + updated[k], 0);
    const diff = 1.0 - totalSum;
    if (Math.abs(diff) > 0.0001) {
      // Apply diff to the elastic key with the largest weight (safest from violating bounds)
      let bestKey = otherKeys[0];
      otherKeys.forEach(k => {
        if (updated[k] > updated[bestKey]) {
          bestKey = k;
        }
      });
      updated[bestKey] += diff;
    }

    // Final clamp to 4 decimal precision
    keys.forEach(k => {
      updated[k] = Math.round(updated[k] * 10000) / 10000;
    });

    onChange(updated);
  };

  const currentTotal = keys.reduce((s, k) => s + (weights[k] || 0), 0);
  const isDrifted = Math.abs(currentTotal - 1.0) > 0.001;

  // Check if current weights are different from default to show reset button status
  const isDefault = keys.every(
    k => Math.abs((weights[k] || 0) - DEFAULT_WEIGHTS[k]) < 0.001
  );

  const labelMap = {
    sentiment: 'Sentiment Pain (w1)',
    frequency: 'Mention Frequency (w2)',
    validation: 'Purchase Validation (w3)',
    breadth: 'Competitor Breadth (w4)',
  };

  const descriptionMap = {
    sentiment: 'Weights low rating reviews (high consumer frustration)',
    frequency: 'Weights absolute count of consumer unmet need mentions',
    validation: 'Weights verified purchase ratio to prioritize real purchases',
    breadth: 'Weights the count of unique competitor brands affected',
  };

  return (
    <div className="bg-bg-elevated rounded-lg shadow-md border border-border-primary p-cardPadding">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-text-primary text-h2 font-semibold tracking-tight">Formula Weight Configuration</h3>
          <p className="text-text-secondary text-caption mt-1">
            Adjust sliders to explore how re-weighting signals changes the top unmet needs ranking.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary text-caption font-medium">Sum:</span>
            <span
              className={`text-body font-numeric font-bold px-2 py-0.5 rounded-sm ${
                isDrifted
                  ? 'bg-danger-subtle text-danger-primary border border-danger-border'
                  : 'bg-success-subtle text-success-primary border border-success-border'
              }`}
            >
              {Math.round(currentTotal * 100)}%
            </span>
          </div>
          <button
            onClick={onReset}
            disabled={isDefault}
            className={`px-4 py-2 text-caption font-semibold rounded-md transition-all duration-180 ${
              isDefault
                ? 'bg-bg-secondary text-text-subtle cursor-not-allowed border border-border-subtle'
                : 'bg-accent-primary text-text-inverse hover:bg-accent-primary-hover shadow-sm hover:shadow active:scale-[0.98]'
            }`}
          >
            Reset to baseline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keys.map(key => {
          const val = weights[key] || 0;
          return (
            <div key={key} className="flex flex-col bg-bg-subtle p-3 rounded-md border border-border-secondary">
              <div className="flex items-center justify-between mb-1">
                <span className="text-text-primary text-caption font-semibold">{labelMap[key]}</span>
                <span className="text-accent-primary text-caption font-numeric font-bold">
                  {Math.round(val * 100)}%
                </span>
              </div>
              <p className="text-text-tertiary text-micro leading-snug mb-3 min-h-[32px]">
                {descriptionMap[key]}
              </p>
              <div className="relative flex items-center h-6">
                <input
                  type="range"
                  min="0.05"
                  max="0.70"
                  step="0.01"
                  value={val}
                  onChange={e => handleSliderChange(key, e)}
                  className="w-full h-1.5 bg-border-interactive rounded-lg appearance-none cursor-pointer accent-accent-primary hover:accent-accent-primary-hover focus:outline-none"
                />
              </div>
              <div className="flex justify-between text-micro text-text-subtle mt-1 font-numeric">
                <span>5%</span>
                <span>70%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
