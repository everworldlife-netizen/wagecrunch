import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowUpDown } from 'lucide-react';
import Layout from '@/components/Layout';
import { cities } from '@/data/cities';

type SortOption = 'name' | 'colIndex' | 'rent' | 'wagePower';

const states = ['All States', ...Array.from(new Set(cities.map(c => c.state))).sort()];

export default function Cities() {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [sort, setSort] = useState<SortOption>('wagePower');

  const filtered = useMemo(() => {
    let result = cities.filter(city => {
      const matchesSearch = city.name.toLowerCase().includes(search.toLowerCase()) ||
        city.state.toLowerCase().includes(search.toLowerCase());
      const matchesState = stateFilter === 'All States' || city.state === stateFilter;
      return matchesSearch && matchesState;
    });

    switch (sort) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'colIndex':
        result.sort((a, b) => a.colIndex - b.colIndex);
        break;
      case 'rent':
        result.sort((a, b) => a.medianRent2br - b.medianRent2br);
        break;
      case 'wagePower':
      default:
        // Sort by a composite score - lower COL + higher income = better
        result.sort((a, b) => (b.medianIncome / b.colIndex) - (a.medianIncome / a.colIndex));
        break;
    }

    return result;
  }, [search, stateFilter, sort]);

  const getColStatus = (col: number) => {
    if (col < 95) return { status: 'healthy' as const, label: 'Low' };
    if (col <= 110) return { status: 'caution' as const, label: 'Average' };
    return { status: 'stressed' as const, label: 'High' };
  };

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
              Explore Cities
            </h1>
            <p className="text-[#475569] mt-2 text-base max-w-[600px]">
              Compare cost of living, rent prices, and salary potential across major U.S. metro areas.
            </p>
          </motion.div>

          {/* Filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <div className="relative flex-1 max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base w-full pl-10"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="input-base pr-10 appearance-none cursor-pointer"
                >
                  {states.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="input-base pr-10 appearance-none cursor-pointer"
                >
                  <option value="wagePower">Best Value</option>
                  <option value="name">Name A-Z</option>
                  <option value="colIndex">Lowest COL</option>
                  <option value="rent">Lowest Rent</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results count */}
      <div className="container-page pt-8 pb-3">
        <p className="text-sm text-[#64748B]">
          Showing <span className="font-medium text-[#0F172A]">{filtered.length}</span> cities
          {stateFilter !== 'All States' && (
            <span> in <span className="font-medium text-[#0F172A]">{stateFilter}</span></span>
          )}
          {search && (
            <span> matching &quot;<span className="font-medium text-[#0F172A]">{search}</span>&quot;</span>
          )}
        </p>
      </div>

      {/* Grid */}
      <div className="container-page pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((city, i) => {
            const colStatus = getColStatus(city.colIndex);
            const incomePerCol = (city.medianIncome / city.colIndex * 100).toFixed(0);
            return (
              <motion.div
                key={city.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut', delay: Math.min(i * 0.04, 0.6) }}
              >
                <Link
                  to={`/cities/${city.slug}`}
                  className="card-interactive block h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F172A]">{city.name}</h3>
                        <p className="text-xs text-[#64748B]">{city.state}</p>
                      </div>
                    </div>
                    <span className={`pill text-xs ${
                      colStatus.status === 'healthy' ? 'pill-healthy' :
                      colStatus.status === 'caution' ? 'pill-caution' : 'pill-stressed'
                    }`}>
                      COL {colStatus.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">COL Index</p>
                      <p className="text-sm font-mono font-semibold text-[#0F172A] mt-0.5">{city.colIndex}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">2BR Rent</p>
                      <p className="text-sm font-mono font-semibold text-[#0F172A] mt-0.5">${city.medianRent2br.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-medium">Buying Power</p>
                      <p className="text-sm font-mono font-semibold text-[#047857] mt-0.5">${Number(incomePerCol).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-8 h-8 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-[#475569] font-medium">No cities found</p>
            <p className="text-sm text-[#94A3B8] mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
