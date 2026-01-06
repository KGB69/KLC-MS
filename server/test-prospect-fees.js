import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkProspectFees() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Check if translation_total_fee and interpretation_total_fee columns exist
        const columnsQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'prospects' 
            AND column_name IN ('translation_total_fee', 'interpretation_total_fee')
            ORDER BY column_name;
        `;

        const columnsResult = await client.query(columnsQuery);
        console.log('\n=== Fee Columns in Prospects Table ===');
        if (columnsResult.rows.length === 0) {
            console.log('❌ NO FEE COLUMNS FOUND!');
        } else {
            columnsResult.rows.forEach(row => {
                console.log(`✓ ${row.column_name}: ${row.data_type}`);
            });
        }

        // Check actual prospect data with fees
        const prospectsQuery = `
            SELECT 
                id,
                prospect_name,
                service_interested_in,
                translation_total_fee,
                interpretation_total_fee,
                status
            FROM prospects
            WHERE status = 'Converted'
            ORDER BY created_at DESC
            LIMIT 5;
        `;

        const prospectsResult = await client.query(prospectsQuery);
        console.log('\n=== Sample Converted Prospects (Last 5) ===');
        if (prospectsResult.rows.length === 0) {
            console.log('No converted prospects found');
        } else {
            prospectsResult.rows.forEach(row => {
                console.log(`\nID: ${row.id}`);
                console.log(`Name: ${row.prospect_name}`);
                console.log(`Service: ${row.service_interested_in}`);
                console.log(`Translation Fee: ${row.translation_total_fee || 'NULL'}`);
                console.log(`Interpretation Fee: ${row.interpretation_total_fee || 'NULL'}`);
            });
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkProspectFees();
