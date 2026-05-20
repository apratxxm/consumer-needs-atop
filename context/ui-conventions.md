# UI Design Token System — Consumer Need-Gap Finder

## Color Token System

### Core Foundation Tokens

| Token | Hex | Purpose |
|--------|-----|----------|
| `background.primary` | `#FAFBFC` | Main app background |
| `background.secondary` | `#F4F6F8` | Section separation, alternate surfaces |
| `background.elevated` | `#FFFFFF` | Cards, panels, sheets, tables |
| `background.hover` | `#F7F9FB` | Subtle hover state |
| `background.active` | `#EEF4FF` | Selected rows, active states |
| `background.subtle` | `#F8FAFC` | Low-emphasis containers |

| Token | Hex | Purpose |
|--------|-----|----------|
| `surface.card` | `#FFFFFF` | KPI cards, ranking containers |
| `surface.panel` | `#FCFCFD` | Secondary panels |
| `surface.overlay` | `#FFFFFF` | Modal/sheet backgrounds |
| `surface.tooltip` | `#111827` | Tooltip background |
| `surface.input` | `#FFFFFF` | Inputs, filters |

---

### Border Tokens

| Token | Hex | Purpose |
|--------|-----|----------|
| `border.primary` | `#E6EAF0` | Primary card/table borders |
| `border.secondary` | `#EEF2F6` | Soft separators |
| `border.subtle` | `#F4F6F8` | Minimal dividers |
| `border.focus` | `#CBD9FF` | Focus ring border |
| `border.interactive` | `#D8E3F8` | Inputs, controls |

---

### Typography Color Tokens

| Token | Hex | Purpose |
|--------|-----|----------|
| `text.primary` | `#111827` | Headlines, critical metrics |
| `text.secondary` | `#4B5563` | Supporting information |
| `text.tertiary` | `#6B7280` | Labels, metadata |
| `text.subtle` | `#94A3B8` | Disabled/low-priority text |
| `text.inverse` | `#FFFFFF` | Text on dark surfaces |
| `text.link` | `#2D5BFF` | Interactive links |
| `text.metric` | `#0F172A` | KPI numbers, percentages |

---

### Accent & Business Intelligence Colors

These should be used sparingly.

| Token | Hex | Purpose |
|--------|-----|----------|
| `accent.primary` | `#2D5BFF` | Main interactive accent |
| `accent.primary.hover` | `#1F4AE0` | Hover state |
| `accent.primary.subtle` | `#EEF4FF` | Selected tabs, slider fills |
| `accent.secondary` | `#5B7CFA` | Secondary emphasis |
| `accent.focusRing` | `#BFD1FF` | Keyboard focus |

---

### Status / Semantic Colors

#### Positive / Opportunity

| Token | Hex | Purpose |
|--------|-----|----------|
| `success.primary` | `#15803D` | Positive signal |
| `success.subtle` | `#ECFDF3` | Positive background |
| `success.border` | `#BBF7D0` | Positive badge border |

#### Warning / Risk

| Token | Hex | Purpose |
|--------|-----|----------|
| `warning.primary` | `#B45309` | Risk indicators |
| `warning.subtle` | `#FFF7ED` | Warning surface |
| `warning.border` | `#FED7AA` | Warning border |

#### Critical / Negative

| Token | Hex | Purpose |
|--------|-----|----------|
| `danger.primary` | `#B42318` | Critical business issue |
| `danger.subtle` | `#FEF3F2` | Error surface |
| `danger.border` | `#FECACA` | Error border |

#### Informational

| Token | Hex | Purpose |
|--------|-----|----------|
| `info.primary` | `#2563EB` | Informational states |
| `info.subtle` | `#EFF6FF` | Info surface |
| `info.border` | `#BFDBFE` | Info border |

---

### Data Visualization Tokens

Executive dashboards require restrained, non-aggressive charts.

| Token | Hex | Purpose |
|--------|-----|----------|
| `chart.blue` | `#4C6FFF` | Primary trend |
| `chart.green` | `#0F9D58` | Positive growth |
| `chart.amber` | `#C0841A` | Emerging concern |
| `chart.red` | `#D14343` | Declining performance |
| `chart.purple` | `#7C6BF2` | Comparative metric |
| `chart.teal` | `#0F766E` | Secondary signal |
| `chart.grid` | `#E8EDF3` | Grid lines |
| `chart.axis` | `#64748B` | Axis labels |
| `chart.tooltipBg` | `#111827` | Chart tooltip background |

---

### Heatmap Tokens (Competitor Matrix)

