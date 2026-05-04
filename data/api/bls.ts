

// BLS Public Data API v2
// https://www.bls.gov/developers/api_signature_v2.htm
const BLS_BASE = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';
const BLS_REGISTRATION_KEY = import.meta.env.VITE_BLS_API_KEY || '';

// BLS OES Survey codes for national occupational employment
// Format: OEUN + industry(000000) + occ_code + datatype(04=median) + source
// Example: OEUN000000000000004 — All occupations median wage

interface BLSSeriesData {
  year: string;
  period: string;
  periodName: string;
  value: string;
  footnotes: { code: string; text: string }[];
}

interface BLSResponse {
  status: string;
  message: string[];
  Results?: {
    series: {
      seriesID: string;
      data: BLSSeriesData[];
    }[];
  };
}

const SOC_TO_BLS_OE = {
  '15-1252': 'OEUN000000000000004', // Software Developers
  '29-1141': 'OEUN000000000000004',  // Registered Nurses
  '25-2021': 'OEUN000000000000004',  // Elementary Teachers
  '15-2051': 'OEUN000000000000004',  // Data Scientists
  '11-2021': 'OEUN000000000000004',  // Marketing Managers
  '21-1022': 'OEUN000000000000004',  // Social Workers
  '31-9092': 'OEUN000000000000004',  // Medical Assistants
  '27-1024': 'OEUN000000000000004',  // Graphic Designers
  '13-1071': 'OEUN000000000000004',  // HR Specialists
  '13-2051': 'OEUN000000000000004',  // Financial Analysts
  '17-2141': 'OEUN000000000000004',  // Mechanical Engineers
  '47-2111': 'OEUN000000000000004',  // Electricians
  '13-2011': 'OEUN000000000000004',  // Accountants
  '29-1123': 'OEUN000000000000004',  // Physical Therapists
  '13-1111': 'OEUN000000000000004',  // Management Analysts
  '15-1255': 'OEUN000000000000004',  // Web Designers
  '41-4012': 'OEUN000000000000004',  // Sales Reps
  '17-2051': 'OEUN000000000000004',  // Civil Engineers
  '29-1071': 'OEUN000000000000004',  // Physician Assistants
  '29-2061': 'OEUN000000000000004',  // LPNs
  '33-3051': 'OEUN000000000000004',  // Police Officers
  '37-2012': 'OEUN000000000000004',  // Janitors
  '35-1011': 'OEUN000000000000004',  // Chefs
  '43-6014': 'OEUN000000000000004',  // Secretaries
  '29-1122': 'OEUN000000000000004',  // Occupational Therapists
  '15-1232': 'OEUN000000000000004',  // Computer Support
  '53-3032': 'OEUN000000000000004',  // Truck Drivers
  '25-2011': 'OEUN000000000000004',  // Preschool Teachers
  '39-5012': 'OEUN000000000000004',  // Hairdressers
  '51-4121': 'OEUN000000000000004',  // Welders
};

export interface BLSWageData {
  socCode: string;
  occupation: string;
  medianAnnual: number;
  hourlyRate: number;
  employment: number;
  fetchedAt: string;
  source: string;
}

/**
 * Fetch latest BLS Occupational Employment and Wage Statistics.
 * Falls back to cached data if API is unavailable.
 */
export async function fetchBLSWageData(
  socCodes: string[],
  year: string = '2023'
): Promise<Map<string, BLSWageData>> {
  const results = new Map<string, BLSWageData>();

  // BLS API requires registration key for bulk requests
  // Without key, limited to 25 queries/day, 500 series per query
  const apiKey = BLS_REGISTRATION_KEY;

  if (!apiKey) {
    console.warn('[BLS] No API key configured. Using cached data. Register at https://data.bls.gov/registrationEngine/');
    return results; // Empty — caller should use cached seed data
  }

  try {
    const seriesIds = socCodes
      .map(code => SOC_TO_BLS_OE[code as keyof typeof SOC_TO_BLS_OE])
      .filter(Boolean);

    if (seriesIds.length === 0) return results;

    const response = await fetch(BLS_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: seriesIds,
        startyear: year,
        endyear: year,
        registrationkey: apiKey,
        catalog: true,
        calculations: false,
        annualaverage: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`BLS API returned ${response.status}: ${await response.text()}`);
    }

    const data: BLSResponse = await response.json();

    if (data.status !== 'REQUEST_SUCCEEDED') {
      throw new Error(`BLS API error: ${data.message.join(', ')}`);
    }

    for (const series of data.Results?.series || []) {
      const latest = series.data[0];
      if (!latest) continue;

      // Map series ID back to SOC code
      const socCode = Object.entries(SOC_TO_BLS_OE).find(([, v]) => v === series.seriesID)?.[0];
      if (!socCode) continue;

      results.set(socCode, {
        socCode,
        occupation: '', // Would need catalog=true to get this
        medianAnnual: parseFloat(latest.value) * 1000, // BLS reports in thousands
        hourlyRate: parseFloat(latest.value) * 1000 / 2080,
        employment: 0,
        fetchedAt: new Date().toISOString(),
        source: `BLS OES ${latest.year}`,
      });
    }

    console.log(`[BLS] Fetched fresh data for ${results.size} occupations`);
  } catch (err) {
    console.error('[BLS] Fetch failed:', err);
  }

  return results;
}

/**
 * Check BLS API availability without making a full request.
 */
export async function checkBLSStatus(): Promise<{ available: boolean; message: string }> {
  if (!BLS_REGISTRATION_KEY) {
    return {
      available: false,
      message: 'BLS API key not configured. Register at https://data.bls.gov/registrationEngine/',
    };
  }
  try {
    const response = await fetch(`${BLS_BASE}?catalog=true&startyear=2023&endyear=2023&registrationkey=${BLS_REGISTRATION_KEY}&seriesid=OEUN000000000000004`, {
      method: 'GET',
    });
    if (response.ok) {
      return { available: true, message: 'BLS API accessible' };
    }
    return { available: false, message: `BLS API returned ${response.status}` };
  } catch {
    return { available: false, message: 'BLS API unreachable (network error)' };
  }
}
