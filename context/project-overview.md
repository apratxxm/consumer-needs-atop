# project-overview.md — Consumer Need-Gap Finder

---

## Overview

The Consumer Need-Gap Finder is a client-side React web application that fetches 6,000 competitor product reviews from the Mosaic Fellowship API, aggregates them by unmet need tag, and ranks each need by an opportunity score calculated from four weighted signals: sentiment (35%), frequency (25%), validation (25%), and breadth (15%). The CPO of a D2C wellness company opens the dashboard, sees the top-ranked unmet needs immediately, drills into supporting reviews to verify the signal, adjusts the weighting formula via on-page sliders to pressure-test the ranking, and leaves with one data-backed product recommendation — all within ten minutes and without any login, backend, or manual spreadsheet work.

---

## Goals

1. Rank every unmet need tag in the dataset by a defensible, transparent opportunity score so the CPO can recommend one product to build next and justify that recommendation to the board.
2. Load the full ranked dashboard in under 4 seconds on a cached visit and under 8 seconds on a cold visit (no prior cache), on a standard 4G connection.
3. Allow the CPO to drill into any ranked need and read the actual review text that produced the score, so the ranking is verifiable — not a black box.
4. Expose four weight sliders (sentiment, frequency, validation, breadth) that re-rank all needs in real time when adjusted, so the CPO can test whether the recommendation holds under different assumptions.
5. Surface a competitor vulnerability matrix showing which brands are most exposed to which needs, enabling the CPO to identify which competitor's customers are easiest to poach.
6. Show temporal trends for the top 5 needs over the 11-month review window (Jan–Nov 2025) so the CPO can distinguish emerging pain points from declining ones.
7. Deploy a production-quality, publicly accessible app on Vercel with zero login, zero backend, and zero downtime — meeting Mosaic Fellowship submission requirements exactly.

---

## Core User Flow (Step by Step)

### Step 1: First Visit — Data Load
- User opens the Vercel URL in a browser.
- App checks `localStorage` for a cached review dataset (`ngf_reviews_v1`).
- Cache is absent or stale (>24 hours): `LoadingProgress` component renders.
- App fetches all 60 pages of the Mosaic API sequentially (`?page=1&limit=100` through `?page=60&limit=100`), updating the progress bar after each page ("Loading reviews: 14 / 60").
- On completion, full 6,000-review array is written to `localStorage` with a timestamp.
- App proceeds to Step 2.

### Step 2: Dashboard Renders
- `useRankings` hook aggregates all reviews into a `needStats` map and calculates opportunity scores using `DEFAULT_WEIGHTS` (`sentiment: 0.35, frequency: 0.25, validation: 0.25, breadth: 0.15`).
- `RankingTable` renders the top 10 unmet needs sorted by score descending.
- Each row shows: Rank, Need label, Opportunity Score, Mention Count, Avg Rating, Avg Helpful Votes, Brands Affected, Verified Purchase %.
- `WeightSliders` panel renders below the table header, showing four sliders locked to default values with a visible "Reset to defaults" button.
- Three tabs are visible at the top: **Rankings** (active) | **Competitor Matrix** | **Trends**.

### Step 3: CPO Reads the Ranking
- CPO scans the top 5 needs in under 1 minute.
- CPO notes the #1 need: label, score, supporting metrics, and verified purchase ratio.
- Decision point: "Does this look right? Do I trust this?"

### Step 4: CPO Drills Into a Need (Optional but Expected)
- CPO clicks "View reviews" on the #1 ranked need.
- `DrillDown` panel opens below the table row (or as a side sheet).
- Shows all reviews mentioning that need, each with: Brand, Rating, Helpful Votes, Verified Purchase badge, Platform, Review Text.
- CPO can sort the list by Rating (low to high) or Helpful Votes (high to low).
- CPO can filter by: Verified Purchase only, specific Brand, specific Rating range.
- CPO reads 5–10 reviews, confirms the need is real and the tags are accurate.
- Decision point: "Yeah, customers are genuinely frustrated. This is actionable."

### Step 5: CPO Pressure-Tests the Ranking with Sliders
- CPO increases the Frequency slider from 25% to 45%.
- Remaining sliders redistribute proportionally to keep the total at 100%.
- `useRankings` immediately recalculates scores and re-sorts the table.
- CPO observes: does the #1 need hold its position, or does it drop?
- If #1 holds → recommendation is robust across weighting assumptions.
- If #1 drops → CPO notes the sensitivity and factors it into their confidence level.
- CPO clicks "Reset to defaults" to return to the baseline ranking.

