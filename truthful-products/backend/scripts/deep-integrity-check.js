const axios = require('axios');

const API_BASE = 'https://10w0d94b94.onrender.com/api';

async function deepCheck() {
  console.log('🚀 Starting Deep Integrity Check for ClearPick.ai\n');

  try {
    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', JSON.stringify(health.data, null, 2));

    // 2. Stats Check
    console.log('\n--- 2. Stats Check ---');
    const stats = await axios.get(`${API_BASE}/stats`);
    console.log('✅ Stats:', JSON.stringify(stats.data, null, 2));

    // 3. Search Check (Existing/Suggestions)
    console.log('\n--- 3. Search Check (iPhone) ---');
    const search = await axios.get(`${API_BASE}/search?q=iPhone`);
    console.log('✅ Search Results:', search.data.success ? 'Success' : 'Failed');
    console.log('   Suggestions count:', search.data.suggestions?.length || 0);

    // 4. Build Flow Check (Dry Run / Validation)
    // We won't trigger a full build to save API costs, but we'll check if the endpoint is responsive.
    console.log('\n--- 4. Build Flow Check (Validation) ---');
    try {
      const build = await axios.post(`${API_BASE}/products/build`, { productName: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Build endpoint validation working (returned 400 for empty name)');
      } else {
        console.log('❌ Build endpoint returned unexpected status:', error.response?.status);
      }
    }

    console.log('\n--- 5. Frontend Connectivity ---');
    const frontend = await axios.get('https://www.clearpickai.com', { timeout: 10000 });
    console.log('✅ Frontend is up (Status:', frontend.status, ')');

    console.log('\n✨ Deep Check Completed Successfully.');
  } catch (error) {
    console.error('\n❌ Deep Check Failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data));
    }
  }
}

deepCheck();
