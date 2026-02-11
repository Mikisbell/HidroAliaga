const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

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
            let value = match[2].trim();
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            env[match[1].trim()] = value;
        }
    });
    return env;
}

const envPath = path.resolve(__dirname, '../.env');
const env = loadEnv(envPath);

if (!env.DATABASE_URL) {
    const envLocal = loadEnv(path.resolve(__dirname, '../.env.local'));
    Object.assign(env, envLocal);
}

const client = new Client({
    connectionString: env.DATABASE_URL.replace('?sslmode=require', ''),
    ssl: { rejectUnauthorized: false }
});

async function promote() {
    try {
        await client.connect();
        console.log('Connected. Promoting users to admin...');

        // Update ALL profiles to admin for now, as requested/implied
        const res = await client.query(`
            UPDATE profiles 
            SET role = 'admin' 
            WHERE role = 'user'
            RETURNING id, full_name, role
        `);

        if (res.rows.length > 0) {
            console.log(`Promoted ${res.rows.length} users to ADMIN:`);
            console.table(res.rows);
        } else {
            console.log('No users needed promotion (all are already admins or no users found).');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

promote();
