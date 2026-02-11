const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Helper to parse .env file manually since dotenv might not be installed
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
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
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[key] = value;
        }
    });
    return env;
}

const envPath = path.resolve(__dirname, '../.env');
console.log('Loading env from:', envPath);
const env = loadEnv(envPath);

if (!env.DATABASE_URL) {
    console.error('DATABASE_URL missing. Trying .env.local');
    const envLocal = loadEnv(path.resolve(__dirname, '../.env.local'));
    Object.assign(env, envLocal);
}

const connectionString = env.DATABASE_URL;

if (!connectionString) {
    console.error('CRITICAL: DATABASE_URL not found.');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

async function verify() {
    console.log('Connecting...');
    await client.connect();

    try {
        // Check for profiles table
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'profiles'
        `);

        if (res.rows.length === 0) {
            console.error('FAIL: profiles table NOT found.');
        } else {
            console.log('PASS: profiles table found.');
        }

        // Check RLS on profiles
        const rlsRes = await client.query(`
            SELECT relrowsecurity 
            FROM pg_class 
            WHERE relname = 'profiles'
        `);

        if (rlsRes.rows.length > 0 && rlsRes.rows[0].relrowsecurity) {
            console.log('PASS: RLS enabled on profiles.');
        } else {
            console.error('FAIL: RLS NOT enabled on profiles.');
        }

        // Check columns in profiles
        const colsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles'
        `);
        const cols = colsRes.rows.map(c => c.column_name);
        if (cols.includes('role')) {
            console.log('PASS: role column found in profiles.');
        } else {
            console.error('FAIL: role column MISSING in profiles.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

verify();
