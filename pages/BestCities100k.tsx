import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Wallet,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Layout from '@/components/Layout';
import StatusPill from '@/components/StatusPill';
import { cities } from '@/data/cities';
import {
  federalTaxBrackets2024,
  calculateFederalTax,
  calculateFICATax,
  getStateTaxRate,
} from '@/data/taxBrackets';

/* ─── helpers ─── */
function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function getBarColor(score: number): string {
  if (score >= 85) return '#047857';
  if (score >= 70) return '#2563EB';
  if (score >= 55) return '#F97316';
  return '#DC2626';
}

function getRentBurdenColor(pct: number): string {
  if (pct < 30) return '#047857';
  if (pct < 40) return '#F97316';
  return '#DC2626';
}

type SortField = 'takeHome' | 'wagePower' | 'rentBurden' | 'colAdjusted' | 'leftover';

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'wagePower', label: 'Wage Power Score' },
  { value: 'takeHome', label: 'Net Monthly Pay' },
  { value: 'rentBurden', label: 'Rent Burden' },
  { value: 'colAdjusted', label: 'COL Adjusted' },
  { value: 'leftover', label: 'Monthly Leftover' },
];

/* ─── Compute $100K rankings ─── */
const SALARY = 100000;
const FILING_STATUS = 'single' as const;

interface City100KRanking {
  rank: number;
  slug: string;
  city: string;
  stateCode: string;
  netMonthly: number;
  netAnnual: number;
  effectiveTaxRate: number;
  rentBurden: number;
  colAdjusted: number;
  colIndex: number;
  wagePowerScore: number;
  monthlyLeftover: number;
  medianRent: number;
  status: 'healthy' | 'caution' | 'stressed';
}

function compute100KRankings(): City100KRanking[] {
  const brackets = federalTaxBrackets2024[FILING_STATUS];
  const standardDeduction = brackets.standardDeduction;

  const results = cities.map((city) => {
    // Per-city tax computation using imported helpers
    const federalTaxableIncome = Math.max(0, SALARY - standardDeduction);
    const federalTax = calculateFederalTax(federalTaxableIncome, FILING_STATUS);
    const stateTaxRate = getStateTaxRate(city.stateCode);
    const stateTax = SALARY * stateTaxRate;
    const fica = calculateFICATax(SALARY);
    const totalTax = federalTax + stateTax + fica.total;
    const netAnnual = SALARY - totalTax;
    const netMonthly = netAnnual / 12;
    const effectiveTaxRate = (totalTax / SALARY) * 100;

    const rent = city.medianRent1br || city.medianRent2br || 1000;
    const rentBurden = (rent / netMonthly) * 100;
    let status: 'healthy' | 'caution' | 'stressed' = 'healthy';
    if (rentBurden > 40) status = 'stressed';
    else if (rentBurden > 30) status = 'caution';

    const colIndex = city.colIndex;
    const colAdjusted = Math.round((SALARY / colIndex) * 100);

    const monthlyLeftover = netMonthly - rent;

    // Wage Power Score for $100K
    const disposableFactor = Math.min(1, monthlyLeftover / 4000);
    const colFactor = Math.min(1, 120 / colIndex);
    const taxEfficiencyFactor = Math.max(0, 1 - (effectiveTaxRate / 45));
    const rentFactor = Math.max(0, 1 - (rentBurden / 50));

    const wagePowerScore = Math.round(
      Math.min(100, Math.max(0,
        disposableFactor * 35 +
        colFactor * 25 +
        taxEfficiencyFactor * 20 +
        rentFactor * 20
      ))
    );

    return {
      rank: 0,
      slug: city.slug,
      city: city.name,
      stateCode: city.stateCode,
      netMonthly,
      netAnnual,
      effectiveTaxRate,
      rentBurden,
      colAdjusted,
      colIndex,
      wagePowerScore,
      monthlyLeftover,
      medianRent: rent,
      status,
    };
  });

  // Sort by wage power score descending
  results.sort((a, b) => b.wagePowerScore - a.wagePowerScore || b.netMonthly - a.netMonthly);

  // Assign ranks
  results.forEach((r, i) => { r.rank = i + 1; });

  return results;
}

