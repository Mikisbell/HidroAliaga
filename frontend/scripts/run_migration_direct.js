
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Constructed Direct Connection String (Standard Supabase Format)
// ref: hmwaoxbluljfqmsytyjv
// pass: M1k1sB3ll.$
const connectionString = "postgresql://postgres:M1k1sB3ll.$@db.hmwaoxbluljfqmsytyjv.supabase.co:5432/postgres";

async function runDirectMigration() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to DIRECT database (port 5432)...');
        await client.connect();
        console.log('Connected successfully!');

        // 1. Run Migration
        const sqlPath = path.join(__dirname, '..', 'database', 'fix_proyectos_columns.sql');
        if (fs.existsSync(sqlPath)) {
            console.log(`Reading SQL from: ${sqlPath}`);
            const sql = fs.readFileSync(sqlPath, 'utf8');
            console.log('Executing SQL migration...');
            await client.query(sql);
            console.log('Migration executed.');
        } else {
            console.log('SQL file not found, skipping migration step, just reloading cache.');
        }

        // 2. Notify Pgrst
        console.log('Notifying pgrst to reload schema...');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Schema cache reload notified.');

    } catch (err) {
        console.error('Direct migration failed:', err);
    } finally {
        await client.end();
    }
}

runDirectMigration();
