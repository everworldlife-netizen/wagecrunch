# WageCrunch Round 3 Bug Fix Plan

## Current State (master branch at /mnt/agents/output/app)
- cities.ts: 51 lines = 26 cities (need 197)
- jobs.ts: 54 lines = 32 jobs (need 284)
- leaderboardData.ts: 95 lines (need 434)
- cityDetailData.ts: 1144 lines (need 4225)
- jobDetailData.ts: 1099 lines (need 9420)
- Full datasets exist in git history at commit a7b3d85
- App.tsx missing routes for /terms, /privacy, /contact, /compare
- Footer.tsx has dead links (# for Terms/Privacy), fake email, agency badges
- DataStatusBar shows stale data ("1 years ago")
- BudgetDonut.tsx has percentage display bug
- Residual agency/public data mentions across 10+ files

## Agent Decomposition

### Agent A — Routes & Static Pages (`routes-pages` branch)
- Create Terms.tsx, Privacy.tsx, Contact.tsx, Compare.tsx
- Wire routes in App.tsx
- Fix Footer.tsx: real links, no fake email, no agency badges
- Fix salary 0 validation in Calculator.tsx

### Agent B — Calculator Fixes (`calc-fix` branch)
- Fix BudgetDonut.tsx percentage formula (percent * 100 double-multiply)
- Fix useCalculator.ts capped value propagation
- Fix Take-Home Ranking hardcoded value
- Fix hero FOUC in Home.tsx (initial opacity)
- Fix insight strings to use capped salary

### Agent C — Data Restoration (`data-restore` branch)
- Restore full cities.ts (197 cities) from git history + add fullName field
- Restore full jobs.ts (284 jobs) from git history
- Restore full leaderboardData.ts, cityDetailData.ts, jobDetailData.ts
- Sort cities alphabetically by state, then city

### Agent D — Copy Sweep (`copy-sweep` branch)
- Remove all agency/public data mentions from Home, Footer, DataSourceStrip, JobDetail, BestCities, WageVsRent, Leaderboards, Calculator, Results, About, freshness config
- Fix DataSourceStrip neutral copy
- Grep-verify zero remaining mentions

### Agent E — Methodology Content (`method-content` branch)
- Full Methodology.tsx rewrite: real formulas, no agency branding
- Remove DataStatusBar from Layout.tsx (or hide)
- Update freshness.ts with neutral labels and current dates

## Merge Strategy
1. All agents branch from master
2. Octopus merge into `final-build-round3`
3. Build, fix errors, deploy
