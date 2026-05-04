import { useState, useMemo, useCallback } from 'react';
import { cities, nationalAverageCol } from '@/data/cities';
import {
  federalTaxBrackets2024,
  calculateFederalTax,
  calculateFICATax,
  getStateTaxRate,
} from '@/data/taxBrackets';

export type FilingStatus = 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';

export interface CalculatorInputs {
  jobTitle: string;
  salary: number;
  citySlug: string;
  filingStatus: FilingStatus;
  monthlyRent: number;
  monthlyDebt: number;
  compareCitySlug: string;
}

export interface CalculationResult {
  // Core pay
  grossAnnual: number;
  grossMonthly: number;
  federalTax: number;
  stateTax: number;
  ficaTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  netAnnual: number;
  netMonthly: number;
  effectiveTaxRate: number;

  // Rent burden
  monthlyRent: number;
  rentBurdenPercent: number;
  rentBurdenStatus: 'healthy' | 'caution' | 'stressed';

  // Wage Power Score (0-100)
  wagePowerScore: number;
  wagePowerLabel: string;

  // COL adjusted
  colIndex: number;
  colAdjustedSalary: number;
  colAdjustmentPercent: number;

  // Budget breakdown
  budgetBreakdown: {
    category: string;
    amount: number;
    color: string;
    percent: number;
  }[];

  // Ranking
  takeHomeRank: number;
  rankPercentile: number;
  topPercent: number;

  // Insights
  insights: string[];
}

export interface ComparisonResult {
  primary: CalculationResult;
  compare: CalculationResult;
  netMonthlyDiff: number;
  effectiveTaxRateDiff: number;
  rentBurdenDiff: number;
  colAdjustedDiff: number;
  wagePowerDiff: number;
  insight: string;
}

const defaultInputs: CalculatorInputs = {
  jobTitle: '',
  salary: 100000,
  citySlug: cities[0].slug,
  filingStatus: 'single',
  monthlyRent: 1800,
  monthlyDebt: 0,
  compareCitySlug: '',
};

const filingStatusLabels: Record<FilingStatus, string> = {
  single: 'Single',
  married_jointly: 'Married filing jointly',
  married_separately: 'Married filing separately',
  head_of_household: 'Head of household',
};

const gaugeLabels: { min: number; label: string }[] = [
  { min: 85, label: 'Excellent' },
  { min: 70, label: 'Good' },
  { min: 55, label: 'Average' },
  { min: 40, label: 'Stressed' },
  { min: 0, label: 'Critical' },
];

function getGaugeLabel(score: number): string {
  for (const g of gaugeLabels) {
    if (score >= g.min) return g.label;
  }
  return 'Critical';
}

