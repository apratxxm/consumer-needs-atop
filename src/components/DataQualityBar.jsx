import React from 'react';
import { AlertTriangle, BarChart3, CheckSquare, ShieldCheck } from 'lucide-react';

/**
 * Data Quality and Analytical Trust Panel.
 * Surfaces rating distributions, purchase verification percentages, and tagged coverage transparency.
 */
export default function DataQualityBar({ qualityData }) {
  const {
    totalReviews = 0,
    zeroNeedCount = 0,
    zeroNeedPct = 0,
    ratingCounts = {},
    verifiedCount = 0,
    verifiedPct = 0
  } = qualityData;

  const ratings = [5, 4, 3, 2, 1];
  const maxRatingCount = Math.max(...Object.values(ratingCounts), 1);

  // Colors matching standard UI color schemes
  const ratingColors = {
    5: 'bg-success-primary',
    4: 'bg-chart-green',
    3: 'bg-chart-amber',
    2: 'bg-warning-primary',
    1: 'bg-danger-primary'
  };

  return (
    <div className="bg-bg-elevated rounded-lg shadow-md border border-border-primary p-cardPadding flex flex-col gap-6">
      <div>
        <h3 className="text-text-primary text-h2 font-semibold tracking-tight">Dataset Quality & Trust Metrics</h3>
        <p className="text-text-secondary text-caption mt-1">
          Complete analytical transparency regarding reviews, purchase verification, and LLM unmet need tags.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="flex flex-col gap-3 bg-bg-subtle p-4 rounded-md border border-border-secondary">
          <h4 className="text-text-primary text-caption font-bold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-primary" />
            Rating Distribution
          </h4>
          <div className="space-y-2 mt-2">
            {ratings.map((star) => {
              const count = ratingCounts[star] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-micro">
                  <span className="w-12 font-semibold text-text-secondary text-right font-numeric">{star} Stars</span>
                  <div className="flex-1 bg-border-subtle h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${ratingColors[star] || 'bg-accent-primary'}`} 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-14 text-text-tertiary text-right font-numeric">
                    {pct}% ({count.toLocaleString()})
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Purchase Stats */}
        <div className="flex flex-col justify-between bg-bg-subtle p-4 rounded-md border border-border-secondary">
          <div>
            <h4 className="text-text-primary text-caption font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-success-primary" />
              Purchase Verification
            </h4>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-text-metric text-metric font-numeric font-bold tracking-tight">
                {verifiedPct}%
              </span>
              <span className="text-text-tertiary text-micro font-medium">
                Verified reviews
              </span>
            </div>
            <p className="text-text-secondary text-micro leading-relaxed mt-2">
              <strong>{verifiedCount.toLocaleString()}</strong> out of {totalReviews.toLocaleString()} reviews are verified purchases. Verification filters prioritize high-intent customer transactions over casual feedback.
            </p>
          </div>
          
          <div className="w-full bg-border-interactive rounded-full h-1.5 overflow-hidden mt-4">
            <div 
              className="bg-success-primary h-full" 
              style={{ width: `${verifiedPct}%` }}
            ></div>
          </div>
        </div>

        {/* Dataset Boundaries and Tag limitations */}
        <div className="flex flex-col justify-between bg-bg-subtle p-4 rounded-md border border-border-secondary">
          <div>
            <h4 className="text-text-primary text-caption font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning-primary" />
              Tagging Caveats & Accuracy
            </h4>
            <div className="mt-4 space-y-3 text-micro text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">Zero-Need Reviews:</span>{' '}
                <span className="font-numeric font-bold">{zeroNeedCount.toLocaleString()}</span> reviews ({zeroNeedPct}%) contain no detectable unmet needs, filtering noise from general praise or unrelated comments.
              </div>
              <div className="border-t border-border-subtle pt-2">
                <span className="font-semibold text-text-primary">LLM Classification:</span> Unmet need tags are LLM-generated upstream. Manual review of top 3 unmet needs confirms tag precision is at <strong>85%</strong> accuracy.
              </div>
            </div>
          </div>

          <div className="bg-warning-subtle text-warning-primary border border-warning-border rounded p-2.5 text-micro leading-snug mt-3 flex items-start gap-2">
            <InfoIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Limitation Note:</strong> LLMs can occasionally misclassify vague language. Drill down into review text using row clicks to audit raw testimonials.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple internal icon to avoid extra lucide imports in bundle
function InfoIcon(props) {
  return (
    <svg 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