### Step 6: CPO Views Competitor Matrix (Optional)
- CPO clicks the **Competitor Matrix** tab.
- Heatmap renders: 15 brands as rows, top 10 needs as columns.
- Cell colour intensity = number of reviews from that brand mentioning that need.
- CPO identifies: "WOW Skin Science has high density on allergen_labeling and packaging_sustainability. Pilgrim is nearly clean."
- Insight: "We capture WOW's frustrated customers by solving both their top pain points."

### Step 7: CPO Views Temporal Trends (Optional)
- CPO clicks the **Trends** tab.
- Line chart renders: x-axis = month (Jan–Nov 2025), y-axis = mention count, one line per top-5 need.
- CPO identifies: which needs are accelerating, which are plateauing, which are declining.
- Insight: "allergen_labeling is trending up. packaging_sustainability peaked in March and is cooling. We should prioritise allergen."

### Step 8: CPO Makes the Decision
- CPO returns to **Rankings** tab.
- CPO has enough evidence to walk into a board meeting and say:
  "The data shows allergen labeling is the #1 unmet need across 9 of 15 competitors. It appears in 412 reviews with an average rating of 1.8 and 67 average helpful votes. 70% of those reviews are verified purchases. This is not noise. We build the ingredient transparency tool next quarter."
- Total time from page load to decision: under 10 minutes.

---

## Features by Category

### Ranking Engine
- **Opportunity Score:** Calculated per need as `(frequency_pct × w1) + (sentiment_signal × w2) + (validation_signal × w3) + (breadth_signal × w4)` where sentiment_signal = `(5 - avg_rating) / 5` and all four signals are normalised to [0, 1].
- **Default Weights:** `sentiment: 0.35, frequency: 0.25, validation: 0.25, breadth: 0.15` — exported as `DEFAULT_WEIGHTS` constant; never modified in code.
- **Dynamic Re-ranking:** When slider weights change, `useRankings` recalculates all scores and re-sorts the table within one render cycle (<100ms).
- **Tie-breaking:** Ties in opportunity score broken by average helpful votes descending.

### Weight Sliders
- **Four Range Inputs:** Sentiment, Frequency, Validation, Breadth — rendered as labelled sliders in `WeightSliders.jsx`.
- **Sum Enforcement:** Weights always sum to exactly 1.0. Increasing one slider proportionally decreases the other three. No weight may fall below 5% or exceed 70%.
- **Live Total Display:** Current weight total shown numerically (e.g., "Total: 100%"). Turns red if rounding drift occurs before correction.
- **Reset Button:** "Reset to defaults" instantly restores `DEFAULT_WEIGHTS`. Always visible.
- **No Persistence:** Slider state is session-only React state in `App.jsx`. Resets on page reload.

### Review Drill-Down
- **Trigger:** Click "View N reviews" on any ranked need row.
- **Display:** Full list of reviews mentioning that need with columns: Brand, Rating (star display), Helpful Votes, Verified badge, Platform, Review Text.
- **Sorting:** By Rating (asc/desc), Helpful Votes (desc).
- **Filtering:** By verified purchase status, brand (multi-select), rating range.
- **Text display:** Full review text shown inline — no truncation.

### Competitor Vulnerability Matrix
- **Layout:** Heatmap table, 15 brands (rows) × top 10 needs (columns).
- **Cell value:** Number of reviews from that brand mentioning that need.
- **Cell colour:** Single-hue scale (light → dark) proportional to cell value; zero cells are empty/white.
- **Interactivity:** Hover on any cell shows tooltip: "Brand X — 24 reviews mentioning allergen_labeling, avg rating 1.6."
- **Sorting:** Brands sortable by total complaint density (most exposed at top by default).

### Temporal Trend Chart
- **Chart type:** Line chart (Recharts).
- **X-axis:** Month labels (Jan 2025 – Nov 2025).
- **Y-axis:** Raw mention count per month.
- **Series:** Top 5 needs by default score, each a separate line with a distinct colour.
- **Legend:** Clickable — toggle individual need lines on/off.
- **Insight label:** Annotate the steepest upward trend with a small label: "↑ Accelerating."

