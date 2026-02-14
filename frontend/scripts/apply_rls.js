const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env
const envPath = path.resolve(__dirname, '../../backend/.env');
dotenv.config({ path: envPath });

// Fallback: Check local .env.local if backend one didn't yield DATABASE_URL
if (!process.env.DATABASE_URL) {
    dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
}

async function applyRLS() {
    console.log('🔌 Connecting to database using Node.js pg client...');

    // Parse connection string explicitly to ensure we pick it up
    const connectionString = process.env.DATABASE_URL?.replace('+asyncpg', ''); // Remove asyncpg modifier if present

    if (!connectionString) {
        console.error('❌ DATABASE_URL not found in .env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!');

        const sqlPath = path.resolve(__dirname, '../src/lib/supabase/migrations/rbac_schema.sql');
        console.log(`📖 Reading SQL from ${sqlPath}...`);
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');

        console.log('🚀 Executing RLS policies...');
        await client.query(sqlContent);

        console.log('✅ RLS Policies applied successfully!');
        console.log('🔒 Data isolation is now enforced.');

    } catch (err) {
        console.error('❌ Error executing script:', err);
    } finally {
        await client.end();
    }
}

applyRLS();
