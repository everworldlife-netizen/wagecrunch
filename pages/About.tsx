import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  Eye,
  Unlock,
  TrendingUp,
  Keyboard,
  Calculator,
  BarChart3,
  ShieldOff,
  BookOpen,
  RefreshCw,
  Mail,
  Send,
  ArrowRight,
} from 'lucide-react';
import Layout from '@/components/Layout';
import SourceBadge from '@/components/SourceBadge';
import StatusPill from '@/components/StatusPill';

/* ─── Animation helpers ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const, delay },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ─── Animated Section Wrapper ─── */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stats counter animation ─── */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="tabular-nums"
    >
      {isInView ? `${value}${suffix}` : `0${suffix}`}
    </motion.span>
  );
}

/* ─── Section Title ─── */
function SectionTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-2xl sm:text-[28px] font-semibold text-[#0F172A] tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

/* ─── Main Component ─── */
export default function About() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const sources = ['Employment', 'Community', 'Tax', 'Housing', 'Regional'];

  return (
    <Layout>
      {/* ── Section 1: Hero ── */}
      <section className="bg-[#0B1E3C] py-16 sm:py-24">
        <div className="container-page max-w-[720px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
          >
            <span className="text-[13px] font-medium text-[#94A3B8] tracking-[0.1em] uppercase">
              About WageCrunch
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold text-white leading-[1.1] tracking-tight mt-4"
          >
            Your Salary Is Not Your Real Worth
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            className="text-[#94A3B8] text-base sm:text-lg leading-[1.7] mt-6 max-w-[640px] mx-auto"
          >
            WageCrunch exists because a number on a paycheck doesn&apos;t tell the whole story.
            We believe every worker deserves to understand what their salary actually means —
            after taxes, after rent, after the real cost of living. No jargon. No paywalls.
            Just clear, honest data.
          </motion.p>

          {/* Stats row */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-8 sm:gap-12 mt-12"
          >
            {[
              { value: 197, suffix: '', label: 'Cities Covered' },
              { value: 284, suffix: '', label: 'Occupations' },
              { value: 5, suffix: '', label: 'Data Factors' },
              { value: 100, suffix: '%', label: 'Free Forever', emerald: true },
            ].map((stat) => (
              <motion.div key={stat.label} variants={staggerItem} className="text-center">
                <div
                  className={`text-[32px] sm:text-[40px] font-bold tracking-tight ${
                    stat.emerald ? 'text-[#047857]' : 'text-white'
                  }`}
                >
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-[#64748B] mt-1 tracking-wide uppercase">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: Mission & Values ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection className="text-center mb-12">
            <SectionTitle>Why We Built This</SectionTitle>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Eye,
                title: 'Transparent Data',
                body: 'Every number on WageCrunch comes from verified data sources. We show our formulas, cite our sources, and update our data regularly. No black boxes.',
              },
              {
                icon: Unlock,
                title: 'Free for Everyone',
                body: "Salary intelligence shouldn't cost money. WageCrunch is 100% free — no sign-up, no credit card, no premium tier hiding the good stuff. If you find it useful, share it.",
              },
              {
                icon: TrendingUp,
                title: 'Better Decisions',
                body: "Whether you're negotiating an offer, considering a move, or just checking if you're on track — WageCrunch gives you the context to make informed decisions about your career and finances.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={staggerItem}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:-translate-y-px text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mx-auto mb-5">
                    <Icon className="w-6 h-6 text-[#0B1E3C]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-3">{card.title}</h3>
                  <p className="text-sm text-[#475569] leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Section 3: How It Works ── */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection className="text-center mb-12">
            <SectionTitle>How WageCrunch Works</SectionTitle>
          </AnimatedSection>

          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block absolute top-7 left-[16.67%] right-[16.67%] h-0.5 bg-[#E2E8F0]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                className="h-full bg-[#0B1E3C] origin-left"
              />
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 relative"
            >
              {[
                {
                  step: '01',
                  icon: Keyboard,
                  title: 'Tell us about your situation',
                  body: 'Enter your job title, salary, city, and a few details about your expenses. Takes under 30 seconds.',
                },
                {
                  step: '02',
                  icon: Calculator,
                  title: 'We run the calculations',
                  body: 'Our engine applies the latest tax brackets, cost-of-living data, rent estimates, and wage statistics to model your real financial picture.',
                },
                {
                  step: '03',
                  icon: BarChart3,
                  title: 'Get clear, honest insights',
                  body: 'See your real take-home pay, how rent impacts you, your wage power score, and how you compare — all in plain English.',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    variants={staggerItem}
                    className="text-center relative"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-14 h-14 rounded-full bg-white border-2 border-[#E2E8F0] flex items-center justify-center mx-auto mb-5 relative z-10"
                    >
                      <Icon className="w-7 h-7 text-[#0B1E3C]" />
                    </motion.div>
                    <span className="text-xs font-mono text-[#94A3B8] tracking-wider">{item.step}</span>
                    <h3 className="text-lg font-semibold text-[#0F172A] mt-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-[#475569] leading-relaxed max-w-[320px] mx-auto">{item.body}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Trust & Data Sources ── */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection className="text-center mb-8">
            <SectionTitle className="mb-4">Built on Verified Data</SectionTitle>
            <p className="text-[#475569] max-w-[600px] mx-auto">
              WageCrunch combines data from verified market sources.
              We don&apos;t make up numbers — we interpret them clearly.
            </p>
          </AnimatedSection>

          {/* Source badges */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-wrap items-center justify-center gap-3 mb-12"
          >
            {sources.map((s) => (
              <motion.div key={s} variants={staggerItem}>
                <SourceBadge label={s} />
              </motion.div>
            ))}
          </motion.div>

          {/* Trust signals */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: ShieldOff,
                title: 'No Tracking',
                body: "We don't sell your data. We don't track you across the web. Your inputs stay in your browser unless you choose to share.",
              },
              {
                icon: BookOpen,
                title: 'Open Methodology',
                body: 'Every formula is documented. Every source is cited. See exactly how we calculate every number on our Methodology page.',
              },
              {
                icon: RefreshCw,
                title: 'Regular Updates',
                body: 'We refresh our data as sources release new data — typically annually. Each page shows when the data was last updated.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={staggerItem}
                  className="flex flex-col items-center text-center p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#0B1E3C]" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#0F172A] mb-2">{item.title}</h4>
                  <p className="text-sm text-[#475569] leading-relaxed">{item.body}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Privacy tagline */}
          <AnimatedSection className="text-center mt-10" delay={0.3}>
            <p className="text-sm text-[#475569] font-medium">
              No sign-up required. No data selling. Ever.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Section 5: Contact & CTA ── */}
      <section className="bg-[#F8FAFC] py-16 sm:py-20">
        <div className="container-page max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Left: Contact */}
            <AnimatedSection>
              <SectionTitle className="mb-4">Get in Touch</SectionTitle>
              <p className="text-[#475569] mb-8">
                Have feedback, found a bug, or want to collaborate? We&apos;d love to hear from you.
              </p>

              <div className="space-y-4">
                <Link
                  to="/contact"
                  className="flex items-center gap-3 group"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center group-hover:border-navy transition-colors">
                    <Mail className="w-4 h-4 text-[#0B1E3C]" />
                  </div>
                  <span className="text-sm text-[#0F172A] group-hover:underline">Send us a message</span>
                </Link>
              </div>

              <div className="mt-6">
                <StatusPill status="info">Free tool — feedback welcome</StatusPill>
              </div>
            </AnimatedSection>

            {/* Right: Newsletter CTA Card */}
            <AnimatedSection delay={0.15}>
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                <h3 className="text-xl font-semibold text-[#0F172A] mb-2">Stay Updated</h3>
                <p className="text-sm text-[#475569] mb-6">
                  Get notified when we add new cities, data sources, and features. No spam — just
                  useful updates.
                </p>

                {subscribed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#ECFDF5] rounded-lg p-5 text-center"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#047857] flex items-center justify-center mx-auto mb-3">
                      <Send className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-[#065F46]">You&apos;re subscribed!</p>
                    <p className="text-xs text-[#475569] mt-1">Thanks for joining the WageCrunch community.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="input-base flex-1 h-12"
                        required
                      />
                      <button type="submit" className="btn-primary h-12 px-6 whitespace-nowrap">
                        Subscribe
                      </button>
                    </div>
                    <p className="text-xs text-[#94A3B8]">Unsubscribe anytime.</p>
                  </form>
                )}

                <div className="mt-8 pt-6 border-t border-[#E2E8F0]">
                  <div className="flex items-start gap-3">
                    <Link
                      to="/methodology"
                      className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline group"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read our full methodology
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Trusted by line */}
              <div className="mt-8 text-center">
                <p className="text-sm text-[#475569]">
                  Trusted by workers, job seekers, and career switchers
                </p>
                <p className="text-xs text-[#94A3B8] mt-2">
                  From entry-level to executive — WageCrunch helps everyone understand their real worth.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
