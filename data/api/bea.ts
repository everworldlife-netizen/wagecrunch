// Bureau of Economic Analysis Regional Price Parities API
// https://apps.bea.gov/api/data
const BEA_BASE = 'https://apps.bea.gov/api/data';
const BEA_KEY = import.meta.env.VITE_BEA_API_KEY || '';

// BEA RPP dataset: RegionalPriceParities
// TableId: RPPALL (All items RPP by metro area)

export interface BEARPPData {
  metroArea: string;
  colIndex: number | null;
  year: string;
  fetchedAt: string;
  source: string;
}

/**
 * Fetch BEA Regional Price Parities for all metro areas.
 * Requires free API key from https://apps.bea.gov/API/signup/index.cfm
 */
export async function fetchBEARPP(year: string = '2023'): Promise<Map<string, BEARPPData>> {
  const results = new Map<string, BEARPPData>();

  if (!BEA_KEY) {
    console.warn('[BEA] No API key configured. Register at https://apps.bea.gov/API/signup/index.cfm');
    return results;
  }

  try {
    const url = `${BEA_BASE}?&UserID=${BEA_KEY}&method=GetData&datasetname=Regional&TableName=RPPALL&GeoFIPS=METRO&Year=${year}&Frequency=A&ResultFormat=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`BEA API returned ${response.status}`);
    }

    const data = await response.json();
    const records = data?.BEAAPI?.Results?.Data || [];

    for (const record of records) {
      const geoName = record.GeoName || '';
      const value = parseFloat(record.DataValue);

      if (geoName && !isNaN(value)) {
        results.set(geoName, {
          metroArea: geoName,
          colIndex: value,
          year: record.TimePeriod || year,
          fetchedAt: new Date().toISOString(),
          source: `BEA Regional Price Parities ${record.TimePeriod || year}`,
        });
      }
    }

    console.log(`[BEA] Fetched RPP data for ${results.size} metro areas`);
  } catch (err) {
    console.error('[BEA] Fetch failed:', err);
  }

  return results;
}
