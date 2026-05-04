import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, TrendingUp, Target, Search, MapPin, ChevronDown, ChevronUp,
  Lock, Calculator, Trophy, Scale, AlertTriangle, ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Cell } from 'recharts';
import Layout from '@/components/Layout';
import MetricCard from '@/components/MetricCard';
import WagePowerGauge from '@/components/WagePowerGauge';
import BudgetDonut from '@/components/BudgetDonut';
import CityComparison from '@/components/CityComparison';
import DataSourceStrip from '@/components/DataSourceStrip';
import LeaderboardRow from '@/components/LeaderboardRow';
import { useCalculator } from '@/hooks/useCalculator';
import { cities } from '@/data/cities';
import { jobs } from '@/data/jobs';
import type { FilingStatus } from '@/hooks/useCalculator';

const filingOptions: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married filing jointly' },
  { value: 'married_separately', label: 'Married filing separately' },
  { value: 'head_of_household', label: 'Head of household' },
];

/* ─── Hero Section ─── */
function HeroSection() {
  const {
    inputs, updateInput, result, comparison, showResults, crunch,
  } = useCalculator();

  const [showDebt, setShowDebt] = useState(false);
  const [jobSearch, setJobSearch] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const jobDropdownRef = useRef<HTMLDivElement>(null);

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.category.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const handleJobSelect = (title: string) => {
    setJobSearch(title);
    updateInput('jobTitle', title);
    setShowJobDropdown(false);
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (jobDropdownRef.current && !jobDropdownRef.current.contains(e.target as Node)) {
        setShowJobDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trustMarkers = [
    { icon: Shield, title: 'Verified Data', desc: 'Transparent methodology. No hidden assumptions.' },
    { icon: TrendingUp, title: 'Real Insights', desc: 'Beyond salary. Holistic clarity.' },
    { icon: Target, title: 'Better Decisions', desc: 'Negotiate smarter. Live better.' },
  ];

  return (
    <>
      <section className="bg-white min-h-[calc(100dvh-64px)]">
        <div className="container-page py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Left Column — Copy */}
            <div className="flex-1 lg:max-w-[520px] flex flex-col justify-center">
              {/* Trust pill */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center gap-1.5 self-start mb-6"
              >
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[13px] font-medium tracking-[0.02em]">
                  <Shield className="w-3.5 h-3.5 text-[#047857]" />
                  REAL INSIGHTS. BETTER DECISIONS.
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#0F172A] leading-[1.1] tracking-[-0.02em] mb-4"
              >
                Your paycheck is lying to you.
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
                className="text-base text-[#475569] leading-relaxed max-w-[480px] mb-8"
              >
                $100K in San Francisco is $76K everywhere else. See what your salary is actually worth — the honest math.
              </motion.p>

              {/* Trust markers */}
              <motion.div
                initial={{ opacity: 1, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-5 mb-8"
              >
                {trustMarkers.map((m, i) => (
                  <motion.div
                    key={m.title}
                    initial={{ opacity: 1, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 + i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy/[0.06] flex items-center justify-center shrink-0">
                      <m.icon className="w-4 h-4 text-navy" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">{m.title}</div>
                      <div className="text-xs text-[#64748B] mt-0.5">{m.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mobile CTA */}
              <button
                onClick={() => {
                  const el = document.getElementById('calculator-card');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="lg:hidden btn-primary w-full h-[52px] text-base"
              >
                Crunch My Wage
              </button>
            </div>

            {/* Right Column — Calculator */}
            <motion.div
              id="calculator-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.3 }}
              className="w-full lg:w-[460px] shrink-0"
            >
              <div className="card-base">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-5 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-navy" />
                  Crunch Your Wage
                </h3>

                <div className="space-y-4">
                  {/* Job Title */}
                  <div ref={jobDropdownRef}>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Job Title</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <input
                        type="text"
                        value={jobSearch}
                        onChange={(e) => {
                          setJobSearch(e.target.value);
                          updateInput('jobTitle', e.target.value);
                          setShowJobDropdown(true);
                        }}
                        onFocus={() => setShowJobDropdown(true)}
                        placeholder="Software Engineer"
                        className="input-base w-full pl-10"
                      />
                      {showJobDropdown && (
                        <div className="absolute z-20 mt-1 w-full bg-white border border-[#E2E8F0] rounded-lg shadow-lg max-h-[200px] overflow-auto">
                          {filteredJobs.map((job) => (
                            <button
                              key={job.slug}
                              onClick={() => handleJobSelect(job.title)}
                              className="w-full text-left px-3 py-2.5 text-sm text-[#0F172A] hover:bg-[#F8FAFC] transition-colors flex items-center justify-between"
                            >
                              <span>{job.title}</span>
                              <span className="text-xs text-[#94A3B8]">{job.category}</span>
                            </button>
                          ))}
                          {filteredJobs.length === 0 && (
                            <div className="px-3 py-2.5 text-sm text-[#94A3B8]">
                              No matching occupations found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">Search for your occupation</p>
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Annual Salary</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-mono">$</span>
                      <input
                        type="number"
                        value={inputs.salary || ''}
                        onChange={e => updateInput('salary', Number(e.target.value))}
                        placeholder="100000"
                        className="input-base w-full pl-8 font-mono"
                      />
                    </div>
                    <input
                      type="range"
                      min={30000}
                      max={300000}
                      step={1000}
                      value={inputs.salary}
                      onChange={e => updateInput('salary', Number(e.target.value))}
                      className="w-full mt-2 accent-navy h-1.5"
                    />
                    <div className="flex justify-between text-[10px] text-[#94A3B8] mt-0.5">
                      <span>$30K</span>
                      <span>$300K+</span>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">City / State</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                      <select
                        value={inputs.citySlug}
                        onChange={e => updateInput('citySlug', e.target.value)}
                        className="input-base w-full pl-10 appearance-none cursor-pointer"
                      >
                        {cities.map(c => (
                          <option key={c.slug} value={c.slug}>{c.fullName ?? c.shortName}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                    </div>
                  </div>

                  {/* Filing Status */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Filing Status</label>
                    <select
                      value={inputs.filingStatus}
                      onChange={e => updateInput('filingStatus', e.target.value as FilingStatus)}
                      className="input-base w-full appearance-none cursor-pointer"
                    >
                      {filingOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Monthly Rent */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Monthly Rent</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-mono">$</span>
                      <input
                        type="number"
                        value={inputs.monthlyRent || ''}
                        onChange={e => updateInput('monthlyRent', Number(e.target.value))}
                        placeholder="1800"
                        className="input-base w-full pl-8 font-mono"
                      />
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={50}
                      value={inputs.monthlyRent}
                      onChange={e => updateInput('monthlyRent', Number(e.target.value))}
                      className="w-full mt-2 accent-navy h-1.5"
                    />
                    <div className="flex justify-between text-[10px] text-[#94A3B8] mt-0.5">
                      <span>$500</span>
                      <span>$5,000+</span>
                    </div>
                  </div>

                  {/* Debt (expandable) */}
                  <div>
                    <button
                      onClick={() => setShowDebt(!showDebt)}
                      className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-navy transition-colors"
                    >
                      {showDebt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Debt / Monthly Expenses <span className="text-[#94A3B8]">(optional)</span>
                    </button>
                    <AnimatePresence>
                      {showDebt && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#64748B] font-mono">$</span>
                              <input
                                type="number"
                                value={inputs.monthlyDebt || ''}
                                onChange={e => updateInput('monthlyDebt', Number(e.target.value))}
                                placeholder="Credit cards, student loans, car payments..."
                                className="input-base w-full pl-8 font-mono"
                              />
                            </div>
                            <p className="text-[11px] text-[#94A3B8] mt-1">
                              Credit cards, student loans, car payments, etc.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Compare With */}
                  <div>
                    <label className="block text-[13px] font-medium text-[#475569] mb-1.5">
                      Compare With <span className="text-[#94A3B8] font-normal">(optional)</span>
                    </label>
                    <select
                      value={inputs.compareCitySlug}
                      onChange={e => updateInput('compareCitySlug', e.target.value)}
                      className="input-base w-full appearance-none cursor-pointer"
                    >
                      <option value="">No comparison</option>
                      {cities.map(c => (
                        <option key={c.slug} value={c.slug}>{c.fullName ?? c.shortName}</option>
                      ))}
                    </select>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={crunch}
                    className="btn-primary w-full mt-2 text-base h-12"
                  >
                    Crunch My Wage
                  </button>

                  {/* Trust line */}
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span className="text-xs text-[#94A3B8]">100% Free. No Sign-Up Required.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Dashboard */}
      <AnimatePresence>
        {showResults && (
          <ResultsDashboard result={result} comparison={comparison} inputs={inputs} />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Results Dashboard ─── */
function ResultsDashboard({ result, comparison, inputs }: {
  result: ReturnType<typeof useCalculator>['result'];
  comparison: ReturnType<typeof useCalculator>['comparison'];
  inputs: ReturnType<typeof useCalculator>['inputs'];
}) {
  const selectedCity = cities.find(c => c.slug === inputs.citySlug);

  const comparisonRows = comparison ? [
    { label: 'Net Monthly Pay', cityAValue: `$${result.netMonthly.toFixed(0)}`, cityBValue: `$${comparison.compare.netMonthly.toFixed(0)}`, delta: comparison.netMonthlyDiff, isHigherBetter: true },
    { label: 'Effective Tax Rate', cityAValue: `${result.effectiveTaxRate.toFixed(1)}%`, cityBValue: `${comparison.compare.effectiveTaxRate.toFixed(1)}%`, delta: comparison.effectiveTaxRateDiff, isHigherBetter: false },
    { label: 'Rent Burden', cityAValue: `${result.rentBurdenPercent.toFixed(1)}%`, cityBValue: `${comparison.compare.rentBurdenPercent.toFixed(1)}%`, delta: comparison.rentBurdenDiff, isHigherBetter: false },
    { label: 'COL Adjusted Salary', cityAValue: `$${result.colAdjustedSalary.toLocaleString()}`, cityBValue: `$${comparison.compare.colAdjustedSalary.toLocaleString()}`, delta: comparison.colAdjustedDiff, isHigherBetter: true },
    { label: 'Wage Power Score', cityAValue: `${result.wagePowerScore}`, cityBValue: `${comparison.compare.wagePowerScore}`, delta: comparison.wagePowerDiff, isHigherBetter: true },
  ] : [];

  return (
    <motion.section
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="bg-[#F8FAFC] overflow-hidden"
    >
      <div className="container-page py-12 lg:py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl lg:text-[28px] font-semibold text-[#0F172A] tracking-[-0.01em]">
            Your Results
          </h2>
          <div className="flex items-center gap-3">
            {selectedCity && (
              <span className="pill pill-info flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {selectedCity.shortName}
              </span>
            )}
            <button className="btn-secondary text-sm px-4 h-9">
              Share Results
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Net Monthly Pay"
            value={`$${result.netMonthly.toFixed(0)}`}
            subtitle="/month"
            caption={`$${result.netAnnual.toLocaleString()} / year`}
            delay={0}
            tooltip="Take-home pay after federal, state, and FICA taxes."
          />
          <MetricCard
            label="Effective Tax Rate"
            value={`${result.effectiveTaxRate.toFixed(1)}%`}
            caption="Estimated annual tax"
            delay={0.08}
            tooltip="Combined federal, state, and FICA tax rate."
          />
          <MetricCard
            label="Rent Burden"
            value={`${result.rentBurdenPercent.toFixed(1)}%`}
            caption="of take-home pay"
            pill={{
              status: result.rentBurdenStatus,
              label: result.rentBurdenStatus.charAt(0).toUpperCase() + result.rentBurdenStatus.slice(1),
            }}
            delay={0.16}
            tooltip="Percentage of take-home pay consumed by rent. <30% is healthy."
          />
          <MetricCard
            label="Wage Power Score"
            value=""
            delay={0.24}
            tooltip="Composite score (0-100) of purchasing power, COL adjustment, and financial health."
          >
            <div className="flex justify-center mt-1">
              <WagePowerGauge score={result.wagePowerScore} label={result.wagePowerLabel} size={120} delay={200} />
            </div>
          </MetricCard>
        </div>

        {/* Secondary Metrics + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* COL Adjusted Salary */}
          <MetricCard
            label="Cost-of-Living Adjusted Salary"
            value={`$${result.colAdjustedSalary.toLocaleString()}`}
            subtitle={result.colAdjustmentPercent >= 0 ? `${result.colAdjustmentPercent.toFixed(1)}% more expensive` : `${Math.abs(result.colAdjustmentPercent).toFixed(1)}% cheaper than avg`}
            subtitleColor={result.colAdjustmentPercent >= 0 ? '#DC2626' : '#047857'}
            caption={`Your $${inputs.salary.toLocaleString()} in ${selectedCity?.name} buys what $${result.colAdjustedSalary.toLocaleString()} buys nationally.`}
            delay={0.32}
            tooltip="Your salary adjusted for cost-of-living differences."
          />

          {/* Take-Home Pay Ranking */}
          <MetricCard
            label="Take-Home Pay Ranking"
            value={result.topPercent >= 50 ? `${result.rankPercentile}%` : `Top ${result.topPercent}%`}
            caption={result.topPercent >= 50
              ? `Better than ${result.rankPercentile}% of U.S. metros — below median`
              : `Better than ${result.rankPercentile}% of cities for this salary.`
            }
            captionColor={result.topPercent >= 50 ? '#F97316' : undefined}
            delay={0.4}
            tooltip="Rank of take-home pay among all tracked cities."
          />

          {/* Budget Breakdown Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.48 }}
            className="card-base lg:row-span-1"
          >
            <h3 className="text-sm font-medium text-[#475569] mb-4">Monthly Budget Breakdown</h3>
            <BudgetDonut
              data={result.budgetBreakdown}
              centerLabel={`$${result.netMonthly.toFixed(0)}`}
              centerSubLabel="Net Monthly"
            />
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.56 }}
          className="card-base mb-6"
        >
          <h3 className="text-sm font-medium text-[#475569] mb-3">Key Insights</h3>
          <ul className="space-y-2">
            {result.insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#0F172A]">
                <span className="w-1.5 h-1.5 rounded-full bg-navy mt-1.5 shrink-0" />
                {insight}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Comparison Card */}
        {comparison && (
          <CityComparison
            cityA={selectedCity?.name || 'City A'}
            cityB={cities.find(c => c.slug === inputs.compareCitySlug)?.name || 'City B'}
            rows={comparisonRows}
            insight={comparison.insight}
          />
        )}
      </div>
    </motion.section>
  );
}

/* ─── Explore Rankings Section ─── */
function ExploreRankings() {
  const bestCitiesData = [
    { rank: 1, city: 'Pittsburgh, PA', slug: 'pittsburgh-pa', score: 85 },
    { rank: 2, city: 'Indianapolis, IN', slug: 'indianapolis-in', score: 82 },
    { rank: 3, city: 'Columbus, OH', slug: 'columbus-oh', score: 81 },
    { rank: 4, city: 'St. Louis, MO', slug: 'st-louis-mo', score: 79 },
    { rank: 5, city: 'Milwaukee, WI', slug: 'milwaukee-wi', score: 78 },
  ];

  const wageRentData = [
    { city: 'PIT', burden: 18 },
    { city: 'IND', burden: 20 },
    { city: 'CLB', burden: 21 },
    { city: 'STL', burden: 22 },
    { city: 'MKE', burden: 23 },
    { city: 'AUS', burden: 28 },
    { city: 'SEA', burden: 25 },
    { city: 'SFO', burden: 35 },
  ];

  const underpaidCareers = [
    { rank: 1, title: 'Elementary Teacher', gap: -19.4 },
    { rank: 2, title: 'Social Worker', gap: -16.8 },
    { rank: 3, title: 'Medical Assistant', gap: -15.2 },
    { rank: 4, title: 'Graphic Designer', gap: -13.7 },
    { rank: 5, title: 'HR Coordinator', gap: -12.9 },
  ];

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="container-page">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-2xl lg:text-[28px] font-semibold text-[#0F172A] tracking-[-0.01em] mb-2">
              Explore Top Rankings
            </h2>
            <p className="text-base text-[#475569]">
              See how cities, salaries, and careers stack up.
            </p>
          </div>
          <Link
            to="/leaderboards"
            className="text-sm font-medium text-navy hover:underline inline-flex items-center gap-1 shrink-0"
          >
            View all leaderboards <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Three cards grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Best Cities */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0 }}
            className="card-interactive"
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-navy" />
              <h3 className="text-lg font-semibold text-[#0F172A]">Best Cities for Your Job</h3>
            </div>
            <p className="text-sm text-[#475569] mb-4">Where your salary goes further</p>

            <div className="space-y-0">
              {bestCitiesData.map((row) => (
                <LeaderboardRow
                  key={row.rank}
                  rank={row.rank}
                  city={row.city}
                  citySlug={row.slug}
                  metrics={[{ label: 'Score', value: `${row.score}` }]}
                  barValue={row.score}
                  barMax={100}
                  barColor="#047857"
                />
              ))}
            </div>

            <Link
              to="/leaderboards/best-cities-for-job"
              className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline mt-4"
            >
              See full ranking <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 2: Wage vs Rent */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.12 }}
            className="card-interactive"
          >
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-navy" />
              <h3 className="text-lg font-semibold text-[#0F172A]">Wage vs Rent Index</h3>
            </div>
            <p className="text-sm text-[#475569] mb-4">Where rent takes the least bite</p>

            <div className="h-[240px] mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wageRentData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="city" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 40]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} unit="%" />
                  <ReferenceLine y={30} stroke="#94A3B8" strokeDasharray="4 4" label={{ value: 'National Avg. 30%', position: 'right', fontSize: 10, fill: '#94A3B8' }} />
                  <Bar dataKey="burden" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {wageRentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.burden > 30 ? '#F97316' : '#047857'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <Link
              to="/leaderboards/wage-vs-rent"
              className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline"
            >
              See full ranking <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Card 3: Most Underpaid */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], delay: 0.24 }}
            className="card-interactive"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-[#DC2626]" />
              <h3 className="text-lg font-semibold text-[#0F172A]">Most Underpaid Careers</h3>
            </div>
            <p className="text-sm text-[#475569] mb-4">Top roles earning less than market rate</p>

            <div className="space-y-0">
              {/* Header */}
              <div className="flex items-center text-xs font-medium text-[#64748B] pb-2 border-b border-[#E2E8F0]">
                <div className="w-8">Rank</div>
                <div className="flex-1">Job Title</div>
                <div className="w-[80px] text-right">Gap</div>
              </div>
              {underpaidCareers.map((row) => (
                <div
                  key={row.rank}
                  className="flex items-center py-3 border-b border-[#E2E8F0] last:border-0"
                >
                  <div className="w-8">
                    <span className="text-sm font-mono text-[#64748B]">{row.rank}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-[#0F172A]">{row.title}</span>
                  </div>
                  <div className="w-[80px] text-right">
                    <span className="text-sm font-mono font-medium text-[#DC2626]">{row.gap}%</span>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/leaderboards"
              className="inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline mt-4"
            >
              See full ranking <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Home Page ─── */
export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <ExploreRankings />
      <DataSourceStrip />
    </Layout>
  );
}
