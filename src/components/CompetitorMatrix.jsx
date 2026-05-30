import React, { useState, useMemo } from 'react';
import { buildCompetitorMatrix } from '../engine/matrix.js';
import { ArrowUpDown, HelpCircle } from 'lucide-react';

/**
 * Competitor vulnerability matrix heatmap.
 * Shows which competitor brands are most exposed to which unmet needs.
 */
export default function CompetitorMatrix({ reviews, topNeeds }) {
  const [sortBy, setSortBy] = useState('density'); // 'density' | 'alphabetical' | 'rating'

  // 1. Build the matrix data
  const matrixData = useMemo(() => {
    return buildCompetitorMatrix(reviews, topNeeds);
  }, [reviews, topNeeds]);

  // Calculate dynamic maximum cell value for robust legend thresholds
  const maxVal = useMemo(() => {
    if (matrixData.length === 0) return 0;
    let max = 0;
    for (const row of matrixData) {
      for (const val of Object.values(row.needs)) {
        if (val > max) max = val;
      }
    }
    return max;
  }, [matrixData]);

  // Generate mathematically proportional buckets based on maximum pain density
  const thresholds = useMemo(() => {
    if (maxVal <= 5) {
      return [0, 1, 2, 3, 4, 5];
    }
    const step = maxVal / 5;
    return [
      0,
      Math.max(1, Math.round(step * 1)),
      Math.max(2, Math.round(step * 2)),
      Math.max(3, Math.round(step * 3)),
      Math.max(4, Math.round(step * 4)),
      maxVal
    ];
  }, [maxVal]);

  // 2. Sort the brands
  const sortedMatrix = useMemo(() => {
    const data = [...matrixData];
    if (sortBy === 'density') {
      return data.sort((a, b) => b.totalComplaints - a.totalComplaints);
    } else if (sortBy === 'alphabetical') {
      return data.sort((a, b) => a.brand.localeCompare(b.brand));
    } else if (sortBy === 'rating') {
      return data.sort((a, b) => a.avgRating - b.avgRating); // lowest rating = most vulnerable first
    }
    return data;
  }, [matrixData, sortBy]);

  // Determine heatmap background token based on mention density count
  const getHeatmapClass = (count) => {
    if (!count || count === 0) return 'bg-heatmap-0 border-border-subtle';
    if (count <= thresholds[1]) return 'bg-heatmap-1 text-text-secondary';
    if (count <= thresholds[2]) return 'bg-heatmap-2 text-text-primary font-medium';
    if (count <= thresholds[3]) return 'bg-heatmap-3 text-text-primary font-semibold';
    if (count <= thresholds[4]) return 'bg-heatmap-4 text-text-inverse font-semibold';
    return 'bg-heatmap-5 text-text-inverse font-bold';
  };

  return (
    <div className="bg-bg-elevated rounded-lg shadow-md border border-border-primary overflow-hidden">
      {/* Header */}
      <div className="p-cardPadding border-b border-border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-text-primary text-h2 font-semibold tracking-tight">Competitor Vulnerability Matrix</h3>
          <p className="text-text-secondary text-caption mt-1">
            Map showing unmet need mention frequency across 15 competitor brands. Darker blue cells indicate critical pain concentrations.
          </p>
        </div>
        
        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start text-caption">
          <span className="text-text-tertiary font-medium flex items-center gap-1">
            Sort Brands:
            <HelpCircle className="w-3.5 h-3.5 text-text-subtle" title="Sort competitors by their relative risk metrics" />
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-bg-elevated border border-border-interactive text-text-primary px-3 py-1.5 rounded-md focus:outline-none focus:border-border-focus text-caption shadow-sm"
          >
            <option value="density">Total Vulnerability Density</option>
            <option value="rating">Average Rating (Lowest First)</option>
            <option value="alphabetical">Brand Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Grid Heatmap Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-table-headerBg border-b border-table-divider text-text-tertiary text-micro uppercase tracking-wider font-semibold">
              <th className="py-4 px-6 min-w-[180px]">Competitor Brand</th>
              <th className="py-4 px-4 text-center w-24">Vulnerability Index</th>
              <th className="py-4 px-4 text-center w-20">Avg Rating</th>
              {topNeeds.map((need) => (
                <th 
                  key={need} 
                  className="py-4 px-2 text-center text-[11px] font-semibold tracking-tight min-w-[90px] max-w-[120px] truncate"
                  title={need.replace(/_/g, ' ')}
                >
                  {need.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-table-divider">
            {sortedMatrix.map((row) => (
              <tr 
                key={row.brand} 
                className="hover:bg-table-rowHover transition-colors duration-120"
              >
                {/* Brand Name */}
                <td className="py-3 px-6 font-semibold text-text-primary text-caption truncate max-w-[180px]">
                  {row.brand}
                </td>
                
                {/* Total Vulnerability */}
                <td className="py-3 px-4 text-center">
                  <span className="font-numeric text-caption font-bold text-text-primary bg-bg-secondary px-2.5 py-0.5 rounded-sm border border-border-primary">
                    {row.totalComplaints} mentions
                  </span>
                </td>

                {/* Avg Rating */}
                <td className="py-3 px-4 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-micro font-numeric font-bold border ${
                    row.avgRating <= 2.2 
                      ? 'text-danger-primary bg-danger-subtle border-danger-border' 
                      : row.avgRating <= 3.2 
                      ? 'text-warning-primary bg-warning-subtle border-warning-border' 
                      : 'text-success-primary bg-success-subtle border-success-border'
                  }`}>
                    ★ {row.avgRating ? row.avgRating.toFixed(1) : 'N/A'}
                  </span>
                </td>

                {/* Heatmap cells */}
                {topNeeds.map((need) => {
                  const count = row.needs[need] || 0;
                  return (
                    <td 
                      key={need}
                      className="p-1 text-center"
                    >
                      <div 
                        className={`py-3.5 px-1 text-caption font-numeric rounded-[2px] transition-all duration-120 cursor-help border ${getHeatmapClass(count)}`}
                        title={`${row.brand} — ${count} complaints regarding "${need.replace(/_/g, ' ')}"`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend Footer */}
      <div className="p-cardPadding bg-bg-subtle border-t border-border-primary flex flex-wrap gap-4 items-center justify-between text-micro text-text-tertiary">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">Pain Density Legend:</span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-0 border border-border-primary inline-block rounded-[1px]"></span>
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-1 border border-border-secondary inline-block rounded-[1px]"></span>
            <span>1-{thresholds[1]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-2 border border-border-secondary inline-block rounded-[1px]"></span>
            <span>{thresholds[1] + 1}-{thresholds[2]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-3 border border-border-secondary inline-block rounded-[1px]"></span>
            <span>{thresholds[2] + 1}-{thresholds[3]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-4 border border-border-secondary inline-block rounded-[1px]"></span>
            <span>{thresholds[3] + 1}-{thresholds[4]}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-3.5 bg-heatmap-5 border border-border-secondary inline-block rounded-[1px]"></span>
            <span>{thresholds[4] + 1}+</span>
          </div>
        </div>
        
        <span>Hover cells for detailed tooltip data</span>
      </div>
    </div>
  );
}
