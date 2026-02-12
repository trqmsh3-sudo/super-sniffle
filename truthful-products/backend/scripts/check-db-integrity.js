const db = require('./config/database');

async function test() {
  try {
    console.log('🔍 Testing database connection...');
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
    
    const productsCount = await db.query('SELECT COUNT(*) FROM products');
    console.log('📊 Products in database:', productsCount.rows[0].count);
    
    const dossiersCount = await db.query('SELECT COUNT(*) FROM dossiers');
    console.log('📄 Dossiers in database:', dossiersCount.rows[0].count);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

test();
