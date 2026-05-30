# Codebase Directory and Function Documentation

## Project Directory Tree

```
a:\$$$\consumer_needs_atop
├── .git/
├── .gitignore
├── README.md
├── agents.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vite.config.js
├── context/
│   ├── architecture.md
│   ├── progress-tracker.md
│   ├── project-overview.md
│   └── ui-conventions.md
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── api/
│   │   └── fetchReviews.js
│   ├── assets/
│   ├── cache/
│   │   └── storage.js
│   ├── components/
│   │   ├── CompetitorMatrix.jsx
│   │   ├── DataQualityBar.jsx
│   │   ├── DrillDown.jsx
│   │   ├── LoadingProgress.jsx
│   │   ├── RankingTable.jsx
│   │   ├── TrendChart.jsx
│   │   └── WeightSliders.jsx
│   ├── engine/
│   │   ├── aggregate.js
│   │   ├── matrix.js
│   │   ├── score.js
│   │   └── trend.js
│   └── hooks/
│       ├── useRankings.js
│       └── useReviews.js
```

---

## Folder Explanation

### `/` (Root Directory)
Contains the environment configuration files, dependency manifests, build systems, global settings, and agent instruction manuals.

### `context/`
Contains system-wide specifications, design conventions, project constraints, user guidelines, and session progress trackers.

### `src/`
Contains the React frontend source files, core components, engine computations, state hooks, and style definitions.

### `src/api/`
Houses the connection files that interface with the remote Mosaic Fellowship API endpoint, implementing page fetching and request retry loops.

### `src/cache/`
Manages the offline browser persistence layer for local storage reads, writes, and expiration validation.

### `src/components/`
Houses independent, modular UI components that present information, collect weight variables, render heatmaps and charts, and display drawer reviews.

### `src/engine/`
Contains isolated, pure calculation files which handle mathematical weighting, date parsing, data aggregation, brand matrices, and slope calculations.

### `src/hooks/`
Acts as the state management and orchestration hooks that coordinate raw review fetching, caching, and weighted opportunity calculations.

---

## File and Subfile Breakdown

### Root Files

#### `index.html`
- **Purpose**: Core HTML wrapper that defines the single-page application mount point (`#root`) and registers the module entry point (`src/main.jsx`).
- **Features**: Includes a global interceptor overlay script inside the `<head>` that catches uncaught client-side JavaScript or Promise errors and presents them as a full-screen red traceback dialog.

#### `vite.config.js`
- **Purpose**: Defines configuration properties for Vite, registering the React integration plugin (`@vitejs/plugin-react`) and the Tailwind CSS integration plugin (`@tailwindcss/vite`).

#### `package.json`
- **Purpose**: Declares workspace package dependencies, development scripts (`dev`, `build`, `preview`), and module properties. Key dependencies are React 18, Tailwind CSS v4, Lucide React, and Recharts.

#### `agents.md`
- **Purpose**: Specifies architectural constraints, locked default weights, strict folder separation rules, and design philosophies to prevent structural drift.

#### `.gitignore`
- **Purpose**: Instructs Git on which directories (such as `node_modules/`, `dist/`, and local caches) should be ignored from source control.

#### `eslint.config.js`
- **Purpose**: Defines code syntax standard rules for ECMAScript modules and React hooks compliance.

#### `README.md`
- **Purpose**: Provides quick startup instructions for building and running the development environment.

---

### Directory: `context/`

#### `project-overview.md`
- **Purpose**: Outlines features, executive goals, dataset limits (6,000 reviews across 15 brands), and CPO user flows.

#### `architecture.md`
- **Purpose**: Highlights system boundaries (UI components cannot access API/localStorage directly, engine functions must be pure) and details database invariants.

#### `ui-conventions.md`
- **Purpose**: Outlines design tokens, harmonized typography (Inter), spacing guidelines, and the Light Mode-only rule.

#### `progress-tracker.md`
- **Purpose**: Maintains an interactive task checklist tracking completed items and future milestones.

---

### Directory: `src/`

#### `main.jsx`
- **Purpose**: Single-page entry point that attaches the root React component to the HTML `#root` element inside React's StrictMode.

#### `index.css`
- **Purpose**: Imports Tailwind CSS v4 and imports the Google Fonts Inter style. Sets up local design tokens using the `@theme` directive, establishing background, border, text, success/danger status, and custom heatmap gradient color variables.

#### `App.jsx`
- **Purpose**: Main coordinator of the entire executive interface. Handles active tab state, weight slider resets, select need transitions, and aggregates the components into a consistent dashboard shell.

---

### Directory: `src/api/`

#### `fetchReviews.js`
- **Purpose**: Controls connection tasks with the external Mosaic Fellowship review endpoint.
- **Functions**:
  - `delay(ms)`: Utility returning a Promise that resolves after a specified timeout duration.
  - `fetchPageWithRetry(page, retryCount)`: Performs page requests to the server, catching errors and recursively retrying up to 3 times using exponential wait cycles.
  - `fetchAllReviews(onProgress)`: Executes sequential requests for pages 1 through 60, concatenating pages into a unified reviews array and invoking progress updates back to the hook.

