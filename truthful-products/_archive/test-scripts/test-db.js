require('./loadEnv');
const db = require('./config/database');

async function testConnection() {
  console.log('\n🔍 Testing PostgreSQL connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic connection...');
    const result = await db.query('SELECT NOW() as current_time, version()');
    console.log('✅ Connected successfully!');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   Version: ${result.rows[0].version.substring(0, 50)}...\n`);

    // Test 2: Check tables
    console.log('Test 2: Checking tables...');
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    console.log('');

    // Test 3: Count records
    console.log('Test 3: Counting records...');
    const productCount = await db.query('SELECT COUNT(*) FROM products');
    const dossierCount = await db.query('SELECT COUNT(*) FROM dossiers');
    
    console.log(`✅ Current data:`);
    console.log(`   - Products: ${productCount.rows[0].count}`);
    console.log(`   - Dossiers: ${dossierCount.rows[0].count}`);
    console.log('');

    console.log('🎉 All tests passed!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check that PostgreSQL is running');
    console.error('   2. Verify .env file exists with correct credentials');
    console.error('   3. Make sure database "clearpick" exists');
    console.error('   4. Run schema.sql if tables are missing\n');
    process.exit(1);
  }
}

testConnection();
