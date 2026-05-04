export interface DataSourceFreshness {
  source: string;
  lastUpdated: string;
  nextScheduledUpdate: string;
  updateFrequency: string;
  status: 'current' | 'stale' | 'fetching' | 'error';
  recordsCount: number;
}

export const FRESHNESS_CONFIG = {
  // How often each data source should be refreshed
  BLS_OES: { frequency: 'annual', month: 5, label: 'BLS OES' }, // May each year
  CENSUS_ACS: { frequency: 'annual', month: 9, label: 'Census ACS' }, // September each year
  HUD_FMR: { frequency: 'annual', month: 4, label: 'HUD FMR' }, // April each year
  BEA_RPP: { frequency: 'annual', month: 7, label: 'BEA RPP' }, // July each year
  IRS_TAX: { frequency: 'annual', month: 1, label: 'IRS Tax Brackets' }, // January each year
};

// Last known update dates for the seed data (these would be populated by the build script)
export const LAST_KNOWN_UPDATES: Record<string, string> = {
  BLS_OES: '2024-05-15',      // BLS OES May 2023 data released May 2024
  CENSUS_ACS: '2024-09-19',    // ACS 2023 1-year released Sept 2024
  HUD_FMR: '2024-04-01',       // FY2024 FMRs released April 2024
  BEA_RPP: '2024-07-25',       // RPP 2023 released July 2024
  IRS_TAX: '2024-01-01',       // 2024 tax brackets
};

/**
 * Calculate data freshness status for a source.
 */
export function getDataFreshness(source: string): DataSourceFreshness {
  const lastUpdated = LAST_KNOWN_UPDATES[source] || new Date().toISOString().split('T')[0];
  const lastDate = new Date(lastUpdated);
  const now = new Date();

  const config = FRESHNESS_CONFIG[source as keyof typeof FRESHNESS_CONFIG];
  const freq = config?.frequency || 'annual';

  // Calculate days since update
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // Determine status
  let status: DataSourceFreshness['status'] = 'current';
  if (daysSince > 400) status = 'stale';
  else if (daysSince > 300) status = 'current'; // Still within year

  // Next scheduled update
  const nextYear = now.getFullYear() + (now.getMonth() > (config?.month || 6) ? 1 : 0);
  const nextUpdate = `${nextYear}-${String(config?.month || 1).padStart(2, '0')}-01`;

  return {
    source: config?.label || source,
    lastUpdated,
    nextScheduledUpdate: nextUpdate,
    updateFrequency: freq === 'annual' ? 'Once per year' : freq,
    status,
    recordsCount: 0, // Would be populated by fetcher
  };
}

/**
 * Get freshness for all sources.
 */
export function getAllDataFreshness(): DataSourceFreshness[] {
  return Object.keys(FRESHNESS_CONFIG).map(source => getDataFreshness(source));
}

/**
 * Format a date for display.
 */
export function formatFreshnessDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

/**
 * Check if data needs refresh based on source schedule.
 */
export function needsRefresh(source: string): boolean {
  const freshness = getDataFreshness(source);
  return freshness.status === 'stale' || freshness.status === 'error';
}
