import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

import { motion, useInView } from 'framer-motion';
import {
  Briefcase,
  Users,
  Home,
  Globe,
  Receipt,
  Map,
  ChevronRight,
  Info,
  ExternalLink,
  Calculator,
  Mail,
} from 'lucide-react';
import Layout from '@/components/Layout';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import StatusPill from '@/components/StatusPill';
import { federalTaxBrackets2024, ficaRates } from '@/data/taxBrackets';

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
    transition: { staggerChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

/* ─── Data source definitions ─── */
const dataSources = [
  {
    accent: '#0B1E3C',
    icon: Briefcase,
    title: 'Bureau of Labor Statistics (BLS)',
    subtitle: 'BLS Occupational Employment & Wage Statistics',
    body: 'Annual wage estimates by occupation and metropolitan area. Includes national, state, and metro-level median, mean, and percentile wages.',
    dataPoints: 'Occupation wages \u00B7 Job counts \u00B7 Hourly rates',
    freshness: 'Updated annually',
    link: 'bls.gov/oes',
  },
  {
    accent: '#2563EB',
    icon: Users,
    title: 'U.S. Census Bureau (ACS)',
    subtitle: 'American Community Survey (ACS)',
    body: 'Median household income, housing costs, commuting patterns, and demographic data at the city and metro level.',
    dataPoints: 'Median income \u00B7 Rent \u00B7 Housing \u00B7 Commuting',
    freshness: 'Updated annually',
    link: 'census.gov/acs',
  },
  {
    accent: '#047857',
    icon: Home,
    title: 'HUD Fair Market Rents',
    subtitle: 'HUD Fair Market Rents',
    body: 'Rent estimates by metropolitan area and bedroom size, used to calculate rent burden and housing affordability.',
    dataPoints: 'Rent by area \u00B7 Rent by bedrooms \u00B7 Affordability',
    freshness: 'Updated annually',
    link: 'huduser.gov',
  },
  {
    accent: '#F97316',
    icon: Globe,
    title: 'BEA Regional Price Parities',
    subtitle: 'BEA Regional Price Parities',
    body: 'Cost-of-living adjustment factors by state and metropolitan area, reflecting price differences for goods, services, and housing.',
    dataPoints: 'COL indexes \u00B7 State/metro adjustments \u00B7 Price parities',
    freshness: 'Updated annually',
    link: 'bea.gov',
  },
  {
    accent: '#DC2626',
    icon: Receipt,
    title: 'IRS Federal Tax Brackets',
    subtitle: 'IRS Federal Tax Brackets',
    body: 'Federal income tax brackets, standard deductions, and FICA tax rates (Social Security and Medicare) for all filing statuses.',
    dataPoints: 'Tax brackets \u00B7 Standard deductions \u00B7 FICA rates',
    freshness: 'Updated annually',
    link: 'irs.gov',
  },
  {
    accent: '#64748B',
    icon: Map,
    title: 'State & Local Tax Estimates',
    subtitle: 'State & Local Tax Estimates',
    body: 'State income tax brackets and rates where applicable. Note: not all states have income tax. Local taxes included where significant.',
    dataPoints: 'State tax rates \u00B7 Local taxes \u00B7 Withholding',
    freshness: 'Varies by state',
    link: '',
    note: 'Expanding to all 50 states by Q4 2025',
  },
];

/* ─── Timeline data ─── */
const timelineData = [
  { label: 'BLS Wage Data', date: '2024 annual release (May 2025)', fresh: true },
  { label: 'Census ACS', date: '2024 1-year estimates (Sep 2025)', fresh: true },
  { label: 'HUD FMR', date: 'FY2026 (Oct 2025)', fresh: true },
  { label: 'BEA RPP', date: '2024 release (May 2025)', fresh: true },
  { label: 'IRS Brackets', date: '2025 tax year', fresh: true },
];

/* ─── Limitations data ─── */
const limitations = [
  'Tax estimates are simplified and do not account for all deductions, credits, or individual tax situations.',
  'State tax data is not yet complete for all states. We\'re expanding coverage.',
  'Rent figures are estimates based on HUD Fair Market Rents and may differ from actual market rents.',
  'Cost-of-living indexes are at the metro or state level and may not reflect neighborhood-level differences.',
  'Occupation wages are estimates and vary significantly by experience, company, and negotiation.',
  'WageCrunch provides estimates for informational purposes only. Consult a tax professional for advice.',
];

/* ─── Score components ─── */
const scoreComponents = [
  { label: 'Net Pay Strength', pct: 35, color: '#0B1E3C', desc: 'How does your net monthly pay compare to the national median net pay? Normalized to 0\u2013100.' },
  { label: 'Rent Affordability', pct: 25, color: '#2563EB', desc: 'Inverse of rent burden. Lower rent burden = higher score. 25% burden = 75/100.' },
  { label: 'COL Advantage', pct: 20, color: '#047857', desc: 'Does your cost-of-living adjusted salary exceed the nominal? Positive adjustments score higher.' },
  { label: 'Occupation Strength', pct: 10, color: '#F97316', desc: 'Is your salary above the national median for your specific occupation?' },
  { label: 'Remaining Income', pct: 10, color: '#64748B', desc: 'How much is left after rent, debt, taxes, and estimated living expenses?' },
];

const scoreThresholds = [
  { range: '85\u2013100', label: 'Excellent', color: '#047857', desc: 'Strong buying power, low rent burden' },
  { range: '70\u201384', label: 'Good', color: '#2563EB', desc: 'Above-average financial position' },
  { range: '55\u201369', label: 'Average', color: '#F97316', desc: 'Typical for most workers' },
  { range: '40\u201354', label: 'Stressed', color: '#F97316', desc: 'Rent or expenses consuming too much income' },
  { range: '0\u201339', label: 'Critical', color: '#DC2626', desc: 'High financial strain, consider alternatives' },
];

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

/* ─── Formula Block Component ─── */
function FormulaBlock({ formula, example }: { formula: string; example?: string }) {
  return (
    <div className="bg-[#F8FAFC] rounded-lg p-5 mt-3 font-mono text-sm space-y-2">
      <div className="text-[#0F172A]">{formula}</div>
      {example && (
        <div className="text-[#475569] border-t border-[#E2E8F0] pt-2 mt-2">
          <span className="text-[#94A3B8] text-xs uppercase tracking-wide">Example: </span>
          {example}
        </div>
      )}
    </div>
  );
}

/* ─── Section Title ─── */
function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={`text-2xl sm:text-[28px] font-semibold text-[#0F172A] tracking-tight ${className}`}>
      {children}
    </h2>
  );
}

