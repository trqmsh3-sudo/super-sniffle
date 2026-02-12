#!/usr/bin/env node
/**
 * Update DATABASE_URL in Render via API.
 * Usage: RENDER_API_KEY=xxx node scripts/update-render-database-url.js
 * 
 * Get API key: https://dashboard.render.com/settings/api-keys
 */

const SERVICE_ID = 'srv-d5jimbt6ubrc738vo5g0';
const DATABASE_URL = 'postgresql://clearpick_v2_user:dOkNDCFNRG0KqwrMMvXNPDATj9K7Dw5m@dpg-d66csii48b3s73esvpp0-a/clearpick_v2';

async function main() {
  const apiKey = process.env.RENDER_API_KEY;
  if (!apiKey) {
    console.error('❌ RENDER_API_KEY is required.');
    console.error('');
    console.error('1. Go to: https://dashboard.render.com/settings/api-keys');
    console.error('2. Create an API key');
    console.error('3. Run: RENDER_API_KEY=your_key node scripts/update-render-database-url.js');
    console.error('');
    console.error('On Windows PowerShell:');
    console.error('  $env:RENDER_API_KEY="your_key"; node scripts/update-render-database-url.js');
    process.exit(1);
  }

  const url = `https://api.render.com/v1/services/${SERVICE_ID}/env-vars/DATABASE_URL`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value: DATABASE_URL }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ API error ${res.status}: ${text}`);
    process.exit(1);
  }

  console.log('✅ DATABASE_URL updated successfully.');

  // Trigger deploy (rebuild with new env)
  const deployUrl = `https://api.render.com/v1/services/${SERVICE_ID}/deploys`;
  const deployRes = await fetch(deployUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!deployRes.ok) {
    const text = await deployRes.text();
    console.warn(`⚠️ Env updated but deploy failed: ${deployRes.status} ${text}`);
    console.log('Trigger deploy manually: https://dashboard.render.com/web/' + SERVICE_ID);
    return;
  }

  const deploy = await deployRes.json();
  console.log('✅ Deploy triggered. Build in progress.');
  console.log('   https://dashboard.render.com/web/' + SERVICE_ID);
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
