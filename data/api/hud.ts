// HUD Fair Market Rents API
// https://www.huduser.gov/portal/dataset/fmr-api.html
const HUD_BASE = 'https://www.huduser.gov/hudapi/public/fmr';
const HUD_KEY = import.meta.env.VITE_HUD_API_KEY || '';

// HUD FMR area codes for metro areas
// These are FMR area codes, not CBSA codes
export interface HUDRentData {
  areaCode: string;
  areaName: string;
  studio: number | null;
  oneBr: number | null;
  twoBr: number | null;
  threeBr: number | null;
  fourBr: number | null;
  year: number;
  fetchedAt: string;
  source: string;
}

/**
 * Fetch Fair Market Rents for a metro area.
 * Requires free API key from https://www.huduser.gov/portal/dataset/fmr-api.html
 */
export async function fetchHUDFMR(stateCode: string, year: number = 2024): Promise<Map<string, HUDRentData>> {
  const results = new Map<string, HUDRentData>();

  if (!HUD_KEY) {
    console.warn('[HUD] No API key configured. Register at https://www.huduser.gov/portal/dataset/fmr-api.html');
    return results;
  }

  try {
    const url = `${HUD_BASE}/statedata/${year}?state=${stateCode}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${HUD_KEY}` },
    });

    if (!response.ok) {
      throw new Error(`HUD API returned ${response.status}`);
    }

    const data = await response.json();
    const areas = data?.data?.areas || [];

    for (const area of areas) {
      results.set(area.area_code, {
        areaCode: area.area_code,
        areaName: area.area_name,
        studio: area.safmr_0_bedroom || null,
        oneBr: area.safmr_1_bedroom || null,
        twoBr: area.safmr_2_bedroom || null,
        threeBr: area.safmr_3_bedroom || null,
        fourBr: area.safmr_4_bedroom || null,
        year,
        fetchedAt: new Date().toISOString(),
        source: `HUD FMR FY${year}`,
      });
    }

    console.log(`[HUD] Fetched FMR data for ${results.size} areas in ${stateCode}`);
  } catch (err) {
    console.error(`[HUD] Failed to fetch ${stateCode}:`, err);
  }

  return results;
}
