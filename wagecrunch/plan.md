# WageCrunch MVP Build Plan

## Reference Image Analysis
The uploaded image shows a premium fintech-style salary calculator dashboard with:
- Clean white background, deep navy header/CTA, emerald green accents
- Three-column layout: Hero left, Calculator center, Results right
- Bottom leaderboard preview cards + data source trust strip
- Typography: Modern sans-serif (Inter-like), strong hierarchy
- Rounded cards, soft borders, subtle shadows, generous spacing

## Stage 1: Design System & Data Architecture
**Skills**: vibecoding-webapp-swarm (design phase)
**Agents**:
- Design Agent: Extract design tokens, create design.md with full color system, typography, spacing, component specs
- Data Architecture Agent: Create seed data structure, calculation engine formulas, TypeScript types
- Write design.md, types.ts, seed data files, calculation engine

## Stage 2: Project Foundation
**Skills**: vibecoding-webapp-swarm (setup phase)
**Agents**:
- Setup Agent: Initialize Next.js project with shadcn/ui, install deps, configure Tailwind
- Build project structure, install recharts, configure fonts, global CSS with design tokens

## Stage 3: Core Components & Calculator Page (PRIMARY)
**Skills**: vibecoding-webapp-swarm (build phase)
**Agents**:
- Component Agent 1: Build layout components (Header, Footer, PageShell)
- Component Agent 2: Build calculator input panel with all form fields, sliders, validation
- Component Agent 3: Build results dashboard (MetricCard, WagePowerGauge, BudgetBreakdownChart, CityComparisonCard)
- Component Agent 4: Build calculation engine hook (useCalculator) with all tax/burden/score logic

## Stage 4: Supporting Pages
**Skills**: vibecoding-webapp-swarm (build phase)
**Agents**:
- Pages Agent 1: Homepage with hero, feature badges, leaderboard previews, trust strip
- Pages Agent 2: Leaderboard pages (best-cities, wage-vs-rent)
- Pages Agent 3: Methodology, About, City/Job detail pages

## Stage 5: QA, Polish & Deployment
**Skills**: vibecoding-webapp-swarm (polish phase)
**Agents**:
- QA Agent: Test calculations, responsive layout, accessibility, edge cases
- Polish Agent: Final visual refinements, SEO metadata, README, deployment config

## Build Order
1. Design system + data architecture (parallel)
2. Project setup
3. Calculator page components (parallel where possible)
4. Supporting pages (parallel)
5. QA + Polish + Deploy

## Key Design Decisions
- Color: Deep navy #0A1628, emerald #047857, blue #2563EB, orange #F97316
- Typography: Inter (headings + body)
- Charts: Recharts
- Icons: Lucide React
- State: React hooks (no external state management needed for MVP)
- Data: Static seed JSON files