/* ─── Main Component ─── */
export default function Methodology() {
  const [exampleSalary] = useState(75000);
  const [exampleCity] = useState({ name: 'Austin, TX', rent: 1650, colIndex: 109.6 });

  // Pre-compute example calculations
  const grossMonthly = exampleSalary / 12;
  const taxableIncome = exampleSalary - federalTaxBrackets2024.single.standardDeduction;
  const fedTax = taxableIncome > 0 ? (
    Math.min(taxableIncome, 11600) * 0.10 +
    Math.max(0, Math.min(taxableIncome, 47150) - 11600) * 0.12 +
    Math.max(0, Math.min(taxableIncome, 100525) - 47150) * 0.22 +
    Math.max(0, Math.min(taxableIncome, 191950) - 100525) * 0.24
  ) : 0;
  const ficaSS = Math.min(exampleSalary, ficaRates.socialSecurityWageBase) * ficaRates.socialSecurityRate;
  const ficaMC = exampleSalary * ficaRates.medicareRate + (exampleSalary > ficaRates.additionalMedicareThreshold ? (exampleSalary - ficaRates.additionalMedicareThreshold) * ficaRates.additionalMedicareRate : 0);
  const ficaTotal = ficaSS + ficaMC;
  const netAnnual = exampleSalary - fedTax - ficaTotal;
  const netMonthly = netAnnual / 12;
  const rentBurden = (exampleCity.rent / netMonthly) * 100;
  const colAdjusted = (exampleSalary / exampleCity.colIndex) * 100;

  return (
    <Layout>
      {/* ── Section 1: Page Header ── */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection>
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-xs text-[#64748B]">
                <li>
                  <Link to="/about" className="hover:text-navy transition-colors">About</Link>
                </li>
                <li><ChevronRight className="w-3 h-3" /></li>
                <li className="text-[#94A3B8]">Methodology</li>
              </ol>
            </nav>
            <h1 className="text-[36px] sm:text-[40px] font-bold text-[#0F172A] tracking-tight leading-tight">
              Our Methodology
            </h1>
            <p className="text-[#475569] mt-4 max-w-[640px] text-base leading-relaxed">
              WageCrunch is built on verified public data and transparent formulas. Here&apos;s exactly how we calculate every number you see.
            </p>
            <div className="mt-4">
              <StatusPill status="info">
                Last updated: April 2026 &middot; Next refresh: May 2026
              </StatusPill>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Section 2: 3-Step Visual Flow ── */}
      <section className="bg-white py-8 sm:py-10 border-b border-[#E2E8F0]">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
              {/* Connector lines (desktop only) */}
              <div className="hidden md:block absolute top-[28px] left-[25%] right-[25%] h-px bg-[#E2E8F0]" />

              {/* Step 1: Inputs */}
              <div className="relative text-center px-6 py-6">
                <div className="w-14 h-14 rounded-full bg-[#0B1E3C] text-white flex items-center justify-center mx-auto mb-4 relative z-10">
                  <Calculator className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-[#0B1E3C] mb-1">Step 1</div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Inputs</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Your salary, city, filing status, rent, and debt. The raw numbers that define your financial picture.
                </p>
              </div>

              {/* Step 2: Adjustments */}
              <div className="relative text-center px-6 py-6">
                <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto mb-4 relative z-10">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-[#2563EB] mb-1">Step 2</div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Adjustments</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Federal, state, and FICA taxes. Cost-of-living index adjustments. Rent burden calculations.
                </p>
              </div>

              {/* Step 3: Outputs */}
              <div className="relative text-center px-6 py-6">
                <div className="w-14 h-14 rounded-full bg-[#047857] text-white flex items-center justify-center mx-auto mb-4 relative z-10">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 01-2-2 2 2 0 012-2h14v4" />
                    <path d="M3 5v14a2 2 0 002 2h16v-5" />
                    <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <div className="text-sm font-bold text-[#047857] mb-1">Step 3</div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">Outputs</h3>
                <p className="text-sm text-[#475569] leading-relaxed">
                  Net pay, Wage Power Score, rankings, and personalized insights. Actionable clarity.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Section 3: Data Sources ── */}
      <section className="bg-[#F8FAFC] py-12 sm:py-16">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection>
            <SectionTitle className="mb-8">Data Sources</SectionTitle>
          </AnimatedSection>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {dataSources.map((source) => {
              const Icon = source.icon;
              return (
                <motion.div key={source.title} variants={staggerItem}>
                  <div
                    className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] h-full flex flex-col transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:-translate-y-px"
                    style={{ borderTopWidth: 3, borderTopColor: source.accent }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: source.accent + '12' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: source.accent }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#0F172A] leading-snug">
                          {source.subtitle}
                        </h3>
                        {source.link && (
                          <a
                            href={`https://${source.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#2563EB] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            {source.link}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] leading-relaxed mb-3 flex-1">
                      {source.body}
                    </p>
                    <div className="space-y-2 mt-auto">
                      <p className="text-xs font-mono text-[#475569] tracking-wide">
                        {source.dataPoints}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#94A3B8]">{source.freshness}</span>
                        {source.note && (
                          <span className="text-xs text-[#F97316] font-medium">{source.note}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Section 3: Calculation Formulas ── */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection>
            <SectionTitle className="mb-8">How We Calculate Your Results</SectionTitle>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
          >
            <Accordion type="multiple" className="w-full space-y-2">
              {/* 1. Gross Monthly Income */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="gross" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Gross Monthly Income
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Gross Monthly Income = Annual Salary / 12"
                      example={`$${exampleSalary.toLocaleString()} / 12 = $${grossMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                    />
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 2. Federal Tax Estimate */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="federal" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Federal Tax Estimate
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F8FAFC] rounded-lg p-5 mt-3 space-y-4">
                      <p className="text-sm text-[#475569]">
                        We apply progressive tax brackets to your taxable income (salary minus standard deduction for filing status). Taxable brackets for 2024:
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0]">
                              <th className="pb-2 pr-4">Bracket</th>
                              <th className="pb-2 pr-4">Rate</th>
                              <th className="pb-2">Tax per Bracket</th>
                            </tr>
                          </thead>
                          <tbody className="font-mono text-[#0F172A]">
                            {[
                              { range: '$0 - $11,600', rate: '10%', amount: '$1,160' },
                              { range: '$11,601 - $47,150', rate: '12%', amount: '$4,266' },
                              { range: '$47,151 - $100,525', rate: '22%', amount: '$11,743' },
                              { range: '$100,526 - $191,950', rate: '24%', amount: '$21,942' },
                              { range: '$191,951 - $243,725', rate: '32%', amount: '$16,568' },
                              { range: '$243,726 - $609,350', rate: '35%', amount: '$127,969' },
                              { range: '$609,351+', rate: '37%', amount: 'Variable' },
                            ].map((row) => (
                              <tr key={row.rate} className="border-b border-[#E2E8F0] last:border-0">
                                <td className="py-2 pr-4">{row.range}</td>
                                <td className="py-2 pr-4">{row.rate}</td>
                                <td className="py-2">{row.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="font-mono text-sm space-y-1 pt-2">
                        <p className="text-[#0F172A]">
                          Standard Deductions: Single $14,600 &middot; Married Filing Jointly $29,200 &middot; Head of Household $21,900
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 3. FICA Taxes */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="fica" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    FICA Taxes
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F8FAFC] rounded-lg p-5 mt-3 font-mono text-sm space-y-2">
                      <p className="text-[#0F172A]">FICA = Social Security + Medicare</p>
                      <p className="text-[#475569]">
                        Social Security = 6.2% of gross income up to wage base (${ficaRates.socialSecurityWageBase.toLocaleString()} in 2024)
                      </p>
                      <p className="text-[#475569]">
                        Medicare = 1.45% of all gross income + 0.9% additional above ${ficaRates.additionalMedicareThreshold.toLocaleString()}
                      </p>
                      <div className="border-t border-[#E2E8F0] pt-2 mt-2 text-[#475569]">
                        <span className="text-[#94A3B8] text-xs uppercase tracking-wide">Example (${exampleSalary.toLocaleString()}): </span>
                        SS: ${ficaSS.toLocaleString(undefined, { maximumFractionDigits: 0 })} + Medicare: ${ficaMC.toLocaleString(undefined, { maximumFractionDigits: 0 })} = Total FICA: ${ficaTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 4. State Tax Estimate */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="state" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    State Tax Estimate
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="State Tax = Taxable Income x State Effective Rate"
                      example={`Texas has no state income tax. For a state with 5% rate on $${taxableIncome.toLocaleString()}: ~$${(taxableIncome * 0.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}/year`}
                    />
                    <p className="text-sm text-[#475569] mt-3">
                      Nine states have no income tax: Alaska, Florida, Nevada, South Dakota, Tennessee, Texas, Washington, Wyoming, and New Hampshire (only interest/dividends). State tax estimates are approximate and use simplified flat/average effective rates.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 5. Net Annual Pay */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="net-annual" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Net Annual Pay
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Net Annual Pay = Gross Salary - Federal Tax - State Tax - FICA"
                      example={`$${exampleSalary.toLocaleString()} - $${fedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })} - $0 - $${ficaTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} = $${netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    />
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 6. Net Monthly Pay */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="net-monthly" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Net Monthly Pay
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Net Monthly Pay = Net Annual Pay / 12"
                      example={`$${netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })} / 12 = $${netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo`}
                    />
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 7. Rent Burden */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="rent-burden" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Rent Burden
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Rent Burden (%) = (Monthly Rent / Net Monthly Pay) x 100"
                      example={`($${exampleCity.rent.toLocaleString()} / $${netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })})/mo x 100 = ${rentBurden.toFixed(1)}%`}
                    />
                    <div className="flex gap-3 mt-3">
                      <span className="pill pill-healthy text-xs">&lt;30% Healthy</span>
                      <span className="pill pill-caution text-xs">30-40% Caution</span>
                      <span className="pill pill-stressed text-xs">&gt;40% Stressed</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 8. Debt Burden */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="debt-burden" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Debt Burden
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Debt Burden (%) = (Monthly Debt Payments / Net Monthly Pay) x 100"
                      example="($500 / $5,998)/mo x 100 = 8.3%"
                    />
                    <p className="text-sm text-[#475569] mt-3">
                      Includes student loans, car payments, credit card minimums, and other recurring debt. Total debt burden plus rent burden = total financial obligation ratio.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 9. Cost-of-Living Adjustment */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="col" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Cost-of-Living Adjustment
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="COL Adjusted Salary = (Salary / City COL Index) x 100"
                      example={`($${exampleSalary.toLocaleString()} / ${exampleCity.colIndex}) x 100 = $${colAdjusted.toLocaleString(undefined, { maximumFractionDigits: 0 })} (purchasing power equivalent)`}
                    />
                    <p className="text-sm text-[#475569] mt-3">
                      A COL index of 100 = national average. Above 100 means higher costs; below 100 means lower costs. This shows what your salary is worth in a given city compared to the national average.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 10. Wage Power Score */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="wage-power" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    Wage Power Score
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F8FAFC] rounded-lg p-5 mt-3 space-y-3">
                      <p className="text-sm text-[#475569]">
                        A weighted composite score (0-100) combining five normalized components:
                      </p>
                      <div className="space-y-2">
                        {scoreComponents.map((comp) => (
                          <div key={comp.label} className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-sm shrink-0"
                              style={{ backgroundColor: comp.color }}
                            />
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm text-[#0F172A]">{comp.label}</span>
                              <span className="text-sm font-mono font-semibold" style={{ color: comp.color }}>
                                {comp.pct}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-[#0F172A] font-mono pt-2 border-t border-[#E2E8F0]">
                        Score = weighted average of all 5 normalized components (0-100)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>

              {/* 11. City Comparison Deltas */}
              <motion.div variants={staggerItem}>
                <AccordionItem value="deltas" className="border-b border-[#E2E8F0]">
                  <AccordionTrigger className="py-4 text-[16px] font-semibold text-[#0F172A] hover:no-underline">
                    City Comparison Deltas
                  </AccordionTrigger>
                  <AccordionContent>
                    <FormulaBlock
                      formula="Delta (%) = ((City A Value - City B Value) / City B Value) x 100"
                      example="Rent delta: (($1,800 - $2,400) / $2,400) x 100 = -25% (25% cheaper)"
                    />
                    <p className="text-sm text-[#475569] mt-3">
                      All city-to-city comparisons show percentage differences for salary, rent, cost of living, and net purchasing power. Positive = better in the compared city; negative = worse.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            </Accordion>
          </motion.div>

          {/* ── Concrete Example ── */}
          <AnimatedSection className="mt-10" delay={0.2}>
            <div className="bg-[#0B1E3C] rounded-xl p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-[#94A3B8]" />
                <h3 className="text-lg font-semibold">Concrete Example</h3>
              </div>
              <p className="text-[#94A3B8] text-sm mb-6">
                A software developer earning <span className="text-white font-mono font-semibold">$75,000</span> in <span className="text-white font-semibold">Austin, TX</span> with a 1-bedroom rent of <span className="text-white font-mono font-semibold">$1,650</span>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
                {[
                  { label: 'Gross Annual', value: `$${exampleSalary.toLocaleString()}`, color: 'text-white' },
                  { label: 'Standard Deduction', value: `-$${federalTaxBrackets2024.single.standardDeduction.toLocaleString()}`, color: 'text-[#F97316]' },
                  { label: 'Federal Tax', value: `-$${fedTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#F97316]' },
                  { label: 'FICA', value: `-$${ficaTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#F97316]' },
                  { label: 'State Tax (TX)', value: '$0', color: 'text-[#047857]' },
                  { label: 'Net Annual', value: `$${netAnnual.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#047857] font-bold' },
                  { label: 'Net Monthly', value: `$${netMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-[#047857] font-bold' },
                  { label: 'Rent Burden', value: `${rentBurden.toFixed(1)}%`, color: rentBurden < 30 ? 'text-[#047857]' : 'text-[#F97316]' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-[#94A3B8]">{item.label}</span>
                    <span className={item.color}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Section 4: Data Freshness & Limitations ── */}
      <section className="bg-[#F8FAFC] py-12 sm:py-16">
        <div className="container-page max-w-[1280px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left: Timeline */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              <AnimatedSection>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-6">Data Freshness</h3>
              </AnimatedSection>
              <div className="relative pl-6">
                {/* Vertical line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#E2E8F0]" />
                <div className="space-y-5">
                  {timelineData.map((item) => (
                    <motion.div key={item.label} variants={staggerItem} className="relative flex items-start gap-4">
                      <div
                        className="absolute left-[-15px] top-1.5 w-[9px] h-[9px] rounded-full shrink-0 border-2 border-white"
                        style={{ backgroundColor: item.fresh ? '#047857' : '#F97316' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{item.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex items-center gap-4 text-xs text-[#64748B]">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#047857]" />
                  &lt; 1 year old
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#F97316]" />
                  1-2 years old
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  &gt; 2 years old
                </div>
              </div>
            </motion.div>

            {/* Right: Limitations */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={staggerContainer}
            >
              <AnimatedSection delay={0.1}>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#0F172A] mb-6">Limitations &amp; Disclaimers</h3>
              </AnimatedSection>
              <div className="space-y-4">
                {limitations.map((item, i) => (
                  <motion.div key={i} variants={staggerItem} className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#94A3B8] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#475569] leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Scoring Methodology Detail ── */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container-page max-w-[1280px]">
          <AnimatedSection>
            <SectionTitle className="mb-8">Wage Power Score: Deep Dive</SectionTitle>
          </AnimatedSection>

          {/* Stacked bar */}
          <AnimatedSection delay={0.1}>
            <div className="w-full h-10 rounded-lg overflow-hidden flex mb-8">
              {scoreComponents.map((comp) => (
                <motion.div
                  key={comp.label}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${comp.pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="h-full flex items-center justify-center relative"
                  style={{ backgroundColor: comp.color }}
                >
                  <span className="text-white text-xs font-semibold">{comp.pct}%</span>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {scoreComponents.map((comp) => (
                <div key={comp.label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: comp.color }} />
                  <span className="text-sm text-[#475569]">{comp.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Detail cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="space-y-3 mb-10"
          >
            {scoreComponents.map((comp) => (
              <motion.div
                key={comp.label}
                variants={staggerItem}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
                style={{ borderLeftWidth: 4, borderLeftColor: comp.color }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-[#0F172A]">{comp.label} ({comp.pct}%)</h4>
                </div>
                <p className="text-sm text-[#475569]">{comp.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Thresholds table */}
          <AnimatedSection delay={0.4}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-[#94A3B8] uppercase tracking-wider border-b border-[#E2E8F0]">
                    <th className="pb-3 pr-4">Score Range</th>
                    <th className="pb-3 pr-4">Label</th>
                    <th className="pb-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreThresholds.map((row) => (
                    <tr key={row.range} className="border-b border-[#E2E8F0] last:border-0">
                      <td className="py-3 pr-4 font-mono font-semibold text-[#0F172A]">{row.range}</td>
                      <td className="py-3 pr-4">
                        <span className="pill text-xs font-semibold" style={{ backgroundColor: row.color + '15', color: row.color }}>
                          {row.label}
                        </span>
                      </td>
                      <td className="py-3 text-[#475569]">{row.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.5} className="mt-6">
            <p className="text-sm text-[#475569] leading-relaxed">
              <strong className="text-[#0F172A]">Why this formula?</strong>{' '}
              We designed the Wage Power Score to reflect the realities of modern financial life. Net pay strength matters most — it&apos;s the foundation. Rent affordability follows closely because housing is the largest expense for most people. Cost-of-living adjustments capture geographic purchasing power, while occupation-specific and remaining income components reward above-market wages and disciplined budgeting.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Section 6: CTA ── */}
      <section className="bg-[#0B1E3C] py-12 sm:py-16">
        <div className="container-page max-w-[520px] text-center">
          <AnimatedSection>
            <h2 className="text-2xl sm:text-[32px] font-semibold text-white mb-4">
              Try It Yourself
            </h2>
            <p className="text-[#94A3B8] mb-8">
              Now that you know how it works, see what your salary is really worth.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center justify-center h-12 px-6 bg-[#047857] text-white rounded-lg font-semibold text-[15px] hover:bg-[#065F46] transition-all duration-150 active:scale-[0.98]"
              >
                <Calculator className="w-4 h-4 mr-2" />
                Go to Calculator
              </Link>
            </div>
            <p className="mt-6 text-sm text-[#94A3B8]">
              Have feedback on our methodology?{' '}
              <Link
                to="/about"
                className="text-white hover:underline inline-flex items-center gap-1"
              >
                Contact us
                <Mail className="w-3.5 h-3.5" />
              </Link>
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
