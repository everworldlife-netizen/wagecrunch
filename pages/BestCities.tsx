import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Search,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ReferenceLine,
  ZAxis,
  Cell,
} from 'recharts';
import Layout from '@/components/Layout';
import StatusPill from '@/components/StatusPill';
import { bestCitiesForJobData } from '@/data/leaderboardData';
import type { LeaderboardCity } from '@/data/leaderboardData';
import type { SortOption, ExperienceLevel, HouseholdType } from '@/data/leaderboardData';


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

/* ─── filter options ─── */
const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'entry', label: 'Entry-Level (0-2 yrs)' },
  { value: 'mid', label: 'Mid-Level (3-5 yrs)' },
  { value: 'senior', label: 'Senior (6-10 yrs)' },
  { value: 'executive', label: 'Executive (10+ yrs)' },
];

const householdOptions: { value: HouseholdType; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married (no kids)' },
  { value: 'family', label: 'Family (2 kids)' },
  { value: 'singleParent', label: 'Single Parent' },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'wagePower', label: 'Wage Power Score' },
  { value: 'takeHome', label: 'Net Monthly Pay' },
  { value: 'rentBurden', label: 'Rent Burden' },
  { value: 'colScore', label: 'Cost of Living' },
];

/* ─── table row component ─── */
function RankingTableRow({
  city,
  index,
}: {
  city: LeaderboardCity;
  index: number;
}) {
  const isTop3 = city.rank <= 3;
  const rankBorderColors = ['border-l-[#0B1E3C]', 'border-l-[#2563EB]', 'border-l-[#047857]'];
  const rankBgColors = ['bg-navy', 'bg-[#475569]', 'bg-[#64748B]'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: index * 0.03 }}
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
            <div
              className={`w-7 h-7 ${rankBgColors[city.rank - 1]} rounded-full flex items-center justify-center`}
            >
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

        {/* Median Wage */}
        <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden sm:block">
          <span className="text-sm font-mono font-medium text-[#0F172A]">
            {formatCurrency(city.medianWage)}
          </span>
          <span className="block text-[11px] text-[#94A3B8]">BLS est.</span>
        </div>

        {/* Real Take-Home */}
        <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden md:block">
          <span className="text-base font-mono font-semibold text-[#0F172A]">
            {formatCurrency(city.realTakeHome)}
            <span className="text-[13px] font-normal text-[#475569]">/mo</span>
          </span>
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
              {city.status === 'healthy'
                ? 'Healthy'
                : city.status === 'caution'
                ? 'Caution'
                : 'Stressed'}
            </StatusPill>
          </div>
        </div>

        {/* COL Score */}
        <div className="w-[100px] lg:w-[110px] shrink-0 text-right hidden lg:block">
          <div className="flex items-center justify-end gap-1">
            {city.colScore >= 0 ? (
              <ArrowUp className="w-3.5 h-3.5 text-[#DC2626]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-[#047857]" />
            )}
            <span
              className={`text-sm font-mono font-medium ${
                city.colScore >= 0 ? 'text-[#DC2626]' : 'text-[#047857]'
              }`}
            >
              {city.colScore >= 0 ? '+' : ''}
              {city.colScore.toFixed(1)}%
            </span>
          </div>
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
export default function BestCities() {
  const [jobTitle, setJobTitle] = useState('');
  const [experience, setExperience] = useState<ExperienceLevel>('all');
  const [household, setHousehold] = useState<HouseholdType>('single');
  const [sortBy, setSortBy] = useState<SortOption>('wagePower');

  const sortedData = useMemo(() => {
    const data = [...bestCitiesForJobData];
    switch (sortBy) {
      case 'wagePower':
        return data.sort((a, b) => b.wagePowerScore - a.wagePowerScore);
      case 'takeHome':
        return data.sort((a, b) => b.realTakeHome - a.realTakeHome);
      case 'rentBurden':
        return data.sort((a, b) => b.rentBurden - a.rentBurden);
      case 'colScore':
        return data.sort((a, b) => a.colScore - b.colScore);
      default:
        return data;
    }
  }, [sortBy]);

  const top10 = useMemo(() => sortedData.slice(0, 10), [sortedData]);

  const scatterData = useMemo(
    () =>
      sortedData.map((c) => ({
        x: c.medianWage,
        y: c.rentBurden,
        z: c.wagePowerScore,
        city: c.city,
        stateCode: c.stateCode,
        fill:
          c.rentBurden < 30
            ? '#047857'
            : c.rentBurden < 40
            ? '#F97316'
            : '#DC2626',
      })),
    [sortedData]
  );

  const activeFilters = useMemo(() => {
    const filters: { label: string; key: string }[] = [];
    if (jobTitle) filters.push({ label: `Job: "${jobTitle}"`, key: 'job' });
    if (experience !== 'all')
      filters.push({
        label: experienceOptions.find((o) => o.value === experience)?.label ?? '',
        key: 'exp',
      });
    if (household !== 'single')
      filters.push({
        label: householdOptions.find((o) => o.value === household)?.label ?? '',
        key: 'house',
      });
    return filters;
  }, [jobTitle, experience, household]);

  return (
    <Layout>
      {/* Section 1: Page Header */}
      <section className="bg-white">
        <div className="container-page pt-8 pb-6 lg:pt-12 lg:pb-8">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
              <Link to="/leaderboards" className="hover:text-navy transition-colors">
                Leaderboards
              </Link>
              <span>/</span>
              <span className="text-[#0F172A]">Best Cities for Your Job</span>
            </div>

            <h1 className="text-[32px] lg:text-[40px] font-bold text-[#0F172A] leading-tight tracking-[-0.01em] mb-3">
              Best Cities for Your Job
            </h1>
            <p className="text-base text-[#475569] max-w-[640px] leading-relaxed">
              Discover where your occupation earns the most real purchasing power
              after taxes, rent, and cost of living.
            </p>
          </motion.div>

          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {/* Job Title */}
            <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Enter a job title..."
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="input-base w-full pl-10"
              />
            </div>

            {/* Experience Level */}
            <div className="relative">
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as ExperienceLevel)}
                className="input-base pr-10 appearance-none cursor-pointer min-w-[180px]"
              >
                {experienceOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Household Type */}
            <div className="relative">
              <select
                value={household}
                onChange={(e) => setHousehold(e.target.value as HouseholdType)}
                className="input-base pr-10 appearance-none cursor-pointer min-w-[160px]"
              >
                {householdOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="input-base pr-10 appearance-none cursor-pointer min-w-[180px]"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
            </div>
          </motion.div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="mt-3 flex items-center gap-2 flex-wrap"
            >
              {activeFilters.map((f) => (
                <span
                  key={f.key}
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px] font-medium bg-[#DBEAFE] text-[#1D4ED8]"
                >
                  {f.label}
                  <button
                    onClick={() => {
                      if (f.key === 'job') setJobTitle('');
                      if (f.key === 'exp') setExperience('all');
                      if (f.key === 'house') setHousehold('single');
                    }}
                    className="hover:text-[#0F172A] transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={() => {
                  setJobTitle('');
                  setExperience('all');
                  setHousehold('single');
                }}
                className="text-xs text-[#64748B] hover:text-navy font-medium transition-colors ml-1"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* Results count */}
          <p className="mt-2 text-xs text-[#64748B]">
            Showing {sortedData.length} cities
          </p>
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
              Median Wage
            </div>
            <div className="w-[120px] lg:w-[140px] shrink-0 text-right hidden md:block">
              Real Take-Home
            </div>
            <div className="w-[110px] lg:w-[120px] shrink-0 text-right hidden md:block">
              Rent Burden
            </div>
            <div className="w-[100px] lg:w-[110px] shrink-0 text-right hidden lg:block">
              COL Score
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

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-center gap-2">
            <button className="btn-secondary h-9 px-4 text-sm opacity-50 cursor-not-allowed">
              Previous
            </button>
            <button className="h-9 w-9 rounded-lg bg-navy text-white text-sm font-medium flex items-center justify-center">
              1
            </button>
            <button className="h-9 w-9 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#475569] hover:border-navy transition-colors flex items-center justify-center">
              2
            </button>
            <button className="h-9 w-9 rounded-lg bg-white border border-[#E2E8F0] text-sm text-[#475569] hover:border-navy transition-colors flex items-center justify-center">
              3
            </button>
            <span className="text-sm text-[#94A3B8] px-1">...</span>
            <button className="btn-secondary h-9 px-4 text-sm">Next</button>
          </div>
        </div>
      </section>

      {/* Section 3: Visual Summary */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Top 10 Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h3 className="text-xl font-semibold text-[#0F172A] mb-6">
                Top 10 Cities by Wage Power Score
              </h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={top10}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#E2E8F0"
                    />
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
                      width={90}
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
                      formatter={(value: number) => [
                        `Score: ${value}`,
                        '',
                      ]}
                      labelFormatter={(label: string) => label}
                    />
                    <Bar dataKey="wagePowerScore" radius={[0, 4, 4, 0]}>
                      {top10.map((entry, index) => (
                        <Cell
                          key={entry.slug}
                          fill={index < 3 ? '#0B1E3C' : '#94A3B8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Scatter Plot */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              <h3 className="text-xl font-semibold text-[#0F172A] mb-6">
                Salary vs. Rent Burden by City
              </h3>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Median Wage"
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                      label={{
                        value: 'Median Wage',
                        position: 'insideBottom',
                        offset: -5,
                        style: { fontSize: 12, fill: '#64748B' },
                      }}
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Rent Burden %"
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                      label={{
                        value: 'Rent Burden %',
                        angle: -90,
                        position: 'insideLeft',
                        style: { fontSize: 12, fill: '#64748B' },
                      }}
                    />
                    <ZAxis type="number" dataKey="z" range={[60, 300]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        padding: '12px',
                      }}
                      formatter={(_: unknown, __: string, props: { payload?: { city?: string; stateCode?: string; x?: number; y?: number; z?: number } }) => {
                        const p = props?.payload;
                        if (!p) return [];
                        return [
                          `${p.city}, ${p.stateCode}`,
                          `Wage: ${formatCurrency(p.x ?? 0)}`,
                          `Rent Burden: ${p.y}%`,
                          `Score: ${p.z}`,
                        ];
                      }}
                    />
                    <ReferenceLine
                      y={30}
                      stroke="#94A3B8"
                      strokeDasharray="6 4"
                      label={{
                        value: 'Healthy Threshold',
                        position: 'right',
                        style: { fontSize: 11, fill: '#94A3B8' },
                      }}
                    />
                    <Scatter data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA Banner */}
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
              Compare your salary
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Use our calculator to see what your salary is really worth after taxes, rent, and cost of living in any city.
            </p>
            <Link
              to="/calculator"
              className="inline-flex items-center justify-center h-12 px-8 bg-[#047857] hover:bg-[#065F46] text-white font-semibold text-sm rounded-lg transition-colors duration-150"
            >
              Go to Calculator
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
