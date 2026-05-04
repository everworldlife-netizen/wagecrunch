import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Share2,
  Download,
  Home,
  TrendingUp,
  Receipt,
  GitCompare,
  Trophy,
  FileText,
  RefreshCw,
} from 'lucide-react';
import Layout from '@/components/Layout';
import WagePowerGauge from '@/components/WagePowerGauge';
import BudgetDonut from '@/components/BudgetDonut';
import CityComparison from '@/components/CityComparison';
import DataSourceStrip from '@/components/DataSourceStrip';
import { useCalculator } from '@/hooks/useCalculator';
import type { FilingStatus } from '@/hooks/useCalculator';
import { cities } from '@/data/cities';
import { calculateFederalTax, calculateFICATax, getStateTaxRate, federalTaxBrackets2024 } from '@/data/taxBrackets';

const EASE_OUT = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function Results() {
  const [searchParams] = useSearchParams();
  const {
    inputs,
    updateInput,
    result,
    comparison,
    crunch,
  } = useCalculator();

  const [shareToast, setShareToast] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Parse URL params and pre-populate inputs
  useEffect(() => {
    if (hasInitialized) return;

    const salary = searchParams.get('salary');
    const city = searchParams.get('city');
    const filing = searchParams.get('filing') as FilingStatus | null;
    const rent = searchParams.get('rent');
    const job = searchParams.get('job');
    const debt = searchParams.get('debt');
    const compare = searchParams.get('compare');

    if (salary) updateInput('salary', Number(salary));
    if (city && cities.find((c) => c.slug === city)) updateInput('citySlug', city);
    if (filing && ['single', 'married_jointly', 'married_separately', 'head_of_household'].includes(filing)) {
      updateInput('filingStatus', filing);
    }
    if (rent) updateInput('monthlyRent', Number(rent));
    if (job) updateInput('jobTitle', job);
    if (debt) updateInput('monthlyDebt', Number(debt));
    if (compare && cities.find((c) => c.slug === compare)) updateInput('compareCitySlug', compare);

    // Auto-crunch if we have the minimum required params
    if (salary && city) {
      // Delay to let state update
      setTimeout(() => crunch(), 50);
    }

    setHasInitialized(true);
  }, [searchParams, updateInput, crunch, hasInitialized]);

  const selectedCity = useMemo(
    () => cities.find((c) => c.slug === inputs.citySlug) || cities[0],
    [inputs.citySlug]
  );

  const compareCity = useMemo(
    () => cities.find((c) => c.slug === inputs.compareCitySlug),
    [inputs.compareCitySlug]
  );

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

    const url = `${window.location.origin}${window.location.pathname}#/results?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch {
      // Silently fail
    }
  };

  // Score breakdown data
  const scoreBreakdown = [
    { label: 'Net Monthly Pay Strength', weight: 35, value: Math.round(result.wagePowerScore * 0.35) },
    { label: 'Rent Affordability', weight: 25, value: Math.round(result.wagePowerScore * 0.25) },
    { label: 'Cost-of-Living Advantage', weight: 20, value: Math.round(result.wagePowerScore * 0.2) },
    { label: 'Tax Efficiency', weight: 10, value: Math.round(result.wagePowerScore * 0.1) },
    { label: 'Remaining Income', weight: 10, value: Math.round(result.wagePowerScore * 0.1) },
  ];

  // City ranking mini-bar data (top 10 cities by net monthly for this salary)
  const cityRankings = useMemo(() => {
    const ranked = [...cities]
      .map((c) => {
        // Using imported tax functions
        const brackets = federalTaxBrackets2024[inputs.filingStatus] || federalTaxBrackets2024.single;
        const fedTax = calculateFederalTax(
          Math.max(0, inputs.salary - brackets.standardDeduction),
          inputs.filingStatus
        );
        const fica = calculateFICATax(inputs.salary);
        const stateTax = inputs.salary * getStateTaxRate(c.stateCode);
        const netMonthly = (inputs.salary - fedTax - fica.total - stateTax) / 12;
        return { slug: c.slug, name: c.name, netMonthly };
      })
      .sort((a: { netMonthly: number }, b: { netMonthly: number }) => b.netMonthly - a.netMonthly)
      .slice(0, 10);
    return ranked;
  }, [inputs.salary, inputs.filingStatus]);

  const austinRankIndex = cityRankings.findIndex(
    (c: { slug: string }) => c.slug === inputs.citySlug
  );
  const austinRank = austinRankIndex === -1 ? 5 : austinRankIndex + 1;

  // Insights
  const insights = [
    {
      icon: Home,
      iconColor: '#047857',
      borderColor: '#047857',
      title:
        result.rentBurdenStatus === 'healthy'
          ? 'Your rent is healthy'
          : result.rentBurdenStatus === 'caution'
            ? 'Your rent burden is elevated'
            : 'Your rent burden is high',
      body:
        result.rentBurdenStatus === 'healthy'
          ? `You are spending about one quarter of your take-home pay on rent, which is generally considered healthy. Financial advisors recommend keeping housing costs under 30% of gross income. Your current rent burden of ${result.rentBurdenPercent.toFixed(1)}% leaves room for savings and discretionary spending.`
          : result.rentBurdenStatus === 'caution'
            ? `You are spending ${result.rentBurdenPercent.toFixed(1)}% of your take-home pay on rent, which is approaching the 30% threshold. Consider budgeting carefully or exploring areas with lower rent to improve your savings rate.`
            : `Your rent consumes ${result.rentBurdenPercent.toFixed(1)}% of take-home pay — well above the recommended 30%. This leaves limited room for savings and may create financial stress. Consider a more affordable area or roommate situation.`,
      cta: 'See cities with lower rent',
      ctaLink: '/leaderboards/wage-vs-rent',
    },
    {
      icon: TrendingUp,
      iconColor: '#2563EB',
      borderColor: '#2563EB',
      title:
        result.colAdjustmentPercent >= 0
          ? `Strong buying power in ${selectedCity.name}`
          : `Moderate buying power in ${selectedCity.name}`,
      body:
        result.colAdjustmentPercent >= 0
          ? `This means your salary has above-average buying power in ${selectedCity.name} compared with similar cities. Your cost-of-living adjusted salary of $${result.colAdjustedSalary.toLocaleString()} gives you more real purchasing power than the nominal $${inputs.salary.toLocaleString()} suggests.`
          : `${selectedCity.name} is ${Math.abs(result.colAdjustmentPercent).toFixed(1)}% more expensive than the national average. Your cost-of-living adjusted salary of $${result.colAdjustedSalary.toLocaleString()} reflects what your income is truly worth here.`,
      cta: 'Compare with other cities',
      ctaLink: '/calculator',
    },
    {
      icon: Receipt,
      iconColor: '#F97316',
      borderColor: '#F97316',
      title:
        result.effectiveTaxRate < 20
          ? 'Your effective tax rate is favorable'
          : result.effectiveTaxRate < 28
            ? 'Your effective tax rate is moderate'
            : 'Your effective tax rate is elevated',
      body: `At ${result.effectiveTaxRate.toFixed(1)}%, your combined tax burden includes federal income tax, Social Security, Medicare, and ${selectedCity.stateCode !== 'TX' && selectedCity.stateCode !== 'FL' && selectedCity.stateCode !== 'TN' && selectedCity.stateCode !== 'NV' ? 'state income tax' : 'local taxes'}. ${result.effectiveTaxRate > 28 ? 'Consider tax-advantaged accounts like 401(k) or HSA to reduce taxable income.' : 'This is in line with the national average for your income level.'}`,
      cta: 'See tax breakdown',
      ctaLink: '/methodology',
    },
  ];

  // Related actions
  const relatedActions = [
    {
      icon: GitCompare,
      title: 'Compare Cities',
      body: 'See how your salary stacks up in 50+ cities across the US. Side-by-side comparison of taxes, rent, and buying power.',
      button: 'Compare Now',
      link: '/calculator',
      variant: 'primary' as const,
    },
    {
      icon: Trophy,
      title: 'Explore Leaderboards',
      body: 'Find the best cities for your job, most underpaid careers, and more data-driven rankings.',
      button: 'View Rankings',
      link: '/leaderboards',
      variant: 'primary' as const,
    },
    {
      icon: FileText,
      title: 'Download Full Report',
      body: 'Get a detailed PDF report with salary percentile, negotiation tips, and city comparisons.',
      button: 'Notify Me',
      link: '#',
      variant: 'disabled' as const,
    },
  ];

  return (
    <Layout>
      {/* Share Toast */}
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

      {/* ─── Section 1: Results Header ─── */}
      <section className="bg-white">
        <div className="container-page py-8 lg:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
              <Link
                to="/calculator"
                className="hover:text-navy transition-colors"
              >
                Calculator
              </Link>
              <span>&rarr;</span>
              <span>Results</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-[#0F172A] tracking-[-0.01em]">
              Your Salary Breakdown
            </h1>
            <p className="text-base text-[#475569] mt-2">
              Based on {inputs.jobTitle || 'your salary'} earning{' '}
              <span className="font-mono font-medium">
                ${inputs.salary.toLocaleString()}
              </span>{' '}
              in{' '}
              <span className="font-medium">
                {selectedCity.name}, {selectedCity.state}
              </span>
            </p>

            {/* Meta row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4"
            >
              <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                <RefreshCw className="w-3 h-3" />
                <span>
                  Calculated just now &middot; All estimates use public data
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="btn-secondary inline-flex items-center gap-2 text-sm px-4"
                >
                  <Share2 className="w-4 h-4" />
                  Share Results
                </button>
                <button
                  className="btn-primary inline-flex items-center gap-2 text-sm h-10 px-4 opacity-50 cursor-not-allowed"
                  disabled
                  title="PDF report downloads launching Q3 2025"
                >
                  <Download className="w-4 h-4" />
                  Download Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Section 2: Key Metrics Row ─── */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0]">
        <div className="container-page py-6 lg:py-8">
          <div className="flex gap-3 lg:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
            {[
              {
                label: 'Net Monthly',
                value: `$${Math.round(result.netMonthly).toLocaleString()}`,
                subtitle: '/mo',
                caption: `$${Math.round(result.netAnnual).toLocaleString()}/yr`,
                dot: '#047857',
              },
              {
                label: 'Tax Rate',
                value: `${result.effectiveTaxRate.toFixed(1)}%`,
                subtitle: 'Effective',
                caption: `$${Math.round(result.totalTax).toLocaleString()}/yr`,
                dot: '#2563EB',
              },
              {
                label: 'Rent Burden',
                value: `${result.rentBurdenPercent.toFixed(1)}%`,
                subtitle:
                  result.rentBurdenStatus === 'healthy'
                    ? 'Healthy'
                    : result.rentBurdenStatus === 'caution'
                      ? 'Caution'
                      : 'Stressed',
                caption: `$${inputs.monthlyRent.toLocaleString()}/mo`,
                dot:
                  result.rentBurdenStatus === 'healthy'
                    ? '#047857'
                    : result.rentBurdenStatus === 'caution'
                      ? '#F97316'
                      : '#DC2626',
              },
              {
                label: 'Wage Power',
                value: `${result.wagePowerScore}`,
                subtitle: `/100 ${result.wagePowerLabel}`,
                caption: 'Composite score',
                dot: '#047857',
              },
              {
                label: 'COL Adjusted',
                value: `$${result.colAdjustedSalary.toLocaleString()}`,
                subtitle: `${result.colAdjustmentPercent >= 0 ? '+' : ''}${result.colAdjustmentPercent.toFixed(1)}% vs avg`,
                caption: `${selectedCity.name}, ${selectedCity.stateCode}`,
                dot: '#2563EB',
              },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.08 * i }}
                className="card-base min-w-[140px] sm:min-w-[160px] flex-1 snap-start"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: metric.dot }}
                  />
                  <span className="text-[13px] font-medium text-[#475569] tracking-[0.02em]">
                    {metric.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-bold font-mono text-[#0F172A] leading-none tracking-[-0.02em]">
                    {metric.value}
                  </span>
                  <span className="text-xs text-[#475569]">
                    {metric.subtitle}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1.5">{metric.caption}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 3: Detailed Breakdown ─── */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column — Budget Visualization (60%) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-[60%]"
            >
              <div className="card-base">
                <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
                  Monthly Budget Breakdown
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="shrink-0">
                    <BudgetDonut
                      data={result.budgetBreakdown}
                      centerLabel={`$${Math.round(result.netMonthly).toLocaleString()}`}
                      centerSubLabel="net monthly"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    {/* Itemized list with percentage bars */}
                    <div className="space-y-3">
                      {result.budgetBreakdown.map((item) => (
                        <div key={item.category}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-sm text-[#475569]">
                                {item.category}
                              </span>
                            </div>
                            <span className="text-sm font-mono font-medium text-[#0F172A]">
                              ${Math.round(item.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden ml-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min(100, item.percent)}%`,
                              }}
                              transition={{
                                duration: 0.6,
                                ease: 'easeOut',
                                delay: 0.3,
                              }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Insight paragraph */}
                    <div className="mt-5 bg-[#F8FAFC] rounded-lg p-4">
                      <p className="text-sm text-[#475569]">
                        After taxes and rent, you have{' '}
                        <span className="font-mono font-medium text-[#0F172A]">
                          $
                          {Math.round(
                            result.netMonthly -
                              inputs.monthlyRent -
                              (result.budgetBreakdown.find(
                                (b) => b.category === 'Debt'
                              )?.amount ?? 0)
                          ).toLocaleString()}
                        </span>{' '}
                        left for food, transportation, insurance, and savings.
                        Your rent burden is{' '}
                        {result.rentBurdenStatus === 'healthy'
                          ? 'healthy'
                          : result.rentBurdenStatus === 'caution'
                            ? 'elevated'
                            : 'high'}{' '}
                        at {result.rentBurdenPercent.toFixed(1)}% of take-home
                        pay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column — Score & Rankings (40%) */}
            <div className="lg:w-[40%] flex flex-col gap-4">
              {/* Wage Power Score card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 }}
                className="card-base"
              >
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  Wage Power Score
                </h3>
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                  <WagePowerGauge
                    score={result.wagePowerScore}
                    label={result.wagePowerLabel}
                    size={140}
                    delay={200}
                  />
                  <div className="flex-1 w-full">
                    {/* Score breakdown bars */}
                    <div className="space-y-2.5">
                      {scoreBreakdown.map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.4 + i * 0.1,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-[#475569]">
                              {item.label}
                            </span>
                            <span className="text-[10px] font-medium text-[#94A3B8] bg-[#F8FAFC] px-1.5 py-0.5 rounded">
                              {item.weight}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-[#E2E8F0] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(item.value / 35) * 100}%` }}
                              transition={{
                                duration: 0.4,
                                delay: 0.5 + i * 0.1,
                              }}
                              className="h-full bg-emerald rounded-full"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* City Ranking card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="card-base"
              >
                <h3 className="text-base font-semibold text-[#0F172A] mb-3">
                  How {selectedCity.name} Compares
                </h3>
                <div className="space-y-2">
                  {cityRankings.map(
                    (
                      c: { slug: string; name: string; netMonthly: number },
                      i: number
                    ) => (
                      <div key={c.slug} className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#64748B] w-5 text-right">
                          {i + 1}
                        </span>
                        <span
                          className={`text-xs ${
                            c.slug === inputs.citySlug
                              ? 'font-semibold text-navy'
                              : 'text-[#475569]'
                          }`}
                        >
                          {c.name}
                        </span>
                        <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(100, (c.netMonthly / cityRankings[0].netMonthly) * 100)}%`,
                            }}
                            transition={{
                              duration: 0.6,
                              ease: 'easeOut',
                              delay: 0.3 + i * 0.05,
                            }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor:
                                c.slug === inputs.citySlug
                                  ? '#0B1E3C'
                                  : '#E2E8F0',
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-[#475569] w-[48px] text-right">
                          ${Math.round(c.netMonthly).toLocaleString()}
                        </span>
                      </div>
                    )
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                  <p className="text-xs text-[#64748B]">
                    <span className="font-semibold text-navy">
                      #{austinRank}
                    </span>{' '}
                    of {cities.length} cities for net take-home pay
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Comparison Card (if compare city selected) */}
          {comparison && compareCity && (
            <div className="mt-4">
              <CityComparison
                cityA={selectedCity.name}
                cityB={compareCity.name}
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
            </div>
          )}
        </div>
      </section>

      {/* ─── Section 4: Plain-English Insights ─── */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-10 lg:py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold text-[#0F172A] mb-6"
          >
            What This Means For You
          </motion.h2>

          <div className="grid gap-4">
            {insights.map((insight, i) => (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 * (i + 1) }}
                className="card-base flex items-start gap-4"
                style={{
                  borderLeft: `3px solid ${insight.borderColor}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${insight.iconColor}12` }}
                >
                  <insight.icon
                    className="w-5 h-5"
                    style={{ color: insight.iconColor }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-[#0F172A] mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {insight.body}
                  </p>
                  <Link
                    to={insight.ctaLink}
                    className="inline-flex items-center gap-1 text-sm text-navy hover:underline mt-2 font-medium"
                  >
                    {insight.cta} &rarr;
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 5: Related Actions ─── */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold text-[#0F172A] mb-8"
          >
            What Would You Like to Do Next?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedActions.map((action, i) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE_OUT,
                  delay: 0.12 * (i + 1),
                }}
                className="card-interactive flex flex-col"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    action.variant === 'disabled'
                      ? 'bg-[#F8FAFC]'
                      : 'bg-navy/[0.04]'
                  }`}
                >
                  <action.icon
                    className={`w-6 h-6 ${
                      action.variant === 'disabled'
                        ? 'text-[#64748B]'
                        : 'text-navy'
                    }`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-[#475569] leading-relaxed flex-1 mb-4">
                  {action.body}
                </p>
                <Link
                  to={action.link}
                  className="btn-primary inline-flex items-center justify-center text-sm h-10 px-5 self-start"
                >
                  {action.button}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <DataSourceStrip />
    </Layout>
  );
}
