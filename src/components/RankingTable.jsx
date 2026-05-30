import React from 'react';
import { ChevronRight, ArrowUpDown, HelpCircle } from 'lucide-react';

/**
 * Top-N ranked unmet needs table with transparent formula weighting and detail trigger.
 * Invariant 6: Verified purchase status is always surfaced alongside any ranked need.
 */
export default function RankingTable({ rankedNeeds, onSelectNeed, selectedNeedName }) {
  // We limit display to top 10 needs as specified by the user workflow, 
  // but allow seeing more or all if needed. Let's make it show 10 as default.
  const displayNeeds = rankedNeeds.slice(0, 10);

  const getSentimentColor = (rating) => {
    if (rating <= 2.0) return 'text-danger-primary bg-danger-subtle border-danger-border';
    if (rating <= 3.0) return 'text-warning-primary bg-warning-subtle border-warning-border';
    return 'text-success-primary bg-success-subtle border-success-border';
  };

  const getScoreColor = (score) => {
    if (score >= 0.6) return 'text-accent-primary font-bold';
    if (score >= 0.4) return 'text-text-primary font-semibold';
    return 'text-text-secondary';
  };

  return (
    <div className="bg-bg-elevated rounded-lg shadow-md border border-border-primary overflow-hidden">
      <div className="p-cardPadding border-b border-border-secondary flex items-center justify-between">
        <div>
          <h3 className="text-text-primary text-h2 font-semibold tracking-tight">Top Unmet Needs</h3>
          <p className="text-text-secondary text-caption mt-1">
            Ranked by opportunity score combining frequency, average rating (sentiment), purchase verification, and competitor breadth.
          </p>
        </div>
        <span className="text-micro font-numeric text-text-tertiary bg-bg-secondary px-2.5 py-1 rounded-sm">
          Showing Top {displayNeeds.length} Needs
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-table-headerBg border-b border-table-divider text-text-tertiary text-micro uppercase tracking-wider font-semibold">
              <th className="py-4 px-6 text-center w-12">Rank</th>
              <th className="py-4 px-4 min-w-[200px]">Unmet Need Tag</th>
              <th className="py-4 px-4 text-center">
                <span className="flex items-center justify-center gap-1">
                  Opp. Score
                  <HelpCircle className="w-3.5 h-3.5 text-text-subtle" title="Opportunity Score (0.0 - 1.0) calculated from weights" />
                </span>
              </th>
              <th className="py-4 px-4 text-right">Mentions</th>
              <th className="py-4 px-4 text-center">Avg Rating</th>
              <th className="py-4 px-4 text-center">Verified Ratio</th>
              <th className="py-4 px-4 text-right">Avg Helpfulness</th>
              <th className="py-4 px-4 text-center">Brands Affected</th>
              <th className="py-4 px-6 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-table-divider">
            {displayNeeds.map((item) => {
              const isSelected = selectedNeedName === item.need;
              return (
                <tr
                  key={item.need}
                  onClick={() => onSelectNeed(item.need)}
                  className={`cursor-pointer transition-colors duration-120 group ${
                    isSelected 
                      ? 'bg-bg-active hover:bg-bg-active' 
                      : 'hover:bg-table-rowHover'
                  }`}
                >
                  {/* Rank */}
                  <td className="py-4 px-6 text-center font-numeric font-bold text-text-secondary">
                    {item.rank}
                  </td>
                  
                  {/* Unmet Need Label */}
                  <td className="py-4 px-4 font-semibold text-text-primary text-body">
                    <span className="hover:underline decoration-accent-primary decoration-2">
                      {item.need.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Opportunity Score */}
                  <td className="py-4 px-4 text-center font-numeric font-bold text-body">
                    <span className={getScoreColor(item.score)}>
                      {item.score.toFixed(3)}
                    </span>
                  </td>

                  {/* Mentions */}
                  <td className="py-4 px-4 text-right font-numeric text-text-secondary text-body font-medium">
                    {item.mentions.toLocaleString()}
                  </td>

                  {/* Avg Rating */}
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-micro font-numeric font-bold border ${getSentimentColor(item.avgRating)}`}>
                      ★ {item.avgRating.toFixed(1)}
                    </span>
                  </td>

                  {/* Verified Purchase Ratio (Invariant 6: Always surfaced) */}
                  <td className="py-4 px-4 text-center font-numeric">
                    <div className="flex flex-col items-center">
                      <span className="text-body font-semibold text-text-secondary">
                        {item.verifiedPurchasePct}%
                      </span>
                      <div className="w-12 bg-border-subtle h-1 rounded-full overflow-hidden mt-1">
                        <div 
                          className="bg-success-primary h-full" 
                          style={{ width: `${item.verifiedPurchasePct}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Avg Helpfulness */}
                  <td className="py-4 px-4 text-right font-numeric text-text-tertiary text-body">
                    {item.avgHelpfulVotes} votes
                  </td>

                  {/* Competitor Brands Affected */}
                  <td className="py-4 px-4 text-center font-numeric text-text-tertiary text-body font-medium">
                    {item.uniqueBrandsCount} brands
                  </td>

                  {/* Chevron Right */}
                  <td className="py-4 px-6 text-center">
                    <ChevronRight className={`w-4 h-4 text-text-subtle transition-transform duration-180 group-hover:text-accent-primary group-hover:translate-x-0.5 ${
                      isSelected ? 'rotate-90 text-accent-primary' : ''
                    }`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
