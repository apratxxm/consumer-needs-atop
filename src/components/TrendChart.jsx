import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { calculateTemporalTrends, findSteepestTrend } from '../engine/trend.js';
import { TrendingUp, Info } from 'lucide-react';

/**
 * Temporal trend line chart for top 5 unmet needs over time.
 * Includes toggles and steepest trend highlighting.
 */
export default function TrendChart({ reviews, topNeeds }) {
  // Top 5 needs by default score
  const displayNeeds = useMemo(() => {
    return topNeeds.slice(0, 5);
  }, [topNeeds]);

  // Track toggled visibility for each need
  const [visibleNeeds, setVisibleNeeds] = useState(() => {
    const initial = {};
    topNeeds.slice(0, 5).forEach(need => {
      initial[need] = true;
    });
    return initial;
  });

  // Calculate trends for reviews
  const trendData = useMemo(() => {
    return calculateTemporalTrends(reviews);
  }, [reviews]);

  // Find the steepest trend need
  const acceleratingNeed = useMemo(() => {
    return findSteepestTrend(trendData, displayNeeds);
  }, [trendData, displayNeeds]);

  // Sync state if topNeeds change
  React.useEffect(() => {
    const updated = {};
    displayNeeds.forEach(need => {
      updated[need] = visibleNeeds[need] !== false;
    });
    setVisibleNeeds(updated);
  }, [displayNeeds]);

  const handleLegendClick = (e) => {
    const { dataKey } = e;
    setVisibleNeeds(prev => ({
      ...prev,
      [dataKey]: !prev[dataKey]
    }));
  };

  // Color mapping matching ui-conventions.md
  const colors = {
    0: '#4C6FFF', // chart.blue
    1: '#0F9D58', // chart.green
    2: '#C0841A', // chart.amber
    3: '#D14343', // chart.red
    4: '#7C6BF2', // chart.purple
  };

  const getNeedColor = (needName) => {
    const idx = displayNeeds.indexOf(needName);
    return colors[idx] || '#64748B';
  };

  // Custom tooltips to match dashboard conventions
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-tooltip text-text-inverse p-3 rounded-md shadow-lg border border-border-interactive text-micro font-sans">
          <p className="font-bold border-b border-text-tertiary pb-1 mb-2 text-caption">{label}</p>
          <div className="space-y-1.5 font-numeric">
            {payload.map((p) => (
              <div key={p.name} className="flex items-center gap-4 justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.stroke }}></span>
                  <span className="text-text-subtle">{String(p.name).replace(/_/g, ' ')}:</span>
                </span>
                <span className="font-bold">{p.value} complaints</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-bg-elevated rounded-lg shadow-md border border-border-primary p-cardPadding flex flex-col gap-6">
      {/* Header and Annotation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-text-primary text-h2 font-semibold tracking-tight">Temporal Complaint Trends</h3>
          <p className="text-text-secondary text-caption mt-1">
            Mentions of top 5 unmet needs over the 11-month review window (Jan 2025 – Nov 2025). Click legend items to toggle series.
          </p>
        </div>
        
        {/* Steepest Growth highlight */}
        {acceleratingNeed && (
          <div className="flex items-center gap-2.5 bg-accent-primary-subtle text-accent-primary border border-border-interactive px-3.5 py-2.5 rounded-md self-start md:self-auto shadow-sm">
            <TrendingUp className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <div className="text-caption">
              <span className="font-bold">Accelerating fastest: </span>
              <span className="underline font-semibold capitalize">{acceleratingNeed.replace(/_/g, ' ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Recharts Render Grid */}
      <div className="w-full h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF3" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              axisLine={{ stroke: '#CBD9FF' }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#64748B', fontSize: 12 }} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} contentStyle={{ background: 'none', border: 'none', padding: 0 }} />
            
            <Legend 
              onClick={handleLegendClick}
              wrapperStyle={{ paddingTop: 10, fontSize: 12, cursor: 'pointer' }}
              formatter={(value) => (
                <span className={`text-caption font-semibold transition-opacity duration-150 ${
                  visibleNeeds[value] ? 'text-text-primary' : 'text-text-subtle line-through opacity-50'
                }`}>
                  {value.replace(/_/g, ' ')}
                </span>
              )}
            />

            {displayNeeds.map((need) => (
              <Line
                key={need}
                type="monotone"
                dataKey={need}
                name={need}
                stroke={getNeedColor(need)}
                activeDot={{ r: 6, strokeWidth: 0 }}
                strokeWidth={visibleNeeds[need] ? 2.5 : 0}
                opacity={visibleNeeds[need] ? 1 : 0}
                dot={visibleNeeds[need] ? { r: 3, strokeWidth: 1 } : false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 bg-bg-secondary p-3 rounded-md border border-border-secondary text-caption text-text-secondary">
        <Info className="w-4 h-4 text-accent-primary flex-shrink-0" />
        <span>
          Distinguish emerging pain points from declining ones: a need with a positive slope (like {acceleratingNeed?.replace(/_/g, ' ')}) warrants much higher strategic launch priority.
        </span>
      </div>
    </div>
  );
}
