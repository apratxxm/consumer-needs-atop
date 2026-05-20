# architecture.md — Consumer Need-Gap Finder

---

## Stack Table

| Layer | Technology | Role |
|-------|------------|------|
| UI Framework | React 18 (Vite) | Component rendering, state management, routing |
| Styling | Tailwind CSS | Utility-first layout, responsive grid, color tokens |
| Weight Sliders | Custom `WeightSliders.jsx` component | Four range inputs (sentiment, frequency, validation, breadth) that enforce sum = 1.0 and expose a Reset button; weight state lives in `App.jsx` and flows down as props |
| Data Fetching | Native `fetch` API + async/await | Paginated requests to Mosaic API (60 pages × 100 rows) |
| Data Processing | Pure JavaScript (client-side) | Aggregation, opportunity score calculation, need ranking |
| Caching | `localStorage` | Persists 6,000 fetched reviews between sessions |
| Charting | Recharts | Temporal trend line chart, competitor matrix heatmap |
| Deployment | Vercel (static site) | Hosts the built React app; zero backend, zero server cost |
| Version Control | GitHub (public repo) | Source of truth for all code; reviewed by Mosaic evaluators |

---

## System Boundaries

```
src/
├── api/
│   └── fetchReviews.js       # All Mosaic API communication lives here.
│                               Handles pagination, retries, and progress callbacks.
│                               Nothing outside this folder makes direct fetch() calls.
│
├── engine/
│   └── score.js              # Opportunity score formula and all ranking logic.
│                               Accepts a weights object as a parameter — never reads
│                               weights from state, props, or any external source.
│                               Exports DEFAULT_WEIGHTS as a named constant.
│   └── aggregate.js          # Builds needStats map from raw review array.
│   └── trend.js              # Groups reviews by month for temporal analysis.
│   └── matrix.js             # Builds brand × need matrix for competitor view.
│                               No UI imports allowed here. Pure functions only.
│
├── cache/
│   └── storage.js            # All localStorage reads and writes.
│                               No component touches localStorage directly.
│
├── components/
│   ├── ui/                   # shadcn/ui components (Slider, Tabs, Table, Badge, Tooltip, Sheet, Button, Progress)
│   └── RankingTable.jsx      # Top-N ranked needs table with sort controls.
│   └── DrillDown.jsx         # Filtered review list for a selected need.
│   └── CompetitorMatrix.jsx  # Heatmap of brand × need complaint density.
│   └── TrendChart.jsx        # Line chart of top 5 needs over time.
│   └── DataQualityBar.jsx    # Shows rating distribution + verified purchase %.
│   └── LoadingProgress.jsx   # Displays page fetch progress (e.g. "12 / 60").
│   └── WeightSliders.jsx     # Four sliders (sentiment, frequency, validation, breadth).
│                               Enforces weights sum to exactly 1.0 at all times.
│                               Exposes a "Reset to defaults" button.
│                               Never calls score.js directly — emits weight changes
│                               upward via callback; parent owns weight state.
│
├── hooks/
│   └── useReviews.js         # Fetches reviews, writes cache, exposes loading state.
│   └── useRankings.js        # Derives ranked needs from raw review array.
│                               Accepts activeWeights as an argument.
│                               Re-ranks instantly when weights change.
│                               Returns both rankedNeeds and the activeWeights used,
│                               so the UI can always show which weights produced
│                               the current ranking.
│
└── App.jsx                   # Root layout. Composes tabs: Rankings | Matrix | Trends.
```

**Rule:** `engine/` functions receive plain data arrays and return plain data arrays. They never import React, never read from localStorage, and never call `fetch`. They are independently testable.

---

## Storage Model

| What | Where | Why |
|------|-------|-----|
| All 6,000 raw reviews (JSON array) | `localStorage` key: `ngf_reviews_v1` | Eliminates 60-request re-fetch on repeat visits. Stale after 24 hours (checked via `ngf_reviews_fetched_at` timestamp). |
| Fetch timestamp | `localStorage` key: `ngf_reviews_fetched_at` | ISO string. Used to decide whether cached data is fresh or must be re-fetched. |
| Active UI filters (brand, rating, verified) | React state (`useState`) | Session-only. Resets on page reload. Not persisted — no user account to save preferences to. |
| Active weight configuration (slider values) | React state (`useState`) in `App.jsx` | Session-only. Always initialises from `DEFAULT_WEIGHTS`. Resets on page reload. Never persisted — weights are exploratory, not a saved preference. |
| Derived rankings and scores | React state (computed via `useRankings`) | Calculated from raw reviews on every load. Never stored — recalculating from 6,000 rows takes <100ms. |
| Selected need (drill-down view) | React state (`useState`) | Transient UI selection. No reason to persist. |

**No database. No file storage. No server-side state of any kind.**

---

## Auth and Access Model

| Concern | Decision |
|---------|----------|
| User authentication | None. Dashboard is fully public and anonymous. |
| API key / credentials | None required. Mosaic API is open (`?page=N&limit=100`). No Authorization header. |
| Data ownership | No user data is collected. Reviews are from Mosaic's API and are read-only. |
| Access control | None. Any person with the Vercel URL can view the dashboard. |
| Rate limiting | Mosaic API has no documented rate limit. We fetch sequentially (one request at a time) to avoid hammering the endpoint. |
| Sensitive data | None stored. `localStorage` holds only the review dataset from the public API. |

