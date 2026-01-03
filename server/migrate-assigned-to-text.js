// Simple migration to change assigned_to to TEXT
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    port: 5555,
    database: 'klc_crm',
    user: 'postgres',
    password: 'moizeak47'
});

async function migrate() {
    try {
        console.log('Connecting to PostgreSQL on port 5555...');

        // Drop the foreign key constraint and change column type
        const result = await pool.query(`
            ALTER TABLE follow_up_actions 
            DROP CONSTRAINT IF EXISTS follow_up_actions_assigned_to_fkey;
            
            ALTER TABLE follow_up_actions 
            ALTER COLUMN assigned_to TYPE TEXT;
        `);

        console.log('✓ Migration completed successfully!');
        console.log('assigned_to column is now TEXT type');
        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await pool.end();
        process.exit(1);
    }
}

migrate();
