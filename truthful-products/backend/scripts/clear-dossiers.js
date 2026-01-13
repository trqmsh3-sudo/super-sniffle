/**
 * Clear all dossiers from database
 * This will allow rebuilding with images for existing products
 */

require('dotenv').config();
const db = require('../config/database');

async function clearDossiers() {
  console.log('🗑️  Clearing all dossiers from database...\n');
  
  try {
    // Get count before deletion
    const countBefore = await db.query('SELECT COUNT(*)::int AS count FROM dossiers');
    const totalDossiers = countBefore.rows[0].count;
    
    console.log(`   Found ${totalDossiers} dossiers to delete`);
    
    if (totalDossiers === 0) {
      console.log('   ✅ No dossiers to delete');
      process.exit(0);
    }
    
    // Delete all dossiers
    await db.query('DELETE FROM dossiers');
    
    // Verify deletion
    const countAfter = await db.query('SELECT COUNT(*)::int AS count FROM dossiers');
    const remaining = countAfter.rows[0].count;
    
    if (remaining === 0) {
      console.log(`   ✅ Successfully deleted ${totalDossiers} dossiers\n`);
      console.log('   💡 Next steps:');
      console.log('      1. Products still exist in database');
      console.log('      2. When you build a dossier again, it will include images');
      console.log('      3. Use POST /api/products/build to rebuild any product\n');
    } else {
      console.error(`   ❌ Error: ${remaining} dossiers still exist`);
      process.exit(1);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error clearing dossiers:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  clearDossiers();
}

module.exports = clearDossiers;
