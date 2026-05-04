import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Home,
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
  ReferenceLine,
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

function getBurdenColor(pct: number): string {
  if (pct < 30) return '#047857';
  if (pct < 40) return '#F97316';
  return '#DC2626';
}

function getBurdenLabel(pct: number): string {
  if (pct < 30) return 'Healthy';
  if (pct < 40) return 'Caution';
  return 'Stressed';
}

type SortField = 'rentBurden' | 'medianIncome' | 'medianRent' | 'monthlyLeftover' | 'cityName';

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'rentBurden', label: 'Highest Rent Burden' },
  { value: 'medianRent', label: 'Highest Rent' },
  { value: 'medianIncome', label: 'Lowest Income' },
  { value: 'monthlyLeftover', label: 'Lowest Leftover' },
  { value: 'cityName', label: 'City Name' },
];

/* ─── Compute rent burden rankings ─── */
const SALARY = 75000;
const FILING_STATUS = 'single' as const;

interface RentBurdenRanking {
  rank: number;
  slug: string;
  city: string;
  stateCode: string;
  medianIncome: number;
  medianRent: number;
  netMonthly: number;
  rentBurden: number;
  monthlyLeftover: number;
  rentToIncomeRatio: number;
  status: 'healthy' | 'caution' | 'stressed';
  colIndex: number;
  population: number;
}

function computeRentBurdenRankings(): RentBurdenRanking[] {
  const brackets = federalTaxBrackets2024[FILING_STATUS];
  const standardDeduction = brackets.standardDeduction;

  const results = cities.map((city) => {
    const federalTaxableIncome = Math.max(0, SALARY - standardDeduction);
    const federalTax = calculateFederalTax(federalTaxableIncome, FILING_STATUS);
    const stateTaxRate = getStateTaxRate(city.stateCode);
    const stateTax = SALARY * stateTaxRate;
    const fica = calculateFICATax(SALARY);
    const totalTax = federalTax + stateTax + fica.total;
    const netAnnual = SALARY - totalTax;
    const netMonthly = netAnnual / 12;

    const rent = city.medianRent1br || city.medianRent2br || 1000;
    const rentBurden = (rent / netMonthly) * 100;
    const monthlyLeftover = netMonthly - rent;
    const rentToIncomeRatio = (rent / (SALARY / 12)) * 100;

    let status: 'healthy' | 'caution' | 'stressed' = 'healthy';
    if (rentBurden > 40) status = 'stressed';
    else if (rentBurden > 30) status = 'caution';

    return {
      rank: 0,
      slug: city.slug,
      city: city.name,
      stateCode: city.stateCode,
      medianIncome: city.medianIncome,
      medianRent: rent,
      netMonthly,
      rentBurden,
      monthlyLeftover,
      rentToIncomeRatio,
      status,
      colIndex: city.colIndex,
      population: city.population,
    };
  });

  // Sort by rent burden descending (most burdened first)
  results.sort((a, b) => b.rentBurden - a.rentBurden);

  // Assign ranks
  results.forEach((r, i) => { r.rank = i + 1; });

  return results;
}

const rankingsData = computeRentBurdenRankings();

/* ─── Distribution data for histogram ─── */
const burdenDistribution = [
  { label: '<20%', min: 0, max: 20, count: 0, color: '#047857' },
  { label: '20-30%', min: 20, max: 30, count: 0, color: '#047857' },
  { label: '30-40%', min: 30, max: 40, count: 0, color: '#F97316' },
  { label: '40-50%', min: 40, max: 50, count: 0, color: '#DC2626' },
  { label: '50%+', min: 50, max: 999, count: 0, color: '#DC2626' },
];

// Pre-compute bucket counts
rankingsData.forEach((c) => {
  const bucket = burdenDistribution.find((b) => c.rentBurden >= b.min && c.rentBurden < b.max);
  if (bucket) bucket.count++;
});