function calculateResult(inputs: CalculatorInputs): CalculationResult {
  const city = cities.find(c => c.slug === inputs.citySlug) || cities[0];
  const cappedSalary = Math.min(Math.max(inputs.salary, 0), 300000);
  const grossAnnual = cappedSalary;
  const grossMonthly = grossAnnual / 12;

  // Tax calculation
  const brackets = federalTaxBrackets2024[inputs.filingStatus] || federalTaxBrackets2024.single;
  const standardDeduction = brackets.standardDeduction;
  const federalTaxableIncome = Math.max(0, grossAnnual - standardDeduction);
  const federalTax = calculateFederalTax(federalTaxableIncome, inputs.filingStatus);
  const stateTaxRate = getStateTaxRate(city.stateCode);
  const stateTax = grossAnnual * stateTaxRate;
  const fica = calculateFICATax(grossAnnual);

  const totalTax = federalTax + stateTax + fica.total;
  const netAnnual = grossAnnual - totalTax;
  const netMonthly = netAnnual / 12;
  const effectiveTaxRate = grossAnnual > 0 ? (totalTax / grossAnnual) * 100 : 0;

  // Rent burden
  const rentBurdenPercent = netMonthly > 0 ? (inputs.monthlyRent / netMonthly) * 100 : 0;
  let rentBurdenStatus: 'healthy' | 'caution' | 'stressed' = 'healthy';
  if (rentBurdenPercent > 40) rentBurdenStatus = 'stressed';
  else if (rentBurdenPercent > 30) rentBurdenStatus = 'caution';

  // Wage Power Score (0-100)
  // Factors: disposable income after rent (40%), COL adjusted (30%), debt burden (15%), tax efficiency (15%)
  const disposableIncomeRatio = netMonthly > 0
    ? Math.min(1, (netMonthly - inputs.monthlyRent) / 3000)
    : 0;
  const colFactor = Math.min(1, 120 / city.colIndex);
  const debtBurdenFactor = Math.max(0, 1 - (inputs.monthlyDebt / (netMonthly * 0.3)));
  const taxEfficiencyFactor = Math.max(0, 1 - (effectiveTaxRate / 45));

  const wagePowerScore = Math.round(
    Math.min(100, Math.max(0,
      disposableIncomeRatio * 40 +
      colFactor * 30 +
      debtBurdenFactor * 15 +
      taxEfficiencyFactor * 15
    ))
  );
  const wagePowerLabel = getGaugeLabel(wagePowerScore);

  // COL adjusted salary
  const colIndex = city.colIndex;
  const colAdjustedSalary = Math.round((grossAnnual / colIndex) * nationalAverageCol);
  const colAdjustmentPercent = ((colIndex - nationalAverageCol) / nationalAverageCol) * 100;

  // Budget breakdown — shows how NET monthly pay is allocated
  // Taxes already deducted; shown separately as Effective Tax Rate KPI
  const savings = netMonthly * 0.15;
  const otherExpenses = Math.max(0, netMonthly - inputs.monthlyRent - inputs.monthlyDebt - savings);
  const totalAllocated = inputs.monthlyRent + inputs.monthlyDebt + savings + otherExpenses;
  const budgetBreakdown = [
    { category: 'Rent', amount: inputs.monthlyRent, color: '#0B1E3C', percent: totalAllocated > 0 ? (inputs.monthlyRent / totalAllocated) * 100 : 0 },
    { category: 'Debt', amount: inputs.monthlyDebt, color: '#DC2626', percent: totalAllocated > 0 ? (inputs.monthlyDebt / totalAllocated) * 100 : 0 },
    { category: 'Savings', amount: savings, color: '#047857', percent: totalAllocated > 0 ? (savings / totalAllocated) * 100 : 0 },
    { category: 'Other', amount: otherExpenses, color: '#64748B', percent: totalAllocated > 0 ? (otherExpenses / totalAllocated) * 100 : 0 },
  ];

  // Take-home ranking (based on net monthly across all cities)
  const sortedByNet = [...cities]
    .map(c => {
      const stRate = getStateTaxRate(c.stateCode);
      const ficaT = calculateFICATax(grossAnnual);
      const fedTax = calculateFederalTax(Math.max(0, grossAnnual - standardDeduction), inputs.filingStatus);
      const totalT = fedTax + (grossAnnual * stRate) + ficaT.total;
      return { slug: c.slug, netMonthly: (grossAnnual - totalT) / 12 };
    })
    .sort((a, b) => b.netMonthly - a.netMonthly);

  const rankIndex = sortedByNet.findIndex(r => r.slug === city.slug);
  const takeHomeRank = rankIndex === -1 ? Math.floor(cities.length / 2) : rankIndex + 1;
  const rankPercentile = Math.round(((cities.length - takeHomeRank) / cities.length) * 100);
  const topPercent = Math.max(1, 100 - rankPercentile);

  // Insights
  const insights: string[] = [];
  if (rentBurdenStatus === 'stressed') {
    insights.push(`Your rent consumes ${rentBurdenPercent.toFixed(1)}% of take-home pay — financial advisors recommend keeping this under 30%.`);
  } else if (rentBurdenStatus === 'caution') {
    insights.push(`Your rent burden is ${rentBurdenPercent.toFixed(1)}% — above the 30% healthy threshold. You may have limited room for savings.`);
  } else {
    insights.push(`Your rent burden is ${rentBurdenPercent.toFixed(1)}% — well within the healthy range.`);
  }
  if (effectiveTaxRate > 30) {
    insights.push(`Your effective tax rate is ${effectiveTaxRate.toFixed(1)}% — consider tax-advantaged accounts to reduce taxable income.`);
  }
  if (colIndex > 115) {
    insights.push(`${city.name} is ${colAdjustmentPercent.toFixed(1)}% more expensive than the national average — your dollar doesn't stretch as far.`);
  } else if (colIndex < 95) {
    insights.push(`${city.name} is ${Math.abs(colAdjustmentPercent).toFixed(1)}% below the national cost average — your salary goes further here.`);
  }

  if (inputs.monthlyDebt > 0 && netMonthly > 0) {
    const debtPercent = (inputs.monthlyDebt / netMonthly) * 100;
    if (debtPercent > 15) {
      insights.push(`Your monthly debt payments consume ${debtPercent.toFixed(1)}% of take-home pay — consider a debt payoff strategy.`);
    }
  }

  return {
    grossAnnual,
    federalTax,
    stateTax,
    ficaTax: fica.total,
    grossMonthly,
    socialSecurity: fica.socialSecurity,
    medicare: fica.medicare,
    totalTax,
    netAnnual,
    netMonthly,
    effectiveTaxRate,
    monthlyRent: inputs.monthlyRent,
    rentBurdenPercent,
    rentBurdenStatus,
    wagePowerScore,
    wagePowerLabel,
    colIndex,
    colAdjustedSalary,
    colAdjustmentPercent,
    budgetBreakdown,
    takeHomeRank,
    rankPercentile,
    topPercent,
    insights,
  };
}

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);
  const [showResults, setShowResults] = useState(true);

  const updateInput = useCallback(<K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  }, []);

  const result = useMemo(() => calculateResult(inputs), [inputs]);

  const comparison = useMemo<ComparisonResult | null>(() => {
    if (!inputs.compareCitySlug || inputs.compareCitySlug === inputs.citySlug) return null;

    const compareInputs = { ...inputs, citySlug: inputs.compareCitySlug };
    const compareResult = calculateResult(compareInputs);

    const netMonthlyDiff = result.netMonthly - compareResult.netMonthly;
    const effectiveTaxRateDiff = result.effectiveTaxRate - compareResult.effectiveTaxRate;
    const rentBurdenDiff = result.rentBurdenPercent - compareResult.rentBurdenPercent;
    const colAdjustedDiff = result.colAdjustedSalary - compareResult.colAdjustedSalary;
    const wagePowerDiff = result.wagePowerScore - compareResult.wagePowerScore;

    const primaryCity = cities.find(c => c.slug === inputs.citySlug);
    const compareCity = cities.find(c => c.slug === inputs.compareCitySlug);

    const diffAmount = Math.abs(netMonthlyDiff);
    const betterCity = netMonthlyDiff > 0 ? primaryCity?.name : compareCity?.name;
    const insight = `${betterCity} gives you $${diffAmount.toFixed(0)} more take-home pay each month and a ${Math.abs(effectiveTaxRateDiff).toFixed(1)}% ${effectiveTaxRateDiff > 0 ? 'higher' : 'lower'} effective tax rate.`;

    return {
      primary: result,
      compare: compareResult,
      netMonthlyDiff,
      effectiveTaxRateDiff,
      rentBurdenDiff,
      colAdjustedDiff,
      wagePowerDiff,
      insight,
    };
  }, [inputs, result]);

  const crunch = useCallback(() => {
    // Results update automatically on every input change
    // Button kept for UX feedback
  }, []);

  const reset = useCallback(() => {
    setInputs(defaultInputs);
    setShowResults(false);
  }, []);

  return {
    inputs,
    updateInput,
    result,
    comparison,
    showResults,
    crunch,
    reset,
    filingStatusLabels,
  };
}

// Types are already exported above via `export interface` and `export type FilingStatus`
