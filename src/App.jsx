import React, { useState, useCallback, useMemo } from 'react';
import { useReviews } from './hooks/useReviews.js';
import { useRankings } from './hooks/useRankings.js';
import { DEFAULT_WEIGHTS } from './engine/score.js';

import WeightSliders from './components/WeightSliders.jsx';
import RankingTable from './components/RankingTable.jsx';
import DrillDown from './components/DrillDown.jsx';
import CompetitorMatrix from './components/CompetitorMatrix.jsx';
import TrendChart from './components/TrendChart.jsx';
import DataQualityBar from './components/DataQualityBar.jsx';
import LoadingProgress from './components/LoadingProgress.jsx';

import { 
  BarChart3, 
  Activity, 
  Grid, 
  RotateCw, 
  Layers, 
  Calendar, 
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('rankings'); // 'rankings' | 'matrix' | 'trends'
  const [activeWeights, setActiveWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [selectedNeed, setSelectedNeed] = useState(null);

  // Hook to fetch/cache the reviews
  const {
    reviews,
    loading,
    progress,
    error,
    isCached,
    cachedTime,
    forceRefresh,
  } = useReviews();

  // Hook to score & rank needs
  const {
    rankedNeeds,
    dataQuality
  } = useRankings(reviews, activeWeights);

  // Extract top 10 needs names for competitor matrix and trends
  const topNeedNames = useMemo(() => {
    return rankedNeeds.slice(0, 10).map(item => item.need);
  }, [rankedNeeds]);

  // Enforces Invariant 1: slider weights are exploratory and can be reset to defaults
  const handleWeightChange = useCallback((newWeights) => {
    setActiveWeights(newWeights);
  }, []);

  const handleResetWeights = useCallback(() => {
    setActiveWeights({ ...DEFAULT_WEIGHTS });
  }, []);

  // Format cache age string
  const cacheAgeString = useMemo(() => {
    if (!cachedTime) return '';
    try {
      const diffMs = Date.now() - new Date(cachedTime).getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } catch (e) {
      return '';
    }
  }, [cachedTime]);

  const handleSelectNeed = useCallback((need) => {
    setSelectedNeed(prev => (prev === need ? null : need));
  }, []);

  // Render loading state if raw reviews are not fully loaded (Invariant 5)
  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-sans">
        <LoadingProgress progress={progress} error={error} onRetry={() => forceRefresh()} />
      </div>
    );
  }

  // Render error page if the api failed and there was no cache fallback
  if (error && !reviews) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center font-sans">
        <LoadingProgress progress={null} error={error} onRetry={() => forceRefresh()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex flex-col antialiased">
      {/* Top Header Panel */}
      <header className="bg-bg-elevated border-b border-border-primary py-5 px-6 md:px-12 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-accent-primary-subtle text-accent-primary text-micro font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                Product Strategy Panel
              </span>
              {isCached ? (
                <span className="text-micro text-success-primary font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Cached ({cacheAgeString})
                </span>
              ) : (
                <span className="text-micro text-text-tertiary font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-primary animate-pulse"></span>
                  Live dataset loaded
                </span>
              )}
            </div>
            <h1 className="text-text-primary text-h1 font-bold tracking-tight mt-1 mb-0 leading-none">
              Consumer Need-Gap Intelligence
            </h1>
            <p className="text-text-secondary text-caption mt-1">
              Analyzing 6,000 competitor product reviews across 15 premium wellness brands to identify unmet consumer demands.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start md:self-auto">
            <button
              onClick={() => forceRefresh()}
              className="flex items-center gap-2 px-3.5 py-2 border border-border-interactive text-text-secondary rounded-md bg-bg-elevated hover:bg-bg-hover hover:text-text-primary active:scale-[0.98] transition-all text-caption font-semibold shadow-sm"
              title="Clear cache and re-fetch all 60 pages sequentially"
            >
              <RotateCw className="w-4 h-4 text-text-tertiary" />
              Re-fetch Dataset
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-12 py-8 flex flex-col gap-8">
        
        {/* KPI Cards Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-gridGap">
          {/* Total Reviews Card */}
          <div className="bg-bg-elevated p-cardPadding rounded-lg border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-bg-secondary border border-border-subtle flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-accent-primary" />
            </div>
            <div>
              <p className="text-text-tertiary text-micro uppercase tracking-wider font-semibold">Competitor Reviews</p>
              <h3 className="text-text-metric text-h1 font-numeric font-bold mt-0.5 leading-none">
                {dataQuality.totalReviews.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Competitor Brands Card */}
          <div className="bg-bg-elevated p-cardPadding rounded-lg border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-bg-secondary border border-border-subtle flex items-center justify-center">
              <Layers className="w-6 h-6 text-accent-secondary" />
            </div>
            <div>
              <p className="text-text-tertiary text-micro uppercase tracking-wider font-semibold">Competitors Monitored</p>
              <h3 className="text-text-metric text-h1 font-numeric font-bold mt-0.5 leading-none">
                15 Brands
              </h3>
            </div>
          </div>

          {/* Top Unmet Need Opportunity Score Card */}
          <div className="bg-bg-elevated p-cardPadding rounded-lg border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-bg-secondary border border-border-subtle flex items-center justify-center">
              <Zap className="w-6 h-6 text-success-primary" />
            </div>
            <div>
              <p className="text-text-tertiary text-micro uppercase tracking-wider font-semibold">Max Opportunity Score</p>
              <h3 className="text-text-metric text-h1 font-numeric font-bold mt-0.5 leading-none">
                {rankedNeeds[0]?.score ? rankedNeeds[0].score.toFixed(3) : '0.000'}
              </h3>
            </div>
          </div>

          {/* Average Verified Purchase Card */}
          <div className="bg-bg-elevated p-cardPadding rounded-lg border border-border-primary shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-md bg-bg-secondary border border-border-subtle flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-info-primary" />
            </div>
            <div>
              <p className="text-text-tertiary text-micro uppercase tracking-wider font-semibold">Purchase Verification</p>
              <h3 className="text-text-metric text-h1 font-numeric font-bold mt-0.5 leading-none">
                {dataQuality.verifiedPct}%
              </h3>
            </div>
          </div>
        </section>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-border-primary gap-6 text-caption">
          <button
            onClick={() => setActiveTab('rankings')}
            className={`pb-4 px-2 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'rankings'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-interactive'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Opportunity Rankings
          </button>
          
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-4 px-2 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'matrix'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-interactive'
            }`}
          >
            <Grid className="w-4 h-4" />
            Competitor Vulnerability Matrix
          </button>
          
          <button
            onClick={() => setActiveTab('trends')}
            className={`pb-4 px-2 font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'trends'
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-interactive'
            }`}
          >
            <Activity className="w-4 h-4" />
            Temporal Trends
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex flex-col gap-8">
          
          {/* TAB 1: RANKINGS */}
          {activeTab === 'rankings' && (
            <>
              {/* Sliders pinned below tab bar */}
              <WeightSliders
                weights={activeWeights}
                onChange={handleWeightChange}
                onReset={handleResetWeights}
              />
              
              {/* Top Unmet Needs Table */}
              <RankingTable
                rankedNeeds={rankedNeeds}
                onSelectNeed={handleSelectNeed}
                selectedNeedName={selectedNeed}
              />

              {/* Review Drill Down Drawer/Panel */}
              {selectedNeed && (
                <div id="drill-down" className="transition-all duration-240 scroll-mt-24">
                  <DrillDown
                    needName={selectedNeed}
                    reviews={reviews}
                    onClose={() => setSelectedNeed(null)}
                  />
                </div>
              )}
            </>
          )}

          {/* TAB 2: COMPETITOR MATRIX */}
          {activeTab === 'matrix' && (
            <CompetitorMatrix reviews={reviews} topNeeds={topNeedNames} />
          )}

          {/* TAB 3: TEMPORAL TRENDS */}
          {activeTab === 'trends' && (
            <TrendChart reviews={reviews} topNeeds={topNeedNames} />
          )}

          {/* Global Data Quality panel (trust metric) */}
          <DataQualityBar qualityData={dataQuality} />
          
        </div>
      </main>

      {/* Modern, clean footer */}
      <footer className="bg-bg-elevated border-t border-border-primary py-8 px-6 text-center text-micro text-text-tertiary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <span>
            Consumer Need-Gap Finder • Executive Business Intelligence Portal
          </span>
          <div className="flex items-center justify-center gap-4">
            <span className="font-semibold text-text-secondary">Methodology:</span>
            <span>Opportunity Score normalizes frequency, verified ratio, sentiment ratings and brand breadth on initial load using locked baseline weights.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
