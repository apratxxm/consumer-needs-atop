import React, { useState, useMemo } from 'react';
import { parseNeedTags } from '../engine/aggregate.js';
import { Filter, ArrowUpDown, X, Star, ThumbsUp, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Filtered review list for a selected unmet need.
 * CPO can read the actual review text that produced the score to verify signal.
 */
export default function DrillDown({ needName, reviews, onClose }) {
  const [sortField, setSortField] = useState('helpful_votes'); // 'helpful_votes' | 'rating_asc' | 'rating_desc'
  const [filterVerified, setFilterVerified] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedRating, setSelectedRating] = useState('All'); // 'All' | '1-2' | '3' | '4-5'

  // 1. Filter reviews that match the unmet need
  const filteredReviews = useMemo(() => {
    if (!reviews || !needName) return [];
    
    return reviews.filter(review => {
      const tags = parseNeedTags(review);
      if (!tags.includes(needName)) return false;

      // Filter: Verified
      const isVerified = 
        review.verified_purchase === true || 
        review.verified_purchase === 1 ||
        String(review.verified_purchase) === '1' ||
        String(review.verified_purchase).toLowerCase() === 'yes' ||
        String(review.verified_purchase).toLowerCase() === 'true';
      if (filterVerified && !isVerified) return false;

      // Filter: Brand
      const brand = (review.competitor_brand || review.brand) ? String(review.competitor_brand || review.brand).trim() : 'Unknown';
      if (selectedBrand !== 'All' && brand !== selectedBrand) return false;

      // Filter: Rating
      const rating = Number(review.rating || 0);
      if (selectedRating === '1-2' && (rating < 1 || rating > 2)) return false;
      if (selectedRating === '3' && rating !== 3) return false;
      if (selectedRating === '4-5' && (rating < 4 || rating > 5)) return false;

      return true;
    });
  }, [reviews, needName, filterVerified, selectedBrand, selectedRating]);

  // 2. Sort reviews
  const sortedReviews = useMemo(() => {
    const list = [...filteredReviews];
    list.sort((a, b) => {
      const helpfulA = Number(a.helpful_votes ?? a.helpful_count ?? 0);
      const helpfulB = Number(b.helpful_votes ?? b.helpful_count ?? 0);
      const ratingA = Number(a.rating || 0);
      const ratingB = Number(b.rating || 0);

      if (sortField === 'helpful_votes') {
        return helpfulB - helpfulA; // high to low
      } else if (sortField === 'rating_asc') {
        return ratingA - ratingB; // low to high
      } else if (sortField === 'rating_desc') {
        return ratingB - ratingA; // high to low
      }
      return 0;
    });
    return list;
  }, [filteredReviews, sortField]);

  // 3. Extract unique brands present for the filter dropdown
  const uniqueBrands = useMemo(() => {
    if (!reviews || !needName) return [];
    const brands = new Set();
    reviews.forEach(review => {
      const tags = parseNeedTags(review);
      if (tags.includes(needName)) {
        const brand = (review.competitor_brand || review.brand) ? String(review.competitor_brand || review.brand).trim() : 'Unknown';
        brands.add(brand);
      }
    });
    return ['All', ...Array.from(brands).sort()];
  }, [reviews, needName]);

  const renderStars = (rating) => {
    const starCount = Math.round(Number(rating || 0));
    return (
      <div className="flex gap-0.5 text-warning-primary">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${
              i < starCount ? 'fill-warning-primary' : 'text-border-interactive'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!needName) return null;

  return (
    <div className="bg-bg-elevated rounded-lg shadow-lg border border-border-primary overflow-hidden flex flex-col transition-all duration-240">
      {/* Header */}
      <div className="p-panelPadding bg-bg-subtle border-b border-border-primary flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-sm bg-accent-primary-subtle text-accent-primary font-bold text-micro uppercase tracking-wider">
              Consumer Voice Drill-Down
            </span>
            <span className="text-micro font-numeric text-text-tertiary">
              {filteredReviews.length} matching reviews
            </span>
          </div>
          <h3 className="text-text-primary text-h1 font-bold tracking-tight mt-1">
            {needName.replace(/_/g, ' ')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-border-interactive transition-colors text-text-secondary"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="p-cardPadding border-b border-border-secondary bg-bg-elevated flex flex-wrap gap-4 items-center justify-between text-caption">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary font-medium">Brand:</span>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-bg-elevated border border-border-interactive text-text-primary px-3 py-1.5 rounded-md focus:outline-none focus:border-border-focus text-caption shadow-sm"
            >
              {uniqueBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <span className="text-text-tertiary font-medium">Rating:</span>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="bg-bg-elevated border border-border-interactive text-text-primary px-3 py-1.5 rounded-md focus:outline-none focus:border-border-focus text-caption shadow-sm"
            >
              <option value="All">All Ratings</option>
              <option value="1-2">Critical (1-2 Stars)</option>
              <option value="3">Neutral (3 Stars)</option>
              <option value="4-5">Positive (4-5 Stars)</option>
            </select>
          </div>

          {/* Verified Checkbox */}
          <label className="flex items-center gap-2 text-text-secondary font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filterVerified}
              onChange={(e) => setFilterVerified(e.target.checked)}
              className="w-4 h-4 rounded text-accent-primary border-border-interactive focus:ring-accent-focusRing"
            />
            Verified purchase only
          </label>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-text-tertiary" />
          <span className="text-text-tertiary font-medium">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-bg-elevated border border-border-interactive text-text-primary px-3 py-1.5 rounded-md focus:outline-none focus:border-border-focus text-caption shadow-sm"
          >
            <option value="helpful_votes">Helpfulness (High to Low)</option>
            <option value="rating_asc">Rating (Low to High)</option>
            <option value="rating_desc">Rating (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Review Cards Area */}
      <div className="max-h-[500px] overflow-y-auto p-panelPadding space-y-4 bg-bg-secondary">
        {sortedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-bg-elevated rounded-lg border border-border-primary text-center">
            <AlertCircle className="w-8 h-8 text-text-subtle mb-2" />
            <p className="text-text-secondary text-caption font-semibold">No reviews matching the active filters.</p>
            <p className="text-text-tertiary text-micro mt-1">Try resetting some filters above to see reviews.</p>
          </div>
        ) : (
          sortedReviews.map((review, idx) => {
            const isVerified = 
              review.verified_purchase === true || 
              review.verified_purchase === 1 ||
              String(review.verified_purchase) === '1' ||
              String(review.verified_purchase).toLowerCase() === 'yes' ||
              String(review.verified_purchase).toLowerCase() === 'true';

            return (
              <div 
                key={review.id || idx} 
                className="bg-bg-elevated p-cardPadding rounded-lg border border-border-primary shadow-sm flex flex-col gap-3 hover:shadow-md transition-shadow duration-180"
              >
                {/* Meta Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-micro">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-text-primary bg-bg-secondary px-2.5 py-0.5 rounded-sm">
                      {review.competitor_brand || review.brand || 'Unknown Brand'}
                    </span>
                    {renderStars(review.rating)}
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 text-success-primary bg-success-subtle border border-success-border px-1.5 py-0.5 rounded-sm font-semibold text-micro">
                        <CheckCircle className="w-3 h-3" /> Verified Purchase
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-text-tertiary bg-bg-secondary px-1.5 py-0.5 rounded-sm text-micro">
                        Unverified purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-numeric text-text-tertiary">
                    {(review.review_date || review.date) && <span>{new Date(review.review_date || review.date).toLocaleDateString()}</span>}
                    {review.platform && <span className="capitalize">{review.platform}</span>}
                  </div>
                </div>

                {/* Content */}
                <p className="text-text-secondary text-body leading-relaxed whitespace-pre-wrap">
                  {review.review_text || review.text || 'No review content provided.'}
                </p>

                {/* Footer action */}
                <div className="flex items-center gap-2 text-micro font-numeric text-text-tertiary border-t border-border-subtle pt-2">
                  <ThumbsUp className="w-3.5 h-3.5 text-text-subtle" />
                  <span>{review.helpful_votes ?? review.helpful_count ?? 0} other customers found this helpful</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
