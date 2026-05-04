import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  DollarSign,
  ArrowRightLeft,
  TrendingUp,
  Percent,
  Home,
  BarChart3,
  Zap,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { cities } from '@/data/cities';
import {
  federalTaxBrackets2024,
  calculateFederalTax,
  calculateFICATax,
  getStateTaxRate,
} from '@/data/taxBrackets';
import type { FilingStatus } from '@/hooks/useCalculator';

/* ─── Types ─── */
interface CityResult {
  city: typeof cities[0];
  netMonthly: number;
  netAnnual: number;
  effectiveTaxRate: number;
  totalTax: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  rentBurdenPercent: number;
  rentBurdenStatus: 'healthy' | 'caution' | 'stressed';
  colAdjustedSalary: number;
  colAdjustmentPercent: number;
  wagePowerScore: number;
  medianRent: number;
}

interface CompareRow {
  label: string;
  icon: typeof DollarSign;
  valueA: number;
  valueB: number;
  delta: number;
  format: (v: number) => string;
  deltaFormat: (v: number) => string;
  isHigherBetter: boolean;
  unit: '$' | '%' | 'pts';
}

/* ─── helpers ─── */
function computeCityResult(
  city: typeof cities[0],
  salary: number,
  filingStatus: FilingStatus,
): CityResult {
  const brackets = federalTaxBrackets2024[filingStatus] || federalTaxBrackets2024.single;
  const standardDeduction = brackets.standardDeduction;
  const federalTaxableIncome = Math.max(0, salary - standardDeduction);
  const federalTax = calculateFederalTax(federalTaxableIncome, filingStatus);
  const stateTaxRate = getStateTaxRate(city.stateCode);
  const stateTax = salary * stateTaxRate;
  const fica = calculateFICATax(salary);
  const ficaTax = fica.total;

  const totalTax = federalTax + stateTax + ficaTax;
  const netAnnual = salary - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveTaxRate = salary > 0 ? (totalTax / salary) * 100 : 0;

  // Use city's own median 1BR rent
  const medianRent = city.medianRent1br || city.medianRent2br || 1000;
  const rentBurdenPercent = netMonthly > 0 ? (medianRent / netMonthly) * 100 : 0;
  let rentBurdenStatus: 'healthy' | 'caution' | 'stressed' = 'healthy';
  if (rentBurdenPercent > 40) rentBurdenStatus = 'stressed';
  else if (rentBurdenPercent > 30) rentBurdenStatus = 'caution';

  const colIndex = city.colIndex;
  const colAdjustedSalary = Math.round((salary / colIndex) * 100);
  const colAdjustmentPercent = ((colIndex - 100) / 100) * 100;

  // Wage Power Score
  const disposableIncomeRatio = netMonthly > 0
    ? Math.min(1, (netMonthly - medianRent) / 3000)
    : 0;
  const colFactor = Math.min(1, 120 / colIndex);
  const taxEfficiencyFactor = Math.max(0, 1 - (effectiveTaxRate / 45));

  const wagePowerScore = Math.round(
    Math.min(100, Math.max(0,
      disposableIncomeRatio * 40 +
      colFactor * 30 +
      taxEfficiencyFactor * 30
    ))
  );

  return {
    city,
    netMonthly,
    netAnnual,
    effectiveTaxRate,
    totalTax,
    federalTax,
    stateTax,
    ficaTax,
    rentBurdenPercent,
    rentBurdenStatus,
    colAdjustedSalary,
    colAdjustmentPercent,
    wagePowerScore,
    medianRent,
  };
}

function formatDollar(v: number): string {
  return `$${Math.round(v).toLocaleString()}`;
}

function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

