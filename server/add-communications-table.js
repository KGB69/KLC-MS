import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function addCommunicationsTable() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Creating communications table...');

        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS communications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          prospect_id UUID REFERENCES prospects(id) ON DELETE CASCADE,
          assigned_to TEXT NOT NULL,
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'Pending',
          priority TEXT DEFAULT 'medium',
          outcome TEXT,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.query(createTableSQL);

        console.log('✅ Communications table created successfully!');

    } catch (error) {
        console.error('❌ Error creating communications table:', error);
        throw error;
    } finally {
        await client.end();
    }
}

addCommunicationsTable()
    .then(() => {
        console.log('Migration completed!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
