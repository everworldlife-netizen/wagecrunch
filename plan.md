# WageCrunch Bug Fix Round 2 — Plan

## Current State
- Site live with 284 occupations, 197 cities
- Multiple correctness, copy, data, and UI bugs identified by user QA
- Codebase at `/mnt/agents/output/app` (master branch)

## Stage 1 — Setup (Main Agent)
1. Create 3 branches from master: `calc-fixes`, `copy-data-fixes`, `ui-data-fixes`
2. Setup 3 worktrees
3. Write plan.md

## Stage 2 — Parallel Bug Fix Agents

### Agent 1: CalcFixer (calc-fixes branch)
**Files**: `src/hooks/useCalculator.ts`, `src/pages/Calculator.tsx`
**Bugs**:
- BUG-1: Stray code at Calculator.tsx:96-100 causing potential runtime issue; verify debt wiring works end-to-end
- BUG-2: Job title selection → auto-fill salary with job.medianSalary + show helper text
- BUG-3: Fix ranking display: "Top {100-P}%" / "Better than {P}% of cities"
- BUG-4: Add tax breakdown tooltip (Federal | FICA | State) to Effective Tax Rate card
- BUG-5: Salary clamp feedback — show "Max $300K" badge when clamped, accept typed value above 300K but show indicator
- BUG-7: Remove duplicate "Update Results" button (keep mobile sticky only on mobile)
- Fix `Results.tsx` share URL to include all params correctly

### Agent 2: CopyDataFixer (copy-data-fixes branch)
**Files**: `src/pages/Home.tsx`, `src/pages/About.tsx`, `src/pages/Methodology.tsx`, `src/components/Footer.tsx`, `src/components/Navbar.tsx`
**Bugs**:
- COPY-1: Fix COL card phrasing on Home results: "Your $100K in SF has buying power of $75,529 nationally"
- COPY-2: Fix insight threshold language in useCalculator.ts (already handled by CalcAgent, verify)
- COPY-3: About stats → 197 cities, 284 occupations
- COPY-4: Methodology stale roadmap → update to current coverage
- COPY-5: Navbar "Jobs" → "Occupations"
- COPY-6: Footer Terms/Privacy links → real routes (not #), remove fake email, remove "Built with public data"
- DATA-1: Normalize city dropdown labels (full state names everywhere)
- Remove all remaining "public data" mentions on Home trust pill

### Agent 3: DataUIFixer (ui-data-fixes branch)
**Files**: `src/data/cities.ts`, `src/pages/Jobs.tsx`, `src/components/StatusPill.tsx`, `src/index.css`
**Bugs**:
- DATA-2: Sort cities alphabetically by state, then city (fix Newark, DE orphaned)
- DATA-3: Verify all 197 cities have required fields
- BUG-6: Hero H1 invisible — add inline color fallback + font-display
- BUG-8: Jobs table truncation → full title on desktop ≥1024px, tooltip on mobile
- POL-1: StatusPill add icon (✓ / ! / ✕) alongside text for colorblind users
- Verify city shortName format consistency

## Stage 3 — Merge, Build, Deploy (Main Agent)
1. Create `final-build-v2` branch
2. Setup worktree
3. Merge all 3 fix branches
4. Wire any cross-file changes
5. Build: `npm run build`
6. Copy dist, deploy

## Cross-Agent Coordination
- CalcAgent owns useCalculator.ts exclusively
- CopyDataFixer reads useCalculator.ts for insight copy but doesn't modify it
- DataUIFixer owns cities.ts and StatusPill.tsx exclusively
- All agents avoid modifying App.tsx, Layout.tsx, shared CSS (except DataUIFixer for index.css)