/* ─── table row ─── */
function RankingTableRow({ city, index }: { city: RentBurdenRanking; index: number }) {
  const isTop3 = city.rank <= 3;
  const isStressed = city.status === 'stressed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(index * 0.02, 0.5) }}
    >
      <Link
        to={`/cities/${city.slug}`}
        className={`flex items-center h-[60px] border-b border-[#E2E8F0] hover:bg-white transition-colors duration-150 px-3 -mx-3 ${
          isTop3 ? 'border-l-[3px] border-l-[#DC2626]' : ''
        } ${isStressed ? 'bg-[#FEF2F2]/50' : ''}`}
      >
        {/* Rank */}
        <div className="w-14 shrink-0 flex items-center justify-center">
          {isTop3 ? (
            <div className="w-7 h-7 bg-[#DC2626] rounded-full flex items-center justify-center">
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

        {/* Rent Burden — visual anchor */}
        <div className="w-[130px] lg:w-[150px] shrink-0 text-right hidden sm:block">
          <div className="flex items-center justify-end gap-2">
            <span
              className="text-lg font-mono font-bold"
              style={{ color: getBurdenColor(city.rentBurden) }}
            >
              {city.rentBurden.toFixed(1)}%
            </span>
            <StatusPill status={city.status}>{getBurdenLabel(city.rentBurden)}</StatusPill>
          </div>
        </div>

        {/* Median Rent */}
        <div className="w-[100px] lg:w-[120px] shrink-0 text-right hidden sm:block">
          <span className="text-sm font-mono font-medium text-[#0F172A]">
            {formatCurrency(city.medianRent)}
          </span>
          <span className="block text-[11px] text-[#94A3B8]">1BR est.</span>
        </div>

        {/* Net Monthly */}
        <div className="w-[110px] lg:w-[130px] shrink-0 text-right hidden md:block">
          <span className="text-sm font-mono font-medium text-[#0F172A]">
            {formatCurrency(city.netMonthly)}
          </span>
          <span className="block text-[11px] text-[#94A3B8]">take-home</span>
        </div>

        {/* Monthly Leftover */}
        <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden lg:block">
          <div className="flex items-center justify-end gap-1">
            {city.monthlyLeftover < 0 ? (
              <ArrowDown className="w-3.5 h-3.5 text-[#DC2626]" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-[#047857]" />
            )}
            <span className={`text-sm font-mono font-medium ${city.monthlyLeftover < 0 ? 'text-[#DC2626]' : 'text-[#0F172A]'}`}>
              {formatCurrency(Math.abs(city.monthlyLeftover))}
            </span>
          </div>
          <span className="block text-[11px] text-[#94A3B8]">after rent</span>
        </div>

        {/* COL Index */}
        <div className="w-[80px] lg:w-[90px] shrink-0 text-right hidden lg:block">
          <span className="text-sm font-mono text-[#475569]">{city.colIndex}</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── main component ─── */
export default function RentBurdenedCities() {
  const [sortBy, setSortBy] = useState<SortField>('rentBurden');

  const sortedData = useMemo(() => {
    const data = [...rankingsData];
    switch (sortBy) {
      case 'rentBurden':
        return data.sort((a, b) => b.rentBurden - a.rentBurden);
      case 'medianRent':
        return data.sort((a, b) => b.medianRent - a.medianRent);
      case 'medianIncome':
        return data.sort((a, b) => a.medianIncome - b.medianIncome);
      case 'monthlyLeftover':
        return data.sort((a, b) => a.monthlyLeftover - b.monthlyLeftover);
      case 'cityName':
        return data.sort((a, b) => a.city.localeCompare(b.city));
      default:
        return data;
    }
  }, [sortBy]);

  // Key stats
  const mostBurdened = sortedData[0];
  const stressedCount = sortedData.filter((c) => c.status === 'stressed').length;
  const cautionCount = sortedData.filter((c) => c.status === 'caution').length;
  const avgBurden = sortedData.reduce((sum, c) => sum + c.rentBurden, 0) / sortedData.length;

  // Top 15 most burdened for chart
  const top15 = useMemo(() => sortedData.slice(0, 15), [sortedData]);

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
              <span className="text-[#0F172A]">Most Rent-Burdened Cities</span>
            </div>

            <h1 className="text-[32px] lg:text-[40px] font-bold text-[#0F172A] leading-tight tracking-[-0.01em] mb-3">
              Most Rent-Burdened Cities
            </h1>
            <p className="text-base text-[#475569] max-w-[640px] leading-relaxed">
              Cities where rent consumes the largest share of income. Assumes $75K salary, single filing, 1BR rent.
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
                <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                <span className="text-[13px] font-medium text-[#475569]">Most Burdened</span>
              </div>
              <span className="text-lg font-semibold font-mono text-[#0F172A] leading-tight block">
                {mostBurdened?.city}, {mostBurdened?.stateCode}
              </span>
              <span className="text-sm font-mono text-[#DC2626] font-bold">{mostBurdened?.rentBurden.toFixed(1)}%</span>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-4 h-4 text-[#F97316]" />
                <span className="text-[13px] font-medium text-[#475569]">Stressed Cities</span>
              </div>
              <span className="text-[24px] lg:text-[28px] font-bold font-mono text-[#0F172A] leading-none">
                {stressedCount}
              </span>
              <p className="text-xs text-[#64748B] mt-1.5">&gt;40% rent burden</p>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F97316]" />
                <span className="text-[13px] font-medium text-[#475569]">Caution Zone</span>
              </div>
              <span className="text-[24px] lg:text-[28px] font-bold font-mono text-[#0F172A] leading-none">
                {cautionCount}
              </span>
              <p className="text-xs text-[#64748B] mt-1.5">30-40% rent burden</p>
            </div>

            <div className="card-base">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#64748B]" />
                <span className="text-[13px] font-medium text-[#475569]">Average Burden</span>
              </div>
              <span className="text-[24px] lg:text-[28px] font-bold font-mono text-[#0F172A] leading-none">
                {avgBurden.toFixed(1)}%
              </span>
              <p className="text-xs text-[#64748B] mt-1.5">across all cities</p>
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
            Assumptions: $75,000 annual salary, Single filing, 1BR median rent. Showing {sortedData.length} cities
          </p>
        </div>
      </section>

      {/* Section 2: Chart + Table */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-6 lg:py-8">
          {/* Top 15 Burdened Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
              Top 15 Most Rent-Burdened Cities
            </h3>
            <div className="h-[400px] bg-white rounded-xl border border-[#E2E8F0] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top15}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis
                    type="number"
                    domain={[0, 60]}
                    tickFormatter={(v: number) => `${v}%`}
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
                    formatter={(value: number) => [`${value.toFixed(1)}% rent burden`, '']}
                  />
                  <ReferenceLine x={30} stroke="#047857" strokeDasharray="6 4" />
                  <ReferenceLine x={40} stroke="#F97316" strokeDasharray="6 4" />
                  <Bar dataKey="rentBurden" radius={[0, 4, 4, 0]}>
                    {top15.map((entry, index) => (
                      <Cell key={index} fill={getBurdenColor(entry.rentBurden)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Distribution Histogram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
              Rent Burden Distribution
            </h3>
            <div className="h-[240px] bg-white rounded-xl border border-[#E2E8F0] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={burdenDistribution} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
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
                    formatter={(value: number) => [`${value} cities`, '']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {burdenDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Table Header */}
          <div className="flex items-center h-10 px-3 -mx-3 border-b border-[#E2E8F0] text-xs font-medium text-[#64748B] uppercase tracking-wider">
            <div className="w-14 shrink-0 text-center">Rank</div>
            <div className="flex-[1.5] min-w-[140px]">City</div>
            <div className="w-[130px] lg:w-[150px] shrink-0 text-right hidden sm:block">
              Rent Burden
            </div>
            <div className="w-[100px] lg:w-[120px] shrink-0 text-right hidden sm:block">
              Median Rent
            </div>
            <div className="w-[110px] lg:w-[130px] shrink-0 text-right hidden md:block">
              Net Monthly
            </div>
            <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden lg:block">
              Leftover
            </div>
            <div className="w-[80px] lg:w-[90px] shrink-0 text-right hidden lg:block">
              COL Index
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

      {/* Section 3: CTA */}
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
              Check your rent burden
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              See what percentage of your take-home pay goes to rent in any city.
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