| Token | Hex | Purpose |
|--------|-----|----------|
| `heatmap.0` | `#FFFFFF` | No signal |
| `heatmap.1` | `#EEF4FF` | Very low |
| `heatmap.2` | `#D9E5FF` | Low |
| `heatmap.3` | `#B9CCFF` | Moderate |
| `heatmap.4` | `#7EA3FF` | High |
| `heatmap.5` | `#2D5BFF` | Critical concentration |

---

### Table Tokens

| Token | Hex | Purpose |
|--------|-----|----------|
| `table.headerBg` | `#F8FAFC` | Table headers |
| `table.rowHover` | `#F7F9FB` | Hover row |
| `table.rowSelected` | `#EEF4FF` | Selected row |
| `table.divider` | `#EEF2F6` | Row separators |

---

### Component State Tokens

| Token | Hex | Purpose |
|--------|-----|----------|
| `interactive.hover` | `#F7F9FB` | Hover states |
| `interactive.active` | `#EAF1FF` | Pressed state |
| `interactive.disabled` | `#CBD5E1` | Disabled controls |
| `interactive.focus` | `#BFD1FF` | Focus ring |

---

## Typography System

| Token | Recommendation | Purpose |
|--------|----------------|----------|
| `font.primary` | Inter | Primary UI font |
| `font.numeric` | Inter Tight | Metrics, KPIs, percentages |
| `font.fallback` | ui-sans-serif, system-ui, sans-serif | Reliability |

### Type Scale

| Token | Size | Weight | Usage |
|--------|------|--------|--------|
| `text.display` | `32px` | `600` | Major page heading |
| `text.h1` | `24px` | `600` | Dashboard sections |
| `text.h2` | `20px` | `600` | Card titles |
| `text.h3` | `18px` | `500` | Secondary headings |
| `text.bodyLg` | `16px` | `400` | Main readable content |
| `text.body` | `14px` | `400` | Standard UI text |
| `text.caption` | `13px` | `400` | Labels, metadata |
| `text.micro` | `12px` | `500` | Badges, helper text |
| `text.metric` | `32px` | `700` | KPI values |
| `text.metricSm` | `20px` | `600` | Table metrics |

### Typography Principles

| Rule | Decision |
|------|----------|
| Heading hierarchy | Use spacing + weight over drastic size jumps |
| Numeric emphasis | KPIs should visually dominate through weight |
| Line height | 140–150% for readability |
| Letter spacing | Slight negative tracking on large metrics (`-0.02em`) |
| Table readability | Prefer `14px–15px` body size |

---

## Border Radius Scale

Restrained and professional — never playful.

| Token | Value | Usage |
|--------|-------|--------|
| `radius.none` | `0px` | Heatmap edges |
| `radius.sm` | `6px` | Inputs, badges |
| `radius.md` | `10px` | Buttons |
| `radius.lg` | `14px` | Cards |
| `radius.xl` | `18px` | Sheets, drilldown panels |
| `radius.2xl` | `24px` | Rare/high-level containers only |

---

## Shadow System

Soft depth only.

| Token | Value | Usage |
|--------|-------|--------|
| `shadow.sm` | `0 1px 2px rgba(15,23,42,0.04)` | Inputs |
| `shadow.md` | `0 4px 12px rgba(15,23,42,0.06)` | Cards |
| `shadow.lg` | `0 10px 30px rgba(15,23,42,0.08)` | Sheets, overlays |

---

## Motion System

| Token | Value |
|--------|--------|
| `motion.fast` | `120ms ease-out` |
| `motion.default` | `180ms ease-out` |
| `motion.slow` | `240ms ease-out` |

### Motion Principles
- Motion should clarify state changes only
- Hover transitions should feel immediate
- Avoid dramatic animations or spring-heavy motion
- Charts should animate subtly and quickly

---

## Layout Rhythm

| Token | Value |
|--------|--------|
| `space.sectionGap` | `32px` |
| `space.cardPadding` | `20px` |
| `space.panelPadding` | `24px` |
| `space.gridGap` | `20px` |
| `space.tableRowHeight` | `56px` |

---

## Design Principles (Non-Negotiable)

1. Prioritize clarity over visual personality.
2. Every visual decision must improve decision-making speed.
3. Accent color is for meaning, never decoration.
4. Tables, rankings, and metrics are first-class citizens.
5. Contrast should feel premium and soft, not harsh.
6. Surfaces should separate through spacing and depth, not heavy borders.
7. Interfaces should feel trustworthy, analytical, and executive-grade.