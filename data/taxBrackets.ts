export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

export interface FilingStatusBrackets {
  federal: TaxBracket[];
  standardDeduction: number;
}

// 2024 Federal Tax Brackets
export const federalTaxBrackets2024: Record<string, FilingStatusBrackets> = {
  single: {
    standardDeduction: 14600,
    federal: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ],
  },
  married_jointly: {
    standardDeduction: 29200,
    federal: [
      { min: 0, max: 23200, rate: 0.10 },
      { min: 23200, max: 94300, rate: 0.12 },
      { min: 94300, max: 201050, rate: 0.22 },
      { min: 201050, max: 383900, rate: 0.24 },
      { min: 383900, max: 487450, rate: 0.32 },
      { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 },
    ],
  },
  married_separately: {
    standardDeduction: 14600,
    federal: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191950, rate: 0.24 },
      { min: 191950, max: 243725, rate: 0.32 },
      { min: 243725, max: 365600, rate: 0.35 },
      { min: 365600, max: Infinity, rate: 0.37 },
    ],
  },
  head_of_household: {
    standardDeduction: 21900,
    federal: [
      { min: 0, max: 16550, rate: 0.10 },
      { min: 16550, max: 63100, rate: 0.12 },
      { min: 63100, max: 100500, rate: 0.22 },
      { min: 100500, max: 191950, rate: 0.24 },
      { min: 191950, max: 243700, rate: 0.32 },
      { min: 243700, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 },
    ],
  },
};

// FICA constants (2024)
export const ficaRates = {
  socialSecurityRate: 0.062,
  medicareRate: 0.0145,
  socialSecurityWageBase: 168600,
  additionalMedicareThreshold: 200000,
  additionalMedicareRate: 0.009,
};

// State tax rates (simplified flat/average effective rates)
export const stateTaxRates: Record<string, number> = {
  TX: 0.0, TN: 0.0, FL: 0.0, NV: 0.0, WA: 0.0, WY: 0.0, SD: 0.0, AK: 0.0,
  IL: 0.0495, PA: 0.0307, IN: 0.0323, MA: 0.05, NC: 0.0475, AZ: 0.025, UT: 0.0465,
  CO: 0.044, OH: 0.04, GA: 0.0575, MO: 0.054, WI: 0.0654, OR: 0.0875,
  CA: 0.093, NY: 0.0685, NJ: 0.0575, MN: 0.068, MD: 0.0575, VA: 0.0575,
  MI: 0.0405, SC: 0.07, AL: 0.05, LA: 0.04, OK: 0.0475, KY: 0.05,
  AR: 0.045, MS: 0.05, NM: 0.049, NE: 0.0664, IA: 0.0605, KS: 0.057,
  MT: 0.069, ID: 0.058, HI: 0.08, DE: 0.066, ME: 0.0715, VT: 0.0875,
  RI: 0.0599, CT: 0.0699, WV: 0.065, ND: 0.0296, NH: 0.05, DC: 0.0895,
};

export function getStateTaxRate(stateCode: string): number {
  return stateTaxRates[stateCode] ?? 0.05; // Default to 5% if unknown
}

export function calculateFederalTax(taxableIncome: number, filingStatus: string): number {
  const brackets = federalTaxBrackets2024[filingStatus];
  if (!brackets) return taxableIncome * 0.22; // Fallback

  let tax = 0;
  for (const bracket of brackets.federal) {
    if (taxableIncome > bracket.min) {
      const taxableAtBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
      tax += taxableAtBracket * bracket.rate;
    }
  }
  return Math.max(0, tax);
}

export function calculateFICATax(income: number): { socialSecurity: number; medicare: number; total: number } {
  const socialSecurity = Math.min(income, ficaRates.socialSecurityWageBase) * ficaRates.socialSecurityRate;
  let medicare = income * ficaRates.medicareRate;
  if (income > ficaRates.additionalMedicareThreshold) {
    medicare += (income - ficaRates.additionalMedicareThreshold) * ficaRates.additionalMedicareRate;
  }
  return {
    socialSecurity,
    medicare,
    total: socialSecurity + medicare,
  };
}