function formatPp(v: number): string {
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}pp`;
}

function formatPoints(v: number): string {
  return `${v >= 0 ? '+' : ''}${Math.round(v)} pts`;
}

/* ─── Component ─── */
export default function Compare() {
  const [cityASlug, setCityASlug] = useState(cities[0].slug);
  const [cityBSlug, setCityBSlug] = useState(cities[1].slug);
  const [salary, setSalary] = useState(100000);
  const [filingStatus] = useState<FilingStatus>('single');

  // Ensure city B is different from city A
  useEffect(() => {
    if (cityBSlug === cityASlug) {
      const next = cities.find((c) => c.slug !== cityASlug);
      if (next) setCityBSlug(next.slug);
    }
  }, [cityASlug, cityBSlug]);

  const cityA = useMemo(() => cities.find((c) => c.slug === cityASlug) || cities[0], [cityASlug]);
  const cityB = useMemo(() => cities.find((c) => c.slug === cityBSlug) || cities[1], [cityBSlug]);

  const resultA = useMemo(
    () => computeCityResult(cityA, salary, filingStatus),
    [cityA, salary, filingStatus]
  );
  const resultB = useMemo(
    () => computeCityResult(cityB, salary, filingStatus),
    [cityB, salary, filingStatus]
  );

  const compareRows = useMemo((): CompareRow[] => {
    return [
      {
        label: 'Net Monthly Pay',
        icon: DollarSign,
        valueA: resultA.netMonthly,
        valueB: resultB.netMonthly,
        delta: resultA.netMonthly - resultB.netMonthly,
        format: formatDollar,
        deltaFormat: (v: number) => `${v >= 0 ? '+' : ''}$${Math.round(Math.abs(v)).toLocaleString()}`,
        isHigherBetter: true,
        unit: '$',
      },
      {
        label: 'Effective Tax Rate',
        icon: Percent,
        valueA: resultA.effectiveTaxRate,
        valueB: resultB.effectiveTaxRate,
        delta: resultA.effectiveTaxRate - resultB.effectiveTaxRate,
        format: formatPercent,
        deltaFormat: formatPp,
        isHigherBetter: false,
        unit: '%',
      },
      {
        label: 'Rent Burden',
        icon: Home,
        valueA: resultA.rentBurdenPercent,
        valueB: resultB.rentBurdenPercent,
        delta: resultA.rentBurdenPercent - resultB.rentBurdenPercent,
        format: formatPercent,
        deltaFormat: formatPp,
        isHigherBetter: false,
        unit: '%',
      },
      {
        label: 'COL Adjustment',
        icon: BarChart3,
        valueA: resultA.colAdjustmentPercent,
        valueB: resultB.colAdjustmentPercent,
        delta: resultA.colAdjustmentPercent - resultB.colAdjustmentPercent,
        format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`,
        deltaFormat: formatPp,
        isHigherBetter: true, // lower COL is better
        unit: '%',
      },
      {
        label: 'Wage Power Score',
        icon: Zap,
        valueA: resultA.wagePowerScore,
        valueB: resultB.wagePowerScore,
        delta: resultA.wagePowerScore - resultB.wagePowerScore,
        format: (v: number) => `${v}`,
        deltaFormat: formatPoints,
        isHigherBetter: true,
        unit: 'pts',
      },
    ];
  }, [resultA, resultB]);

  // Insight summary
  const insight = useMemo(() => {
    const netDiff = resultA.netMonthly - resultB.netMonthly;
    const taxDiff = resultA.effectiveTaxRate - resultB.effectiveTaxRate;
    const betterCity = netDiff > 0 ? cityA.name : cityB.name;
    const diffAmount = Math.abs(netDiff);
    return `${betterCity} gives you ${formatDollar(diffAmount)} more take-home pay per month with a ${Math.abs(taxDiff).toFixed(1)} percentage point ${taxDiff > 0 ? 'higher' : 'lower'} effective tax rate.`;
  }, [resultA, resultB, cityA, cityB]);

  const isSame = cityASlug === cityBSlug;

  return (
    <Layout>
      {/* Hero with radial gradient + noise */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #1a3a5c 0%, #0B1E3C 60%, #070f1f 100%)',
          }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" aria-hidden="true">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
        <div className="container-page max-w-[960px] text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <span className="text-[13px] font-medium text-[#94A3B8] tracking-[0.1em] uppercase">
              Comparison Tool
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="text-[32px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mt-4"
          >
            Compare Cities Side-by-Side
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-[1.7] mt-4 max-w-[640px] mx-auto"
          >
            Select two cities and a salary to see how they stack up on take-home pay, taxes, rent burden, and cost-of-living.
          </motion.p>
        </div>
      </section>

      {/* Controls */}
      <section className="bg-white py-8 sm:py-10 border-b border-[#E2E8F0]">
        <div className="container-page max-w-[960px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"
          >
            {/* City A */}
            <div>
              <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                City A
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <select
                  value={cityASlug}
                  onChange={(e) => setCityASlug(e.target.value)}
                  className="input-base w-full pl-9 appearance-none cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City B */}
            <div>
              <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                City B
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <select
                  value={cityBSlug}
                  onChange={(e) => setCityBSlug(e.target.value)}
                  className="input-base w-full pl-9 appearance-none cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="text-[13px] font-medium text-[#475569] tracking-[0.02em] mb-1.5 block">
                Annual Salary
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="number"
                  value={salary || ''}
                  onChange={(e) => setSalary(Math.min(300000, Math.max(30000, Number(e.target.value) || 0)))}
                  placeholder="100,000"
                  className="input-base w-full pl-9"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="bg-[#F8FAFC] py-10 sm:py-14">
        <div className="container-page max-w-[960px]">
          {/* City Headers */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
          >
            <div className="card-base text-center">
              <h3 className="text-lg font-semibold text-[#0F172A]">{cityA.name}</h3>
              <p className="text-xs text-[#475569] mt-1">{cityA.state} &middot; COL: {cityA.colIndex} &middot; 1BR: ${cityA.medianRent1br}</p>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-[#94A3B8]" />
              </div>
            </div>
            <div className="card-base text-center">
              <h3 className="text-lg font-semibold text-[#0F172A]">{cityB.name}</h3>
              <p className="text-xs text-[#475569] mt-1">{cityB.state} &middot; COL: {cityB.colIndex} &middot; 1BR: ${cityB.medianRent1br}</p>
            </div>
          </motion.div>

          {/* Summary Cards */}
          {!isSame && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
                {/* Net Pay A */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Net Monthly (A)</div>
                  <div className="text-xl font-bold font-mono text-[#0F172A]">{formatDollar(resultA.netMonthly)}</div>
                  <div className="text-xs text-[#94A3B8] mt-1">{cityA.name}</div>
                </div>

                {/* Net Pay B */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Net Monthly (B)</div>
                  <div className="text-xl font-bold font-mono text-[#0F172A]">{formatDollar(resultB.netMonthly)}</div>
                  <div className="text-xs text-[#94A3B8] mt-1">{cityB.name}</div>
                </div>

                {/* Net Diff */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Monthly Difference</div>
                  <div className={`text-xl font-bold font-mono ${resultA.netMonthly >= resultB.netMonthly ? 'text-[#047857]' : 'text-[#DC2626]'}`}>
                    {resultA.netMonthly >= resultB.netMonthly ? '+' : ''}{formatDollar(resultA.netMonthly - resultB.netMonthly)}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-1">
                    {resultA.netMonthly >= resultB.netMonthly ? cityA.name : cityB.name} is better
                  </div>
                </div>

                {/* Tax Rate A */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Tax Rate (A)</div>
                  <div className="text-xl font-bold font-mono text-[#0F172A]">{formatPercent(resultA.effectiveTaxRate)}</div>
                  <div className="text-xs text-[#94A3B8] mt-1">${Math.round(resultA.totalTax).toLocaleString()} annual</div>
                </div>

                {/* Tax Rate B */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Tax Rate (B)</div>
                  <div className="text-xl font-bold font-mono text-[#0F172A]">{formatPercent(resultB.effectiveTaxRate)}</div>
                  <div className="text-xs text-[#94A3B8] mt-1">${Math.round(resultB.totalTax).toLocaleString()} annual</div>
                </div>

                {/* Score Diff */}
                <div className="card-base">
                  <div className="text-xs font-medium text-[#64748B] mb-1">Wage Power Diff</div>
                  <div className={`text-xl font-bold font-mono ${resultA.wagePowerScore >= resultB.wagePowerScore ? 'text-[#047857]' : 'text-[#DC2626]'}`}>
                    {resultA.wagePowerScore >= resultB.wagePowerScore ? '+' : ''}{resultA.wagePowerScore - resultB.wagePowerScore} pts
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-1">{resultA.wagePowerScore} vs {resultB.wagePowerScore}</div>
                </div>
              </div>

              {/* Comparison Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: 0.5 }}
                className="card-base"
              >
                <h3 className="text-lg font-semibold text-[#0F172A] mb-5">
                  Detailed Comparison
                </h3>

                <div className="space-y-1">
                  {/* Header */}
                  <div className="flex items-center text-xs font-medium text-[#64748B] pb-2 border-b border-[#E2E8F0]">
                    <div className="flex-1">Metric</div>
                    <div className="w-[110px] text-right tabular-nums">{cityA.name}</div>
                    <div className="w-[90px] text-center">Diff</div>
                    <div className="w-[110px] text-right tabular-nums">{cityB.name}</div>
                  </div>

                  {/* Rows */}
                  {compareRows.map((row, i) => {
                    const isPositive = row.isHigherBetter ? row.delta > 0 : row.delta < 0;
                    const deltaColor = isPositive ? 'text-[#047857]' : 'text-[#DC2626]';
                    const deltaBg = isPositive ? 'bg-[#ECFDF5]' : 'bg-[#FEF2F2]';

                    return (
                      <div
                        key={i}
                        className="flex items-center py-3 border-b border-[#E2E8F0] last:border-0 text-sm"
                      >
                        <div className="flex-1 font-medium text-[#0F172A] flex items-center gap-2">
                          <row.icon className="w-4 h-4 text-[#64748B]" />
                          {row.label}
                        </div>
                        <div className="w-[110px] text-right font-mono text-[#0F172A] tabular-nums">
                          {row.format(row.valueA)}
                        </div>
                        <div className="w-[90px] flex justify-center">
                          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${deltaBg} ${deltaColor} tabular-nums`}>
                            {row.deltaFormat(row.delta)}
                          </span>
                        </div>
                        <div className="w-[110px] text-right font-mono text-[#0F172A] tabular-nums">
                          {row.format(row.valueB)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tax Breakdown Sub-table */}
                <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
                  <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Tax Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-[#64748B] mb-2">{cityA.name}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-[#475569]">Federal</span><span className="font-mono tabular-nums">${Math.round(resultA.federalTax).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#475569]">State ({resultA.city.stateCode})</span><span className="font-mono tabular-nums">${Math.round(resultA.stateTax).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#475569]">FICA</span><span className="font-mono tabular-nums">${Math.round(resultA.ficaTax).toLocaleString()}</span></div>
                        <div className="flex justify-between border-t border-[#E2E8F0] pt-1 mt-1"><span className="font-medium text-[#0F172A]">Total</span><span className="font-mono font-medium tabular-nums">${Math.round(resultA.totalTax).toLocaleString()}</span></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#64748B] mb-2">{cityB.name}</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-[#475569]">Federal</span><span className="font-mono tabular-nums">${Math.round(resultB.federalTax).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#475569]">State ({resultB.city.stateCode})</span><span className="font-mono tabular-nums">${Math.round(resultB.stateTax).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span className="text-[#475569]">FICA</span><span className="font-mono tabular-nums">${Math.round(resultB.ficaTax).toLocaleString()}</span></div>
                        <div className="flex justify-between border-t border-[#E2E8F0] pt-1 mt-1"><span className="font-medium text-[#0F172A]">Total</span><span className="font-mono font-medium tabular-nums">${Math.round(resultB.totalTax).toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight */}
                <div className="mt-4 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                  <p className="text-sm text-[#475569]">{insight}</p>
                </div>
              </motion.div>
            </>
          )}

          {isSame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-white border border-[#E2E8F0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Select two different cities</h3>
              <p className="text-sm text-[#475569] max-w-[360px] mx-auto">
                Choose a second city above to see the full side-by-side comparison.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
}