---

## AI and Background Tasks

### AI: LLM-Tagged Unmet Needs (Upstream, Not Ours)

The `detected_unmet_needs` field in each review is pre-tagged, almost certainly by an LLM. This happened before our system. We consume the tags as-is.

**What we do:**
- Trust the tags as input signal
- Manually spot-check top-3 ranked needs against actual review text (documented in write-up and Loom)
- Flag tag quality limitation in the Data Quality panel

**What we do not do:**
- Re-run NLP or sentiment models on review text
- Override or correct the upstream LLM tags
- Build any ML pipeline of our own

### Background Tasks: None

There are no background jobs, cron tasks, webhooks, or server-side workers. All computation is synchronous and client-side:

1. Page loads → `useReviews` hook fires
2. Check `localStorage` for cached reviews
3. If stale or missing: fetch all 60 pages sequentially, update progress bar, write to cache
4. `useRankings` derives scored and ranked needs from raw reviews
5. Components render

Total computation time for 6,000 reviews (fetch + aggregate + score): **2–4 seconds on first load, <200ms on cached load.**

---

## Invariants

Rules the codebase must never violate. If any of these break, the application is incorrect — not just suboptimal.

---

**Invariant 1: Default weights are immutable. Slider weights are exploratory only.**

The default weight configuration is permanently fixed as:

```javascript
export const DEFAULT_WEIGHTS = {
  sentiment:  0.35,
  frequency:  0.25,
  validation: 0.25,
  breadth:    0.15,
};
```

`DEFAULT_WEIGHTS` must never be edited in code to "improve" results mid-build. It is business logic decided before code was written. Changing it invalidates the write-up, Loom script, and methodology section.

The CPO-facing weight sliders are an **exploration tool**, not a tuning mechanism. When the CPO adjusts sliders, the ranking re-calculates in real time using the new weights — but the default configuration is unchanged. Clicking "Reset to defaults" must always restore exactly `DEFAULT_WEIGHTS`. No slider session is ever persisted.

The ranking shown on initial page load must always use `DEFAULT_WEIGHTS`, never a previously explored configuration.

---

**Invariant 2: Slider weights must always sum to exactly 1.0.**

`WeightSliders.jsx` must enforce at all times that:

```
weights.sentiment + weights.frequency + weights.validation + weights.breadth === 1.0
```

When the CPO increases one slider, the remaining three decrease proportionally to compensate. No weight may fall below 0.05 (5%) or rise above 0.70 (70%). The UI must visually confirm the current total. If a rounding error causes the sum to drift from 1.0 by more than 0.001, the component must correct it before passing weights to `useRankings`. Passing weights that do not sum to 1.0 is a bug — scores become incomparable across configurations.

---

**Invariant 3: Raw reviews are never mutated.**

The 6,000-review array fetched from the API and stored in `localStorage` is read-only. No component, hook, or engine function may add, remove, or alter fields on a review object. All derived data (scores, aggregates, trend buckets) must be computed into new objects, never written back onto reviews. This ensures the cache is always a faithful copy of the source and can be safely invalidated and re-fetched.

---

**Invariant 4: `engine/` functions are pure and have no side effects.**

Every function in `src/engine/` must:
- Accept plain JavaScript values as arguments
- Return plain JavaScript values
- Make no `fetch` calls
- Read/write no `localStorage`
- Import no React hooks or components

This makes the ranking logic independently testable. If `score.js` ever imports from `react` or calls `localStorage`, it is a bug, not a design choice.

---

**Invariant 5: No ranked output is shown unless the full dataset is loaded.**

The dashboard must not display a final ranked list based on partial data (e.g., 2,500 of 6,000 reviews). Showing partial rankings would silently mislead the CPO. During the fetch phase, only the progress bar and a loading state are shown. Rankings render only after all 60 pages have been fetched and the complete array is confirmed. Cached data is exempt from this rule — a full cache is always complete by definition.

---

**Invariant 6: Verified purchase status is always surfaced alongside any ranked need.**

For every unmet need shown in the dashboard, the verified purchase ratio (e.g., "68% verified") must be displayed. The system must never present a ranked need without this signal. A need with 90% unverified reviews carries less weight than one with 90% verified reviews, and the CPO must be able to see this without digging. Hiding it — even temporarily or in a collapsed view — violates the analytical transparency principle the entire ranking is built on.

---

**Invariant 7: The competitor matrix and drill-down view must always reflect the same underlying data as the ranking table.**

All three views — ranked table, competitor matrix, drill-down review list — are derived from the same single source of truth: the cached review array in memory. There must be no separate fetch, no secondary dataset, and no hardcoded values in any of these views. If the cache is cleared and reviews are re-fetched, all three views must update consistently. Any divergence between views is a data integrity bug.

---

*Last updated: pre-build. Any change to this file requires updating the write-up and Loom script accordingly.*
