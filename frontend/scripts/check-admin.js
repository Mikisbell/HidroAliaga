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

async function checkAdmins() {
    try {
        await client.connect();
        console.log('Connected. Checking profiles...');

        const res = await client.query(`
            SELECT id, full_name, role, username 
            FROM profiles 
            WHERE role = 'admin'
        `);

        if (res.rows.length === 0) {
            console.log('No admins found in profiles table.');

            // Check if there are ANY profiles
            const all = await client.query('SELECT count(*) FROM profiles');
            console.log(`Total profiles: ${all.rows[0].count}`);

            if (all.rows[0].count > 0) {
                console.log('Listing some users (role=user):');
                const users = await client.query('SELECT full_name, role FROM profiles LIMIT 5');
                console.table(users.rows);
            }

        } else {
            console.log('Admins found:');
            console.table(res.rows);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

checkAdmins();
