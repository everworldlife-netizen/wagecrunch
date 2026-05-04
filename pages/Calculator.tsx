import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  DollarSign,
  MapPin,
  User,
  Home,
  ChevronDown,
  Lock,
  Lightbulb,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import MetricCard from '@/components/MetricCard';
import WagePowerGauge from '@/components/WagePowerGauge';
import BudgetDonut from '@/components/BudgetDonut';
import CityComparison from '@/components/CityComparison';
import DataSourceStrip from '@/components/DataSourceStrip';
import StickyCTA from '@/components/StickyCTA';
import { useCalculator } from '@/hooks/useCalculator';

import type { FilingStatus } from '@/hooks/useCalculator';
import { cities } from '@/data/cities';
import { jobs } from '@/data/jobs';

const filingStatusOptions: { value: FilingStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married_jointly', label: 'Married filing jointly' },
  { value: 'married_separately', label: 'Married filing separately' },
  { value: 'head_of_household', label: 'Head of household' },
];

const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Calculator() {
  const {
    inputs,
    updateInput,
    result,
    comparison,
    showResults,
    crunch,
  } = useCalculator();

  const [showDebt, setShowDebt] = useState(inputs.monthlyDebt > 0);
  const [showCompare, setShowCompare] = useState(inputs.compareCitySlug !== '');
  const [jobSearch, setJobSearch] = useState(inputs.jobTitle);
  const [showJobDropdown, setShowJobDropdown] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const selectedCity = useMemo(
    () => cities.find((c) => c.slug === inputs.citySlug) || cities[0],
    [inputs.citySlug]
  );

  const filteredJobs = useMemo(() => {
    if (!jobSearch.trim()) return jobs.slice(0, 6);
    return jobs
      .filter(
        (j) =>
          j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
          j.category.toLowerCase().includes(jobSearch.toLowerCase())
      )
      .slice(0, 6);
  }, [jobSearch]);

  const handleJobSelect = (title: string) => {
    setJobSearch(title);
    updateInput('jobTitle', title);
    const selectedJob = jobs.find(j => j.title === title);
    if (selectedJob) {
      updateInput('salary', selectedJob.medianSalary);
    }
    setShowJobDropdown(false);
  };

  const handleShare = async () => {
    const params = new URLSearchParams({
      salary: inputs.salary.toString(),
      city: inputs.citySlug,
      filing: inputs.filingStatus,
      rent: inputs.monthlyRent.toString(),
    });
    if (inputs.jobTitle) params.set('job', inputs.jobTitle);
    if (inputs.monthlyDebt > 0) params.set('debt', inputs.monthlyDebt.toString());
    if (inputs.compareCitySlug) params.set('compare', inputs.compareCitySlug);

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch {
      // Silently fail
    }
  };

  const isFirstLoad = !showResults;

  return (
    <Layout>
      {/* Share Toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="fixed top-20 right-4 z-[60] bg-[#0F172A] text-white text-sm px-4 py-3 rounded-lg shadow-lg"
          >
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* ─── Left Sidebar: Input Panel ─── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full lg:w-[380px] xl:w-[400px] shrink-0"
          >
            <div className="lg:sticky lg:top-20 card-base">
              <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
                Your Inputs
              </h2>

              <div className="flex flex-col gap-5">
                {/* 1. Job Title */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                >
                  <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                    Job Title
                  </label>
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
                      className="input-base w-full pl-9"
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
                            <span className="text-xs text-[#94A3B8]">
                              {job.category}
                            </span>
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
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {inputs.jobTitle && jobs.find(j => j.title === inputs.jobTitle)
                      ? `Auto-filled median: $${jobs.find(j => j.title === inputs.jobTitle)?.medianSalary.toLocaleString()} — drag slider to override`
                      : 'Search for your occupation'}
                  </p>
                </motion.div>

                {/* 2. Annual Salary */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                    Annual Salary
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="number"
                      value={inputs.salary || ''}
                      onChange={(e) =>
                        updateInput(
                          'salary',
                          Math.min(
                            300000,
                            Math.max(30000, Number(e.target.value) || 0)
                          )
                        )
                      }
                      placeholder="120,000"
                      className="input-base w-full pl-9"
                    />
                  </div>
                  <input
                    type="range"
                    min={30000}
                    max={300000}
                    step={1000}
                    value={inputs.salary}
                    onChange={(e) =>
                      updateInput('salary', Number(e.target.value))
                    }
                    className="w-full mt-2 accent-navy"
                  />
                  {inputs.salary > 300000 && (
                    <p className="text-xs text-[#C2410C] mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]" />
                      Calculations capped at $300,000. Estimates may be simplified.
                    </p>
                  )}
                  <p className="text-xs text-[#94A3B8] text-right mt-0.5">
                    $30K – $300K+
                  </p>
                </motion.div>

                {/* 3. City / State */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                >
                  <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                    City / State
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <select
                      value={inputs.citySlug}
                      onChange={(e) => updateInput('citySlug', e.target.value)}
                      className="input-base w-full pl-9 appearance-none cursor-pointer"
                    >
                      {cities.map((city) => (
                        <option key={city.slug} value={city.slug}>
                          {city.name}, {city.state}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  </div>
                  {selectedCity && (
                    <div className="mt-1.5 inline-flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2 py-0.5">
                      <span className="text-xs text-[#475569]">
                        {selectedCity.name}, {selectedCity.stateCode}
                      </span>
                    </div>
                  )}
                </motion.div>

                {/* 4. Filing Status */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                    Filing Status
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <select
                      value={inputs.filingStatus}
                      onChange={(e) =>
                        updateInput(
                          'filingStatus',
                          e.target.value as FilingStatus
                        )
                      }
                      className="input-base w-full pl-9 appearance-none cursor-pointer"
                    >
                      {filingStatusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  </div>
                </motion.div>

                {/* 5. Monthly Rent */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                >
                  <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                    Monthly Rent
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <DollarSign className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="number"
                      value={inputs.monthlyRent || ''}
                      onChange={(e) =>
                        updateInput(
                          'monthlyRent',
                          Math.min(
                            5000,
                            Math.max(500, Number(e.target.value) || 0)
                          )
                        )
                      }
                      placeholder="1,800"
                      className="input-base w-full pl-14"
                    />
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={50}
                    value={inputs.monthlyRent}
                    onChange={(e) =>
                      updateInput('monthlyRent', Number(e.target.value))
                    }
                    className="w-full mt-2 accent-navy"
                  />
                  <p className="text-xs text-[#94A3B8] text-right mt-0.5">
                    $500 – $5,000+
                  </p>
                </motion.div>

                {/* 6. Debt / Monthly Expenses (collapsible) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <button
                    onClick={() => setShowDebt(!showDebt)}
                    className="flex items-center gap-2 text-sm text-navy font-medium transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showDebt ? 'rotate-180' : ''}`}
                    />
                    Add monthly debt &amp; expenses
                  </button>
                  <AnimatePresence>
                    {showDebt && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <input
                            type="number"
                            value={inputs.monthlyDebt || ''}
                            onChange={(e) =>
                              updateInput(
                                'monthlyDebt',
                                Math.max(0, Number(e.target.value) || 0)
                              )
                            }
                            placeholder="600"
                            className="input-base w-full"
                          />
                          <p className="text-xs text-[#94A3B8] mt-1">
                            Credit cards, student loans, car payments, etc.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* 7. Compare With (collapsible) */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                >
                  <button
                    onClick={() => setShowCompare(!showCompare)}
                    className="flex items-center gap-2 text-sm text-navy font-medium transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${showCompare ? 'rotate-180' : ''}`}
                    />
                    Compare with another city
                  </button>
                  <AnimatePresence>
                    {showCompare && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3">
                          <select
                            value={inputs.compareCitySlug}
                            onChange={(e) =>
                              updateInput('compareCitySlug', e.target.value)
                            }
                            className="input-base w-full appearance-none cursor-pointer"
                          >
                            <option value="">Select a city...</option>
                            {cities.map((city) => (
                              <option key={city.slug} value={city.slug}>
                                {city.name}, {city.state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <button
                    onClick={crunch}
                    className="btn-primary w-full mt-2"
                  >
                    {isFirstLoad ? 'Crunch My Wage' : 'Update Results'}
                  </button>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <Lock className="w-3 h-3 text-[#94A3B8]" />
                    <span className="text-xs text-[#94A3B8]">
                      100% Free. No Sign-Up Required.
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* ─── Right: Results Dashboard ─── */}
          <div className="flex-1 min-w-0" ref={resultsRef}>
            <AnimatePresence mode="wait">
              {showResults ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.1 }}
                >
                  {/* Results Header */}
                  <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <h2 className="text-xl lg:text-2xl font-semibold text-[#0F172A]">
                        Your Results for {selectedCity.name},{' '}
                        {selectedCity.stateCode}
                      </h2>
                      <p className="text-xs text-[#94A3B8] mt-1">
                        All estimates use current market data.
                      </p>
                      <Link
                        to="/methodology"
                        className="text-sm text-navy hover:underline mt-1 inline-block"
                      >
                        Learn about our data and methodology &rarr;
                      </Link>
                    </div>
                    <button
                      onClick={handleShare}
                      className="btn-secondary inline-flex items-center gap-2 text-sm px-4 self-start"
                    >
                      <Share2 className="w-4 h-4" />
                      Share Results
                    </button>
                  </div>

                  {/* KPI Cards Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                    <MetricCard
                      label="Net Monthly Pay"
                      value={`$${Math.round(result.netMonthly).toLocaleString()}`}
                      subtitle="/ month"
                      caption={`$${Math.round(result.netAnnual).toLocaleString()} / year`}
                      tooltip="Take-home pay after federal, state, and payroll taxes"
                      delay={0}
                    />
                    <MetricCard
                      label="Effective Tax Rate"
                      value={`${result.effectiveTaxRate.toFixed(1)}%`}
                      caption={`$${Math.round(result.totalTax).toLocaleString()} est. annual tax`}
                      tooltip="Combined federal, state, and FICA tax rate"
                      delay={0.08}
                    />
                    <MetricCard
                      label="Rent Burden"
                      value={`${result.rentBurdenPercent.toFixed(1)}%`}
                      caption="of take-home pay"
                      pill={{
                        status: result.rentBurdenStatus,
                        label:
                          result.rentBurdenStatus === 'healthy'
                            ? 'Healthy'
                            : result.rentBurdenStatus === 'caution'
                              ? 'Caution'
                              : 'Stressed',
                      }}
                      tooltip="Percentage of net monthly pay spent on rent"
                      delay={0.16}
                    />
                    <MetricCard
                      label="Wage Power Score"
                      value={`${result.wagePowerScore}`}
                      subtitle="/100"
                      caption={result.wagePowerLabel}
                      tooltip="Composite score measuring buying power, rent affordability, COL advantage, and tax efficiency"
                      delay={0.24}
                    >
                      <div className="mt-3">
                        <WagePowerGauge
                          score={result.wagePowerScore}
                          label=""
                          size={80}
                          delay={400}
                        />
                      </div>
                    </MetricCard>
                    <MetricCard
                      label="Cost-of-Living Adj."
                      value={`$${result.colAdjustedSalary.toLocaleString()}`}
                      subtitle={
                        result.colAdjustmentPercent >= 0
                          ? `${result.colAdjustmentPercent.toFixed(1)}% more expensive`
                          : `${Math.abs(result.colAdjustmentPercent).toFixed(1)}% cheaper than avg`
                      }
                      subtitleColor={result.colAdjustmentPercent >= 0 ? '#DC2626' : '#047857'}
                      caption={`Your $${result.grossAnnual.toLocaleString()} in ${selectedCity.name} buys what $${result.colAdjustedSalary.toLocaleString()} buys nationally.`}
                      tooltip="Salary adjusted for cost-of-living differences vs. national average"
                      delay={0.32}
                    />
                    <MetricCard
                      label="Take-Home Ranking"
                      value={result.topPercent >= 50 ? `${result.rankPercentile}%` : `Top ${result.topPercent}%`}
                      caption={result.topPercent >= 50
                        ? `Better than ${result.rankPercentile}% of U.S. metros — below median`
                        : `Better than ${result.rankPercentile}% of cities for this salary`
                      }
                      captionColor={result.topPercent >= 50 ? '#F97316' : undefined}
                      tooltip="How this city ranks for take-home pay among all tracked cities"
                      delay={0.4}
                    >
                      {/* Mini percentile bar */}
                      <div className="mt-3 w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, result.rankPercentile)}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeOut',
                            delay: 0.6,
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: result.topPercent >= 50 ? '#F97316' : '#2563EB' }}
                        />
                      </div>
                    </MetricCard>
                  </div>

                  {/* Budget Breakdown */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="card-base mt-4"
                  >
                    <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                      Monthly Budget Breakdown
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="shrink-0">
                        <BudgetDonut
                          data={result.budgetBreakdown}
                          centerLabel={`$${Math.round(result.netMonthly).toLocaleString()}`}
                          centerSubLabel="net monthly"
                        />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="space-y-2.5">
                          {result.budgetBreakdown.map((item) => (
                            <div
                              key={item.category}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: item.color,
                                  }}
                                />
                                <span className="text-sm text-[#475569]">
                                  {item.category}
                                </span>
                              </div>
                              <span className="text-sm font-mono font-medium text-[#0F172A]">
                                ${Math.round(item.amount).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Comparison Card */}
                  {comparison && (
                    <CityComparison
                      cityA={selectedCity.name}
                      cityB={
                        cities.find(
                          (c) => c.slug === inputs.compareCitySlug
                        )?.name || inputs.compareCitySlug
                      }
                      rows={[
                        {
                          label: 'Net Monthly Pay',
                          cityAValue: `$${Math.round(comparison.primary.netMonthly).toLocaleString()}`,
                          cityBValue: `$${Math.round(comparison.compare.netMonthly).toLocaleString()}`,
                          delta: comparison.netMonthlyDiff,
                          isHigherBetter: true,
                        },
                        {
                          label: 'Effective Tax Rate',
                          cityAValue: `${comparison.primary.effectiveTaxRate.toFixed(1)}%`,
                          cityBValue: `${comparison.compare.effectiveTaxRate.toFixed(1)}%`,
                          delta: comparison.effectiveTaxRateDiff,
                          isHigherBetter: false,
                        },
                        {
                          label: 'Rent Burden',
                          cityAValue: `${comparison.primary.rentBurdenPercent.toFixed(1)}%`,
                          cityBValue: `${comparison.compare.rentBurdenPercent.toFixed(1)}%`,
                          delta: comparison.rentBurdenDiff,
                          isHigherBetter: false,
                        },
                        {
                          label: 'COL Adjustment',
                          cityAValue: `${comparison.primary.colAdjustmentPercent >= 0 ? '+' : ''}${comparison.primary.colAdjustmentPercent.toFixed(1)}%`,
                          cityBValue: `${comparison.compare.colAdjustmentPercent >= 0 ? '+' : ''}${comparison.compare.colAdjustmentPercent.toFixed(1)}%`,
                          delta: comparison.colAdjustedDiff,
                          isHigherBetter: true,
                        },
                        {
                          label: 'Wage Power Score',
                          cityAValue: `${comparison.primary.wagePowerScore}`,
                          cityBValue: `${comparison.compare.wagePowerScore}`,
                          delta: comparison.wagePowerDiff,
                          isHigherBetter: true,
                        },
                      ]}
                      insight={comparison.insight}
                    />
                  )}

                  {/* Insight Cards */}
                  {result.insights.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.6 }}
                      className="mt-4 grid gap-3"
                    >
                      {result.insights.map((insight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.7 + i * 0.08,
                          }}
                          className="flex items-start gap-3 bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg px-4 py-3"
                        >
                          <Lightbulb className="w-4 h-4 text-blue mt-0.5 shrink-0" />
                          <p className="text-sm text-[#1E3A5C]">{insight}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-16 h-16 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-[#94A3B8]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                    Ready to crunch your numbers?
                  </h3>
                  <p className="text-sm text-[#475569] max-w-[360px] mb-2">
                    Fill in your salary, city, and rent details on the left, then
                    click <strong className="text-navy">Crunch My Wage</strong> to
                    see your full breakdown.
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Takes tax rates, cost of living, and rent burden into account.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA — auto-hides via IntersectionObserver when results in view */}
      <StickyCTA
        resultsRef={resultsRef}
        onClick={crunch}
        isFirstLoad={isFirstLoad}
      />
      <div className="lg:hidden h-20" />

      <DataSourceStrip />
    </Layout>
  );
}
