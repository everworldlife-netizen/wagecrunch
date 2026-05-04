import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine,
} from 'recharts';
import { ArrowLeft, TrendingDown, DollarSign } from 'lucide-react';
import Layout from '@/components/Layout';
import { getCityBySlug } from '@/data/cities';
import { getCityDetailBySlug } from '@/data/cityDetailData';
import { useCalculator } from '@/hooks/useCalculator';

function getRentBurdenStatus(burden: number) {
  if (burden < 20) return { status: 'healthy' as const, label: 'Low' };
  if (burden < 30) return { status: 'caution' as const, label: 'Moderate' };
  return { status: 'stressed' as const, label: 'High' };
}

export default function CityDetail() {
  const { slug } = useParams<{ slug: string }>();
  const city = getCityBySlug(slug || '');
  const detail = getCityDetailBySlug(slug || '');
  const [showAllJobs] = useState(false);
  const [salaryInput, setSalaryInput] = useState('');
  const [calcJob, setCalcJob] = useState('');

  const {
    inputs,
    updateInput,
    result,
    showResults,
    crunch,
  } = useCalculator();

  // Pre-fill calculator with this city
  useMemo(() => {
    if (city && inputs.citySlug !== city.slug) {
      updateInput('citySlug', city.slug);
      updateInput('monthlyRent', city.medianRent2br);
    }
  }, [city]);

  // Generate top occupations from detail or fallback
  const topOccupations = useMemo(() => {
    if (detail?.topOccupations) return detail.topOccupations;
    return [];
  }, [detail]);

  // Generate COL breakdown from detail or fallback
  const colBreakdown = useMemo(() => {
    if (detail?.colBreakdown) return detail.colBreakdown;
    const baseCol = city?.colIndex || 100;
    return [
      { category: 'Housing', percentage: Math.round(baseCol * 1.2), color: baseCol > 110 ? '#DC2626' : '#F97316' },
      { category: 'Transportation', percentage: Math.round(baseCol * 0.95), color: '#64748B' },
      { category: 'Groceries', percentage: Math.round(baseCol * 1.02), color: '#F97316' },
      { category: 'Healthcare', percentage: Math.round(baseCol * 0.94), color: '#047857' },
      { category: 'Utilities', percentage: Math.round(baseCol * 0.98), color: '#64748B' },
      { category: 'Misc', percentage: Math.round(baseCol * 1.04), color: '#F97316' },
    ];
  }, [detail, city]);

  // Rent by bedroom data
  const rentData = useMemo(() => {
    if (detail?.rentByBedroom) return detail.rentByBedroom;
    const rent2br = city?.medianRent2br || 1450;
    return [
      { size: 'Studio', rent: Math.round(rent2br * 0.65) },
      { size: '1 BR', rent: Math.round(rent2br * 0.8) },
      { size: '2 BR', rent: rent2br },
      { size: '3 BR', rent: Math.round(rent2br * 1.35) },
      { size: '4 BR', rent: Math.round(rent2br * 1.65) },
    ];
  }, [detail, city]);

  const nationalRentAvg = detail?.nationalRentAvg || 1450;
  const rentBurdenStatus = getRentBurdenStatus(detail?.rentBurden || 22);

  const handleInlineCalculate = () => {
    if (salaryInput) {
      updateInput('salary', parseFloat(salaryInput));
      if (calcJob) updateInput('jobTitle', calcJob);
      crunch();
    }
  };

  if (!city) {
    return (
      <Layout>
        <div className="container-page py-16 text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">City Not Found</h1>
          <p className="text-[#475569] mb-6">The city you are looking for does not exist in our database.</p>
          <Link to="/cities" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Cities
          </Link>
        </div>
      </Layout>
    );
  }

  const displayedJobs = showAllJobs ? topOccupations : topOccupations.slice(0, 10);

  return (
    <Layout>
      {/* Section 1: City Header */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-14">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/cities" className="text-xs text-[#64748B] hover:text-navy transition-colors inline-flex items-center gap-1">
              Cities <span className="text-[#94A3B8]">→</span> <span className="text-[#0F172A]">{city.name}, {city.state}</span>
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
            className="mt-4"
          >
            <h1 className="text-[36px] lg:text-[40px] font-bold text-[#0F172A] tracking-[-0.01em] leading-tight">
              {city.name}, {city.state}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs text-[#64748B] bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-full">
                {detail?.metroArea || `${city.name} MSA`}
              </span>
              <span className="text-xs text-[#64748B]">
                {detail?.metroPopulation || '2.0M'} metro
              </span>
            </div>
          </motion.div>

          {/* Key stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8"
          >
            {[
              {
                label: 'Cost of Living',
                value: city.colIndex > 100 ? `+${(city.colIndex - 100).toFixed(1)}%` : `${(city.colIndex - 100).toFixed(1)}%`,
                sub: 'vs national avg',
                color: '#2563EB',
              },
              {
                label: 'Median Rent (2BR)',
                value: `$${city.medianRent2br.toLocaleString()}`,
                sub: 'per month',
                color: '#F97316',
              },
              {
                label: 'Median Household Income',
                value: `$${(city.medianIncome / 1000).toFixed(0)}k`,
                sub: 'metro area',
                color: '#2563EB',
              },
              {
                label: 'Rent Burden',
                value: `${detail?.rentBurden || 22}%`,
                sub: 'of median income',
                color: rentBurdenStatus.status === 'healthy' ? '#047857' : rentBurdenStatus.status === 'caution' ? '#F97316' : '#DC2626',
              },
              {
                label: 'Wage Power Score',
                value: `${detail?.wagePowerScore || 70}`,
                sub: '/100',
                color: (detail?.wagePowerScore || 70) >= 75 ? '#047857' : (detail?.wagePowerScore || 70) >= 60 ? '#F97316' : '#DC2626',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.15 + i * 0.06 }}
                className="card-base"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-[13px] font-medium text-[#475569]">{stat.label}</span>
                </div>
                <p className="text-[20px] lg:text-[24px] font-bold font-mono text-[#0F172A] leading-none tracking-[-0.01em]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#64748B] mt-1.5">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Cost of Living Breakdown */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COL Category Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="card-base"
            >
              <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Cost of Living by Category</h3>
              <p className="text-sm text-[#475569] mb-6">Percentage of national average (100% = national average)</p>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={colBreakdown}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 200]}
                      tickFormatter={(v: number) => `${v}%`}
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 13, fill: '#0F172A', fontFamily: 'Geist, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      width={100}
                    />
                    <ReferenceLine x={100} stroke="#94A3B8" strokeDasharray="4 4" />
                    <Tooltip
                      formatter={(value: number) => [`${value}% of national average`, '']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 6, 6, 0]}>
                      {colBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#047857]" /> Below avg</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F97316]" /> Slightly above</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Well above</span>
                <span className="flex items-center gap-1 ml-auto"><span className="w-4 h-0 border-t border-dashed border-[#94A3B8]" /> National avg</span>
              </div>
            </motion.div>

            {/* Rent by Bedroom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="card-base"
            >
              <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Median Rent by Bedrooms</h3>
              <p className="text-sm text-[#475569] mb-6">HUD Fair Market Rent estimates</p>

              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rentData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="size"
                      tick={{ fontSize: 13, fill: '#475569', fontFamily: 'Geist, sans-serif' }}
                      axisLine={{ stroke: '#E2E8F0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(v: number) => `$${v}`}
                      tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'Geist Mono, monospace' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine y={nationalRentAvg} stroke="#94A3B8" strokeDasharray="4 4" />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Rent']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="rent" fill="#0B1E3C" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-[#94A3B8] mt-3 text-center">
                Dashed line = national average (${nationalRentAvg.toLocaleString()})
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: Inline Calculator */}
      <section className="bg-white">
        <div className="container-page py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-[28px] lg:text-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
              What Would You Earn in {city.name}?
            </h2>
            <p className="text-[#475569] mt-2 text-base">
              Enter your salary to see your real take-home pay, rent burden, and wage power in this city.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="card-base mt-8"
          >
            {/* Input rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Annual Salary</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="number"
                    placeholder="e.g. 85000"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    className="input-base w-full pl-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleInlineCalculate()}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Job Title (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={calcJob}
                  onChange={(e) => setCalcJob(e.target.value)}
                  className="input-base w-full"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Filing Status</label>
                <select
                  value={inputs.filingStatus}
                  onChange={(e) => updateInput('filingStatus', e.target.value as 'single' | 'married_jointly' | 'married_separately' | 'head_of_household')}
                  className="input-base w-full appearance-none cursor-pointer"
                >
                  <option value="single">Single</option>
                  <option value="married_jointly">Married Filing Jointly</option>
                  <option value="married_separately">Married Filing Separately</option>
                  <option value="head_of_household">Head of Household</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#475569] mb-1.5">Monthly Rent</label>
                <input
                  type="number"
                  value={inputs.monthlyRent}
                  onChange={(e) => updateInput('monthlyRent', parseFloat(e.target.value) || 0)}
                  className="input-base w-full"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleInlineCalculate}
                className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <TrendingDown className="w-4 h-4" />
                Crunch My Wage
              </button>
            </div>

            {/* Results preview */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="mt-8 pt-6 border-t border-[#E2E8F0]"
              >
                <h4 className="text-[16px] font-semibold text-[#0F172A] mb-4">Your Results in {city.name}</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Net Monthly', value: `$${Math.round(result.netMonthly).toLocaleString()}`, sub: 'after taxes', color: '#2563EB' },
                    { label: 'Effective Tax Rate', value: `${result.effectiveTaxRate.toFixed(1)}%`, sub: 'federal + state + FICA', color: '#F97316' },
                    { label: 'Rent Burden', value: `${result.rentBurdenPercent.toFixed(1)}%`, sub: 'of net income', color: result.rentBurdenStatus === 'healthy' ? '#047857' : result.rentBurdenStatus === 'caution' ? '#F97316' : '#DC2626' },
                    { label: 'Wage Power Score', value: `${result.wagePowerScore}`, sub: result.wagePowerLabel, color: result.wagePowerScore >= 75 ? '#047857' : result.wagePowerScore >= 60 ? '#F97316' : '#DC2626' },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4">
                      <p className="text-[12px] text-[#94A3B8] uppercase tracking-wider font-medium">{metric.label}</p>
                      <p className="text-[22px] font-bold font-mono text-[#0F172A] mt-1" style={{ color: metric.color }}>
                        {metric.value}
                      </p>
                      <p className="text-xs text-[#64748B] mt-0.5">{metric.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-3 text-sm text-[#475569]">
                  <span className="w-2 h-2 rounded-full bg-emerald" />
                  <span>
                    COL-adjusted salary: <strong className="text-[#0F172A]">${Math.round(result.colAdjustedSalary).toLocaleString()}</strong>
                    {' '}({result.colAdjustmentPercent > 0 ? '+' : ''}{result.colAdjustmentPercent.toFixed(1)}% vs national)
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Section 4: Top Occupations */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-[28px] lg:text-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
              Best-Paying Jobs in {city.name}
            </h2>
            <p className="text-[#475569] mt-2 text-base">
              Top occupations ranked by cost-of-living adjusted wages.
            </p>
          </motion.div>

          {topOccupations.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="mt-8 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-card"
            >
              {/* Table header */}
              <div className="grid grid-cols-[40px_1fr_100px_100px_90px_70px] sm:grid-cols-[48px_1fr_120px_120px_100px_80px] gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-medium text-[#475569] uppercase tracking-wider">
                <div>Rank</div>
                <div>Job Title</div>
                <div className="text-right">Median Wage</div>
                <div className="text-right hidden sm:block">COL-Adjusted</div>
                <div className="text-right">Wage Power</div>
                <div className="text-right">Demand</div>
              </div>

              {/* Rows */}
              {displayedJobs.map((job, i) => (
                <motion.div
                  key={job.slug}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(i * 0.03, 0.3) }}
                >
                  <Link
                    to={`/jobs/${job.slug}`}
                    className="grid grid-cols-[40px_1fr_100px_100px_90px_70px] sm:grid-cols-[48px_1fr_120px_120px_100px_80px] gap-2 sm:gap-3 px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-150 items-center"
                  >
                    <div>
                      {job.rank <= 3 ? (
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${
                          job.rank === 1 ? 'bg-navy' : job.rank === 2 ? 'bg-[#475569]' : 'bg-[#64748B]'
                        }`}>
                          <span className="text-[10px] sm:text-xs font-bold text-white">{job.rank}</span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-mono text-[#64748B] pl-1.5">{job.rank}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#0F172A]">{job.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono font-medium text-[#0F172A]">${(job.medianWage / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="text-sm font-mono text-[#475569]">${(job.colAdjusted / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center justify-center w-9 h-5 rounded-full text-[11px] font-mono font-semibold ${
                        job.wagePower >= 80 ? 'bg-[#ECFDF5] text-[#065F46]' :
                        job.wagePower >= 65 ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                        job.wagePower >= 50 ? 'bg-[#FFF7ED] text-[#C2410C]' :
                        'bg-[#FEF2F2] text-[#B91C1C]'
                      }`}>{job.wagePower}</span>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        job.demand === 'High' ? 'bg-[#047857]' :
                        job.demand === 'Medium' ? 'bg-[#94A3B8]' : 'bg-[#DC2626]'
                      }`} />
                      <span className="text-xs text-[#64748B] ml-1.5 hidden sm:inline">{job.demand}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="mt-8 card-base text-center py-12">
              <p className="text-[#475569]">Top occupation data for this city is being updated with the latest BLS wage surveys.</p>
            </div>
          )}

          {/* Wage Power by Occupation chart */}
          {topOccupations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="mt-8 card-base"
            >
              <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Wage Power by Occupation</h3>
              <p className="text-sm text-[#475569] mb-6">Higher scores mean your salary goes further.</p>
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[...topOccupations]
                      .sort((a, b) => b.wagePower - a.wagePower)
                      .slice(0, 10)
                      .map(o => ({ name: o.title, score: o.wagePower, slug: o.slug }))}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#94A3B8' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#0F172A', fontFamily: 'Geist, sans-serif' }}
                      axisLine={false}
                      tickLine={false}
                      width={130}
                    />
                    <Tooltip
                      formatter={(value: number) => [value, 'Wage Power']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                      {topOccupations.slice().sort((a, b) => b.wagePower - a.wagePower).slice(0, 10).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.wagePower >= 80 ? '#047857' :
                            entry.wagePower >= 65 ? '#2563EB' :
                            entry.wagePower >= 50 ? '#F97316' :
                            '#DC2626'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Section 5: City Comparison CTA */}
      <section className="bg-navy">
        <div className="container-page py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="max-w-[640px] mx-auto text-center"
          >
            <h2 className="text-[28px] lg:text-[32px] font-semibold text-white tracking-[-0.01em]">
              How does {city.name} compare?
            </h2>
            <p className="text-[#94A3B8] mt-3 text-base">
              See side-by-side comparisons with other cities for any salary and job.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={`/calculator?city=${city.slug}`}
                className="inline-flex items-center gap-2 h-12 px-6 bg-emerald text-white rounded-lg font-semibold text-[15px] hover:bg-emerald-dark transition-colors duration-150 active:scale-[0.98]"
              >
                Compare with {city.name}
              </Link>
              <Link
                to="/leaderboards"
                className="inline-flex items-center h-12 px-6 bg-white/10 text-white rounded-lg font-medium text-[15px] hover:bg-white/20 transition-colors duration-150"
              >
                View Leaderboards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