### Data Quality Panel
- **Rating distribution:** Pie or bar chart showing % of all reviews at each star rating (1–5).
- **Verified purchase ratio:** Overall dataset % of verified vs. unverified reviews.
- **Zero-need reviews:** Count and % of reviews with no unmet needs tagged — shown as a limitation caveat.
- **Tag confidence note:** Static text: "Unmet need tags are LLM-generated from review text. Top-3 needs manually verified against review text; tag accuracy: reported in write-up."

### Data Fetching and Caching
- **Pagination:** Fetches pages 1–60 sequentially; each page is 100 rows.
- **Progress bar:** Shows "Loading reviews: N / 60 pages" during cold fetch.
- **Retry logic:** On page fetch failure, retries up to 3 times with 1-second delay before marking that page as failed and continuing.
- **Cache key:** `ngf_reviews_v1` in `localStorage`. Cache considered stale after 24 hours (`ngf_reviews_fetched_at` timestamp).
- **Cache hit:** Second visit skips all fetching; data loads from cache; banner reads "Data loaded from cache (updated X hours ago)."
- **Partial fetch guard:** Rankings only render after all 60 pages are confirmed fetched. No partial results displayed.

### UI Shell (shadcn/ui + Tailwind CSS)
- **Component library:** shadcn/ui for all interactive elements — Tabs, Table, Slider, Badge, Tooltip, Sheet (drill-down panel), Button, Progress.
- **Styling:** Tailwind CSS utility classes. Custom CSS variables for brand colour tokens.
- **Layout:** Three-tab shell (Rankings | Competitor Matrix | Trends). Sliders panel pinned below tab bar on Rankings tab.
- **Responsive:** Desktop (1200px+) and tablet (768px+). Mobile is out of scope.
- **Theme:** Light mode only. Dark mode is out of scope.

---

## In Scope

- Fetching all 6,000 reviews from the Mosaic API with pagination, retry handling, and progress display.
- Aggregating reviews into a per-need stats map (frequency, avg rating, avg helpful votes, unique brands, verified purchase ratio).
- Calculating opportunity scores using the locked `DEFAULT_WEIGHTS` formula.
- Ranked table showing top 10 needs with all key metrics visible per row.
- Weight sliders (`WeightSliders.jsx`) with real-time re-ranking, sum enforcement, floor/ceiling constraints, and reset functionality.
- Review drill-down panel with filtering and sorting for any selected need.
- Competitor vulnerability matrix (heatmap) for 15 brands × top 10 needs.
- Temporal trend line chart for top 5 needs across 11 months.
- Data quality panel showing rating distribution, verified purchase ratio, zero-need review count.
- `localStorage` caching of the full 6,000-review dataset with 24-hour staleness check.
- shadcn/ui component library for all interactive UI elements.
- Tailwind CSS for layout and spacing.
- Deployment to Vercel as a static site with a public URL and no login.
- Public GitHub repository with clean folder structure, commented code, and a README with local setup instructions.
- Loom video (3–5 minutes, on camera) walking through the dashboard, explaining the ranking logic, and presenting a discovered insight.
- 500-word write-up covering approach, findings, validation, recommendation, and next steps.

---

## Out of Scope

- **Backend or server:** No Node/Express/Python server. No database. No API routes. All computation is client-side.
- **User authentication:** No login, no accounts, no sessions tied to a user identity.
- **Sentiment analysis model:** We use review ratings (1–5) as the sentiment signal. No NLP classifier is built or called.
- **Predictive modelling:** We do not forecast revenue, adoption rate, or market size for any need.
- **Re-clustering of need tags:** We rank the pre-existing tags as-is. We do not group `allergen_labeling`, `ingredient_transparency`, and `gluten_free_certification` into a single bucket.
- **Customer segmentation:** We identify company-wide need gaps. We do not split findings by persona, age group, gender, or purchasing tier.
- **Competitor strategy analysis:** We identify which brands are most exposed to which needs. We do not explain why those gaps exist.
- **Multi-year product roadmap:** We recommend one product to build next. We do not produce a Q1/Q2/Q3 roadmap.
- **Pricing or monetisation strategy:** We identify market demand, not price points.
- **Go-to-market planning:** We do not design campaigns, channels, or launch messaging.
- **Real-time review monitoring:** The dashboard analyses a static snapshot of 6,000 reviews. It does not poll for new reviews or auto-refresh.
- **Export or reporting:** Users cannot download a PDF or CSV of results from within the app.
- **Dark mode:** Light mode only.
- **Mobile layout:** The app is designed for desktop (1200px+) and tablet (768px+). Mobile viewports are not supported.
- **Multi-language support:** English only. No Hindi, Tamil, or other language variants.
- **Duplicate need detection:** We do not programmatically merge similar tags. Each tag is treated as a distinct need.
- **Manual tag correction:** We do not override or modify any LLM-generated `detected_unmet_needs` values.

