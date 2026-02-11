const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Helper to parse .env file manually since dotenv might not be installed
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) {
        console.warn(`.env file not found at: ${filePath}`);
        return {};
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    const lines = content.replace(/\r\n/g, '\n').split('\n');

    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;

        const match = trimmedLine.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    return env;
}

const envPath = path.resolve(__dirname, '../.env');
const envLocalPath = path.resolve(__dirname, '../.env.local');

console.log('Loading .env from:', envPath);
let env = loadEnv(envPath);

if (fs.existsSync(envLocalPath)) {
    console.log('Loading .env.local from:', envLocalPath);
    const envLocal = loadEnv(envLocalPath);
    env = { ...env, ...envLocal }; // .env.local overrides .env
}

console.log('Loaded env keys:', Object.keys(env));

if (env.DATABASE_URL) {
    console.log('DATABASE_URL found (length):', env.DATABASE_URL.length);
} else {
    console.error('DATABASE_URL NOT found in loaded env');
}

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error('Error: DATABASE_URL not found in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString.replace('?sslmode=require', '').replace('&sslmode=require', ''),
    ssl: {
        rejectUnauthorized: false
    }
});

async function migrate() {
    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected to database.');

        try {
            console.log('Enabling PostGIS extension...');
            await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
            console.log('PostGIS enabled.');
        } catch (e) {
            console.error('Failed to enable PostGIS (might need superuser or already enabled):', e.message);
        }

        const filesToExecute = [
            path.resolve(__dirname, '../../supabase/migrations/20240101000000_schema_inicial.sql'),
            path.resolve(__dirname, '../src/lib/supabase/migrations/fase10_planos.sql'),
            path.resolve(__dirname, '../src/lib/supabase/migrations/rbac_schema.sql'),
        ];

        for (const filePath of filesToExecute) {
            if (!fs.existsSync(filePath)) {
                console.error(`File not found: ${filePath}`);
                continue;
            }

            console.log(`Executing ${filePath}...`);
            const sqlContent = fs.readFileSync(filePath, 'utf8');

            // Simple split by semicolon, but be careful with functions/triggers containing semicolons
            // For this schema, splitting by simple semicolon might break functions.
            // But we can try to use a slightly smarter split or just rely on the fact that these are mostly CREATE TABLEs.
            // Actually, functions use $$ delimiters. Splitting by ; might break them.
            // Let's rely on pg's multi-statement support but log the result better.

            // Re-reading: pg client.query DOES support multiple statements.
            // If it failed silently, maybe it's because of the result handling?

            // Let's try to query specifically for nudos creation to see error.

            try {
                const res = await client.query(sqlContent);
                console.log(`Successfully executed ${path.basename(filePath)}`);
                if (Array.isArray(res)) {
                    console.log(`Executed ${res.length} statements.`);
                }
            } catch (e) {
                console.error(`Error executing ${path.basename(filePath)}:`, e.message);
                if (e.position) {
                    const lines = sqlContent.substring(0, e.position).split('\n');
                    console.error(`Error around line ${lines.length}: ${lines[lines.length - 1]}`);
                }
            }
        }

        // Verify tables
        console.log('Verifying tables...');
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);

        console.log('Tables found in public schema:');
        result.rows.forEach(row => console.log(`- ${row.table_name}`));

        const expectedTables = ['proyectos', 'nudos', 'tramos', 'calculos', 'iteraciones', 'optimizaciones', 'normativas', 'alertas'];
        const foundTables = result.rows.map(r => r.table_name);

        const missing = expectedTables.filter(t => !foundTables.includes(t));
        if (missing.length === 0) {
            console.log('SUCCESS: All expected tables found.');
        } else {
            console.warn('WARNING: Missing expected tables:', missing.join(', '));
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
