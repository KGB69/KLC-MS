// One-time database initialization script
// Run this in the Render web service shell to initialize the database

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initializeDatabase() {
    try {
        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Executing schema...');
        await client.query(schema);

        console.log('✅ Database initialized successfully!');
        console.log('Tables created:');
        console.log('  - users');
        console.log('  - prospects');
        console.log('  - students');
        console.log('  - follow_up_actions');
        console.log('  - classes');
        console.log('  - class_schedules');
        console.log('  - student_enrollments');
        console.log('  - payments');
        console.log('  - expenditures');
        console.log('  - communications');

        client.release();
        await pool.end();

        console.log('\n🎉 You can now register and use the application!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initializeDatabase();
