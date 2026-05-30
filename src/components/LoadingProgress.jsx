import React from 'react';

/**
 * Invariant 5: No ranked output is shown unless the full dataset is loaded.
 * Displays page fetch progress during cold load.
 */
export default function LoadingProgress({ progress, error, onRetry }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 max-w-md mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-danger-subtle border border-danger-border flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-danger-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-text-primary text-h2 font-semibold">Data Load Failed</h3>
        <p className="text-text-secondary text-caption mt-2 mb-6">
          {error}
        </p>
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-accent-primary text-text-inverse font-semibold text-caption rounded-md hover:bg-accent-primary-hover shadow-sm active:scale-[0.98] transition-all"
        >
          Retry Fetching Dataset
        </button>
      </div>
    );
  }

  const page = progress?.page ?? 0;
  const total = progress?.total ?? 60;
  const loadedCount = progress?.loadedCount ?? 0;
  
  const percentage = Math.round((page / total) * 100) || 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 max-w-lg mx-auto">
      {/* Sleek, calm premium loader design */}
      <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
        <div className="absolute w-16 h-16 rounded-full border-4 border-border-interactive"></div>
        <div className="absolute w-16 h-16 rounded-full border-4 border-t-accent-primary animate-spin"></div>
        <span className="text-text-primary text-caption font-semibold font-numeric">{percentage}%</span>
      </div>

      <h3 className="text-text-primary text-h2 font-semibold tracking-tight text-center">
        Loading Competitor Intelligence
      </h3>
      
      <p className="text-text-secondary text-caption mt-2 mb-6 text-center max-w-sm">
        Fetching and analyzing 6,000 competitor product reviews from the Mosaic Fellowship API...
      </p>

      {/* Progress Bar Container */}
      <div className="w-full bg-border-secondary rounded-full h-2 overflow-hidden mb-3">
        <div 
          className="bg-accent-primary h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Numerical Progress details */}
      <div className="flex justify-between w-full text-micro text-text-tertiary font-numeric">
        <span>Fetched {page} of {total} pages</span>
        <span>{loadedCount.toLocaleString()} reviews processed</span>
      </div>
    </div>
  );
}