---

## Success Criteria

### Data Pipeline
- [ ] All 6,000 reviews are fetched across 60 paginated API requests with no skipped pages.
- [ ] If a page request fails, the app retries up to 3 times before continuing; failed pages are logged to the console and noted in the UI.
- [ ] The full review array is written to `localStorage` under key `ngf_reviews_v1` with a timestamp after every successful cold fetch.
- [ ] On a cached visit, the app renders the ranked dashboard without making any API requests.
- [ ] Dashboard does not show the ranked table until all 60 pages are confirmed fetched.

### Ranking and Scoring
- [ ] Running `calculateScore(need, DEFAULT_WEIGHTS)` twice on the same input produces the same result (deterministic).
- [ ] Changing slider weights causes the ranking table to re-sort within one render cycle, with no page reload.
- [ ] Clicking "Reset to defaults" restores all four sliders to `DEFAULT_WEIGHTS` values exactly (`sentiment: 0.35, frequency: 0.25, validation: 0.25, breadth: 0.15`).
- [ ] At no point during slider interaction does the sum of the four weights deviate from 1.0 by more than 0.001.
- [ ] Top 3 ranked needs pass a manual spot-check: developer reads 5 actual reviews per need and confirms tag accuracy is ≥80%.

### UI and Interaction
- [ ] Rankings tab, Competitor Matrix tab, and Trends tab all render without JavaScript errors.
- [ ] Clicking "View N reviews" on any ranked need opens the drill-down panel showing exactly the reviews tagged with that need.
- [ ] Drill-down sort by Rating and sort by Helpful Votes both produce correctly ordered lists.
- [ ] Competitor matrix renders all 15 brands × top 10 needs with correct cell values matching the aggregation in `matrix.js`.
- [ ] Trend chart renders 11 monthly data points per line for top 5 needs; lines reflect the same underlying data as the ranking table.
- [ ] Data quality panel shows correct rating distribution percentages that sum to 100%.
- [ ] All shadcn/ui interactive elements (sliders, tabs, tooltips, badges) function correctly with no console warnings.

### Performance
- [ ] Cold load (no cache, standard 4G): full dataset fetched and dashboard rendered in under 8 seconds.
- [ ] Cached load: dashboard rendered in under 2 seconds.
- [ ] Slider re-ranking (recalculating scores for all needs): completes in under 100ms.
- [ ] Zero JavaScript console errors on page load in Chrome DevTools.

### Deployment
- [ ] App is deployed to Vercel at a public URL with no login required.
- [ ] GitHub repository is public, contains clean folder structure matching `src/` layout in `architecture.md`, and has a README with `npm install` and `npm run dev` instructions.
- [ ] Vercel deployment reflects the latest `main` branch commit.

### Submission Deliverables
- [ ] Loom video is 3–5 minutes long, records the developer on camera for the full duration, walks through the live dashboard, explains the scoring formula and weighting logic, and presents at least one non-obvious insight discovered in the data.
- [ ] Write-up is under 500 words, covers approach (with reasoning for weight choices), findings (specific numbers for top 3 needs), validation method, one concrete product recommendation, and next steps.
- [ ] Both the Loom video and write-up reference the same #1 ranked need and the same supporting metrics as the deployed dashboard.

---

## UI Stack Decision Note

The application uses **shadcn/ui** as the component library on top of **Tailwind CSS**. shadcn/ui components are copied directly into `src/components/ui/` at init time — they are not a runtime dependency. This means:

- All interactive primitives (Slider, Tabs, Table, Badge, Tooltip, Sheet, Button, Progress) come from shadcn/ui.
- Tailwind handles all layout, spacing, and colour tokens.
- No other component library (MUI, Chakra, Ant Design) is used. If a needed component does not exist in shadcn/ui, it is built from scratch with Tailwind only.
- The Vite + React + Tailwind + shadcn/ui scaffold is the baseline. No CSS Modules, no styled-components, no Sass.

---

*Last updated: pre-build. Changes to goals, flows, or success criteria must be reflected in `architecture.md` invariants before any code is written.*
