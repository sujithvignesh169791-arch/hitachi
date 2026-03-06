const path = require('path');
const fs = require('fs');

console.log('🔄 Supabase Setup Instructions:');
console.log('-------------------------------');
console.log('1. Go to your Supabase Project Dashboard.');
console.log('2. Open the "SQL Editor" from the sidebar.');
console.log('3. Create a "New Query".');
console.log('4. Copy the content of "backend/database/schema.sql" and paste it into the editor.');
console.log('5. Click "Run" to create your tables.');
console.log('6. Once tables are created, you can run the seed script:');
console.log('   npm run db:seed');
console.log('-------------------------------');

const schemaPath = path.join(__dirname, '../database/schema.sql');
if (fs.existsSync(schemaPath)) {
    console.log(`✅ Found schema at: ${schemaPath}`);
} else {
    console.log('⚠️  Warning: schema.sql not found in database directory.');
}
