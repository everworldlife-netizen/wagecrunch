

// Census Data API
// https://api.census.gov/data/2023/acs/acs1
// Variables: B19013_001E (median household income), B25064_001E (median gross rent),
// B01003_001E (population), B25077_001E (median home value)
const CENSUS_BASE = 'https://api.census.gov/data/2023/acs/acs1';
const CENSUS_KEY = import.meta.env.VITE_CENSUS_API_KEY || '';

// Census place codes for our 26 cities
// Format: state_fips + place_fips
const CENSUS_PLACE_CODES: Record<string, { state: string; place: string }> = {
  'austin-tx': { state: '48', place: '05000' },
  'chicago-il': { state: '17', place: '14000' },
  'denver-co': { state: '08', place: '20000' },
  'seattle-wa': { state: '53', place: '63000' },
  'san-francisco-ca': { state: '06', place: '67000' },
  'new-york-ny': { state: '36', place: '51000' },
  'boston-ma': { state: '25', place: '07000' },
  'nashville-tn': { state: '47', place: '52006' },
  'atlanta-ga': { state: '13', place: '04000' },
  'dallas-tx': { state: '48', place: '19000' },
  'phoenix-az': { state: '04', place: '55000' },
  'miami-fl': { state: '12', place: '45000' },
  'los-angeles-ca': { state: '06', place: '44000' },
  'portland-or': { state: '41', place: '59000' },
  'raleigh-nc': { state: '37', place: '55000' },
  'pittsburgh-pa': { state: '42', place: '61000' },
  'indianapolis-in': { state: '18', place: '36003' },
  'columbus-oh': { state: '39', place: '18000' },
  'st-louis-mo': { state: '29', place: '65000' },
  'milwaukee-wi': { state: '55', place: '53000' },
  'houston-tx': { state: '48', place: '35000' },
  'philadelphia-pa': { state: '42', place: '60000' },
  'charlotte-nc': { state: '37', place: '12000' },
  'kansas-city-mo': { state: '29', place: '38000' },
  'cincinnati-oh': { state: '39', place: '15000' },
  'tampa-fl': { state: '12', place: '71000' },
};

export interface CensusCityData {
  slug: string;
  medianIncome: number | null;
  medianRent: number | null;
  population: number | null;
  medianAge: number | null;
  povertyRate: number | null;
  unemploymentRate: number | null;
  fetchedAt: string;
  source: string;
}

/**
 * Fetch ACS 1-Year data for a city.
 * ACS 1-Year is only available for geographies with 65,000+ population.
 */
export async function fetchCensusCityData(slug: string): Promise<CensusCityData | null> {
  const place = CENSUS_PLACE_CODES[slug];
  if (!place) {
    console.warn(`[Census] No place code for ${slug}`);
    return null;
  }

  const forParam = `place:${place.place}`;
  const inParam = `state:${place.state}`;

  // Variables: median income, median rent, population
  const vars = 'B19013_001E,B25064_001E,B01003_001E,B25077_001E,B23027_002E,B23027_001E';

  try {
    const url = `${CENSUS_BASE}?get=${vars}&for=${forParam}&in=${inParam}${CENSUS_KEY ? '&key=' + CENSUS_KEY : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Census API returned ${response.status}`);
    }

    const data = await response.json();
    // Census returns: [headers, [values]]
    if (!Array.isArray(data) || data.length < 2) {
      throw new Error('Unexpected Census response format');
    }

    const values = data[1];
    const headers = data[0];

    const getVal = (varName: string) => {
      const idx = headers.indexOf(varName);
      const val = idx >= 0 ? parseFloat(values[idx]) : NaN;
      return isNaN(val) || val < 0 ? null : val;
    };

    const income = getVal('B19013_001E');
    const rent = getVal('B25064_001E');
    const pop = getVal('B01003_001E');
    const employed = getVal('B23027_002E');
    const laborForce = getVal('B23027_001E');

    return {
      slug,
      medianIncome: income,
      medianRent: rent,
      population: pop,
      medianAge: null,
      povertyRate: null,
      unemploymentRate: laborForce && employed ? Math.round(((laborForce - employed) / laborForce) * 1000) / 10 : null,
      fetchedAt: new Date().toISOString(),
      source: 'US Census Bureau ACS 2023 1-Year',
    };
  } catch (err) {
    console.error(`[Census] Failed to fetch ${slug}:`, err);
    return null;
  }
}

/**
 * Fetch data for all tracked cities.
 */
export async function fetchAllCensusData(): Promise<Map<string, CensusCityData>> {
  const results = new Map<string, CensusCityData>();

  for (const slug of Object.keys(CENSUS_PLACE_CODES)) {
    const data = await fetchCensusCityData(slug);
    if (data) results.set(slug, data);
    // Rate limit: Census allows 500 queries/day without key, 50/second with key
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`[Census] Fetched data for ${results.size} cities`);
  return results;
}
