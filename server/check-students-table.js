import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkStudentsTable() {
    try {
        console.log('Connecting to database...');

        // Check students table columns
        console.log('\n📋 Checking students table columns...');
        const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'students'
      ORDER BY ordinal_position
    `);

        console.log('Students table columns:');
        columnsResult.rows.forEach(row => {
            console.log(`  - ${row.column_name} (${row.data_type})`);
        });

        // Check a sample student record
        console.log('\n📋 Sample student record (first one):');
        const sampleResult = await pool.query('SELECT * FROM students LIMIT 1');
        if (sampleResult.rows.length > 0) {
            console.log(JSON.stringify(sampleResult.rows[0], null, 2));
        } else {
            console.log('No students found in database');
        }

    } catch (err) {
        console.error('❌ Check failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

checkStudentsTable();
