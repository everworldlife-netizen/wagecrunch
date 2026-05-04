import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Briefcase } from 'lucide-react';
import Layout from '@/components/Layout';
import { jobs } from '@/data/jobs';

const categories = ['All', ...Array.from(new Set(jobs.map(j => j.category))).sort()];

const categoryColorMap: Record<string, string> = {
  'Management': '#0B1E3C',
  'Technology': '#2563EB',
  'Healthcare': '#047857',
  'Healthcare Support': '#059669',
  'Finance': '#0891B2',
  'Engineering': '#7C3AED',
  'Education': '#DC2626',
  'Sales': '#EA580C',
  'Construction': '#D97706',
  'Manufacturing': '#65A30D',
  'Transportation': '#4338CA',
  'Administrative': '#475569',
  'Creative': '#DB2777',
  'Hospitality': '#CA8A04',
  'Personal Care': '#E11D48',
  'Repair': '#52525B',
  'Social Services': '#0D9488',
  'Science': '#7C3AED',
  'Public Safety': '#B91C1C',
  'Maintenance': '#6B7280',
  'Business': '#1D4ED8',
  'Legal': '#9F1239',
  'Agriculture': '#15803D',
};

function getCategoryColor(category: string): string {
  return categoryColorMap[category] || '#94A3B8';
}

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || job.category === category;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => b.medianSalary - a.medianSalary);
  }, [search, category]);

  return (
    <Layout>
      {/* Header */}
      <section className="bg-white border-b border-[#E2E8F0]">
        <div className="container-page py-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h1 className="text-[36px] lg:text-[40px] font-bold text-[#0F172A] tracking-[-0.01em] leading-tight">
              Explore Occupations
            </h1>
            <p className="text-[#475569] mt-2 text-base max-w-[600px]">
              Browse salary data, employment trends, and cost-of-living impact for hundreds of occupations.
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <div className="relative flex-1 max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search job titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base w-full pl-10"
              />
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-base pr-10 appearance-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results count */}
      <div className="container-page pt-8 pb-3">
        <p className="text-sm text-[#64748B]">
          Showing <span className="font-medium text-[#0F172A]">{filtered.length}</span> occupations
          {category !== 'All' && (
            <span> in <span className="font-medium text-[#0F172A]">{category}</span></span>
          )}
          {search && (
            <span> matching &quot;<span className="font-medium text-[#0F172A]">{search}</span>&quot;</span>
          )}
        </p>
      </div>

      {/* Table */}
      <div className="container-page pb-16">
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-card">
          {/* Header row — sticky */}
          <div className="sticky top-0 z-10 grid grid-cols-[minmax(200px,1fr)_120px_120px_100px] lg:grid-cols-[minmax(320px,1fr)_160px_160px_140px] gap-4 px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[13px] font-medium text-[#475569] tracking-[0.02em] shadow-sm">
            <div>Job Title</div>
            <div className="text-right tabular-nums">Median Salary</div>
            <div className="text-right hidden sm:flex items-center justify-end gap-1 tabular-nums">
              Market Rate
              <span className="group/tooltip relative">
                <svg className="w-3.5 h-3.5 text-[#94A3B8] cursor-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-[#0F172A] text-white text-[11px] rounded max-w-[200px] whitespace-normal opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10">
                  Adjusted median reflecting current market premiums. See Methodology.
                </span>
              </span>
            </div>
            <div className="text-right">Category</div>
          </div>

          {/* Rows */}
          {filtered.map((job, i) => (
            <motion.div
              key={job.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: Math.min(i * 0.03, 0.5) }}
              className={i % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}
              style={{ borderLeft: `4px solid ${getCategoryColor(job.category)}` }}
            >
              <Link
                to={`/jobs/${job.slug}`}
                className="grid grid-cols-[minmax(200px,1fr)_120px_120px_100px] lg:grid-cols-[minmax(320px,1fr)_160px_160px_140px] gap-4 px-6 py-4 border-b border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors duration-150 items-center group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center shrink-0 group-hover:bg-[#0B1E3C] transition-colors duration-150">
                    <Briefcase className="w-4 h-4 text-[#2563EB] group-hover:text-white transition-colors duration-150" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-[#0F172A] group-hover:text-navy transition-colors block line-clamp-2 leading-snug" title={job.title}>
                      {job.title}
                    </span>
                    <span className="text-xs text-[#94A3B8] truncate block sm:hidden">{job.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono font-semibold text-[#0F172A] tabular-nums">
                    ${job.medianSalary.toLocaleString()}
                  </span>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-sm font-mono text-[#475569] tabular-nums">
                    ${job.marketRateSalary.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="pill pill-info text-xs">{job.category}</span>
                </div>
              </Link>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Search className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
              <p className="text-[#475569] font-medium">No occupations found</p>
              <p className="text-sm text-[#94A3B8] mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