/* ─── table row ─── */
function RankingTableRow({ city, index }: { city: City100KRanking; index: number }) {
  const isTop3 = city.rank <= 3;
  const rankBorderColors = ['border-l-[#0B1E3C]', 'border-l-[#2563EB]', 'border-l-[#047857]'];
  const rankBgColors = ['bg-navy', 'bg-[#475569]', 'bg-[#64748B]'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.02, 0.5) }}
    >
      <Link
        to={`/cities/${city.slug}`}
        className={`flex items-center h-[60px] border-b border-[#E2E8F0] hover:bg-white transition-colors duration-150 px-3 -mx-3 ${
          isTop3 ? `border-l-[3px] ${rankBorderColors[city.rank - 1]}` : ''
        }`}
      >
        {/* Rank */}
        <div className="w-14 shrink-0 flex items-center justify-center">
          {isTop3 ? (
            <div className={`w-7 h-7 ${rankBgColors[city.rank - 1]} rounded-full flex items-center justify-center`}>
              <span className="text-xs font-bold text-white">{city.rank}</span>
            </div>
          ) : (
            <span className="text-sm font-mono text-[#94A3B8]">{city.rank}</span>
          )}
        </div>

        {/* City */}
        <div className="flex-[1.5] min-w-[140px] flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <div className="min-w-0">
            <span className="text-sm font-semibold text-[#0F172A] truncate block">
              {city.city}
            </span>
            <span className="text-xs text-[#64748B]">{city.stateCode}</span>
          </div>
        </div>

        {/* Net Monthly */}
        <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden sm:block">
          <span className="text-sm font-mono font-semibold text-[#0F172A]">
            {formatCurrency(city.netMonthly)}
          </span>
          <span className="block text-[11px] text-[#94A3B8]">/mo take-home</span>
        </div>

        {/* COL Adjusted — arrow: ↑ green when purchasing power >= salary, ↓ red otherwise */}
        <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden md:block">
          <div className="flex items-center justify-end gap-1">
            {city.colAdjusted >= 100000 ? (
              <ArrowUp className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span className={`text-sm font-mono font-medium ${city.colAdjusted >= 100000 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${city.colAdjusted.toLocaleString()}
            </span>
          </div>
          <span className="block text-[11px] text-[#94A3B8]">purchasing power</span>
        </div>

        {/* Rent Burden */}
        <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden md:block">
          <div className="flex items-center justify-end gap-2">
            <span
              className="text-sm font-mono font-semibold"
              style={{ color: getRentBurdenColor(city.rentBurden) }}
            >
              {city.rentBurden.toFixed(1)}%
            </span>
            <StatusPill status={city.status}>
              {city.status === 'healthy' ? 'Healthy' : city.status === 'caution' ? 'Caution' : 'Stressed'}
            </StatusPill>
          </div>
        </div>

        {/* Monthly Leftover */}
        <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden lg:block">
          <span className="text-sm font-mono font-medium text-[#0F172A]">
            {formatCurrency(city.monthlyLeftover)}
          </span>
          <span className="block text-[11px] text-[#94A3B8]">after rent</span>
        </div>

        {/* Wage Power Score */}
        <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden lg:block">
          <div className="flex items-center justify-end gap-3">
            <span className="text-sm font-mono font-semibold text-[#0F172A]">
              {city.wagePowerScore}
            </span>
            <div className="w-[50px] h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${city.wagePowerScore}%`,
                  backgroundColor: getBarColor(city.wagePowerScore),
                }}
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── main component ─── */
export default function BestCities100k() {
  const [sortBy, setSortBy] = useState<SortField>('wagePower');

  // Compute per-city rankings inside useMemo for proper per-row calculation
  const rankingsData = useMemo(() => compute100KRankings(), []);

  const sortedData = useMemo(() => {
    const data = [...rankingsData];
    switch (sortBy) {
      case 'wagePower':
        return data.sort((a, b) => b.wagePowerScore - a.wagePowerScore);
      case 'takeHome':
        return data.sort((a, b) => b.netMonthly - a.netMonthly);
      case 'rentBurden':
        return data.sort((a, b) => b.rentBurden - a.rentBurden);
      case 'colAdjusted':
        return data.sort((a, b) => b.colAdjusted - a.colAdjusted);
      case 'leftover':
        return data.sort((a, b) => b.monthlyLeftover - a.monthlyLeftover);
      default:
        return data;
    }
  }, [sortBy]);

  const top10 = useMemo(() => sortedData.slice(0, 10), [sortedData]);

  // Key stats
  const bestCity = sortedData[0];
  const highestTakeHome = [...sortedData].sort((a, b) => b.netMonthly - a.netMonthly)[0];
  const lowestRentBurden = [...sortedData].sort((a, b) => a.rentBurden - b.rentBurden)[0];

  return (
    <Layout>
      {/* Section 1: Page Header */}
      <section className="bg-white">
        <div className="container-page pt-8 pb-6 lg:pt-12 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
              <Link to="/leaderboards" className="hover:text-navy transition-colors">
                Leaderboards
              </Link>
              <span>/</span>
              <span className="text-[#0F172A]">Best Cities for $100K Salary</span>
            </div>

            <h1 className="text-[32px] lg:text-[40px] font-bold text-[#0F172A] leading-tight tracking-[-0.01em] mb-3">
              Best Cities for a $100K Salary
            </h1>
            <p className="text-base text-[#475569] max-w-[640px] leading-relaxed">
              Where a six-figure salary delivers the most purchasing power and quality of life after taxes, rent, and cost of living.
            </p>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
            className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-[#047857]" />
                <span className="text-[13px] font-medium text-[#475569]">Best Overall</span>
              </div>
              <span className="text-lg font-semibold font-mono text-[#0F172A] leading-tight block">
                {bestCity?.city}, {bestCity?.stateCode}
              </span>
              <span className="text-sm font-mono text-[#047857]">Score: {bestCity?.wagePowerScore}</span>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                <span className="text-[13px] font-medium text-[#475569]">Highest Take-Home</span>
              </div>
              <span className="text-lg font-semibold font-mono text-[#0F172A] leading-tight block">
                {highestTakeHome?.city}, {highestTakeHome?.stateCode}
              </span>
              <span className="text-sm font-mono text-[#2563EB]">{formatCurrency(highestTakeHome?.netMonthly || 0)}/mo</span>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDown className="w-4 h-4 text-[#047857]" />
                <span className="text-[13px] font-medium text-[#475569]">Lowest Rent Burden</span>
              </div>
              <span className="text-lg font-semibold font-mono text-[#0F172A] leading-tight block">
                {lowestRentBurden?.city}, {lowestRentBurden?.stateCode}
              </span>
              <span className="text-sm font-mono text-[#047857]">{lowestRentBurden?.rentBurden.toFixed(1)}%</span>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#64748B]" />
                <span className="text-[13px] font-medium text-[#475569]">Cities Ranked</span>
              </div>
              <span className="text-[24px] lg:text-[28px] font-bold font-mono text-[#0F172A] leading-none">
                {sortedData.length}
              </span>
              <p className="text-xs text-[#64748B] mt-1.5">metro areas</p>
            </div>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-3"
          >
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="input-base pr-10 appearance-none cursor-pointer min-w-[200px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>
          </motion.div>

          <p className="mt-2 text-xs text-[#64748B]">
            Assumptions: $100,000 annual salary, Single filing, 1BR rent. Showing {sortedData.length} cities
          </p>

          {/* Spot-check: 5 cities with different take-homes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {[
              sortedData.find((c) => c.stateCode === 'TX'),
              sortedData.find((c) => c.stateCode === 'CA'),
              sortedData.find((c) => c.stateCode === 'NY'),
              sortedData.find((c) => c.stateCode === 'IL'),
              sortedData.find((c) => c.stateCode === 'AZ'),
            ]
              .filter(Boolean)
              .slice(0, 5)
              .map((city) => (
                <Link
                  key={city!.slug}
                  to={`/cities/${city!.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] hover:bg-[#DBEAFE] border border-[#E2E8F0] rounded-lg text-xs transition-colors"
                  title={`${city!.city}, ${city!.stateCode}: ${formatCurrency(city!.netMonthly)}/mo take-home`}
                >
                  <span className="font-medium text-[#0F172A]">{city!.city}</span>
                  <span className="text-[#64748B]">{city!.stateCode}</span>
                  <span className="font-mono font-semibold text-[#0B1E3C] tabular-nums">{formatCurrency(city!.netMonthly)}</span>
                </Link>
              ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Ranking Table */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-6 lg:py-8">
          {/* Table Header */}
          <div className="flex items-center h-10 px-3 -mx-3 border-b border-[#E2E8F0] text-xs font-medium text-[#64748B] uppercase tracking-wider">
            <div className="w-14 shrink-0 text-center">Rank</div>
            <div className="flex-[1.5] min-w-[140px]">City</div>
            <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden sm:block">
              Net Monthly
            </div>
            <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden md:block">
              COL Adjusted
            </div>
            <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden md:block">
              Rent Burden
            </div>
            <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden lg:block">
              Leftover
            </div>
            <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden lg:block">
              Wage Power
            </div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#E2E8F0]">
            {sortedData.map((city, i) => (
              <RankingTableRow key={city.slug} city={city} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Top 10 Chart */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h3 className="text-xl font-semibold text-[#0F172A] mb-6">
              Top 10 Cities by Wage Power Score ($100K Salary)
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top10}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="city"
                    tick={{ fontSize: 12, fill: '#0F172A', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      padding: '12px',
                    }}
                    formatter={(value: number) => [`Score: ${value}`, '']}
                  />
                  <Bar dataKey="wagePowerScore" radius={[0, 4, 4, 0]}>
                    {top10.map((_entry, index) => (
                      <Cell key={index} fill={index < 3 ? '#0B1E3C' : '#94A3B8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: CTA */}
      <section className="bg-[#0B1E3C]">
        <div className="container-page py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-[640px] mx-auto text-center"
          >
            <h2 className="text-[24px] lg:text-[28px] font-semibold text-white mb-3 leading-tight">
              See what your salary is worth
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Use our calculator to compare your actual salary across any city.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-sm rounded-lg transition-colors duration-150"
            >
              Go to Calculator
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
