#!/usr/bin/env node
/**
 * WageCrunch Data Refresh Script
 * 
 * Run this script at build time to fetch fresh data from public APIs.
 * Falls back to cached seed data if APIs are unavailable.
 * 
 * Usage: node scripts/refresh-data.js
 */

import { runDataPipeline } from '../src/data/api/orchestrator.js';

async function main() {
  console.log('=== WageCrunch Data Refresh ===');
  console.log('Fetching latest data from public sources...
');

  const result = await runDataPipeline();

  console.log('
=== Results ===');
  console.log(`BLS OES:      ${result.bls.success ? '✅' : '❌'} ${result.bls.count} occupations`);
  console.log(`Census ACS:   ${result.census.success ? '✅' : '❌'} ${result.census.count} cities`);
  console.log(`BEA RPP:      ${result.bea.success ? '✅' : '❌'} ${result.bea.count} metro areas`);
  console.log(`HUD FMR:      ${result.hud.success ? '✅' : '❌'} ${result.hud.count} rent areas`);
  console.log(`
Timestamp:    ${result.timestamp}`);

  // Write results to a JSON file for the build to consume
  const fs = await import('fs');
  const pipelineResult = {
    ...result,
    buildDate: new Date().toISOString(),
  };

  fs.writeFileSync(
    './src/data/pipeline-result.json',
    JSON.stringify(pipelineResult, null, 2)
  );

  console.log('
✅ Pipeline result saved to src/data/pipeline-result.json');
}

main().catch(console.error);
