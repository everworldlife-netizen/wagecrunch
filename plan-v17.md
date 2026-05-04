# WageCrunch V17 Plan

## Audit Results: What's Actually Broken in Production

### Confirmed Broken (Round 2/3 fixes lost in merges)
1. **BUG-3**: Ranking display inverted — uses same value for "Top X%" and "Better than X%"
2. **BUG-2**: Job auto-fill salary not wired — handleJobSelect only sets title
3. **cappedSalary**: No salary capping — $9.9M flows through calculations
4. **COPY-1**: COL card phrasing unchanged — still "In {shortName}. +X% vs. national avg."
5. **COPY-2**: Insight thresholds — "approaching" shown when already OVER 30%
6. **COPY-3**: About stats — still "50+ Cities, 500+ Occupations"
7. **BUG-7**: Two Update Results buttons — no visibility logic
8. **BUG-8**: Job titles truncated — no desktop override
9. **fullName**: Pages still use shortName — cities have fullName but pages don't use it
10. **BudgetDonut**: Need to verify percentage fix status
11. **Kimi badge**: Still in production
12. **Share URL state**: Never implemented

### New V16 Issues
13. **V16-1**: Compare page same-state cities show identical values
14. **V16-2**: Contact page is a dead-end — needs working form
15. **V16-3**: Footer placeholder copy

### P1 Visual (anti-slop) — Selected High-Impact Items
16. **STYLE-4**: Headline copy with POV
17. **STYLE-1**: Display typography for headings/KPIs
18. **STYLE-6**: Layered shadows + noise texture
19. **STYLE-7**: Asymmetric result layout

## Agent Decomposition

### Agent 1: CalcCoreAgent — useCalculator.ts fixes
- Add cappedSalary = Math.min(inputs.salary, 300000)
- Fix ranking: return topPercent = max(1, 100 - rankPercentile)
- Fix insight thresholds: "above" for >30%, "approaching" for 25-30%
- Add debt insight when debt > 15% of take-home
- Add tax breakdown to return object (federalTax, stateTax, ficaTax separately)

### Agent 2: PageFixAgent — All page-level fixes
- Calculator.tsx: job auto-fill salary, hide duplicate button on desktop, salary >300K badge, COL phrasing
- Home.tsx: fullName instead of shortName, headline copy, COL phrasing
- About.tsx: 197 cities, 284 occupations
- Jobs.tsx: desktop full titles, Market Rate tooltip
- Footer.tsx: remove placeholder copy
- Compare.tsx: same-state note
- Share URL: encode state in hash
- Remove Kimi badge from all pages

### Agent 3: StyleAgent — Visual identity
- index.css: Google Font display typeface (Space Grotesk), OKLCH-ish color refinements
- Layered shadows on cards, noise texture on hero
- Asymmetric result layout (60/40 grid)
- BudgetDonut.tsx verify percentage fix

### Agent 4: ContactFormAgent — Contact page
- Contact.tsx: Working form (name, email, message, type)
- Formspree integration (free tier)

## Merge: final-build-v17 → build → deploy
