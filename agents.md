# agents.md — Consumer Need-Gap Finder

This file defines how AI agents should operate inside this codebase.

The goal is consistency across sessions, zero architectural drift, and predictable implementation quality.

---

# Mission

Build a premium executive-facing dashboard that helps a CPO identify unmet consumer needs from 6,000 competitor product reviews and confidently decide what product to build next.

The application prioritizes:

1. Decision-making speed
2. Analytical trust
3. Transparency of ranking logic
4. Executive-grade UX
5. Zero backend complexity

This is **not** a generic SaaS dashboard.

The experience should feel:

- Calm
- Premium
- Trustworthy
- Analytical
- Executive-facing

Never optimize for flashy visuals, startup aesthetics, or visual experimentation.

---

# Source of Truth Files

Before making any implementation decision, read these files in order:

### 1. `project-overview.md`
Defines:

- Product goals
- User flow
- Features
- Scope boundaries
- Success criteria

This file defines **what must be built**.

---

### 2. `architecture.md`
Defines:

- System boundaries
- Folder structure
- Data flow
- Storage model
- Invariants

This file defines **how the system must work**.

Never violate invariants.

---

### 3. `ui-conventions.md`
Defines:

- Design tokens
- Typography
- Spacing
- Motion
- Visual language
- Dashboard aesthetics

This file defines **how the product should feel**.

Never introduce raw colors, arbitrary spacing, or visual inconsistencies.

---

### 4. `progress-tracker.md`
Defines:

- Current phase
- What is complete
- What is in progress
- What comes next
- Session context

Always resume from this file.

---

# Core Product Philosophy

The dashboard exists to answer one question:

> “What product should we build next, based on customer pain?”

Everything in the UI must reduce decision friction.

Every component must improve clarity.

If a feature adds visual complexity without improving decision speed, do not implement it.

---

# Architecture Rules (Non-Negotiable)

## 1. Client-side only

This application has:

- No backend
- No database
- No auth
- No API routes
- No server-side state

Only:

- React
- Client-side computation
- `localStorage`
- Mosaic API fetches

Do not introduce unnecessary infrastructure.

---

## 2. Respect system boundaries

Never violate folder responsibilities.

### `src/api/`
Only API communication.

Allowed:
- fetch logic
- pagination
- retry handling

Forbidden:
- UI logic
- ranking logic
- component rendering

---

### `src/engine/`
Pure business logic only.

Allowed:
- scoring
- aggregation
- trend calculations
- matrix generation

Forbidden:
- React imports
- `fetch`
- `localStorage`
- component imports
- side effects

All functions must remain pure.

---

### `src/cache/`
Only storage access.

Allowed:
- `localStorage` reads/writes
- staleness checks

Forbidden:
- UI logic
- ranking logic

---

### `src/hooks/`
Composition layer.

Responsible for:

- loading data
- caching
- deriving rankings
- exposing state

Hooks may orchestrate logic but should not contain business rules.

---

### `src/components/`
Presentation layer only.

Components must:

- remain modular
- stay reusable
- avoid business logic leakage
- receive data through props

No component should directly access API logic or storage.

---

## 3. Never mutate raw review data

The 6,000-review dataset is read-only.

Never:

- mutate review objects
- attach derived properties
- rewrite cached values

Always derive into new objects.

---

## 4. Ranking must never use partial data

The dashboard must never render rankings before:

- all 60 pages are fetched
OR
- cache is confirmed complete

Partial rankings are misleading and considered incorrect.

Loading state first.

Always.

---

## 5. Default weights are locked

The default ranking formula is frozen.

Never modify:

```js
export const DEFAULT_WEIGHTS = {
  sentiment: 0.35,
  frequency: 0.25,
  validation: 0.25,
  breadth: 0.15,
}
```

Weight sliders are exploratory only.

They are **not** optimization tools.

Changing defaults invalidates methodology.

---

## 6. Slider total must always equal 1.0

At every interaction:

```txt
sentiment + frequency + validation + breadth = 1.0
```

Constraints:

- Minimum: `0.05`
- Maximum: `0.70`

Correct rounding drift immediately.

Never pass invalid weights into ranking logic.

---

# UI Rules (Non-Negotiable)

## Design language

The UI must feel:

- Executive-grade
- Minimal
- Analytical
- Premium
- Calm

Avoid:

- Startup aesthetics
- Loud gradients
- Over-animation
- Decorative UI
- Playful visuals

This is a business intelligence product.

---

## Token system only

Never hardcode:

- colors
- spacing
- radius
- shadows
- typography

Always use design tokens.

Bad:

```jsx
bg-[#2D5BFF]
```

Good:

```jsx
bg-accent-primary
```

---

## Tables are first-class

The ranking table is the product.

Optimize for:

- readability
- scanability
- trust
- fast comparison

Avoid excessive cardification.

---

## Motion rules

Motion exists only to clarify state.

Allowed:

- subtle transitions
- hover feedback
- chart animation

Forbidden:

- spring-heavy animation
- dramatic movement
- unnecessary motion

---

## Mobile is out of scope

Only optimize for:

- Desktop (`1200px+`)
- Tablet (`768px+`)

Do not spend time on mobile UX.

---

## Light mode only

Dark mode is explicitly out of scope.

Do not implement theme switching.

---

# Implementation Workflow

Before coding:

1. Read all source-of-truth files
2. Check `progress-tracker.md`
3. Verify current phase
4. Confirm invariants
5. Identify highest-priority unfinished item

During coding:

1. Implement smallest coherent unit
2. Respect folder boundaries
3. Avoid premature abstraction
4. Reuse shadcn/ui primitives
5. Keep logic testable

After coding:

1. Verify architecture invariants
2. Check for business logic leaks
3. Ensure no raw colors or spacing
4. Update `progress-tracker.md`
5. Add meaningful notes to session log

---

# Decision Framework

When uncertain, prioritize in this order:

1. Correctness
2. Analytical clarity
3. Decision-making speed
4. Consistency with architecture
5. Visual polish

Never reverse this order.

---

# Anti-Patterns (Avoid)

Do not:

- Add backend services
- Add authentication
- Add unnecessary dependencies
- Create hidden business logic
- Duplicate derived state
- Mix fetch logic into components
- Store rankings in localStorage
- Hardcode chart values
- Render partial rankings
- Ignore invariants
- Use raw hex colors
- Overdesign UI

---

# Session Resume Protocol

At the beginning of every new session:

1. Read:
   - `project-overview.md`
   - `architecture.md`
   - `ui-conventions.md`
   - `progress-tracker.md`

2. Identify:
   - Current phase
   - Current goal
   - In-progress work
   - Highest-priority unfinished task

3. Continue from there.

Never restart architecture decisions already locked.

Never rewrite established methodology.

---

# Definition of Done

A feature is complete only if:

- Matches `project-overview.md`
- Respects `architecture.md`
- Uses `ui-conventions.md`
- Preserves invariants
- Introduces no architectural drift
- Updates `progress-tracker.md`

If any of these fail, the feature is incomplete.

---
