require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addLanguageColumn() {
    try {
        console.log('Connecting to database...');

        // Add language_of_study column if it doesn't exist
        console.log('Adding language_of_study column to students table...');
        await pool.query(`
      ALTER TABLE students 
      ADD COLUMN IF NOT EXISTS language_of_study TEXT
    `);

        console.log('✅ Successfully added language_of_study column!');
        console.log('Student update should now work correctly.');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

addLanguageColumn();
