const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5555,
    database: 'klc_crm',
    user: 'postgres',
    password: 'moizeak47'
});

async function addRoomNumberColumn() {
    try {
        await client.connect();
        console.log('Connected to database');

        await client.query('ALTER TABLE classes ADD COLUMN IF NOT EXISTS room_number TEXT;');
        console.log('✅ Successfully added room_number column to classes table');

        await client.end();
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
}

addRoomNumberColumn();
