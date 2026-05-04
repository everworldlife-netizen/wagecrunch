import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Users, Clock, Calculator } from 'lucide-react';
import Layout from '@/components/Layout';
import { getJobBySlug } from '@/data/jobs';
import { getJobDetailBySlug } from '@/data/jobDetailData';
import { cities } from '@/data/cities';

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const job = getJobBySlug(slug || '');
  const detail = getJobDetailBySlug(slug || '');
  const [showAllCities] = useState(false);

  // Generate city rankings from data if no detail
  const cityRankings = useMemo(() => {
    if (detail?.cityRankings) return detail.cityRankings;
    // Fallback: generate from cities data
    return cities.slice(0, 10).map((city, i) => ({
      rank: i + 1,
      citySlug: city.slug,
      cityName: city.name,
      stateCode: city.stateCode,
      adjustedWage: Math.round((job?.medianSalary || 80000) * (100 / city.colIndex)),
      colAdjusted: Math.round((job?.medianSalary || 80000) * (100 / city.colIndex) * 0.85),
      rentBurden: Math.round((city.medianRent2br / ((job?.medianSalary || 80000) / 12)) * 100 * 10) / 10,
      wagePowerScore: Math.min(95, Math.round(70 + (100 - city.colIndex) * 0.3)),
    }));
  }, [detail, job]);

  const colComparison = useMemo(() => {
    if (detail?.colComparison) return detail.colComparison;
    return cities.slice(0, 6).map(city => {
      const nominal = job?.medianSalary || 80000;
      const adjusted = Math.round(nominal * (100 / city.colIndex));
      return {
        citySlug: city.slug,
        cityName: city.name,
        stateCode: city.stateCode,
        nominalSalary: nominal,
        colAdjusted: adjusted,
        difference: adjusted - nominal,
        buyingPower: Math.round(((adjusted - nominal) / nominal) * 100 * 10) / 10,
      };
    });
  }, [detail, job]);

  // Wage percentile chart data
  const percentileData = useMemo(() => {
    if (detail?.percentiles) {
      return [
        { name: '10th', value: detail.percentiles.p10, fill: '#E2E8F0' },
        { name: '25th', value: detail.percentiles.p25, fill: '#CBD5E1' },
        { name: '50th\n(Median)', value: detail.percentiles.p50, fill: '#0B1E3C' },
        { name: '75th', value: detail.percentiles.p75, fill: '#CBD5E1' },
        { name: '90th', value: detail.percentiles.p90, fill: '#E2E8F0' },
      ];
    }
    const base = job?.medianSalary || 80000;
    return [
      { name: '10th', value: Math.round(base * 0.55), fill: '#E2E8F0' },
      { name: '25th', value: Math.round(base * 0.72), fill: '#CBD5E1' },
      { name: '50th\n(Median)', value: base, fill: '#0B1E3C' },
      { name: '75th', value: Math.round(base * 1.28), fill: '#CBD5E1' },
      { name: '90th', value: Math.round(base * 1.58), fill: '#E2E8F0' },
    ];
  }, [detail, job]);

  // Chart data for top cities
  const topCitiesChartData = useMemo(() => {
    return [...cityRankings]
      .sort((a, b) => b.wagePowerScore - a.wagePowerScore)
      .slice(0, 10)
      .map(c => ({
        name: c.cityName,
        score: c.wagePowerScore,
        citySlug: c.citySlug,
      }));
  }, [cityRankings]);

  if (!job) {
    return (
      <Layout>
        <div className="container-page py-16 text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Job Not Found</h1>
          <p className="text-[#475569] mb-6">The occupation you are looking for does not exist.</p>
          <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
      </Layout>
    );
  }

  const displayedCities = showAllCities ? cityRankings : cityRankings.slice(0, 10);

  return (
    <Layout>
      {/* Section 1: Job Header */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-14">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/jobs" className="text-xs text-[#64748B] hover:text-navy transition-colors inline-flex items-center gap-1">
              Jobs <span className="text-[#94A3B8]">→</span> <span className="text-[#0F172A]">{job.title}</span>
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
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              
              <span className="text-xs text-[#64748B]">
                {detail?.categoryLabel || job.category}
              </span>
            </div>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: 'National Median', value: `$${job.medianSalary.toLocaleString()}`, sub: 'BLS annual median', icon: DollarSign, color: '#2563EB' },
              { label: 'Hourly Rate', value: detail ? `$${detail.hourlyRate.toFixed(2)}` : `$${Math.round(job.medianSalary / 2080 * 100) / 100}`, sub: 'median hourly', icon: Clock, color: '#2563EB' },
              { label: 'Job Count', value: detail?.employment || 'Not disclosed', sub: 'employed nationally', icon: Users, color: '#64748B' },
              { label: 'Growth', value: detail?.growth || '+4.2%', sub: 'projected 10-year BLS projection', icon: TrendingUp, color: detail?.growthPositive !== false ? '#047857' : '#DC2626' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.2 + i * 0.08 }}
                className="card-base"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-[13px] font-medium text-[#475569]">{stat.label}</span>
                </div>
                <p className="text-[24px] lg:text-[28px] font-bold font-mono text-[#0F172A] leading-none tracking-[-0.01em]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#64748B] mt-1.5">{stat.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 2: Wage Range Card */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="card-base"
          >
            <h2 className="text-[20px] lg:text-[24px] font-semibold text-[#0F172A]">Salary Range (National)</h2>
            <p className="text-sm text-[#475569] mt-1">
              Annual wages at different percentiles. The median (50th) means half of all {job.title}s earn less than this amount.
            </p>

            {/* Percentile Bar Chart */}
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={percentileData} barSize={60}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fill: '#475569', fontFamily: 'Geist, sans-serif' }}
                    axisLine={{ stroke: '#E2E8F0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12, fill: '#94A3B8', fontFamily: 'Geist Mono, monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Annual Wage']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                      fontFamily: 'Geist Mono, monospace',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {percentileData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Percentile labels */}
            <div className="grid grid-cols-5 gap-2 mt-4 pt-4 border-t border-[#E2E8F0]">
              {percentileData.map((p, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-[#94A3B8]">{p.name.replace('\n', ' ')}</p>
                  <p className={`text-sm font-mono font-semibold mt-0.5 ${i === 2 ? 'text-navy' : 'text-[#0F172A]'}`}>
                    ${p.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[16px] font-semibold text-[#0F172A]">See what YOUR salary is really worth</h4>
                  <p className="text-sm text-[#475569] mt-0.5">Enter your actual salary and city for a personalized breakdown.</p>
                </div>
                <Link
                  to={`/calculator?job=${job.slug}`}
                  className="btn-primary inline-flex items-center gap-2 shrink-0"
                >
                  <Calculator className="w-4 h-4" />
                  Calculate Now
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Top Cities */}
      <section className="bg-white">
        <div className="container-page py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-[28px] lg:text-[32px] font-semibold text-[#0F172A] tracking-[-0.01em]">
              Best Paying Cities for {job.title}s
            </h2>
            <p className="text-[#475569] mt-2 text-base">
              Ranked by cost-of-living adjusted wages and wage power score.
            </p>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="mt-8 bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-card"
          >
            {/* Table header */}
            <div className="grid grid-cols-[48px_1fr_120px_110px_100px] sm:grid-cols-[56px_1fr_140px_130px_120px_100px] gap-3 px-4 sm:px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-medium text-[#475569] uppercase tracking-wider">
              <div>Rank</div>
              <div>City</div>
              <div className="text-right">Adjusted Wage</div>
              <div className="text-right hidden sm:block">COL-Adjusted</div>
              <div className="text-right">Rent Burden</div>
              <div className="text-right">Wage Power</div>
            </div>

            {/* Table rows */}
            {displayedCities.map((city, i) => (
              <motion.div
                key={city.citySlug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(i * 0.03, 0.3) }}
              >
                <Link
                  to={`/cities/${city.citySlug}`}
                  className="grid grid-cols-[48px_1fr_120px_110px_100px] sm:grid-cols-[56px_1fr_140px_130px_120px_100px] gap-3 px-4 sm:px-6 py-3.5 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors duration-150 items-center"
                >
                  <div>
                    {city.rank <= 3 ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                        city.rank === 1 ? 'bg-navy' : city.rank === 2 ? 'bg-[#475569]' : 'bg-[#64748B]'
                      }`}>
                        <span className="text-xs font-bold text-white">{city.rank}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-mono text-[#64748B] pl-2">{city.rank}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-[#0F172A]">{city.cityName}</span>
                    <span className="text-xs text-[#94A3B8] ml-1">, {city.stateCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-medium text-[#0F172A]">${(city.adjustedWage / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-sm font-mono text-[#475569]">${(city.colAdjusted / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-mono ${
                      city.rentBurden > 30 ? 'text-[#DC2626]' :
                      city.rentBurden > 20 ? 'text-[#F97316]' : 'text-[#047857]'
                    }`}>{city.rentBurden}%</span>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-mono font-semibold ${
                      city.wagePowerScore >= 80 ? 'bg-[#ECFDF5] text-[#065F46]' :
                      city.wagePowerScore >= 65 ? 'bg-[#DBEAFE] text-[#1D4ED8]' :
                      city.wagePowerScore >= 50 ? 'bg-[#FFF7ED] text-[#C2410C]' :
                      'bg-[#FEF2F2] text-[#B91C1C]'
                    }`}>{city.wagePowerScore}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Horizontal bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="mt-8 card-base"
          >
            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">Wage Power Score by City</h3>
            <p className="text-sm text-[#475569] mb-6">Higher scores mean your salary goes further after adjusting for local costs.</p>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCitiesChartData}
                  layout="vertical"
                  margin={{ left: 20, right: 30 }}
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
                    tick={{ fontSize: 13, fill: '#0F172A', fontFamily: 'Geist, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    formatter={(value: number) => [value, 'Wage Power Score']}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 6, 6, 0]} fill="#0B1E3C">
                    {topCitiesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score >= 80 ? '#047857' :
                          entry.score >= 65 ? '#2563EB' :
                          entry.score >= 50 ? '#F97316' :
                          '#DC2626'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 4: Cost-of-Living Impact */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: COL Adjustment Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h3 className="text-[20px] font-semibold text-[#0F172A] mb-1">How Cost of Living Affects Your Pay</h3>
              <p className="text-sm text-[#475569] mb-6">What a ${(job?.medianSalary || 100000).toLocaleString()} salary buys in different cities.</p>

              <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-card">
                <div className="grid grid-cols-[1fr_100px_80px_90px] gap-2 px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-medium text-[#475569] uppercase tracking-wider">
                  <div>City</div>
                  <div className="text-right">Nominal</div>
                  <div className="text-right">COL-Adj.</div>
                  <div className="text-right">Buying Power</div>
                </div>
                {colComparison.map((row, i) => (
                  <motion.div
                    key={row.citySlug}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="grid grid-cols-[1fr_100px_80px_90px] gap-2 px-4 py-3 border-b border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors items-center"
                  >
                    <div>
                      <span className="text-sm font-medium text-[#0F172A]">{row.cityName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-[#0F172A]">${(row.nominalSalary / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-[#0F172A]">${(row.colAdjusted / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-mono font-semibold ${
                        row.buyingPower > 0 ? 'text-[#047857]' : 'text-[#DC2626]'
                      }`}>
                        {row.buyingPower > 0 ? '+' : ''}{row.buyingPower}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: Insight Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.15 }}
              className="card-base h-fit"
            >
              <h3 className="text-[20px] font-semibold text-[#0F172A] mb-3">The $100K Problem</h3>
              <p className="text-[#475569] text-sm leading-relaxed">
                A $100,000 salary in <span className="font-semibold text-[#0F172A]">San Francisco</span> has the same buying power
                as <span className="font-semibold text-[#0F172A]">$62,000</span> in Austin. Cost of living can cut your effective
                salary by over a third — or boost it by 40% in the right city.
              </p>

              {/* Mini comparison */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-4">
                  <p className="text-xs text-[#B91C1C] font-medium mb-1">San Francisco, CA</p>
                  <p className="text-lg font-mono font-bold text-[#0F172A]">$64k</p>
                  <p className="text-xs text-[#64748B] mt-1">Effective buying power</p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span className="text-xs text-[#64748B]">35.6% lost</span>
                  </div>
                </div>
                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-4">
                  <p className="text-xs text-[#065F46] font-medium mb-1">Pittsburgh, PA</p>
                  <p className="text-lg font-mono font-bold text-[#0F172A]">$106k</p>
                  <p className="text-xs text-[#64748B] mt-1">Effective buying power</p>
                  <div className="mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#047857]" />
                    <span className="text-xs text-[#64748B]">+6.0% gained</span>
                  </div>
                </div>
              </div>

              <Link
                to="/calculator"
                className="mt-6 inline-flex items-center text-sm font-medium text-navy hover:text-navy-light transition-colors"
              >
                Compare any two cities →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 5: CTA Banner */}
      <section className="bg-navy">
        <div className="container-page py-12 lg:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h2 className="text-[28px] lg:text-[32px] font-semibold text-white tracking-[-0.01em]">
              Calculate YOUR {job.title} Salary
            </h2>
            <p className="text-[#94A3B8] mt-3 max-w-[520px] mx-auto text-base">
              Enter your actual salary and city to see your real take-home pay, rent burden, and wage power score.
            </p>
            <div className="mt-8">
              <Link
                to={`/calculator?job=${job.slug}`}
                className="inline-flex items-center gap-2 h-12 px-6 bg-emerald text-white rounded-lg font-semibold text-[15px] hover:bg-emerald-dark transition-colors duration-150 active:scale-[0.98]"
              >
                <Calculator className="w-4 h-4" />
                Go to Calculator
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
