import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  DollarSign,
  Wallet,
  AlertTriangle,
  ArrowRight,
  Trophy,
  Scale,
} from 'lucide-react';
import Layout from '@/components/Layout';

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const leaderboardCards = [
  {
    title: 'Best Cities for Your Job',
    description:
      'Discover where your occupation earns the most real purchasing power after taxes, rent, and cost of living.',
    icon: Trophy,
    iconColor: '#0B1E3C',
    accentBg: '#0B1E3C',
    href: '/leaderboards/best-cities-for-job',
  },
  {
    title: 'Wage vs Rent Index',
    description:
      'See where rent takes the biggest bite from your paycheck — and where your salary stretches the furthest after housing.',
    icon: Scale,
    iconColor: '#2563EB',
    accentBg: '#2563EB',
    href: '/leaderboards/wage-vs-rent',
  },
  {
    title: 'Most Underpaid Careers',
    description:
      'Where salaries fall furthest below market rate. Identify occupations with the largest wage gaps.',
    icon: TrendingDown,
    iconColor: '#DC2626',
    accentBg: '#DC2626',
    href: '#',
  },
  {
    title: 'Best Cities for $50K Salary',
    description:
      'Where a $50,000 salary stretches the furthest. Top cities for affordability on a modest income.',
    icon: DollarSign,
    iconColor: '#047857',
    accentBg: '#047857',
    href: '#',
  },
  {
    title: 'Best Cities for $100K Salary',
    description:
      'Where a six-figure salary delivers the most purchasing power and quality of life.',
    icon: Wallet,
    iconColor: '#065F46',
    accentBg: '#065F46',
    href: '/leaderboards/best-100k',
  },
  {
    title: 'Most Rent-Burdened Cities',
    description:
      'Cities where rent consumes the largest share of income — and where housing costs cause the most stress.',
    icon: AlertTriangle,
    iconColor: '#EA580C',
    accentBg: '#EA580C',
    href: '/leaderboards/rent-burdened',
  },
];

export default function Leaderboards() {
  return (
    <Layout>
      {/* Page Header */}
      <section className="bg-white">
        <div className="container-page pt-8 pb-6 lg:pt-12 lg:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="text-xs text-[#64748B] tracking-wide mb-2">WageCrunch</p>
            <h1 className="text-[32px] lg:text-[40px] font-bold text-[#0F172A] leading-tight tracking-[-0.01em] mb-3">
              Leaderboards
            </h1>
            <p className="text-base text-[#475569] max-w-[640px] leading-relaxed">
              Data-driven rankings to help you understand where salaries stretch
              furthest, which careers are most underpaid, and where rent
              burdens households the most.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cards Grid */}
      <section className="bg-[#F8FAFC]">
        <div className="container-page py-8 lg:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {leaderboardCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    ease: easeOut,
                    delay: 0.1 + i * 0.08,
                  }}
                >
                  <Link
                    to={card.href}
                    className="card-interactive block h-full relative overflow-hidden"
                    style={{ borderTopWidth: 3, borderTopColor: card.accentBg }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${card.iconColor}12` }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: card.iconColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-[#0F172A] mb-1.5 leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-sm text-[#475569] leading-relaxed mb-4">
                          {card.description}
                        </p>
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-navy group">
                          View Ranking
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="bg-white">
        <div className="container-page py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
            className="card-base max-w-[800px] mx-auto text-center"
          >
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
              How We Calculate Rankings
            </h2>
            <p className="text-sm text-[#475569] leading-relaxed mb-4 max-w-[600px] mx-auto">
              Our rankings combine data from the Bureau of Labor Statistics, U.S.
              Census, HUD, and the Bureau of Economic Analysis. Wage Power Scores
              account for median wages, federal and state taxes, cost of living
              adjustments, and median rent for each metro area.
            </p>
            <Link
              to="/methodology"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:underline"
            >
              Read our methodology
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