---

### Directory: `src/cache/`

#### `storage.js`
- **Purpose**: Controls browser-based caching using the key `ngf_reviews_v1`.
- **Functions**:
  - `isCacheFresh(timestampStr)`: Compares cached fetch dates with current system times to determine if data is under 24 hours old.
  - `getReviewsFromCache()`: Pulls items from local storage, returning null if the data has expired or is corrupt.
  - `saveReviewsToCache(reviews)`: Serializes fetched data arrays to local storage, updating the timestamp key.
  - `clearCache()`: Purges cached reviews and metadata values.

---

### Directory: `src/engine/`

#### `score.js`
- **Purpose**: Calculates the opportunity ranking value.
- **Variables**:
  - `DEFAULT_WEIGHTS`: Frozen baseline weights containing `sentiment` (0.35), `frequency` (0.25), `validation` (0.25), and `breadth` (0.15).
- **Functions**:
  - `calculateOpportunityScore(frequencySignal, sentimentSignal, validationSignal, breadthSignal, weights)`: Combines normalized indicators [0, 1] with current slider weights, returning a four-decimal value.

#### `aggregate.js`
- **Purpose**: Transforms raw collections of customer reviews into structured metrics.
- **Functions**:
  - `parseNeedTags(review)`: Parses stringified, comma-split, or JSON arrays of unmet needs from review entries.
  - `aggregateReviews(reviews)`: Single-pass analyzer compiling star ranges, purchase verification counts, brand distributions, and mapping signals like inverse-rating pain, verified transaction indices, and unique competitor breadths.

#### `trend.js`
- **Purpose**: Calculates consumer pain changes over time.
- **Variables**:
  - `MONTH_LABELS`: Eleven month text labels covering January to November 2025.
- **Functions**:
  - `getMonthIndex(dateStr)`: Extracts Date values to determine corresponding month positions [0-10].
  - `calculateTemporalTrends(reviews)`: Collects monthly complain sums for individual unmet need tags.
  - `findSteepestTrend(trendData, targetNeeds)`: Compares early year records with late year records, returning the name of the need that has the highest upward complaint slope.

#### `matrix.js`
- **Purpose**: Groups competitor vulnerabilities.
- **Functions**:
  - `buildCompetitorMatrix(reviews, topNeeds)`: Builds brand × need arrays tracking complaint frequencies and average ratings for vulnerability matrix heatmaps.

---

### Directory: `src/hooks/`

#### `useReviews.js`
- **Purpose**: Coordinates review fetching, caching, and state progress.
- **Functions**:
  - `useReviews()`: Checks local caches, sequentially fetches the full 60-page API dataset if missing or forced, and stores the results.

#### `useRankings.js`
- **Purpose**: Connects weighted formulas with computed aggregations.
- **Functions**:
  - `useRankings(reviews, activeWeights)`: Generates opportunity scores and returns descending sorted rankings.

---

### Directory: `src/components/`

#### `WeightSliders.jsx`
- **Purpose**: Allows dynamic re-weighting of analytical indices.
- **Functions**:
  - `WeightSliders({ weights, onChange, onReset })`: Displays formula weights and inputs.
  - `handleSliderChange(changedKey, event)`: Captures slider movements, adjusting other values proportionally so that the sum remains exactly 1.0, enforcing strict [0.05, 0.70] range clamps.

#### `RankingTable.jsx`
- **Purpose**: Surfaces the primary executive table of top unmet needs.
- **Functions**:
  - `RankingTable({ rankedNeeds, onSelectNeed, selectedNeedName })`: Renders the sorted opportunity table, surfacing verified purchase ratios on every row.

#### `DrillDown.jsx`
- **Purpose**: Houses actual review details.
- **Functions**:
  - `DrillDown({ needName, reviews, onClose })`: Formats and displays individual review testimonial cards, supporting brand, rating, and verified purchase filters.

#### `CompetitorMatrix.jsx`
- **Purpose**: Premium brand vulnerability matrix heatmap.
- **Functions**:
  - `CompetitorMatrix({ reviews, topNeeds })`: Maps complaint density spreads, applying HSL blue gradients and hover description indicators.

#### `TrendChart.jsx`
- **Purpose**: Plots temporal complaint vectors.
- **Functions**:
  - `TrendChart({ reviews, topNeeds })`: Line chart rendering 11-month complaint frequencies with toggles and fastest growth alerts.

#### `DataQualityBar.jsx`
- **Purpose**: Displays system reliability panels.
- **Functions**:
  - `DataQualityBar({ qualityData })`: Visualizes review rating counts, verified purchase ratios, and tagging accuracy boundaries.

#### `LoadingProgress.jsx`
- **Purpose**: Provides visual feedback during database loading.
- **Functions**:
  - `LoadingProgress({ progress, error, onRetry })`: Displays a spinning loading bar tracking page fetching steps.
