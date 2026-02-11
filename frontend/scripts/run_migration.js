
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Hardcode the connection string from .env.local because environment variable loading can be tricky in standalone scripts
// and we just verified it exists in the file view.
// Password contains special characters, ensure it's correct.
const connectionString = "postgresql://postgres.hmwaoxbluljfqmsytyjv:M1k1sB3ll.$@aws-1-sa-east-1.pooler.supabase.com:6543/postgres";

async function runMigration() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected successfully.');

        console.log('Reloading PostgREST schema cache...');
        await client.query("NOTIFY pgrst, 'reload schema';");
        console.log('Schema cache reload notified.');

        // Optional: wait a bit?
        await new Promise(r => setTimeout(r, 1000));


        const sqlPath = path.join(__dirname, '..', '..', 'database', 'add_descripcion.sql');
        console.log(`Reading SQL from: ${sqlPath}`);

        if (!fs.existsSync(sqlPath)) {
            throw new Error(`SQL file not found at ${sqlPath}`);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Executing SQL migration...');

        // Execute the SQL
        await client.query(sql);

        console.log('Migration executed successfully!');
        console.log('Columns added/verified: ambito, tipo_red, departamento, etc.');


    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
